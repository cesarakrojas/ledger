/**
 * shared/calculations.ts - Business Calculations
 * 
 * Pure functions for calculating transaction totals and other business metrics.
 */

import type { Transaction } from './types';

// ============================================
// TRANSACTION CALCULATIONS
// ============================================

/**
 * Calculate total of all inflow transactions
 * @param transactions - Array of transactions to sum
 * @returns Total inflow amount
 */
export const calculateTotalInflows = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calculate total of all outflow transactions
 * @param transactions - Array of transactions to sum
 * @returns Total outflow amount
 */
export const calculateTotalOutflows = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);
};
