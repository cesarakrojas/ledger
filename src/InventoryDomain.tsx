/**
 * InventoryDomain.tsx
 * Domain module for all inventory/product management functionality
 * Contains: InventoryView, ProductForm, ProductDetailView, ProductDetailPage, ProductFormPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from './shared';
import {
  CARD_STYLES,
  LIST_ITEM_INTERACTIVE,
  TEXT_PAGE_TITLE,
  BTN_ACTION_PRIMARY,
  INPUT_BASE_CLASSES,
  FORM_LABEL,
  FORM_FOOTER,
  ERROR_BANNER,
  BTN_FOOTER_PRIMARY,
  BTN_FOOTER_DANGER,
  BTN_FOOTER_SECONDARY,
  BTN_FOOTER_DISABLED,
  DETAIL_VIEW_CONTAINER,
  DETAIL_VIEW_HEADER,
  DETAIL_VIEW_FOOTER,
  TEXT_DETAIL_HEADER_TITLE,
  ICON_BTN_CLOSE,
  CARD_FORM,
  TRANSITION_COLORS,
  STAT_CARD_EMERALD,
  ICON_BG_EMERALD,
  TEXT_AMOUNT_INFLOW,
  formatCurrency,
  formatDate,
  BTN_ACTION_SECONDARY
} from './shared';
import {
  PlusIcon,
  InventoryIcon,
  TrashIcon,
  ExclamationCircleIcon,
  PencilIcon,
  RefreshIcon,
  ConfirmationModal,
  ChevronLeftIcon,
} from './components';
import { BarcodeScanButton } from './components/barcode';
import { InventoryService } from './services';
import { useInventoryStore, useConfigStore, useUIStore } from './stores';
import { paths } from './routes';

// =============================================================================
// InventoryView
// =============================================================================
export interface InventoryViewProps {
  viewMode?: 'list' | 'create' | 'edit' | 'detail';
  editingProductId?: string | null;
  currencyCode?: string;
  onChangeView?: (mode: 'list' | 'create' | 'edit' | 'detail', productId?: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = (props) => {
  const navigate = useNavigate();
  
  // Use Zustand stores with selectors for performance
  const products = useInventoryStore(state => state.products);
  const lowStockCount = useInventoryStore(state => state.lowStockCount);
  const loadProducts = useInventoryStore(state => state.loadProducts);
  const storeCurrencyCode = useConfigStore(state => state.currencyCode);
  
  // Resolve currencyCode from props or store
  const currencyCode = props.currencyCode ?? storeCurrencyCode;
  
  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreateProduct = () => {
    if (props.onChangeView) {
      props.onChangeView('create');
    } else {
      navigate(paths.inventoryNew());
    }
  };

  const handleViewProduct = (product: Product) => {
    if (props.onChangeView) {
      props.onChangeView('detail', product.id);
    } else {
      navigate(paths.inventoryDetail(product.id));
    }
  };

  return (
    <div className="w-full">
      <div className={CARD_STYLES}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex w-full sm:w-auto justify-between items-center sm:gap-8">
            <div>
              <h2 className={TEXT_PAGE_TITLE}>Inventario</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Gestiona tus productos
              </p>
            </div>
            <BarcodeScanButton
              onScan={(result) => {
                // Find product by barcode and navigate to detail
                const product = products.find(p => p.barcode === result.barcode);
                if (product) {
                  handleViewProduct(product);
                } else {
                  // Show feedback if not found
                  alert(`Producto con código ${result.barcode} no encontrado`);
                }
              }}
              title="Buscar Producto"
              subtitle="Escanea el código de barras para ver el producto"
              variant="ghost"
              iconOnly
              size="lg"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => navigate(paths.inventoryPurchase())} className={BTN_ACTION_SECONDARY}>
              <RefreshIcon className="w-4 h-4" />
              Registrar Compra
            </button>
            <button onClick={handleCreateProduct} className={BTN_ACTION_PRIMARY}>
              <PlusIcon className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-6">
          <div className={STAT_CARD_EMERALD}>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Productos</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{products.length}</p>
          </div>
          <div className="bg-orange-100 dark:bg-orange-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Stock Bajo</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{lowStockCount}</p>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700 my-6" />

        {products.length === 0 ? (
          <div>
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <InventoryIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No hay productos en el inventario</h3>
            <button onClick={handleCreateProduct} className="mt-4 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
              Crear tu primer producto
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700 -mx-2">
            {products.map(product => {
              let statusColor = "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300";
              let statusText = "En Stock";

              if (product.quantity === 0) {
                statusColor = "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
                statusText = "Sin Stock";
              } else if (product.quantity <= 10) {
                statusColor = "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300";
                statusText = "Stock Bajo";
              }

              return (
                <li key={product.id} onClick={() => handleViewProduct(product)} className={LIST_ITEM_INTERACTIVE}>
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      <div className={`p-3 rounded-xl shrink-0 ${ICON_BG_EMERALD}`}>
                        <InventoryIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{product.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-1">{product.description || 'Sin descripción'}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md ${statusColor}`}>{statusText}</span>
                          {product.category && (
                            <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-600">
                              {product.category}
                            </span>
                          )}
                          <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                            <span className="whitespace-nowrap">{product.quantity} unid</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <div className={`text-xl sm:text-2xl font-bold whitespace-nowrap flex items-baseline gap-1 ${TEXT_AMOUNT_INFLOW}`}>
                        <span>{formatCurrency(product.price, currencyCode)}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Precio unitario</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// ProductForm
// =============================================================================
export interface ProductFormProps {
  product?: Product | null;
  productId?: string | null;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = (props) => {
  const navigate = useNavigate();
  
  // Use stores with selectors for performance
  const products = useInventoryStore(state => state.products);
  const createProduct = useInventoryStore(state => state.createProduct);
  const updateProduct = useInventoryStore(state => state.updateProduct);
  const deleteProduct = useInventoryStore(state => state.deleteProduct);
  const showSuccessModal = useUIStore(state => state.showSuccessModal);
  
  // Resolve product from props or store
  const product = props.product ?? 
    (props.productId ? products.find(p => p.id === props.productId) : null) ?? null;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [barcode, setBarcode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price !== undefined && product.price !== null ? product.price.toString() : '');
      setCost(product.cost !== undefined && product.cost !== null ? product.cost.toString() : '0');
      setCategory(product.category || '');
      setQuantity(product.quantity !== undefined && product.quantity !== null ? product.quantity.toString() : '');
      setBarcode(product.barcode || '');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCost('');
      setCategory('');
      setQuantity('');
      setBarcode('');
    }
  }, [product]);

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    } else {
      navigate(paths.inventory());
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (product) {
      const success = deleteProduct(product.id);
      if (success) {
        showSuccessModal('Producto Eliminado', `${product.name} ha sido eliminado`);
        setShowDeleteConfirm(false);
        if (props.onDelete) {
          props.onDelete();
        } else {
          navigate(paths.inventory());
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !price || parseFloat(price) < 0) {
      setFormError('Por favor completa todos los campos requeridos.');
      return;
    }
    
    if (cost === '' || parseFloat(cost) < 0) {
      setFormError('Por favor ingresa un costo válido.');
      return;
    }

    if (!quantity || parseInt(quantity) < 0) {
      setFormError('Por favor ingresa una cantidad válida.');
      return;
    }

    try {
      let result;
      if (product) {
        result = updateProduct(product.id, {
          name,
          description: description || undefined,
          price: parseFloat(price),
          cost: parseFloat(cost),
          category: category || undefined,
          quantity: parseInt(quantity),
          barcode: barcode || undefined
        });
      } else {
        result = createProduct(
          name,
          parseFloat(price),
          parseFloat(cost),
          parseInt(quantity),
          description || undefined,
          category || undefined,
          barcode || undefined
        );
      }
      
      if (!result) {
        setFormError('Error al guardar el producto.');
        return;
      }
      
      showSuccessModal(
        product ? 'Producto Actualizado' : 'Producto Creado',
        `${name} ha sido ${product ? 'actualizado' : 'creado'}`
      );
      
      if (props.onSave) {
        props.onSave();
      } else {
        navigate(paths.inventory());
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setFormError('Error al guardar el producto.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-container">
        {formError && (
          <div className={ERROR_BANNER}>
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            {formError}
          </div>
        )}

        <div>
          <label className={FORM_LABEL}>Nombre del Producto <span className="text-red-500">*</span></label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Camiseta básica" required className={INPUT_BASE_CLASSES} />
        </div>

        <div>
          <label className={FORM_LABEL}>Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción del producto..." rows={3} className={`${INPUT_BASE_CLASSES} resize-none`} />
        </div>

        {/* 2-Column Grid for Price & Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={FORM_LABEL}>Precio Venta <span className="text-red-500">*</span></label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" required className={INPUT_BASE_CLASSES} />
          </div>
          <div>
            <label className={FORM_LABEL}>Costo Unitario <span className="text-red-500">*</span></label>
            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" min="0" step="0.01" required className={INPUT_BASE_CLASSES} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={FORM_LABEL}>Categoría</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej: Ropa, Electrónica" className={INPUT_BASE_CLASSES} />
          </div>
          <div>
            <label className={FORM_LABEL}>Cantidad Disponible <span className="text-red-500">*</span></label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" min="0" required className={INPUT_BASE_CLASSES} />
          </div>
        </div>

        {/* Barcode Field with Scanner */}
        <div>
          <label className={FORM_LABEL}>Código de Barras</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={barcode} 
              onChange={(e) => setBarcode(e.target.value)} 
              placeholder="Ej: 7501234567890" 
              className={`${INPUT_BASE_CLASSES} flex-1`} 
            />
            <BarcodeScanButton
              onScan={(result) => setBarcode(result.barcode)}
              title="Escanear Código"
              subtitle="Escanea el código de barras del producto"
              variant="secondary"
              iconOnly
              size="md"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Escanea o ingresa el código de barras/SKU del producto
          </p>
        </div>
      </div>

      <div className={FORM_FOOTER}>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button type="submit" className={BTN_FOOTER_PRIMARY}>
            {product ? 'Actualizar' : 'Crear Producto'}
          </button>
          {product ? (
            <button type="button" onClick={handleDelete} className={BTN_FOOTER_DANGER}>
              <TrashIcon className="w-5 h-5" />
              <span>Eliminar</span>
            </button>
          ) : (
            <button type="button" onClick={handleCancel} className={BTN_FOOTER_SECONDARY}>Cancelar</button>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </form>
  );
};

