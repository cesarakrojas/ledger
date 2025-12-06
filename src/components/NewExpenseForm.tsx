import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { CategoryConfig, Product, ProductQuantity, Contact } from '../types';
import { INPUT_BASE_CLASSES, FORM_LABEL, BTN_PRIMARY, FORM_FOOTER, ERROR_BANNER } from '../utils/constants';
import { CARD_PRODUCT_ITEM, CART_SUMMARY_OUTFLOW } from '../utils/styleConstants';
import { formatCurrency } from '../utils/formatters';
import { ExclamationCircleIcon } from './icons';
import * as inventoryService from '../services/inventoryService';
import * as dataService from '../services/dataService';
import * as contactService from '../services/contactService';
import { getTopProducts } from '../utils/commerce';
import QuantityStepper from './QuantityStepper';


interface NewExpenseFormProps {
  onAddTransaction: (transaction: { 
    description: string; 
    amount: number; 
    type: 'outflow'; 
    category?: string; 
    paymentMethod?: string;
    items?: { productId: string; productName: string; quantity: number; variantName?: string; price: number; }[];
  }) => void;
  categoryConfig: CategoryConfig;
  currencyCode: string;
  paymentMethods?: string[];
  onClose?: () => void;
  onSuccess?: (title: string, message: string, type: 'expense' | 'purchase') => void;
}

