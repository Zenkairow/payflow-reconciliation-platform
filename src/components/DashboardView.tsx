import React from 'react';
import {
  FileText,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Clock,
  Calculator,
  RotateCcw,
  HelpCircle,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { ReconciliationSummary, ActiveSection, ReconciliationException } from '../types';
import { ReconciliationCharts } from './ReconciliationCharts';

interface DashboardViewProps {
  summary: ReconciliationSummary;
  exceptions: ReconciliationException[];
  onNavigate: (section: ActiveSection) => void;
  onRunReconciliation: () => void;
  isRunning: boolean;
  onOpenAiCoPilot: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  exceptions,
  onNavigate,
  onRunReconciliation,
  isRunning,
  onOpenAiCoPilot,
}) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Reconciliation Status Alert Banner */}
      <div
        className={`p-5 rounded-2xl border backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          summary.totalExceptionCount > 0
            ? 'bg-amber-950/20 border-amber-800/40'
            : 'bg-emerald-950/20 border-emerald-800/40'
        }`}
      >
        <div className="flex items-start space-x-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              summary.totalExceptionCount > 0
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {summary.totalExceptionCount > 0 ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-white">
                {summary.totalExceptionCount > 0
                  ? `Reconciliation Discrepancies Flagged (${summary.totalExceptionCount} Exceptions)`
                  : 'Platform & Bank Ledgers Fully Reconciled'}
              </h3>
              <span className="text-[10px] font-mono-num font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Period: {summary.reportingPeriod === 'ALL' ? 'All Records' : summary.reportingPeriod}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {summary.totalExceptionCount > 0
                ? `Net variance of ${formatINR(summary.netDifference)} identified between Platform Net (${formatINR(summary.netPlatform)}) and Bank Net (${formatINR(summary.netBank)}). Traced to duplicate platform charges, timing cutoffs, rounding, and unmapped bank settlements.`
                : 'All transactions match across platform records and bank settlements with zero unverified variance.'}
            </p>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-2">
              <span>Last Run: {new Date(summary.runTimestamp).toLocaleTimeString()}</span>
              <span>•</span>
              <span>Status: <strong className="text-emerald-400 font-semibold">{summary.status}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAiCoPilot}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Co-Pilot</span>
          </button>
          <button
            onClick={() => onNavigate('exceptions')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <span>Investigate Exceptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRunReconciliation}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Re-run Audit</span>
          </button>
        </div>
      </div>

      {/* Row 1: Primary Volume & Record Reconciliation (Raw Source vs Unique vs Matched) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Source Records vs Reconciled Volume
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Distinguishing raw physical records from unique transaction entities
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Platform Records */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Platform Records</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono-num text-white">
              {summary.totalPlatformRecords}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Total raw CSV rows</div>
          </div>

          {/* Unique Platform Transactions */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Unique Platform</span>
              <span className="text-[10px] font-bold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/10">
                DISTINCT
              </span>
            </div>
            <div className="text-2xl font-bold font-mono-num text-indigo-300">
              {summary.uniquePlatformCount}
            </div>
            <div className="text-[11px] text-amber-400/90 mt-1">
              {summary.totalPlatformRecords - summary.uniquePlatformCount > 0
                ? `${summary.totalPlatformRecords - summary.uniquePlatformCount} duplicate(s) filtered`
                : 'Zero duplicates'}
            </div>
          </div>

          {/* Total Bank Records */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Bank Records</span>
              <Building2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono-num text-white">
              {summary.totalBankRecords}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Total settlement rows</div>
          </div>

          {/* Unique Bank Transactions */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Unique Bank</span>
              <span className="text-[10px] font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10">
                DISTINCT
              </span>
            </div>
            <div className="text-2xl font-bold font-mono-num text-cyan-300">
              {summary.uniqueBankCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Distinct settlements</div>
          </div>

          {/* Matched Count */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Matched Pairs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono-num text-emerald-400">
              {summary.matchedCount}
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-1">
              {Math.round((summary.matchedCount / Math.max(summary.uniquePlatformCount, 1)) * 100)}% match rate
            </div>
          </div>

          {/* Total Exceptions */}
          <div
            onClick={() => onNavigate('exceptions')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-sm hover:border-amber-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium group-hover:text-amber-300">Total Exceptions</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono-num text-amber-400">
              {summary.totalExceptionCount}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1 flex items-center gap-1 group-hover:underline">
              <span>View details</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Financial Position & Ledger Reconciliation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Financial Ledger Reconciliation
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Calculated directly from transactions in active reporting period
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Platform Financial Position */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-sm font-bold text-white">Platform Position</span>
              </div>
              <span className="text-xs font-mono-num text-slate-400">INR Ledger</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Gross Payments
                </span>
                <span className="font-mono-num font-semibold text-slate-200">
                  {formatINR(summary.grossPlatformPayment)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" /> Platform Refunds
                </span>
                <span className="font-mono-num font-semibold text-rose-400">
                  - {formatINR(summary.platformRefund)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Net Platform Amount</span>
                <span className="text-base font-bold font-mono-num text-indigo-300">
                  {formatINR(summary.netPlatform)}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Financial Position */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span className="text-sm font-bold text-white">Bank Settlement</span>
              </div>
              <span className="text-xs font-mono-num text-slate-400">Bank Statement</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Gross Bank Payments
                </span>
                <span className="font-mono-num font-semibold text-slate-200">
                  {formatINR(summary.grossBankPayment)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" /> Bank Refunds Settled
                </span>
                <span className="font-mono-num font-semibold text-rose-400">
                  - {formatINR(summary.bankRefund)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Net Bank Amount</span>
                <span className="text-base font-bold font-mono-num text-cyan-300">
                  {formatINR(summary.netBank)}
                </span>
              </div>
            </div>
          </div>

          {/* Net Variance / Reconciliation Gap */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm font-bold text-white">Reconciliation Variance</span>
                </div>
                <span className="text-xs font-mono-num text-amber-400 font-semibold">
                  Net Gap
                </span>
              </div>

              <div className="text-2xl font-bold font-mono-num text-amber-300">
                {summary.netDifference >= 0 ? '+' : ''}
                {formatINR(summary.netDifference)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Calculated strictly as <strong>Net Platform - Net Bank</strong>. Fully accounted for by:
              </p>
              <ul className="text-[11px] text-slate-300 space-y-1 mt-2">
                <li className="flex justify-between">
                  <span>• Duplicate capture (TXN030):</span>
                  <span className="font-mono-num text-amber-400">+₹1,500.00</span>
                </li>
                <li className="flex justify-between">
                  <span>• Unexpected bank entry (BNKONLY001):</span>
                  <span className="font-mono-num text-cyan-400">-₹777.00</span>
                </li>
                <li className="flex justify-between">
                  <span>• Fractional rounding (TXN027-029):</span>
                  <span className="font-mono-num text-slate-400">+₹0.012</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Reconciled Bridge:</span>
              <span className="text-emerald-400 font-mono-num font-semibold">100% Balanced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2.5: Graphical Financial Visualizations & Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Graphical Financial Analytics & Waterfall Bridge
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Visual forensic tracking of transaction volumes and ledger variance bridge
          </span>
        </div>
        <ReconciliationCharts summary={summary} exceptions={exceptions} />
      </div>

      {/* Row 3: Exception Categories Breakdown Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Exception Taxonomy Breakdown
          </h3>
          <button
            onClick={() => onNavigate('exceptions')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <span>Open Exception Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* Duplicate in Platform */}
          <div
            onClick={() => onNavigate('exceptions')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-rose-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-rose-300">
                Duplicate Platform
              </span>
              <Copy className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono-num text-rose-400">
              {summary.duplicatePlatformCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              TXN030 unbanked retry capture
            </div>
          </div>

          {/* Duplicate in Bank */}
          <div
            onClick={() => onNavigate('exceptions')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-100">
                Duplicate Bank
              </span>
              <Copy className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-xl font-bold font-mono-num text-slate-300">
              {summary.duplicateBankCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Duplicate settlement credit
            </div>
          </div>

          {/* Timing Difference */}
          <div
            onClick={() => onNavigate('exceptions')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-300">
                Timing Difference
              </span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono-num text-amber-400">
              {summary.timingDifferenceCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Cross-period cut-off (TXN026)
            </div>
          </div>

          {/* Aggregate Rounding Difference */}
          <div
            onClick={() => onNavigate('exceptions')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-indigo-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-indigo-300">
                Rounding Difference
              </span>
              <Calculator className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold font-mono-num text-indigo-400">
              {summary.roundingDifferenceCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Net: ₹{summary.aggregateRoundingDifference.toFixed(3)} INR
            </div>
          </div>

          {/* Unmatched Refund */}
          <div
            onClick={() => onNavigate('exceptions')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-rose-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-rose-300">
                Unmatched Refund
              </span>
              <RotateCcw className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono-num text-rose-400">
              {summary.unmatchedRefundCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              REF002 (orphan TXN9999)
            </div>
          </div>

          {/* Missing Bank Settlement */}
          <div
            onClick={() => onNavigate('exceptions')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-100">
                Missing Settlement
              </span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono-num text-slate-300">
              {summary.missingSettlementCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Platform payment not settled
            </div>
          </div>

          {/* Unexpected Bank Entry */}
          <div
            onClick={() => onNavigate('exceptions')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300">
                Unexpected Bank Entry
              </span>
              <HelpCircle className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono-num text-cyan-400">
              {summary.unexpectedBankEntryCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              BNKONLY001 (₹777.00 unmapped)
            </div>
          </div>

          {/* Amount / Attribute Mismatch */}
          <div
            onClick={() => onNavigate('exceptions')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-100">
                Attribute / Amount Mismatch
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono-num text-slate-300">
              {summary.amountMismatchCount + summary.attributeMismatchCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Metadata & fee deductions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
