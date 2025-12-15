import React from 'react';
import type { Transaction } from '../../SharedDefs';
import { CARD_STYLES, BTN_HEADER_INFLOW, BTN_HEADER_OUTFLOW, TEXT_PAGE_TITLE, TEXT_VALUE_XL, formatCurrency } from '../../SharedDefs';
import { ArrowUpIcon, ArrowDownIcon, TransactionItem } from '../../UIComponents';

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

export interface HomeViewProps {
  transactions: Transaction[];
  currencyCode: string;
  totalInflows: number;
  totalOutflows: number;
  inflowCount: number;
  outflowCount: number;
  onTransactionClick: (transactionId: string) => void;
  onNewInflow: () => void;
  onNewExpense: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  transactions,
  currencyCode,
  totalInflows,
  totalOutflows,
  inflowCount,
  outflowCount,
  onTransactionClick,
  onNewInflow,
  onNewExpense,
}) => {
  return (
    <div className="w-full space-y-6">
      <div className={CARD_STYLES}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* MODIFIED: Title + Date + Search Icon Container */}
          <div className="flex w-full sm:w-auto justify-between items-center sm:gap-8">
            
            {/* Text Block */}
            <div>
              <h2 className={TEXT_PAGE_TITLE}>Transacciones</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded mr-2">HOY</span>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
              </p>
            </div>

            {/* NEW: Search Icon - Centered vertically relative to the text block */}
            {/* Updated Search Icon: Darker in Light Mode, Lighter in Dark Mode */}
            <button className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <SearchIcon className="w-6 h-6" />
            </button>
            
          </div>

          {/* Action Buttons (Ingreso/Gasto) */}
          <div className="w-full sm:w-auto grid grid-cols-2 gap-2">
            <button onClick={onNewInflow} className={BTN_HEADER_INFLOW}>
              <ArrowUpIcon className="w-5 h-5"/> Ingreso
            </button>
            <button onClick={onNewExpense} className={BTN_HEADER_OUTFLOW}>
              <ArrowDownIcon className="w-5 h-5"/> Gasto
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Ingresos</p>
            <p className={`${TEXT_VALUE_XL} text-emerald-700 dark:text-emerald-300`}>{formatCurrency(totalInflows, currencyCode)}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
              {inflowCount} transacción{inflowCount !== 1 ? 'es' : ''}
            </p>
          </div>
          <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Gastos</p>
            <p className={`${TEXT_VALUE_XL} text-red-700 dark:text-red-300`}>{formatCurrency(totalOutflows, currencyCode)}</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
              {outflowCount} transacción{outflowCount !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>
        
        {/* List Section */}
        <div>
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <p>No hay transacciones de hoy.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700 -mx-2">
                {transactions.map(t => (
                  <TransactionItem 
                    key={t.id} 
                    transaction={t}
                    currencyCode={currencyCode}
                    onClick={() => onTransactionClick(t.id)}
                  />
                ))}
              </ul>
            )}
          </div>
      </div>
    </div>
  );
};