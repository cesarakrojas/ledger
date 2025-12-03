import React, { useCallback } from 'react';
import type { Product } from '../../types';
import { ProductDetailView } from '../ProductDetailView';
import { NotFoundView } from './NotFoundView';
import * as inventoryService from '../../services/inventoryService';

export interface ProductDetailPageProps {
  product: Product | undefined;
  currencyCode: string;
  onClose: () => void;
  onEdit: (productId: string) => void;
  onProductsChange: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  currencyCode,
  onClose,
  onEdit,
  onProductsChange,
}) => {
  const handleEdit = useCallback(() => {
    if (product) {
      onEdit(product.id);
    }
  }, [product, onEdit]);

  const handleDelete = useCallback(() => {
    if (!product) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const success = inventoryService.deleteProduct(product.id);
      if (success) {
        onProductsChange();
        onClose();
      }
    }
  }, [product, onProductsChange, onClose]);

  if (!product) {
    return (
      <NotFoundView
        message="Producto no encontrado"
        buttonLabel="Volver al Inventario"
        onBack={onClose}
      />
    );
  }

  return (
    <div className="w-full h-full mx-auto animate-fade-in flex items-stretch">
      <ProductDetailView
        product={product}
        currencyCode={currencyCode}
        onClose={onClose}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
