/**
 * PurchasePage.tsx
 * Page component for purchase/restock workflow
 * PurchaseView manages its own full-screen overlay pattern
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PurchaseView } from '../../PurchaseDomain';

const PurchasePage: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/inventory');
  };

  return <PurchaseView onClose={handleClose} />;
};

export default PurchasePage;
