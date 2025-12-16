/**
 * transactionStore.ts - Zustand store for transaction state management
 * 
 * Manages all transaction-related state and actions.
 * Replaces the transaction state from App.tsx.
 * 
 * Uses computed selectors for derived state to avoid redundant calculations.
 */

import { create } from 'zustand';
import { TransactionService } from '../services';
import type { Transaction } from '../shared';
import { calculateTotalInflows, calculateTotalOutflows } from '../shared';

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
// Memoization Cache for Computed Selectors
// ============================================

// Simple memoization for derived values - only recomputes when transactions change
let memoCache: {
  transactions: Transaction[] | null;
  todayTransactions: Transaction[];
  totalInflows: number;
  totalOutflows: number;
  inflowCount: number;
  outflowCount: number;
} = {
  transactions: null,
  todayTransactions: [],
  totalInflows: 0,
  totalOutflows: 0,
  inflowCount: 0,
  outflowCount: 0,
};

const computeDerivedState = (transactions: Transaction[]) => {
  // Only recompute if transactions array reference changed
  if (memoCache.transactions === transactions) {
    return memoCache;
  }
  
  const today = filterTodayTransactions(transactions);
  
  memoCache = {
    transactions,
    todayTransactions: today,
    totalInflows: calculateTotalInflows(today),
    totalOutflows: calculateTotalOutflows(today),
    inflowCount: today.filter(t => t.type === 'inflow').length,
    outflowCount: today.filter(t => t.type === 'outflow').length,
  };
  
  return memoCache;
};

// ============================================
// Store Types
// ============================================

interface TransactionState {
  // Core data (only source of truth)
  transactions: Transaction[];
  isLoading: boolean;
  
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
  // Initial state - only core data, no derived state
  transactions: [],
  isLoading: true,
  
  /**
   * Load all transactions from storage
   */
  loadTransactions: () => {
    const txs = TransactionService.getWithFilters({});
    set({
      transactions: txs,
      isLoading: false,
    });
  },
  
  /**
   * Add a new transaction with optimistic update
   * Immediately updates state with the new transaction instead of full reload
   */
  addTransaction: (type, description, amount, category, paymentMethod) => {
    const result = TransactionService.add(type, description, amount, category, paymentMethod);
    if (result) {
      // Optimistic update: prepend new transaction to existing list
      set(state => ({
        transactions: [result, ...state.transactions],
      }));
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
// Computed Selectors (Memoized)
// ============================================

/**
 * Selector to get today's transactions (computed, memoized)
 */
export const selectTodayTransactions = (state: TransactionState) => 
  computeDerivedState(state.transactions).todayTransactions;

/**
 * Selector to get total inflows for today (computed, memoized)
 */
export const selectTotalInflows = (state: TransactionState) => 
  computeDerivedState(state.transactions).totalInflows;

/**
 * Selector to get total outflows for today (computed, memoized)
 */
export const selectTotalOutflows = (state: TransactionState) => 
  computeDerivedState(state.transactions).totalOutflows;

/**
 * Selector to get inflow count for today (computed, memoized)
 */
export const selectInflowCount = (state: TransactionState) => 
  computeDerivedState(state.transactions).inflowCount;

/**
 * Selector to get outflow count for today (computed, memoized)
 */
export const selectOutflowCount = (state: TransactionState) => 
  computeDerivedState(state.transactions).outflowCount;

// ============================================
// Store Initialization Hook
// ============================================

// Custom event name for cross-store communication
const TRANSACTIONS_CHANGED_EVENT = 'app:transactions-changed';

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
  
  // Listen for cross-store transaction change events (e.g., from debtStore)
  const handleTransactionsChanged = () => {
    useTransactionStore.getState().loadTransactions();
  };
  
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener(TRANSACTIONS_CHANGED_EVENT, handleTransactionsChanged);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener(TRANSACTIONS_CHANGED_EVENT, handleTransactionsChanged);
  };
};
