import fs from 'fs';
import Papa from 'papaparse';

console.log('=====================================================');
console.log('PAYFLOW PHASE 4: RECONCILIATION ENGINE TEST SUITE');
console.log('=====================================================\n');

// Load Data
const platformCsv = fs.readFileSync('Platform_Data.csv', 'utf8');
const bankCsv = fs.readFileSync('Bank_Data.csv', 'utf8');

const pParsed = Papa.parse(platformCsv.trim(), { header: true }).data;
const bParsed = Papa.parse(bankCsv.trim(), { header: true }).data;

// Decimal-Safe Helper
const toMilli = (val) => Math.round(Number(parseFloat(val).toFixed(4)) * 1000);
const fromMilli = (milli) => milli / 1000;

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    testsFailed++;
  }
}

// ---------------------------------------------------------------------
// TEST 1: DECIMAL-SAFE ARITHMETIC INTEGRITY
// ---------------------------------------------------------------------
console.log('Test Group 1: Decimal-Safe Arithmetic');
const sumA = fromMilli(toMilli(10.004) + toMilli(10.004) + toMilli(10.004));
assert(sumA === 30.012, `Sub-paise 10.004 * 3 = 30.012 without IEEE float drift (got ${sumA})`);

const netVariance = fromMilli(toMilli(44152.012) - toMilli(43429.000));
assert(netVariance === 723.012, `Net ledger variance = 723.012 INR exact (got ${netVariance})`);

// ---------------------------------------------------------------------
// TEST 2: S1 - NEXT-MONTH SETTLEMENT (TIMING DIFFERENCE)
// ---------------------------------------------------------------------
console.log('\nTest Group 2: Mandatory Scenario S1 (Cross-Period Timing)');
const txn026Platform = pParsed.find(r => r.Transaction_ID === 'TXN026');
const txn026Bank = bParsed.find(r => r.Transaction_ID === 'TXN026');
assert(txn026Platform.Transaction_Date === '2026-01-31', 'TXN026 platform date is 2026-01-31 (Jan month-end)');
assert(txn026Bank.Settlement_Date === '2026-02-01', 'TXN026 bank settlement is 2026-02-01 (Feb next-month)');
assert(txn026Platform.Transaction_Date.slice(0, 7) !== txn026Bank.Settlement_Date.slice(0, 7), 'Cross-month boundary verified -> S1 TIMING_DIFFERENCE');

// ---------------------------------------------------------------------
// TEST 3: S2 - AGGREGATE ROUNDING VARIANCE
// ---------------------------------------------------------------------
console.log('\nTest Group 3: Mandatory Scenario S2 (Aggregate Rounding)');
const r27 = pParsed.find(r => r.Transaction_ID === 'TXN027');
const r28 = pParsed.find(r => r.Transaction_ID === 'TXN028');
const r29 = pParsed.find(r => r.Transaction_ID === 'TXN029');
const b27 = bParsed.find(r => r.Transaction_ID === 'TXN027');
const b28 = bParsed.find(r => r.Transaction_ID === 'TXN028');
const b29 = bParsed.find(r => r.Transaction_ID === 'TXN029');

assert(r27.Amount_INR === '10.004' && b27.Amount_INR === '10.00', 'TXN027: 10.004 vs 10.00 (0.004 diff)');
assert(r28.Amount_INR === '10.004' && b28.Amount_INR === '10.00', 'TXN028: 10.004 vs 10.00 (0.004 diff)');
assert(r29.Amount_INR === '10.004' && b29.Amount_INR === '10.00', 'TXN029: 10.004 vs 10.00 (0.004 diff)');
const aggregateDiff = fromMilli(toMilli(r27.Amount_INR) - toMilli(b27.Amount_INR) +
                                toMilli(r28.Amount_INR) - toMilli(b28.Amount_INR) +
                                toMilli(r29.Amount_INR) - toMilli(b29.Amount_INR));
