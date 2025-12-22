/**
 * PurchaseDomain.tsx
 * Domain module for Purchase/Restock functionality
 * 
 * Reuses POS architecture pattern for inventory restocking.
 * Features:
 * - Product grid with stock levels (low stock highlighted)
 * - Quick-add modal for quantity/cost entry
 * - Cart view with supplier selection
 * - Single master expense transaction on completion
 */

import React, { useMemo, useEffect, useState } from 'react';
import {
  SearchIcon,
  ChevronLeftIcon,
  TrashIcon,
  XMarkIcon,
  PlusIcon,
  UserIcon,
  DocumentTextIcon,
} from './components/icons';
import { BarcodeScanButton } from './components/barcode';
import { PurchaseService } from './services';
import {
  DETAIL_VIEW_HEADER,
  TEXT_DETAIL_HEADER_TITLE,
  ICON_BTN_CLOSE,
  INPUT_BASE_CLASSES,
  BTN_FOOTER_DANGER,
  BTN_FOOTER_SECONDARY,
  formatCurrency,
} from './shared';
import { usePurchaseStore, useInventoryStore, useContactStore, useConfigStore, useUIStore } from './stores';
import type { Product } from './shared';

// =============================================================================
// Constants
// =============================================================================

const CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'grains', name: 'Granos y Frutos' },
  { id: 'drinks', name: 'Bebidas' },
  { id: 'dairy', name: 'Lácteos' },
  { id: 'sweets', name: 'Dulces' },
  { id: 'wellness', name: 'Bienestar' },
];

const LOW_STOCK_THRESHOLD = 10;

// =============================================================================
// PurchaseProductCard Component
// =============================================================================

interface PurchaseProductCardProps {
  product: Product;
  isInCart: boolean;
  onTap: (product: Product) => void;
}

