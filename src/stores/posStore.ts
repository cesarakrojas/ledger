/**
 * posStore.ts - Zustand store for POS (cart) state
 * 
 * Manages cart items, totals, and POS-specific UI state.
 * Cart is ephemeral (not persisted to storage).
 */

import { create } from 'zustand';
import type { Product } from '../shared/types';

// ============================================
// Types
// ============================================

export interface CartItem {
  id: string;
  name: string;
  price: number;
  /** Cost per unit (for COGS calculation) */
  cost: number;
  quantity: number;
  unit: string;
  category?: string;
}

interface POSState {
  // Cart data
  cart: CartItem[];
  
  // Computed values (updated on cart change)
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  
  // UI state
  activeTab: 'products' | 'cart';
  selectedCategory: string;
  searchQuery: string;
  editingItem: CartItem | null;
  numpadValue: string;
  
  // Cart actions
  addToCart: (product: Product) => void;
  updateCartItem: (id: string, updates: Partial<Pick<CartItem, 'quantity' | 'price'>>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  
  // UI actions
  setActiveTab: (tab: 'products' | 'cart') => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setEditingItem: (item: CartItem | null) => void;
  setNumpadValue: (value: string) => void;
}

// Tax rate constant
const TAX_RATE = 0.10;

// Helper to recalculate totals
const calculateTotals = (cart: CartItem[]) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, tax, total, itemCount };
};

// ============================================
// Store Implementation
// ============================================

export const usePOSStore = create<POSState>((set) => ({
  // Initial cart state
  cart: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  itemCount: 0,
  
  // Initial UI state
  activeTab: 'products',
  selectedCategory: 'all',
  searchQuery: '',
  editingItem: null,
  numpadValue: '0',
  
  /**
   * Add a product to the cart (or increment quantity if already exists)
   */
  addToCart: (product) => {
    set(state => {
      const existing = state.cart.find(item => item.id === product.id);
      let newCart: CartItem[];
      
      if (existing) {
        newCart = state.cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          cost: product.cost ?? 0,
          quantity: 1,
          unit: 'Uds',
          category: product.category,
        };
        newCart = [...state.cart, newItem];
      }
      
      return {
        cart: newCart,
        ...calculateTotals(newCart),
        activeTab: 'products', // Stay on products view
      };
    });
  },
  
  /**
   * Update quantity or price of a cart item
   */
  updateCartItem: (id, updates) => {
    set(state => {
      const newCart = state.cart.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      
      // Also update editingItem if it's the same item
      const editingItem = state.editingItem?.id === id
        ? { ...state.editingItem, ...updates }
        : state.editingItem;
      
      return {
        cart: newCart,
        editingItem,
        ...calculateTotals(newCart),
      };
    });
  },
  
  /**
   * Remove an item from the cart
   */
  removeFromCart: (id) => {
    set(state => {
      const newCart = state.cart.filter(item => item.id !== id);
      return {
        cart: newCart,
        editingItem: state.editingItem?.id === id ? null : state.editingItem,
        ...calculateTotals(newCart),
      };
    });
  },
  
  /**
   * Clear the entire cart
   */
  clearCart: () => {
    set({
      cart: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
      editingItem: null,
      numpadValue: '0',
      activeTab: 'products',
    });
  },
  
  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setEditingItem: (item) => set({ 
    editingItem: item, 
    numpadValue: item ? String(item.quantity) : '0' 
  }),
  setNumpadValue: (value) => set({ numpadValue: value }),
}));

// ============================================
// Initialization
// ============================================

export const initializePOSStore = () => {
  // No storage initialization required for POS (ephemeral)
  return () => {};
};

export default usePOSStore;
