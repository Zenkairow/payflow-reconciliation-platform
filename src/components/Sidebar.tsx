import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  GitCompare,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  ArrowRightLeft,
  Scale,
  Activity,
} from 'lucide-react';
import { ActiveSection } from '../types';

interface SidebarProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  exceptionCount: number;
  platformCount: number;
  bankCount: number;
  matchedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  exceptionCount,
  platformCount,
  bankCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveSection,
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'transactions' as ActiveSection,
      label: 'Transactions',
      icon: TableProperties,
      badge: `${platformCount + bankCount}`,
      badgeColor: 'bg-slate-700 text-slate-300',
    },
    {
      id: 'reconciliation' as ActiveSection,
      label: 'Reconciliation',
      icon: GitCompare,
      badge: 'Run',
      badgeColor: 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50',
    },
    {
      id: 'exceptions' as ActiveSection,
      label: 'Exceptions',
      icon: AlertTriangle,
      badge: exceptionCount > 0 ? `${exceptionCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse',
    },
    {
      id: 'financial-summary' as ActiveSection,
      label: 'Financial Summary',
      icon: Scale,
      badge: null,
    },
    {
      id: 'analytics' as ActiveSection,
      label: 'Visual Analytics',
      icon: Activity,
      badge: 'PRO',
      badgeColor: 'bg-purple-900/60 text-purple-300 border border-purple-700/50',
    },
    {
      id: 'reports' as ActiveSection,
      label: 'Reports & Export',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'settings' as ActiveSection,
      label: 'Data & Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ArrowRightLeft className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              PayFlow
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Reconciliation Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-mono-num font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-indigo-700 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Audit Readiness Card in Footer */}
      <div className="p-3 m-3 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Audit Engine Status</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
          Idempotent reconciliation engine active. Mathematical bridge verified.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
          <span>Mode: Client-side</span>
          <span className="text-emerald-400 font-medium">100% Deterministic</span>
        </div>
      </div>
    </aside>
  );
};
