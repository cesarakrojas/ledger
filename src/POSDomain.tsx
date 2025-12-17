/**
 * POSDomain.tsx
 * Domain module for Point of Sale functionality
 * 
 * Mobile-first single-screen POS experience following app's visual style.
 * Contains: POSView, ProductCard, NumpadComp, CartView
 */

import React, { useMemo, useEffect } from 'react';
import {
  SearchIcon,
  CreditCardIcon,
  UserIcon,
  DocumentTextIcon,
  TrashIcon,
  XMarkIcon,
  ChevronLeftIcon,
} from './components/icons';
import { POSService } from './services';
import {
  CARD_STYLES,
  TEXT_PAGE_TITLE,
  INPUT_BASE_CLASSES,
  TEXT_AMOUNT_INFLOW,
  BTN_FOOTER_DANGER,
  BTN_FOOTER_SECONDARY,
  DETAIL_VIEW_HEADER,
  TEXT_DETAIL_HEADER_TITLE,
  ICON_BTN_CLOSE,
  formatCurrency,
} from './shared';
import { usePOSStore, useInventoryStore, useUIStore } from './stores';
import type { Product } from './shared';
import type { CartItem } from './stores/posStore';

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

// Badge colors by category (using app's emerald theme)
const getCategoryBadgeColor = (category?: string): string => {
  switch (category) {
    case 'grains': return 'bg-amber-500';
    case 'drinks': return 'bg-emerald-500';
    case 'sweets': return 'bg-orange-500';
    case 'dairy': return 'bg-yellow-500';
    case 'wellness': return 'bg-teal-500';
    default: return 'bg-slate-500';
  }
};

