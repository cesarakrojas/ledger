/**
 * shared/storage.ts - Storage Utilities
 * 
 * Centralized localStorage keys and storage accessor utilities.
 * Provides caching, error handling, and type-safe storage operations.
 */

// ============================================
// STORAGE KEYS
// ============================================

/**
 * Centralized localStorage keys for the application
 * This ensures consistency across all services and prevents data loss
 * 
 * Naming Convention: All keys use 'app_' prefix with underscore_case
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

/** Legacy key mapping for migration (if needed in future) */
export const LEGACY_KEYS = {
  TRANSACTIONS: 'cashier_transactions',
  PRODUCTS: 'inventory_products',
  DEBTS: 'debts',
  CATEGORY_CONFIG: 'categoryConfig',
  CURRENCY_CODE: 'currencyCode',
  THEME: 'theme',
} as const;

// ============================================
// STORAGE CACHE
// ============================================

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

// ============================================
// STORAGE ACCESSOR
// ============================================

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
// STORAGE AVAILABILITY CHECK
// ============================================

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
