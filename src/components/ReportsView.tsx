import React, { useState, useMemo } from 'react';
import type { Transaction, DebtEntry } from '../types';
import { CARD_STYLES, CARD_FORM } from '../utils/styleConstants';
import { INPUT_DATE_CLASSES, TEXT_PAGE_TITLE_RESPONSIVE, TEXT_SECTION_HEADER, TRANSITION_COLORS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ChartBarIcon, ArrowUpIcon, ArrowDownIcon, CalendarIcon, XMarkIcon } from './icons';

interface ReportsViewProps {
  transactions: Transaction[];
  debts: DebtEntry[];
  currencyCode: string;
}

type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';
type ReportTab = 'transactions' | 'categories' | 'debts';

interface CustomDateRange {
  startDate: string;
  endDate: string;
}

// Custom Date Range Picker Component - Single button that triggers parent view change
interface DateRangeSelectorProps {
  dateRange: DateRange;
  customRange: CustomDateRange;
  onOpenSelector: () => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  customRange,
  onOpenSelector,
}) => {
  const presetRanges: { key: DateRange; label: string }[] = [
    { key: 'today', label: 'Hoy' },
    { key: 'week', label: 'Última semana' },
    { key: 'month', label: 'Último mes' },
    { key: 'quarter', label: 'Último trimestre' },
    { key: 'year', label: 'Último año' },
    { key: 'all', label: 'Todo el tiempo' },
  ];

  const getDisplayLabel = (): string => {
    if (dateRange === 'custom') {
      const start = new Date(customRange.startDate);
      const end = new Date(customRange.endDate);
      return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
    }
    return presetRanges.find(r => r.key === dateRange)?.label || 'Período';
  };

  return (
    <button
      onClick={onOpenSelector}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all border focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
    >
      <CalendarIcon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate max-w-[140px]">{getDisplayLabel()}</span>
      <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

// Period Selection View - Rendered as a full card view like FormViewWrapper
interface PeriodSelectorViewProps {
  dateRange: DateRange;
  customRange: CustomDateRange;
  onDateRangeChange: (range: DateRange) => void;
  onCustomRangeChange: (range: CustomDateRange) => void;
  onClose: () => void;
}

const PeriodSelectorView: React.FC<PeriodSelectorViewProps> = ({
  dateRange,
  customRange,
  onDateRangeChange,
  onCustomRangeChange,
  onClose,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(customRange.startDate);
  const [tempEndDate, setTempEndDate] = useState(customRange.endDate);

  const presetRanges: { key: DateRange; label: string; icon: string }[] = [
    { key: 'today', label: 'Hoy', icon: '📅' },
    { key: 'week', label: 'Última semana', icon: '📆' },
    { key: 'month', label: 'Último mes', icon: '🗓️' },
    { key: 'quarter', label: 'Último trimestre', icon: '📊' },
    { key: 'year', label: 'Último año', icon: '📈' },
    { key: 'all', label: 'Todo el tiempo', icon: '♾️' },
  ];

  const today = new Date().toISOString().split('T')[0];

  const handlePresetClick = (range: DateRange) => {
    if (range === 'custom') {
      setShowCustomPicker(true);
    } else {
      onDateRangeChange(range);
      onClose();
    }
  };

  const handleCustomApply = () => {
    if (tempStartDate && tempEndDate) {
      onCustomRangeChange({ startDate: tempStartDate, endDate: tempEndDate });
      onDateRangeChange('custom');
      onClose();
    }
  };

  // Custom date picker view
  if (showCustomPicker) {
    return (
      <div className="w-full h-full mx-auto animate-fade-in flex items-stretch p-2 sm:p-4">
        <div className={`w-full max-w-lg mx-auto flex flex-col min-h-[400px] ${CARD_FORM}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCustomPicker(false)}
                className={`p-1.5 -ml-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`}
                aria-label="Volver"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className={TEXT_PAGE_TITLE_RESPONSIVE}>
                Rango Personalizado
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`}
              aria-label="Cerrar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  max={tempEndDate || today}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className={INPUT_DATE_CLASSES}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  min={tempStartDate}
                  max={today}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className={INPUT_DATE_CLASSES}
                />
              </div>

              {/* Preview */}
              {tempStartDate && tempEndDate && (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 text-center">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Período seleccionado</p>
                  <p className="text-base font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                    {new Date(tempStartDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400 my-1">hasta</p>
                  <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                    {new Date(tempEndDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Apply Button */}
          <div className="flex-shrink-0 p-4 pt-2">
            <button
              onClick={handleCustomApply}
              disabled={!tempStartDate || !tempEndDate}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white disabled:text-slate-500 font-bold rounded-xl transition-colors shadow-lg"
            >
              Aplicar rango
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main period selection view
  return (
    <div className="w-full h-full mx-auto animate-fade-in flex items-stretch p-2 sm:p-4">
      <div className={`w-full max-w-lg mx-auto flex flex-col min-h-[400px] ${CARD_FORM}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
          <h2 className={`${TEXT_PAGE_TITLE_RESPONSIVE} flex items-center gap-3`}>
            <CalendarIcon className="w-6 h-6 text-emerald-600" />
            Seleccionar Período
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`}
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto px-4 min-h-0">
          <div className="space-y-2 py-2">
            {presetRanges.map((range) => (
              <button
                key={range.key}
                onClick={() => handlePresetClick(range.key)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                  dateRange === range.key && dateRange !== 'custom'
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium border-2 border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-transparent'
                }`}
              >
                <span className="text-2xl">{range.icon}</span>
                <span className="flex-1 text-base">{range.label}</span>
                {dateRange === range.key && dateRange !== 'custom' && (
                  <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}

            {/* Divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">o</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            </div>

            {/* Custom Option */}
            <button
              onClick={() => handlePresetClick('custom')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                dateRange === 'custom'
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium border-2 border-emerald-500'
                  : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-transparent'
              }`}
            >
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <span className="text-base block">Personalizado...</span>
                {dateRange === 'custom' && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    {new Date(customRange.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(customRange.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
              {dateRange === 'custom' ? (
                <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="flex-shrink-0 h-4" />
      </div>
    </div>
  );
};

// Period comparison badge component
const PeriodBadge: React.FC<{ dateRange: DateRange; customRange: CustomDateRange }> = ({ dateRange, customRange }) => {
  const getPeriodDays = (): number => {
    if (dateRange === 'custom') {
      const start = new Date(customRange.startDate);
      const end = new Date(customRange.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    switch (dateRange) {
      case 'today': return 1;
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 0;
    }
  };

  const days = getPeriodDays();
  if (days === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full">
      <CalendarIcon className="w-3 h-3" />
      {days} {days === 1 ? 'día' : 'días'}
    </span>
  );
};

export const ReportsView: React.FC<ReportsViewProps> = ({ transactions, debts, currencyCode }) => {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [activeTab, setActiveTab] = useState<ReportTab>('transactions');
  const [isLoading, setIsLoading] = useState(false);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [customRange, setCustomRange] = useState<CustomDateRange>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  });

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate: Date;
    let endDate: Date = now;
    
    if (dateRange === 'custom') {
      startDate = new Date(customRange.startDate);
      endDate = new Date(customRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      return transactions.filter(t => {
        const transDate = new Date(t.timestamp);
        return transDate >= startDate && transDate <= endDate;
      });
    }
    
    switch (dateRange) {
      case 'today':
        startDate = startOfDay;
        break;
      case 'week':
        startDate = new Date(startOfDay);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(startOfDay);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(startOfDay);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(startOfDay);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
      default:
        return transactions;
    }
    
    return transactions.filter(t => new Date(t.timestamp) >= startDate);
  }, [transactions, dateRange, customRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const inflows = filteredTransactions.filter(t => t.type === 'inflow');
    const outflows = filteredTransactions.filter(t => t.type === 'outflow');
    
    const totalInflows = inflows.reduce((sum, t) => sum + t.amount, 0);
    const totalOutflows = outflows.reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalInflows - totalOutflows;
    
    // Average transaction values
    const avgInflow = inflows.length > 0 ? totalInflows / inflows.length : 0;
    const avgOutflow = outflows.length > 0 ? totalOutflows / outflows.length : 0;
    
    // Find largest transactions
    const largestInflow = inflows.reduce((max, t) => t.amount > max.amount ? t : max, { amount: 0 } as Transaction);
    const largestOutflow = outflows.reduce((max, t) => t.amount > max.amount ? t : max, { amount: 0 } as Transaction);
    
    return {
      totalInflows,
      totalOutflows,
      netBalance,
      transactionCount: filteredTransactions.length,
      inflowCount: inflows.length,
      outflowCount: outflows.length,
      avgInflow,
      avgOutflow,
      largestInflow,
      largestOutflow,
      profitMargin: totalInflows > 0 ? ((netBalance / totalInflows) * 100) : 0
    };
  }, [filteredTransactions]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const inflowCategories: Record<string, number> = {};
    const outflowCategories: Record<string, number> = {};
    
    filteredTransactions.forEach(t => {
      const category = t.category || 'Sin categoría';
      if (t.type === 'inflow') {
        inflowCategories[category] = (inflowCategories[category] || 0) + t.amount;
      } else {
        outflowCategories[category] = (outflowCategories[category] || 0) + t.amount;
      }
    });
    
    // Sort by amount descending
    const sortedInflows = Object.entries(inflowCategories)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount, percentage: stats.totalInflows > 0 ? (amount / stats.totalInflows) * 100 : 0 }));
    
    const sortedOutflows = Object.entries(outflowCategories)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount, percentage: stats.totalOutflows > 0 ? (amount / stats.totalOutflows) * 100 : 0 }));
    
    return { inflows: sortedInflows, outflows: sortedOutflows };
  }, [filteredTransactions, stats.totalInflows, stats.totalOutflows]);

  // Debt statistics
  const debtStats = useMemo(() => {
    const pendingReceivables = debts.filter(d => d.type === 'receivable' && d.status !== 'paid');
    const pendingPayables = debts.filter(d => d.type === 'payable' && d.status !== 'paid');
    const overdueReceivables = pendingReceivables.filter(d => d.status === 'overdue');
    const overduePayables = pendingPayables.filter(d => d.status === 'overdue');
    
    const totalReceivables = pendingReceivables.reduce((sum, d) => sum + d.amount, 0);
    const totalPayables = pendingPayables.reduce((sum, d) => sum + d.amount, 0);
    const overdueReceivablesAmount = overdueReceivables.reduce((sum, d) => sum + d.amount, 0);
    const overduePayablesAmount = overduePayables.reduce((sum, d) => sum + d.amount, 0);
    
    // Group by counterparty
    const receivablesByClient: Record<string, number> = {};
    const payablesBySupplier: Record<string, number> = {};
    
    pendingReceivables.forEach(d => {
      receivablesByClient[d.counterparty] = (receivablesByClient[d.counterparty] || 0) + d.amount;
    });
    
    pendingPayables.forEach(d => {
      payablesBySupplier[d.counterparty] = (payablesBySupplier[d.counterparty] || 0) + d.amount;
    });
    
    const topDebtors = Object.entries(receivablesByClient)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));
    
    const topCreditors = Object.entries(payablesBySupplier)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));
    
    return {
      totalReceivables,
      totalPayables,
      netDebtPosition: totalReceivables - totalPayables,
      pendingReceivablesCount: pendingReceivables.length,
      pendingPayablesCount: pendingPayables.length,
      overdueReceivablesCount: overdueReceivables.length,
      overduePayablesCount: overduePayables.length,
      overdueReceivablesAmount,
      overduePayablesAmount,
      topDebtors,
      topCreditors
    };
  }, [debts]);

  // Daily breakdown for trend analysis
  const dailyBreakdown = useMemo(() => {
    const days: Record<string, { inflows: number; outflows: number }> = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.timestamp);
      const key = date.toISOString().split('T')[0];
      
      if (!days[key]) {
        days[key] = { inflows: 0, outflows: 0 };
      }
      
      if (t.type === 'inflow') {
        days[key].inflows += t.amount;
      } else {
        days[key].outflows += t.amount;
      }
    });
    
    return Object.entries(days)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 10)
      .map(([dateKey, data]) => ({ dateKey, ...data }));
  }, [filteredTransactions]);

  const tabLabels: Record<ReportTab, string> = {
    transactions: 'Transacciones',
    categories: 'Categorías',
    debts: 'Deudas'
  };

  // Show period selector view if active (after all hooks)
  if (showPeriodSelector) {
    return (
      <PeriodSelectorView
        dateRange={dateRange}
        customRange={customRange}
        onDateRangeChange={setDateRange}
        onCustomRangeChange={setCustomRange}
        onClose={() => setShowPeriodSelector(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-4">
      {/* Header */}
      <div className={CARD_STYLES}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="w-7 h-7 text-emerald-600" />
              Reportes
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500 dark:text-slate-400">
                Análisis financiero de tu negocio
              </p>
              <PeriodBadge dateRange={dateRange} customRange={customRange} />
            </div>
          </div>
          
          {/* Date Range Selector Button */}
          <DateRangeSelector
            dateRange={dateRange}
            customRange={customRange}
            onOpenSelector={() => setShowPeriodSelector(true)}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1">
          {(Object.keys(tabLabels) as ReportTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setIsLoading(true);
                setActiveTab(tab);
                // Simulate brief loading for smoother transition
                setTimeout(() => setIsLoading(false), 150);
              }}
              aria-selected={activeTab === tab}
              role="tab"
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={CARD_STYLES}>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      )}
    
      {/* Transactions Tab */}
      {activeTab === 'transactions' && !isLoading && (
        <>
          {/* Summary KPI Cards */}
          <div className={CARD_STYLES}>
            <h3 className={`${TEXT_SECTION_HEADER} mb-4`}>Resumen del Período</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Total Inflows */}
              <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total Ingresos</p>
                </div>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(stats.totalInflows, currencyCode)}
                </p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                  {stats.inflowCount} transacción{stats.inflowCount !== 1 ? 'es' : ''}
                </p>
              </div>
              
              {/* Total Outflows */}
              <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">Total Gastos</p>
                </div>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(stats.totalOutflows, currencyCode)}
                </p>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                  {stats.outflowCount} transacción{stats.outflowCount !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
            
            {/* Balance & Margin Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Net Balance */}
              <div className={`rounded-xl p-4 ${stats.netBalance >= 0 ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
                <p className={`text-xs font-medium mb-1 ${stats.netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  Balance Neto
                </p>
                <p className={`text-xl font-bold ${stats.netBalance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
                  {stats.netBalance >= 0 ? '+' : ''}{formatCurrency(stats.netBalance, currencyCode)}
                </p>
              </div>
              
              {/* Profit Margin */}
              <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Margen</p>
                <p className={`text-xl font-bold ${stats.profitMargin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.profitMargin >= 0 ? '+' : ''}{stats.profitMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Prom. ingreso: {formatCurrency(stats.avgInflow, currencyCode)}
                </p>
              </div>
            </div>
          </div>

          {/* Trend Chart - Visual bar representation */}
          {dailyBreakdown.length > 0 && (
            <div className={CARD_STYLES}>
              <h3 className={`${TEXT_SECTION_HEADER} mb-4`}>Tendencia de Movimientos</h3>
              <div className="space-y-2">
                {dailyBreakdown.slice(0, 7).map(day => {
                  const maxValue = Math.max(...dailyBreakdown.slice(0, 7).map(d => Math.max(d.inflows, d.outflows)));
                  const inflowWidth = maxValue > 0 ? (day.inflows / maxValue) * 100 : 0;
                  const outflowWidth = maxValue > 0 ? (day.outflows / maxValue) * 100 : 0;
                  
                  return (
                    <div key={day.dateKey} className="flex items-center gap-3">
                      <div className="w-16 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                        {new Date(day.dateKey).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 space-y-1">
                        {/* Inflow bar */}
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${inflowWidth}%` }}
                          />
                        </div>
                        {/* Outflow bar */}
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${outflowWidth}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-20 text-right shrink-0">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {day.inflows > 0 ? `+${formatCurrency(day.inflows, currencyCode)}` : '-'}
                        </p>
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">
                          {day.outflows > 0 ? `-${formatCurrency(day.outflows, currencyCode)}` : '-'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Gastos</span>
                </div>
              </div>
            </div>
          )}

          {/* Daily Breakdown */}
          <div className={CARD_STYLES}>
            <h3 className={`${TEXT_SECTION_HEADER} mb-4`}>Movimientos por Día</h3>
            {dailyBreakdown.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No hay transacciones en este período
              </p>
            ) : (
              <div className="space-y-3">
                {dailyBreakdown.map(day => (
                  <div key={day.dateKey} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {formatDate(day.dateKey)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(day.dateKey).toLocaleDateString('es-ES', { weekday: 'long' })}
                      </p>
                    </div>
                    <div className="text-right">
                      {day.inflows > 0 && (
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(day.inflows, currencyCode)}
                        </p>
                      )}
                      {day.outflows > 0 && (
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(day.outflows, currencyCode)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Largest Transactions */}
          <div className={CARD_STYLES}>
            <h3 className={`${TEXT_SECTION_HEADER} mb-4`}>Transacciones Destacadas</h3>
            <div className="space-y-4">
              {stats.largestInflow.id && (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Mayor Ingreso</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{stats.largestInflow.description}</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency(stats.largestInflow.amount, currencyCode)}
                  </p>
                </div>
              )}
              {stats.largestOutflow.id && (
                <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Mayor Gasto</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{stats.largestOutflow.description}</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                    {formatCurrency(stats.largestOutflow.amount, currencyCode)}
                  </p>
                </div>
              )}
              {!stats.largestInflow.id && !stats.largestOutflow.id && (
                <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                  No hay transacciones en este período
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && !isLoading && (
        <>
          {/* Income Categories */}
          <div className={CARD_STYLES}>
            <h3 className={`${TEXT_SECTION_HEADER} mb-4 flex items-center gap-2`}>
              <ArrowUpIcon className="w-5 h-5 text-emerald-600" />
              Categorías de Ingresos
            </h3>
            {categoryStats.inflows.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">Sin ingresos en este período</p>
            ) : (
              <div className="space-y-3">
                {categoryStats.inflows.map(cat => (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(cat.amount, currencyCode)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 text-right">{cat.percentage.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense Categories */}
          <div className={CARD_STYLES}>
            <h3 className={`${TEXT_SECTION_HEADER} mb-4 flex items-center gap-2`}>
              <ArrowDownIcon className="w-5 h-5 text-red-600" />
              Categorías de Gastos
            </h3>
            {categoryStats.outflows.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">Sin gastos en este período</p>
            ) : (
              <div className="space-y-3">
                {categoryStats.outflows.map(cat => (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(cat.amount, currencyCode)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 text-right">{cat.percentage.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Debts Tab */}
      {activeTab === 'debts' && !isLoading && (
        <>
          {/* Notice about debt filtering */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium">Nota:</span> Esta sección muestra todas las deudas pendientes sin aplicar el filtro de fecha. Las deudas pagadas no se incluyen.
            </p>
          </div>

          {/* Net Position */}
          <div className={`${CARD_STYLES} !p-4`}>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Posición Neta de Deudas</p>
            <p className={`text-2xl font-bold ${debtStats.netDebtPosition >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(Math.abs(debtStats.netDebtPosition), currencyCode)}
              <span className="text-sm font-medium ml-2">
                {debtStats.netDebtPosition >= 0 ? '(a favor)' : '(en contra)'}
              </span>
            </p>
          </div>

          {/* Overdue Alerts */}
          {(debtStats.overdueReceivablesCount > 0 || debtStats.overduePayablesCount > 0) && (
            <div className={`${CARD_STYLES} bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800`}>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Deudas Vencidas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {debtStats.overdueReceivablesCount > 0 && (
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Por Cobrar Vencido</p>
                    <p className="text-xl font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(debtStats.overdueReceivablesAmount, currencyCode)}
                    </p>
                    <p className="text-xs text-red-500">{debtStats.overdueReceivablesCount} deuda{debtStats.overdueReceivablesCount !== 1 ? 's' : ''}</p>
                  </div>
                )}
                {debtStats.overduePayablesCount > 0 && (
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Por Pagar Vencido</p>
                    <p className="text-xl font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(debtStats.overduePayablesAmount, currencyCode)}
                    </p>
                    <p className="text-xs text-red-500">{debtStats.overduePayablesCount} deuda{debtStats.overduePayablesCount !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Debtors */}
          {debtStats.topDebtors.length > 0 && (
            <div className={CARD_STYLES}>
              <h3 className={`${TEXT_SECTION_HEADER} mb-3`}>Principales Deudores</h3>
              <div className="space-y-2">
                {debtStats.topDebtors.map((debtor, index) => (
                  <div key={debtor.name} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{debtor.name}</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(debtor.amount, currencyCode)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Creditors */}
          {debtStats.topCreditors.length > 0 && (
            <div className={CARD_STYLES}>
              <h3 className={`${TEXT_SECTION_HEADER} mb-3`}>Principales Acreedores</h3>
              <div className="space-y-2">
                {debtStats.topCreditors.map((creditor, index) => (
                  <div key={creditor.name} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{creditor.name}</span>
                    </div>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(creditor.amount, currencyCode)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {debtStats.totalReceivables === 0 && debtStats.totalPayables === 0 && (
            <div className={`${CARD_STYLES} text-center py-8`}>
              <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-500 dark:text-slate-400">No hay deudas pendientes</p>
            </div>
          )}
        </>
      )}

      {/* Empty State for No Data */}
      {filteredTransactions.length === 0 && activeTab !== 'debts' && !isLoading && (
        <div className={`${CARD_STYLES} text-center py-12`}>
          <ChartBarIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No hay datos para mostrar</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ajusta el rango de fechas o registra nuevas transacciones
          </p>
        </div>
      )}
    </div>
  );
};
