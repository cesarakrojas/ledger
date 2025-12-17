/**
 * stores/index.ts - Central export for all Zustand stores
 * 
 * Import stores from this file for cleaner imports:
 * import { useTransactionStore, useInventoryStore } from './stores';
 */

// Data stores
import { 
  useTransactionStore, 
  initializeTransactionStore,
  selectTodayTransactions,
  selectTotalInflows,
  selectTotalOutflows,
  selectInflowCount,
  selectOutflowCount,
} from './transactionStore';
import { useInventoryStore, initializeInventoryStore } from './inventoryStore';
import { useDebtStore, initializeDebtStore } from './debtStore';
import { useContactStore, initializeContactStore } from './contactStore';
import { usePOSStore, initializePOSStore } from './posStore';

// Config & UI stores
import { useConfigStore, initializeConfigStore } from './configStore';
import { useUIStore } from './uiStore';

// Re-export all stores
export { 
  useTransactionStore, 
  initializeTransactionStore,
  // Computed selectors for transactions
  selectTodayTransactions,
  selectTotalInflows,
  selectTotalOutflows,
  selectInflowCount,
  selectOutflowCount,
  
  useInventoryStore, 
  initializeInventoryStore,
  useDebtStore, 
  initializeDebtStore,
  useContactStore, 
  initializeContactStore,
  usePOSStore,
  initializePOSStore,
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
  const cleanupPOS = initializePOSStore();
  
  // Return combined cleanup function
  return () => {
    cleanupTransaction();
    cleanupInventory();
    cleanupDebt();
    cleanupContact();
    cleanupPOS();
  };
};
