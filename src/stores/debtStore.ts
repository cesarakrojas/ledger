/**
 * debtStore.ts - Zustand store for debt/libreta state management
 * 
 * Manages all debt-related state and actions.
 * Replaces the debts state from App.tsx and local state in DebtsDomain.
 */

import { create } from 'zustand';
import { DebtService } from '../services';
import type { DebtEntry, Transaction } from '../shared';
import { STORAGE_KEYS } from '../shared';

// Custom event for cross-store communication (decoupled from transactionStore)
const TRANSACTIONS_CHANGED_EVENT = 'app:transactions-changed';

/**
 * Dispatch event to notify other stores that transactions have changed.
 * This decouples debtStore from transactionStore.
 */
const notifyTransactionsChanged = () => {
  window.dispatchEvent(new CustomEvent(TRANSACTIONS_CHANGED_EVENT));
};

// ============================================
// Store Types
// ============================================

interface DebtStats {
  totalReceivablesPending: number;
  totalPayablesPending: number;
  netBalance: number;
  overdueReceivables: number;
  overduePayables: number;
  totalPendingDebts: number;
}

interface DebtState {
  // Data
  debts: DebtEntry[];
  stats: DebtStats;
  isLoading: boolean;
  
  // Actions
  loadDebts: () => void;
  createDebt: (
    type: 'receivable' | 'payable',
    counterparty: string,
    amount: number,
    description: string,
    dueDate: string,
    category?: string,
    notes?: string
  ) => DebtEntry | null;
  updateDebt: (
    debtId: string,
    updates: Partial<Omit<DebtEntry, 'id' | 'createdAt' | 'linkedTransactionId' | 'paidAt'>>
  ) => DebtEntry | null;
  deleteDebt: (debtId: string) => boolean;
  markAsPaid: (debtId: string) => { debt: DebtEntry; transaction: Transaction } | null;
  makePartialPayment: (debtId: string, amount: number) => { debt: DebtEntry; transaction: Transaction } | null;
  getById: (id: string) => DebtEntry | undefined;
  
  // For category migrations
  migrateCategoryName: (oldName: string, newName: string) => number;
}

// ============================================
// Store Implementation
// ============================================

