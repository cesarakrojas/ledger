/**
 * DebtsDomain.tsx
 * Domain module for all debt/libreta management functionality
 * Contains: LibretaView, DebtForm, DebtDetailView
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DebtEntry, Contact } from './shared';
import {
  CARD_STYLES,
  LIST_ITEM_INTERACTIVE,
  TEXT_PAGE_TITLE,
  BTN_ACTION_PRIMARY,
  INPUT_BASE_CLASSES,
  FORM_LABEL,
  FORM_FOOTER,
  ERROR_BANNER,
  BTN_FOOTER_PRIMARY,
  BTN_FOOTER_SECONDARY,
  BTN_FOOTER_DANGER,
  BTN_FOOTER_DISABLED,
  DETAIL_VIEW_CONTAINER,
  DETAIL_VIEW_HEADER,
  DETAIL_VIEW_FOOTER,
  TEXT_DETAIL_HEADER_TITLE,
  ICON_BTN_CLOSE,
  DIVIDER,
  STAT_CARD_EMERALD,
  STAT_CARD_RED,
  ICON_BG_EMERALD,
  ICON_BG_RED,
  TEXT_AMOUNT_INFLOW,
  TEXT_AMOUNT_OUTFLOW,
  TOGGLE_BTN_BASE,
  TOGGLE_BTN_INACTIVE,
  TOGGLE_BTN_ACTIVE_EMERALD,
  TOGGLE_BTN_ACTIVE_RED,
  formatCurrency,
  formatDate
} from './shared';
import {
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationCircleIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  PencilIcon,
  DetailRow,
  AlertCircleSmallIcon,
  DocumentTextIcon,
  CalendarSmallIcon,
  ConfirmationModal
} from './components';
import { ContactService } from './services';
import { useDebtStore, useConfigStore, useUIStore } from './stores';
import { paths } from './routes';

// =============================================================================
// LibretaView
// =============================================================================
export interface LibretaViewProps {
  onChangeView?: (mode: 'list' | 'create' | 'edit' | 'detail', debtId?: string) => void;
  currencyCode?: string;
}

export const LibretaView: React.FC<LibretaViewProps> = (props) => {
  const navigate = useNavigate();
  
  // Use Zustand stores with selectors for performance
  const debts = useDebtStore(state => state.debts);
  const stats = useDebtStore(state => state.stats);
  const loadDebts = useDebtStore(state => state.loadDebts);
  const storeCurrencyCode = useConfigStore(state => state.currencyCode);
  
  // Resolve currencyCode from props or store
  const currencyCode = props.currencyCode ?? storeCurrencyCode;

  // Load debts on mount
  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  const handleCreateDebt = () => {
    if (props.onChangeView) {
      props.onChangeView('create');
    } else {
      navigate(paths.libretaNew());
    }
  };

  const handleViewDebt = (debtId: string) => {
    if (props.onChangeView) {
      props.onChangeView('detail', debtId);
    } else {
      navigate(paths.libretaDetail(debtId));
    }
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
          <div>
            <h2 className={TEXT_PAGE_TITLE}>Libreta de Deudas</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Cuentas por cobrar y pagar</p>
          </div>
          <button onClick={handleCreateDebt} className={BTN_ACTION_PRIMARY}>
            <PlusIcon className="w-5 h-5" />
            Nueva Deuda
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className={`${STAT_CARD_EMERALD} flex flex-col justify-between`}>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Por Cobrar</p>
            <p className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
              {formatCurrency(stats.totalReceivablesPending, currencyCode)}
            </p>
            {stats.overdueReceivables > 0 && (
              <p className={`text-xs font-medium ${TEXT_AMOUNT_OUTFLOW} mt-2 flex items-center gap-1`}>
                <AlertCircleSmallIcon className="w-3 h-3" />
                {stats.overdueReceivables} vencido{stats.overdueReceivables > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className={`${STAT_CARD_RED} flex flex-col justify-between`}>
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Por Pagar</p>
            <p className="text-2xl font-bold tracking-tight text-red-700 dark:text-red-300">
              {formatCurrency(stats.totalPayablesPending, currencyCode)}
            </p>
            {stats.overduePayables > 0 && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <AlertCircleSmallIcon className="w-3 h-3" />
                {stats.overduePayables} vencido{stats.overduePayables > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className={DIVIDER}></div>

        {debts.length === 0 ? (
          <div>
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <DocumentTextIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No hay deudas registradas</h3>
            <button onClick={handleCreateDebt} className="mt-4 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
              Registrar tu primera deuda
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700 -mx-2">
            {debts.map((debt) => (
              <li key={debt.id} onClick={() => handleViewDebt(debt.id)} className={LIST_ITEM_INTERACTIVE}>
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    <div className={`p-3 rounded-xl shrink-0 ${debt.type === 'receivable' ? ICON_BG_EMERALD : ICON_BG_RED}`}>
                      {debt.type === 'receivable' ? <ArrowUpIcon className="w-6 h-6" /> : <ArrowDownIcon className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{debt.counterparty}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-1">{debt.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md ${getStatusColor(debt.status)}`}>
                          {getStatusLabel(debt.status)}
                        </span>
                        {debt.category && (
                          <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-600">
                            {debt.category}
                          </span>
                        )}
                        <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                          <CalendarSmallIcon className="h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                          <span className="whitespace-nowrap">
                            {new Date(debt.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-2">
                    <p className={`text-xl sm:text-2xl font-bold whitespace-nowrap ${debt.type === 'receivable' ? TEXT_AMOUNT_INFLOW : TEXT_AMOUNT_OUTFLOW}`}>
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

// =============================================================================
// DebtForm
// =============================================================================
export interface DebtFormProps {
  mode?: 'create' | 'edit';
  debtId?: string;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export const DebtForm: React.FC<DebtFormProps> = (props) => {
  const navigate = useNavigate();
  
  // Use stores with selectors for performance
  const getById = useDebtStore(state => state.getById);
  const createDebt = useDebtStore(state => state.createDebt);
  const updateDebt = useDebtStore(state => state.updateDebt);
  const deleteDebt = useDebtStore(state => state.deleteDebt);
  const showSuccessModal = useUIStore(state => state.showSuccessModal);
  
  // Resolve mode and debt from props or defaults
  const mode = props.mode ?? (props.debtId ? 'edit' : 'create');
  const existingDebt = props.debtId ? getById(props.debtId) : null;
  
  const [type, setType] = useState<'receivable' | 'payable'>('receivable');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load existing debt data
  useEffect(() => {
    if (existingDebt) {
      setType(existingDebt.type);
      setCounterparty(existingDebt.counterparty);
      setAmount(existingDebt.originalAmount?.toString() ?? existingDebt.amount.toString());
      setDescription(existingDebt.description);
      setDueDate(existingDebt.dueDate ? existingDebt.dueDate.split('T')[0] : '');
      setCategory(existingDebt.category ?? '');
      setNotes(existingDebt.notes ?? '');
    }
  }, [existingDebt]);

  useEffect(() => {
    setContacts(ContactService.getAll());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    } else {
      navigate(paths.libreta());
    }
  };
  
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (props.debtId) {
      const success = deleteDebt(props.debtId);
      if (success) {
        showSuccessModal('Deuda Eliminada', 'La deuda ha sido eliminada');
        setShowDeleteConfirm(false);
        if (props.onDelete) {
          props.onDelete();
        } else {
          navigate(paths.libreta());
        }
      }
    }
  };

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
    setShowDropdown(value.trim().length >= 1);
  };

  const selectContact = (contact: Contact) => {
    setCounterparty(contact.name);
    setSearchQuery('');
    setShowDropdown(false);
  };

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
      if (mode === 'create') {
        const contactType = type === 'receivable' ? 'client' : 'supplier';
        const existingContact = contacts.find(
          c => c.name.toLowerCase() === counterparty.trim().toLowerCase() && c.type === contactType
        );
        
        if (!existingContact) {
          ContactService.create({ type: contactType, name: counterparty.trim() });
        }
      }

      let result;
      if (mode === 'create') {
        result = createDebt(type, counterparty, amountNum, description, dueDate, category || undefined, notes || undefined);
      } else if (props.debtId) {
        result = updateDebt(props.debtId, { type, counterparty, amount: amountNum, description, dueDate, category: category || undefined, notes: notes || undefined });
      }
      
      if (!result) {
        setFormError('Error al guardar la deuda');
        return;
      }
      
      showSuccessModal(
        mode === 'create' ? 'Deuda Creada' : 'Deuda Actualizada',
        `La deuda ha sido ${mode === 'create' ? 'creada' : 'actualizada'}`
      );
      
      if (props.onSave) {
        props.onSave();
      } else {
        navigate(paths.libreta());
      }
    } catch (error) {
      console.error('Error saving debt:', error);
      setFormError('Error al guardar la deuda');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-container">
        {formError && (
          <div className={ERROR_BANNER}>
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            {formError}
          </div>
        )}

        <div>
          <label className={FORM_LABEL}>Tipo de Deuda <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setType('receivable')}
              className={`${TOGGLE_BTN_BASE} ${type === 'receivable' ? TOGGLE_BTN_ACTIVE_EMERALD : TOGGLE_BTN_INACTIVE}`}>
              Por Cobrar
            </button>
            <button type="button" onClick={() => setType('payable')}
              className={`${TOGGLE_BTN_BASE} ${type === 'payable' ? TOGGLE_BTN_ACTIVE_RED : TOGGLE_BTN_INACTIVE}`}>
              Por Pagar
            </button>
          </div>
        </div>

        <div ref={dropdownRef} className="relative">
          <label className={FORM_LABEL}>{type === 'receivable' ? 'Cliente' : 'Proveedor'} <span className="text-red-500">*</span></label>
          <input type="text" value={counterparty} onChange={(e) => handleCounterpartyChange(e.target.value)}
            placeholder={type === 'receivable' ? 'Nombre del cliente' : 'Nombre del proveedor'}
            className={INPUT_BASE_CLASSES} autoComplete="off" required />
          {showDropdown && filteredContacts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <button key={contact.id} type="button" onClick={() => selectContact(contact)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors border-b border-slate-100 dark:border-slate-600 last:border-b-0">
                  <div className="font-medium text-slate-800 dark:text-white">{contact.name}</div>
                  {contact.phone && <div className="text-sm text-slate-500 dark:text-slate-400">{contact.phone}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={FORM_LABEL}>Monto <span className="text-red-500">*</span></label>
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={INPUT_BASE_CLASSES} required />
        </div>

        <div>
          <label className={FORM_LABEL}>Descripción <span className="text-red-500">*</span></label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Concepto de la deuda" className={INPUT_BASE_CLASSES} required />
        </div>

        <div>
          <label className={FORM_LABEL}>Fecha de Vencimiento <span className="text-red-500">*</span></label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={INPUT_BASE_CLASSES} required />
        </div>

        <div>
          <label className={FORM_LABEL}>Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Información adicional..." rows={3} className={INPUT_BASE_CLASSES} />
        </div>
      </div>

      <div className={FORM_FOOTER}>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button type="submit" disabled={isSubmitting} className={BTN_FOOTER_PRIMARY}>
            {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Deuda' : 'Actualizar'}
          </button>
          {mode === 'edit' ? (
            <button type="button" onClick={handleDelete} disabled={isSubmitting} className={BTN_FOOTER_DANGER}>
              <TrashIcon className="w-5 h-5" />
              <span>Eliminar</span>
            </button>
          ) : (
            <button type="button" onClick={handleCancel} disabled={isSubmitting} className={BTN_FOOTER_SECONDARY}>Cancelar</button>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Deuda"
        message="¿Estás seguro de que deseas eliminar esta deuda? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </form>
  );
};

// =============================================================================
// DebtDetailView
// =============================================================================
export interface DebtDetailViewProps {
  debt?: DebtEntry;
  debtId?: string;
  onClose?: () => void;
  onEdit?: () => void;
  onMarkAsPaid?: () => void;
  onPartialPayment?: (amount: number) => void;
  currencyCode?: string;
}

export const DebtDetailView: React.FC<DebtDetailViewProps> = (props) => {
  const navigate = useNavigate();
  
  // Use stores with selectors for performance
  const getById = useDebtStore(state => state.getById);
  const markAsPaid = useDebtStore(state => state.markAsPaid);
  const makePartialPayment = useDebtStore(state => state.makePartialPayment);
  const storeCurrencyCode = useConfigStore(state => state.currencyCode);
  const showSuccessModal = useUIStore(state => state.showSuccessModal);
  
  // Resolve debt from props or store
  const debt = props.debt ?? (props.debtId ? getById(props.debtId) : null);
  const currencyCode = props.currencyCode ?? storeCurrencyCode;
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!debt) {
    const handleBack = () => {
      if (props.onClose) {
        props.onClose();
      } else {
        navigate(paths.libreta());
      }
    };
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 dark:text-slate-400">Deuda no encontrada</p>
          <button onClick={handleBack} className={BTN_ACTION_PRIMARY + ' mt-4'}>Volver a Libreta</button>
        </div>
      </div>
    );
  }

  const isPaid = debt.status === 'paid';
  const isOverdue = debt.status === 'overdue';
  const isReceivable = debt.type === 'receivable';

  const handleClose = () => {
    if (props.onClose) {
      props.onClose();
    } else {
      navigate(paths.libreta());
    }
  };

  const handleEdit = () => {
    if (props.onEdit) {
      props.onEdit();
    } else {
      navigate(paths.libretaEdit(debt.id));
    }
  };

  const handleOpenPaymentModal = () => {
    setPaymentAmount('');
    setPaymentError(null);
    setShowPaymentModal(true);
  };

  const handlePayFull = () => {
    setShowPaymentModal(false);
    if (props.onMarkAsPaid) {
      props.onMarkAsPaid();
    } else {
      const result = markAsPaid(debt.id);
      if (result) {
        showSuccessModal('¡Deuda Pagada!', `La deuda con ${debt.counterparty} ha sido marcada como pagada`);
        navigate(paths.libreta());
      }
    }
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
    
    if (props.onPartialPayment) {
      props.onPartialPayment(amount);
    } else {
      const result = makePartialPayment(debt.id, amount);
      if (result) {
        showSuccessModal('¡Abono Registrado!', `Abono de ${formatCurrency(amount, currencyCode)} registrado`);
        if (result.debt.status === 'paid') {
          navigate(paths.libreta());
        }
      }
    }
  };

  const getPillStatusClasses = () => {
    if (isPaid) return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300';
    if (isOverdue) return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
    return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300';
  };

  const pillClasses = getPillStatusClasses();
  const statusLabel = { paid: 'Pagado', overdue: 'Vencido', pending: 'Pendiente' }[debt.status] || debt.status;
  const typeLabel = isReceivable ? 'Por Cobrar' : 'Por Pagar';

  return (
    <div className={DETAIL_VIEW_CONTAINER}>
      <div className={DETAIL_VIEW_HEADER}>
        <h2 className={TEXT_DETAIL_HEADER_TITLE}>Deuda</h2>
        <button onClick={handleClose} className={ICON_BTN_CLOSE} aria-label="Cerrar">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container">
        <div className="bg-white dark:bg-slate-800 pb-8 pt-8 px-6 text-center shadow-sm">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3 ${pillClasses}`}>
            {isReceivable ? <ArrowUpIcon className="w-4 h-4 opacity-80"/> : <ArrowDownIcon className="w-4 h-4 opacity-80"/>}
            <span>{typeLabel} • {statusLabel}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(debt.amount, currencyCode)}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            {isReceivable ? 'Cliente' : 'Proveedor'}: <span className="text-slate-800 dark:text-slate-200">{debt.counterparty}</span>
          </p>
        </div>

        <div className="mt-4 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4">
          <DetailRow label="Descripción" value={debt.description} />
          <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <span className="block text-xs text-slate-500 mb-1">Vencimiento</span>
              <span className={`text-sm font-bold ${isOverdue && !isPaid ? 'text-red-600' : 'text-slate-800 dark:text-white'}`}>
                {formatDate(debt.dueDate)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-xs text-slate-500 mb-1">Creado</span>
              <span className="text-sm font-medium text-slate-800 dark:text-white">{formatDate(debt.createdAt)}</span>
            </div>
          </div>
          {debt.category && <DetailRow label="Categoría" value={debt.category} />}
          {debt.notes && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Notas</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{debt.notes}"</p>
            </div>
          )}
          {isPaid && debt.paidAt && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="block text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Estado</span>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-800 dark:text-slate-200">Pagado el {formatDate(debt.paidAt)}</span>
              </div>
            </div>
          )}
        </div>

        {debt.payments && debt.payments.length > 0 && (
          <div className="mt-4 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Historial de Abonos ({debt.payments.length})
              </h3>
              {debt.originalAmount && (
                <span className="text-xs text-slate-400">Original: {formatCurrency(debt.originalAmount, currencyCode)}</span>
              )}
            </div>
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-700">
              {debt.payments.map((payment, index) => (
                <div key={payment.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Abono #{index + 1}</p>
                    <p className="text-xs text-slate-400">{formatDate(payment.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(payment.amount, currencyCode)}</p>
                    <p className="text-xs text-slate-400 font-mono">Ref: {payment.transactionId.slice(0, 8)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Abonado</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(debt.payments.reduce((sum, p) => sum + p.amount, 0), currencyCode)}
              </span>
            </div>
          </div>
        )}
        
        <div className="h-6 bg-slate-50 dark:bg-slate-900"></div>
      </div>

      <div className={DETAIL_VIEW_FOOTER}>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleOpenPaymentModal} disabled={isPaid}
            className={!isPaid ? BTN_FOOTER_PRIMARY : BTN_FOOTER_DISABLED}>
            <CheckCircleIcon className="w-5 h-5" />
            <span>{isPaid ? 'Pagado' : 'Abonar'}</span>
          </button>
          <button onClick={handleEdit} className={BTN_FOOTER_SECONDARY}>
            <PencilIcon className="w-5 h-5" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {isReceivable ? 'Registrar Cobro' : 'Registrar Pago'}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Saldo Pendiente</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(debt.amount, currencyCode)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Monto a abonar</label>
                <input type="number" step="0.01" min="0" max={debt.amount} value={paymentAmount}
                  onChange={(e) => { setPaymentAmount(e.target.value); setPaymentError(null); }}
                  placeholder="0.00" className={INPUT_BASE_CLASSES} autoFocus />
                {paymentError && <p className="text-red-500 text-sm mt-1">{paymentError}</p>}
              </div>
            </div>
            <div className="p-5 pt-0 space-y-3">
              <button onClick={handlePartialPayment} disabled={!paymentAmount}
                className={paymentAmount ? 'w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors' : 'w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-semibold rounded-xl cursor-not-allowed'}>
                Abonar Monto
              </button>
              <button onClick={handlePayFull} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                Pagar Todo ({formatCurrency(debt.amount, currencyCode)})
              </button>
              <button onClick={() => setShowPaymentModal(false)} className="w-full py-2 text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
