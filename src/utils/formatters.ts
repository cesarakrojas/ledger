import { getCurrencySymbol, DEFAULT_CURRENCY } from './constants';

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

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
