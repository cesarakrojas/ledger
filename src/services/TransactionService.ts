/**
 * services/TransactionService.ts
 * 
 * Handles all transaction-related CRUD operations and business logic.
 * Transactions represent inflows (income) and outflows (expenses).
 */

import {
  type Transaction,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  generateId,
  reportError,
  createError,
  createStorageAccessor,
} from '../shared';

// ============================================
// STORAGE ACCESSOR
// ============================================

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

// ============================================
// SERVICE
// ============================================

export const TransactionService = {
  /**
   * Add a new transaction
   */
  add: (
    type: 'inflow' | 'outflow',
    description: string,
    amount: number,
    category?: string,
    paymentMethod?: string
  ): Transaction | null => {
    const transactions = transactionStorage.get();
    
    const newTransaction: Transaction = {
      id: generateId(),
      type,
      description,
      amount,
      timestamp: new Date().toISOString(),
      category,
      paymentMethod
    };
    
    transactions.push(newTransaction);
    const saved = transactionStorage.save(transactions);
    
    if (!saved) {
      return null;
    }
    
    return newTransaction;
  },

  /**
   * Get transactions with optional filters
   */
  getWithFilters: (filters: {
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
  },

  /**
   * Migrate category name across all transactions
   * Used when renaming a category in settings
   */
  migrateCategoryName: (oldName: string, newName: string): number => {
    const transactions = transactionStorage.get();
    let updatedCount = 0;
    
    const updatedTransactions = transactions.map(transaction => {
      if (transaction.category === oldName) {
        updatedCount++;
        return { ...transaction, category: newName };
      }
      return transaction;
    });
    
    if (updatedCount > 0) {
      transactionStorage.save(updatedTransactions);
    }
    
    return updatedCount;
  },
};

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

export const addTransaction = TransactionService.add;
export const getTransactionsWithFilters = TransactionService.getWithFilters;
export const migrateTransactionCategoryName = TransactionService.migrateCategoryName;
