import React, { useState, useEffect } from 'react';
import type { Product } from '../../SharedDefs';
import { CARD_FORM, TEXT_PAGE_TITLE, TRANSITION_COLORS } from '../../SharedDefs';
import { ProductForm } from '../ProductForm';
import { XMarkIcon } from '../../UIComponents';
import { InventoryService } from '../../CoreServices';

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
          <h2 className={TEXT_PAGE_TITLE}>
            {mode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onBack}
            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`}
            aria-label="Cerrar"
          >
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
