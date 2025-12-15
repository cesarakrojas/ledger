import React, { useState } from 'react';
import type { CategoryConfig } from '../SharedDefs';
import { INPUT_BASE_CLASSES, FORM_LABEL, BTN_PRIMARY, FORM_FOOTER, ERROR_BANNER, formatCurrency } from '../SharedDefs';
import { ExclamationCircleIcon } from '../UIComponents';

interface NewInflowFormProps {
  onAddTransaction: (transaction: { description: string; amount: number; type: 'inflow'; category?: string; paymentMethod?: string }) => void;
  categoryConfig: CategoryConfig;
  currencyCode: string;
  paymentMethods?: string[];
  onClose?: () => void;
  onSuccess?: (title: string, message: string) => void;
}

export const NewInflowForm: React.FC<NewInflowFormProps> = ({ onAddTransaction, categoryConfig, currencyCode, paymentMethods = ['Efectivo', 'Tarjeta', 'Transferencia'], onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amountValue = parseFloat(amount);
    
    // Validation
    if (!amountValue || amountValue <= 0) {
      setFormError('Ingresa un monto válido.');
      return;
    }

    const finalDescription = description.trim() || 'Ingreso';

    onAddTransaction({
      description: finalDescription,
      amount: amountValue,
      type: 'inflow',
      category: category || undefined,
      paymentMethod: paymentMethod || undefined
    });

    // Reset form
    setDescription('');
    setAmount('');
    setCategory('');
    setPaymentMethod('');

    if (onSuccess) {
      onSuccess('¡Ingreso Registrado!', `Ingreso de ${formatCurrency(amountValue, currencyCode)} registrado`);
    }
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-container">
        
        {/* Error Message */}
        {formError && (
          <div className={ERROR_BANNER}>
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            {formError}
          </div>
        )}

        {/* Description Field */}
        <div>
          <label className={FORM_LABEL}>
            Descripción
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Servicio de consultoría"
            className={INPUT_BASE_CLASSES}
          />
        </div>

        {/* Amount Field */}
        <div>
          <label className={FORM_LABEL}>
            Monto <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
            className={INPUT_BASE_CLASSES}
          />
        </div>

        {/* Category Field */}
        {categoryConfig.enabled && categoryConfig.inflowCategories.length > 0 && (
          <div>
            <label className={FORM_LABEL}>
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={INPUT_BASE_CLASSES}
            >
              <option value="">Seleccionar categoría...</option>
              {categoryConfig.inflowCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Payment Method Field */}
        <div>
          <label className={FORM_LABEL}>
            Método de Pago
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={INPUT_BASE_CLASSES}
          >
            <option value="">Seleccionar método</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className={FORM_FOOTER}>
        {/* Total Display */}
        <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-slate-700 dark:text-slate-300">Total:</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(parseFloat(amount || '0'), currencyCode)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={BTN_PRIMARY}
        >
          Registrar Ingreso
        </button>
      </div>
    </form>
  );
};
