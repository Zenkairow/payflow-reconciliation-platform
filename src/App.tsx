import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { ReconciliationView } from './components/ReconciliationView';
import { ExceptionsView } from './components/ExceptionsView';
import { FinancialSummaryView } from './components/FinancialSummaryView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AgenticCoPilotModal } from './components/AgenticCoPilotModal';
import {
  ActiveSection,
  PlatformTransaction,
  BankTransaction,
  ReconciliationException,
  ExceptionStatus,
} from './types';
import { SEED_PLATFORM_CSV, SEED_BANK_CSV } from './data/seedData';
import { parsePlatformCsv, parseBankCsv } from './utils/csvParser';
import { runReconciliation, ReconciliationRunResult } from './services/reconciliationEngine';

export function App() {
  // Navigation State
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');

  // Datasets State
  const [platformRecords, setPlatformRecords] = useState<PlatformTransaction[]>(() => {
    return parsePlatformCsv(SEED_PLATFORM_CSV).data;
  });
  const [bankRecords, setBankRecords] = useState<BankTransaction[]>(() => {
    return parseBankCsv(SEED_BANK_CSV).data;
  });

  // Reconciliation Parameters
  const [reportingPeriod, setReportingPeriod] = useState<string>('ALL');
  const [roundingTolerance, setRoundingTolerance] = useState<number>(0.05);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Reconciliation Results State
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationRunResult>(() => {
    return runReconciliation(
      parsePlatformCsv(SEED_PLATFORM_CSV).data,
      parseBankCsv(SEED_BANK_CSV).data,
      { reportingPeriod: 'ALL', roundingTolerance: 0.05 }
    );
  });

  // Execute reconciliation engine
  const executeReconciliation = useCallback(() => {
    setIsRunning(true);
    // Brief simulation delay for smooth UX transition
    setTimeout(() => {
      const result = runReconciliation(platformRecords, bankRecords, {
        reportingPeriod,
        roundingTolerance,
      });
      setReconciliationResult(result);
      setIsRunning(false);
    }, 300);
  }, [platformRecords, bankRecords, reportingPeriod, roundingTolerance]);

  // Re-run whenever period or tolerance changes
  useEffect(() => {
    executeReconciliation();
  }, [reportingPeriod, roundingTolerance, platformRecords, bankRecords]);

  // Update exception status (e.g. mark as Resolved / Investigating)
  const handleUpdateExceptionStatus = (id: string, newStatus: ExceptionStatus, note?: string) => {
    setReconciliationResult(prev => {
      const updatedExceptions = prev.exceptions.map(e => {
        if (e.id === id) {
          return { ...e, status: newStatus };
        }
        return e;
      });
      return { ...prev, exceptions: updatedExceptions };
    });
  };

  // Reset to default seed data
  const handleResetToSeedData = () => {
    const pData = parsePlatformCsv(SEED_PLATFORM_CSV).data;
    const bData = parseBankCsv(SEED_BANK_CSV).data;
    setPlatformRecords(pData);
    setBankRecords(bData);
    setReportingPeriod('ALL');
    setRoundingTolerance(0.05);
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        exceptionCount={reconciliationResult.summary.totalExceptionCount}
        platformCount={platformRecords.length}
        bankCount={bankRecords.length}
        matchedCount={reconciliationResult.summary.matchedCount}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeSection={activeSection}
          reportingPeriod={reportingPeriod}
          setReportingPeriod={setReportingPeriod}
          onRunReconciliation={executeReconciliation}
          isRunning={isRunning}
          summary={reconciliationResult.summary}
          onOpenAiCoPilot={() => setIsAiModalOpen(true)}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {activeSection === 'dashboard' && (
            <DashboardView
              summary={reconciliationResult.summary}
              exceptions={reconciliationResult.exceptions}
              onNavigate={setActiveSection}
              onRunReconciliation={executeReconciliation}
              isRunning={isRunning}
              onOpenAiCoPilot={() => setIsAiModalOpen(true)}
            />
          )}

          {activeSection === 'transactions' && (
            <TransactionsView
              platformRecords={platformRecords}
              bankRecords={bankRecords}
            />
          )}

          {activeSection === 'reconciliation' && (
            <ReconciliationView
              platformRecords={platformRecords}
              bankRecords={bankRecords}
              summary={reconciliationResult.summary}
              reportingPeriod={reportingPeriod}
              setReportingPeriod={setReportingPeriod}
              roundingTolerance={roundingTolerance}
              setRoundingTolerance={setRoundingTolerance}
              onRunReconciliation={executeReconciliation}
              isRunning={isRunning}
              onNavigate={setActiveSection}
            />
          )}

          {activeSection === 'exceptions' && (
            <ExceptionsView
              exceptions={reconciliationResult.exceptions}
              onUpdateExceptionStatus={handleUpdateExceptionStatus}
            />
          )}

          {activeSection === 'financial-summary' && (
            <FinancialSummaryView
              summary={reconciliationResult.summary}
              onNavigate={setActiveSection}
            />
          )}

          {activeSection === 'reports' && (
            <ReportsView
              summary={reconciliationResult.summary}
              exceptions={reconciliationResult.exceptions}
              matchedPairs={reconciliationResult.matchedPairs}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsView
              onLoadCustomPlatformData={setPlatformRecords}
              onLoadCustomBankData={setBankRecords}
              onResetToSeedData={handleResetToSeedData}
              roundingTolerance={roundingTolerance}
              setRoundingTolerance={setRoundingTolerance}
              currentPlatformCount={platformRecords.length}
              currentBankCount={bankRecords.length}
            />
          )}
        </main>
      </div>

      {/* AI Financial Co-Pilot Modal */}
      <AgenticCoPilotModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        summary={reconciliationResult.summary}
        exceptions={reconciliationResult.exceptions}
      />
    </div>
  );
}

export default App;
