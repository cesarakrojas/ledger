/**
 * NewInflowPage.tsx - Page for creating new income transactions
 * Now simplified - NewInflowForm uses stores directly
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NewInflowForm } from '../TransactionsDomain';
import { FormViewWrapper } from '../UIComponents';
import { paths } from '../routes';

const NewInflowPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    navigate(paths.home());
  };
  
  // NewInflowForm now uses stores and router directly - minimal props needed
  return (
    <FormViewWrapper title="Nuevo Ingreso" onClose={handleClose}>
      <NewInflowForm />
    </FormViewWrapper>
  );
};

export default NewInflowPage;
