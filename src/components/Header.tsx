import React from 'react';
import { Calendar, Play, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { ActiveSection, ReconciliationSummary } from '../types';

interface HeaderProps {
  activeSection: ActiveSection;
  reportingPeriod: string;
  setReportingPeriod: (period: string) => void;
  onRunReconciliation: () => void;
  isRunning: boolean;
  summary: ReconciliationSummary;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  reportingPeriod,
  setReportingPeriod,
  onRunReconciliation,
  isRunning,
  summary,
}) => {
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return { title: 'Overview Dashboard', subtitle: 'Executive reconciliation metrics and financial variances' };
      case 'transactions':
        return { title: 'Transactions Explorer', subtitle: 'Browse and inspect platform and bank source ledgers' };
      case 'reconciliation':
        return { title: 'Reconciliation Engine', subtitle: 'Multi-pass rule-based automated comparison engine' };
      case 'exceptions':
        return { title: 'Exceptions Management', subtitle: 'Triage, investigate root cause, and resolve ledger discrepancies' };
      case 'financial-summary':
        return { title: 'Financial Summary', subtitle: 'Detailed ledger measures, duplicate exclusions, and accounting disclosures' };
      case 'reports':
        return { title: 'Reports & Export', subtitle: 'Formal month-end accounting bridge and audit schedule' };
      case 'settings':
        return { title: 'Data Management & Settings', subtitle: 'Upload custom CSV datasets and configure matching parameters' };
      default:
        return { title: 'PayFlow Reconciliation', subtitle: '' };
    }
  };

  const { title, subtitle } = getSectionTitle();

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reporting Period Selector */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Period:</span>
            <select
              value={reportingPeriod}
              onChange={e => setReportingPeriod(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                All Periods (Combined)
              </option>
              <option value="2026-01" className="bg-slate-900 text-slate-200">
                January 2026 (Month-End)
              </option>
              <option value="2026-02" className="bg-slate-900 text-slate-200">
                February 2026
              </option>
            </select>
          </div>

          {/* Reconciliation Status Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 border border-slate-800">
            {summary.totalExceptionCount > 0 ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium">
                  {summary.totalExceptionCount} Exceptions Detected
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Fully Reconciled</span>
              </>
            )}
          </div>

          {/* Run Reconciliation Button */}
          <button
            onClick={onRunReconciliation}
            disabled={isRunning}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all ${
              isRunning
                ? 'bg-indigo-700 text-white cursor-not-allowed opacity-80'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Audit...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Reconciliation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
