/**
 * inventoryStore.ts - Zustand store for inventory/product state management
 * 
 * Manages all product-related state and actions.
 * Replaces the products state from App.tsx and local state in InventoryDomain.
 */

import { create } from 'zustand';
import { InventoryService } from '../services';
import type { Product, InventoryFilters } from '../shared';
import { STORAGE_KEYS } from '../shared';

// ============================================
// Store Types
// ============================================

interface InventoryState {
  // Data
  products: Product[];
  isLoading: boolean;
  
  // Derived state
  lowStockCount: number;
  totalProducts: number;
  categories: string[];
  
  // Actions
  loadProducts: (filters?: InventoryFilters) => void;
  createProduct: (
    name: string,
    price: number,
    cost: number,
    quantity?: number,
    description?: string,
    category?: string
  ) => Product | null;
  updateProduct: (
    productId: string,
    updates: {
      name?: string;
      description?: string;
      price?: number;
      cost?: number;
      category?: string;
      quantity?: number;
    }
  ) => Product | null;
  deleteProduct: (productId: string) => boolean;
  adjustStock: (productId: string, quantityDelta: number) => Product | null;
  getById: (id: string) => Product | undefined;
  
  // For category migrations
  migrateCategoryName: (oldName: string, newName: string) => number;
}

// ============================================
// Store Implementation
// ============================================

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  products: [],
  isLoading: true,
  lowStockCount: 0,
  totalProducts: 0,
  categories: [],
  
  /**
   * Load all products from storage with optional filters
   */
  loadProducts: (filters?: InventoryFilters) => {
    const products = InventoryService.getAll(filters);
    const allProducts = filters ? InventoryService.getAll() : products;
    
    set({
      products,
      totalProducts: allProducts.length,
      lowStockCount: allProducts.filter(p => p.quantity <= 10).length,
      categories: InventoryService.getCategories(),
      isLoading: false,
    });
  },
  
  /**
   * Create a new product and refresh the store
   */
  createProduct: (name, price, cost, quantity = 0, description, category) => {
    const result = InventoryService.create(name, price, cost, quantity, description, category);
    if (result) {
      get().loadProducts();
    }
    return result;
  },
  
  /**
   * Update an existing product
   */
  updateProduct: (productId, updates) => {
    const result = InventoryService.update(productId, updates);
    if (result) {
      get().loadProducts();
    }
    return result;
  },
  
  /**
   * Delete a product
   */
  deleteProduct: (productId) => {
    const result = InventoryService.delete(productId);
    if (result) {
      get().loadProducts();
    }
    return result;
  },
  
  /**
   * Adjust stock quantity for a product (add or subtract)
   */
  adjustStock: (productId, quantityDelta) => {
    const product = InventoryService.getById(productId);
    if (!product) return null;
    
    const newQuantity = Math.max(0, product.quantity + quantityDelta);
    const result = InventoryService.update(productId, { quantity: newQuantity });
    if (result) {
      get().loadProducts();
    }
    return result;
  },
  
  /**
   * Get a product by ID from the current state
   */
  getById: (id) => get().products.find(p => p.id === id),
  
  /**
   * Migrate category name across all products
   */
  migrateCategoryName: (oldName, newName) => {
    const count = InventoryService.migrateCategoryName(oldName, newName);
    if (count > 0) {
      get().loadProducts();
    }
    return count;
  },
}));

// ============================================
// Store Initialization Hook
// ============================================

/**
 * Initialize the inventory store on app startup.
 * Call this once in your root component.
 */
export const initializeInventoryStore = () => {
  useInventoryStore.getState().loadProducts();
  
  // Listen for storage changes (multi-tab sync)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.PRODUCTS) {
      useInventoryStore.getState().loadProducts();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};
