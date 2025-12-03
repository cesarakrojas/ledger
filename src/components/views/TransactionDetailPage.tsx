import React from 'react';
import type { Transaction } from '../../types';
import { TransactionDetailView } from '../TransactionDetailView';
import { NotFoundView } from './NotFoundView';

export interface TransactionDetailPageProps {
  transaction: Transaction | undefined;
  currencyCode: string;
  onClose: () => void;
}

export const TransactionDetailPage: React.FC<TransactionDetailPageProps> = ({
  transaction,
  currencyCode,
  onClose,
}) => {
  if (!transaction) {
    return (
      <NotFoundView
        message="Transacción no encontrada"
        buttonLabel="Volver al Inicio"
        onBack={onClose}
      />
    );
  }

  const handleEdit = () => {
    // TODO: Implement edit functionality
    alert('La función de editar estará disponible próximamente');
  };

  return (
    <div className="w-full h-full mx-auto animate-fade-in flex items-stretch">
      <TransactionDetailView
        transaction={transaction}
        onClose={onClose}
        onEdit={handleEdit}
        currencyCode={currencyCode}
      />
    </div>
  );
};
