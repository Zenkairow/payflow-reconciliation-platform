// Core Types for PayFlow Payment Reconciliation Platform

export type TransactionType = 'PAYMENT' | 'REFUND';
export type PlatformStatus = 'SUCCESS' | 'FAILED' | 'PENDING';
export type BankStatus = 'SETTLED' | 'PENDING' | 'REVERSED' | 'FAILED';

export interface PlatformTransaction {
  id: string; // Internal row ID
  source_record_id: string; // Unique identifier for physical source row (Blueprint 4.2)
  Transaction_ID: string;
  Transaction_Date: string; // YYYY-MM-DD
  Transaction_Type: TransactionType;
  Original_Transaction_ID?: string;
  Merchant_ID: string;
  Amount_INR: number;
  Currency: string;
  Status: PlatformStatus;
  rawAmount: string;
  isDuplicate?: boolean;
}

export interface BankTransaction {
  id: string; // Internal row ID
  bank_record_id: string; // Unique identifier for bank source row (Blueprint 4.3)
  Bank_Reference_ID: string;
  Transaction_ID?: string;
  Settlement_Date: string; // YYYY-MM-DD
  Transaction_Type: TransactionType;
  Merchant_ID?: string;
  Amount_INR: number;
  Currency: string;
  Bank_Status: BankStatus;
  rawAmount: string;
  isDuplicate?: boolean;
}

export type ExceptionIdentifier =
  | 'TIMING_DIFFERENCE'
  | 'ROUNDING_DIFFERENCE'
  | 'DUPLICATE_IN_PLATFORM'
  | 'DUPLICATE_IN_BANK'
  | 'UNMATCHED_REFUND'
  | 'UNEXPECTED_BANK_ENTRY'
  | 'MISSING_SETTLEMENT'
  | 'AMOUNT_MISMATCH'
  | 'ATTRIBUTE_MISMATCH';

export type ExceptionSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type ExceptionStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ADJUSTED';

export interface ReconciliationException {
  id: string;
  code: ExceptionIdentifier;
  title: string;
  description: string;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  transactionId?: string;
  bankReferenceId?: string;
  merchantId?: string;
  platformRecord?: PlatformTransaction;
  bankRecord?: BankTransaction;
  platformAmount?: number;
  bankAmount?: number;
  varianceAmount: number;
  explanation: string;
  recommendedAction: string;
  detectedAt: string;
  reportingPeriod: string;
}

export interface MatchedPair {
  id: string;
  transactionId: string;
  platformRecord: PlatformTransaction;
  bankRecord: BankTransaction;
  matchType: 'EXACT' | 'ROUNDING_TOLERANCE' | 'TIMING_CROSS_PERIOD';
  amount: number;
  variance: number;
  platformDate: string;
  settlementDate: string;
}

export interface ReconciliationSummary {
  reportingPeriod: string;
  runTimestamp: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  
  // Record counts
  totalPlatformRecords: number;
  totalBankRecords: number;
  uniquePlatformCount: number;
  uniqueBankCount: number;
  matchedCount: number;
  totalExceptionCount: number;

  // Specific Exception counts
  duplicatePlatformCount: number;
  duplicateBankCount: number;
  timingDifferenceCount: number;
  aggregateRoundingDifference: number; // In INR
  roundingDifferenceCount: number;
  unmatchedRefundCount: number;
  missingSettlementCount: number;
  unexpectedBankEntryCount: number;
  amountMismatchCount: number;
  attributeMismatchCount: number;

  // Financial amounts
  grossPlatformPayment: number;
  grossBankPayment: number;
  platformRefund: number;
  bankRefund: number;
  netPlatform: number;
  netBank: number;
  netDifference: number; // netPlatform - netBank

  // Reconciled balance proof
  reconciledBankBalance: number;
}

export type ActiveSection =
  | 'dashboard'
  | 'transactions'
  | 'reconciliation'
  | 'exceptions'
  | 'financial-summary'
  | 'analytics'
  | 'reports'
  | 'settings';
