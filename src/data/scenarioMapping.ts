/**
 * PayFlow Scenario-to-Record Traceability Matrix
 * Maps every assessment scenario (S1–S9) directly to underlying source records in
 * Platform_Data.csv and Bank_Data.csv.
 */

export interface ScenarioDefinition {
  scenarioId: string;
  name: string;
  category: 'MANDATORY' | 'EXTENDED';
  expectedClassification: string;
  platformRecordIds: string[];
  bankRecordIds: string[];
  transactionIds: string[];
  platformAmount: number;
  bankAmount: number;
  expectedVariance: number;
  financialTreatment: string;
  auditExplanation: string;
}

export const SCENARIO_MAPPINGS: ScenarioDefinition[] = [
  {
    scenarioId: 'S1',
    name: 'Next-Month Settlement (Cross-Period Timing Difference)',
    category: 'MANDATORY',
    expectedClassification: 'TIMING_DIFFERENCE',
    platformRecordIds: ['plt-26-TXN026'],
    bankRecordIds: ['bnk-26-BNK-TXN026'],
    transactionIds: ['TXN026'],
    platformAmount: 2500.00,
    bankAmount: 2500.00,
    expectedVariance: 0.00,
    financialTreatment: 'In January month-end view, creates a timing accrual difference. In cumulative view, matched with cross-period timing tag.',
    auditExplanation: 'Platform transaction processed on 2026-01-31 (month-end) and settled by clearing bank on 2026-02-01 (next month).'
  },
  {
    scenarioId: 'S2',
    name: 'Aggregate Sub-Cent Rounding Variance',
    category: 'MANDATORY',
    expectedClassification: 'ROUNDING_DIFFERENCE',
    platformRecordIds: ['plt-27-TXN027', 'plt-28-TXN028', 'plt-29-TXN029'],
    bankRecordIds: ['bnk-27-BNK-R027', 'bnk-28-BNK-R028', 'bnk-29-BNK-R029'],
    transactionIds: ['TXN027', 'TXN028', 'TXN029'],
    platformAmount: 30.012, // 10.004 * 3
    bankAmount: 30.00,   // 10.00 * 3
    expectedVariance: 0.012,
    financialTreatment: 'Matched within tolerance; aggregate fractional paise variance of ₹0.012 booked to Rounding Adjustments expense.',
    auditExplanation: 'Platform records 3 decimal places (10.004 INR) while banking settlement truncates to 2 decimal places (10.00 INR).'
  },
  {
    scenarioId: 'S3',
    name: 'Duplicate Platform Capture with Single Bank Counterpart',
    category: 'MANDATORY',
    expectedClassification: 'DUPLICATE_IN_PLATFORM',
    platformRecordIds: ['plt-30-TXN030', 'plt-31-TXN030'],
    bankRecordIds: ['bnk-30-BNK-D030'],
    transactionIds: ['TXN030'],
    platformAmount: 3000.00, // 1500.00 * 2
    bankAmount: 1500.00,
    expectedVariance: 1500.00,
    financialTreatment: 'First platform row matches bank settlement. Duplicate second row is isolated and excluded from adjusted revenue.',
    auditExplanation: 'TXN030 captured twice on 2026-01-15 (webhook retry/double click). Bank correctly settled only one payment of ₹1,500.00.'
  },
  {
    scenarioId: 'S4',
    name: 'Unmatched Orphan Refund (Invalid Original Payment)',
    category: 'MANDATORY',
    expectedClassification: 'UNMATCHED_REFUND',
    platformRecordIds: ['plt-35-REF002'],
    bankRecordIds: ['bnk-34-BNK-REF002'],
    transactionIds: ['REF002'],
    platformAmount: 500.00,
    bankAmount: 500.00,
    expectedVariance: -500.00,
    financialTreatment: 'Held as unresolved exception; excluded from validated refund subtotal; flagged for merchant investigation.',
    auditExplanation: 'Platform refund REF002 references Original_Transaction_ID TXN9999, which does not exist in platform payment records.'
  },
  {
    scenarioId: 'S5',
    name: 'Unexpected Bank Entry (Direct Bank Settlement)',
    category: 'MANDATORY',
    expectedClassification: 'UNEXPECTED_BANK_ENTRY',
    platformRecordIds: [],
    bankRecordIds: ['bnk-35-BNK-EXTRA001'],
    transactionIds: ['BNKONLY001'],
    platformAmount: 0.00,
    bankAmount: 777.00,
    expectedVariance: -777.00,
    financialTreatment: 'Added to adjusted platform revenue in reconciliation bridge to balance with bank statement balance.',
    auditExplanation: 'Bank settlement of ₹777.00 on 2026-02-05 with reference BNK-EXTRA001 has no corresponding platform record.'
  },
  {
    scenarioId: 'S6',
    name: 'Normal Standard Matches',
    category: 'MANDATORY',
    expectedClassification: 'MATCHED',
    platformRecordIds: ['plt-1-TXN001', '...up to plt-25-TXN025', 'plt-32-TXN031', 'plt-33-TXN032', 'plt-34-REF001'],
    bankRecordIds: ['bnk-1-BNK-TXN001', '...up to bnk-25-BNK-TXN025', 'bnk-31-BNK-TXN031', 'bnk-32-BNK-TXN032', 'bnk-33-BNK-REF001'],
    transactionIds: ['TXN001-TXN025', 'TXN031', 'TXN032', 'REF001'],
    platformAmount: 37840.00,
    bankAmount: 37840.00,
    expectedVariance: 0.00,
    financialTreatment: '100% matched with zero variance.',
    auditExplanation: 'Valid platform captures and verified bank settlements with identical identifiers, amounts, and currencies.'
  },
  {
    scenarioId: 'S7',
    name: 'Missing Bank Settlement',
    category: 'EXTENDED',
    expectedClassification: 'MISSING_SETTLEMENT',
    platformRecordIds: [],
    bankRecordIds: [],
    transactionIds: [],
    platformAmount: 0.00,
    bankAmount: 0.00,
    expectedVariance: 0.00,
    financialTreatment: 'Accrual item requiring acquirer partner escalation.',
    auditExplanation: 'Platform payment captured without corresponding bank settlement.'
  },
  {
    scenarioId: 'S8',
    name: 'Amount Mismatch (Beyond Rounding Tolerance)',
    category: 'EXTENDED',
    expectedClassification: 'AMOUNT_MISMATCH',
    platformRecordIds: [],
    bankRecordIds: [],
    transactionIds: [],
    platformAmount: 0.00,
    bankAmount: 0.00,
    expectedVariance: 0.00,
    financialTreatment: 'Variance booked to clearing dispute account.',
    auditExplanation: 'Candidate records share transaction ID but amount difference exceeds rounding tolerance threshold.'
  },
  {
    scenarioId: 'S9',
    name: 'Attribute Mismatch (Merchant or Currency)',
    category: 'EXTENDED',
    expectedClassification: 'ATTRIBUTE_MISMATCH',
    platformRecordIds: [],
    bankRecordIds: [],
    transactionIds: [],
    platformAmount: 0.00,
    bankAmount: 0.00,
    expectedVariance: 0.00,
    financialTreatment: 'Metadata correction in transaction ledger.',
    auditExplanation: 'Transaction ID matches but merchant identifier or currency disagrees between platform and bank.'
  }
];
