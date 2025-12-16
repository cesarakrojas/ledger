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
import { useTransactionStore } from './transactionStore';

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
   * Create a new debt and refresh the store
   */
  createDebt: (type, counterparty, amount, description, dueDate, category, notes) => {
    const result = DebtService.create(type, counterparty, amount, description, dueDate, category, notes);
    if (result) {
      get().loadDebts();
    }
    return result;
  },
  
  /**
   * Update an existing debt
   */
  updateDebt: (debtId, updates) => {
    const result = DebtService.update(debtId, updates);
    if (result) {
      get().loadDebts();
    }
    return result;
  },
  
  /**
   * Delete a debt
   */
  deleteDebt: (debtId) => {
    const result = DebtService.delete(debtId);
    if (result) {
      get().loadDebts();
    }
    return result;
  },
  
  /**
   * Mark a debt as fully paid (creates a transaction)
   */
  markAsPaid: (debtId) => {
    const result = DebtService.markAsPaid(debtId);
    if (result) {
      get().loadDebts();
      // Also refresh transactions since a new one was created
      useTransactionStore.getState().loadTransactions();
    }
    return result;
  },
  
  /**
   * Make a partial payment on a debt (creates a transaction)
   */
  makePartialPayment: (debtId, amount) => {
    const result = DebtService.makePartialPayment(debtId, amount);
    if (result) {
      get().loadDebts();
      // Also refresh transactions since a new one was created
      useTransactionStore.getState().loadTransactions();
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
