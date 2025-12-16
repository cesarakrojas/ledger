/**
 * ProductFormPage.tsx - Page for creating/editing products
 * Now simplified - ProductForm uses stores directly
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductForm } from '../../InventoryDomain';
import { FormViewWrapper } from '../../UIComponents';
import { paths } from '../../routes';

const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const isEditMode = Boolean(id);
  
  const handleClose = () => {
    navigate(paths.inventory());
  };
  
  // ProductForm now uses stores and router directly - just pass productId
  return (
    <FormViewWrapper 
      title={isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
      onClose={handleClose}
    >
      <ProductForm productId={id} />
    </FormViewWrapper>
  );
};

export default ProductFormPage;
