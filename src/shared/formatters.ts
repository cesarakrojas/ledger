/**
 * shared/formatters.ts - Data Formatters
 * 
 * Utility functions for formatting currency, dates, and times.
 */

import { getCurrencySymbol, DEFAULT_CURRENCY } from './currency';

// ============================================
// CURRENCY FORMATTING
// ============================================

/**
 * Format amount as currency string
 * @param amount - The numeric amount to format
 * @param currencyCode - The currency code (e.g., 'USD', 'COP'). Defaults to DEFAULT_CURRENCY.
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined, currencyCode: string = DEFAULT_CURRENCY): string => {
  if (amount === undefined) return '$0.00';
  
  const symbol = getCurrencySymbol(currencyCode);
  
  // Format number with thousand separators and 2 decimals
  const formattedNumber = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `${symbol} ${formattedNumber}`;
};

// ============================================
// DATE/TIME FORMATTING
// ============================================

/**
 * Format date string to localized date
 * @param dateString - ISO date string
 * @returns Formatted date in Spanish locale
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Format date string to localized time
 * @param dateString - ISO date string
 * @returns Formatted time in Spanish locale
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
