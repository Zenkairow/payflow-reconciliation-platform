import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Scale,
  Percent,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ReconciliationSummary, ReconciliationException } from '../types';

interface AdvancedVisualAnalyticsProps {
  summary: ReconciliationSummary;
  exceptions: ReconciliationException[];
}

export const AdvancedVisualAnalytics: React.FC<AdvancedVisualAnalyticsProps> = ({
  summary,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'cumulative' | 'latency' | 'precision'>('cumulative');

  // 1. Cumulative Cash Inflow & Settlement Trajectory Data
  const cumulativeData = [
    { day: 'Jan 05', platformCum: 2250, bankCum: 0, gap: 2250 },
    { day: 'Jan 06', platformCum: 3100, bankCum: 2250, gap: 850 },
    { day: 'Jan 07', platformCum: 5300, bankCum: 3100, gap: 2200 },
    { day: 'Jan 08', platformCum: 5799, bankCum: 5300, gap: 499 },
    { day: 'Jan 10', platformCum: 10749, bankCum: 8500, gap: 2249 },
    { day: 'Jan 15', platformCum: 18278, bankCum: 15309, gap: 2969 },
    { day: 'Jan 20', platformCum: 25078, bankCum: 23678, gap: 1400 },
    { day: 'Jan 25', platformCum: 33178, bankCum: 31328, gap: 1850 },
    { day: 'Jan 31', platformCum: 41828, bankCum: 38454, gap: 3374 }, // Peak gap on Jan 31
    { day: 'Feb 01', platformCum: 41828, bankCum: 40954, gap: 874 },  // TXN026 settles! Gap closes
    { day: 'Feb 03', platformCum: 44203, bankCum: 41904, gap: 2299 },
    { day: 'Feb 05', platformCum: 44852, bankCum: 44129, gap: 723 },  // Final reconciled gap: 723 INR
  ];

  // 2. Settlement Latency Distribution
  const latencyData = [
    { bucket: 'T+0 (Same Day)', count: 0, percentage: '0%', fill: '#64748b' },
    { bucket: 'T+1 (Standard Next Day)', count: 28, percentage: '80%', fill: '#10b981' },
    { bucket: 'T+2 (Clearing Delay)', count: 4, percentage: '11%', fill: '#38bdf8' },
    { bucket: 'T+3+ (Weekend / Month-End Cutoff)', count: 3, percentage: '9%', fill: '#f59e0b' },
  ];

  // 3. Micro-Paise Precision Traceability (TXN027, 028, 029)
  const precisionData = [
    { txn: 'TXN027', platformRaw: 10.004, bankSettled: 10.000, variancePaise: +0.4 },
    { txn: 'TXN028', platformRaw: 10.004, bankSettled: 10.000, variancePaise: +0.4 },
    { txn: 'TXN029', platformRaw: 10.004, bankSettled: 10.000, variancePaise: +0.4 },
  ];

  // 4. Merchant Portfolio Matrix
  const merchantMatrix = [
    { id: 'MER001', name: 'Alpha Retail', platformVol: 11090.00, bankVol: 11090.00, variance: 0, status: 'MATCHED', risk: 'LOW' },
    { id: 'MER002', name: 'Nexus Digital', platformVol: 8924.00, bankVol: 8924.00, variance: 0, status: 'MATCHED', risk: 'LOW' },
    { id: 'MER003', name: 'Apex Logistics', platformVol: 8820.00, bankVol: 8820.00, variance: 0, status: 'MATCHED', risk: 'LOW' },
    { id: 'MER004', name: 'Zenith Global', platformVol: 6539.00, bankVol: 6539.00, variance: 0, status: 'MATCHED', risk: 'LOW' },
    { id: 'MER005', name: 'Starlight Media', platformVol: 2500.00, bankVol: 2500.00, variance: 0, status: 'TIMING_HOLD', risk: 'LOW' },
    { id: 'MER006', name: 'Micro Commerce', platformVol: 30.012, bankVol: 30.00, variance: 0.012, status: 'ROUNDING', risk: 'LOW' },
    { id: 'MER007', name: 'Vanguard Tech', platformVol: 3000.00, bankVol: 1500.00, variance: 1500.00, status: 'DUPLICATE', risk: 'MEDIUM' },
    { id: 'MER008', name: 'Orion Services', platformVol: -500.00, bankVol: -500.00, variance: -500.00, status: 'ORPHAN_REFUND', risk: 'HIGH' },
    { id: 'MER009', name: 'Direct Bank Partner', platformVol: 0.00, bankVol: 777.00, variance: -777.00, status: 'UNMAPPED_BANK', risk: 'MEDIUM' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1.5">
          <p className="font-bold text-white border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex justify-between space-x-3" style={{ color: entry.color || entry.fill }}>
              <span>{entry.name}:</span>
              <span className="font-mono-num font-semibold">
                ₹{Math.abs(entry.value).toLocaleString('en-IN')}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score Gauge */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Reconciliation Integrity
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold font-mono-num text-emerald-400 flex items-baseline gap-1">
              <span>98.36%</span>
              <span className="text-xs text-slate-400 font-sans font-normal">Score</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full w-[98.4%]" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Matched: 98.4% | Defect Variance: 1.6% (100% Traceable)
          </p>
        </div>

        {/* Cash Inflow Velocity */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Peak Liquidity Float
            </span>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono-num text-indigo-300">
              ₹3,374.00
            </div>
            <span className="text-[10px] text-amber-400/90 block mt-1">
              Peak In-Transit Float (Recorded on 2026-01-31)
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Fully absorbed as bank settlements cleared on Feb 01
          </p>
        </div>

        {/* Latency Index */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Average Settlement Cycle
            </span>
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono-num text-cyan-300">
              1.14 Days
            </div>
            <span className="text-[10px] text-emerald-400 block mt-1">
              T+1 Standard Industry Benchmark
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            80% settled in 24 hours, 20% span weekends/cutoffs
          </p>
        </div>

        {/* Micro-Rounding Loss */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Paise Truncation Loss
            </span>
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono-num text-amber-300">
              ₹0.012 INR
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              3 Micro-transactions (0.004 each)
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Accumulated across Merchant MER006 sub-paise captures
          </p>
        </div>
      </div>

      {/* Main Interactive Visualizer */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Cumulative Financial Velocity & Clearing Curve</span>
            </h4>
            <p className="text-xs text-slate-400">
              Tracks the cumulative trajectory of platform captures versus bank settlements over time
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedMetric('cumulative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMetric === 'cumulative'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cumulative Inflow Trajectory
            </button>
            <button
              onClick={() => setSelectedMetric('latency')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMetric === 'latency'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Settlement Latency (Days)
            </button>
            <button
              onClick={() => setSelectedMetric('precision')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMetric === 'precision'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paise Deviation Analysis
            </button>
          </div>
        </div>

        {/* View 1: Cumulative Cash Curve */}
        {selectedMetric === 'cumulative' && (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorPlatform" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `₹${Math.round(val / 1000)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="platformCum"
                  name="Cumulative Platform Captured"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPlatform)"
                />
                <Area
                  type="monotone"
                  dataKey="bankCum"
                  name="Cumulative Bank Settled"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBank)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* View 2: Settlement Latency Histogram */}
        {selectedMetric === 'latency' && (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bucket" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} transactions (${item.payload.percentage})`,
                    'Settled Volume',
                  ]}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {latencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* View 3: Paise Precision Deviation */}
        {selectedMetric === 'precision' && (
          <div className="p-4 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-white block mb-1">Micro-Paise Forensic Analysis:</strong>
              Transactions <code className="text-indigo-400">TXN027</code>, <code className="text-indigo-400">TXN028</code>, and <code className="text-indigo-400">TXN029</code> were captured at <strong>10.004 INR</strong> on the core payment platform. The bank clearing statement settled each at exactly <strong>10.000 INR</strong>.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {precisionData.map(p => (
                <div key={p.txn} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-num">
                    <span className="font-bold text-white">{p.txn}</span>
                    <span className="text-indigo-400 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10">
                      MER006
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Platform Raw:</span>
                      <span className="font-mono-num text-slate-200">₹{p.platformRaw.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Bank Settled:</span>
                      <span className="font-mono-num text-cyan-300">₹{p.bankSettled.toFixed(2)}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-amber-400 font-mono-num">
                      <span>Variance:</span>
                      <span>+{p.variancePaise.toFixed(1)} Paise (₹0.004)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Merchant Portfolio Health Matrix */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Merchant Portfolio Settlement Matrix
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Comprehensive ledger audit per merchant account with automated risk flags
            </p>
          </div>
          <span className="text-xs font-mono-num text-slate-400">
            9 Merchant Accounts Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Merchant</th>
                <th className="py-2.5 px-3">Business Entity</th>
                <th className="py-2.5 px-3 text-right">Platform Volume</th>
                <th className="py-2.5 px-3 text-right">Bank Settlement</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3 text-center">Audit Status</th>
                <th className="py-2.5 px-3 text-center">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono-num">
              {merchantMatrix.map(m => (
                <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white">{m.id}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{m.name}</td>
                  <td className="py-2.5 px-3 text-right text-slate-200">
                    ₹{m.platformVol.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-200">
                    ₹{m.bankVol.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-bold ${
                    m.variance > 0 ? 'text-rose-400' : m.variance < 0 ? 'text-cyan-400' : 'text-emerald-400'
                  }`}>
                    {m.variance > 0 ? '+' : ''}₹{Math.abs(m.variance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      m.status === 'MATCHED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : m.status === 'TIMING_HOLD'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : m.status === 'DUPLICATE' || m.status === 'ORPHAN_REFUND'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      m.risk === 'LOW'
                        ? 'text-slate-400'
                        : m.risk === 'MEDIUM'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-rose-400 bg-rose-500/20 font-bold'
                    }`}>
                      {m.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
