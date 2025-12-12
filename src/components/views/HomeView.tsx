import React from 'react';
import type { Transaction } from '../../types';
import { CARD_STYLES } from '../../utils/styleConstants';
import { BTN_HEADER_INFLOW, BTN_HEADER_OUTFLOW, TEXT_PAGE_TITLE, TEXT_VALUE_XL } from '../../utils/constants';
import { ArrowUpIcon, ArrowDownIcon } from '../icons';
import { TransactionItem } from '../TransactionItem';
import { formatCurrency } from '../../utils/formatters';

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={TEXT_PAGE_TITLE}>Transacciones</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="w-full sm:w-auto grid grid-cols-2 gap-2">
            <button onClick={onNewInflow} className={BTN_HEADER_INFLOW}>
              <ArrowUpIcon className="w-5 h-5"/> Ingreso
            </button>
            <button onClick={onNewExpense} className={BTN_HEADER_OUTFLOW}>
              <ArrowDownIcon className="w-5 h-5"/> Gasto
            </button>
          </div>
        </div>
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