export const useDebtStore = create<DebtState>((set, get) => ({
  // Initial state
  debts: [],
  stats: {
    totalReceivablesPending: 0,
    totalPayablesPending: 0,
    netBalance: 0,
    overdueReceivables: 0,
    overduePayables: 0,
    totalPendingDebts: 0,
  },
  isLoading: true,
  
  /**
   * Load all debts from storage and compute stats
   */
  loadDebts: () => {
    const debts = DebtService.getAll();
    const stats = DebtService.getStats();
    
    set({
      debts,
      stats,
      isLoading: false,
    });
  },
  
  /**
   * Create a new debt with optimistic update
   */
  createDebt: (type, counterparty, amount, description, dueDate, category, notes) => {
    const result = DebtService.create(type, counterparty, amount, description, dueDate, category, notes);
    if (result) {
      // Optimistic update: add new debt to state and recalc stats
      const isOverdue = new Date(dueDate) < new Date();
      set(state => ({
        debts: [...state.debts, result],
        stats: {
          ...state.stats,
          totalReceivablesPending: state.stats.totalReceivablesPending + (type === 'receivable' ? amount : 0),
          totalPayablesPending: state.stats.totalPayablesPending + (type === 'payable' ? amount : 0),
          netBalance: state.stats.netBalance + (type === 'receivable' ? amount : -amount),
          overdueReceivables: state.stats.overdueReceivables + (type === 'receivable' && isOverdue ? 1 : 0),
          overduePayables: state.stats.overduePayables + (type === 'payable' && isOverdue ? 1 : 0),
          totalPendingDebts: state.stats.totalPendingDebts + 1,
        },
      }));
    }
    return result;
  },
  
  /**
   * Update an existing debt - reload stats since they may change
   */
  updateDebt: (debtId, updates) => {
    const result = DebtService.update(debtId, updates);
    if (result) {
      // For updates, reload stats since amount/type/dueDate changes affect stats
      const stats = DebtService.getStats();
      set(state => ({
        debts: state.debts.map(d => d.id === debtId ? result : d),
        stats,
      }));
    }
    return result;
  },
  
  /**
   * Delete a debt with optimistic update
   */
  deleteDebt: (debtId) => {
    const debt = get().debts.find(d => d.id === debtId);
    const result = DebtService.delete(debtId);
    if (result && debt && debt.status === 'pending') {
      // Optimistic update: remove debt from state and recalc stats
      const isOverdue = new Date(debt.dueDate) < new Date();
      set(state => ({
        debts: state.debts.filter(d => d.id !== debtId),
        stats: {
          ...state.stats,
          totalReceivablesPending: state.stats.totalReceivablesPending - (debt.type === 'receivable' ? debt.amount : 0),
          totalPayablesPending: state.stats.totalPayablesPending - (debt.type === 'payable' ? debt.amount : 0),
          netBalance: state.stats.netBalance - (debt.type === 'receivable' ? debt.amount : -debt.amount),
          overdueReceivables: state.stats.overdueReceivables - (debt.type === 'receivable' && isOverdue ? 1 : 0),
          overduePayables: state.stats.overduePayables - (debt.type === 'payable' && isOverdue ? 1 : 0),
          totalPendingDebts: state.stats.totalPendingDebts - 1,
        },
      }));
    } else if (result) {
      // Paid debt - just remove from list
      set(state => ({
        debts: state.debts.filter(d => d.id !== debtId),
      }));
    }
    return result;
  },
  
  /**
   * Mark a debt as fully paid with optimistic update (creates a transaction)
   */
  markAsPaid: (debtId) => {
    const debt = get().debts.find(d => d.id === debtId);
    const result = DebtService.markAsPaid(debtId);
    if (result && debt) {
      // Optimistic update: update debt status and recalc stats
      const isOverdue = new Date(debt.dueDate) < new Date();
      set(state => ({
        debts: state.debts.map(d => d.id === debtId ? result.debt : d),
        stats: {
          ...state.stats,
          totalReceivablesPending: state.stats.totalReceivablesPending - (debt.type === 'receivable' ? debt.amount : 0),
          totalPayablesPending: state.stats.totalPayablesPending - (debt.type === 'payable' ? debt.amount : 0),
          netBalance: state.stats.netBalance - (debt.type === 'receivable' ? debt.amount : -debt.amount),
          overdueReceivables: state.stats.overdueReceivables - (debt.type === 'receivable' && isOverdue ? 1 : 0),
          overduePayables: state.stats.overduePayables - (debt.type === 'payable' && isOverdue ? 1 : 0),
          totalPendingDebts: state.stats.totalPendingDebts - 1,
        },
      }));
      // Notify other stores that transactions changed (decoupled via events)
      notifyTransactionsChanged();
    }
    return result;
  },
  
  /**
   * Make a partial payment on a debt with optimistic update (creates a transaction)
   */
  makePartialPayment: (debtId, amount) => {
    const debt = get().debts.find(d => d.id === debtId);
    const result = DebtService.makePartialPayment(debtId, amount);
    if (result && debt) {
      // Optimistic update: update debt and recalc stats (reduce pending amount)
      set(state => ({
        debts: state.debts.map(d => d.id === debtId ? result.debt : d),
        stats: {
          ...state.stats,
          totalReceivablesPending: state.stats.totalReceivablesPending - (debt.type === 'receivable' ? amount : 0),
          totalPayablesPending: state.stats.totalPayablesPending - (debt.type === 'payable' ? amount : 0),
          netBalance: state.stats.netBalance - (debt.type === 'receivable' ? amount : -amount),
        },
      }));
      // Notify other stores that transactions changed (decoupled via events)
      notifyTransactionsChanged();
    }
    return result;
  },
  
  /**
   * Get a debt by ID from the current state
   */
  getById: (id) => get().debts.find(d => d.id === id),
  
  /**
   * Migrate category name across all debts
   */
  migrateCategoryName: (oldName, newName) => {
    const count = DebtService.migrateCategoryName(oldName, newName);
    if (count > 0) {
      get().loadDebts();
    }
    return count;
  },
}));

// ============================================
// Store Initialization Hook
// ============================================

/**
 * Initialize the debt store on app startup.
 * Call this once in your root component.
 */
export const initializeDebtStore = () => {
  useDebtStore.getState().loadDebts();
  
  // Listen for storage changes (multi-tab sync)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.DEBTS) {
      useDebtStore.getState().loadDebts();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};
