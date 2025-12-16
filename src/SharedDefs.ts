/**
 * SharedDefs.ts - The Dictionary
 * * Centralized definitions for the entire application.
 * Contains all TypeScript interfaces, constants, utility functions,
 * and style definitions used across all modules.
 * * This file has ZERO dependencies on other app files to prevent circular imports.
 */

import { useEffect, useRef, useState } from 'react';

// ============================================
// TYPESCRIPT INTERFACES (Types)
// ============================================

export interface Transaction {
  id: string;
  type: 'inflow' | 'outflow';
  description: string;
  category?: string;
  paymentMethod?: string;
  amount: number;
  timestamp: string;
}

export interface CategoryConfig {
  enabled: boolean;
  inflowCategories: string[];
  outflowCategories: string[];
}

export interface PaymentMethodsConfig {
  methods: string[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number; // <--- NEW FIELD
  /** Stock quantity for the product */
  quantity: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// Reusable product quantity map used by inflow/purchase forms
export interface ProductQuantity {
  [productId: string]: number;
}

export interface InventoryFilters {
  searchTerm?: string;
  category?: string;
  lowStock?: boolean;
}

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
// STORAGE KEYS
// ============================================

/**
 * Centralized localStorage keys for the application
 * This ensures consistency across all services and prevents data loss
 * * Naming Convention: All keys use 'app_' prefix with underscore_case
 * This provides clear namespace and prevents conflicts with other libraries
 */
export const STORAGE_KEYS = {
  // Transaction data
  TRANSACTIONS: 'app_transactions',
  
  // Inventory/Product data
  PRODUCTS: 'app_products',
  
  // Debt management data
  DEBTS: 'app_debts',
  
  // Contacts (clients and suppliers)
  CONTACTS: 'app_contacts',
  
  // Bills data (currently unused but reserved)
  BILLS: 'app_bills',
  
  // App settings
  CATEGORY_CONFIG: 'app_category_config',
  PAYMENT_METHODS: 'app_payment_methods',
  COUNTRY_ISO: 'app_country_iso',
  CURRENCY_CODE: 'app_currency_code', // Legacy, kept for backward compatibility
  THEME: 'app_theme',
} as const;

// Legacy key mapping for migration (if needed in future)
export const LEGACY_KEYS = {
  TRANSACTIONS: 'cashier_transactions',
  PRODUCTS: 'inventory_products',
  DEBTS: 'debts',
  CATEGORY_CONFIG: 'categoryConfig',
  CURRENCY_CODE: 'currencyCode',
  THEME: 'theme',
} as const;

// ============================================
// STYLE CONSTANTS (Tailwind CSS classes)
// ============================================

// Base card styles
const CARD_BASE = 'bg-white dark:bg-slate-800 shadow-lg rounded-2xl';

// Standard card with padding
export const CARD_STYLES = `${CARD_BASE} p-6`;

// Card without padding (for custom layouts)
export const CARD_STYLES_NO_PADDING = CARD_BASE;

// Interactive card for clickable elements
export const CARD_INTERACTIVE = `${CARD_BASE} hover:shadow-xl transition-shadow cursor-pointer`;

// Interactive card with padding and enhanced hover effects
export const CARD_INTERACTIVE_ENHANCED = `group ${CARD_BASE} p-5 hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-emerald-500/20`;

// Empty state card with centered content
export const CARD_EMPTY_STATE = `${CARD_BASE} p-12 text-center`;

// Form container with flex layout
export const CARD_FORM = `${CARD_BASE} flex flex-col overflow-hidden`;

// Product item card for forms (NewInflowForm, NewExpenseForm)
export const CARD_PRODUCT_ITEM = 'bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden flex relative';

// Settings section container
export const SETTINGS_SECTION = 'p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg';

// Cart summary container (consistent border width)
export const CART_SUMMARY_INFLOW = 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4';
export const CART_SUMMARY_OUTFLOW = 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4';

// Detail View Header (TransactionDetailView, ProductDetailView, DebtDetailView, ContactDetailView)
export const DETAIL_VIEW_HEADER = 'flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0 z-10';
export const TEXT_DETAIL_HEADER_TITLE = 'text-lg font-bold text-slate-800 dark:text-white ml-2';

// List Item Interactive (App.tsx transactions, LibretaView debts, InventoryView products)
export const LIST_ITEM_INTERACTIVE = 'group flex items-center justify-between py-4 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors duration-200 cursor-pointer';

// Icon Buttons (Close buttons, action icon buttons)
export const ICON_BTN = 'p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors';
export const ICON_BTN_CLOSE = 'p-2 -mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors';

// Footer Action Buttons (Detail views footers)
export const BTN_FOOTER_PRIMARY = 'flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-colors';
export const BTN_FOOTER_SECONDARY = 'flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors';
export const BTN_FOOTER_DANGER = 'flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-colors';
export const BTN_FOOTER_EDIT = 'flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-colors';

// Detail View Container (outer wrapper for detail modals)
export const DETAIL_VIEW_CONTAINER = 'w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 rounded-t-[2rem] overflow-hidden shadow-2xl';

// Detail View Footer (action area at bottom)
export const DETAIL_VIEW_FOOTER = 'bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 safe-area-inset-bottom flex-shrink-0';

// ============================================
// UI CONSTANTS
// ============================================

export const INPUT_BASE_CLASSES = 'w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-slate-900 dark:text-slate-100';

// Date input variant (larger for touch)
export const INPUT_DATE_CLASSES = 'w-full px-4 py-3.5 text-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-700 dark:text-slate-200';

// Typography Constants
export const TEXT_PAGE_TITLE = 'text-2xl font-bold text-slate-800 dark:text-white';
export const TEXT_PAGE_TITLE_RESPONSIVE = 'text-xl sm:text-2xl font-bold text-slate-800 dark:text-white';
export const TEXT_SECTION_HEADER = 'text-lg font-semibold text-slate-800 dark:text-white';
export const TEXT_DETAIL_HEADER = 'text-lg font-bold text-slate-800 dark:text-white';
export const TEXT_LABEL_UPPERCASE = 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400';
export const TEXT_METADATA = 'text-xs text-slate-500 dark:text-slate-400';
export const TEXT_VALUE_LARGE = 'text-xl font-bold';
export const TEXT_VALUE_XL = 'text-2xl font-bold';

// Transition Constants
export const TRANSITION_COLORS = 'transition-colors';
export const TRANSITION_ALL = 'transition-all';
export const TRANSITION_BASE = 'transition-colors duration-150';

// Standardized Form Styles
export const FORM_LABEL = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2';

// Standardized Button Styles
export const BTN_PRIMARY = 'w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg';
export const BTN_SECONDARY = 'w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors';
export const BTN_DANGER = 'w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl transition-colors';

// Header action buttons (inflow/expense buttons in main view)
export const BTN_HEADER_INFLOW = 'flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/30 transition-transform transform hover:scale-105';
export const BTN_HEADER_OUTFLOW = 'flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-red-500/30 transition-transform transform hover:scale-105';

// Page action buttons (Nueva Deuda, Nuevo Producto, Generar, etc.)
export const BTN_ACTION_PRIMARY = 'flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/30 transition-transform transform hover:scale-105';
export const BTN_ACTION_SECONDARY = 'flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105';

// Standardized Form Footer
export const FORM_FOOTER = 'flex-shrink-0 pt-4 px-4 pb-4 -mx-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-3 safe-area-inset-bottom';

// Error Banner
export const ERROR_BANNER = 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-fade-in';

// ============================================
// STATUS BADGES
// ============================================
export const BADGE_SUCCESS = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
export const BADGE_DANGER = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
export const BADGE_WARNING = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
export const BADGE_INFO = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

// ============================================
// ICON BACKGROUNDS
// ============================================
export const ICON_BG_EMERALD = 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
export const ICON_BG_RED = 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
export const ICON_BG_BLUE = 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
export const ICON_BG_ORANGE = 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';

// ============================================
// AMOUNT/CURRENCY TEXT COLORS
// ============================================
export const TEXT_AMOUNT_INFLOW = 'text-emerald-600 dark:text-emerald-400';
export const TEXT_AMOUNT_OUTFLOW = 'text-red-600 dark:text-red-400';

// ============================================
// STAT CARDS
// ============================================
export const STAT_CARD_EMERALD = 'bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-xl';
export const STAT_CARD_RED = 'bg-red-100 dark:bg-red-900/50 p-4 rounded-xl';
export const STAT_CARD_ORANGE = 'bg-orange-100 dark:bg-orange-900/50 p-4 rounded-xl';

// ============================================
// DIVIDERS & SEPARATORS
// ============================================
export const DIVIDER = 'border-t border-slate-200 dark:border-slate-700 my-6';

// ============================================
// DISABLED BUTTON STATE
// ============================================
export const BTN_FOOTER_DISABLED = 'flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-xl font-semibold cursor-not-allowed transition-colors';

// ============================================
// TOGGLE BUTTONS (Type selectors)
// ============================================
export const TOGGLE_BTN_BASE = 'py-3 px-4 rounded-lg font-semibold transition-all';
export const TOGGLE_BTN_INACTIVE = 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600';
export const TOGGLE_BTN_ACTIVE_EMERALD = 'bg-emerald-600 text-white shadow-lg';
export const TOGGLE_BTN_ACTIVE_RED = 'bg-red-600 text-white shadow-lg';
export const TOGGLE_BTN_ACTIVE_BLUE = 'bg-blue-600 text-white shadow-lg';

// ============================================
// CURRENCY CONFIGURATION
// ============================================

export interface CurrencyOption {
  name: string;
  iso: string;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
}

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

export const DEFAULT_COUNTRY_ISO = "us"; // United States
export const DEFAULT_CURRENCY = "USD";

// Helper to get currency by country ISO code
export const getCurrencyByIso = (countryIso: string) => {
  return CURRENCIES.find(c => c.iso === countryIso);
};

// Helper to get currency symbol by country ISO code
export const getCurrencySymbolByIso = (countryIso: string): string => {
  const currency = getCurrencyByIso(countryIso);
  return currency?.currency_symbol || '$';
};

// Helper to get currency code by country ISO code
export const getCurrencyCodeByIso = (countryIso: string): string => {
  const currency = getCurrencyByIso(countryIso);
  return currency?.currency_code || DEFAULT_CURRENCY;
};

// Helper to get currency symbol by code (legacy, for backward compatibility)
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES.find(c => c.currency_code === currencyCode);
  return currency?.currency_symbol || '$';
};

// ============================================
// FORMATTERS
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

// ============================================
// CALCULATIONS
// ============================================

export const calculateTotalInflows = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateTotalOutflows = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);
};

