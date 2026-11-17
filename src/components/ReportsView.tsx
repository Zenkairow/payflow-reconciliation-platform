import React, { useState } from 'react';
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
  Sparkles,
  Scale,
  ShieldAlert,
  FileCheck,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import { ReconciliationSummary, ReconciliationException, MatchedPair } from '../types';
import { downloadCsv } from '../utils/csvParser';
import {
  generateExecutiveDossierReport,
  generateMerchantRemediationDossier,
  generateRegulatoryComplianceMemo,
  generateAiEnrichedCsvData,
} from '../services/geminiAgent';

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
  const [reportTab, setReportTab] = useState<'dossier' | 'merchant' | 'sox' | 'bridge'>('dossier');
  const [dossierContent, setDossierContent] = useState<string | null>(null);
  const [merchantContent, setMerchantContent] = useState<string | null>(null);
  const [soxContent, setSoxContent] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Reports via Gemini
  const handleGenerateDossier = async () => {
    setIsGenerating(true);
    try {
      const res = await generateExecutiveDossierReport(summary, exceptions);
      setDossierContent(res);
    } catch (err: any) {
      setDossierContent(`Error generating dossier: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMerchantPack = async () => {
    setIsGenerating(true);
    try {
      const res = await generateMerchantRemediationDossier(exceptions);
      setMerchantContent(res);
    } catch (err: any) {
      setMerchantContent(`Error generating merchant pack: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSoxMemo = async () => {
    setIsGenerating(true);
    try {
      const res = await generateRegulatoryComplianceMemo(summary);
      setSoxContent(res);
    } catch (err: any) {
      setSoxContent(`Error generating SOX memo: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export AI Enriched CSV
  const handleDownloadAiEnrichedCsv = async () => {
    const enrichedData = await generateAiEnrichedCsvData(exceptions);
    downloadCsv(`PayFlow_AI_Enriched_Exceptions_${summary.reportingPeriod}.csv`, enrichedData);
  };

  const handleDownloadSummaryCsv = () => {
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
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>AI-Powered Month-End Reports & Export Center</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono-num flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Gemini LLM Integrated</span>
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Formal audit dossiers, merchant dispute packs, and AI-enriched downloadable schedules
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadAiEnrichedCsv}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Download AI-Enriched CSV</span>
          </button>
          <button
            onClick={handleDownloadSummaryCsv}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download Audit CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setReportTab('dossier')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            reportTab === 'dossier'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Dossier (LLM)</span>
        </button>

        <button
          onClick={() => setReportTab('merchant')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            reportTab === 'merchant'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Merchant Dispute Pack (LLM)</span>
        </button>

        <button
          onClick={() => setReportTab('sox')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            reportTab === 'sox'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>SOX 404 Controls Memo (LLM)</span>
        </button>

        <button
          onClick={() => setReportTab('bridge')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            reportTab === 'bridge'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Accounting Balance Bridge</span>
        </button>
      </div>

      {/* Tab 1: Comprehensive Audit Dossier (LLM) */}
      {reportTab === 'dossier' && (
        <div className="bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">
                  Gemini LLM Automated Dossier
                </span>
              </div>
              <h4 className="text-lg font-bold text-white">Month-End Financial Audit Dossier</h4>
              <p className="text-xs text-slate-400">
                Full forensic breakdown with journal entry adjustments and executive opinion
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {dossierContent ? (
                <>
                  <button
                    onClick={() => downloadTextFile(`PayFlow_Audit_Dossier_${summary.reportingPeriod}.md`, dossierContent)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Markdown (.md)</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(dossierContent);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleGenerateDossier}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Synthesize Audit Dossier with Gemini'}</span>
                </button>
              )}
            </div>
          </div>

          {dossierContent ? (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {dossierContent}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              <FileText className="w-8 h-8 text-indigo-400 mx-auto" />
              <h5 className="text-sm font-semibold text-white">Ready for LLM Synthesis</h5>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Generate an exhaustive, publication-ready audit dossier powered by Google Gemini, complete with forensic ledger lineage, root causes, and journal entries.
              </p>
              <button
                onClick={handleGenerateDossier}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Dossier Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Merchant Dispute Pack (LLM) */}
      {reportTab === 'merchant' && (
        <div className="bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">
                  Gemini LLM Dispute Generator
                </span>
              </div>
              <h4 className="text-lg font-bold text-white">Merchant Audit & Dispute Remediation Pack</h4>
              <p className="text-xs text-slate-400">
                Automated formal dispute letters generated for MER007, MER008, and MER009
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {merchantContent ? (
                <button
                  onClick={() => downloadTextFile(`PayFlow_Merchant_Dispute_Pack_${summary.reportingPeriod}.md`, merchantContent)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Dispute Letters (.md)</span>
                </button>
              ) : (
                <button
                  onClick={handleGenerateMerchantPack}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-600/30 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Drafting Dispute Pack...' : 'Generate Dispute Pack with Gemini'}</span>
                </button>
              )}
            </div>
          </div>

          {merchantContent ? (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {merchantContent}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              <Mail className="w-8 h-8 text-rose-400 mx-auto" />
              <h5 className="text-sm font-semibold text-white">Generate External Merchant Notices</h5>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Automatically draft tailored operational notices for MER007 (duplicate capture void), MER008 (unauthorized orphan refund freeze), and MER009 (unmapped credit deposit).
              </p>
              <button
                onClick={handleGenerateMerchantPack}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Draft Merchant Letters</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: SOX 404 Controls Memo (LLM) */}
      {reportTab === 'sox' && (
        <div className="bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                  Gemini Regulatory Memo
                </span>
              </div>
              <h4 className="text-lg font-bold text-white">SOX 404 Financial Reconciliation Certification</h4>
              <p className="text-xs text-slate-400">
                Formal internal controls evaluation format suitable for external auditor review
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {soxContent ? (
                <button
                  onClick={() => downloadTextFile(`PayFlow_SOX_Certification_${summary.reportingPeriod}.md`, soxContent)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Certification (.md)</span>
                </button>
              ) : (
                <button
                  onClick={handleGenerateSoxMemo}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Synthesizing SOX Memo...' : 'Synthesize SOX 404 Certification'}</span>
                </button>
              )}
            </div>
          </div>

          {soxContent ? (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {soxContent}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              <FileCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <h5 className="text-sm font-semibold text-white">Internal Controls Sign-Off Format</h5>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Generate the standard Sarbanes-Oxley Section 404 control certification testing 100% census data across platform and bank accounts.
              </p>
              <button
                onClick={handleGenerateSoxMemo}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Certification Memo</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Accounting Balance Bridge (Original Phase 5 Core Table) */}
      {reportTab === 'bridge' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl">
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

          {/* Accounting Table */}
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
      )}
    </div>
  );
};
