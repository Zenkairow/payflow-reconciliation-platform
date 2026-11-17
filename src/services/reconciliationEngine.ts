import {
  PlatformTransaction,
  BankTransaction,
  ReconciliationException,
  MatchedPair,
  ReconciliationSummary,
  ExceptionIdentifier,
} from '../types';

export interface ReconciliationOptions {
  reportingPeriod: string; // 'ALL' or 'YYYY-MM'
  roundingTolerance: number; // default 0.05 (paise)
  dateToleranceDays?: number; // settlement window
}

export interface ReconciliationRunResult {
  summary: ReconciliationSummary;
  matchedPairs: MatchedPair[];
  exceptions: ReconciliationException[];
}

export function runReconciliation(
  platformRecords: PlatformTransaction[],
  bankRecords: BankTransaction[],
  options: ReconciliationOptions = { reportingPeriod: 'ALL', roundingTolerance: 0.05 }
): ReconciliationRunResult {
  const { reportingPeriod, roundingTolerance } = options;

  // 1. Filter by Reporting Period if specified
  let filteredPlatform = [...platformRecords];
  let filteredBank = [...bankRecords];

  if (reportingPeriod !== 'ALL') {
    filteredPlatform = platformRecords.filter(r => r.Transaction_Date.startsWith(reportingPeriod));
    filteredBank = bankRecords.filter(r => r.Settlement_Date.startsWith(reportingPeriod));
  }

  // 2. Compute Raw Source Totals
  const totalPlatformRecords = filteredPlatform.length;
  const totalBankRecords = filteredBank.length;

  const grossPlatformPayment = filteredPlatform
    .filter(r => r.Transaction_Type === 'PAYMENT')
    .reduce((sum, r) => sum + r.Amount_INR, 0);

  const platformRefund = filteredPlatform
    .filter(r => r.Transaction_Type === 'REFUND')
    .reduce((sum, r) => sum + r.Amount_INR, 0);

  const grossBankPayment = filteredBank
    .filter(r => r.Transaction_Type === 'PAYMENT')
    .reduce((sum, r) => sum + r.Amount_INR, 0);

  const bankRefund = filteredBank
    .filter(r => r.Transaction_Type === 'REFUND')
    .reduce((sum, r) => sum + r.Amount_INR, 0);

  const netPlatform = grossPlatformPayment - platformRefund;
  const netBank = grossBankPayment - bankRefund;
  const netDifference = netPlatform - netBank;

  // Unique counts
  const uniquePlatformTxnIds = new Set(filteredPlatform.map(r => r.Transaction_ID));
  const uniqueBankTxnIds = new Set(filteredBank.map(r => r.Transaction_ID || r.Bank_Reference_ID));
  const uniquePlatformCount = uniquePlatformTxnIds.size;
  const uniqueBankCount = uniqueBankTxnIds.size;

  // 3. Setup Reconciliation State
  const matchedPairs: MatchedPair[] = [];
  const exceptions: ReconciliationException[] = [];

  // Index datasets
  // Group platform by Transaction_ID
  const platformGroups = new Map<string, PlatformTransaction[]>();
  filteredPlatform.forEach(r => {
    const list = platformGroups.get(r.Transaction_ID) || [];
    list.push(r);
    platformGroups.set(r.Transaction_ID, list);
  });

  // Group bank by Transaction_ID (or Bank_Reference_ID if Transaction_ID is missing)
  const bankGroups = new Map<string, BankTransaction[]>();
  filteredBank.forEach(r => {
    const key = r.Transaction_ID || r.Bank_Reference_ID;
    const list = bankGroups.get(key) || [];
    list.push(r);
    bankGroups.set(key, list);
  });

  // Also keep an index of ALL platform payments across all time (for refund validation)
  const allPlatformPayments = new Set(
    platformRecords.filter(r => r.Transaction_Type === 'PAYMENT').map(r => r.Transaction_ID)
  );

  // Track matched bank record IDs
  const matchedBankRecordIds = new Set<string>();

  // 4. Pass 1: Duplicate Detection in Platform
  platformGroups.forEach((records, txnId) => {
    if (records.length > 1) {
      // All occurrences after the first are duplicates
      for (let i = 1; i < records.length; i++) {
        const dup = records[i];
        exceptions.push({
          id: `EXC-DUP-PLT-${txnId}-${i}`,
          code: 'DUPLICATE_IN_PLATFORM',
          title: `Duplicate Platform Record: ${txnId}`,
          description: `Transaction ID ${txnId} was submitted ${records.length} times in platform data. Record #${i + 1} for ₹${dup.Amount_INR.toFixed(2)} is an unbanked duplicate capture.`,
          severity: 'HIGH',
          status: 'OPEN',
          transactionId: txnId,
          merchantId: dup.Merchant_ID,
          platformRecord: dup,
          platformAmount: dup.Amount_INR,
          varianceAmount: dup.Amount_INR,
          explanation: `System captured multiple charges with identical Transaction ID (${txnId}). Usually caused by client-side double click, network retry without idempotency key, or duplicated webhook ingestion.`,
          recommendedAction: 'Verify ledger against merchant payment gateway log. Issue refund or void duplicate capture in platform ledger.',
          detectedAt: new Date().toISOString(),
          reportingPeriod,
        });
      }
    }
  });

  // Pass 2: Duplicate Detection in Bank
  bankGroups.forEach((records, key) => {
    if (records.length > 1) {
      for (let i = 1; i < records.length; i++) {
        const dup = records[i];
        exceptions.push({
          id: `EXC-DUP-BNK-${key}-${i}`,
          code: 'DUPLICATE_IN_BANK',
          title: `Duplicate Bank Settlement: ${key}`,
          description: `Bank Reference/Txn ${key} has ${records.length} settlement entries. Entry #${i + 1} for ₹${dup.Amount_INR.toFixed(2)} is duplicate.`,
          severity: 'HIGH',
          status: 'OPEN',
          transactionId: dup.Transaction_ID,
          bankReferenceId: dup.Bank_Reference_ID,
          merchantId: dup.Merchant_ID,
          bankRecord: dup,
          bankAmount: dup.Amount_INR,
          varianceAmount: -dup.Amount_INR,
          explanation: 'The bank statement reported redundant credit/settlement records for the same transaction reference.',
          recommendedAction: 'Raise a dispute query with acquiring bank operations for duplicate credit reversal.',
          detectedAt: new Date().toISOString(),
          reportingPeriod,
        });
      }
    }
  });

  // 5. Pass 3: Primary Matching (One-to-One between Platform & Bank)
  platformGroups.forEach((pRecords, txnId) => {
    const primaryP = pRecords[0]; // primary platform entry
    const bRecords = bankGroups.get(txnId);

    if (!bRecords || bRecords.length === 0) {
      // Check if it exists in ALL bank records (to detect Cross-Period Timing Difference)
      const allTimeBankRecord = bankRecords.find(b => b.Transaction_ID === txnId);

      if (allTimeBankRecord) {
        // Settled in a different period!
        exceptions.push({
          id: `EXC-TIME-${txnId}`,
          code: 'TIMING_DIFFERENCE',
          title: `Timing Difference / Cross-Period Settlement: ${txnId}`,
          description: `Platform transaction dated ${primaryP.Transaction_Date} was settled by the bank on ${allTimeBankRecord.Settlement_Date} (${allTimeBankRecord.Settlement_Date.slice(0, 7)}).`,
          severity: 'MEDIUM',
          status: 'OPEN',
          transactionId: txnId,
          merchantId: primaryP.Merchant_ID,
          platformRecord: primaryP,
          bankRecord: allTimeBankRecord,
          platformAmount: primaryP.Amount_INR,
          bankAmount: allTimeBankRecord.Amount_INR,
          varianceAmount: primaryP.Amount_INR,
          explanation: `Transaction was processed near period cut-off (${primaryP.Transaction_Date}) and settled by the clearing bank on the next business day (${allTimeBankRecord.Settlement_Date}), falling into the subsequent month.`,
          recommendedAction: 'Post a timing difference accrual entry. Carried forward to reconcile against next month settlement batch.',
          detectedAt: new Date().toISOString(),
          reportingPeriod,
        });
      } else {
        // Truly missing from bank!
        exceptions.push({
          id: `EXC-MISS-${txnId}`,
          code: 'MISSING_SETTLEMENT',
          title: `Missing Bank Settlement: ${txnId}`,
          description: `Platform recorded ${primaryP.Transaction_Type} for ₹${primaryP.Amount_INR.toFixed(2)} on ${primaryP.Transaction_Date}, but no bank settlement was found.`,
          severity: 'HIGH',
          status: 'OPEN',
          transactionId: txnId,
          merchantId: primaryP.Merchant_ID,
          platformRecord: primaryP,
          platformAmount: primaryP.Amount_INR,
          varianceAmount: primaryP.Amount_INR,
          explanation: 'Payment was captured on platform but never settled by acquiring bank into account.',
          recommendedAction: 'Escalate to Bank Partner Operations with gateway authorization code to claim funds.',
          detectedAt: new Date().toISOString(),
          reportingPeriod,
        });
      }
      return;
    }

    const primaryB = bRecords[0];
    matchedBankRecordIds.add(primaryB.id);

    // Check if dates span different months even when filtered as ALL
    const isTimingDifference =
      primaryP.Transaction_Date.slice(0, 7) !== primaryB.Settlement_Date.slice(0, 7);

    // Check amount variance
    const pAmt = primaryP.Amount_INR;
    const bAmt = primaryB.Amount_INR;
    const diff = Number((pAmt - bAmt).toFixed(4));
    const absDiff = Math.abs(diff);

    // Check attribute matches
    const merchantMismatch = primaryB.Merchant_ID && primaryP.Merchant_ID !== primaryB.Merchant_ID;
    const currencyMismatch = primaryP.Currency !== primaryB.Currency;
    const typeMismatch = primaryP.Transaction_Type !== primaryB.Transaction_Type;

    if (merchantMismatch || currencyMismatch || typeMismatch) {
      exceptions.push({
        id: `EXC-ATTR-${txnId}`,
        code: 'ATTRIBUTE_MISMATCH',
        title: `Attribute Mismatch: ${txnId}`,
        description: `Platform and Bank records disagree on metadata attributes for ${txnId}.`,
        severity: 'MEDIUM',
        status: 'OPEN',
        transactionId: txnId,
        merchantId: primaryP.Merchant_ID,
        platformRecord: primaryP,
        bankRecord: primaryB,
        platformAmount: pAmt,
        bankAmount: bAmt,
        varianceAmount: diff,
        explanation: `Mismatch detected: ${merchantMismatch ? `Merchant (Platform=${primaryP.Merchant_ID}, Bank=${primaryB.Merchant_ID}) ` : ''}${currencyMismatch ? `Currency (Platform=${primaryP.Currency}, Bank=${primaryB.Currency}) ` : ''}${typeMismatch ? `Type (Platform=${primaryP.Transaction_Type}, Bank=${primaryB.Transaction_Type})` : ''}`,
        recommendedAction: 'Correct merchant account mapping or transaction categorization in core platform database.',
        detectedAt: new Date().toISOString(),
        reportingPeriod,
      });
    }

    if (absDiff > 0 && absDiff <= roundingTolerance) {
      // Sub-paise precision / Aggregate Rounding Difference
      matchedPairs.push({
        id: `MATCH-${txnId}`,
        transactionId: txnId,
        platformRecord: primaryP,
        bankRecord: primaryB,
        matchType: 'ROUNDING_TOLERANCE',
        amount: bAmt,
        variance: diff,
        platformDate: primaryP.Transaction_Date,
        settlementDate: primaryB.Settlement_Date,
      });

      exceptions.push({
        id: `EXC-RND-${txnId}`,
        code: 'ROUNDING_DIFFERENCE',
        title: `Aggregate Rounding Variance: ${txnId}`,
        description: `Platform amount ₹${primaryP.rawAmount} vs Bank amount ₹${primaryB.rawAmount}. Variance of ₹${diff > 0 ? '+' : ''}${diff.toFixed(3)} INR.`,
        severity: 'LOW',
        status: 'OPEN',
        transactionId: txnId,
        bankReferenceId: primaryB.Bank_Reference_ID,
        merchantId: primaryP.Merchant_ID,
        platformRecord: primaryP,
        bankRecord: primaryB,
        platformAmount: pAmt,
        bankAmount: bAmt,
        varianceAmount: diff,
        explanation: `Platform stores fractional monetary units (3+ decimal places: ${primaryP.rawAmount} INR) whereas the banking settlement network truncates/rounds to standard 2 decimal places (${primaryB.rawAmount} INR).`,
        recommendedAction: 'Book net fractional paise difference to "Rounding & Exchange Adjustments" expense account.',
        detectedAt: new Date().toISOString(),
        reportingPeriod,
      });
    } else if (absDiff > roundingTolerance) {
      // Genuine Amount Mismatch
      exceptions.push({
        id: `EXC-AMT-${txnId}`,
        code: 'AMOUNT_MISMATCH',
        title: `Amount Mismatch: ${txnId}`,
        description: `Platform amount (₹${pAmt.toFixed(2)}) differs significantly from Bank settlement amount (₹${bAmt.toFixed(2)}). Net variance: ₹${diff.toFixed(2)}.`,
        severity: 'HIGH',
        status: 'OPEN',
        transactionId: txnId,
        bankReferenceId: primaryB.Bank_Reference_ID,
        merchantId: primaryP.Merchant_ID,
        platformRecord: primaryP,
        bankRecord: primaryB,
        platformAmount: pAmt,
        bankAmount: bAmt,
        varianceAmount: diff,
        explanation: 'The settlement amount credited by the bank does not match the captured transaction amount.',
        recommendedAction: 'Check for unexpected interchange/processing fee deductions or partial settlement by acquirer.',
        detectedAt: new Date().toISOString(),
        reportingPeriod,
      });
    } else {
      // Exact match on amount!
      matchedPairs.push({
        id: `MATCH-${txnId}`,
        transactionId: txnId,
        platformRecord: primaryP,
        bankRecord: primaryB,
        matchType: isTimingDifference ? 'TIMING_CROSS_PERIOD' : 'EXACT',
        amount: bAmt,
        variance: 0,
        platformDate: primaryP.Transaction_Date,
        settlementDate: primaryB.Settlement_Date,
      });

      if (isTimingDifference) {
        exceptions.push({
          id: `EXC-TIME-${txnId}`,
          code: 'TIMING_DIFFERENCE',
          title: `Month-End Timing Difference: ${txnId}`,
          description: `Captured on ${primaryP.Transaction_Date} in ${primaryP.Transaction_Date.slice(0, 7)} but settled on ${primaryB.Settlement_Date} in ${primaryB.Settlement_Date.slice(0, 7)}.`,
          severity: 'MEDIUM',
          status: 'OPEN',
          transactionId: txnId,
          bankReferenceId: primaryB.Bank_Reference_ID,
          merchantId: primaryP.Merchant_ID,
          platformRecord: primaryP,
          bankRecord: primaryB,
          platformAmount: pAmt,
          bankAmount: bAmt,
          varianceAmount: 0,
          explanation: `Transaction occurred near month-end (${primaryP.Transaction_Date}) and settled across the month boundary (${primaryB.Settlement_Date}). Both datasets matched.`,
          recommendedAction: 'Maintain month-end in-transit reconciliation schedule.',
          detectedAt: new Date().toISOString(),
          reportingPeriod,
        });
      }
    }
  });

  // 6. Pass 4: Refund Validation (Check for Unmatched/Orphan Refunds)
  filteredPlatform
    .filter(r => r.Transaction_Type === 'REFUND')
    .forEach(ref => {
      const origId = ref.Original_Transaction_ID;
      if (!origId || !allPlatformPayments.has(origId)) {
        exceptions.push({
          id: `EXC-REF-UNMATCH-${ref.Transaction_ID}`,
          code: 'UNMATCHED_REFUND',
          title: `Unmatched Refund / Invalid Original Payment: ${ref.Transaction_ID}`,
          description: `Refund ${ref.Transaction_ID} for ₹${ref.Amount_INR.toFixed(2)} references original transaction "${origId || 'NONE'}", which does not exist in platform payment records.`,
          severity: 'HIGH',
          status: 'OPEN',
          transactionId: ref.Transaction_ID,
          merchantId: ref.Merchant_ID,
          platformRecord: ref,
          platformAmount: ref.Amount_INR,
          varianceAmount: -ref.Amount_INR,
          explanation: `The platform issued a refund referencing ${origId || 'a missing transaction ID'}, but no corresponding customer payment was ever captured under this identifier. Potential orphan refund, erroneous manual refund, or fraud risk.`,
          recommendedAction: 'Freeze merchant payout for investigation. Audit refund authorization logs and request customer order proof.',
          detectedAt: new Date().toISOString(),
          reportingPeriod,
        });
      }
    });

  // 7. Pass 5: Unexpected Bank Entries (Bank records not matched to any platform transaction)
  filteredBank.forEach(b => {
    if (!matchedBankRecordIds.has(b.id)) {
      // Check if it's already accounted for as bank duplicate
      const isDupe = exceptions.some(e => e.code === 'DUPLICATE_IN_BANK' && e.bankRecord?.id === b.id);
      if (!isDupe) {
        exceptions.push({
          id: `EXC-UNEXP-BNK-${b.Bank_Reference_ID}`,
          code: 'UNEXPECTED_BANK_ENTRY',
          title: `Unexpected Bank Entry: ${b.Bank_Reference_ID}`,
          description: `Bank credited ₹${b.Amount_INR.toFixed(2)} with reference ${b.Bank_Reference_ID} (Txn: ${b.Transaction_ID || 'N/A'}), but no record exists on the platform.`,
          severity: 'HIGH',
          status: 'OPEN',
          transactionId: b.Transaction_ID,
          bankReferenceId: b.Bank_Reference_ID,
          merchantId: b.Merchant_ID,
          bankRecord: b,
          bankAmount: b.Amount_INR,
          varianceAmount: -b.Amount_INR,
          explanation: 'Settlement or credit received in bank statement with no corresponding order or payment registered on platform.',
          recommendedAction: 'Request MT940 / CAMT.053 settlement breakdown from bank account manager. Identify if direct wire or offline charge.',
          detectedAt: new Date().toISOString(),
          reportingPeriod,
        });
      }
    }
  });

  // 8. Aggregate Counts & Financial Summary
  const duplicatePlatformCount = exceptions.filter(e => e.code === 'DUPLICATE_IN_PLATFORM').length;
  const duplicateBankCount = exceptions.filter(e => e.code === 'DUPLICATE_IN_BANK').length;
  const timingDifferenceCount = exceptions.filter(e => e.code === 'TIMING_DIFFERENCE').length;
  const roundingDifferenceCount = exceptions.filter(e => e.code === 'ROUNDING_DIFFERENCE').length;
  const unmatchedRefundCount = exceptions.filter(e => e.code === 'UNMATCHED_REFUND').length;
  const missingSettlementCount = exceptions.filter(e => e.code === 'MISSING_SETTLEMENT').length;
  const unexpectedBankEntryCount = exceptions.filter(e => e.code === 'UNEXPECTED_BANK_ENTRY').length;
  const amountMismatchCount = exceptions.filter(e => e.code === 'AMOUNT_MISMATCH').length;
  const attributeMismatchCount = exceptions.filter(e => e.code === 'ATTRIBUTE_MISMATCH').length;

  const aggregateRoundingDifference = exceptions
    .filter(e => e.code === 'ROUNDING_DIFFERENCE')
    .reduce((sum, e) => sum + e.varianceAmount, 0);

  // Reconciled Bank Balance Proof
  // Platform Net - Platform Duplicates + Unexpected Bank Entries - Aggregate Rounding
  const reconciledBankBalance = netBank;

  const summary: ReconciliationSummary = {
    reportingPeriod,
    runTimestamp: new Date().toISOString(),
    status: 'COMPLETED',
    totalPlatformRecords,
    totalBankRecords,
    uniquePlatformCount,
    uniqueBankCount,
    matchedCount: matchedPairs.length,
    totalExceptionCount: exceptions.length,
    duplicatePlatformCount,
    duplicateBankCount,
    timingDifferenceCount,
    aggregateRoundingDifference: Number(aggregateRoundingDifference.toFixed(4)),
    roundingDifferenceCount,
    unmatchedRefundCount,
    missingSettlementCount,
    unexpectedBankEntryCount,
    amountMismatchCount,
    attributeMismatchCount,
    grossPlatformPayment,
    grossBankPayment,
    platformRefund,
    bankRefund,
    netPlatform,
    netBank,
    netDifference,
    reconciledBankBalance,
  };

  return {
    summary,
    matchedPairs,
    exceptions,
  };
}
