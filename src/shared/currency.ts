/**
 * shared/currency.ts - Currency Configuration
 * 
 * Currency definitions and helper functions for multi-currency support.
 */

import type { CurrencyOption } from './types';

// ============================================
// CURRENCY DATA
// ============================================

export const CURRENCIES: CurrencyOption[] = [
  { name: "Estados Unidos", iso: "us", currency_name: "Dólar estadounidense", currency_code: "USD", currency_symbol: "$" },
  { name: "Argentina", iso: "ar", currency_name: "Peso argentino", currency_code: "ARS", currency_symbol: "$" },
  { name: "Bolivia", iso: "bo", currency_name: "Boliviano", currency_code: "BOB", currency_symbol: "Bs" },
  { name: "Brazil", iso: "br", currency_name: "Real brasileño", currency_code: "BRL", currency_symbol: "R$" },
  { name: "Chile", iso: "cl", currency_name: "Peso chileno", currency_code: "CLP", currency_symbol: "$" },
  { name: "Colombia", iso: "co", currency_name: "Peso colombiano", currency_code: "COP", currency_symbol: "$" },
  { name: "Costa Rica", iso: "cr", currency_name: "Colón costarricense", currency_code: "CRC", currency_symbol: "₡" },
  { name: "Cuba", iso: "cu", currency_name: "Peso cubano", currency_code: "CUP", currency_symbol: "$" },
  { name: "Ecuador", iso: "ec", currency_name: "Dólar estadounidense", currency_code: "USD", currency_symbol: "$" },
  { name: "El Salvador", iso: "sv", currency_name: "Dólar estadounidense", currency_code: "USD", currency_symbol: "$" },
  { name: "Guatemala", iso: "gt", currency_name: "Quetzal guatemalteco", currency_code: "GTQ", currency_symbol: "Q" },
  { name: "Honduras", iso: "hn", currency_name: "Lempira hondureña", currency_code: "HNL", currency_symbol: "L" },
  { name: "Mexico", iso: "mx", currency_name: "Peso mexicano", currency_code: "MXN", currency_symbol: "$" },
  { name: "Nicaragua", iso: "ni", currency_name: "Córdoba nicaragüense", currency_code: "NIO", currency_symbol: "C$" },
  { name: "Panama", iso: "pa", currency_name: "Balboa/Dólar estadounidense", currency_code: "PAB", currency_symbol: "B/." },
  { name: "Paraguay", iso: "py", currency_name: "Guaraní paraguayo", currency_code: "PYG", currency_symbol: "₲" },
  { name: "Peru", iso: "pe", currency_name: "Sol peruano", currency_code: "PEN", currency_symbol: "S/." },
  { name: "Spain", iso: "es", currency_name: "Euro", currency_code: "EUR", currency_symbol: "€" },
  { name: "Uruguay", iso: "uy", currency_name: "Peso uruguayo", currency_code: "UYU", currency_symbol: "$" },
  { name: "Venezuela", iso: "ve", currency_name: "Bolívar", currency_code: "VES", currency_symbol: "Bs" }
];

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_COUNTRY_ISO = "us"; // United States
export const DEFAULT_CURRENCY = "USD";

// ============================================
// CURRENCY HELPERS
// ============================================

/**
 * Get currency option by country ISO code
 */
export const getCurrencyByIso = (countryIso: string): CurrencyOption | undefined => {
  return CURRENCIES.find(c => c.iso === countryIso);
};

/**
 * Get currency symbol by country ISO code
 */
export const getCurrencySymbolByIso = (countryIso: string): string => {
  const currency = getCurrencyByIso(countryIso);
  return currency?.currency_symbol || '$';
};

/**
 * Get currency code by country ISO code
 */
export const getCurrencyCodeByIso = (countryIso: string): string => {
  const currency = getCurrencyByIso(countryIso);
  return currency?.currency_code || DEFAULT_CURRENCY;
};

/**
 * Get currency symbol by currency code (legacy, for backward compatibility)
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES.find(c => c.currency_code === currencyCode);
  return currency?.currency_symbol || '$';
};
