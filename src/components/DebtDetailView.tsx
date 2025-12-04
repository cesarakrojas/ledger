import React, { useState } from 'react';
import type { DebtEntry } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CloseIcon, CheckCircleIcon, PencilIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import { DETAIL_VIEW_CONTAINER, DETAIL_VIEW_HEADER, DETAIL_VIEW_FOOTER, ICON_BTN_CLOSE, BTN_FOOTER_PRIMARY, BTN_FOOTER_SECONDARY } from '../utils/styleConstants';
import { INPUT_BASE_CLASSES } from '../utils/constants';

interface DebtDetailViewProps {
  debt: DebtEntry;
  onClose: () => void;
  onEdit: () => void;
  onMarkAsPaid: () => void;
  onPartialPayment: (amount: number) => void;
  currencyCode?: string;
}

export const DebtDetailView: React.FC<DebtDetailViewProps> = ({
  debt,
  onClose,
  onEdit,
  onMarkAsPaid,
  onPartialPayment,
  currencyCode
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const isPaid = debt.status === 'paid';
  const isOverdue = debt.status === 'overdue';
  const isReceivable = debt.type === 'receivable';

  const handleOpenPaymentModal = () => {
    setPaymentAmount('');
    setPaymentError(null);
    setShowPaymentModal(true);
  };

  const handlePayFull = () => {
    setShowPaymentModal(false);
    onMarkAsPaid();
  };

  const handlePartialPayment = () => {
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Ingresa un monto válido');
      return;
    }
    
    if (amount > debt.amount) {
      setPaymentError('El monto no puede ser mayor al saldo');
      return;
    }
    
    setShowPaymentModal(false);
    onPartialPayment(amount);
  };

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
            </div>
          )}
        </div>

        {/* Payment History Section */}
        {debt.payments && debt.payments.length > 0 && (
          <div className="mt-4 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Historial de Abonos ({debt.payments.length})
              </h3>
              {debt.originalAmount && (
                <span className="text-xs text-slate-400">
                  Original: {formatCurrency(debt.originalAmount, currencyCode)}
                </span>
              )}
            </div>
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-700">
              {debt.payments.map((payment, index) => (
                <div key={payment.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Abono #{index + 1}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(payment.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(payment.amount, currencyCode)}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      Ref: {payment.transactionId.slice(0, 8)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Total Paid Summary */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Abonado</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(debt.payments.reduce((sum, p) => sum + p.amount, 0), currencyCode)}
              </span>
            </div>
          </div>
        )}
        
        {/* Spacer */}
        <div className="h-6 bg-slate-50 dark:bg-slate-900"></div>
      </div>

      {/* 3. COMPACT FOOTER (Action Grid) */}
      <div className={DETAIL_VIEW_FOOTER}>
        <div className="grid grid-cols-2 gap-3">
          {/* Payment Button */}
          <button
            onClick={handleOpenPaymentModal}
            disabled={isPaid}
            className={!isPaid 
              ? BTN_FOOTER_PRIMARY
              : 'flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-xl font-semibold cursor-not-allowed transition-colors'
            }
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>{isPaid ? 'Pagado' : 'Abonar'}</span>
          </button>
          
          {/* Edit Button */}
          <button
            onClick={onEdit}
            className={BTN_FOOTER_SECONDARY}
          >
            <PencilIcon className="w-5 h-5" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {isReceivable ? 'Registrar Cobro' : 'Registrar Pago'}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Current Balance */}
              <div className="text-center py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Saldo Pendiente</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {formatCurrency(debt.amount, currencyCode)}
                </p>
              </div>
              
              {/* Payment Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Monto a abonar
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={debt.amount}
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    setPaymentError(null);
                  }}
                  placeholder="0.00"
                  className={INPUT_BASE_CLASSES}
                  autoFocus
                />
                {paymentError && (
                  <p className="text-red-500 text-sm mt-1">{paymentError}</p>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-5 pt-0 space-y-3">
              {/* Partial Payment Button */}
              <button
                onClick={handlePartialPayment}
                disabled={!paymentAmount}
                className={paymentAmount 
                  ? 'w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors'
                  : 'w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-semibold rounded-xl cursor-not-allowed'
                }
              >
                Abonar Monto
              </button>
              
              {/* Pay Full Button */}
              <button
                onClick={handlePayFull}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Pagar Todo ({formatCurrency(debt.amount, currencyCode)})
              </button>
              
              {/* Cancel */}
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-2 text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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