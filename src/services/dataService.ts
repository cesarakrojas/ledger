import type { Transaction } from '../types';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { generateId } from '../utils/idGenerator';
import { reportError, createError, ERROR_MESSAGES } from '../utils/errorHandler';
import { createStorageAccessor } from '../utils/performanceUtils';

// Create storage accessor for transactions
const transactionStorage = createStorageAccessor<Transaction>(
  STORAGE_KEYS.TRANSACTIONS,
  {
    loadErrorMsg: 'Error al cargar transacciones',
    saveErrorMsg: 'Error al guardar transacciones',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

// Add a transaction
export const addTransaction = (
  type: 'inflow' | 'outflow',
  description: string,
  amount: number,
  category?: string,
  paymentMethod?: string,
  items?: { productId: string; productName: string; quantity: number; variantName?: string; price: number; }[]
): Transaction | null => {
  const transactions = transactionStorage.get();
  
  const newTransaction: Transaction = {
    id: generateId(),
    type,
    description,
    amount,
    timestamp: new Date().toISOString(),
    category,
    paymentMethod,
    items
  };
  
  transactions.push(newTransaction);
  const saved = transactionStorage.save(transactions);
  
  if (!saved) {
    return null;
  }
  
  return newTransaction;
};

// Get all transactions with filters
export const getTransactionsWithFilters = (filters: {
  startDate?: string;
  endDate?: string;
  type?: 'inflow' | 'outflow';
  searchTerm?: string;
}): Transaction[] => {
  let transactions = transactionStorage.get();
  
  // Filter by date range
  if (filters.startDate) {
    transactions = transactions.filter(t => t.timestamp >= filters.startDate!);
  }
  if (filters.endDate) {
    const endOfDay = new Date(filters.endDate);
    endOfDay.setHours(23, 59, 59, 999);
    transactions = transactions.filter(t => t.timestamp <= endOfDay.toISOString());
  }
  
  // Filter by type
  if (filters.type) {
    transactions = transactions.filter(t => t.type === filters.type);
  }
  
  // Filter by search term
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    transactions = transactions.filter(t =>
      t.description.toLowerCase().includes(term) ||
      t.category?.toLowerCase().includes(term)
    );
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
