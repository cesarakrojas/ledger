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
export { POSService } from './POSService';
export { PurchaseService } from './PurchaseService';
export type { PurchaseRecord, PurchaseRecordItem } from './PurchaseService';

// ============================================
// LEGACY FUNCTION EXPORTS
// @deprecated - Use service objects instead (e.g., TransactionService.add)
// These exports will be removed in a future version.
// Migration guide:
//   - addTransaction -> TransactionService.add
//   - getTransactionsWithFilters -> TransactionService.getWithFilters
//   - getAllProducts -> InventoryService.getAll
//   - createProduct -> InventoryService.create
//   - etc.
// ============================================

// Transaction Service
/** @deprecated Use TransactionService.add instead */
export { addTransaction } from './TransactionService';
/** @deprecated Use TransactionService.getWithFilters instead */
export { getTransactionsWithFilters } from './TransactionService';
/** @deprecated Use TransactionService.migrateCategoryName instead */
export { migrateTransactionCategoryName } from './TransactionService';

// Inventory Service
/** @deprecated Use InventoryService.getAll instead */
export { getAllProducts } from './InventoryService';
/** @deprecated Use InventoryService.create instead */
export { createProduct } from './InventoryService';
/** @deprecated Use InventoryService.update instead */
export { updateProduct } from './InventoryService';
/** @deprecated Use InventoryService.delete instead */
export { deleteProduct } from './InventoryService';
/** @deprecated Use InventoryService.getById instead */
export { getProductById } from './InventoryService';
/** @deprecated Use InventoryService.getCategories instead */
export { getProductCategories } from './InventoryService';
/** @deprecated Use InventoryService.subscribe instead */
export { subscribeToInventory } from './InventoryService';
/** @deprecated Use InventoryService.migrateCategoryName instead */
export { migrateProductCategoryName } from './InventoryService';

// Debt Service
/** @deprecated Use DebtService.getAll instead */
export { getAllDebts } from './DebtService';
/** @deprecated Use DebtService.getById instead */
export { getDebtById } from './DebtService';
/** @deprecated Use DebtService.create instead */
export { createDebt } from './DebtService';
/** @deprecated Use DebtService.update instead */
export { updateDebt } from './DebtService';
/** @deprecated Use DebtService.delete instead */
export { deleteDebt } from './DebtService';
/** @deprecated Use DebtService.markAsPaid instead */
export { markAsPaid } from './DebtService';
/** @deprecated Use DebtService.makePartialPayment instead */
export { makePartialPayment } from './DebtService';
/** @deprecated Use DebtService.subscribe instead */
export { subscribeToDebts } from './DebtService';
/** @deprecated Use DebtService.getStats instead */
export { getDebtStats } from './DebtService';
/** @deprecated Use DebtService.migrateCategoryName instead */
export { migrateDebtCategoryName } from './DebtService';

// Contact Service
/** @deprecated Use ContactService.getAll instead */
export { getAllContacts } from './ContactService';
/** @deprecated Use ContactService.getById instead */
export { getContactById } from './ContactService';
/** @deprecated Use ContactService.create instead */
export { createContact } from './ContactService';
/** @deprecated Use ContactService.update instead */
export { updateContact } from './ContactService';
/** @deprecated Use ContactService.delete instead */
export { deleteContact } from './ContactService';
/** @deprecated Use ContactService.searchByName instead */
export { searchContactsByName } from './ContactService';