// ============================================
// ID GENERATOR
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
// ERROR HANDLING
// ============================================

export interface AppError {
  type: 'storage' | 'network' | 'validation' | 'unknown';
  message: string;
  details?: string;
  timestamp: string;
}

export type ErrorHandler = (error: AppError) => void;

let errorHandlers: ErrorHandler[] = [];

/**
 * Register an error handler (e.g., to show toast notifications)
 */
export const registerErrorHandler = (handler: ErrorHandler): (() => void) => {
  errorHandlers.push(handler);
  
  // Return unsubscribe function
  return () => {
    errorHandlers = errorHandlers.filter(h => h !== handler);
  };
};

/**
 * Report an error to all registered handlers
 */
export const reportError = (error: AppError): void => {
  // Log to console for debugging
  console.error('[AppError]', error.type, error.message, error.details);
  
  // Notify all handlers
  errorHandlers.forEach(handler => {
    try {
      handler(error);
    } catch (e) {
      console.error('Error in error handler:', e);
    }
  });
};

/**
 * Create an error object
 */
export const createError = (
  type: AppError['type'],
  message: string,
  details?: string
): AppError => ({
  type,
  message,
  details,
  timestamp: new Date().toISOString(),
});

/**
 * Check if localStorage is available and has space
 */
export const checkStorageAvailability = (): { available: boolean; message?: string } => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return { available: true };
  } catch (e) {
    if (e instanceof Error) {
      if (e.name === 'QuotaExceededError') {
        return { 
          available: false, 
          message: 'Almacenamiento lleno. Por favor, elimine algunos datos.' 
        };
      }
      return { 
        available: false, 
        message: 'Almacenamiento no disponible: ' + e.message 
      };
    }
    return { 
      available: false, 
      message: 'Almacenamiento no disponible' 
    };
  }
};

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  STORAGE_FULL: 'El almacenamiento está lleno. No se pudo guardar.',
  STORAGE_ERROR: 'Error al acceder al almacenamiento local.',
  PARSE_ERROR: 'Error al procesar los datos.',
  NOT_FOUND: 'El elemento solicitado no existe.',
  VALIDATION_ERROR: 'Los datos proporcionados no son válidos.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado.',
} as const;

