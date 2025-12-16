/**
 * shared/utils.ts - General Utilities
 * 
 * Miscellaneous utility functions used across the application.
 */

import type { Product, Transaction } from './types';

// ============================================
// ID GENERATION
// ============================================

/**
 * Generate a unique ID for entities
 * Format: timestamp_randomString
 * Example: 1732617600000_k8j3m9p
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// ============================================
// COMMERCE UTILITIES
// ============================================

/**
 * Returns top 3 products by frequency in past transactions or most recent
 * @param allProducts - Array of all available products
 * @param transactions - Array of transactions to analyze (passed from caller)
 * @returns Top 3 products sorted by usage frequency or recency
 */
export const getTopProducts = (allProducts: Product[], _transactions: Transaction[] = []): Product[] => {
  try {
    // Note: This function was designed for itemized transactions which are no longer supported
    // Now it simply returns the 3 most recently created products
    return [...allProducts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  } catch (error) {
    return allProducts.slice(0, 3);
  }
};
