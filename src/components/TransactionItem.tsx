import React from 'react';
import type { Transaction } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './icons';
import { LIST_ITEM_INTERACTIVE } from '../utils/styleConstants';
import { formatCurrency, formatTime } from '../utils/formatters';

export interface TransactionItemProps {
  transaction: Transaction;
  currencyCode: string;
  onClick?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, currencyCode, onClick }) => {
  const is_inflow = transaction.type === 'inflow';
  const isSale = transaction.category === 'Ventas';
  
  // For sales, replace "Ingreso:" prefix with "Venta:"
  const displayDescription = isSale 
    ? transaction.description.replace(/^Ingreso:/, 'Venta:') 
    : transaction.description;

  return (
    <li
      onClick={onClick}
      className={LIST_ITEM_INTERACTIVE}
    >
      {/* LEFT SIDE: Description & Icon */}
      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
        
        {/* Icon */}
        <div
          className={`p-3 rounded-xl shrink-0 ${
            is_inflow
              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
          }`}
        >
          {is_inflow ? (
            <ArrowUpIcon className="w-6 h-6" />
          ) : (
            <ArrowDownIcon className="w-6 h-6" />
          )}
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            {displayDescription}
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
            ? 'text-emerald-600 dark:text-emerald-400' 
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
};
