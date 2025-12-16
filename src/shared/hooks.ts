/**
 * shared/hooks.ts - Shared React Hooks
 * 
 * Reusable React hooks for common patterns.
 */

import { useEffect, useRef, useState } from 'react';

// ============================================
// PERFORMANCE HOOKS
// ============================================

/**
 * Debounces a state value
 * Useful for search inputs and other frequently changing values
 * 
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
