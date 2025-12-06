import React, { useState, useRef, useEffect } from 'react';
import type { Product, CategoryConfig, Service } from '../types';
import { INPUT_BASE_CLASSES, FORM_LABEL, BTN_PRIMARY, FORM_FOOTER, ERROR_BANNER } from '../utils/constants';
import { CARD_PRODUCT_ITEM, CART_SUMMARY_INFLOW } from '../utils/styleConstants';
import { formatCurrency } from '../utils/formatters';
import { ExclamationCircleIcon } from './icons';
import * as inventoryService from '../services/inventoryService';
import * as serviceService from '../services/serviceService';
import * as dataService from '../services/dataService';
import { getTopProducts } from '../utils/commerce';
import QuantityStepper from './QuantityStepper';

// Combined item type for products and services
type CatalogItem = 
  | { type: 'product'; data: Product }
  | { type: 'service'; data: Service };


interface NewInflowFormProps {
  products: Product[];
  onAddTransaction: (transaction: { description: string; amount: number; type: 'inflow'; category?: string; paymentMethod?: string; items?: { productId: string; productName: string; quantity: number; variantName?: string; price: number; }[] }) => void;
  categoryConfig: CategoryConfig;
  currencyCode: string;
  paymentMethods?: string[];
  onClose?: () => void;
  onSuccess?: (title: string, message: string) => void;
}

// Extended quantity map that includes services
interface ItemQuantity {
  [itemId: string]: {
    quantity: number;
    selectedVariantId?: string;
    isService?: boolean;
    price: number;
    name: string;
  };
}

