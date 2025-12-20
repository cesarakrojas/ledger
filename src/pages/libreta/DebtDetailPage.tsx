/**
 * DebtDetailPage.tsx - Page for viewing debt details
 * Now simplified - DebtDetailView uses stores directly
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { DebtDetailView } from '../../DebtsDomain';

const DebtDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // DebtDetailView now uses stores and router directly
  // Just pass the debt ID, it will look up the debt from store
  return (
    <div className="w-full h-full mx-auto animate-fade-in animate-slide-in-right flex items-stretch">
      <DebtDetailView debtId={id} />
    </div>
  );
};

export default DebtDetailPage;
