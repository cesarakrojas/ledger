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
    const currentProduct = inventoryService.getProductById(productId);
    if (!currentProduct) return;

    // Update stock
    inventoryService.updateProduct(productId, { quantity: newStock });

    onProductsChange();
    if (onSuccess) {
      onSuccess('¡Stock Actualizado!', `El inventario de ${currentProduct.name} ha sido actualizado`);
    }
  }, [onProductsChange, onSuccess]);

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
        onUpdateStock={handleUpdateStock}
      />
    </div>
  );
};
