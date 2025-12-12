import React, { useState, useEffect, useCallback } from 'react';
import type { DebtEntry } from '../types';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import * as debtService from '../services/debtService';
import { CARD_STYLES, LIST_ITEM_INTERACTIVE } from '../utils/styleConstants';
import { TEXT_PAGE_TITLE, BTN_ACTION_PRIMARY } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

// Simple Search Icon Component (SVG)
const SearchIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

interface LibretaViewProps {
  onChangeView?: (mode: 'list' | 'create' | 'edit' | 'detail', debtId?: string) => void;
  currencyCode: string;
}

export const LibretaView: React.FC<LibretaViewProps> = ({ onChangeView, currencyCode }) => {
  const [debts, setDebts] = useState<DebtEntry[]>([]);
  const [stats, setStats] = useState({
    totalReceivablesPending: 0,
    totalPayablesPending: 0,
    netBalance: 0,
    overdueReceivables: 0,
    overduePayables: 0,
    totalPendingDebts: 0
  });

  const loadDebts = useCallback(() => {
    const loadedDebts = debtService.getAllDebts({});
    setDebts(loadedDebts);
    setStats(debtService.getDebtStats());
  }, []);

  useEffect(() => {
    loadDebts();

    const unsubscribe = debtService.subscribeToDebts(() => {
      loadDebts();
    });

    return unsubscribe;
  }, [loadDebts]);

  const handleCreateDebt = () => {
    if (onChangeView) onChangeView('create');
  };

  const handleViewDebt = (debtId: string) => {
    if (onChangeView) onChangeView('detail', debtId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300';
      case 'overdue': return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
      case 'pending': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300';
      default: return 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'overdue': return 'Vencido';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={CARD_STYLES}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          
          {/* Title + Search Icon Container */}
          <div className="flex w-full sm:w-auto justify-between items-center sm:gap-8">
            
            {/* Text Block */}
            <div>
              <h2 className={TEXT_PAGE_TITLE}>Libreta de Deudas</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Cuentas por cobrar y pagar
              </p>
            </div>

            {/* Search Icon */}
            <button className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <SearchIcon className="w-6 h-6" />
            </button>
            
          </div>

          {/* Action Button */}
          <button
            onClick={handleCreateDebt}
            className={BTN_ACTION_PRIMARY}
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Deuda
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          
          {/* Card 1: Por Cobrar (Receivables) */}
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">
              Por Cobrar
            </p>
            
            {/* Price Row */}
            <p className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
              {formatCurrency(stats.totalReceivablesPending, currencyCode)}
            </p>

            {stats.overdueReceivables > 0 && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {stats.overdueReceivables} vencido{stats.overdueReceivables > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Card 2: Por Pagar (Payables) */}
          <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
              Por Pagar
            </p>
            
            {/* Price Row */}
            <p className="text-2xl font-bold tracking-tight text-red-700 dark:text-red-300">
              {formatCurrency(stats.totalPayablesPending, currencyCode)}
            </p>

            {stats.overduePayables > 0 && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {stats.overduePayables} vencido{stats.overduePayables > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>
        {debts.length === 0 ? (
          /* Empty State */
          <div>
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No hay deudas registradas</h3>
            <button
              onClick={handleCreateDebt}
              className="mt-4 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Registrar tu primera deuda
            </button>
          </div>
        ) : (
          /* List Items */
          <ul className="divide-y divide-slate-200 dark:divide-slate-700 -mx-2">
            {debts.map((debt) => (
              <li
                key={debt.id}
                onClick={() => handleViewDebt(debt.id)}
                className={LIST_ITEM_INTERACTIVE}
              >
                {/* MAIN FLEX CONTAINER: Vertically centered */}
                <div className="flex items-center justify-between gap-4 w-full">
                  
                  {/* LEFT SIDE: min-w-0 prevents text from pushing the price off screen */}
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    
                    {/* ICON */}
                    <div
                      className={`p-3 rounded-xl shrink-0 ${
                        debt.type === 'receivable'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {debt.type === 'receivable' ? (
                        <ArrowUpIcon className="w-6 h-6" />
                      ) : (
                        <ArrowDownIcon className="w-6 h-6" />
                      )}
                    </div>

                    {/* TEXT CONTENT */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {debt.counterparty}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-1">
                        {debt.description}
                      </p>

                      {/* COMPACT TAGS & DATE ROW */}
                      <div className="flex items-center gap-3 mt-1.5">
                        {/* Badge */}
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md ${getStatusColor(debt.status)}`}>
                          {getStatusLabel(debt.status)}
                        </span>
                        
                        {/* Category (Optional - hidden on small screens if needed) */}
                        {debt.category && (
                          <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-600">
                             {debt.category}
                          </span>
                        )}

                        {/* Date - Short format */}
                        <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                          <svg className="h-3.5 w-3.5 mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="whitespace-nowrap">
                             {new Date(debt.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE: PRICE - shrink-0 ensures it stays visible */}
                  <div className="flex flex-col items-end shrink-0 ml-2">
                    <p className={`text-xl sm:text-2xl font-bold whitespace-nowrap ${
                        debt.type === 'receivable'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                        {formatCurrency(debt.amount, currencyCode)}
                    </p>
                    <span className="text-xs text-slate-400 font-medium">
                        {debt.type === 'receivable' ? 'Por cobrar' : 'Por pagar'}
                    </span>
                  </div>
                  
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
