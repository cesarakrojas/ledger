import React, { useState, useMemo, useCallback } from 'react';
import type { Transaction, DebtEntry } from '../types';
import { ArrowUpIcon, ArrowDownIcon, ChartBarIcon } from './icons';
import { formatCurrency, formatTime } from '../utils/formatters';
import { CARD_STYLES, LIST_ITEM_INTERACTIVE } from '../utils/styleConstants';
import { TEXT_PAGE_TITLE, TEXT_SECTION_HEADER, INPUT_DATE_CLASSES, TRANSITION_COLORS } from '../utils/constants';

interface ReportsViewProps {
  transactions: Transaction[];
  debts: DebtEntry[];
  currencyCode: string;
}

type TransactionFilter = 'all' | 'inflow' | 'outflow';

export const ReportsView: React.FC<ReportsViewProps> = ({ transactions, debts: _debts, currencyCode }) => {
  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>('all');
  const [hasGenerated, setHasGenerated] = useState(false);

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(t => t.timestamp >= startDate);
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => t.timestamp <= endOfDay.toISOString());
    }

    // Filter by type
    if (transactionFilter !== 'all') {
      filtered = filtered.filter(t => t.type === transactionFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(term) ||
        t.category?.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, startDate, endDate, transactionFilter, searchTerm]);

  // Calculate stats from filtered transactions
  const stats = useMemo(() => {
    const inflows = filteredTransactions.filter(t => t.type === 'inflow');
    const outflows = filteredTransactions.filter(t => t.type === 'outflow');
    
    const totalInflows = inflows.reduce((sum, t) => sum + t.amount, 0);
    const totalOutflows = outflows.reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalInflows - totalOutflows;
    const profitMargin = totalInflows > 0 ? ((netBalance / totalInflows) * 100) : 0;
    const avgInflow = inflows.length > 0 ? totalInflows / inflows.length : 0;
    
    return {
      totalInflows,
      totalOutflows,
      netBalance,
      profitMargin,
      avgInflow,
      inflowCount: inflows.length,
      outflowCount: outflows.length,
      totalCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Clear all filters
  const handleClear = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setTransactionFilter('all');
    setHasGenerated(false);
  }, []);

  // Generate report
  const handleGenerate = useCallback(() => {
    setHasGenerated(true);
  }, []);

  const filterButtonClass = (isActive: boolean) =>
    `flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 ${TRANSITION_COLORS} ${
      isActive
        ? 'bg-slate-700 dark:bg-slate-600 text-white'
        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
    }`;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header with Filters */}
      <div className={CARD_STYLES}>
        <h2 className={`${TEXT_PAGE_TITLE} mb-6`}>Reportes</h2>
        
        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Fecha Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={INPUT_DATE_CLASSES}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Fecha Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={INPUT_DATE_CLASSES}
            />
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            Buscar Descripción
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descripción..."
            className={INPUT_DATE_CLASSES}
          />
        </div>

        {/* Transaction Type Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            Tipo de Transacción
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setTransactionFilter('all')}
              className={filterButtonClass(transactionFilter === 'all')}
            >
              Todas
            </button>
            <button
              onClick={() => setTransactionFilter('inflow')}
              className={filterButtonClass(transactionFilter === 'inflow')}
            >
              <ArrowUpIcon className="w-4 h-4" />
              Ingresos
            </button>
            <button
              onClick={() => setTransactionFilter('outflow')}
              className={filterButtonClass(transactionFilter === 'outflow')}
            >
              <ArrowDownIcon className="w-4 h-4" />
              Gastos
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleGenerate}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/30 transition-colors"
          >
            <ChartBarIcon className="w-5 h-5" />
            Generar
          </button>
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/30 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Summary KPI Cards - Only shown after clicking Generar */}
      {hasGenerated && (
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
      )}

      {/* Transactions List - Only shown after clicking Generar */}
      {hasGenerated && filteredTransactions.length > 0 && (
        <div className={CARD_STYLES}>
          <h3 className={`${TEXT_SECTION_HEADER} mb-4`}>
            Transacciones ({filteredTransactions.length})
          </h3>
          <ul className="divide-y divide-slate-200 dark:divide-slate-700 -mx-2 max-h-96 overflow-y-auto">
            {filteredTransactions.map((transaction) => {
              const is_inflow = transaction.type === 'inflow';
              return (
                <li
                  key={transaction.id}
                  className={LIST_ITEM_INTERACTIVE}
                >
                  {/* LEFT SIDE: Description & Icon */}
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-full shrink-0 ${
                        is_inflow
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {is_inflow ? (
                        <ArrowUpIcon className="w-5 h-5" />
                      ) : (
                        <ArrowDownIcon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="whitespace-nowrap">{formatTime(transaction.timestamp)}</span>
                        {transaction.category && (
                          <>
                            <span>•</span>
                            <span className="italic truncate text-slate-400 dark:text-slate-500">
                              {transaction.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE: Amount */}
                  <div className={`shrink-0 font-bold text-lg whitespace-nowrap text-right ${
                      is_inflow 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    <span>{is_inflow ? '+' : '-'}</span>
                    <span className="ml-1">
                      {formatCurrency(transaction.amount, currencyCode)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Empty State - Only show after generating if no results */}
      {hasGenerated && filteredTransactions.length === 0 && (
        <div className={`${CARD_STYLES} text-center py-12`}>
          <ChartBarIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
            No se encontraron transacciones
          </h3>
          <p className="text-slate-500 dark:text-slate-500">
            Ajusta los filtros para ver resultados diferentes
          </p>
        </div>
      )}
    </div>
  );
};