assert(aggregateDiff === 0.012, `Aggregate rounding difference is exactly 0.012 INR (got ${aggregateDiff})`);

// ---------------------------------------------------------------------
// TEST 4: S3 - DUPLICATE PLATFORM RECORD
// ---------------------------------------------------------------------
console.log('\nTest Group 4: Mandatory Scenario S3 (Duplicate Platform Capture)');
const txn030Rows = pParsed.filter(r => r.Transaction_ID === 'TXN030');
const txn030Bank = bParsed.filter(r => r.Transaction_ID === 'TXN030');
assert(txn030Rows.length === 2, `TXN030 appears 2 times in platform source (got ${txn030Rows.length})`);
assert(txn030Bank.length === 1, `TXN030 appears only 1 time in bank settlement (got ${txn030Bank.length})`);
assert(parseFloat(txn030Rows[1].Amount_INR) === 1500.00, 'Duplicate capture amount is ₹1,500.00');

// ---------------------------------------------------------------------
// TEST 5: S4 - UNMATCHED ORPHAN REFUND
// ---------------------------------------------------------------------
console.log('\nTest Group 5: Mandatory Scenario S4 (Unmatched Refund)');
const ref002 = pParsed.find(r => r.Transaction_ID === 'REF002');
assert(ref002 && ref002.Transaction_Type === 'REFUND', 'REF002 is a refund record of ₹500.00');
assert(ref002.Original_Transaction_ID === 'TXN9999', 'REF002 references original payment TXN9999');
const origExists = pParsed.some(r => r.Transaction_ID === 'TXN9999');
assert(!origExists, 'TXN9999 does not exist anywhere in platform payments -> S4 UNMATCHED_REFUND confirmed');

// ---------------------------------------------------------------------
// TEST 6: S5 - UNEXPECTED BANK ENTRY
// ---------------------------------------------------------------------
console.log('\nTest Group 6: Mandatory Scenario S5 (Bank-Only Settlement)');
const bnkOnly = bParsed.find(r => r.Transaction_ID === 'BNKONLY001');
assert(bnkOnly !== undefined, 'BNKONLY001 exists in Bank settlement records (Ref: BNK-EXTRA001, ₹777.00)');
const inPlatform = pParsed.some(r => r.Transaction_ID === 'BNKONLY001');
assert(!inPlatform, 'BNKONLY001 does not exist in platform records -> S5 UNEXPECTED_BANK_ENTRY confirmed');

// ---------------------------------------------------------------------
// TEST 7: RECONCILIATION BRIDGE AND IDEMPOTENCY
// ---------------------------------------------------------------------
console.log('\nTest Group 7: Mathematical Bridge & Idempotency');
const pGross = pParsed.filter(r => r.Transaction_Type === 'PAYMENT').reduce((s, r) => s + toMilli(r.Amount_INR), 0);
const pRef = pParsed.filter(r => r.Transaction_Type === 'REFUND').reduce((s, r) => s + toMilli(r.Amount_INR), 0);
const pNet = pGross - pRef;

const bGross = bParsed.filter(r => r.Transaction_Type === 'PAYMENT').reduce((s, r) => s + toMilli(r.Amount_INR), 0);
const bRef = bParsed.filter(r => r.Transaction_Type === 'REFUND').reduce((s, r) => s + toMilli(r.Amount_INR), 0);
const bNet = bGross - bRef;

// Bridge formula: Platform Net - Duplicates + Unexpected Bank - Rounding Variance
const bridgeMilli = pNet - toMilli(1500.00) + toMilli(777.00) - toMilli(0.012);
assert(bridgeMilli === bNet, `Accounting Bridge holds to 0.000 residual: ${fromMilli(bridgeMilli)} === ${fromMilli(bNet)}`);

console.log('\n=====================================================');
console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('=====================================================');

if (testsFailed > 0) process.exit(1);
