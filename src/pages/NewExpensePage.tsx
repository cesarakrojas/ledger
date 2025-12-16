/**
 * NewExpensePage.tsx - Page for creating new expense transactions
 * Now simplified - NewExpenseForm uses stores directly
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NewExpenseForm } from '../TransactionsDomain';
import { FormViewWrapper } from '../UIComponents';
import { paths } from '../routes';

const NewExpensePage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    navigate(paths.home());
  };
  
  // NewExpenseForm now uses stores and router directly - minimal props needed
  return (
    <FormViewWrapper title="Nuevo Gasto" onClose={handleClose}>
      <NewExpenseForm />
    </FormViewWrapper>
  );
};

export default NewExpensePage;
