/**
 * Performance optimization utilities for React components
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Creates a debounced version of a function
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

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
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
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

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  setMaxAge(ms: number): void {
    this.maxAge = ms;
  }
}

// Singleton instance
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
