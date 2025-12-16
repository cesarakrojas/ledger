/**
 * TransactionDetailPage.tsx - Page for viewing transaction details
 * Now simplified - TransactionDetailPage component uses stores directly
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { TransactionDetailPage as TransactionDetail } from '../TransactionsDomain';

const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // TransactionDetailPage now uses stores and router directly
  // Just pass the transaction ID, it will look up the transaction from store
  return <TransactionDetail transactionId={id} />;
};

export default TransactionDetailPage;
