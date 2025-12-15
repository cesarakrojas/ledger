import type { DebtEntry, Transaction } from '../types';
import * as dataService from './dataService';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { generateId } from '../utils/idGenerator';
import { reportError, createError, ERROR_MESSAGES } from '../utils/errorHandler';
import { createStorageAccessor } from '../utils/performanceUtils';

const STORAGE_KEY = STORAGE_KEYS.DEBTS;

// Create storage accessor for debts
const debtStorage = createStorageAccessor<DebtEntry>(
  STORAGE_KEY,
  {
    loadErrorMsg: 'Error al cargar deudas',
    saveErrorMsg: 'Error al guardar deudas',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

// Update overdue statuses and persist changes
// Called internally to ensure data consistency
const updateOverdueStatuses = (): DebtEntry[] => {
  const debts = debtStorage.get();
  const now = new Date();
  let hasChanges = false;
  
  const updatedDebts = debts.map(debt => {
    if (debt.status === 'pending' && new Date(debt.dueDate) < now) {
      hasChanges = true;
      return { ...debt, status: 'overdue' as const };
    }
    return debt;
  });
  
  // Only persist if there were actual changes
  if (hasChanges) {
    debtStorage.save(updatedDebts);
  }
  
  return updatedDebts;
};

// Get all debts
export const getAllDebts = (): DebtEntry[] => {
  // First, update any overdue statuses and persist
  const debts = updateOverdueStatuses();
  return debts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Migrate category name across all debts
export const migrateCategoryName = (oldName: string, newName: string): number => {
  const debts = debtStorage.get();
  let updatedCount = 0;
  
  const updatedDebts = debts.map(debt => {
    if (debt.category === oldName) {
      updatedCount++;
      return { ...debt, category: newName };
    }
    return debt;
  });
  
  if (updatedCount > 0) {
    debtStorage.save(updatedDebts);
  }
  
  return updatedCount;
};

// Get a single debt by ID
export const getDebtById = (debtId: string): DebtEntry | null => {
  const debts = debtStorage.get();
  return debts.find(d => d.id === debtId) || null;
};

// Create a new debt
export const createDebt = (
  type: 'receivable' | 'payable',
  counterparty: string,
  amount: number,
  description: string,
  dueDate: string,
  category?: string,
  notes?: string
): DebtEntry | null => {
  const debts = debtStorage.get();
  
  const newDebt: DebtEntry = {
    id: generateId(),
    type,
    counterparty: counterparty.trim(),
    amount,
    originalAmount: amount,
    description: description.trim(),
    dueDate,
    status: new Date(dueDate) < new Date() ? 'overdue' : 'pending',
    createdAt: new Date().toISOString(),
    category: category?.trim() || undefined,
    notes: notes?.trim() || undefined,
    payments: []
  };
  
  debts.push(newDebt);
  const saved = debtStorage.save(debts);
  
  if (!saved) {
    return null;
  }
  
  return newDebt;
};

// Update an existing debt
export const updateDebt = (
  debtId: string,
  updates: Partial<Omit<DebtEntry, 'id' | 'createdAt' | 'linkedTransactionId' | 'paidAt'>>
): DebtEntry | null => {
  const debts = debtStorage.get();
  const debtIndex = debts.findIndex(d => d.id === debtId);
  
  if (debtIndex === -1) {
    reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Deuda no encontrada'));
    return null;
  }
  
  const updatedDebt: DebtEntry = {
    ...debts[debtIndex],
    ...updates,
    counterparty: updates.counterparty?.trim() || debts[debtIndex].counterparty,
    description: updates.description?.trim() || debts[debtIndex].description,
    category: updates.category?.trim() || undefined,
    notes: updates.notes?.trim() || undefined
  };
  
  // Update status based on due date if changed
  if (updates.dueDate && updatedDebt.status === 'pending') {
    updatedDebt.status = new Date(updates.dueDate) < new Date() ? 'overdue' : 'pending';
  }
  
  debts[debtIndex] = updatedDebt;
  const saved = debtStorage.save(debts);
  
  if (!saved) {
    return null;
  }
  
  return updatedDebt;
};

// Delete a debt
export const deleteDebt = (debtId: string): boolean => {
  const debts = debtStorage.get();
  const debtExists = debts.some(d => d.id === debtId);
  
  if (!debtExists) {
    reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Deuda no encontrada'));
    return false;
  }
  
  const filteredDebts = debts.filter(d => d.id !== debtId);
  return debtStorage.save(filteredDebts);
};

// Mark debt as paid and create corresponding transaction
export const markAsPaid = (debtId: string): { debt: DebtEntry; transaction: Transaction } | null => {
  const debts = debtStorage.get();
  const debtIndex = debts.findIndex(d => d.id === debtId);
  
  if (debtIndex === -1) {
    reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Deuda no encontrada'));
    return null;
  }
  
  const debt = debts[debtIndex];
  
  if (debt.status === 'paid') {
    reportError(createError('validation', 'La deuda ya está marcada como pagada'));
    return null;
  }
  
  // Create corresponding transaction
  const transactionType = debt.type === 'receivable' ? 'inflow' : 'outflow';
  const transactionDescription = debt.type === 'receivable'
    ? `Abono cobrado: ${debt.counterparty} - ${debt.description}`
    : `Abono pagado: ${debt.counterparty} - ${debt.description}`;
  
  const transaction = dataService.addTransaction(
    transactionType,
    transactionDescription,
    debt.amount,
    debt.category,
    undefined // paymentMethod
  );
  
  if (!transaction) {
    reportError(createError('storage', 'Error al crear transacción para el pago'));
    return null;
  }
  
  // Create final payment record
  const finalPayment = {
    id: generateId(),
    amount: debt.amount,
    date: new Date().toISOString(),
    transactionId: transaction.id
  };
  
  // Update debt status
  const updatedDebt: DebtEntry = {
    ...debt,
    amount: 0,
    originalAmount: debt.originalAmount || debt.amount, // Migrate old debts
    status: 'paid',
    paidAt: new Date().toISOString(),
    linkedTransactionId: transaction.id,
    payments: [...(debt.payments || []), finalPayment]
  };
  
  debts[debtIndex] = updatedDebt;
  const saved = debtStorage.save(debts);
  
  if (!saved) {
    return null;
  }
  
  return { debt: updatedDebt, transaction };
};

// Make a partial payment on a debt
export const makePartialPayment = (
  debtId: string, 
  paymentAmount: number
): { debt: DebtEntry; transaction: Transaction } | null => {
  const debts = debtStorage.get();
  const debtIndex = debts.findIndex(d => d.id === debtId);
  
  if (debtIndex === -1) {
    reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Deuda no encontrada'));
    return null;
  }
  
  const debt = debts[debtIndex];
  
  if (debt.status === 'paid') {
    reportError(createError('validation', 'La deuda ya está marcada como pagada'));
    return null;
  }
  
  if (paymentAmount <= 0) {
    reportError(createError('validation', 'El monto del abono debe ser mayor a 0'));
    return null;
  }
  
  if (paymentAmount > debt.amount) {
    reportError(createError('validation', 'El monto del abono no puede ser mayor al saldo'));
    return null;
  }
  
  // Create corresponding transaction for the partial payment
  const transactionType = debt.type === 'receivable' ? 'inflow' : 'outflow';
  const transactionDescription = debt.type === 'receivable'
    ? `Abono cobrado: ${debt.counterparty} - ${debt.description}`
    : `Abono pagado: ${debt.counterparty} - ${debt.description}`;
  
  const transaction = dataService.addTransaction(
    transactionType,
    transactionDescription,
    paymentAmount,
    debt.category,
    undefined // paymentMethod
  );
  
  if (!transaction) {
    reportError(createError('storage', 'Error al crear transacción para el abono'));
    return null;
  }
  
  const newAmount = debt.amount - paymentAmount;
  const isFullyPaid = newAmount <= 0;
  
  // Create payment record
  const newPayment = {
    id: generateId(),
    amount: paymentAmount,
    date: new Date().toISOString(),
    transactionId: transaction.id
  };
  
  // Update debt with payment history
  const updatedDebt: DebtEntry = {
    ...debt,
    amount: isFullyPaid ? 0 : newAmount,
    originalAmount: debt.originalAmount || debt.amount + paymentAmount, // Migrate old debts
    status: isFullyPaid ? 'paid' : debt.status,
    paidAt: isFullyPaid ? new Date().toISOString() : debt.paidAt,
    linkedTransactionId: isFullyPaid ? transaction.id : debt.linkedTransactionId,
    payments: [...(debt.payments || []), newPayment]
  };
  
  debts[debtIndex] = updatedDebt;
  const saved = debtStorage.save(debts);
  
  if (!saved) {
    return null;
  }
  
  return { debt: updatedDebt, transaction };
};

// Subscribe to debt changes
export const subscribeToDebts = (callback: (debts: DebtEntry[]) => void): () => void => {
  // Initial call
  callback(getAllDebts());
  
  // Listen for storage changes
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getAllDebts());
    }
  };
  
  window.addEventListener('storage', handler);
  
  return () => window.removeEventListener('storage', handler);
};

// Get summary statistics
export const getDebtStats = () => {
  const debts = getAllDebts();
  
  const receivables = debts.filter(d => d.type === 'receivable');
  const payables = debts.filter(d => d.type === 'payable');
  
  const totalReceivablesPending = receivables
    .filter(d => d.status === 'pending' || d.status === 'overdue')
    .reduce((sum, d) => sum + d.amount, 0);
  
  const totalPayablesPending = payables
    .filter(d => d.status === 'pending' || d.status === 'overdue')
    .reduce((sum, d) => sum + d.amount, 0);
  
  const overdueReceivables = receivables.filter(d => d.status === 'overdue').length;
  const overduePayables = payables.filter(d => d.status === 'overdue').length;
  
  return {
    totalReceivablesPending,
    totalPayablesPending,
    netBalance: totalReceivablesPending - totalPayablesPending,
    overdueReceivables,
    overduePayables,
    totalPendingDebts: debts.filter(d => d.status === 'pending' || d.status === 'overdue').length
  };
};
