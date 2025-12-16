/**
 * modals/ConfirmationModal.tsx - Confirmation Dialog Modal
 * 
 * Replaces native browser confirm() dialogs with a styled, consistent modal.
 * Supports customizable title, message, and action buttons.
 */

import React from 'react';
import { ExclamationCircleIcon, XMarkIcon } from '../icons';

export interface ConfirmationModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when modal is closed/cancelled */
  onClose: () => void;
  /** Callback when action is confirmed */
  onConfirm: () => void;
  /** Modal title */
  title: string;
  /** Modal message/description */
  message: string;
  /** Text for confirm button */
  confirmText?: string;
  /** Text for cancel button */
  cancelText?: string;
  /** Variant styling for confirm button */
  variant?: 'danger' | 'primary';
  /** Whether the confirm action is in progress */
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const confirmButtonClasses = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
    : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white';

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-5 pb-0">
          <div className={`flex-shrink-0 p-2 rounded-full ${
            variant === 'danger' 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            <ExclamationCircleIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 
              id="confirmation-title"
              className="text-lg font-bold text-slate-800 dark:text-white"
            >
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {message}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-5 pt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 ${confirmButtonClasses}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
