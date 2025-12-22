/**
 * services/PurchaseService.ts
 * 
 * Handles purchase/restock operations including:
 * - Completing purchases (updating inventory, creating expense transactions)
 * - Purchase history tracking
 */

import {
  type Transaction,
  type Product,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  generateId,
  reportError,
  createError,
  createStorageAccessor,
} from '../shared';
import type { PurchaseItem } from '../stores/purchaseStore';

// ============================================
// TYPES
// ============================================

export interface PurchaseRecord {
  id: string;
  transactionId: string; // Link to master expense transaction
  supplierId: string | null;
  supplierName: string;
  paymentMethod: string;
  notes: string;
  items: PurchaseRecordItem[];
  total: number;
  createdAt: string;
}

export interface PurchaseRecordItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  stockBefore: number;
  stockAfter: number;
}

// ============================================
// STORAGE ACCESSORS
// ============================================

const purchaseStorage = createStorageAccessor<PurchaseRecord>(
  'microerp_purchases',
  {
    loadErrorMsg: 'Error al cargar historial de compras',
    saveErrorMsg: 'Error al guardar compra',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

const transactionStorage = createStorageAccessor<Transaction>(
  STORAGE_KEYS.TRANSACTIONS,
  {
    loadErrorMsg: 'Error al cargar transacciones',
    saveErrorMsg: 'Error al guardar transacción',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

const productStorage = createStorageAccessor<Product>(
  STORAGE_KEYS.PRODUCTS,
  {
    loadErrorMsg: 'Error al cargar productos',
    saveErrorMsg: 'Error al guardar productos',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

// ============================================
// SERVICE
// ============================================

export const PurchaseService = {
  /**
   * Complete a purchase transaction
   * 
   * This will:
   * 1. Create a single master expense transaction
   * 2. Update stock levels for all products
   * 3. Update product costs to the new purchase cost
   * 4. Store purchase record with line items for drill-down
   * 
   * @returns The purchase record if successful, null otherwise
   */
  completePurchase: (
    items: PurchaseItem[],
    supplierId: string | null,
    supplierName: string,
    paymentMethod: string,
    notes: string
  ): { purchase: PurchaseRecord; transaction: Transaction } | null => {
    if (items.length === 0) {
      reportError(createError('validation', 'No hay items en la compra'));
      return null;
    }

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const purchaseId = generateId();
    const transactionId = generateId();
    const timestamp = new Date().toISOString();

    // Build description for the expense transaction
    const itemCount = items.length;
    const description = supplierName !== 'Sin Proveedor'
      ? `Compra de Inventario - ${supplierName} (${itemCount} producto${itemCount > 1 ? 's' : ''})`
      : `Compra de Inventario (${itemCount} producto${itemCount > 1 ? 's' : ''})`;

    // 1. Create master expense transaction
    const transactions = transactionStorage.get();
    const newTransaction: Transaction = {
      id: transactionId,
      type: 'outflow',
      description,
      amount: total,
      timestamp,
      category: 'Compra de Inventario',
      paymentMethod,
      // Store reference to purchase record for drill-down
      purchaseId,
    };
    transactions.push(newTransaction);

    // 2. Update product stock levels and costs
    const products = productStorage.get();
    const purchaseItems: PurchaseRecordItem[] = [];

    for (const item of items) {
      const productIndex = products.findIndex(p => p.id === item.id);
      
      if (productIndex === -1) {
        reportError(createError('validation', `Producto no encontrado: ${item.name}`));
        continue;
      }

      const product = products[productIndex];
      const stockBefore = product.quantity;
      const stockAfter = stockBefore + item.quantity;

      // Update product
      products[productIndex] = {
        ...product,
        quantity: stockAfter,
        cost: item.unitCost, // Update to latest purchase cost
        updatedAt: timestamp,
      };

      // Record line item
      purchaseItems.push({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitCost: item.unitCost,
        subtotal: item.subtotal,
        stockBefore,
        stockAfter,
      });
    }

    // 3. Create purchase record
    const purchaseRecord: PurchaseRecord = {
      id: purchaseId,
      transactionId,
      supplierId,
      supplierName,
      paymentMethod,
      notes,
      items: purchaseItems,
      total,
      createdAt: timestamp,
    };

    const purchases = purchaseStorage.get();
    purchases.push(purchaseRecord);

    // 4. Save all changes
    const transactionSaved = transactionStorage.save(transactions);
    const productsSaved = productStorage.save(products);
    const purchaseSaved = purchaseStorage.save(purchases);

    if (!transactionSaved || !productsSaved || !purchaseSaved) {
      // Attempt rollback (best effort)
      reportError(createError('storage', 'Error al completar la compra. Algunos cambios pueden no haberse guardado.'));
      return null;
    }

    return { purchase: purchaseRecord, transaction: newTransaction };
  },

  /**
   * Get all purchase records
   */
  getAll: (): PurchaseRecord[] => {
    return purchaseStorage.get().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Get purchase record by ID
   */
  getById: (purchaseId: string): PurchaseRecord | null => {
    return purchaseStorage.get().find(p => p.id === purchaseId) || null;
  },

  /**
   * Get purchase record by transaction ID (for drill-down from expense)
   */
  getByTransactionId: (transactionId: string): PurchaseRecord | null => {
    return purchaseStorage.get().find(p => p.transactionId === transactionId) || null;
  },

  /**
   * Get products sorted by stock level (low stock first)
   */
  getProductsForPurchase: (lowStockThreshold: number = 10): Product[] => {
    const products = productStorage.get();
    
    // Sort: low stock first, then alphabetically
    return products.sort((a, b) => {
      const aIsLow = a.quantity <= lowStockThreshold;
      const bIsLow = b.quantity <= lowStockThreshold;
      
      if (aIsLow && !bIsLow) return -1;
      if (!aIsLow && bIsLow) return 1;
      
      // Within same stock status, sort by stock level (lowest first)
      if (aIsLow && bIsLow) {
        return a.quantity - b.quantity;
      }
      
      // For healthy stock, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  },
};
