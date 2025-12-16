/**
 * form/QuantityStepper.tsx - Quantity Control Component
 * 
 * Stepper control for adjusting product quantities with +/- buttons.
 * Respects stock limits.
 */

import React from 'react';
import type { Product } from '../../shared';

interface QuantityStepperProps {
  product: Product;
  currentQuantity: number;
  onQuantityChange: (newQuantity: number) => void;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  product,
  currentQuantity,
  onQuantityChange
}) => {
  const maxStock = product.quantity;

  return (
    <div className="flex items-center gap-0">
      <button
        type="button"
        onClick={() => onQuantityChange(Math.max(0, currentQuantity - 1))}
        disabled={currentQuantity === 0}
        className="w-10 h-10 flex items-center justify-center bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-xl disabled:opacity-50 transition-colors text-lg font-bold"
      >
        −
      </button>
      <span className="w-12 text-center font-bold text-slate-800 dark:text-white">{currentQuantity}</span>
      <button
        type="button"
        onClick={() => onQuantityChange(currentQuantity + 1)}
        disabled={currentQuantity >= maxStock}
        className="w-10 h-10 flex items-center justify-center bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 transition-colors text-lg font-bold"
      >
        +
      </button>
    </div>
  );
};