const PurchaseProductCard: React.FC<PurchaseProductCardProps> = ({ product, isInCart, onTap }) => {
  const isLowStock = product.quantity <= LOW_STOCK_THRESHOLD;
  const isOutOfStock = product.quantity === 0;
  
  return (
    <div
      onClick={() => onTap(product)}
      className={`bg-white dark:bg-slate-800 rounded-xl border overflow-hidden flex flex-col active:scale-95 transition-all duration-100 touch-manipulation h-full shadow-sm dark:shadow-none ${
        isInCart 
          ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' 
          : isOutOfStock
            ? 'border-red-300 dark:border-red-700'
            : isLowStock
              ? 'border-orange-300 dark:border-orange-700'
              : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="p-3 flex flex-col gap-2">
        {/* Product Name */}
        <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>
        
        {/* Stock Badge */}
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold self-start ${
          isOutOfStock
            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
            : isLowStock
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
        }`}>
          {isOutOfStock && '⚠️ '}
          {isLowStock && !isOutOfStock && '⚡ '}
          Stock: {product.quantity}
        </div>
        
        {/* Cost */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Costo:</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {product.cost > 0 ? formatCurrency(product.cost) : '—'}
          </span>
        </div>
        
        {/* In Cart Indicator */}
        {isInCart && (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center bg-blue-50 dark:bg-blue-900/30 rounded py-1">
            ✓ En carrito
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// QuickAddModal Component
// =============================================================================

const QuickAddModal: React.FC = () => {
  const quickAddProduct = usePurchaseStore(state => state.quickAddProduct);
  const quickAddQuantity = usePurchaseStore(state => state.quickAddQuantity);
  const quickAddCost = usePurchaseStore(state => state.quickAddCost);
  const setQuickAddQuantity = usePurchaseStore(state => state.setQuickAddQuantity);
  const setQuickAddCost = usePurchaseStore(state => state.setQuickAddCost);
  const confirmQuickAdd = usePurchaseStore(state => state.confirmQuickAdd);
  const closeQuickAdd = usePurchaseStore(state => state.closeQuickAdd);
  
  if (!quickAddProduct) return null;
  
  const quantity = parseInt(quickAddQuantity, 10) || 0;
  const cost = parseFloat(quickAddCost) || 0;
  const subtotal = quantity * cost;
  const isValid = quantity > 0 && cost >= 0;
  
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeQuickAdd} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Agregar: {quickAddProduct.name}
          </h3>
          <button 
            onClick={closeQuickAdd} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Current Stock Info */}
          <div className="text-center py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Stock actual</p>
            <p className={`text-2xl font-bold ${
              quickAddProduct.currentStock === 0 
                ? 'text-red-600 dark:text-red-400' 
                : quickAddProduct.currentStock <= LOW_STOCK_THRESHOLD
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-slate-800 dark:text-white'
            }`}>
              {quickAddProduct.currentStock} unidades
            </p>
            {quickAddProduct.lastCost > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                Último costo: {formatCurrency(quickAddProduct.lastCost)}
              </p>
            )}
          </div>
          
          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Cantidad a comprar
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quickAddQuantity}
              onChange={(e) => setQuickAddQuantity(e.target.value)}
              placeholder="1"
              className={INPUT_BASE_CLASSES}
              autoFocus
            />
          </div>
          
          {/* Cost Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Costo unitario
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={quickAddCost}
              onChange={(e) => setQuickAddCost(e.target.value)}
              placeholder="0.00"
              className={INPUT_BASE_CLASSES}
            />
          </div>
          
          {/* Subtotal */}
          <div className="flex justify-between items-center py-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-5 pt-0 space-y-3">
          <button
            onClick={confirmQuickAdd}
            disabled={!isValid}
            className={isValid 
              ? 'w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2'
              : 'w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-semibold rounded-xl cursor-not-allowed'
            }
          >
            <PlusIcon className="w-5 h-5" />
            Agregar al Carrito
          </button>
          <button
            onClick={closeQuickAdd}
            className="w-full py-2 text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PurchaseCartItem Component
// =============================================================================

interface PurchaseCartItemProps {
  item: {
    id: string;
    name: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
    currentStock: number;
  };
  isEditing: boolean;
  onClick: () => void;
}

const PurchaseCartItem: React.FC<PurchaseCartItemProps> = ({ item, isEditing, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border flex justify-between items-start transition-colors cursor-pointer ${
        isEditing
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 ring-1 ring-blue-200 dark:ring-blue-700'
          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-none'
      }`}
    >
      <div className="flex-1">
        <h4 className="font-medium text-slate-900 dark:text-slate-100">{item.name}</h4>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-2">
          <span>{item.quantity} unid × {formatCurrency(item.unitCost)}</span>
          <span className="text-slate-400">•</span>
          <span>Stock actual: {item.currentStock}</span>
        </div>
        {isEditing && (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2">
            Editando
          </div>
        )}
      </div>
      <div className="text-right ml-4">
        <div className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(item.subtotal)}
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          → {item.currentStock + item.quantity} unid
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// NumpadComp Component (for cart editing)
// =============================================================================

interface NumpadProps {
  value: string;
  onChange: (value: string) => void;
  onAction: (action: string) => void;
}

const NumpadComp: React.FC<NumpadProps> = ({ value, onChange, onAction }) => {
  const keys = ['1', '2', '3', 'Cant', '4', '5', '6', 'Costo', '7', '8', '9', '⌫', '+/-', '0', '.', '✓'];

  const handlePress = (key: string) => {
    if (['Cant', 'Costo', '✓'].includes(key)) {
      onAction(key);
      return;
    }
    if (key === '⌫') {
      onChange(value.length > 1 ? value.slice(0, -1) : '0');
      return;
    }
    if (key === '+/-') {
      onChange(value.startsWith('-') ? value.slice(1) : '-' + value);
      return;
    }
    if (value === '0' && key !== '.') {
      onChange(key);
    } else {
      if (key === '.' && value.includes('.')) return;
      onChange(value + key);
    }
  };

  const getKeyStyles = (key: string): string => {
    const base = 'h-12 rounded-lg font-semibold text-lg flex items-center justify-center active:scale-95 transition-all duration-150';
    
    if (['Cant', 'Costo'].includes(key)) {
      return `${base} bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700`;
    }
    if (key === '✓') {
      return `${base} bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700`;
    }
    if (key === '⌫') {
      return `${base} bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700`;
    }
    return `${base} bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 shadow-sm dark:shadow-none`;
  };

  return (
    <div className="grid grid-cols-4 gap-2 p-3 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
      {keys.map((key) => (
        <button key={key} onClick={() => handlePress(key)} className={getKeyStyles(key)}>
          {key}
        </button>
      ))}
    </div>
  );
};

// =============================================================================
// PurchaseView Component (Main)
// =============================================================================

export interface PurchaseViewProps {
  onClose: () => void;
}

export const PurchaseView: React.FC<PurchaseViewProps> = ({ onClose }) => {
  // Inventory store for products
  const products = useInventoryStore((state) => state.products);
  const loadProducts = useInventoryStore((state) => state.loadProducts);
  
  // Contact store for suppliers
  const contacts = useContactStore((state) => state.contacts);
  const loadContacts = useContactStore((state) => state.loadContacts);
  
  // Config store
  const paymentMethods = useConfigStore((state) => state.paymentMethods);
  
  // UI store
  const showSuccessModal = useUIStore((state) => state.showSuccessModal);
  const setHideAppShell = useUIStore((state) => state.setHideAppShell);
  const setHideBottomNav = useUIStore((state) => state.setHideBottomNav);

  // Purchase store
  const cart = usePurchaseStore((state) => state.cart);
  const total = usePurchaseStore((state) => state.total);
  const itemCount = usePurchaseStore((state) => state.itemCount);
  const activeTab = usePurchaseStore((state) => state.activeTab);
  const selectedCategory = usePurchaseStore((state) => state.selectedCategory);
  const searchQuery = usePurchaseStore((state) => state.searchQuery);
  const editingItem = usePurchaseStore((state) => state.editingItem);
  const numpadValue = usePurchaseStore((state) => state.numpadValue);
  const showLowStockOnly = usePurchaseStore((state) => state.showLowStockOnly);
  const selectedSupplierId = usePurchaseStore((state) => state.selectedSupplierId);
  const selectedSupplierName = usePurchaseStore((state) => state.selectedSupplierName);
  const paymentMethod = usePurchaseStore((state) => state.paymentMethod);
  const notes = usePurchaseStore((state) => state.notes);

  // Purchase actions
  const openQuickAdd = usePurchaseStore((state) => state.openQuickAdd);
  const updateCartItem = usePurchaseStore((state) => state.updateCartItem);
  const removeFromCart = usePurchaseStore((state) => state.removeFromCart);
  const setActiveTab = usePurchaseStore((state) => state.setActiveTab);
  const setSelectedCategory = usePurchaseStore((state) => state.setSelectedCategory);
  const setSearchQuery = usePurchaseStore((state) => state.setSearchQuery);
  const setEditingItem = usePurchaseStore((state) => state.setEditingItem);
  const setNumpadValue = usePurchaseStore((state) => state.setNumpadValue);
  const setShowLowStockOnly = usePurchaseStore((state) => state.setShowLowStockOnly);
  const setSelectedSupplier = usePurchaseStore((state) => state.setSelectedSupplier);
  const setPaymentMethod = usePurchaseStore((state) => state.setPaymentMethod);
  const setNotes = usePurchaseStore((state) => state.setNotes);
  const resetStore = usePurchaseStore((state) => state.resetStore);

  // Local state for validation
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadProducts();
    loadContacts({});
  }, [loadProducts, loadContacts]);

  // Hide app shell when purchase view is mounted (full-screen overlay pattern)
  useEffect(() => {
    setHideAppShell(true);
    setHideBottomNav(true);
    return () => {
      setHideAppShell(false);
      setHideBottomNav(false);
    };
  }, [setHideAppShell, setHideBottomNav]);

  // Get suppliers from contacts
  const suppliers = useMemo(() => {
    return contacts.filter(c => c.type === 'supplier');
  }, [contacts]);

  // Filter products by category, search, and low stock
  const filteredProducts = useMemo(() => {
    let result = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }
    
    // Sort: low stock first
    result = [...result].sort((a, b) => {
      const aIsLow = a.quantity <= LOW_STOCK_THRESHOLD;
      const bIsLow = b.quantity <= LOW_STOCK_THRESHOLD;
      
      if (aIsLow && !bIsLow) return -1;
      if (!aIsLow && bIsLow) return 1;
      
      if (aIsLow && bIsLow) {
        return a.quantity - b.quantity;
      }
      
      return a.name.localeCompare(b.name);
    });
    
    // Filter to low stock only if enabled
    if (showLowStockOnly) {
      result = result.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);
    }
    
    return result;
  }, [products, selectedCategory, searchQuery, showLowStockOnly]);

  // Check if product is in cart
  const isInCart = (productId: string) => cart.some(item => item.id === productId);

  // Handle product tap
  const handleProductTap = (product: Product) => {
    openQuickAdd({
      id: product.id,
      name: product.name,
      currentStock: product.quantity,
      lastCost: product.cost || 0,
    });
  };

  // Handle numpad actions
  const handleNumpadAction = (action: string) => {
    if (!editingItem) return;
    
    if (action === '✓') {
      setEditingItem(null);
      return;
    }
    
    const val = parseFloat(numpadValue);
    if (Number.isNaN(val) || val < 0) return;

    if (action === 'Cant') {
      if (val > 0) {
        updateCartItem(editingItem.id, { quantity: Math.floor(val) });
      }
    } else if (action === 'Costo') {
      updateCartItem(editingItem.id, { unitCost: val });
    }
    setNumpadValue('0');
  };

  // Validate before completing purchase
  const validatePurchase = (): boolean => {
    setValidationError(null);
    
    if (cart.length === 0) {
      setValidationError('Agrega productos al carrito');
      return false;
    }
    
    // If payment method is credit, supplier is required
    if (paymentMethod === 'Crédito' && !selectedSupplierId) {
      setValidationError('Para compras a crédito, debe seleccionar un proveedor');
      return false;
    }
    
    return true;
  };

  // Complete purchase
  const handleCompletePurchase = () => {
    if (!validatePurchase()) return;
    
    const result = PurchaseService.completePurchase(
      cart,
      selectedSupplierId,
      selectedSupplierName,
      paymentMethod,
      notes
    );
    
    if (result) {
      showSuccessModal(
        '¡Compra Registrada!',
        `Se actualizó el inventario de ${cart.length} producto${cart.length > 1 ? 's' : ''} por ${formatCurrency(total)}`
      );
      resetStore();
      onClose();
    }
  };

  // Handle close with confirmation if cart has items
  const handleClose = () => {
    if (cart.length > 0) {
      if (window.confirm('¿Deseas salir? Se perderán los productos en el carrito.')) {
        resetStore();
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className={DETAIL_VIEW_HEADER}>
        <div className="flex items-center">
          <button onClick={handleClose} className={ICON_BTN_CLOSE} aria-label="Volver">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className={TEXT_DETAIL_HEADER_TITLE}>Registrar Compra</h2>
        </div>
        
        {/* Low Stock Toggle */}
        <button
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            showLowStockOnly
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
          }`}
        >
          {showLowStockOnly ? '⚡ Stock Bajo' : 'Ver Todos'}
        </button>
      </div>

      {/* Products View */}
      <div className={`flex-1 overflow-hidden ${activeTab === 'products' ? 'flex flex-col' : 'hidden'}`}>
        {/* Search and Categories */}
        <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className={`${INPUT_BASE_CLASSES} pl-9`}
              />
            </div>
            <BarcodeScanButton
              onScan={(result) => {
                // Find product by barcode and open quick add modal
                const product = products.find(p => p.barcode === result.barcode);
                if (product) {
                  openQuickAdd({
                    id: product.id,
                    name: product.name,
                    currentStock: product.quantity,
                    lastCost: product.cost || 0,
                  });
                } else {
                  // Fall back to search if no exact match
                  setSearchQuery(result.barcode);
                }
              }}
              title="Escanear Producto"
              subtitle="Escanea el código de barras para agregar a compra"
              variant="primary"
              iconOnly
              size="md"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-white border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <p>No hay productos disponibles</p>
              {showLowStockOnly && (
                <button
                  onClick={() => setShowLowStockOnly(false)}
                  className="text-blue-600 dark:text-blue-400 mt-2 underline"
                >
                  Ver todos los productos
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <PurchaseProductCard
                  key={product.id}
                  product={product}
                  isInCart={isInCart(product.id)}
                  onTap={handleProductTap}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Cart Button */}
        <div
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          className={`fixed left-4 right-4 z-[55] transition-all duration-300 transform ${
            cart.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={() => setActiveTab('cart')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                {itemCount} items
              </div>
              <span className="text-sm text-blue-100">Ver carrito</span>
            </div>
            <div className="font-bold text-lg">{formatCurrency(total)}</div>
          </button>
        </div>
      </div>

      {/* Cart View */}
      <div className={`flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-800 ${activeTab === 'cart' ? '' : 'hidden'}`}>
        {/* Cart Header */}
        <div className={DETAIL_VIEW_HEADER}>
          <div className="flex items-center">
            <button onClick={() => setActiveTab('products')} className={ICON_BTN_CLOSE} aria-label="Volver">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h2 className={TEXT_DETAIL_HEADER_TITLE}>Carrito de Compra</h2>
          </div>
          <div className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
            {itemCount} productos
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <DocumentTextIcon className="w-16 h-16 mb-4" />
              <p>Carrito vacío</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <PurchaseCartItem
                  key={item.id}
                  item={item}
                  isEditing={editingItem?.id === item.id}
                  onClick={() => setEditingItem(item)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {editingItem ? (
            // Numpad Editor
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-slate-500 dark:text-slate-300 text-sm">
                  Editando: <span className="text-slate-900 dark:text-slate-100">{editingItem.name}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      removeFromCart(editingItem.id);
                      setEditingItem(null);
                    }}
                    className={`${BTN_FOOTER_DANGER} px-3 py-2 text-sm`}
                  >
                    <TrashIcon className="w-4 h-4" />
                    Quitar
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className={`${BTN_FOOTER_SECONDARY} px-3 py-2 text-sm`}
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Cerrar
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mb-3">
                <div className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-lg flex flex-col justify-center px-4 py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-300 uppercase font-semibold tracking-wider">
                    Entrada
                  </span>
                  <span className="text-2xl font-mono text-slate-900 dark:text-slate-100">{numpadValue}</span>
                </div>
                <div className="flex-none w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col justify-center items-center px-2">
                  <span className="text-xs text-slate-400 dark:text-slate-300">Cant. actual</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{editingItem.quantity}</span>
                </div>
              </div>

              <NumpadComp value={numpadValue} onChange={setNumpadValue} onAction={handleNumpadAction} />
            </div>
          ) : (
            // Purchase Summary
            <div className="p-4 space-y-4">
              {/* Supplier Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Proveedor
                  {paymentMethod === 'Crédito' && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  value={selectedSupplierId || ''}
                  onChange={(e) => {
                    const id = e.target.value || null;
                    const name = id 
                      ? suppliers.find(s => s.id === id)?.name || 'Sin Proveedor'
                      : 'Sin Proveedor';
                    setSelectedSupplier(id, name);
                  }}
                  className={INPUT_BASE_CLASSES}
                >
                  <option value="">Sin Proveedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Método de Pago
                </label>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        paymentMethod === method
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Notas (opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Compra mensual"
                  className={INPUT_BASE_CLASSES}
                />
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  {validationError}
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-slate-900 dark:text-slate-100 font-bold text-xl">Total</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">{formatCurrency(total)}</span>
              </div>

              {/* Complete Button */}
              <button
                onClick={handleCompletePurchase}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Registrar Compra {formatCurrency(total)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal />
    </div>
  );
};

export default PurchaseView;
