import React, { useState, useEffect } from 'react';
import type { Product } from '../SharedDefs';
import { INPUT_BASE_CLASSES, FORM_LABEL, FORM_FOOTER, ERROR_BANNER, BTN_FOOTER_PRIMARY, BTN_FOOTER_DANGER, BTN_FOOTER_SECONDARY } from '../SharedDefs';
import { TrashIcon, ExclamationCircleIcon } from '../UIComponents';
import { InventoryService } from '../CoreServices';

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
      // Reset form when product is null
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
        // Update existing product
        result = InventoryService.update(product.id, {
          name,
          description: description || undefined,
          price: parseFloat(price),
          category: category || undefined,
          quantity: parseInt(quantity)
        });
      } else {
        // Create new product
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
        {/* Error Banner */}
        {formError && (
          <div className={ERROR_BANNER}>
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            {formError}
          </div>
        )}

        {/* Product Name */}
        <div>
        <label className={FORM_LABEL}>
          Nombre del Producto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Camiseta básica"
          required
          className={INPUT_BASE_CLASSES}
        />
      </div>

        {/* Description */}
        <div>
        <label className={FORM_LABEL}>
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del producto..."
          rows={3}
          className={`${INPUT_BASE_CLASSES} resize-none`}
        />
      </div>

        {/* Price and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={FORM_LABEL}>
            Precio <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            className={INPUT_BASE_CLASSES}
          />
        </div>
        <div>
          <label className={FORM_LABEL}>
            Categoría
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej: Ropa, Electrónica"
            className={INPUT_BASE_CLASSES}
          />
        </div>
      </div>

        {/* Quantity Field */}
        <div>
        <label className={FORM_LABEL}>
          Cantidad Disponible <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0"
          min="0"
          required
          className={INPUT_BASE_CLASSES}
        />
      </div>
      </div>

      {/* Form Actions - Sticky Footer */}
      <div className={FORM_FOOTER}>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="submit"
            className={BTN_FOOTER_PRIMARY}
          >
            {product ? 'Actualizar' : 'Crear Producto'}
          </button>
          {product && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className={BTN_FOOTER_DANGER}
            >
              <TrashIcon className="w-5 h-5" />
              <span>Eliminar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className={BTN_FOOTER_SECONDARY}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
