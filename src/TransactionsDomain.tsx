/**
 * TransactionsDomain.tsx
 * Domain module for all transaction and home functionality
 * Contains: HomeView, NewInflowForm, NewExpenseForm, TransactionDetailView, TransactionDetailPage, NotFoundView
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Transaction, CategoryConfig } from './shared';
import {
  CARD_STYLES,
  BTN_HEADER_INFLOW,
  BTN_HEADER_OUTFLOW,
  TEXT_PAGE_TITLE,
  TEXT_VALUE_XL,
  INPUT_BASE_CLASSES,
  FORM_LABEL,
  BTN_PRIMARY,
  BTN_ACTION_PRIMARY,
  FORM_FOOTER,
  ERROR_BANNER,
  DETAIL_VIEW_CONTAINER,
  DETAIL_VIEW_HEADER,
  DETAIL_VIEW_FOOTER,
  TEXT_DETAIL_HEADER_TITLE,
  ICON_BTN_CLOSE,
  BTN_FOOTER_PRIMARY,
  BTN_FOOTER_SECONDARY,
  DIVIDER,
  STAT_CARD_EMERALD,
  STAT_CARD_RED,
  formatCurrency,
  formatDate,
  formatTime
} from './shared';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CloseIcon,
  PencilIcon,
  PrinterIcon,
  ExclamationCircleIcon,
  TransactionItem
} from './components';
import { useTransactionStore, useConfigStore, useUIStore } from './stores';
import { paths } from './routes';

// =============================================================================
// NotFoundView
// =============================================================================
export interface NotFoundViewProps {
  message: string;
  buttonLabel: string;
  onBack: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  message,
  buttonLabel,
  onBack,
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-slate-600 dark:text-slate-400">{message}</p>
        <button onClick={onBack} className={BTN_ACTION_PRIMARY + ' mt-4'}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// HomeView - Local SearchIcon
// =============================================================================
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

// Props are optional - component can use stores directly
export interface HomeViewProps {
  transactions?: Transaction[];
  currencyCode?: string;
  totalInflows?: number;
  totalOutflows?: number;
  inflowCount?: number;
  outflowCount?: number;
  onTransactionClick?: (transactionId: string) => void;
  onNewInflow?: () => void;
  onNewExpense?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = (props) => {
  const navigate = useNavigate();
  
  // Use stores with selectors for performance - only re-render when specific values change
  const todayTransactions = useTransactionStore(state => state.todayTransactions);
  const storeTotalInflows = useTransactionStore(state => state.totalInflows);
  const storeTotalOutflows = useTransactionStore(state => state.totalOutflows);
  const storeInflowCount = useTransactionStore(state => state.inflowCount);
  const storeOutflowCount = useTransactionStore(state => state.outflowCount);
  const currencyCodeFromStore = useConfigStore(state => state.currencyCode);
  
  // Resolve values - prefer props, fallback to stores
  const transactions = props.transactions ?? todayTransactions;
  const currencyCode = props.currencyCode ?? currencyCodeFromStore;
  const totalInflows = props.totalInflows ?? storeTotalInflows;
  const totalOutflows = props.totalOutflows ?? storeTotalOutflows;
  const inflowCount = props.inflowCount ?? storeInflowCount;
  const outflowCount = props.outflowCount ?? storeOutflowCount;
  
  // Navigation handlers - use props or router
  const handleTransactionClick = (transactionId: string) => {
    if (props.onTransactionClick) {
      props.onTransactionClick(transactionId);
    } else {
      navigate(paths.transactionDetail(transactionId));
    }
  };
  
  const handleNewInflow = () => {
    if (props.onNewInflow) {
      props.onNewInflow();
    } else {
      navigate(paths.newInflow());
    }
  };
  
  const handleNewExpense = () => {
    if (props.onNewExpense) {
      props.onNewExpense();
    } else {
      navigate(paths.newExpense());
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={CARD_STYLES}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Title + Date + Search Icon Container */}
          <div className="flex w-full sm:w-auto justify-between items-center sm:gap-8">
            
            {/* Text Block */}
            <div>
              <h2 className={TEXT_PAGE_TITLE}>Transacciones</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded mr-2">HOY</span>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
              </p>
            </div>

            {/* Search Icon */}
            <button className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <SearchIcon className="w-6 h-6" />
            </button>
            
          </div>

          {/* Action Buttons (Ingreso/Gasto) */}
          <div className="w-full sm:w-auto grid grid-cols-2 gap-2">
            <button onClick={handleNewInflow} className={BTN_HEADER_INFLOW}>
              <ArrowUpIcon className="w-5 h-5"/> Ingreso
            </button>
            <button onClick={handleNewExpense} className={BTN_HEADER_OUTFLOW}>
              <ArrowDownIcon className="w-5 h-5"/> Gasto
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div className={STAT_CARD_EMERALD}>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Ingresos</p>
            <p className={`${TEXT_VALUE_XL} text-emerald-700 dark:text-emerald-300`}>{formatCurrency(totalInflows, currencyCode)}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
              {inflowCount} transacción{inflowCount !== 1 ? 'es' : ''}
            </p>
          </div>
          <div className={STAT_CARD_RED}>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Gastos</p>
            <p className={`${TEXT_VALUE_XL} text-red-700 dark:text-red-300`}>{formatCurrency(totalOutflows, currencyCode)}</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
              {outflowCount} transacción{outflowCount !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
        <div className={DIVIDER}></div>
        
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
                  onClick={() => handleTransactionClick(t.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// NewInflowForm
// =============================================================================
export interface NewInflowFormProps {
  onAddTransaction?: (transaction: { description: string; amount: number; type: 'inflow'; category?: string; paymentMethod?: string }) => void;
  categoryConfig?: CategoryConfig;
  currencyCode?: string;
  paymentMethods?: string[];
  onClose?: () => void;
  onSuccess?: (title: string, message: string) => void;
}

export const NewInflowForm: React.FC<NewInflowFormProps> = (props) => {
  const navigate = useNavigate();
  
  // Use stores with selectors for performance
  const addTransaction = useTransactionStore(state => state.addTransaction);
  const storeCategoryConfig = useConfigStore(state => state.categoryConfig);
  const storeCurrencyCode = useConfigStore(state => state.currencyCode);
  const storePaymentMethods = useConfigStore(state => state.paymentMethods);
  const showSuccessModal = useUIStore(state => state.showSuccessModal);
  
  // Resolve values from stores
  const categoryConfig = props.categoryConfig ?? storeCategoryConfig;
  const currencyCode = props.currencyCode ?? storeCurrencyCode;
  const paymentMethods = props.paymentMethods ?? storePaymentMethods;
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amountValue = parseFloat(amount);
    
    if (!amountValue || amountValue <= 0) {
      setFormError('Ingresa un monto válido.');
      return;
    }

    const finalDescription = description.trim() || 'Ingreso';

    // Use prop callback or store directly
    if (props.onAddTransaction) {
      props.onAddTransaction({
        description: finalDescription,
        amount: amountValue,
        type: 'inflow',
        category: category || undefined,
        paymentMethod: paymentMethod || undefined
      });
    } else {
      addTransaction(
        'inflow',
        finalDescription,
        amountValue,
        category || undefined,
        paymentMethod || undefined
      );
    }

    setDescription('');
    setAmount('');
    setCategory('');
    setPaymentMethod('');

    // Show success feedback
    if (props.onSuccess) {
      props.onSuccess('¡Ingreso Registrado!', `Ingreso de ${formatCurrency(amountValue, currencyCode)} registrado`);
    } else {
      showSuccessModal('¡Ingreso Registrado!', `Ingreso de ${formatCurrency(amountValue, currencyCode)} registrado`);
    }
    
    // Navigate back
    if (props.onClose) {
      props.onClose();
    } else {
      navigate(paths.home());
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
          <label className={FORM_LABEL}>Descripción</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Servicio de consultoría" className={INPUT_BASE_CLASSES} />
        </div>

        <div>
          <label className={FORM_LABEL}>Monto <span className="text-red-500">*</span></label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" min="0.01" step="0.01" required className={INPUT_BASE_CLASSES} />
        </div>

        {categoryConfig.enabled && categoryConfig.inflowCategories.length > 0 && (
          <div>
            <label className={FORM_LABEL}>Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_BASE_CLASSES}>
              <option value="">Seleccionar categoría...</option>
              {categoryConfig.inflowCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={FORM_LABEL}>Método de Pago</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={INPUT_BASE_CLASSES}>
            <option value="">Seleccionar método</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={FORM_FOOTER}>
        <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-slate-700 dark:text-slate-300">Total:</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(parseFloat(amount || '0'), currencyCode)}
            </span>
          </div>
        </div>
        <button type="submit" className={BTN_PRIMARY}>Registrar Ingreso</button>
      </div>
    </form>
  );
};

// =============================================================================
// NewExpenseForm
// =============================================================================
export interface NewExpenseFormProps {
  onAddTransaction?: (transaction: { 
    description: string; 
    amount: number; 
    type: 'outflow'; 
    category?: string; 
    paymentMethod?: string;
  }) => void;
  categoryConfig?: CategoryConfig;
  currencyCode?: string;
  paymentMethods?: string[];
  onClose?: () => void;
  onSuccess?: (title: string, message: string) => void;
}

export const NewExpenseForm: React.FC<NewExpenseFormProps> = (props) => {
  const navigate = useNavigate();
  
  // Use stores with selectors for performance
  const addTransaction = useTransactionStore(state => state.addTransaction);
  const storeCategoryConfig = useConfigStore(state => state.categoryConfig);
  const storeCurrencyCode = useConfigStore(state => state.currencyCode);
  const storePaymentMethods = useConfigStore(state => state.paymentMethods);
  const showSuccessModal = useUIStore(state => state.showSuccessModal);
  
  // Resolve values from stores
  const categoryConfig = props.categoryConfig ?? storeCategoryConfig;
  const currencyCode = props.currencyCode ?? storeCurrencyCode;
  const paymentMethods = props.paymentMethods ?? storePaymentMethods;
  
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amountValue = parseFloat(amount);
    
    if (!description.trim()) {
      setFormError('Ingresa una descripción para el gasto.');
      return;
    }

    if (!amountValue || amountValue <= 0) {
      setFormError('Ingresa un monto válido.');
      return;
    }

    const finalDescription = description.trim();

    // Use prop callback or store directly
    if (props.onAddTransaction) {
      props.onAddTransaction({ 
        description: finalDescription, 
        amount: amountValue, 
        type: 'outflow',
        category: category || undefined,
        paymentMethod: paymentMethod || undefined
      });
    } else {
      addTransaction(
        'outflow',
        finalDescription,
        amountValue,
        category || undefined,
        paymentMethod || undefined
      );
    }

    setDescription('');
    setAmount('');
    setCategory('');
    setPaymentMethod('');

    // Show success feedback
    if (props.onSuccess) {
      props.onSuccess('¡Gasto Registrado!', `Gasto de ${formatCurrency(amountValue, currencyCode)} registrado`);
    } else {
      showSuccessModal('¡Gasto Registrado!', `Gasto de ${formatCurrency(amountValue, currencyCode)} registrado`);
    }

    // Navigate back
    if (props.onClose) {
      props.onClose();
    } else {
      navigate(paths.home());
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
          <label className={FORM_LABEL}>Descripción <span className="text-red-500">*</span></label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Pago de servicios" required className={INPUT_BASE_CLASSES} />
        </div>

        <div>
          <label className={FORM_LABEL}>Monto <span className="text-red-500">*</span></label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" min="0.01" step="0.01" required className={INPUT_BASE_CLASSES} />
        </div>

        {categoryConfig.enabled && categoryConfig.outflowCategories.length > 0 && (
          <div>
            <label className={FORM_LABEL}>Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_BASE_CLASSES}>
              <option value="">Seleccionar categoría...</option>
              {categoryConfig.outflowCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={FORM_LABEL}>Método de Pago</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={INPUT_BASE_CLASSES}>
            <option value="">Seleccionar método</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={FORM_FOOTER}>
        <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-slate-700 dark:text-slate-300">Total:</span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(parseFloat(amount || '0'), currencyCode)}
            </span>
          </div>
        </div>
        <button type="submit" className={BTN_PRIMARY}>Registrar Gasto</button>
      </div>
    </form>
  );
};

// =============================================================================
// TransactionDetailView
// =============================================================================
interface TransactionDetailViewProps {
  transaction: Transaction;
  onClose: () => void;
  onEdit: () => void;
  currencyCode?: string;
}

const DetailRow: React.FC<{ label: string; value: string; monospace?: boolean }> = ({
  label,
  value,
  monospace
}) => (
  <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span
      className={`text-sm font-medium text-slate-900 dark:text-slate-100 ${
        monospace ? 'font-mono text-xs' : ''
      } text-right max-w-[60%] truncate`}
    >
      {value}
    </span>
  </div>
);

export const TransactionDetailView: React.FC<TransactionDetailViewProps> = ({
  transaction,
  onClose,
  onEdit,
  currencyCode
}) => {
  const isInflow = transaction.type === 'inflow';

  const handlePrintReceipt = () => {
    const receiptTypeLabel = transaction.type === 'inflow' ? 'INGRESO' : 'GASTO';
    
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo - ${transaction.description}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              max-width: 300px;
              margin: 20px auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
            }
            .label {
              font-weight: bold;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              border: 2px solid #000;
            }
            .footer {
              text-align: center;
              border-top: 2px dashed #000;
              padding-top: 10px;
              margin-top: 15px;
              font-size: 12px;
            }
            .type-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-weight: bold;
              ${
                transaction.type === 'inflow'
                  ? 'background-color: #d1fae5; color: #065f46;'
                  : 'background-color: #fee2e2; color: #991b1b;'
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RECIBO DE ${receiptTypeLabel}</h2>
            <p>ID: ${transaction.id}</p>
          </div>

          <div class="row">
            <span class="label">Tipo:</span>
            <span class="type-badge">${transaction.type === 'inflow' ? 'Ingreso' : 'Gasto'}</span>
          </div>

          <div class="row">
            <span class="label">Fecha:</span>
            <span>${formatDate(transaction.timestamp)}</span>
          </div>

          <div class="row">
            <span class="label">Hora:</span>
            <span>${formatTime(transaction.timestamp)}</span>
          </div>

          <div class="row">
            <span class="label">Descripción:</span>
            <span>${transaction.description}</span>
          </div>

          ${
            transaction.category
              ? `
                <div class="row">
                  <span class="label">Categoría:</span>
                  <span>${transaction.category}</span>
                </div>
              `
              : ''
          }

          ${
            transaction.paymentMethod
              ? `
                <div class="row">
                  <span class="label">Método de Pago:</span>
                  <span>${transaction.paymentMethod}</span>
                </div>
              `
              : ''
          }

          <div class="amount">
            TOTAL: ${formatCurrency(transaction.amount, currencyCode)}
          </div>

          <div class="footer">
            <p>Generado el ${formatDate(new Date().toISOString())}</p>
            <p>a las ${formatTime(new Date().toISOString())}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();

      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className={DETAIL_VIEW_CONTAINER}>
      
      <div className={DETAIL_VIEW_HEADER}>
        <h2 className={TEXT_DETAIL_HEADER_TITLE}>Detalles</h2>

        <button onClick={onClose} aria-label="Cerrar" className={ICON_BTN_CLOSE}>
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container">
        
        <div className="bg-white dark:bg-slate-800 pb-8 pt-8 px-6 text-center shadow-sm">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3 ${
              isInflow
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {isInflow ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            {isInflow ? 'Ingreso Confirmado' : 'Gasto Registrado'}
          </div>

          <h1 className={`text-4xl font-extrabold tracking-tight ${
            isInflow ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'
          }`}>
            {isInflow ? '+' : '-'}
            {formatCurrency(transaction.amount, currencyCode)}
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            {formatDate(transaction.timestamp)} • {formatTime(transaction.timestamp)}
          </p>
        </div>

        <div className="mt-4 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4">
          <DetailRow label="Descripción" value={transaction.description} />

          {transaction.category && (
            <DetailRow label="Categoría" value={transaction.category} />
          )}

          {transaction.paymentMethod && (
            <DetailRow label="Método de Pago" value={transaction.paymentMethod} />
          )}

          <DetailRow label="ID Referencia" value={transaction.id} monospace />
        </div>

        <div className="h-6"></div>
      </div>

      <div className={DETAIL_VIEW_FOOTER}>
        <div className="grid grid-cols-2 gap-3">
          
          <button onClick={onEdit} className={BTN_FOOTER_SECONDARY}>
            <PencilIcon className="w-5 h-5" />
            <span>Editar</span>
          </button>

          <button onClick={handlePrintReceipt} className={BTN_FOOTER_PRIMARY}>
            <PrinterIcon className="w-5 h-5" />
            <span>Recibo</span>
          </button>

        </div>
      </div>

    </div>
  );
};

// =============================================================================
// TransactionDetailPage
// =============================================================================
export interface TransactionDetailPageProps {
  transaction?: Transaction;
  transactionId?: string;
  currencyCode?: string;
  onClose?: () => void;
}

export const TransactionDetailPage: React.FC<TransactionDetailPageProps> = (props) => {
  const navigate = useNavigate();
  
  // Use stores with selectors for performance
  const transactions = useTransactionStore(state => state.transactions);
  const storeCurrencyCode = useConfigStore(state => state.currencyCode);
  
  // Resolve transaction - from props or by looking up ID in store
  const transaction = props.transaction ?? 
    (props.transactionId ? transactions.find(t => t.id === props.transactionId) : undefined);
  const currencyCode = props.currencyCode ?? storeCurrencyCode;
  
  const handleClose = () => {
    if (props.onClose) {
      props.onClose();
    } else {
      navigate(paths.home());
    }
  };

  if (!transaction) {
    return (
      <NotFoundView
        message="Transacción no encontrada"
        buttonLabel="Volver al Inicio"
        onBack={handleClose}
      />
    );
  }

  const handleEdit = () => {
    alert('La función de editar estará disponible próximamente');
  };

  return (
    <div className="w-full h-full mx-auto animate-fade-in flex items-stretch">
      <TransactionDetailView
        transaction={transaction}
        onClose={handleClose}
        onEdit={handleEdit}
        currencyCode={currencyCode}
      />
    </div>
  );
};