export const NewInflowForm: React.FC<NewInflowFormProps> = ({ products, onAddTransaction, categoryConfig, currencyCode, paymentMethods = ['Efectivo', 'Tarjeta', 'Transferencia'], onClose, onSuccess }) => {
  // Mode State: 'inventory' (default) or 'manual'
  const [mode, setMode] = useState<'inventory' | 'manual'>('manual');
  
  // Services state
  const [services, setServices] = useState<Service[]>([]);
  
  const [productQuantities, setProductQuantities] = useState<ItemQuantity>({});
  const [paymentMethod, setPaymentMethod] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isCartConfirmed, setIsCartConfirmed] = useState(false);
  const [manualDescription, setManualDescription] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [category, setCategory] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Load services on mount
  useEffect(() => {
    const loadServices = () => {
      const activeServices = serviceService.getAllServices().filter(s => s.isActive);
      setServices(activeServices);
    };
    loadServices();
    
    const unsubscribe = serviceService.subscribeToServices(loadServices);
    return unsubscribe;
  }, []);

  // Reset states when switching modes
  const handleModeSwitch = (newMode: 'inventory' | 'manual') => {
    setMode(newMode);
    setFormError(null);
    if (newMode === 'manual') {
      setProductQuantities({});
      setIsCartConfirmed(false);
      setSearchTerm('');
    } else {
      setManualDescription('');
      setManualAmount('');
      setCategory('');
    }
  };

  // Create combined catalog items (products + services)
  const getCatalogItems = (): CatalogItem[] => {
    const productItems: CatalogItem[] = products.map(p => ({ type: 'product' as const, data: p }));
    const serviceItems: CatalogItem[] = services.map(s => ({ type: 'service' as const, data: s }));
    return [...productItems, ...serviceItems];
  };

  // Filter catalog items based on search
  const filteredItems: CatalogItem[] = searchTerm.trim()
    ? getCatalogItems().filter(item => 
        item.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.data.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [
        // Show top products first, then services
        ...getTopProducts(products, dataService.getTransactionsWithFilters({})).map(p => ({ type: 'product' as const, data: p })),
        ...services.slice(0, 5).map(s => ({ type: 'service' as const, data: s }))
      ];

  // Unified function for updating item quantities (products or services)
  const updateItemQuantity = (itemId: string, newQuantity: number, itemType: 'product' | 'service', variantId?: string) => {
    if (newQuantity === 0) {
      const newQuantities = { ...productQuantities };
      delete newQuantities[itemId];
      setProductQuantities(newQuantities);
      return;
    }

    if (itemType === 'product') {
      const product = products.find(p => p.id === itemId);
      if (!product) return;
      setProductQuantities({
        ...productQuantities,
        [itemId]: {
          quantity: newQuantity,
          selectedVariantId: variantId,
          isService: false,
          price: product.price,
          name: product.name
        }
      });
    } else {
      const service = services.find(s => s.id === itemId);
      if (!service) return;
      setProductQuantities({
        ...productQuantities,
        [itemId]: {
          quantity: newQuantity,
          isService: true,
          price: service.price,
          name: service.name
        }
      });
    }
  };

  // Unified state getter
  const itemQuantities = productQuantities;

  const updateProductVariant = (productId: string, variantId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const variant = product.variants.find(v => v.id === variantId);
    if (variant && variant.quantity > 0) {
      setProductQuantities({
        ...productQuantities,
        [productId]: {
          quantity: 1,
          selectedVariantId: variantId,
          isService: false,
          price: product.price,
          name: product.name
        }
      });
    }
  };

  const getMaxStock = (product: Product, variantId?: string) => {
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      return variant?.quantity || 0;
    }
    return product.totalQuantity;
  };

  const calculateTotal = () => {
    return Object.entries(productQuantities).reduce((sum, [_itemId, data]) => {
      return sum + (data.price * data.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const itemCount = Object.keys(productQuantities).length;
    const hasManualEntry = manualAmount && parseFloat(manualAmount) > 0;

    // Validation
    if (mode === 'inventory' && itemCount === 0) {
      setFormError('Agrega al menos un producto o servicio para el Ingreso.');
      return;
    }
    if (mode === 'manual' && !hasManualEntry) {
      setFormError('Ingresa un monto válido.');
      return;
    }

    // Handle Manual Entry
    if (mode === 'manual') {
      const amount = parseFloat(manualAmount);
      const description = manualDescription.trim() || 'Ingreso Simple';

      onAddTransaction({
        description,
        amount,
        type: 'inflow',
        category: category || undefined,
        paymentMethod: paymentMethod || undefined
      });

      setManualDescription('');
      setManualAmount('');
      setCategory('');
      setPaymentMethod('');

      if (onSuccess) {
        const isVenta = category === 'Ventas';
        const title = isVenta ? '¡Venta Completada!' : '¡Ingreso Registrado!';
        const messagePrefix = isVenta ? 'Venta' : 'Ingreso';
        onSuccess(title, `${messagePrefix} de ${formatCurrency(amount, currencyCode)} registrado`);
      }
      if (onClose) onClose();
      return;
    }

    // Handle Inventory inflow
    // Re-read latest persisted product state to avoid races and validate availability
    const total = calculateTotal();

    const latestProductsMap: Record<string, Product> = {};

    // Validate only products (not services) for stock availability
    for (const [itemId, data] of Object.entries(productQuantities)) {
      // Skip services - they don't have stock limits
      if (data.isService) continue;
      
      const latest = inventoryService.getProductById(itemId);
      if (!latest) {
        setFormError('Producto no encontrado. Actualiza la lista e intenta de nuevo.');
        return;
      }
      latestProductsMap[itemId] = latest;

      if (data.selectedVariantId) {
        const variant = latest.variants.find(v => v.id === data.selectedVariantId);
        const available = variant ? variant.quantity : 0;
        if (data.quantity > available) {
          setFormError(`Stock insuficiente para ${latest.name}${variant ? ` (${variant.name})` : ''}. Disponibles: ${available}`);
          return;
        }
      } else {
        // Non-variant product: use standaloneQuantity
        const available = latest.standaloneQuantity;
        if (data.quantity > available) {
          setFormError(`Stock insuficiente para ${latest.name}. Disponibles: ${available}`);
          return;
        }
      }
    }

    // Update inventory for each product (not services)
    for (const [itemId, data] of Object.entries(productQuantities)) {
      // Skip services - they don't affect inventory
      if (data.isService) continue;
      
      const latest = latestProductsMap[itemId];
      if (!latest) continue;

      if (data.selectedVariantId) {
        const variant = latest.variants.find(v => v.id === data.selectedVariantId);
        if (variant) {
          inventoryService.updateVariantQuantity(
            itemId,
            data.selectedVariantId,
            Math.max(0, variant.quantity - data.quantity)
          );
        }
      } else {
        // Non-variant product: update standaloneQuantity
        inventoryService.updateProduct(itemId, {
          standaloneQuantity: Math.max(0, latest.standaloneQuantity - data.quantity)
        });
      }
    }

    // Count products and services for description
    const productCount = Object.values(productQuantities).filter(d => !d.isService).length;
    const serviceCount = Object.values(productQuantities).filter(d => d.isService).length;
    
    let description: string;
    if (itemCount === 1) {
      const [firstId, firstData] = Object.entries(productQuantities)[0];
      const itemName = firstData.name || (firstData.isService 
        ? services.find(s => s.id === firstId)?.name 
        : products.find(p => p.id === firstId)?.name) || 'Item';
      description = `Ingreso: ${itemName}${firstData.quantity > 1 ? ` x${firstData.quantity}` : ''}`;
    } else if (productCount > 0 && serviceCount > 0) {
      description = `Ingreso: ${productCount} producto${productCount > 1 ? 's' : ''} y ${serviceCount} servicio${serviceCount > 1 ? 's' : ''}`;
    } else if (serviceCount > 0) {
      description = `Ingreso: ${serviceCount} servicio${serviceCount > 1 ? 's' : ''}`;
    } else {
      description = `Ingreso: ${productCount} producto${productCount > 1 ? 's' : ''}`;
    }

    const items = Object.entries(productQuantities).map(([itemId, data]) => {
      if (data.isService) {
        const service = services.find(s => s.id === itemId);
        if (!service) return null;
        return {
          productId: service.id,
          productName: `[Servicio] ${service.name}`,
          quantity: data.quantity,
          price: service.price
        };
      } else {
        const product = products.find(p => p.id === itemId);
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
      }
    }).filter(item => item !== null) as { productId: string; productName: string; quantity: number; variantName?: string; price: number; }[];

    onAddTransaction({
      description,
      amount: total,
      type: 'inflow',
      category: 'Ventas',
      paymentMethod: paymentMethod || undefined,
      items
    });

    setProductQuantities({});
    setPaymentMethod('');
    setSearchTerm('');

    if (onSuccess) {
      let message: string;
      if (productCount > 0 && serviceCount > 0) {
        message = `Venta de ${productCount} producto${productCount > 1 ? 's' : ''} y ${serviceCount} servicio${serviceCount > 1 ? 's' : ''} por ${formatCurrency(total, currencyCode)}`;
      } else if (serviceCount > 0) {
        message = itemCount === 1 
          ? `Servicio de ${formatCurrency(total, currencyCode)} registrado`
          : `${serviceCount} servicios por ${formatCurrency(total, currencyCode)} registrados`;
      } else {
        message = itemCount === 1 
          ? `Venta de ${formatCurrency(total, currencyCode)} registrada`
          : `Venta de ${itemCount} productos por ${formatCurrency(total, currencyCode)}`;
      }
      onSuccess('¡Venta Completada!', message);
    }
    
    if (onClose) onClose();
  };

  const handleConfirmCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormError(null);
    if (Object.keys(productQuantities).length > 0) {
      setIsCartConfirmed(true);
    } else {
      setFormError('Agrega al menos un producto o servicio antes de confirmar');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-container">
        
        {/* 1. MODE TOGGLE */}
        <div className="bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl flex mb-2">
                        <button
                type="button"
                onClick={() => handleModeSwitch('manual')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    mode === 'manual' 
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ingreso Simple
            </button>
            <button
                type="button"
                onClick={() => handleModeSwitch('inventory')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    mode === 'inventory' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                + Ventas
            </button>

        </div>

        {/* Validation Error Message */}
        {formError && (
            <div className={ERROR_BANNER}>
                <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                {formError}
            </div>
        )}

        {/* --- INVENTORY MODE --- */}
        {mode === 'inventory' && (
          <>
            {!isCartConfirmed && (
              <>
                {/* Product/Service Search */}
                <div>
                  <label className={FORM_LABEL}>
                    Buscar Productos y Servicios
                  </label>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o categoría..."
                    className={INPUT_BASE_CLASSES}
                    // AutoFocus removed for better mobile UX
                  />
                  {!searchTerm.trim() && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Top productos y servicios frecuentes
                    </p>
                  )}
                </div>

                {/* Product/Service Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                      <p>No se encontraron productos ni servicios</p>
                    </div>
                  ) : (
                    filteredItems.map(item => {
                      const isProduct = item.type === 'product';
                      const itemId = item.data.id;
                      const itemData = itemQuantities[itemId];
                      const currentQuantity = itemData?.quantity || 0;
                      
                      if (isProduct) {
                        // Product rendering with stock and variants
                        const product = item.data as Product;
                        const selectedVariantId = itemData?.selectedVariantId || (product.hasVariants && product.variants.length > 0 ? product.variants[0].id : undefined);
                        const maxStock = getMaxStock(product, selectedVariantId);
                        const isOutOfStock = maxStock === 0;

                        return (
                          <div
                            key={product.id}
                            className={`${CARD_PRODUCT_ITEM} ${isOutOfStock ? 'opacity-60' : ''}`}
                          >
                            {/* Info & Controls */}
                            <div className="flex-1 p-3 flex flex-col justify-between">
                              <div className={product.hasVariants ? "pr-20" : ""}>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2">{product.name}</h3>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                                    Producto
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-between items-end gap-3">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.price, currencyCode)}</p>
                                  <p className={`text-xs ${isOutOfStock ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {isOutOfStock ? 'Agotado' : `Stock: ${maxStock}`}
                                  </p>
                                </div>

                                {!isOutOfStock && (
                                  <QuantityStepper
                                    product={product}
                                    currentQuantity={currentQuantity}
                                    selectedVariantId={selectedVariantId}
                                    onQuantityChange={(q, variantId) => updateItemQuantity(product.id, q, 'product', variantId)}
                                    onVariantChange={(variantId) => updateProductVariant(product.id, variantId)}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Service rendering - no stock limits
                        const service = item.data as Service;
                        if (!service.isActive) return null; // Skip inactive services
                        
                        return (
                          <div
                            key={service.id}
                            className={CARD_PRODUCT_ITEM}
                          >
                            {/* Info & Controls */}
                            <div className="flex-1 p-3 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2">{service.name}</h3>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-medium">
                                    Servicio
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-between items-end gap-3">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(service.price, currencyCode)}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Ilimitado</p>
                                </div>

                                {/* Simple quantity stepper for services (no stock limit) */}
                                <div className="flex items-center gap-1">
                                  {currentQuantity > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => updateItemQuantity(service.id, currentQuantity - 1, 'service')}
                                      className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    >
                                      −
                                    </button>
                                  )}
                                  {currentQuantity > 0 && (
                                    <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-white">
                                      {currentQuantity}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => updateItemQuantity(service.id, currentQuantity + 1, 'service')}
                                    className="w-10 h-10 flex items-center justify-center bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 transition-colors text-lg font-bold"
      >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })
                  )}
                </div>
              </>
            )}

            {isCartConfirmed && (
              <div className={CART_SUMMARY_INFLOW}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 dark:text-white">Items en Carrito</h3>
                  <button
                    type="button"
                    onClick={() => setIsCartConfirmed(false)}
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    Editar
                  </button>
                </div>
                <div className="space-y-2 mb-3">
                  {Object.entries(productQuantities).map(([itemId, data]) => {
                    if (data.isService) {
                      // Service item
                      const service = services.find(s => s.id === itemId);
                      if (!service) return null;
                      return (
                        <div key={itemId} className="flex justify-between text-sm">
                          <span className="text-slate-700 dark:text-slate-300">
                            <span className="text-[10px] px-1 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 mr-1">S</span>
                            {service.name} x{data.quantity}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {formatCurrency(service.price * data.quantity, currencyCode)}
                          </span>
                        </div>
                      );
                    } else {
                      // Product item
                      const product = products.find(p => p.id === itemId);
                      if (!product) return null;
                      const variant = data.selectedVariantId ? product.variants.find(v => v.id === data.selectedVariantId) : null;
                      return (
                        <div key={itemId} className="flex justify-between text-sm">
                          <span className="text-slate-700 dark:text-slate-300">
                            <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mr-1">P</span>
                            {product.name} {variant && `(${variant.name})`} x{data.quantity}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {formatCurrency(product.price * data.quantity, currencyCode)}
                          </span>
                        </div>
                      );
                    }
                  })}
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-700 flex justify-between font-bold">
                    <span className="text-slate-800 dark:text-white">Subtotal:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(calculateTotal(), currencyCode)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* --- MANUAL MODE --- */}
        {mode === 'manual' && (
          <>
            <div>
              <label className={FORM_LABEL}>
                Descripción
              </label>
              <input
                type="text"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Ej: Servicio de instalación"
                className={INPUT_BASE_CLASSES}
              />
            </div>
            <div>
              <label className={FORM_LABEL}>
                Monto
              </label>
              <input
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className={INPUT_BASE_CLASSES}
              />
            </div>
            {categoryConfig.inflowCategories.length > 0 && (
              <div>
                <label className={FORM_LABEL}>
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={INPUT_BASE_CLASSES}
                >
                  <option value="">Seleccionar categoría...</option>
                  {categoryConfig.inflowCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed Footer - Always Visible */}
      <div className={FORM_FOOTER}>
        {/* Payment Method - Only show for manual mode OR when cart is confirmed */}
        {(mode === 'manual' || isCartConfirmed) && (
          <div>
            <label className={FORM_LABEL}>
              Método de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={INPUT_BASE_CLASSES}
            >
              <option value="">Seleccionar método</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        )}

        {/* Total Display - show when applicable */}
        {(mode === 'manual' || isCartConfirmed) && (
          <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-slate-700 dark:text-slate-300">Total a Cobrar:</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {mode === 'manual' 
                  ? formatCurrency(parseFloat(manualAmount || '0'), currencyCode) 
                  : formatCurrency(calculateTotal(), currencyCode)}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Action Button */}
        {mode === 'inventory' && !isCartConfirmed ? (
          /* Product selection mode - show "Ver Resumen" button */
          <button
            type="button"
            onClick={handleConfirmCart}
            disabled={Object.keys(productQuantities).length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:dark:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg"
          >
            {Object.keys(productQuantities).length > 0 
              ? `Ver Resumen (${Object.keys(productQuantities).length})` 
              : 'Selecciona productos'}
          </button>
        ) : (
          /* Manual mode or confirmed cart - show submit button */
          <button
            type="submit"
            className={BTN_PRIMARY}
          >
            Registrar Ingreso
          </button>
        )}
      </div>
    </form>
  );
};
