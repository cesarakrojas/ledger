/**
 * InventoryDomain.tsx
 * Domain module for all inventory/product management functionality
 * Contains: InventoryView, ProductForm, ProductDetailView, ProductDetailPage, ProductFormPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from './SharedDefs';
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
  formatDate
} from './SharedDefs';
import {
  PlusIcon,
  InventoryIcon,
  TrashIcon,
  ExclamationCircleIcon,
  CloseIcon,
  PencilIcon,
  XMarkIcon
} from './UIComponents';
import { InventoryService } from './CoreServices';

// =============================================================================
// SearchIcon (local to this domain)
// =============================================================================
const SearchIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

// =============================================================================
// InventoryView
// =============================================================================
interface InventoryViewProps {
  viewMode?: 'list' | 'create' | 'edit' | 'detail';
  editingProductId?: string | null;
  currencyCode: string;
  onChangeView?: (mode: 'list' | 'create' | 'edit' | 'detail', productId?: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  currencyCode,
  onChangeView 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  
  const loadProducts = useCallback(() => {
    const loadedProducts = InventoryService.getAll();
    setProducts(loadedProducts);
  }, []);

  useEffect(() => {
    loadProducts();
    const unsubscribe = InventoryService.subscribe(() => {
      loadProducts();
    });
    return unsubscribe;
  }, [loadProducts]);

  const handleCreateProduct = () => {
    if (onChangeView) onChangeView('create');
  };

  const handleViewProduct = (product: Product) => {
    if (onChangeView) onChangeView('detail', product.id);
  };

  const getLowStockCount = () => {
    return products.filter(p => p.quantity <= 10).length;
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
            <button className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <SearchIcon className="w-6 h-6" />
            </button>
          </div>
          <button onClick={handleCreateProduct} className={BTN_ACTION_PRIMARY}>
            <PlusIcon className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-6">
          <div className={STAT_CARD_EMERALD}>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Productos</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{products.length}</p>
          </div>
          <div className="bg-orange-100 dark:bg-orange-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Stock Bajo</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{getLowStockCount()}</p>
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
interface ProductFormProps {
  product: Product | null;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel, onDelete }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price !== undefined && product.price !== null ? product.price.toString() : '');
      setCategory(product.category || '');
      setQuantity(product.quantity !== undefined && product.quantity !== null ? product.quantity.toString() : '');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setQuantity('');
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !price || parseFloat(price) < 0) {
      setFormError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!quantity || parseInt(quantity) < 0) {
      setFormError('Por favor ingresa una cantidad válida.');
      return;
    }

    try {
      let result;
      if (product) {
        result = InventoryService.update(product.id, {
          name,
          description: description || undefined,
          price: parseFloat(price),
          category: category || undefined,
          quantity: parseInt(quantity)
        });
      } else {
        result = InventoryService.create(
          name,
          parseFloat(price),
          parseInt(quantity),
          description || undefined,
          category || undefined
        );
      }
      
      if (!result) {
        setFormError('Error al guardar el producto.');
        return;
      }
      
      onSave();
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={FORM_LABEL}>Precio <span className="text-red-500">*</span></label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" required className={INPUT_BASE_CLASSES} />
          </div>
          <div>
            <label className={FORM_LABEL}>Categoría</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej: Ropa, Electrónica" className={INPUT_BASE_CLASSES} />
          </div>
        </div>

        <div>
          <label className={FORM_LABEL}>Cantidad Disponible <span className="text-red-500">*</span></label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" min="0" required className={INPUT_BASE_CLASSES} />
        </div>
      </div>

      <div className={FORM_FOOTER}>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button type="submit" className={BTN_FOOTER_PRIMARY}>
            {product ? 'Actualizar' : 'Crear Producto'}
          </button>
          {product && onDelete ? (
            <button type="button" onClick={onDelete} className={BTN_FOOTER_DANGER}>
              <TrashIcon className="w-5 h-5" />
              <span>Eliminar</span>
            </button>
          ) : (
            <button type="button" onClick={onCancel} className={BTN_FOOTER_SECONDARY}>Cancelar</button>
          )}
        </div>
      </div>
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
        <h2 className={TEXT_DETAIL_HEADER_TITLE}>Producto</h2>
        <button onClick={onClose} className={ICON_BTN_CLOSE} aria-label="Cerrar">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container">
        <div className="bg-white dark:bg-slate-800 shadow-sm mb-4">
          <div className="px-6 py-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">{product.name}</h1>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
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
  product: Product | undefined;
  currencyCode: string;
  onClose: () => void;
  onEdit: (productId: string) => void;
  onProductsChange: () => void;
  onSuccess?: (title: string, message: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  currencyCode,
  onClose,
  onEdit,
  onProductsChange,
  onSuccess,
}) => {
  const handleEdit = useCallback(() => {
    if (product) {
      onEdit(product.id);
    }
  }, [product, onEdit]);

  const handleUpdateStock = useCallback((productId: string, newStock: number) => {
    const currentProduct = InventoryService.getById(productId);
    if (!currentProduct) return;

    InventoryService.update(productId, { quantity: newStock });

    onProductsChange();
    if (onSuccess) {
      onSuccess('¡Stock Actualizado!', `El inventario de ${currentProduct.name} ha sido actualizado`);
    }
  }, [onProductsChange, onSuccess]);

  if (!product) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 dark:text-slate-400">Producto no encontrado</p>
          <button onClick={onClose} className={BTN_ACTION_PRIMARY + ' mt-4'}>Volver al Inventario</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full mx-auto animate-fade-in flex items-stretch">
      <ProductDetailView
        product={product}
        currencyCode={currencyCode}
        onClose={onClose}
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
    if (!product) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const success = InventoryService.delete(product.id);
      if (success) {
        onBack();
      }
    }
  };

  return (
    <div className="w-full h-full mx-auto animate-fade-in flex items-stretch">
      <div className={`w-full ${CARD_FORM}`}>
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h2 className={TEXT_PAGE_TITLE}>{mode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onBack} className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`} aria-label="Cerrar">
            <XMarkIcon className="w-6 h-6" />
          </button>
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
  );
};
