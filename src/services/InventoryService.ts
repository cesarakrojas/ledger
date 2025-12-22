/**
 * services/InventoryService.ts
 * 
 * Handles all product/inventory CRUD operations and business logic.
 * Products represent items that can be sold or tracked in inventory.
 */

import {
  type Product,
  type InventoryFilters,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  generateId,
  reportError,
  createError,
  createStorageAccessor,
} from '../shared';

// ============================================
// STORAGE ACCESSOR
// ============================================

const productStorage = createStorageAccessor<Product>(
  STORAGE_KEYS.PRODUCTS,
  {
    loadErrorMsg: 'Error al cargar productos',
    saveErrorMsg: 'Error al guardar productos',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

// ============================================
// SERVICE
// ============================================

export const InventoryService = {
  /**
   * Get all products with optional filters
   */
  getAll: (filters?: InventoryFilters): Product[] => {
    let products = productStorage.get();
    
    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase().includes(term)
      );
    }
    
    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    if (filters?.lowStock) {
      products = products.filter(p => p.quantity <= 10);
    }
    
    return products.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  /**
   * Migrate category name across all products
   * Used when renaming a category in settings
   */
  migrateCategoryName: (oldName: string, newName: string): number => {
    const products = productStorage.get();
    let updatedCount = 0;
    
    const updatedProducts = products.map(product => {
      if (product.category === oldName) {
        updatedCount++;
        return { ...product, category: newName, updatedAt: new Date().toISOString() };
      }
      return product;
    });
    
    if (updatedCount > 0) {
      productStorage.save(updatedProducts);
    }
    
    return updatedCount;
  },

  /**
   * Create a new product
   */
  create: (
    name: string,
    price: number,
    cost: number,
    quantity: number = 0,
    description?: string,
    category?: string,
    barcode?: string
  ): Product | null => {
    try {
      // Validation
      if (!name || name.trim().length === 0) {
        reportError(createError('validation', 'El nombre del producto es requerido'));
        return null;
      }
      if (price < 0) {
        reportError(createError('validation', 'El precio debe ser mayor o igual a cero'));
        return null;
      }
      if (cost < 0) {
        reportError(createError('validation', 'El costo debe ser mayor o igual a cero'));
        return null;
      }
      if (quantity < 0) {
        reportError(createError('validation', 'La cantidad debe ser mayor o igual a cero'));
        return null;
      }
      
      const products = productStorage.get();
      
      const newProduct: Product = {
        id: generateId(),
        name: name.trim(),
        description: description?.trim(),
        price,
        cost,
        quantity: Math.max(0, quantity),
        category: category?.trim(),
        barcode: barcode?.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      products.push(newProduct);
      const saved = productStorage.save(products);
      
      if (!saved) return null;
      return newProduct;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      reportError(createError('storage', 'Error al crear producto', errorMsg));
      return null;
    }
  },

  /**
   * Update an existing product
   */
  update: (
    productId: string,
    updates: {
      name?: string;
      description?: string;
      price?: number;
      cost?: number;
      category?: string;
      quantity?: number;
      barcode?: string;
    }
  ): Product | null => {
    try {
      const products = productStorage.get();
      const productIndex = products.findIndex(p => p.id === productId);
      
      if (productIndex === -1) {
        reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Producto no encontrado'));
        return null;
      }
    
      const currentProduct = products[productIndex];
      
      // Validation for cost update
      if (updates.cost !== undefined && updates.cost < 0) {
        reportError(createError('validation', 'El costo debe ser mayor o igual a cero'));
        return null;
      }

      const updatedProduct: Product = {
        ...currentProduct,
        ...updates,
        name: updates.name?.trim() || currentProduct.name,
        description: updates.description?.trim(),
        category: updates.category?.trim(),
        cost: updates.cost !== undefined ? updates.cost : (currentProduct.cost || 0),
        quantity: updates.quantity !== undefined ? Math.max(0, updates.quantity) : currentProduct.quantity,
        updatedAt: new Date().toISOString()
      };
      
      products[productIndex] = updatedProduct;
      const saved = productStorage.save(products);
      
      if (!saved) return null;
      return updatedProduct;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      reportError(createError('storage', 'Error al actualizar producto', errorMsg));
      return null;
    }
  },

  /**
   * Delete a product
   */
  delete: (productId: string): boolean => {
    try {
      const products = productStorage.get();
      const productExists = products.some(p => p.id === productId);
      
      if (!productExists) {
        reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Producto no encontrado'));
        return false;
      }
      
      const filteredProducts = products.filter(p => p.id !== productId);
      return productStorage.save(filteredProducts);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      reportError(createError('storage', 'Error al eliminar producto', errorMsg));
      return false;
    }
  },

  /**
   * Get product by ID
   */
  getById: (productId: string): Product | null => {
    const products = productStorage.get();
    return products.find(p => p.id === productId) || null;
  },

  /**
   * Adjust stock quantity by a delta (positive to add, negative to subtract)
   * Used by POS to decrement stock on sales
   * @returns Updated product or null if failed
   */
  adjustStock: (productId: string, quantityDelta: number): Product | null => {
    try {
      const product = InventoryService.getById(productId);
      if (!product) {
        reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Producto no encontrado'));
        return null;
      }
      
      const newQuantity = Math.max(0, product.quantity + quantityDelta);
      return InventoryService.update(productId, { quantity: newQuantity });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      reportError(createError('storage', 'Error al ajustar stock', errorMsg));
      return null;
    }
  },

  /**
   * Batch adjust stock for multiple products (used by POS for multi-item sales)
   * @returns Array of results, each containing productId and success status
   */
  batchAdjustStock: (adjustments: { productId: string; quantityDelta: number }[]): { productId: string; success: boolean }[] => {
    return adjustments.map(({ productId, quantityDelta }) => ({
      productId,
      success: InventoryService.adjustStock(productId, quantityDelta) !== null
    }));
  },

  /**
   * Get all unique categories from products
   */
  getCategories: (): string[] => {
    const products = productStorage.get();
    const categories = products
      .map(p => p.category)
      .filter((c): c is string => !!c);
    return Array.from(new Set(categories)).sort();
  },

  /**
   * Subscribe to inventory changes (for real-time updates)
   */
  subscribe: (callback: (products: Product[]) => void): () => void => {
    callback(productStorage.get());
    
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PRODUCTS) {
        callback(productStorage.get());
      }
    };
    
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },
};

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

export const getAllProducts = InventoryService.getAll;
export const createProduct = InventoryService.create;
export const updateProduct = InventoryService.update;
export const deleteProduct = InventoryService.delete;
export const getProductById = InventoryService.getById;
export const getProductCategories = InventoryService.getCategories;
export const subscribeToInventory = InventoryService.subscribe;
export const migrateProductCategoryName = InventoryService.migrateCategoryName;
