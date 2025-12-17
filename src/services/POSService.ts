/**
 * services/POSService.ts - Minimal POS service
 *
 * Provides a small API to complete a sale. This is intentionally lightweight
 * and will be expanded when you provide the POS business code to adapt.
 */

import { TransactionService } from './TransactionService';
import type { Product } from '../shared/types';

export const POSService = {
  /**
   * Complete a sale given a cart description and total amount.
   * Creates a single inflow transaction representing the sale.
   */
  completeSale: (items: { product: Product; quantity: number; unitPrice: number }[], paymentMethod?: string) => {
    const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const description = `Venta POS — ${items.length} item(s)`;
    return TransactionService.add('inflow', description, total, 'POS', paymentMethod);
  },
};

export default POSService;
