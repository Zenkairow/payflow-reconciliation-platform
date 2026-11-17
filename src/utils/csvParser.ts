import Papa from 'papaparse';
import { PlatformTransaction, BankTransaction } from '../types';

export interface ParseResult<T> {
  data: T[];
  errors: string[];
}

export function parsePlatformCsv(csvString: string): ParseResult<PlatformTransaction> {
  const result = Papa.parse<Record<string, string>>(csvString.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];
  const rows: PlatformTransaction[] = [];
  const seenTxnIds = new Set<string>();

  result.data.forEach((row, index) => {
    const txnId = (row.Transaction_ID || row.transaction_id || row['Transaction ID'] || '').trim();
    if (!txnId) {
      errors.push(`Row ${index + 1}: Missing Transaction_ID`);
      return;
    }

    const date = (row.Transaction_Date || row.transaction_date || row['Transaction Date'] || '').trim();
    const type = (row.Transaction_Type || row.transaction_type || row['Transaction Type'] || 'PAYMENT').toUpperCase().trim() as any;
    const origTxnId = (row.Original_Transaction_ID || row.original_transaction_id || row['Original Transaction ID'] || '').trim();
    const merchantId = (row.Merchant_ID || row.merchant_id || row['Merchant ID'] || '').trim();
    const rawAmt = (row.Amount_INR || row.amount_inr || row.Amount || row.amount || '0').trim();
    const amount = parseFloat(rawAmt);
    const currency = (row.Currency || row.currency || 'INR').trim();
    const status = (row.Status || row.status || 'SUCCESS').toUpperCase().trim() as any;

    if (isNaN(amount)) {
      errors.push(`Row ${index + 1} (${txnId}): Invalid amount "${rawAmt}"`);
      return;
    }

    const isDuplicate = seenTxnIds.has(txnId);
    seenTxnIds.add(txnId);

    rows.push({
      id: `plt-${index + 1}-${txnId}`,
      source_record_id: `PLT-ROW-${String(index + 1).padStart(3, '0')}`,
      Transaction_ID: txnId,
      Transaction_Date: date,
      Transaction_Type: type === 'REFUND' ? 'REFUND' : 'PAYMENT',
      Original_Transaction_ID: origTxnId || undefined,
      Merchant_ID: merchantId,
      Amount_INR: amount,
      Currency: currency,
      Status: status,
      rawAmount: rawAmt,
      isDuplicate,
    });
  });

  // Mark all instances of duplicates
  const txnCounts: Record<string, number> = {};
  rows.forEach(r => {
    txnCounts[r.Transaction_ID] = (txnCounts[r.Transaction_ID] || 0) + 1;
  });
  rows.forEach(r => {
    if (txnCounts[r.Transaction_ID] > 1) {
      r.isDuplicate = true;
    }
  });

  return { data: rows, errors };
}

export function parseBankCsv(csvString: string): ParseResult<BankTransaction> {
  const result = Papa.parse<Record<string, string>>(csvString.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];
  const rows: BankTransaction[] = [];
  const seenRefs = new Set<string>();

  result.data.forEach((row, index) => {
    const bankRef = (row.Bank_Reference_ID || row.bank_reference_id || row['Bank Reference ID'] || '').trim();
    const txnId = (row.Transaction_ID || row.transaction_id || row['Transaction ID'] || '').trim();
    const date = (row.Settlement_Date || row.settlement_date || row['Settlement Date'] || '').trim();
    const type = (row.Transaction_Type || row.transaction_type || row['Transaction Type'] || 'PAYMENT').toUpperCase().trim() as any;
    const merchantId = (row.Merchant_ID || row.merchant_id || row['Merchant ID'] || '').trim();
    const rawAmt = (row.Amount_INR || row.amount_inr || row.Amount || row.amount || '0').trim();
    const amount = parseFloat(rawAmt);
    const currency = (row.Currency || row.currency || 'INR').trim();
    const status = (row.Bank_Status || row.bank_status || row.Status || row.status || 'SETTLED').toUpperCase().trim() as any;

    if (!bankRef && !txnId) {
      errors.push(`Row ${index + 1}: Missing Bank_Reference_ID and Transaction_ID`);
      return;
    }

    if (isNaN(amount)) {
      errors.push(`Row ${index + 1} (${bankRef}): Invalid amount "${rawAmt}"`);
      return;
    }

    const isDuplicate = seenRefs.has(bankRef);
    if (bankRef) seenRefs.add(bankRef);

    rows.push({
      id: `bnk-${index + 1}-${bankRef || txnId}`,
      bank_record_id: `BNK-ROW-${String(index + 1).padStart(3, '0')}`,
      Bank_Reference_ID: bankRef || `BNK-AUTO-${index + 1}`,
      Transaction_ID: txnId || undefined,
      Settlement_Date: date,
      Transaction_Type: type === 'REFUND' ? 'REFUND' : 'PAYMENT',
      Merchant_ID: merchantId || undefined,
      Amount_INR: amount,
      Currency: currency,
      Bank_Status: status,
      rawAmount: rawAmt,
      isDuplicate,
    });
  });

  // Mark duplicates if duplicate txn IDs or bank references exist
  const refCounts: Record<string, number> = {};
  rows.forEach(r => {
    if (r.Bank_Reference_ID) {
      refCounts[r.Bank_Reference_ID] = (refCounts[r.Bank_Reference_ID] || 0) + 1;
    }
  });
  rows.forEach(r => {
    if (r.Bank_Reference_ID && refCounts[r.Bank_Reference_ID] > 1) {
      r.isDuplicate = true;
    }
  });

  return { data: rows, errors };
}

export function downloadCsv(filename: string, rows: any[]) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
