import React, { useState, useEffect } from 'react';
import { INPUT_BASE_CLASSES, FORM_LABEL, BTN_PRIMARY, BTN_SECONDARY, FORM_FOOTER, ERROR_BANNER } from '../utils/constants';
import { ExclamationCircleIcon } from './icons';
import * as debtService from '../services/debtService';

interface DebtFormProps {
  mode: 'create' | 'edit';
  debtId?: string;
  onSave: () => void;
  onCancel: () => void;
}

export const DebtForm: React.FC<DebtFormProps> = ({ mode, debtId, onSave, onCancel }) => {
  const [type, setType] = useState<'receivable' | 'payable'>('receivable');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && debtId) {
      const debt = debtService.getDebtById(debtId);
      if (debt) {
        setType(debt.type);
        setCounterparty(debt.counterparty);
        setAmount(debt.amount.toString());
        setDescription(debt.description);
        setDueDate(debt.dueDate.split('T')[0]);
        setCategory(debt.category || '');
        setNotes(debt.notes || '');
      }
    }
  }, [mode, debtId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!counterparty.trim() || !amount || !description.trim() || !dueDate) {
      setFormError('Por favor completa todos los campos obligatorios');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Por favor ingresa un monto válido');
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (mode === 'create') {
        result = debtService.createDebt(
          type,
          counterparty,
          amountNum,
          description,
          dueDate,
          category || undefined,
          notes || undefined
        );
      } else if (debtId) {
        result = debtService.updateDebt(debtId, {
          type,
          counterparty,
          amount: amountNum,
          description,
          dueDate,
          category: category || undefined,
          notes: notes || undefined
        });
      }
      
      if (!result) {
        setFormError('Error al guardar la deuda');
        return;
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving debt:', error);
      setFormError('Error al guardar la deuda');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-container">
        {/* Error Banner */}
        {formError && (
          <div className={ERROR_BANNER}>
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            {formError}
          </div>
        )}

        {/* Type Selection */}
        <div>
          <label className={FORM_LABEL}>
            Tipo de Deuda <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('receivable')}
              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                type === 'receivable'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Por Cobrar
            </button>
            <button
              type="button"
              onClick={() => setType('payable')}
              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                type === 'payable'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Por Pagar
            </button>
          </div>
        </div>

        {/* Counterparty */}
        <div>
          <label className={FORM_LABEL}>
            {type === 'receivable' ? 'Cliente' : 'Proveedor'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder={type === 'receivable' ? 'Nombre del cliente' : 'Nombre del proveedor'}
            className={INPUT_BASE_CLASSES}
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className={FORM_LABEL}>
            Monto <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={INPUT_BASE_CLASSES}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className={FORM_LABEL}>
            Descripción <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Concepto de la deuda"
            className={INPUT_BASE_CLASSES}
            required
          />
        </div>

        {/* Due Date */}
        <div>
          <label className={FORM_LABEL}>
            Fecha de Vencimiento <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={INPUT_BASE_CLASSES}
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className={FORM_LABEL}>
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Información adicional..."
            rows={3}
            className={INPUT_BASE_CLASSES}
          />
        </div>
      </div>

      {/* Sticky Footer */}
      <div className={FORM_FOOTER}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={BTN_PRIMARY}
        >
          {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Deuda' : 'Actualizar Deuda'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={BTN_SECONDARY}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
