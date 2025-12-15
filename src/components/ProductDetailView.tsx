import React, { useState } from 'react';
import type { Product } from '../SharedDefs';
import { formatCurrency, formatDate, DETAIL_VIEW_CONTAINER, DETAIL_VIEW_HEADER, DETAIL_VIEW_FOOTER, ICON_BTN_CLOSE, BTN_FOOTER_PRIMARY, BTN_FOOTER_SECONDARY } from '../SharedDefs';
import { CloseIcon, PencilIcon } from '../UIComponents';

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
  // Track stock modification
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
    /* MAIN CONTAINER: Matches TransactionView style (Rounded top, shadow, hidden overflow) */
    <div className={DETAIL_VIEW_CONTAINER}>
      
      {/* 1. COMPACT HEADER */}
      <div className={DETAIL_VIEW_HEADER}>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white ml-2">Producto</h2>
        <button 
          onClick={onClose} 
          className={ICON_BTN_CLOSE}
          aria-label="Cerrar"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container">
        
        {/* HERO SECTION: Image & Key Stats */}
        <div className="bg-white dark:bg-slate-800 shadow-sm mb-4">


          {/* Title & Price Block */}
          <div className="px-6 py-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
              {product.name}
            </h1>
            
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(product.price, currencyCode)}
              </span>
            </div>

            {/* Stock Pill */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isLowStock 
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
              {isLowStock ? '⚠️ Stock Bajo' : 'Stock Disponible'}
            </div>

            {/* Stock Adjuster */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleStockChange(-1)}
                disabled={currentStock === 0}
                className="w-9 h-9 flex items-center justify-center bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-lg disabled:opacity-50 transition-colors text-lg font-bold text-slate-700 dark:text-white"
              >
                −
              </button>
              <span className="w-14 text-center font-bold text-lg text-slate-800 dark:text-white">
                {currentStock}
              </span>
              <button
                type="button"
                onClick={() => handleStockChange(1)}
                className="w-9 h-9 flex items-center justify-center bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg transition-colors text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS LIST */}
        <div className="bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4">
          {product.description && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Descripción
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
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

        {/* Spacer for bottom scroll */}
        <div className="h-6"></div>
      </div>

      {/* 3. COMPACT FOOTER (Action Grid) */}
      <div className={DETAIL_VIEW_FOOTER}>
        <div className="grid grid-cols-2 gap-3">
          {/* Update Stock Button - enabled when stock is modified */}
          <button
            onClick={handleUpdateStock}
            disabled={!hasStockChanges}
            className={hasStockChanges 
              ? BTN_FOOTER_PRIMARY
              : 'flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-xl font-semibold cursor-not-allowed transition-colors'
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
          
          {/* Edit Button */}
          <button
            onClick={onEdit}
            className={BTN_FOOTER_SECONDARY}
          >
            <PencilIcon className="w-5 h-5" />
            <span>Editar</span>
          </button>
        </div>
      </div>

    </div>
  );
};