// =============================================================================
// ProductDetailView
// =============================================================================
interface ProductDetailViewProps {
  product: Product;
  currencyCode: string;
  onClose: () => void;
  onEdit: () => void;
  onUpdateStock?: (productId: string, newStock: number) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  currencyCode,
  onClose,
  onEdit,
  onUpdateStock
}) => {
  const [adjustedStock, setAdjustedStock] = useState<number | null>(null);
  
  const currentStock = adjustedStock !== null ? adjustedStock : product.quantity;
  const hasStockChanges = adjustedStock !== null && adjustedStock !== product.quantity;
  
  // Metrics Calculation
  // We use product.cost || 0 for safety/legacy data handling
  const cost = product.cost || 0; 
  const margin = product.price - cost;
  // Determine if we are losing money
  const isLoss = margin < 0; 
  // Determine text color based on profitability
  const profitColor = isLoss ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400';

  const marginPercent = product.price > 0 ? ((margin / product.price) * 100).toFixed(1) : '0.0';

  const handleStockChange = (delta: number) => {
    const newValue = Math.max(0, currentStock + delta);
    setAdjustedStock(newValue);
  };

  const handleUpdateStock = () => {
    if (!onUpdateStock || !hasStockChanges || adjustedStock === null) return;
    onUpdateStock(product.id, adjustedStock);
    setAdjustedStock(null);
  };
    
  const isLowStock = currentStock <= 10;

  return (
    <div className={DETAIL_VIEW_CONTAINER}>
      <div className={DETAIL_VIEW_HEADER}>
        <div className="flex items-center">
          <button onClick={onClose} className={ICON_BTN_CLOSE} aria-label="Volver">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className={TEXT_DETAIL_HEADER_TITLE}>Producto</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container">
        <div className="bg-white dark:bg-slate-800 shadow-sm mb-4">
          <div className="px-6 py-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">{product.name}</h1>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
                {formatCurrency(product.price, currencyCode)}
              </span>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isLowStock 
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
              {isLowStock ? '⚠️ Stock Bajo' : 'Stock Disponible'}
            </div>
            
            {/* NEW PROFITABILITY CARD */}
            <div className="mt-6 grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-600">
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Costo</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(cost, currencyCode)}</p>
              </div>
              <div className="text-center border-l border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-500 dark:text-slate-400">Ganancia</p>
                {/* Dynamically colored based on profit/loss */}
                <p className={`font-bold ${profitColor}`}>{formatCurrency(margin, currencyCode)}</p>
              </div>
              <div className="text-center border-l border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-500 dark:text-slate-400">Margen</p>
                <p className={`font-semibold ${profitColor}`}>{marginPercent}%</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <button type="button" onClick={() => handleStockChange(-1)} disabled={currentStock === 0}
                className="w-9 h-9 flex items-center justify-center bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-lg disabled:opacity-50 transition-colors text-lg font-bold text-slate-700 dark:text-white">
                −
              </button>
              <span className="w-14 text-center font-bold text-lg text-slate-800 dark:text-white">{currentStock}</span>
              <button type="button" onClick={() => handleStockChange(1)}
                className="w-9 h-9 flex items-center justify-center bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg transition-colors text-lg font-bold">
                +
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4">
          {product.description && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Descripción</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{product.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <span className="block text-xs text-slate-500 mb-1">Creado</span>
              <span className="text-sm font-medium text-slate-800 dark:text-white">{formatDate(product.createdAt)}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 mb-1">Actualizado</span>
              <span className="text-sm font-medium text-slate-800 dark:text-white">{formatDate(product.updatedAt)}</span>
            </div>
          </div>
        </div>
        <div className="h-6"></div>
      </div>

      <div className={DETAIL_VIEW_FOOTER}>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleUpdateStock} disabled={!hasStockChanges}
            className={hasStockChanges ? BTN_FOOTER_PRIMARY : BTN_FOOTER_DISABLED}>
            <RefreshIcon className="w-5 h-5" />
            <span>Actualizar</span>
          </button>
          <button onClick={onEdit} className={BTN_FOOTER_SECONDARY}>
            <PencilIcon className="w-5 h-5" />
            <span>Editar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// ProductDetailPage
// =============================================================================
export interface ProductDetailPageProps {
  product?: Product;
  productId?: string;
  currencyCode?: string;
  onClose?: () => void;
  onEdit?: (productId: string) => void;
  onProductsChange?: () => void;
  onSuccess?: (title: string, message: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = (props) => {
  const navigate = useNavigate();
  
  // Use Zustand stores with selectors for performance
  const products = useInventoryStore(state => state.products);
  const updateProduct = useInventoryStore(state => state.updateProduct);
  const storeCurrencyCode = useConfigStore(state => state.currencyCode);
  const showSuccessModal = useUIStore(state => state.showSuccessModal);
  const setHideAppShell = useUIStore(state => state.setHideAppShell);
  const setHideBottomNav = useUIStore(state => state.setHideBottomNav);
  
  // Hide app shell and bottom nav when mounted (full-screen overlay pattern)
  useEffect(() => {
    setHideAppShell(true);
    setHideBottomNav(true);
    
    return () => {
      setHideAppShell(false);
      setHideBottomNav(false);
    };
  }, [setHideAppShell, setHideBottomNav]);
  
  // Resolve product - from props or by looking up ID in store
  const product = props.product ?? 
    (props.productId ? products.find(p => p.id === props.productId) : undefined);
  const currencyCode = props.currencyCode ?? storeCurrencyCode;
  
  const handleClose = () => {
    if (props.onClose) {
      props.onClose();
    } else {
      navigate(paths.inventory());
    }
  };

  const handleEdit = useCallback(() => {
    if (product) {
      if (props.onEdit) {
        props.onEdit(product.id);
      } else {
        navigate(paths.inventoryEdit(product.id));
      }
    }
  }, [product, props.onEdit, navigate]);

  const handleUpdateStock = useCallback((productId: string, newStock: number) => {
    const result = updateProduct(productId, { quantity: newStock });
    if (result) {
      if (props.onSuccess) {
        props.onSuccess('¡Stock Actualizado!', `El inventario de ${result.name} ha sido actualizado`);
      } else {
        showSuccessModal('¡Stock Actualizado!', `El inventario de ${result.name} ha sido actualizado`);
      }
    }
  }, [updateProduct, props.onSuccess, showSuccessModal]);

  if (!product) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 dark:text-slate-400">Producto no encontrado</p>
          <button onClick={handleClose} className={BTN_ACTION_PRIMARY + ' mt-4'}>Volver al Inventario</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-fade-in">
      <ProductDetailView
        product={product}
        currencyCode={currencyCode}
        onClose={handleClose}
        onEdit={handleEdit}
        onUpdateStock={handleUpdateStock}
      />
    </div>
  );
};

// =============================================================================
// ProductFormPage
// =============================================================================
export interface ProductFormPageProps {
  mode: 'create' | 'edit';
  productId: string | null;
  onBack: () => void;
}

export const ProductFormPage: React.FC<ProductFormPageProps> = ({ mode, productId, onBack }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && productId) {
      const allProducts = InventoryService.getAll();
      const foundProduct = allProducts.find(p => p.id === productId);
      setProduct(foundProduct || null);
    } else {
      setProduct(null);
    }
  }, [mode, productId]);

  const handleSave = () => {
    onBack();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!product) return;
    const success = InventoryService.delete(product.id);
    if (success) {
      setShowDeleteConfirm(false);
      onBack();
    }
  };

  return (
    <>
      <div className="w-full h-full mx-auto animate-fade-in animate-slide-in-right flex items-stretch">
        <div className={`w-full ${CARD_FORM}`}>
          <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`}
                aria-label="Volver"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <h2 className={TEXT_PAGE_TITLE}>{mode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            </div>
          </div>
          <div className="flex-1 overflow-hidden px-6">
            <ProductForm
              product={product}
              onSave={handleSave}
              onCancel={onBack}
              onDelete={mode === 'edit' ? handleDelete : undefined}
            />
          </div>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
};
