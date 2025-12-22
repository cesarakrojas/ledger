/**
 * shared/types.ts - TypeScript Interfaces
 * 
 * Centralized type definitions for the entire application.
 * This file has ZERO dependencies on other app files to prevent circular imports.
 */

// ============================================
// TRANSACTION TYPES
// ============================================

export interface Transaction {
  id: string;
  type: 'inflow' | 'outflow';
  description: string;
  category?: string;
  paymentMethod?: string;
  amount: number;
  timestamp: string;
  /** Cost of goods sold - only for POS sales (inflows from sales) */
  costOfGoods?: number;
  /** Gross profit = amount - costOfGoods */
  grossProfit?: number;
  /** Reference to purchase record - for inventory purchases (outflows) */
  purchaseId?: string;
}

// ============================================
// CONFIGURATION TYPES
// ============================================

export interface CategoryConfig {
  enabled: boolean;
  inflowCategories: string[];
  outflowCategories: string[];
}

export interface PaymentMethodsConfig {
  methods: string[];
}

// ============================================
// INVENTORY TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  /** Stock quantity for the product */
  quantity: number;
  category?: string;
  /** Barcode/SKU for the product */
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

/** Reusable product quantity map used by inflow/purchase forms */
export interface ProductQuantity {
  [productId: string]: number;
}

export interface InventoryFilters {
  searchTerm?: string;
  category?: string;
  lowStock?: boolean;
}

// ============================================
// DEBT TYPES
// ============================================

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  transactionId: string;
}

export interface DebtEntry {
  id: string;
  type: 'receivable' | 'payable'; // cobro pendiente | pago pendiente
  counterparty: string; // client name or supplier name
  amount: number; // current remaining balance
  originalAmount: number; // the original debt amount
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  paidAt?: string;
  linkedTransactionId?: string; // links to Transaction.id when fully paid
  category?: string;
  notes?: string;
  payments?: DebtPayment[]; // history of partial payments
}

// ============================================
// CONTACT TYPES
// ============================================

export interface Contact {
  id: string;
  type: 'client' | 'supplier';
  name: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CURRENCY TYPES
// ============================================

export interface CurrencyOption {
  name: string;
  iso: string;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
}