// ============================================
// PERFORMANCE UTILITIES
// ============================================

/**
 * Debounces a state value
 * @param value Value to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced value
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first render - value is already set via useState initial value
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // For subsequent renders, use the debounce delay
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Simple in-memory cache for localStorage data
 * Reduces JSON parsing overhead by caching parsed results
 */
class StorageCache {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private maxAge: number = 5000; // 5 seconds cache lifetime

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  set(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

// Singleton instance (internal use only)
const storageCache = new StorageCache();

/**
 * Generic storage accessor factory
 * Creates type-safe get/save functions for localStorage with caching and error handling
 * This eliminates code duplication across services
 */
export interface StorageAccessor<T> {
  get: () => T[];
  save: (items: T[], options?: { dispatchEvent?: boolean }) => boolean;
}

export interface CreateStorageAccessorOptions {
  /** Error message for load failures */
  loadErrorMsg: string;
  /** Error message for save failures */
  saveErrorMsg: string;
  /** Full storage error message */
  storageFullMsg: string;
  /** Whether to dispatch storage events on save (for multi-tab sync) */
  dispatchEvents?: boolean;
}

/**
 * Creates a storage accessor with caching and consistent error handling
 * @param storageKey The localStorage key
 * @param options Configuration options
 * @param errorReporter Function to report errors (for dependency injection)
 */
export const createStorageAccessor = <T>(
  storageKey: string,
  options: CreateStorageAccessorOptions,
  errorReporter: (error: { type: string; message: string; details?: string }) => void
): StorageAccessor<T> => {
  const get = (): T[] => {
    try {
      // Try cache first
      const cached = storageCache.get<T[]>(storageKey);
      if (cached) return cached;
      
      const data = localStorage.getItem(storageKey);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      const items = Array.isArray(parsed) ? parsed : [];
      
      // Cache the result
      storageCache.set(storageKey, items);
      
      return items;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errorReporter({ type: 'storage', message: options.loadErrorMsg, details: errorMsg });
      return [];
    }
  };

  const save = (items: T[], saveOptions?: { dispatchEvent?: boolean }): boolean => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
      
      // Invalidate cache
      storageCache.invalidate(storageKey);
      
      // Dispatch storage event for multi-tab sync if enabled
      if (options.dispatchEvents || saveOptions?.dispatchEvent) {
        window.dispatchEvent(new StorageEvent('storage', {
          key: storageKey,
          newValue: JSON.stringify(items)
        }));
      }
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        errorReporter({ type: 'storage', message: options.storageFullMsg, details: errorMsg });
      } else {
        errorReporter({ type: 'storage', message: options.saveErrorMsg, details: errorMsg });
      }
      
      return false;
    }
  };

  return { get, save };
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
