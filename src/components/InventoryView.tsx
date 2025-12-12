import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';
import { PlusIcon } from './icons';
import { InventoryIcon } from './icons';
import { formatCurrency } from '../utils/formatters';
import * as inventoryService from '../services/inventoryService';
import { CARD_STYLES, LIST_ITEM_INTERACTIVE } from '../utils/styleConstants';
import { TEXT_PAGE_TITLE, BTN_ACTION_PRIMARY } from '../utils/constants';
import { useDebouncedValue } from '../utils/performanceUtils';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Load products
  const loadProducts = useCallback(() => {
    const filters = {
      searchTerm: debouncedSearchTerm || undefined,
      category: selectedCategory || undefined,
      lowStock: showLowStock || undefined
    };
    const loadedProducts = inventoryService.getAllProducts(filters);
    setProducts(loadedProducts);
  }, [debouncedSearchTerm, selectedCategory, showLowStock]);

  useEffect(() => {
    loadProducts();
    setCategories(inventoryService.getCategories());

    // Subscribe to changes
    const unsubscribe = inventoryService.subscribeToInventory(() => {
      loadProducts();
      setCategories(inventoryService.getCategories());
    });

    return unsubscribe;
  }, [debouncedSearchTerm, selectedCategory, showLowStock]);

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
      {/* Unified Card */}
      <div className={CARD_STYLES}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className={TEXT_PAGE_TITLE}>Inventario</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gestiona tus productos y existencias
            </p>
          </div>
          <button
            onClick={handleCreateProduct}
            className={BTN_ACTION_PRIMARY}
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-6">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Productos</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{products.length}</p>
          </div>
          <div className="bg-orange-100 dark:bg-orange-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Stock Bajo</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{getLowStockCount()}</p>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700 my-6" />

        {/* Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              >
                <option value="">Categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-slate-700 dark:text-slate-200">Stock bajo</span>
              </label>
            </div>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700 my-6" />

        {/* Products List */}
        {products.length === 0 ? (
          <div>
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <InventoryIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No hay productos en el inventario</h3>
            <button
              onClick={handleCreateProduct}
              className="mt-4 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Crear tu primer producto
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700 -mx-2">
            {products.map(product => {
              // Determine Status Logic per product
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
                <li
                  key={product.id}
                  onClick={() => handleViewProduct(product)}
                  className={LIST_ITEM_INTERACTIVE}
                >
                  {/* MAIN FLEX CONTAINER: Vertically centered */}
                  <div className="flex items-center justify-between gap-4 w-full">
                    
                    {/* LEFT SIDE: min-w-0 prevents text from pushing the price off screen */}
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      
                      {/* ICON */}
                      <div className="p-3 rounded-xl shrink-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <InventoryIcon className="w-6 h-6" />
                      </div>

                      {/* TEXT CONTENT */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-1">
                          {product.description || 'Sin descripción'}
                        </p>

                        {/* COMPACT TAGS & STOCK ROW */}
                        <div className="flex items-center gap-3 mt-1.5">
                          {/* Status Badge */}
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md ${statusColor}`}>
                            {statusText}
                          </span>
                          
                          {/* Category */}
                          {product.category && (
                            <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-600">
                              {product.category}
                            </span>
                          )}

                          {/* Stock Count */}
                          <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                          
                            <span className="whitespace-nowrap">
                              {product.quantity} unid
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE: PRICE - shrink-0 ensures it stays visible */}
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <div className="text-xl sm:text-2xl font-bold whitespace-nowrap flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400">
                        <span>{formatCurrency(product.price, currencyCode)}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Precio unitario
                      </span>
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