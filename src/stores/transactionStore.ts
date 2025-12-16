/**
 * transactionStore.ts - Zustand store for transaction state management
 * 
 * Manages all transaction-related state and actions.
 * Replaces the transaction state from App.tsx.
 */

import { create } from 'zustand';
import { TransactionService } from '../CoreServices';
import type { Transaction } from '../SharedDefs';
import { calculateTotalInflows, calculateTotalOutflows } from '../SharedDefs';

// ============================================
// Helper Functions
// ============================================

/**
 * Filter transactions to only include today's transactions
 */
const filterTodayTransactions = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  return transactions.filter(t => {
    const txDate = new Date(t.timestamp);
    return txDate >= todayStart && txDate <= todayEnd;
  });
};

// ============================================
// Store Types
// ============================================

interface TransactionState {
  // Data
  transactions: Transaction[];
  isLoading: boolean;
  
  // Derived state (computed from transactions)
  todayTransactions: Transaction[];
  totalInflows: number;
  totalOutflows: number;
  inflowCount: number;
  outflowCount: number;
  
  // Actions
  loadTransactions: () => void;
  addTransaction: (
    type: 'inflow' | 'outflow',
    description: string,
    amount: number,
    category?: string,
    paymentMethod?: string
  ) => Transaction | null;
  getById: (id: string) => Transaction | undefined;
  
  // For category migrations
  migrateCategoryName: (oldName: string, newName: string) => number;
}

// ============================================
// Store Implementation
// ============================================

export const useTransactionStore = create<TransactionState>((set, get) => ({
  // Initial state
  transactions: [],
  todayTransactions: [],
  totalInflows: 0,
  totalOutflows: 0,
  inflowCount: 0,
  outflowCount: 0,
  isLoading: true,
  
  /**
   * Load all transactions from storage and compute derived state
   */
  loadTransactions: () => {
    const txs = TransactionService.getWithFilters({});
    const today = filterTodayTransactions(txs);
    
    set({
      transactions: txs,
      todayTransactions: today,
      totalInflows: calculateTotalInflows(today),
      totalOutflows: calculateTotalOutflows(today),
      inflowCount: today.filter(t => t.type === 'inflow').length,
      outflowCount: today.filter(t => t.type === 'outflow').length,
      isLoading: false,
    });
  },
  
  /**
   * Add a new transaction and refresh the store
   */
  addTransaction: (type, description, amount, category, paymentMethod) => {
    const result = TransactionService.add(type, description, amount, category, paymentMethod);
    if (result) {
      // Reload to sync all derived state
      get().loadTransactions();
    }
    return result;
  },
  
  /**
   * Get a transaction by ID
   */
  getById: (id) => get().transactions.find(t => t.id === id),
  
  /**
   * Migrate category name across all transactions
   */
  migrateCategoryName: (oldName, newName) => {
    const count = TransactionService.migrateCategoryName(oldName, newName);
    if (count > 0) {
      get().loadTransactions();
    }
    return count;
  },
}));

// ============================================
// Store Initialization Hook
// ============================================

/**
 * Initialize the transaction store on app startup.
 * Call this once in your root component.
 */
export const initializeTransactionStore = () => {
  useTransactionStore.getState().loadTransactions();
  
  // Listen for storage changes (multi-tab sync)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'app_transactions') {
      useTransactionStore.getState().loadTransactions();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};
