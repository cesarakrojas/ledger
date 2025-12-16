/**
 * stores/index.ts - Central export for all Zustand stores
 * 
 * Import stores from this file for cleaner imports:
 * import { useTransactionStore, useInventoryStore } from './stores';
 */

// Data stores
import { useTransactionStore, initializeTransactionStore } from './transactionStore';
import { useInventoryStore, initializeInventoryStore } from './inventoryStore';
import { useDebtStore, initializeDebtStore } from './debtStore';
import { useContactStore, initializeContactStore } from './contactStore';

// Config & UI stores
import { useConfigStore, initializeConfigStore } from './configStore';
import { useUIStore } from './uiStore';

// Re-export all stores
export { 
  useTransactionStore, 
  initializeTransactionStore,
  useInventoryStore, 
  initializeInventoryStore,
  useDebtStore, 
  initializeDebtStore,
  useContactStore, 
  initializeContactStore,
  useConfigStore, 
  initializeConfigStore,
  useUIStore 
};

// ============================================
// Combined Store Initialization
// ============================================

/**
 * Initialize all stores on app startup.
 * Returns a cleanup function to remove event listeners.
 * 
 * Usage in App.tsx:
 * useEffect(() => {
 *   const cleanup = initializeAllStores();
 *   return cleanup;
 * }, []);
 */
export const initializeAllStores = (): (() => void) => {
  // Initialize config first (theme, currency, etc.)
  initializeConfigStore();
  
  // Initialize data stores
  const cleanupTransaction = initializeTransactionStore();
  const cleanupInventory = initializeInventoryStore();
  const cleanupDebt = initializeDebtStore();
  const cleanupContact = initializeContactStore();
  
  // Return combined cleanup function
  return () => {
    cleanupTransaction();
    cleanupInventory();
    cleanupDebt();
    cleanupContact();
  };
};
