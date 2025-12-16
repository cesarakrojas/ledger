/**
 * services/index.ts - Barrel Export
 * 
 * Re-exports all services for convenient imports.
 * 
 * Usage:
 *   import { TransactionService, InventoryService } from './services';
 * 
 * Or import from specific modules:
 *   import { TransactionService } from './services/TransactionService';
 */

// ============================================
// SERVICE EXPORTS
// ============================================

export { TransactionService } from './TransactionService';
export { InventoryService } from './InventoryService';
export { DebtService } from './DebtService';
export { ContactService } from './ContactService';

// ============================================
// LEGACY FUNCTION EXPORTS (for backward compatibility)
// ============================================

// Transaction Service
export {
  addTransaction,
  getTransactionsWithFilters,
  migrateTransactionCategoryName,
} from './TransactionService';

// Inventory Service
export {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductCategories,
  subscribeToInventory,
  migrateProductCategoryName,
} from './InventoryService';

// Debt Service
export {
  getAllDebts,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
  markAsPaid,
  makePartialPayment,
  subscribeToDebts,
  getDebtStats,
  migrateDebtCategoryName,
} from './DebtService';

// Contact Service
export {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  searchContactsByName,
} from './ContactService';
