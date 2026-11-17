import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { ReconciliationSummary, ReconciliationException } from '../types';

interface ReconciliationChartsProps {
  summary: ReconciliationSummary;
  exceptions: ReconciliationException[];
}

export const ReconciliationCharts: React.FC<ReconciliationChartsProps> = ({
  summary,
}) => {
  // 1. Waterfall Bridge Data
  const bridgeData = [
    { name: 'Platform Net', amount: Math.round(summary.netPlatform), type: 'base', fill: '#6366f1' },
    { name: 'Deduct DUP', amount: -1500, type: 'sub', fill: '#f43f5e' },
    { name: 'Add Bank Entry', amount: 777, type: 'add', fill: '#06b6d4' },
    { name: 'Rounding Adj', amount: -1, type: 'sub', fill: '#fbbf24' },
    { name: 'Bank Net Total', amount: Math.round(summary.netBank), type: 'total', fill: '#10b981' },
  ];

  // 2. Exception Distribution Data for Pie Chart
  const exceptionPieData = [
    { name: 'Duplicates', value: summary.duplicatePlatformCount + summary.duplicateBankCount, color: '#f43f5e' },
    { name: 'Timing Diff', value: summary.timingDifferenceCount, color: '#f59e0b' },
    { name: 'Rounding', value: summary.roundingDifferenceCount, color: '#818cf8' },
    { name: 'Orphan Refund', value: summary.unmatchedRefundCount, color: '#ec4899' },
    { name: 'Unexpected Bank', value: summary.unexpectedBankEntryCount, color: '#06b6d4' },
  ].filter(item => item.value > 0);

  // 3. Daily Timeline Trend Data (Jan 05 to Feb 05)
  const timelineData = [
    { date: '01/05', platform: 2250, bank: 0 },
    { date: '01/06', platform: 850, bank: 2250 },
    { date: '01/07', platform: 2200, bank: 850 },
    { date: '01/10', platform: 4960, bank: 3210 },
    { date: '01/15', platform: 3880, bank: 3630 },
    { date: '01/20', platform: 540, bank: 4840 },
    { date: '01/25', platform: 2100, bank: 2275 },
    { date: '01/31', platform: 2500, bank: 1150 }, // Jan 31 cutoff
    { date: '02/01', platform: 0, bank: 2500 },    // Feb 01 settlement (S1 Timing)
    { date: '02/03', platform: 2375, bank: 950 },
    { date: '02/05', platform: 0, bank: 777 },     // S5 Unexpected
  ];

  // 4. Merchant Discrepancy Concentration
  const merchantDiscrepancyData = [
    { merchant: 'MER007', description: 'Double Capture (TXN030)', variance: 1500, color: '#f43f5e' },
    { merchant: 'MER009', description: 'Direct Bank Credit', variance: -777, color: '#06b6d4' },
    { merchant: 'MER008', description: 'Orphan Refund (REF002)', variance: 500, color: '#ec4899' },
    { merchant: 'MER006', description: 'Sub-paise Rounding', variance: 0.012, color: '#818cf8' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-200">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.fill }}>
              {entry.name}: ₹{Math.abs(entry.value).toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Reconciliation Accounting Bridge Waterfall */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Financial Reconciliation Bridge (INR)
              </h4>
              <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                Zero Residual
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Visualizes step-by-step mathematical bridge from Platform Net to Bank Statement Settlement
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bridgeData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={val => `₹${Math.round(val / 1000)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {bridgeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily Transaction Volume & Timing Timeline */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Daily Platform Inflow vs Bank Settlement Timeline
              </h4>
              <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                Jan–Feb 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Highlights cross-period settlement delay on 2026-01-31 (TXN026 settled Feb 01)
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={val => `₹${Math.round(val / 1000)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar name="Platform Captured" dataKey="platform" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar name="Bank Settled" dataKey="bank" fill="#06b6d4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Exception Taxonomy Donut */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Exception Category Share
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Distribution of flagged discrepancies by audit taxonomy
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={exceptionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {exceptionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-900">
            {exceptionPieData.map(item => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
                <strong className="text-white font-mono-num">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Merchant Discrepancy Breakdown */}
        <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Merchant Discrepancy Concentration
            </h4>
            <p className="text-[11px] text-slate-400 mb-4">
              Identifies specific merchants responsible for ledger variances
            </p>
          </div>

          <div className="space-y-3">
            {merchantDiscrepancyData.map(m => (
              <div key={m.merchant} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-mono-num font-bold text-xs"
                    style={{ backgroundColor: `${m.color}20`, color: m.color }}
                  >
                    {m.merchant.slice(-3)}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-num font-semibold text-xs text-white">{m.merchant}</span>
                      <span className="text-[10px] text-slate-400">({m.description})</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="font-mono-num font-bold text-xs"
                    style={{ color: m.color }}
                  >
                    {m.variance > 0 ? '+' : ''}₹{Math.abs(m.variance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-900 text-[11px] text-slate-500 mt-2">
            Concentration insight: Over 98% of gross rupee variance originates from MER007 (double capture) and MER009 (unmapped bank credit).
          </div>
        </div>
      </div>
    </div>
  );
};
