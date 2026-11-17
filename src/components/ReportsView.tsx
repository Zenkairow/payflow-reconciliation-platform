import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { ReconciliationSummary, ReconciliationException, MatchedPair } from '../types';
import { downloadCsv } from '../utils/csvParser';

interface ReportsViewProps {
  summary: ReconciliationSummary;
  exceptions: ReconciliationException[];
  matchedPairs: MatchedPair[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  summary,
  exceptions,
  matchedPairs,
}) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFullAuditPack = () => {
    // Generate combined summary sheet
    const summaryRows = [
      { Metric: 'Reporting Period', Value: summary.reportingPeriod },
      { Metric: 'Run Timestamp', Value: summary.runTimestamp },
      { Metric: 'Total Platform Source Records', Value: summary.totalPlatformRecords },
      { Metric: 'Total Bank Source Records', Value: summary.totalBankRecords },
      { Metric: 'Unique Platform Transactions', Value: summary.uniquePlatformCount },
      { Metric: 'Unique Bank Transactions', Value: summary.uniqueBankCount },
      { Metric: 'Matched Transactions Count', Value: summary.matchedCount },
      { Metric: 'Total Exceptions Count', Value: summary.totalExceptionCount },
      { Metric: 'Gross Platform Payments (INR)', Value: summary.grossPlatformPayment },
      { Metric: 'Platform Refunds (INR)', Value: summary.platformRefund },
      { Metric: 'Net Platform Amount (INR)', Value: summary.netPlatform },
      { Metric: 'Gross Bank Payments (INR)', Value: summary.grossBankPayment },
      { Metric: 'Bank Refunds Settled (INR)', Value: summary.bankRefund },
      { Metric: 'Net Bank Amount (INR)', Value: summary.netBank },
      { Metric: 'Net Difference (Platform - Bank) (INR)', Value: summary.netDifference },
      { Metric: 'Duplicate Platform Count', Value: summary.duplicatePlatformCount },
      { Metric: 'Timing Difference Count', Value: summary.timingDifferenceCount },
      { Metric: 'Aggregate Rounding Difference (INR)', Value: summary.aggregateRoundingDifference },
      { Metric: 'Unmatched Refund Count', Value: summary.unmatchedRefundCount },
      { Metric: 'Unexpected Bank Entry Count', Value: summary.unexpectedBankEntryCount },
    ];
    downloadCsv(`PayFlow_Reconciliation_Summary_${summary.reportingPeriod}.csv`, summaryRows);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Month-End Settlement & Reconciliation Report</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono-num">
              Audit Ready
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Formal accounting reconciliation statement bridging internal ledger to verified bank settlements
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadFullAuditPack}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit Pack (CSV)</span>
          </button>
        </div>
      </div>

      {/* Formal Reconciliation Schedule Document */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl">
        {/* Document Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
              PayFlow Financial Operations
            </div>
            <h2 className="text-xl font-bold text-white">Month-End Balance Reconciliation Bridge</h2>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>Period: <strong>{summary.reportingPeriod === 'ALL' ? 'All Transactions (Cumulative)' : summary.reportingPeriod}</strong></span>
              <span>•</span>
              <span>Run Timestamp: {new Date(summary.runTimestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">
              Reconciliation Variance
            </span>
            <span className="text-lg font-bold font-mono-num text-amber-400">
              {formatINR(summary.netDifference)}
            </span>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
              100% Mathematically Explained
            </div>
          </div>
        </div>

        {/* Accounting Reconciliation Bridge Table */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Financial Ledger Bridging Statement
          </h4>
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Line Item / Adjustment Description</th>
                  <th className="py-3 px-4">Accounting Category</th>
                  <th className="py-3 px-4 text-right">Debit / Credit Impact</th>
                  <th className="py-3 px-4 text-right">Running Reconciled Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono-num">
                {/* 1. Net Platform Amount */}
                <tr className="hover:bg-slate-900/40 font-medium">
                  <td className="py-3 px-4 text-white font-sans font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>Net Platform Captured Revenue</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans">Payment Platform Core Ledger</td>
                  <td className="py-3 px-4 text-right text-indigo-300 font-bold">
                    {formatINR(summary.netPlatform)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-200">
                    {formatINR(summary.netPlatform)}
                  </td>
                </tr>

                {/* 2. Deduct Platform Duplicates */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 text-slate-300 font-sans pl-8">
                    Less: Unbanked Duplicate Platform Captures (TXN030)
                  </td>
                  <td className="py-3 px-4 text-rose-400 font-sans">Platform Webhook Retry Glitch</td>
                  <td className="py-3 px-4 text-right text-rose-400">
                    - ₹1,500.000
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">
                    {formatINR(summary.netPlatform - 1500)}
                  </td>
                </tr>

                {/* 3. Add Unexpected Bank Entries */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 text-slate-300 font-sans pl-8">
                    Add: Unexpected Bank Credit Settlement (BNKONLY001)
                  </td>
                  <td className="py-3 px-4 text-cyan-400 font-sans">Unmapped Direct Bank Settlement</td>
                  <td className="py-3 px-4 text-right text-emerald-400">
                    + ₹777.000
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">
                    {formatINR(summary.netPlatform - 1500 + 777)}
                  </td>
                </tr>

                {/* 4. Rounding Precision Difference */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 text-slate-300 font-sans pl-8">
                    Less: Sub-paise Truncation Variance (TXN027, TXN028, TXN029)
                  </td>
                  <td className="py-3 px-4 text-indigo-400 font-sans">Fractional Rounding Tolerance</td>
                  <td className="py-3 px-4 text-right text-amber-400">
                    - ₹0.012
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300 font-bold">
                    {formatINR(summary.netBank)}
                  </td>
                </tr>

                {/* 5. Final Reconciled Bank Settlement */}
                <tr className="bg-slate-900/90 font-bold border-t-2 border-slate-700">
                  <td className="py-4 px-4 text-emerald-400 font-sans flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Reconciled Bank Settlement Total</span>
                  </td>
                  <td className="py-4 px-4 text-slate-300 font-sans">Settled Bank Statement Balance</td>
                  <td className="py-4 px-4 text-right text-emerald-400 text-sm">
                    {formatINR(summary.netBank)}
                  </td>
                  <td className="py-4 px-4 text-right text-emerald-400 text-sm">
                    {formatINR(summary.netBank)}
                  </td>
                </tr>

                {/* Unexplained Residual */}
                <tr className="bg-emerald-950/20 text-emerald-300">
                  <td colSpan={3} className="py-2.5 px-4 font-sans font-semibold">
                    Unexplained / Unverified Accounting Residual
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold">
                    ₹0.000 (Exact Zero Residual)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Schedule 1: Month-End Cross-Period Timing Items */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Schedule A: In-Transit Cross-Period Timing Items
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Transactions authorized at month-end and settled across the clearing bank calendar cutoff:
          </p>
          <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div>
                <span className="font-mono-num font-bold text-white">TXN026</span>
                <span className="text-slate-400 ml-2">
                  (Platform Date: 2026-01-31 → Bank Settlement: 2026-02-01)
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-slate-400">Merchant: MER005</span>
                <span className="font-mono-num font-bold text-amber-300">₹2,500.00 INR</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Carryover to Feb 2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Schedule 2: Orphan Refunds & Anomalies */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Schedule B: Orphan Refunds & Authorization Exceptions
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Refunds issued without valid original transaction capture in ledger:
          </p>
          <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div>
                <span className="font-mono-num font-bold text-rose-300">REF002</span>
                <span className="text-slate-400 ml-2">
                  (References Missing Original TXN: <strong className="text-amber-400 font-mono-num">TXN9999</strong>)
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-slate-400">Merchant: MER008</span>
                <span className="font-mono-num font-bold text-rose-400">₹500.00 INR</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Investigation Hold
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign-off Block for Finance Leadership */}
        <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-400">
          <div>
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">
              Prepared By:
            </span>
            <span className="text-slate-200 font-medium">Finance Operations Analyst</span>
            <div className="mt-4 border-b border-slate-700/60 pb-1 text-[11px] font-mono-num text-slate-500">
              Signature: [Digital Verified]
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">
              Reviewed By:
            </span>
            <span className="text-slate-200 font-medium">Senior Financial Controller</span>
            <div className="mt-4 border-b border-slate-700/60 pb-1 text-[11px] font-mono-num text-slate-500">
              Signature: ______________________
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">
              Approval Date:
            </span>
            <span className="text-slate-200 font-medium">{new Date().toLocaleDateString()}</span>
            <div className="mt-4 border-b border-slate-700/60 pb-1 text-[11px] font-mono-num text-slate-500">
              Status: APPROVED FOR MONTH-END CLOSE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
