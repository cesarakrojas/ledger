/**
 * DebtFormPage.tsx - Page for creating/editing debts
 * Now simplified - DebtForm uses stores directly
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DebtForm } from '../../DebtsDomain';
import { FormViewWrapper } from '../../components';
import { paths } from '../../routes';

const DebtFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const isEditMode = Boolean(id);
  
  const handleClose = () => {
    navigate(paths.libreta());
  };
  
  // DebtForm now uses stores and router directly - just pass debtId
  return (
    <FormViewWrapper 
      title={isEditMode ? 'Editar Deuda' : 'Nueva Deuda'}
      onClose={handleClose}
    >
      <DebtForm debtId={id} />
    </FormViewWrapper>
  );
};

export default DebtFormPage;
