import type { Product, ProductVariant, InventoryFilters } from '../types';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { generateId } from '../utils/idGenerator';
import { reportError, createError, ERROR_MESSAGES } from '../utils/errorHandler';
import { createStorageAccessor } from '../utils/performanceUtils';

const STORAGE_KEY = STORAGE_KEYS.PRODUCTS;

// Create storage accessor for products
const productStorage = createStorageAccessor<Product>(
  STORAGE_KEY,
  {
    loadErrorMsg: 'Error al cargar productos',
    saveErrorMsg: 'Error al guardar productos',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

// Calculate total quantity based on product mode
const calculateTotalQuantity = (hasVariants: boolean, variants: ProductVariant[], standaloneQty: number): number => {
  if (hasVariants && variants.length > 0) {
    return variants.reduce((sum, v) => sum + v.quantity, 0);
  }
  return standaloneQty;
};

/**
 * Migrate old products that don't have standaloneQuantity field.
 * For products without variants: standaloneQuantity = totalQuantity
 * For products with variants: standaloneQuantity = 0 (quantity is in variants)
 */
const migrateProduct = (product: Product): Product => {
  // Check if migration is needed (standaloneQuantity is undefined)
  if (product.standaloneQuantity === undefined) {
    return {
      ...product,
      standaloneQuantity: product.hasVariants ? 0 : product.totalQuantity
    };
  }
  return product;
};

// Get all products with optional filters
export const getAllProducts = (filters?: InventoryFilters): Product[] => {
  let products = productStorage.get();
  
  // Migrate old products that don't have standaloneQuantity
  let needsMigration = false;
  products = products.map(p => {
    if (p.standaloneQuantity === undefined) {
      needsMigration = true;
      return migrateProduct(p);
    }
    return p;
  });
  
  // Persist migration if any products were updated
  if (needsMigration) {
    productStorage.save(products);
  }
  
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  }
  
  if (filters?.category) {
    products = products.filter(p => p.category === filters.category);
  }
  
  if (filters?.lowStock) {
    products = products.filter(p => p.totalQuantity <= 10);
  }
  
  return products.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

// Create a new product with error handling
export const createProduct = (
  name: string,
  price: number,
  description?: string,
  category?: string,
  hasVariants: boolean = false,
  variants: Omit<ProductVariant, 'id'>[] = [],
  standaloneQuantity: number = 0
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
    
    const products = productStorage.get();
    
    const productVariants: ProductVariant[] = variants.map(v => ({
      ...v,
      id: generateId()
    }));
    
    // For variant products, standaloneQuantity should be 0
    const effectiveStandaloneQty = hasVariants ? 0 : standaloneQuantity;
    const totalQuantity = calculateTotalQuantity(hasVariants, productVariants, effectiveStandaloneQty);
    
    const newProduct: Product = {
      id: generateId(),
      name: name.trim(),
      description: description?.trim(),
      price,
      standaloneQuantity: effectiveStandaloneQty,
      totalQuantity,
      hasVariants,
      variants: productVariants,
      category: category?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    const saved = productStorage.save(products);
    
    if (!saved) {
      return null;
    }
    
    return newProduct;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    reportError(createError('storage', 'Error al crear producto', errorMsg));
    return null;
  }
};

// Update an existing product with error handling
export const updateProduct = (
  productId: string,
  updates: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    hasVariants?: boolean;
    variants?: ProductVariant[];
    standaloneQuantity?: number;
  }
): Product | null => {
  try {
    const products = productStorage.get();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Producto no encontrado'));
      return null;
    }
  
    // Migrate product if needed (for old products without standaloneQuantity)
    const currentProduct = migrateProduct(products[productIndex]);
    
    // Determine final hasVariants state
    const hasVariants = updates.hasVariants !== undefined ? updates.hasVariants : currentProduct.hasVariants;
    const variants = updates.variants !== undefined ? updates.variants : currentProduct.variants;
    
    // Determine standaloneQuantity:
    // - If explicitly provided in updates, use it
    // - Otherwise, use the current product's standaloneQuantity
    // - For variant products, always set to 0
    let standaloneQty: number;
    if (hasVariants) {
      standaloneQty = 0; // Variant products don't use standaloneQuantity
    } else if (updates.standaloneQuantity !== undefined) {
      standaloneQty = Math.max(0, updates.standaloneQuantity);
    } else {
      standaloneQty = currentProduct.standaloneQuantity;
    }
    
    const updatedProduct: Product = {
      ...currentProduct,
      ...updates,
      name: updates.name?.trim() || currentProduct.name,
      description: updates.description?.trim(),
      category: updates.category?.trim(),
      hasVariants,
      variants,
      standaloneQuantity: standaloneQty,
      totalQuantity: Math.max(0, calculateTotalQuantity(hasVariants, variants, standaloneQty)),
      updatedAt: new Date().toISOString()
    };
    
    products[productIndex] = updatedProduct;
    const saved = productStorage.save(products);
    
    if (!saved) {
      return null;
    }
    
    return updatedProduct;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    reportError(createError('storage', 'Error al actualizar producto', errorMsg));
    return null;
  }
};

// Delete a product with error handling
export const deleteProduct = (productId: string): boolean => {
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
};

// Update variant quantity with error handling
export const updateVariantQuantity = (
  productId: string,
  variantId: string,
  newQuantity: number
): Product | null => {
  try {
    if (newQuantity < 0) {
      reportError(createError('validation', 'La cantidad debe ser mayor o igual a cero'));
      return null;
    }
    
    const products = productStorage.get();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Producto no encontrado'));
      return null;
    }
    
    // Migrate product if needed
    const product = migrateProduct(products[productIndex]);
    const variantIndex = product.variants.findIndex(v => v.id === variantId);
    
    if (variantIndex === -1) {
      reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Variante no encontrada'));
      return null;
    }
    
    product.variants[variantIndex].quantity = Math.max(0, newQuantity);
    // Use calculateTotalQuantity for consistency
    product.standaloneQuantity = 0; // Variant products don't use standaloneQuantity
    product.totalQuantity = calculateTotalQuantity(true, product.variants, 0);
    product.updatedAt = new Date().toISOString();
    
    products[productIndex] = product;
    const saved = productStorage.save(products);
    
    if (!saved) {
      return null;
    }
    
    return product;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    reportError(createError('storage', 'Error al actualizar cantidad de variante', errorMsg));
    return null;
  }
};

// Get product by ID
export const getProductById = (productId: string): Product | null => {
  const products = productStorage.get();
  const product = products.find(p => p.id === productId);
  return product ? migrateProduct(product) : null;
};

// Get all unique categories
export const getCategories = (): string[] => {
  const products = productStorage.get();
  const categories = products
    .map(p => p.category)
    .filter((c): c is string => !!c);
  return Array.from(new Set(categories)).sort();
};

// Subscribe to inventory changes
export const subscribeToInventory = (callback: (products: Product[]) => void): () => void => {
  callback(productStorage.get());
  
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(productStorage.get());
    }
  };
  
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};