export const NewExpenseForm: React.FC<NewExpenseFormProps> = ({ 
  onAddTransaction, 
  categoryConfig, 
  currencyCode,
  paymentMethods = ['Efectivo', 'Tarjeta', 'Transferencia'],
  onClose,
  onSuccess
}) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  // Product purchase states
  const [products, setProducts] = useState<Product[]>([]);
  const [productQuantities, setProductQuantities] = useState<ProductQuantity>({});
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [isCartConfirmed, setIsCartConfirmed] = useState(false);
  
  // Supplier selection states
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  // Derived state for the mode
  const isProductPurchase = category === 'Compra de Productos';
  
  // Load suppliers on mount
  useEffect(() => {
    setSuppliers(contactService.getAllContacts({ type: 'supplier' }));
  }, []);
  
  // Close supplier dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
        setShowSupplierDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Filter suppliers based on search
  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return suppliers;
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(supplierSearch.toLowerCase())
    );
  }, [suppliers, supplierSearch]);
  
  // Get selected supplier name
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  // Use shared top-products helper

  // Mode Switcher Logic
  const handleModeSwitch = (mode: 'expense' | 'purchase') => {
    setFormError(null);
    if (mode === 'purchase') {
      setCategory('Compra de Productos');
      const loadedProducts = inventoryService.getAllProducts();
      setProducts(loadedProducts);
      setProductQuantities({});
      setSearchTerm('');
      setShowProductSelection(true); // Open selection immediately
      setIsCartConfirmed(false);
      // Reload suppliers in case new ones were added
      setSuppliers(contactService.getAllContacts({ type: 'supplier' }));
    } else {
      setCategory('');
      setProducts([]);
      setProductQuantities({});
      setShowProductSelection(false);
      setIsCartConfirmed(false);
      setSelectedSupplierId('');
      setSupplierSearch('');
    }
  };

  // Handle standard category change (for regular expenses)
  const handleCategoryChange = (newCategory: string) => {
    // Prevent manual selection of "Compra de Productos" via dropdown to enforce the toggle UX
    if (newCategory === 'Compra de Productos') {
        handleModeSwitch('purchase');
    } else {
        setCategory(newCategory);
    }
  };

  const handleConfirmCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormError(null);
    if (Object.keys(productQuantities).length > 0) {
      setIsCartConfirmed(true);
      setShowProductSelection(false);
    } else {
      setFormError('Agrega al menos un producto antes de confirmar.');
    }
  };

  const handleEditCart = () => {
    setFormError(null);
    setShowProductSelection(true);
  };

  const updateProductQuantity = (productId: string, newQuantity: number, variantId?: string) => {
    if (newQuantity === 0) {
      const newQuantities = { ...productQuantities };
      delete newQuantities[productId];
      setProductQuantities(newQuantities);
    } else {
      setProductQuantities({
        ...productQuantities,
        [productId]: {
          quantity: newQuantity,
          selectedVariantId: variantId
        }
      });
    }
  };

  const updateProductVariant = (productId: string, variantId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setProductQuantities({
      ...productQuantities,
      [productId]: {
        quantity: 1,
        selectedVariantId: variantId
      }
    });
  };

  const calculateProductsTotal = () => {
    return Object.entries(productQuantities).reduce((sum, [productId, data]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return sum;
      return sum + (product.price * data.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Logic for Product Purchase (Inventory Restock)
    if (isProductPurchase) {
      const itemCount = Object.keys(productQuantities).length;
      if (itemCount === 0) {
        setFormError('Agrega al menos un producto a la compra.');
        return;
      }

      const total = calculateProductsTotal();

      // Update inventory for each item (add to stock)
      for (const [productId, data] of Object.entries(productQuantities)) {
        const product = products.find(p => p.id === productId);
        if (!product) continue;

        if (data.selectedVariantId) {
          // Update variant quantity
          const variant = product.variants.find(v => v.id === data.selectedVariantId);
          if (variant) {
            inventoryService.updateVariantQuantity(
              productId,
              data.selectedVariantId,
              variant.quantity + data.quantity
            );
          }
        } else {
          // Update standalone product quantity (add to existing stock)
          inventoryService.updateProduct(productId, {
            standaloneQuantity: product.standaloneQuantity + data.quantity
          });
        }
      }

      // Create transaction description (include supplier if selected)
      const supplierName = selectedSupplier?.name;
      const baseDescription = itemCount === 1 
        ? `Compra: ${products.find(p => p.id === Object.keys(productQuantities)[0])?.name}${Object.values(productQuantities)[0].quantity > 1 ? ` x${Object.values(productQuantities)[0].quantity}` : ''}`
        : `Compra: ${itemCount} productos`;
      const transactionDescription = supplierName 
        ? `${baseDescription} (Proveedor: ${supplierName})`
        : baseDescription;

      // Build items array
      const items = Object.entries(productQuantities).map(([productId, data]) => {
        const product = products.find(p => p.id === productId);
        if (!product) return null;
        
        let variantName: string | undefined;
        if (data.selectedVariantId) {
          const variant = product.variants.find(v => v.id === data.selectedVariantId);
          variantName = variant?.name;
        }
        
        return {
          productId: product.id,
          productName: product.name,
          quantity: data.quantity,
          variantName,
          price: product.price
        };
      }).filter(item => item !== null) as { productId: string; productName: string; quantity: number; variantName?: string; price: number; }[];

      onAddTransaction({
        description: transactionDescription,
        amount: total,
        type: 'outflow',
        category: 'Compra de Productos',
        paymentMethod: paymentMethod || undefined,
        items
      });

      // Cleanup
      resetForm();

      if (onSuccess) {
        const message = itemCount === 1 
          ? `Compra de ${formatCurrency(total, currencyCode)} registrada`
          : `Compra de ${itemCount} productos por ${formatCurrency(total, currencyCode)}`;
        onSuccess('¡Compra Completada!', message, 'purchase');
      }
      
      if (onClose) onClose();

    } else {
      // Logic for Regular Expense
      if (description.trim() && parseFloat(amount) > 0) {
        const expenseAmount = parseFloat(amount);
        
        onAddTransaction({ 
          description, 
          amount: expenseAmount, 
          type: 'outflow',
          category: category || undefined,
          paymentMethod: paymentMethod || undefined
        });
        
        // Cleanup
        resetForm();
        
        if (onSuccess) {
          onSuccess('¡Gasto Registrado!', `Gasto de ${formatCurrency(expenseAmount, currencyCode)} registrado`, 'expense');
        }
        
        if (onClose) onClose();
      }
    }
  };

  const resetForm = () => {
      setDescription('');
      setCategory('');
      setPaymentMethod('');
      setAmount('');
      setProductQuantities({});
      setProducts([]);
      setSearchTerm('');
      setFormError(null);
      setSelectedSupplierId('');
      setSupplierSearch('');
  };

  const filteredProducts = isProductPurchase 
    ? (searchTerm.trim()
        ? products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : getTopProducts(products, dataService.getTransactionsWithFilters({})))
    : [];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-container">
        
        {/* 1. EXPLICIT TYPE TOGGLE (New UX) */}
        <div className="bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl flex mb-2">
            <button
                type="button"
                onClick={() => handleModeSwitch('expense')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    !isProductPurchase 
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Gasto Simple
            </button>
            <button
                type="button"
                onClick={() => handleModeSwitch('purchase')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    isProductPurchase 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
            >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                + Compras
            </button>
        </div>

        {/* Validation Error Message */}
        {formError && (
            <div className={ERROR_BANNER}>
                <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                {formError}
            </div>
        )}

        {/* Category Selection - Only show for Regular Expenses */}
        {!isProductPurchase && categoryConfig.outflowCategories.length > 0 && (
          <div>
            <label className={FORM_LABEL}>
              Categoría
            </label>
            <select 
              value={category} 
              onChange={e => handleCategoryChange(e.target.value)} 
              className={INPUT_BASE_CLASSES}
            >
              <option value="">Seleccionar categoría (opcional)</option>
              {categoryConfig.outflowCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {/* Product Purchase Section */}
        {isProductPurchase ? (
          <>
            {showProductSelection && (
              <>
                {/* Product Search - Removed autoFocus for Mobile UX */}
                <div>
                  <label className={FORM_LABEL}>
                    Buscar Producto
                  </label>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o categoría..."
                    className={INPUT_BASE_CLASSES}
                  />
                  {!searchTerm.trim() && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mostrando los 5 productos más frecuentes
                    </p>
                  )}
                </div>

                {/* Product Cards Grid */}
                <div className="grid grid-cols-1 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                  <p>No se encontraron productos</p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const productData = productQuantities[product.id];
                  const currentQuantity = productData?.quantity || 0;
                  const selectedVariantId = productData?.selectedVariantId || (product.hasVariants && product.variants.length > 0 ? product.variants[0].id : undefined);

                  return (
                    <div
                      key={product.id}
                      className={CARD_PRODUCT_ITEM}
                    >
                    

                      {/* Variant selector and quantity stepper rendered by QuantityStepper */}

                      {/* Product Info */}
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div className={product.hasVariants && product.variants.length > 0 ? "pr-20" : ""}>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1 line-clamp-2">{product.name}</h3>
                        </div>

                        <div className="flex justify-between items-end gap-3">
                          <div>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(product.price, currencyCode)}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Stock actual: {product.totalQuantity}</p>
                          </div>

                          <QuantityStepper
                            product={product}
                            currentQuantity={currentQuantity}
                            selectedVariantId={selectedVariantId}
                            onQuantityChange={(q, variantId) => updateProductQuantity(product.id, q, variantId)}
                            onVariantChange={(variantId) => updateProductVariant(product.id, variantId)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
              </>
            )}

            {isCartConfirmed && (
              /* Cart Summary */
              <div className={CART_SUMMARY_OUTFLOW}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Productos en Compra
                  </h3>
                  <button
                    type="button"
                    onClick={handleEditCart}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold"
                  >
                    + Agregar más
                  </button>
                </div>
                
                <div className="space-y-2 mb-3">
                  {Object.entries(productQuantities).map(([productId, data]) => {
                    const product = products.find(p => p.id === productId);
                    if (!product || data.quantity === 0) return null;
                    const variant = data.selectedVariantId ? product.variants.find(v => v.id === data.selectedVariantId) : null;
                    return (
                      <div key={productId} className="flex justify-between items-center text-sm bg-white/50 dark:bg-slate-800/50 rounded-lg p-2">
                        <span className="text-slate-700 dark:text-slate-300">
                          {product.name} {variant && `(${variant.name})`} × {data.quantity}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {formatCurrency(product.price * data.quantity, currencyCode)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t border-red-300 dark:border-red-700 pt-2 flex justify-between items-center font-bold text-slate-800 dark:text-white">
                  <span>Subtotal:</span>
                  <span className="text-lg">{formatCurrency(calculateProductsTotal(), currencyCode)}</span>
                </div>
              </div>
            )}
            
            {/* Supplier Selection - Show when cart is confirmed */}
            {isCartConfirmed && (
              <div ref={supplierDropdownRef} className="relative">
                <label className={FORM_LABEL}>
                  Proveedor (opcional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedSupplier ? selectedSupplier.name : supplierSearch}
                    onChange={(e) => {
                      setSupplierSearch(e.target.value);
                      setSelectedSupplierId('');
                      setShowSupplierDropdown(true);
                    }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    placeholder="Buscar o seleccionar proveedor..."
                    className={INPUT_BASE_CLASSES}
                  />
                  {selectedSupplier && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSupplierId('');
                        setSupplierSearch('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Supplier Dropdown */}
                {showSupplierDropdown && !selectedSupplier && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuppliers.length === 0 ? (
                      <div className="p-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                        {suppliers.length === 0 
                          ? 'No hay proveedores registrados' 
                          : 'No se encontraron proveedores'}
                      </div>
                    ) : (
                      filteredSuppliers.map(supplier => (
                        <button
                          key={supplier.id}
                          type="button"
                          onClick={() => {
                            setSelectedSupplierId(supplier.id);
                            setSupplierSearch('');
                            setShowSupplierDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-slate-800 dark:text-white">{supplier.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                
                {suppliers.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Puedes agregar proveedores desde Clientes → Nuevo → Proveedor
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Regular Expense Fields */}
            <div>
              <label className={FORM_LABEL}>
                Descripción
              </label>
              <input 
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Descripción del gasto" 
                required 
                className={INPUT_BASE_CLASSES}
              />
            </div>

            <div>
              <label className={FORM_LABEL}>
                Monto
              </label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0.00" 
                min="0.01" 
                step="0.01" 
                required 
                className={INPUT_BASE_CLASSES}
              />
            </div>
          </>
        )}
      </div>

      {/* Fixed Footer - Always Visible */}
      <div className={FORM_FOOTER}>
        {/* Payment Method - Only show for regular expenses OR when cart is confirmed for product purchases */}
        {(!isProductPurchase || isCartConfirmed) && (
          <div>
            <label className={FORM_LABEL}>
              Método de Pago
            </label>
            <select 
              value={paymentMethod} 
              onChange={e => setPaymentMethod(e.target.value)} 
              className={INPUT_BASE_CLASSES}
            >
              <option value="">Seleccionar método</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        )}

        {/* Total Display - for product purchases when cart is confirmed */}
        {isProductPurchase && isCartConfirmed && Object.keys(productQuantities).length > 0 && (
          <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-slate-700 dark:text-slate-300">Total Compra:</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(calculateProductsTotal(), currencyCode)}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Action Button */}
        {isProductPurchase && !isCartConfirmed ? (
          /* Product selection mode - show "Ver Resumen" button */
          <button
            type="button"
            onClick={handleConfirmCart}
            disabled={Object.keys(productQuantities).length === 0}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg"
          >
            {Object.keys(productQuantities).length > 0 
              ? `Ver Resumen (${Object.keys(productQuantities).length})` 
              : 'Selecciona productos'}
          </button>
        ) : (
          /* Regular expense or confirmed cart - show submit button */
          <button
            type="submit"
            className={BTN_PRIMARY}
          >
            {isProductPurchase ? 'Registrar Compra' : 'Registrar Gasto'}
          </button>
        )}
      </div>
    </form>
  );
};
