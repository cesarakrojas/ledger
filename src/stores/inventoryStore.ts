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
   * Create a new product with optimistic update
   */
  createProduct: (name, price, cost, quantity = 0, description, category) => {
    const result = InventoryService.create(name, price, cost, quantity, description, category);
    if (result) {
      // Optimistic update: add new product to state
      set(state => ({
        products: [...state.products, result],
        totalProducts: state.totalProducts + 1,
        lowStockCount: result.quantity <= 10 
          ? state.lowStockCount + 1 
          : state.lowStockCount,
        categories: category && !state.categories.includes(category)
          ? [...state.categories, category]
          : state.categories,
      }));
    }
    return result;
  },
  
  /**
   * Update an existing product with optimistic update
   */
  updateProduct: (productId, updates) => {
    const result = InventoryService.update(productId, updates);
    if (result) {
      // Optimistic update: replace product in state
      set(state => {
        const oldProduct = state.products.find(p => p.id === productId);
        const wasLowStock = oldProduct && oldProduct.quantity <= 10;
        const isLowStock = result.quantity <= 10;
        
        return {
          products: state.products.map(p => p.id === productId ? result : p),
          lowStockCount: state.lowStockCount 
            + (isLowStock && !wasLowStock ? 1 : 0)
            + (!isLowStock && wasLowStock ? -1 : 0),
          categories: updates.category && !state.categories.includes(updates.category)
            ? [...state.categories, updates.category]
            : state.categories,
        };
      });
    }
    return result;
  },
  
  /**
   * Delete a product with optimistic update
   */
  deleteProduct: (productId) => {
    const product = get().products.find(p => p.id === productId);
    const result = InventoryService.delete(productId);
    if (result && product) {
      // Optimistic update: remove product from state
      set(state => ({
        products: state.products.filter(p => p.id !== productId),
        totalProducts: state.totalProducts - 1,
        lowStockCount: product.quantity <= 10 
          ? state.lowStockCount - 1 
          : state.lowStockCount,
      }));
    }
    return result;
  },
  
  /**
   * Adjust stock quantity for a product with optimistic update
   */
  adjustStock: (productId, quantityDelta) => {
    const product = InventoryService.getById(productId);
    if (!product) return null;
    
    const newQuantity = Math.max(0, product.quantity + quantityDelta);
    const result = InventoryService.update(productId, { quantity: newQuantity });
    if (result) {
      // Optimistic update: update product in state
      const wasLowStock = product.quantity <= 10;
      const isLowStock = newQuantity <= 10;
      
      set(state => ({
        products: state.products.map(p => p.id === productId ? result : p),
        lowStockCount: state.lowStockCount 
          + (isLowStock && !wasLowStock ? 1 : 0)
          + (!isLowStock && wasLowStock ? -1 : 0),
      }));
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
