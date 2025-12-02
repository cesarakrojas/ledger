import React, { useState, useMemo } from 'react';
import type { Transaction, DebtEntry } from '../types';
import { CARD_STYLES } from '../utils/styleConstants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ChartBarIcon, ArrowUpIcon, ArrowDownIcon, CalendarIcon } from './icons';

interface ReportsViewProps {
  transactions: Transaction[];
  debts: DebtEntry[];
}

type DateRange = 'today' | 'week' | 'month' | 'year' | 'all';
type ReportTab = 'transactions' | 'categories' | 'debts';

export const ReportsView: React.FC<ReportsViewProps> = ({ transactions, debts }) => {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [activeTab, setActiveTab] = useState<ReportTab>('transactions');

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate: Date;
    
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
      case 'year':
        startDate = new Date(startOfDay);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
      default:
        return transactions;
    }
    
    return transactions.filter(t => new Date(t.timestamp) >= startDate);
  }, [transactions, dateRange]);

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

  const dateRangeLabels: Record<DateRange, string> = {
    today: 'Hoy',
    week: 'Última semana',
    month: 'Último mes',
    year: 'Último año',
    all: 'Todo el tiempo'
  };

  const tabLabels: Record<ReportTab, string> = {
    transactions: 'Transacciones',
    categories: 'Categorías',
    debts: 'Deudas'
  };

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
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Análisis financiero de tu negocio
            </p>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm font-medium border-0 focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(dateRangeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1">
          {(Object.keys(tabLabels) as ReportTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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


      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <>
          {/* Daily Breakdown */}
          <div className={CARD_STYLES}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Movimientos por Día</h3>
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
                          +{formatCurrency(day.inflows)}
                        </p>
                      )}
                      {day.outflows > 0 && (
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(day.outflows)}
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
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Transacciones Destacadas</h3>
            <div className="space-y-4">
              {stats.largestInflow.id && (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Mayor Ingreso</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{stats.largestInflow.description}</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency(stats.largestInflow.amount)}
                  </p>
                </div>
              )}
              {stats.largestOutflow.id && (
                <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Mayor Gasto</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{stats.largestOutflow.description}</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                    {formatCurrency(stats.largestOutflow.amount)}
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
      {activeTab === 'categories' && (
        <>
          {/* Income Categories */}
          <div className={CARD_STYLES}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
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
                        {formatCurrency(cat.amount)}
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
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
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
                        {formatCurrency(cat.amount)}
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
      {activeTab === 'debts' && (
        <>
          {/* Net Position */}
          <div className={`${CARD_STYLES} !p-4`}>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Posición Neta de Deudas</p>
            <p className={`text-2xl font-bold ${debtStats.netDebtPosition >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(Math.abs(debtStats.netDebtPosition))}
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
                      {formatCurrency(debtStats.overdueReceivablesAmount)}
                    </p>
                    <p className="text-xs text-red-500">{debtStats.overdueReceivablesCount} deuda{debtStats.overdueReceivablesCount !== 1 ? 's' : ''}</p>
                  </div>
                )}
                {debtStats.overduePayablesCount > 0 && (
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Por Pagar Vencido</p>
                    <p className="text-xl font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(debtStats.overduePayablesAmount)}
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
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Principales Deudores</h3>
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
                      {formatCurrency(debtor.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Creditors */}
          {debtStats.topCreditors.length > 0 && (
            <div className={CARD_STYLES}>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Principales Acreedores</h3>
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
                      {formatCurrency(creditor.amount)}
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
      {filteredTransactions.length === 0 && activeTab !== 'debts' && (
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
