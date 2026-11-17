import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Copy,
  Clock,
  Calculator,
  RotateCcw,
  HelpCircle,
  TrendingDown,
  CheckCircle2,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ReconciliationException, ExceptionIdentifier, ExceptionStatus } from '../types';
import { downloadCsv } from '../utils/csvParser';
import { investigateExceptionWithAgent } from '../services/geminiAgent';

interface ExceptionsViewProps {
  exceptions: ReconciliationException[];
  onUpdateExceptionStatus: (id: string, newStatus: ExceptionStatus, note?: string) => void;
}

export const ExceptionsView: React.FC<ExceptionsViewProps> = ({
  exceptions,
  onUpdateExceptionStatus,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');
  const [aiInvestigations, setAiInvestigations] = useState<Record<string, string>>({});
  const [investigatingId, setInvestigatingId] = useState<string | null>(null);

  const handleInvestigateWithAi = async (exc: ReconciliationException) => {
    setInvestigatingId(exc.id);
    try {
      const result = await investigateExceptionWithAgent(exc, exc.platformRecord, exc.bankRecord);
      setAiInvestigations(prev => ({ ...prev, [exc.id]: result }));
    } catch (err: any) {
      setAiInvestigations(prev => ({ ...prev, [exc.id]: `Investigation error: ${err.message}` }));
    } finally {
      setInvestigatingId(null);
    }
  };

  const technicalCodes: { code: ExceptionIdentifier | 'ALL'; label: string; icon: any }[] = [
    { code: 'ALL', label: 'All Exceptions', icon: AlertTriangle },
    { code: 'TIMING_DIFFERENCE', label: 'TIMING_DIFFERENCE', icon: Clock },
    { code: 'ROUNDING_DIFFERENCE', label: 'ROUNDING_DIFFERENCE', icon: Calculator },
    { code: 'DUPLICATE_IN_PLATFORM', label: 'DUPLICATE_IN_PLATFORM', icon: Copy },
    { code: 'DUPLICATE_IN_BANK', label: 'DUPLICATE_IN_BANK', icon: Copy },
    { code: 'UNMATCHED_REFUND', label: 'UNMATCHED_REFUND', icon: RotateCcw },
    { code: 'UNEXPECTED_BANK_ENTRY', label: 'UNEXPECTED_BANK_ENTRY', icon: HelpCircle },
    { code: 'MISSING_SETTLEMENT', label: 'MISSING_SETTLEMENT', icon: TrendingDown },
    { code: 'AMOUNT_MISMATCH', label: 'AMOUNT_MISMATCH', icon: AlertTriangle },
    { code: 'ATTRIBUTE_MISMATCH', label: 'ATTRIBUTE_MISMATCH', icon: AlertTriangle },
  ];

  const filteredExceptions = useMemo(() => {
    return exceptions.filter(e => {
      const matchCode = selectedCode === 'ALL' || e.code === selectedCode;
      const matchStatus = selectedStatus === 'ALL' || e.status === selectedStatus;
      const matchSeverity = selectedSeverity === 'ALL' || e.severity === selectedSeverity;
      return matchCode && matchStatus && matchSeverity;
    });
  }, [exceptions, selectedCode, selectedStatus, selectedSeverity]);

  const getCodeBadge = (code: ExceptionIdentifier) => {
    switch (code) {
      case 'DUPLICATE_IN_PLATFORM':
      case 'DUPLICATE_IN_BANK':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'TIMING_DIFFERENCE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ROUNDING_DIFFERENCE':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'UNMATCHED_REFUND':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'UNEXPECTED_BANK_ENTRY':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  const handleExportCsv = () => {
    const rows = filteredExceptions.map(e => ({
      Exception_ID: e.id,
      Code: e.code,
      Severity: e.severity,
      Status: e.status,
      Transaction_ID: e.transactionId || 'N/A',
      Bank_Reference_ID: e.bankReferenceId || 'N/A',
      Merchant_ID: e.merchantId || 'N/A',
      Platform_Amount: e.platformAmount ?? '',
      Bank_Amount: e.bankAmount ?? '',
      Variance_Amount: e.varianceAmount,
      Explanation: e.explanation,
      Recommended_Action: e.recommendedAction,
      Analyst_Notes: notes[e.id] || '',
    }));
    downloadCsv('reconciliation_exceptions_audit.csv', rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Exception Triage & Investigation</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono-num">
              {filteredExceptions.length} Filtered
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Finance-friendly plain-English root causes with recommended operational accounting actions
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Exceptions CSV</span>
        </button>
      </div>

      {/* Filter Tabs by Technical Identifiers */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 shadow-sm overflow-x-auto">
        <div className="flex items-center space-x-1.5 min-w-max">
          {technicalCodes.map(tc => {
            const count =
              tc.code === 'ALL'
                ? exceptions.length
                : exceptions.filter(e => e.code === tc.code).length;
            const isSelected = selectedCode === tc.code;
            return (
              <button
                key={tc.code}
                onClick={() => setSelectedCode(tc.code)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{tc.label}</span>
                <span
                  className={`text-[10px] font-mono-num px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filters */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span>Status:</span>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="ADJUSTED">ADJUSTED</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span>Severity:</span>
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {(selectedCode !== 'ALL' || selectedStatus !== 'ALL' || selectedSeverity !== 'ALL') && (
          <button
            onClick={() => {
              setSelectedCode('ALL');
              setSelectedStatus('ALL');
              setSelectedSeverity('ALL');
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium ml-2"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Exceptions List */}
      <div className="space-y-3">
        {filteredExceptions.length === 0 ? (
          <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center text-slate-500">
            No exceptions found matching the current filter criteria.
          </div>
        ) : (
          filteredExceptions.map(exc => {
            const isExpanded = expandedId === exc.id;
            return (
              <div
                key={exc.id}
                className="bg-slate-950 rounded-xl border border-slate-800/90 shadow-sm overflow-hidden transition-all hover:border-slate-700"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : exc.id)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none bg-slate-950 hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="mt-0.5">
                      {exc.code === 'DUPLICATE_IN_PLATFORM' || exc.code === 'DUPLICATE_IN_BANK' ? (
                        <Copy className="w-5 h-5 text-rose-400" />
                      ) : exc.code === 'TIMING_DIFFERENCE' ? (
                        <Clock className="w-5 h-5 text-amber-400" />
                      ) : exc.code === 'ROUNDING_DIFFERENCE' ? (
                        <Calculator className="w-5 h-5 text-indigo-400" />
                      ) : exc.code === 'UNMATCHED_REFUND' ? (
                        <RotateCcw className="w-5 h-5 text-rose-400" />
                      ) : (
                        <HelpCircle className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono-num font-bold px-2 py-0.5 rounded border uppercase ${getCodeBadge(
                            exc.code
                          )}`}
                        >
                          {exc.code}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(
                            exc.severity
                          )}`}
                        >
                          {exc.severity} PRIORITY
                        </span>
                        <span className="text-xs font-bold text-white">{exc.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl">{exc.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end md:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-400">Ledger Impact</div>
                      <div
                        className={`text-sm font-mono-num font-bold ${
                          exc.varianceAmount > 0
                            ? 'text-amber-400'
                            : exc.varianceAmount < 0
                            ? 'text-cyan-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {exc.varianceAmount > 0 ? '+' : ''}
                        ₹{Math.abs(exc.varianceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={exc.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => onUpdateExceptionStatus(exc.id, e.target.value as ExceptionStatus)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer ${
                          exc.status === 'RESOLVED'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                            : exc.status === 'INVESTIGATING'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
                            : 'bg-slate-900 text-slate-200 border-slate-700'
                        }`}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="INVESTIGATING">INVESTIGATING</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="ADJUSTED">ADJUSTED</option>
                      </select>

                      <button className="text-slate-400 hover:text-white p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-900/40 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Root Cause Explanation */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Finance Operations Root Cause Explanation</span>
                        </span>
                        <p className="text-slate-300 leading-relaxed">{exc.explanation}</p>
                      </div>

                      {/* Recommended Accounting Action */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Recommended Operational Action</span>
                        </span>
                        <p className="text-slate-300 leading-relaxed">{exc.recommendedAction}</p>
                      </div>
                    </div>

                    {/* Transaction Metadata Grid */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-num text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-sans">
                            Transaction ID
                          </span>
                          <span className="font-semibold text-slate-200">
                            {exc.transactionId || 'None'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-sans">
                            Bank Reference
                          </span>
                          <span className="font-semibold text-cyan-300">
                            {exc.bankReferenceId || (exc.bankRecord ? exc.bankRecord.Bank_Reference_ID : 'None')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-sans">
                            Merchant ID
                          </span>
                          <span className="font-semibold text-slate-200">
                            {exc.merchantId || 'None'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-sans">
                            Reporting Period
                          </span>
                          <span className="font-semibold text-slate-200">
                            {exc.reportingPeriod === 'ALL' ? 'All Records' : exc.reportingPeriod}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Agentic Gemini AI Forensic Investigation Box */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 via-slate-950 to-indigo-950/30 border border-purple-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-white">Gemini Agentic Forensic Investigation</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                            AI Agent
                          </span>
                        </div>

                        <button
                          onClick={() => handleInvestigateWithAi(exc)}
                          disabled={investigatingId === exc.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${investigatingId === exc.id ? 'animate-spin' : ''}`} />
                          <span>{investigatingId === exc.id ? 'Agent Investigating...' : aiInvestigations[exc.id] ? 'Re-run Investigation' : 'Run Forensic AI Deep Dive'}</span>
                        </button>
                      </div>

                      {aiInvestigations[exc.id] && (
                        <div className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-purple-900/40 text-slate-200 text-xs whitespace-pre-wrap leading-relaxed animate-in fade-in">
                          {aiInvestigations[exc.id]}
                        </div>
                      )}
                    </div>

                    {/* Analyst Notes Section */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Finance Analyst Audit Notes</span>
                        </span>
                        {editingNoteId !== exc.id && (
                          <button
                            onClick={() => {
                              setEditingNoteId(exc.id);
                              setTempNote(notes[exc.id] || '');
                            }}
                            className="text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            {notes[exc.id] ? 'Edit Note' : '+ Add Audit Note'}
                          </button>
                        )}
                      </div>

                      {editingNoteId === exc.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={tempNote}
                            onChange={e => setTempNote(e.target.value)}
                            placeholder="Add commentary regarding settlement verification, chargeback check, or ticket reference..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            rows={2}
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setNotes(prev => ({ ...prev, [exc.id]: tempNote }));
                                onUpdateExceptionStatus(exc.id, exc.status, tempNote);
                                setEditingNoteId(null);
                              }}
                              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                            >
                              Save Note
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : notes[exc.id] ? (
                        <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-900/30 text-indigo-200">
                          {notes[exc.id]}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic">No notes recorded yet.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
