import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  FileText,
  Building2,
  CheckCircle2,
  Copy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PlatformTransaction, BankTransaction } from '../types';
import { downloadCsv } from '../utils/csvParser';

interface TransactionsViewProps {
  platformRecords: PlatformTransaction[];
  bankRecords: BankTransaction[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  platformRecords,
  bankRecords,
}) => {
  const [activeTab, setActiveTab] = useState<'platform' | 'bank'>('platform');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterMerchant, setFilterMerchant] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDuplicate, setFilterDuplicate] = useState<boolean>(false);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Extract unique merchants
  const platformMerchants = useMemo(
    () => Array.from(new Set(platformRecords.map(r => r.Merchant_ID))).filter(Boolean).sort(),
    [platformRecords]
  );
  const bankMerchants = useMemo(
    () => Array.from(new Set(bankRecords.map(r => r.Merchant_ID))).filter(Boolean).sort() as string[],
    [bankRecords]
  );
  const activeMerchants = activeTab === 'platform' ? platformMerchants : bankMerchants;

  // Filter & Sort Platform records
  const filteredPlatform = useMemo(() => {
    let result = platformRecords.filter(item => {
      const matchesSearch =
        item.Transaction_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Merchant_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.Original_Transaction_ID &&
          item.Original_Transaction_ID.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === 'ALL' || item.Transaction_Type === filterType;
      const matchesMerchant = filterMerchant === 'ALL' || item.Merchant_ID === filterMerchant;
      const matchesStatus = filterStatus === 'ALL' || item.Status === filterStatus;
      const matchesDuplicate = !filterDuplicate || item.isDuplicate;

      return matchesSearch && matchesType && matchesMerchant && matchesStatus && matchesDuplicate;
    });

    result.sort((a, b) => {
      let valA: any = a[sortField === 'date' ? 'Transaction_Date' : sortField === 'amount' ? 'Amount_INR' : 'Transaction_ID'];
      let valB: any = b[sortField === 'date' ? 'Transaction_Date' : sortField === 'amount' ? 'Amount_INR' : 'Transaction_ID'];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [platformRecords, searchQuery, filterType, filterMerchant, filterStatus, filterDuplicate, sortField, sortDirection]);

  // Filter & Sort Bank records
  const filteredBank = useMemo(() => {
    let result = bankRecords.filter(item => {
      const matchesSearch =
        item.Bank_Reference_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.Transaction_ID && item.Transaction_ID.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.Merchant_ID && item.Merchant_ID.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === 'ALL' || item.Transaction_Type === filterType;
      const matchesMerchant = filterMerchant === 'ALL' || item.Merchant_ID === filterMerchant;
      const matchesStatus = filterStatus === 'ALL' || item.Bank_Status === filterStatus;
      const matchesDuplicate = !filterDuplicate || item.isDuplicate;

      return matchesSearch && matchesType && matchesMerchant && matchesStatus && matchesDuplicate;
    });

    result.sort((a, b) => {
      let valA: any = a[sortField === 'date' ? 'Settlement_Date' : sortField === 'amount' ? 'Amount_INR' : 'Bank_Reference_ID'];
      let valB: any = b[sortField === 'date' ? 'Settlement_Date' : sortField === 'amount' ? 'Amount_INR' : 'Bank_Reference_ID'];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [bankRecords, searchQuery, filterType, filterMerchant, filterStatus, filterDuplicate, sortField, sortDirection]);

  const activeRecords = activeTab === 'platform' ? filteredPlatform : filteredBank;
  const totalPages = Math.ceil(activeRecords.length / pageSize) || 1;
  const paginatedRecords = activeRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    if (activeTab === 'platform') {
      downloadCsv('platform_transactions_export.csv', filteredPlatform);
    } else {
      downloadCsv('bank_transactions_export.csv', filteredBank);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tab Switcher & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveTab('platform');
              setCurrentPage(1);
            }}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'platform'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Platform Transactions</span>
            <span
              className={`text-[10px] font-mono-num px-2 py-0.5 rounded-full ${
                activeTab === 'platform' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {platformRecords.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('bank');
              setCurrentPage(1);
            }}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'bank'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Bank Transactions</span>
            <span
              className={`text-[10px] font-mono-num px-2 py-0.5 rounded-full ${
                activeTab === 'bank' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {bankRecords.length}
            </span>
          </button>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Filtered CSV ({activeRecords.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'platform' ? 'Txn ID, Merchant, Original ID...' : 'Bank Ref, Txn ID, Merchant...'}`}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={e => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="REFUND">REFUND</option>
            </select>
          </div>

          {/* Merchant Filter */}
          <div className="relative">
            <select
              value={filterMerchant}
              onChange={e => {
                setFilterMerchant(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Merchants</option>
              {activeMerchants.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {activeTab === 'platform' ? (
                <>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                  <option value="PENDING">PENDING</option>
                </>
              ) : (
                <>
                  <option value="SETTLED">SETTLED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REVERSED">REVERSED</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterDuplicate}
                onChange={e => {
                  setFilterDuplicate(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className={filterDuplicate ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                Show Duplicates Only
              </span>
            </label>
            <span>•</span>
            <span>
              Showing <strong>{activeRecords.length}</strong> matching records (Preserving raw source values)
            </span>
          </div>

          {(searchQuery || filterType !== 'ALL' || filterMerchant !== 'ALL' || filterStatus !== 'ALL' || filterDuplicate) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('ALL');
                setFilterMerchant('ALL');
                setFilterStatus('ALL');
                setFilterDuplicate(false);
                setCurrentPage(1);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'platform' ? (
            /* PLATFORM TABLE */
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th
                    onClick={() => handleSort('Transaction_ID')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Transaction ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Transaction Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Merchant ID</th>
                  <th
                    onClick={() => handleSort('amount')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Amount (INR)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Original TXN ID</th>
                  <th className="py-3 px-4 text-center">Duplicate Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No platform transactions match the current filter.
                    </td>
                  </tr>
                ) : (
                  (paginatedRecords as PlatformTransaction[]).map((r, i) => (
                    <tr
                      key={r.id || i}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        r.isDuplicate ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono-num font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{r.Transaction_ID}</span>
                        {r.isDuplicate && (
                          <span
                            title="Duplicate Transaction ID in platform source data"
                            className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30"
                          >
                            DUP
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono-num text-slate-400">{r.Transaction_Date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            r.Transaction_Type === 'REFUND'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {r.Transaction_Type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-num text-slate-300">{r.Merchant_ID}</td>
                      <td className="py-3 px-4 text-right font-mono-num font-semibold text-slate-100">
                        ₹{r.Amount_INR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        {r.rawAmount.includes('.') && r.rawAmount.split('.')[1].length > 2 && (
                          <span
                            title={`Exact raw source string: ${r.rawAmount}`}
                            className="ml-1 text-[10px] text-amber-400 underline decoration-dotted"
                          >
                            ({r.rawAmount})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{r.Currency}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {r.Status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-num text-slate-400">
                        {r.Original_Transaction_ID ? (
                          <span className="text-amber-400">{r.Original_Transaction_ID}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {r.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" /> Duplicate
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500/50" /> Unique
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* BANK TABLE */
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th
                    onClick={() => handleSort('Bank_Reference_ID')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Bank Reference ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th
                    onClick={() => handleSort('date')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Settlement Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Merchant ID</th>
                  <th
                    onClick={() => handleSort('amount')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Amount (INR)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4">Settlement Status</th>
                  <th className="py-3 px-4 text-center">Duplicate Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No bank transactions match the current filter.
                    </td>
                  </tr>
                ) : (
                  (paginatedRecords as BankTransaction[]).map((r, i) => (
                    <tr
                      key={r.id || i}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        r.isDuplicate ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono-num font-semibold text-cyan-300">
                        {r.Bank_Reference_ID}
                      </td>
                      <td className="py-3 px-4 font-mono-num text-slate-200">
                        {r.Transaction_ID || <span className="text-amber-400 italic">None (Bank Only)</span>}
                      </td>
                      <td className="py-3 px-4 font-mono-num text-slate-400">{r.Settlement_Date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            r.Transaction_Type === 'REFUND'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {r.Transaction_Type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-num text-slate-300">
                        {r.Merchant_ID || <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-num font-semibold text-slate-100">
                        ₹{r.Amount_INR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{r.Currency}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {r.Bank_Status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {r.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" /> Duplicate
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500/50" /> Unique
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
