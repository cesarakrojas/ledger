/**
 * services/POSService.ts - POS service with inventory and COGS tracking
 *
 * Provides API to complete sales with:
 * - Automatic inventory deduction
 * - Cost of Goods Sold (COGS) calculation
 * - Gross profit tracking
 */

import { TransactionService } from './TransactionService';
import { InventoryService } from './InventoryService';
import type { Product } from '../shared/types';

// Custom event for cross-store communication (notify transactionStore)
const TRANSACTIONS_CHANGED_EVENT = 'app:transactions-changed';

/**
 * Dispatch event to notify other stores that transactions have changed.
 * This decouples POSService from transactionStore.
 */
const notifyTransactionsChanged = () => {
  window.dispatchEvent(new CustomEvent(TRANSACTIONS_CHANGED_EVENT));
};

export interface SaleItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  cost: number; // Unit cost for COGS calculation
}

export const POSService = {
  /**
   * Complete a sale given cart items.
   * - Decrements inventory for each item
   * - Calculates Cost of Goods Sold (COGS)
   * - Creates an inflow transaction with COGS tracking
   * 
   * @param items Array of sale items with product, quantity, price, and cost
   * @param paymentMethod Payment method used
   * @returns The created transaction or null if failed
   */
  completeSale: (items: SaleItem[], paymentMethod?: string) => {
    // Calculate totals
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalCOGS = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    
    // Build descriptive sale summary
    const itemSummary = items
      .map(item => `${item.quantity}x ${item.product.name}`)
      .join(', ');
    const description = `Venta POS: ${itemSummary}`;
    
    // Decrement inventory for each item sold
    const stockAdjustments = items.map(item => ({
      productId: item.product.id,
      quantityDelta: -item.quantity // Negative to subtract
    }));
    
    const adjustmentResults = InventoryService.batchAdjustStock(stockAdjustments);
    
    // Log any failed adjustments (but don't block the sale)
    const failedAdjustments = adjustmentResults.filter(r => !r.success);
    if (failedAdjustments.length > 0) {
      console.warn('Some inventory adjustments failed:', failedAdjustments);
    }
    
    // Create transaction with COGS data
    const transaction = TransactionService.add('inflow', description, total, 'POS', paymentMethod, totalCOGS);
    
    // Notify transactionStore that a new transaction was created
    if (transaction) {
      notifyTransactionsChanged();
    }
    
    return transaction;
  },
  
  /**
   * Calculate gross profit from a sale
   * @param saleAmount Total sale amount
   * @param cogs Cost of goods sold
   * @returns Gross profit amount
   */
  calculateGrossProfit: (saleAmount: number, cogs: number): number => {
    return saleAmount - cogs;
  },
  
  /**
   * Calculate gross margin percentage
   * @param saleAmount Total sale amount
   * @param cogs Cost of goods sold
   * @returns Gross margin as percentage (0-100)
   */
  calculateGrossMargin: (saleAmount: number, cogs: number): number => {
    if (saleAmount === 0) return 0;
    return ((saleAmount - cogs) / saleAmount) * 100;
  },
};

export default POSService;
