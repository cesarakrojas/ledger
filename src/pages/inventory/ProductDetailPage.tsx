/**
 * ProductDetailPage.tsx - Page for viewing product details
 * Now simplified - ProductDetailPage component uses stores directly
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { ProductDetailPage as ProductDetail } from '../../InventoryDomain';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // ProductDetailPage now uses stores and router directly
  // Just pass the product ID, it will look up the product from store
  return <ProductDetail productId={id} />;
};

export default ProductDetailPage;
