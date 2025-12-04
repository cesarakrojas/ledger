import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INPUT_BASE_CLASSES, FORM_LABEL, BTN_PRIMARY, BTN_SECONDARY, FORM_FOOTER, ERROR_BANNER } from '../utils/constants';
import { ExclamationCircleIcon } from './icons';
import * as debtService from '../services/debtService';
import * as contactService from '../services/contactService';
import { Contact } from '../types';

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
  
  // Contact dropdown state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load contacts on mount
  useEffect(() => {
    setContacts(contactService.getAllContacts());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter contacts based on type and search query
  const filteredContacts = useMemo(() => {
    const contactType = type === 'receivable' ? 'client' : 'supplier';
    return contacts.filter(contact => {
      const matchesType = contact.type === contactType;
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [contacts, type, searchQuery]);

  const handleCounterpartyChange = (value: string) => {
    setCounterparty(value);
    setSearchQuery(value);
    setShowDropdown(true);
  };

  const selectContact = (contact: Contact) => {
    setCounterparty(contact.name);
    setSearchQuery('');
    setShowDropdown(false);
  };

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
        <div ref={dropdownRef} className="relative">
          <label className={FORM_LABEL}>
            {type === 'receivable' ? 'Cliente' : 'Proveedor'} <span className="text-red-500">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={counterparty}
            onChange={(e) => handleCounterpartyChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder={type === 'receivable' ? 'Nombre del cliente' : 'Nombre del proveedor'}
            className={INPUT_BASE_CLASSES}
            autoComplete="off"
            required
          />
          {/* Contact Dropdown */}
          {showDropdown && filteredContacts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => selectContact(contact)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                >
                  <div className="font-medium text-slate-800 dark:text-white">{contact.name}</div>
                  {contact.phone && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">{contact.phone}</div>
                  )}
                </button>
              ))}
            </div>
          )}
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
