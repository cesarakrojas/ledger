/**
 * purchaseStore.ts - Zustand store for purchase/restock cart management
 * 
 * Manages cart state for the "Registrar Compra" (Register Purchase) feature.
 * Follows similar patterns to posStore.ts but for inventory restocking.
 */

import { create } from 'zustand';

// ============================================
// Types
// ============================================

export interface PurchaseItem {
  id: string;           // Product ID
  name: string;         // Product name
  quantity: number;     // Quantity to purchase
  unitCost: number;     // Cost per unit
  currentStock: number; // Current stock level (for reference)
  subtotal: number;     // quantity * unitCost
}

interface PurchaseState {
  // Cart data
  cart: PurchaseItem[];
  total: number;
  itemCount: number;
  
  // UI state
  activeTab: 'products' | 'cart';
  selectedCategory: string;
  searchQuery: string;
  editingItem: PurchaseItem | null;
  numpadValue: string;
  showLowStockOnly: boolean;
  
  // Quick add modal
  quickAddProduct: { id: string; name: string; currentStock: number; lastCost: number } | null;
  quickAddQuantity: string;
  quickAddCost: string;
  
  // Supplier selection
  selectedSupplierId: string | null;
  selectedSupplierName: string;
  
  // Payment method
  paymentMethod: string;
  
  // Notes
  notes: string;
  
  // Actions - Cart
  addToCart: (item: Omit<PurchaseItem, 'subtotal'>) => void;
  updateCartItem: (productId: string, updates: Partial<Pick<PurchaseItem, 'quantity' | 'unitCost'>>) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Actions - UI
  setActiveTab: (tab: 'products' | 'cart') => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setEditingItem: (item: PurchaseItem | null) => void;
  setNumpadValue: (value: string) => void;
  setShowLowStockOnly: (show: boolean) => void;
  
  // Actions - Quick Add Modal
  openQuickAdd: (product: { id: string; name: string; currentStock: number; lastCost: number }) => void;
  closeQuickAdd: () => void;
  setQuickAddQuantity: (qty: string) => void;
  setQuickAddCost: (cost: string) => void;
  confirmQuickAdd: () => void;
  
  // Actions - Supplier & Payment
  setSelectedSupplier: (id: string | null, name: string) => void;
  setPaymentMethod: (method: string) => void;
  setNotes: (notes: string) => void;
  
  // Reset entire store
  resetStore: () => void;
}

// Helper to recalculate totals
const calculateTotals = (cart: PurchaseItem[]) => {
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

// ============================================
// Store Implementation
// ============================================

const initialState = {
  cart: [] as PurchaseItem[],
  total: 0,
  itemCount: 0,
  activeTab: 'products' as const,
  selectedCategory: 'all',
  searchQuery: '',
  editingItem: null as PurchaseItem | null,
  numpadValue: '0',
  showLowStockOnly: true, // Default to showing low stock first
  quickAddProduct: null as { id: string; name: string; currentStock: number; lastCost: number } | null,
  quickAddQuantity: '1',
  quickAddCost: '',
  selectedSupplierId: null as string | null,
  selectedSupplierName: 'Sin Proveedor',
  paymentMethod: 'Efectivo',
  notes: '',
};

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  ...initialState,
  
  // Cart Actions
  addToCart: (item) => {
    set((state) => {
      const existingIndex = state.cart.findIndex((i) => i.id === item.id);
      let newCart: PurchaseItem[];
      
      if (existingIndex >= 0) {
        // Update existing item
        newCart = [...state.cart];
        const existing = newCart[existingIndex];
        const newQty = existing.quantity + item.quantity;
        newCart[existingIndex] = {
          ...existing,
          quantity: newQty,
          unitCost: item.unitCost, // Use new cost
          subtotal: newQty * item.unitCost,
        };
      } else {
        // Add new item
        newCart = [...state.cart, { ...item, subtotal: item.quantity * item.unitCost }];
      }
      
      return { cart: newCart, ...calculateTotals(newCart) };
    });
  },
  
  updateCartItem: (productId, updates) => {
    set((state) => {
      const newCart = state.cart.map((item) => {
        if (item.id !== productId) return item;
        
        const newQty = updates.quantity ?? item.quantity;
        const newCost = updates.unitCost ?? item.unitCost;
        
        return {
          ...item,
          quantity: newQty,
          unitCost: newCost,
          subtotal: newQty * newCost,
        };
      });
      
      // Also update editingItem if it's the one being modified
      const editingItem = state.editingItem?.id === productId
        ? newCart.find((i) => i.id === productId) || null
        : state.editingItem;
      
      return { cart: newCart, editingItem, ...calculateTotals(newCart) };
    });
  },
  
  removeFromCart: (productId) => {
    set((state) => {
      const newCart = state.cart.filter((item) => item.id !== productId);
      const editingItem = state.editingItem?.id === productId ? null : state.editingItem;
      return { cart: newCart, editingItem, ...calculateTotals(newCart) };
    });
  },
  
  clearCart: () => {
    set({
      cart: [],
      total: 0,
      itemCount: 0,
      editingItem: null,
      activeTab: 'products',
      selectedSupplierId: null,
      selectedSupplierName: 'Sin Proveedor',
      paymentMethod: 'Efectivo',
      notes: '',
    });
  },
  
  // UI Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setEditingItem: (item) => set({ editingItem: item, numpadValue: '0' }),
  setNumpadValue: (value) => set({ numpadValue: value }),
  setShowLowStockOnly: (show) => set({ showLowStockOnly: show }),
  
  // Quick Add Modal Actions
  openQuickAdd: (product) => set({
    quickAddProduct: product,
    quickAddQuantity: '1',
    quickAddCost: product.lastCost > 0 ? product.lastCost.toString() : '',
  }),
  
  closeQuickAdd: () => set({
    quickAddProduct: null,
    quickAddQuantity: '1',
    quickAddCost: '',
  }),
  
  setQuickAddQuantity: (qty) => set({ quickAddQuantity: qty }),
  setQuickAddCost: (cost) => set({ quickAddCost: cost }),
  
  confirmQuickAdd: () => {
    const state = get();
    if (!state.quickAddProduct) return;
    
    const quantity = parseInt(state.quickAddQuantity, 10);
    // Treat empty cost as 0 (valid for free items or unknown cost)
    const unitCost = state.quickAddCost.trim() === '' ? 0 : parseFloat(state.quickAddCost);
    
    if (isNaN(quantity) || quantity <= 0) return;
    if (isNaN(unitCost) || unitCost < 0) return;
    
    state.addToCart({
      id: state.quickAddProduct.id,
      name: state.quickAddProduct.name,
      quantity,
      unitCost,
      currentStock: state.quickAddProduct.currentStock,
    });
    
    // Close modal
    set({
      quickAddProduct: null,
      quickAddQuantity: '1',
      quickAddCost: '',
    });
  },
  
  // Supplier & Payment Actions
  setSelectedSupplier: (id, name) => set({
    selectedSupplierId: id,
    selectedSupplierName: name || 'Sin Proveedor',
  }),
  
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setNotes: (notes) => set({ notes }),
  
  // Reset store
  resetStore: () => set(initialState),
}));

// Initialize store (call on app start if needed)
export const initializePurchaseStore = () => {
  // No persistence needed - purchase carts are transient
  usePurchaseStore.getState().resetStore();
};
