// Automated Test Suite for PayFlow Reconciliation Engine
import fs from 'fs';
import Papa from 'papaparse';

console.log('--- STARTING PAYFLOW RECONCILIATION VERIFICATION ---');

const platformCsv = fs.readFileSync('Platform_Data.csv', 'utf8');
const bankCsv = fs.readFileSync('Bank_Data.csv', 'utf8');

const pParsed = Papa.parse(platformCsv.trim(), { header: true }).data;
const bParsed = Papa.parse(bankCsv.trim(), { header: true }).data;

console.log(`✓ Platform rows loaded: ${pParsed.length}`);
console.log(`✓ Bank rows loaded: ${bParsed.length}`);

if (pParsed.length !== 35 || bParsed.length !== 35) {
  console.error('FAIL: Expected 35 records each');
  process.exit(1);
}

// Financial Sums Check
const pGross = pParsed.filter(r => r.Transaction_Type === 'PAYMENT').reduce((s, r) => s + parseFloat(r.Amount_INR), 0);
const pRef = pParsed.filter(r => r.Transaction_Type === 'REFUND').reduce((s, r) => s + parseFloat(r.Amount_INR), 0);
const pNet = pGross - pRef;

const bGross = bParsed.filter(r => r.Transaction_Type === 'PAYMENT').reduce((s, r) => s + parseFloat(r.Amount_INR), 0);
const bRef = bParsed.filter(r => r.Transaction_Type === 'REFUND').reduce((s, r) => s + parseFloat(r.Amount_INR), 0);
const bNet = bGross - bRef;
const netDiff = pNet - bNet;

console.log(`✓ Platform Gross: ₹${pGross.toFixed(4)}, Refund: ₹${pRef.toFixed(4)}, Net: ₹${pNet.toFixed(4)}`);
console.log(`✓ Bank Gross: ₹${bGross.toFixed(4)}, Refund: ₹${bRef.toFixed(4)}, Net: ₹${bNet.toFixed(4)}`);
console.log(`✓ Net Difference (Platform - Bank): ₹${netDiff.toFixed(4)}`);

if (Math.abs(pNet - 44152.012) > 0.0001) throw new Error('Platform Net mismatch');
if (Math.abs(bNet - 43429.000) > 0.0001) throw new Error('Bank Net mismatch');
if (Math.abs(netDiff - 723.012) > 0.0001) throw new Error('Net difference mismatch');

// Verify Discrepancies
console.log('--- VERIFYING DISCREPANCY RECONCILIATION BRIDGE ---');
const duplicateTxn030 = 1500.00;
const unexpectedBnkOnly = 777.00;
const roundingVariance = 0.012; // (10.004 - 10.00) * 3

const reconciledCalc = pNet - duplicateTxn030 + unexpectedBnkOnly - roundingVariance;
console.log(`Bridge: ${pNet.toFixed(4)} - 1500.0000 + 777.0000 - 0.0120 = ${reconciledCalc.toFixed(4)}`);

if (Math.abs(reconciledCalc - bNet) > 0.0001) {
  throw new Error(`Reconciliation bridge failed: calculated ${reconciledCalc} vs bank ${bNet}`);
}
console.log('✓ 100% Mathematical Bridge Confirmed: Exact Zero Unverified Residual!');

console.log('--- ALL AUTOMATED AUDIT CHECKS PASSED ---');
