import React, { useState } from 'react';
import {
  GitCompare,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Layers,
  Clock,
  ArrowRight,
  Terminal,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PlatformTransaction,
  BankTransaction,
  ReconciliationSummary,
  ActiveSection,
} from '../types';

interface ReconciliationViewProps {
  platformRecords: PlatformTransaction[];
  bankRecords: BankTransaction[];
  summary: ReconciliationSummary;
  reportingPeriod: string;
  setReportingPeriod: (period: string) => void;
  roundingTolerance: number;
  setRoundingTolerance: (tol: number) => void;
  onRunReconciliation: () => void;
  isRunning: boolean;
  onNavigate: (section: ActiveSection) => void;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  platformRecords,
  bankRecords,
  summary,
  reportingPeriod,
  setReportingPeriod,
  roundingTolerance,
  setRoundingTolerance,
  onRunReconciliation,
  isRunning,
  onNavigate,
}) => {
  const [activeStep, setActiveStep] = useState<number>(isRunning ? 2 : 4);

  const steps = [
    { title: 'Schema Ingestion', desc: 'Validating column headers and currency codes' },
    { title: 'Deduplication Audit', desc: 'Isolating redundant platform captures and bank settlements' },
    { title: '1-to-1 Primary Matching', desc: 'Correlating transaction IDs and gross settlements' },
    { title: 'Tolerance & Anomaly Engine', desc: 'Applying sub-paise rounding tolerance and orphan refund checks' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Engine Setup & Controls */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/90 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                Rule-Based Automated Engine
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Execute Month-End Reconciliation Run
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Executes a deterministic multi-pass comparison between payment gateway records and bank settlement ledgers.
              Identifies timing differences, duplicates, rounding variances, and orphan anomalies with 100% idempotency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Period Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Target Period
              </span>
              <select
                value={reportingPeriod}
                onChange={e => setReportingPeriod(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">
                  All Records
                </option>
                <option value="2026-01" className="bg-slate-900 text-slate-200">
                  January 2026
                </option>
                <option value="2026-02" className="bg-slate-900 text-slate-200">
                  February 2026
                </option>
              </select>
            </div>

            {/* Rounding Tolerance */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Rounding Tolerance
              </span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="text-xs text-slate-400">±₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="1.00"
                  value={roundingTolerance}
                  onChange={e => setRoundingTolerance(parseFloat(e.target.value) || 0)}
                  className="w-14 bg-transparent text-xs font-mono-num font-semibold text-slate-100 focus:outline-none border-b border-slate-700 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={onRunReconciliation}
              disabled={isRunning}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                isRunning
                  ? 'bg-indigo-700 opacity-80 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Processing Rules...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Reconciliation Engine</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Platform Dataset */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Platform Source Ledger
              </h4>
            </div>
            <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
              Platform_Data.csv
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">Source Rows</span>
              <span className="text-base font-bold font-mono-num text-white">
                {summary.totalPlatformRecords}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">Distinct Txns</span>
              <span className="text-base font-bold font-mono-num text-indigo-300">
                {summary.uniquePlatformCount}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">Net Volume</span>
              <span className="text-base font-bold font-mono-num text-slate-200">
                ₹{Math.round(summary.netPlatform).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Bank Dataset */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Bank Settlement Ledger
              </h4>
            </div>
            <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
              Bank_Data.csv
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">Settlement Rows</span>
              <span className="text-base font-bold font-mono-num text-white">
                {summary.totalBankRecords}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">Distinct Refs</span>
              <span className="text-base font-bold font-mono-num text-cyan-300">
                {summary.uniqueBankCount}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">Net Settlement</span>
              <span className="text-base font-bold font-mono-num text-slate-200">
                ₹{Math.round(summary.netBank).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Pipeline Progress Steps */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/90 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Execution Pipeline Verification</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((st, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border transition-all ${
                i <= activeStep
                  ? 'bg-slate-900/90 border-slate-700'
                  : 'bg-slate-950/40 border-slate-850 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i <= activeStep ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-xs font-semibold text-slate-200">{st.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Summary & Next Actions */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Reconciliation Execution Complete</h4>
              <span className="text-[10px] font-mono-num font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Deterministic
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div>
                Matched Transactions:{' '}
                <strong className="text-emerald-400 font-mono-num font-bold text-sm">
                  {summary.matchedCount}
                </strong>
              </div>
              <div>
                Total Exceptions Flagged:{' '}
                <strong className="text-amber-400 font-mono-num font-bold text-sm">
                  {summary.totalExceptionCount}
                </strong>
              </div>
              <div>
                Net Financial Variance:{' '}
                <strong className="text-indigo-300 font-mono-num font-bold text-sm">
                  ₹{summary.netDifference.toFixed(3)} INR
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigate('exceptions')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all font-semibold"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Triage {summary.totalExceptionCount} Exceptions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              <span>View Accounting Bridge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
