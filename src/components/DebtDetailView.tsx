import React from 'react';
import type { DebtEntry } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CloseIcon, CheckCircleIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import { DETAIL_VIEW_CONTAINER, DETAIL_VIEW_HEADER, DETAIL_VIEW_FOOTER, ICON_BTN_CLOSE, BTN_FOOTER_PRIMARY, BTN_FOOTER_SECONDARY, BTN_FOOTER_DANGER, ICON_BTN } from '../utils/styleConstants';

interface DebtDetailViewProps {
  debt: DebtEntry;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAsPaid: () => void;
  currencyCode?: string;
}

export const DebtDetailView: React.FC<DebtDetailViewProps> = ({
  debt,
  onClose,
  onEdit,
  onDelete,
  onMarkAsPaid,
  currencyCode
}) => {
  const isPaid = debt.status === 'paid';
  const isOverdue = debt.status === 'overdue';
  const isReceivable = debt.type === 'receivable';

  // Logic adapted strictly from LibretaView.tsx for the pill background/text color
  const getPillStatusClasses = () => {
    if (isPaid) {
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300';
    }
    if (isOverdue) {
        return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
    }
    // Pending
    return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300';
  };

  const pillClasses = getPillStatusClasses();

  const statusLabel = {
    paid: 'Pagado',
    overdue: 'Vencido',
    pending: 'Pendiente'
  }[debt.status] || debt.status;

  const typeLabel = isReceivable ? 'Por Cobrar' : 'Por Pagar';

  return (
    <div className={DETAIL_VIEW_CONTAINER}>
      
      {/* 1. HEADER */}
      <div className={DETAIL_VIEW_HEADER}>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white ml-2">Deuda</h2>
        <button 
          onClick={onClose} 
          className={ICON_BTN_CLOSE}
          aria-label="Cerrar"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container">
        
        {/* HERO SECTION: Clean & Minimal with Colored Pill */}
        <div className="bg-white dark:bg-slate-800 pb-8 pt-8 px-6 text-center shadow-sm">
          
          {/* Status Pill - Uses LibretaView colors */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3 ${pillClasses}`}>
            {/* Icons are neutral inside the colored pill for better contrast */}
            {isReceivable ? 
                <ArrowUpIcon className="w-4 h-4 opacity-80"/> : 
                <ArrowDownIcon className="w-4 h-4 opacity-80"/>
            }
            <span>{typeLabel} • {statusLabel}</span>
          </div>
          
          {/* Amount - NEUTRAL COLOR */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(debt.amount, currencyCode)}
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            {isReceivable ? 'Cliente' : 'Proveedor'}: <span className="text-slate-800 dark:text-slate-200">{debt.counterparty}</span>
          </p>
        </div>

        {/* DETAILS LIST */}
        <div className="mt-4 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4">
          
          <DetailRow label="Descripción" value={debt.description} />
          
          {/* Grouped Dates */}
          <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-700">
             <div>
                <span className="block text-xs text-slate-500 mb-1">Vencimiento</span>
                {/* Only color the overdue date text if it's actually overdue and not paid */}
                <span className={`text-sm font-bold ${isOverdue && !isPaid ? 'text-red-600' : 'text-slate-800 dark:text-white'}`}>
                  {formatDate(debt.dueDate)}
                </span>
             </div>
             <div className="text-right">
                <span className="block text-xs text-slate-500 mb-1">Creado</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{formatDate(debt.createdAt)}</span>
             </div>
          </div>

          {debt.category && (
            <DetailRow label="Categoría" value={debt.category} />
          )}

          {debt.notes && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Notas
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                "{debt.notes}"
              </p>
            </div>
          )}

          {isPaid && debt.paidAt && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="block text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                Estado
              </span>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-800 dark:text-slate-200">
                  Pagado el {formatDate(debt.paidAt)}
                </span>
              </div>
              {debt.linkedTransactionId && (
                <p className="text-xs text-slate-400 mt-1 font-mono">Ref: {debt.linkedTransactionId.slice(0,8)}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Spacer */}
        <div className="h-6 bg-slate-50 dark:bg-slate-900"></div>
      </div>

      {/* 3. COMPACT FOOTER (Action Grid) */}
      <div className={DETAIL_VIEW_FOOTER}>
        <div className={`grid gap-3 ${!isPaid ? 'grid-cols-2' : 'grid-cols-1'}`}>
          
          {/* Action Buttons */}
          {!isPaid ? (
            <>
              {/* Left Column: Edit/Delete Split */}
              <div className="flex gap-2">
                 <button
                  onClick={onEdit}
                  className={`flex-1 flex items-center justify-center p-3 ${ICON_BTN} rounded-xl`}
                  aria-label="Editar"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                 <button
                  onClick={onDelete}
                  className="flex-1 flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  aria-label="Eliminar"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Right Column: Mark Paid */}
              <button
                onClick={onMarkAsPaid}
                className={BTN_FOOTER_PRIMARY}
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>Marcar Pagado</span>
              </button>
            </>
          ) : (
            // If Paid, Show Delete and Edit side-by-side
             <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onDelete}
                  className={BTN_FOOTER_DANGER}
                >
                  <TrashIcon className="w-5 h-5" />
                  <span>Eliminar</span>
                </button>
                <button
                  onClick={onEdit} 
                  className={BTN_FOOTER_SECONDARY}
                >
                  <PencilIcon className="w-5 h-5" />
                  <span>Editar</span>
                </button>
             </div>
          )}
        </div>
      </div>

    </div>
  );
};

// Helper Component
const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-right max-w-[60%] truncate">
      {value}
    </span>
  </div>
);