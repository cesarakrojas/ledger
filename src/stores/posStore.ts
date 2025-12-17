/**
 * posStore.ts - Zustand store for POS (cart) state
 */

import { create } from 'zustand';
import type { Product } from '../shared/types';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

interface POSState {
  cart: CartItem[];
  total: number;
  addItem: (product: Product, quantity?: number, unitPrice?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const usePOSStore = create<POSState>((set) => ({
  cart: [],
  total: 0,
  addItem: (product, quantity = 1, unitPrice = product.price ?? 0) => {
    set(state => {
      const existing = state.cart.find(c => c.product.id === product.id);
      let cart;
      if (existing) {
        cart = state.cart.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + quantity } : c);
      } else {
        cart = [...state.cart, { product, quantity, unitPrice }];
      }
      const total = cart.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
      return { cart, total };
    });
  },
  removeItem: (productId) => {
    set(state => {
      const cart = state.cart.filter(c => c.product.id !== productId);
      const total = cart.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
      return { cart, total };
    });
  },
  clearCart: () => set({ cart: [], total: 0 }),
}));

export const initializePOSStore = () => {
  // No storage initialization required for POS (ephemeral)
  return () => {};
};

export default usePOSStore;
