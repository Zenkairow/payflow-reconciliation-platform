import React, { useState } from 'react';
import {
  Upload,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  HardDrive,
  Info,
  Key,
  Check,
  Sparkles,
} from 'lucide-react';
import { parsePlatformCsv, parseBankCsv } from '../utils/csvParser';
import { PlatformTransaction, BankTransaction } from '../types';
import {
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
} from '../services/geminiAgent';

interface SettingsViewProps {
  onLoadCustomPlatformData: (data: PlatformTransaction[]) => void;
  onLoadCustomBankData: (data: BankTransaction[]) => void;
  onResetToSeedData: () => void;
  roundingTolerance: number;
  setRoundingTolerance: (tol: number) => void;
  currentPlatformCount: number;
  currentBankCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onLoadCustomPlatformData,
  onLoadCustomBankData,
  onResetToSeedData,
  roundingTolerance,
  setRoundingTolerance,
  currentPlatformCount,
  currentBankCount,
}) => {
  const [platformUploadMsg, setPlatformUploadMsg] = useState<string | null>(null);
  const [bankUploadMsg, setBankUploadMsg] = useState<string | null>(null);

  // Gemini API Key State
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [model, setModel] = useState(getStoredModel());
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKey);
    setStoredModel(model);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handlePlatformFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const { data, errors } = parsePlatformCsv(text);
      if (errors.length > 0 && data.length === 0) {
        setPlatformUploadMsg(`Error: ${errors[0]}`);
      } else {
        onLoadCustomPlatformData(data);
        setPlatformUploadMsg(`Successfully loaded ${data.length} platform transactions!`);
      }
    };
    reader.readAsText(file);
  };

  const handleBankFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const { data, errors } = parseBankCsv(text);
      if (errors.length > 0 && data.length === 0) {
        setBankUploadMsg(`Error: ${errors[0]}`);
      } else {
        onLoadCustomBankData(data);
        setBankUploadMsg(`Successfully loaded ${data.length} bank settlements!`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Data Management & Reconciliation Engine Settings
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Ingest new monthly datasets, reset to bundled sample files, or adjust matching tolerances
        </p>
      </div>

      {/* Dataset Ingestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform CSV Upload */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Platform Transactions Dataset</h4>
              </div>
              <span className="text-[11px] font-mono-num px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                Active: {currentPlatformCount} rows
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Upload custom platform transaction ledger CSV with columns:{' '}
              <code className="text-slate-300">Transaction_ID, Transaction_Date, Transaction_Type, Amount_INR, Currency, Status</code>.
            </p>

            <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900">
              <Upload className="w-6 h-6 text-indigo-400 mb-2" />
              <span className="text-xs font-semibold text-slate-200">Click to Select Platform CSV</span>
              <span className="text-[10px] text-slate-500 mt-1">Accepts UTF-8 .csv files</span>
              <input type="file" accept=".csv" onChange={handlePlatformFile} className="hidden" />
            </label>

            {platformUploadMsg && (
              <div
                className={`mt-3 p-2.5 rounded-lg text-xs font-medium ${
                  platformUploadMsg.startsWith('Error')
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800/50'
                    : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                }`}
              >
                {platformUploadMsg}
              </div>
            )}
          </div>
        </div>

        {/* Bank CSV Upload */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Bank Settlement Dataset</h4>
              </div>
              <span className="text-[11px] font-mono-num px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                Active: {currentBankCount} rows
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Upload bank statement settlement CSV with columns:{' '}
              <code className="text-slate-300">Bank_Reference_ID, Transaction_ID, Settlement_Date, Transaction_Type, Amount_INR, Bank_Status</code>.
            </p>

            <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900">
              <Upload className="w-6 h-6 text-cyan-400 mb-2" />
              <span className="text-xs font-semibold text-slate-200">Click to Select Bank CSV</span>
              <span className="text-[10px] text-slate-500 mt-1">Accepts UTF-8 .csv files</span>
              <input type="file" accept=".csv" onChange={handleBankFile} className="hidden" />
            </label>

            {bankUploadMsg && (
              <div
                className={`mt-3 p-2.5 rounded-lg text-xs font-medium ${
                  bankUploadMsg.startsWith('Error')
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800/50'
                    : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                }`}
              >
                {bankUploadMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gemini LLM API Configuration Card */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-purple-900/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Google Gemini API Key Configuration</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Live LLM Integration
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Powers AI-generated audit reports, merchant dispute memos, and autonomous exception reasoning
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Save Key</span>
            </button>
            {keySaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
                <Check className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Paste your key here (e.g. AIzaSy...)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono-num"
            />
            <span className="text-[10px] text-slate-500 block">
              Saved securely in your browser's private localStorage. Never transmitted to any third party.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Gemini Model
            </label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Engine Parameters & Reset Section */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Matching Rules & Tolerance Configuration</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Control the threshold for precision rounding variances and matching windows
            </p>
          </div>

          <button
            onClick={() => {
              onResetToSeedData();
              setPlatformUploadMsg(null);
              setBankUploadMsg(null);
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Bundled Seed Data</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Sub-Paise Rounding Tolerance (₹ INR)
            </label>
            <p className="text-[11px] text-slate-400">
              Transactions whose amount difference is strictly within this threshold are matched with an
              aggregate rounding variance note instead of triggering a full hard amount mismatch exception.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.005"
                value={roundingTolerance}
                onChange={e => setRoundingTolerance(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="font-mono-num font-bold text-xs text-indigo-300 shrink-0 w-16">
                ±₹{roundingTolerance.toFixed(3)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Architecture & Zero-Server Footprint</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              PayFlow runs 100% in your browser. No financial data leaves this device. All reconciliation passes,
              idempotency checks, and CSV parsers execute entirely in WebAssembly/V8 client memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