// =============================================================================
// ProductCard Component
// =============================================================================

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  return (
    <div
      onClick={() => onAdd(product)}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col active:scale-95 transition-transform duration-100 touch-manipulation h-full shadow-sm dark:shadow-none"
    >
      <div className="p-3 flex items-start gap-3">
        <div className={`w-12 h-12 rounded-md flex-shrink-0 ${getCategoryBadgeColor(product.category)}`} />
        <div className="flex-1">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm leading-tight mb-1 line-clamp-2">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xl sm:text-2xl font-bold ${TEXT_AMOUNT_INFLOW}`}>
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// NumpadComp Component
// =============================================================================

interface NumpadProps {
  value: string;
  onChange: (value: string) => void;
  onAction: (action: string) => void;
}

const NumpadComp: React.FC<NumpadProps> = ({ value, onChange, onAction }) => {
  const keys = ['1', '2', '3', 'Qty', '4', '5', '6', '%', '7', '8', '9', 'Price', '+/-', '0', '.', '⌫'];

  const handlePress = (key: string) => {
    if (['Qty', '%', 'Price'].includes(key)) {
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
    
    if (['Qty', '%', 'Price'].includes(key)) {
      return `${base} bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700`;
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
// CartItemRow Component
// =============================================================================

interface CartItemRowProps {
  item: CartItem;
  isEditing: boolean;
  onClick: () => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, isEditing, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-3 rounded-xl border flex justify-between items-start transition-colors cursor-pointer ${
        isEditing
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-700'
          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-none'
      }`}
    >
      <div>
        <h4 className="font-medium text-slate-900 dark:text-slate-100">{item.name}</h4>
        <div className="text-xs text-slate-500 dark:text-slate-300 mt-1 flex gap-2">
          <span>{item.quantity} x {formatCurrency(item.price)} / {item.unit}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(item.price * item.quantity)}
        </div>
        {isEditing && (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Editando
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// POSView Component
// =============================================================================

export interface POSViewProps {
  // Props are optional - component uses stores directly
}

export const POSView: React.FC<POSViewProps> = () => {
  // Inventory store for products
  const products = useInventoryStore((state) => state.products);
  const loadProducts = useInventoryStore((state) => state.loadProducts);

  // POS store for cart and UI state
  const cart = usePOSStore((state) => state.cart);
  const subtotal = usePOSStore((state) => state.subtotal);
  const tax = usePOSStore((state) => state.tax);
  const total = usePOSStore((state) => state.total);
  const itemCount = usePOSStore((state) => state.itemCount);
  const activeTab = usePOSStore((state) => state.activeTab);
  const selectedCategory = usePOSStore((state) => state.selectedCategory);
  const searchQuery = usePOSStore((state) => state.searchQuery);
  const editingItem = usePOSStore((state) => state.editingItem);
  const numpadValue = usePOSStore((state) => state.numpadValue);

  // POS actions
  const addToCart = usePOSStore((state) => state.addToCart);
  const updateCartItem = usePOSStore((state) => state.updateCartItem);
  const removeFromCart = usePOSStore((state) => state.removeFromCart);
  const clearCart = usePOSStore((state) => state.clearCart);
  const setActiveTab = usePOSStore((state) => state.setActiveTab);
  const setSelectedCategory = usePOSStore((state) => state.setSelectedCategory);
  const setSearchQuery = usePOSStore((state) => state.setSearchQuery);
  const setEditingItem = usePOSStore((state) => state.setEditingItem);
  const setNumpadValue = usePOSStore((state) => state.setNumpadValue);

  // UI store
  const showSuccessModal = useUIStore((state) => state.showSuccessModal);
  const setHideBottomNav = useUIStore((state) => state.setHideBottomNav);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Hide bottom nav when cart view is active
  useEffect(() => {
    setHideBottomNav(activeTab === 'cart');
    // Reset when unmounting
    return () => setHideBottomNav(false);
  }, [activeTab, setHideBottomNav]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle numpad action buttons
  const handleNumpadAction = (action: string) => {
    if (!editingItem) return;
    const val = parseFloat(numpadValue);
    if (Number.isNaN(val) || val < 0) return;

    if (action === 'Qty') {
      updateCartItem(editingItem.id, { quantity: val });
    } else if (action === 'Price') {
      updateCartItem(editingItem.id, { price: val });
    } else if (action === '%') {
      const currentPrice = editingItem.price;
      const newPrice = currentPrice - (currentPrice * (val / 100));
      updateCartItem(editingItem.id, { price: Math.max(0, newPrice) });
    }
    setNumpadValue('0');
  };

  // Process payment
  const proceedPayment = () => {
    if (cart.length === 0) return;

    // Map cart items to POSService format with cost for COGS tracking
    const items = cart.map((item) => ({
      product: { id: item.id, name: item.name, price: item.price } as Product,
      quantity: item.quantity,
      unitPrice: item.price,
      cost: item.cost, // Include cost for COGS calculation
    }));

    POSService.completeSale(items, 'cash');
    clearCart();
    showSuccessModal('Venta Completada', `Total cobrado: ${formatCurrency(total)}`);
  };

  return (
    <div className="w-full min-h-screen h-full animate-fade-in flex flex-col text-slate-900 dark:text-slate-100">
      {/* Header - Hidden when cart view is active */}
      {activeTab !== 'cart' && (
        <div className={`${CARD_STYLES} rounded-b-none`}>
          <div className="flex flex-col">
            <h2 className={TEXT_PAGE_TITLE}>Punto de Venta</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona tus ventas y cobros</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-900">
        {/* Products View */}
        <div
          className={`absolute inset-0 flex flex-col transition-transform duration-300 ${
            activeTab === 'products' ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Search and Categories */}
          <div className="px-4 py-3 z-10 bg-white dark:bg-slate-800">
            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-200" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className={`${INPUT_BASE_CLASSES} pl-9`}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500'
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
                <p className="text-sm mt-2">Agrega productos en el módulo de Inventario</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart View */}
        <div
          className={`absolute inset-0 bg-white dark:bg-slate-800 flex flex-col transition-transform duration-300 ${
            activeTab === 'cart' ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Cart Header */}
          <div className={DETAIL_VIEW_HEADER}>
            <div className="flex items-center">
              <button
                onClick={() => setActiveTab('products')}
                className={ICON_BTN_CLOSE}
                aria-label="Volver"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h2 className={TEXT_DETAIL_HEADER_TITLE}>Orden Actual</h2>
            </div>
            <div className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
              Invitado
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-400 opacity-60">
                <DocumentTextIcon className="w-16 h-16 mb-4" />
                <p>Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    isEditing={editingItem?.id === item.id}
                    onClick={() => setEditingItem(item)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer (Numpad or Summary) */}
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none">
            {editingItem ? (
              // Numpad Editor
              <div className="p-4 bg-white dark:bg-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-slate-500 dark:text-slate-300 text-sm">
                    Editando: <span className="text-slate-900 dark:text-slate-100">{editingItem.name}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => removeFromCart(editingItem.id)}
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
                  <div className="flex-none w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col justify-center items-center">
                    <span className="text-xs text-slate-400 dark:text-slate-300">Cantidad actual</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{editingItem.quantity}</span>
                  </div>
                </div>

                <NumpadComp value={numpadValue} onChange={setNumpadValue} onAction={handleNumpadAction} />
              </div>
            ) : (
              // Order Summary
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex flex-col items-center justify-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <UserIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Cliente</span>
                  </button>
                  <button className="flex flex-col items-center justify-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <DocumentTextIcon className="w-5 h-5 text-slate-500 dark:text-slate-300 mb-1" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Nota</span>
                  </button>
                  <button className="flex flex-col items-center justify-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="w-5 h-5 text-slate-500 dark:text-slate-300 mb-1" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Acciones</span>
                  </button>
                </div>

                <div className="space-y-1 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between text-slate-500 dark:text-slate-300 text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-300 text-sm">
                    <span>Impuestos (10%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold text-xl pt-1">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  onClick={proceedPayment}
                  disabled={cart.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <CreditCardIcon className="w-5 h-5" />
                  Pagar {formatCurrency(total)}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Floating Cart Button */}
        <div
          className={`fixed bottom-20 left-4 right-4 z-30 transition-all duration-300 transform ${
            activeTab !== 'cart' && cart.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={() => setActiveTab('cart')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 dark:bg-white/10 px-3 py-1 rounded-full text-sm font-bold">
                {itemCount} artículos
              </div>
              <span className="text-sm text-emerald-100">Ver carrito</span>
            </div>
            <div className="font-bold text-lg">{formatCurrency(total)}</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSView;
