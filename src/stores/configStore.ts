/**
 * configStore.ts - Zustand store for app configuration state management
 * 
 * Manages theme, currency, categories, and payment methods.
 * Replaces the config state from App.tsx.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CategoryConfig } from '../shared';
import { STORAGE_KEYS, DEFAULT_COUNTRY_ISO, getCurrencyCodeByIso } from '../shared';

// ============================================
// Store Types
// ============================================

interface ConfigState {
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
  
  // Locale/Currency
  countryIso: string;
  currencyCode: string; // Derived from countryIso
  setCountryIso: (iso: string) => void;
  
  // Categories
  categoryConfig: CategoryConfig;
  setCategoryConfig: (config: CategoryConfig) => void;
  
  // Payment Methods
  paymentMethods: string[];
  setPaymentMethods: (methods: string[]) => void;
  
  // Initialization
  initializeFromStorage: () => void;
}

// ============================================
// Default Values
// ============================================

const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  enabled: true,
  inflowCategories: ['Servicios', 'Otros Ingresos', 'Propinas'],
  outflowCategories: ['Gastos Operativos', 'Salarios', 'Servicios Públicos', 'Compras', 'Transporte', 'Otros Gastos']
};

const DEFAULT_PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia'];

// ============================================
// Store Implementation
// ============================================

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Theme state
      isDarkMode: false,
      
      toggleTheme: () => {
        const newMode = !get().isDarkMode;
        
        // Update DOM
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Update localStorage (for non-zustand persistence compatibility)
        localStorage.setItem(STORAGE_KEYS.THEME, newMode ? 'dark' : 'light');
        
        set({ isDarkMode: newMode });
      },
      
      setDarkMode: (isDark) => {
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
        set({ isDarkMode: isDark });
      },
      
      // Currency state
      countryIso: DEFAULT_COUNTRY_ISO,
      currencyCode: getCurrencyCodeByIso(DEFAULT_COUNTRY_ISO),
      
      setCountryIso: (iso) => {
        localStorage.setItem(STORAGE_KEYS.COUNTRY_ISO, iso);
        set({ 
          countryIso: iso, 
          currencyCode: getCurrencyCodeByIso(iso) 
        });
      },
      
      // Category config
      categoryConfig: DEFAULT_CATEGORY_CONFIG,
      
      setCategoryConfig: (config) => {
        localStorage.setItem(STORAGE_KEYS.CATEGORY_CONFIG, JSON.stringify(config));
        set({ categoryConfig: config });
      },
      
      // Payment methods
      paymentMethods: DEFAULT_PAYMENT_METHODS,
      
      setPaymentMethods: (methods) => {
        localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
        set({ paymentMethods: methods });
      },
      
      // Initialize from existing localStorage (for migration from App.tsx state)
      initializeFromStorage: () => {
        // Load theme
        const isDark = document.documentElement.classList.contains('dark');
        
        // Load country ISO
        const savedCountryIso = localStorage.getItem(STORAGE_KEYS.COUNTRY_ISO);
        const countryIso = savedCountryIso || DEFAULT_COUNTRY_ISO;
        
        // Load category config
        let categoryConfig = DEFAULT_CATEGORY_CONFIG;
        try {
          const savedConfigStr = localStorage.getItem(STORAGE_KEYS.CATEGORY_CONFIG);
          if (savedConfigStr) {
            categoryConfig = JSON.parse(savedConfigStr);
          }
        } catch (e) {
          console.error('Error loading category config:', e);
        }
        
        // Load payment methods
        let paymentMethods = DEFAULT_PAYMENT_METHODS;
        try {
          const savedMethodsStr = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
          if (savedMethodsStr) {
            paymentMethods = JSON.parse(savedMethodsStr);
          }
        } catch (e) {
          console.error('Error loading payment methods:', e);
        }
        
        set({
          isDarkMode: isDark,
          countryIso,
          currencyCode: getCurrencyCodeByIso(countryIso),
          categoryConfig,
          paymentMethods,
        });
      },
    }),
    {
      name: 'app-config-store', // localStorage key for zustand persist
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields (theme is handled separately for compatibility)
      partialize: (state: ConfigState) => ({
        countryIso: state.countryIso,
        categoryConfig: state.categoryConfig,
        paymentMethods: state.paymentMethods,
      }),
    }
  )
);

// ============================================
// Store Initialization Hook
// ============================================

/**
 * Initialize the config store on app startup.
 * Call this once in your root component.
 */
export const initializeConfigStore = () => {
  useConfigStore.getState().initializeFromStorage();
};
