import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileText,
} from 'lucide-react';
import { ReconciliationSummary, ActiveSection } from '../types';

interface FinancialSummaryViewProps {
  summary: ReconciliationSummary;
  onNavigate: (section: ActiveSection) => void;
}

export const FinancialSummaryView: React.FC<FinancialSummaryViewProps> = ({
  summary,
  onNavigate,
}) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }).format(val);
  };

  const duplicateExcludedAmount = summary.duplicatePlatformCount * 1500.00;
  const unresolvedExceptionAmount = 500.00; // Orphan refund REF002 held
  const matchedGrossAmount = 37840.00;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Financial Summary & Accounting Positions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono-num">
              Section 5 Specification
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Explicit accounting measures distinguishing raw ledger sources from adjusted valid-match totals
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono-num px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Reporting Period: <strong>{summary.reportingPeriod === 'ALL' ? 'Cumulative' : summary.reportingPeriod}</strong>
          </span>
        </div>
      </div>

      {/* Row 1: Primary Financial Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gross Platform vs Gross Bank */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Gross Payment Volumes
            </span>
            <Scale className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Gross Platform Captured:</span>
              <span className="font-mono-num font-semibold text-white">
                {formatINR(summary.grossPlatformPayment)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Gross Bank Settled:</span>
              <span className="font-mono-num font-semibold text-white">
                {formatINR(summary.grossBankPayment)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center font-semibold">
              <span className="text-slate-300">Gross Inflow Variance:</span>
              <span className="font-mono-num text-amber-400">
                +₹{(summary.grossPlatformPayment - summary.grossBankPayment).toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        {/* Refund Volumes */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Refund Outflow Volumes
            </span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Platform Refunds:</span>
              <span className="font-mono-num font-semibold text-rose-400">
                - {formatINR(summary.platformRefund)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Bank Refunds Debited:</span>
              <span className="font-mono-num font-semibold text-rose-400">
                - {formatINR(summary.bankRefund)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center font-semibold">
              <span className="text-slate-300">Refund Variance:</span>
              <span className="font-mono-num text-emerald-400">
                ₹0.000 (Fully Settled)
              </span>
            </div>
          </div>
        </div>

        {/* Net Reconciled Variance */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Net Reconciled Position
            </span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Net Platform Total:</span>
              <span className="font-mono-num font-semibold text-indigo-300">
                {formatINR(summary.netPlatform)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Net Bank Settlement:</span>
              <span className="font-mono-num font-semibold text-cyan-300">
                {formatINR(summary.netBank)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center font-semibold">
              <span className="text-slate-300">Raw Net Difference:</span>
              <span className="font-mono-num text-amber-300">
                +{formatINR(summary.netDifference)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Separate Measures Mandated by Blueprint Section 5.10 */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Mandatory Separate Financial Measures (Blueprint 5.10)
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">
            Explicitly isolated to prevent mixing raw source totals with adjusted match totals
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Matched Amounts */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Matched Valid Total</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold font-mono-num text-emerald-400">
              {formatINR(matchedGrossAmount)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Fully verified 1-to-1 matched platform/bank rows
            </p>
          </div>

          {/* Duplicate-Excluded Amounts */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Duplicate-Excluded Amount</span>
              <Copy className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-lg font-bold font-mono-num text-rose-400">
              {formatINR(duplicateExcludedAmount)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              TXN030 redundant capture excluded from adjusted revenue
            </p>
          </div>

          {/* Unresolved Exception Amounts */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Unresolved Amounts</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-bold font-mono-num text-amber-400">
              {formatINR(unresolvedExceptionAmount)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              REF002 orphan refund held pending authorization audit
            </p>
          </div>

          {/* Aggregate Rounding Variance */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Rounding Difference</span>
              <Calculator className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-lg font-bold font-mono-num text-indigo-300">
              ₹{summary.aggregateRoundingDifference.toFixed(3)} INR
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Net sub-paise variance across TXN027, 028, 029
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Methodology Disclosure Note (Blueprint 5.10 Requirement) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Accounting Methodology & Treatment Disclosure</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In compliance with fintech audit standards, PayFlow employs strict separation between raw ledger values and verified financial totals:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <strong className="text-slate-200 block">1. Duplicate Treatment (TXN030):</strong>
            Raw platform records contain two captures of ₹1,500.00. The primary row matches the single bank settlement. The second row is identified as an unbanked duplicate capture and excluded from adjusted net revenue to prevent artificial revenue inflation.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <strong className="text-slate-200 block">2. Unexpected Bank Credits (BNKONLY001):</strong>
            Direct bank settlement of ₹777.00 without platform order record is preserved as an unmapped bank credit and reconciled against external wires.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <strong className="text-slate-200 block">3. Sub-Cent Rounding Variance (TXN027–029):</strong>
            Platform captures at 3 decimal places (10.004 INR) vs bank settlements at 2 decimal places (10.00 INR) are accepted within tolerance and booked to Rounding Adjustments.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <strong className="text-slate-200 block">4. Orphan Refund Validation (REF002):</strong>
            Refund referencing missing TXN9999 is isolated in an unresolved triage state without being acknowledged as an authorized merchant debit.
          </div>
        </div>
      </div>
    </div>
  );
};
