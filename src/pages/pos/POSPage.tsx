/**
 * POSPage.tsx - Point of Sale page
 * Now simplified - POSView uses stores directly
 */

import React from 'react';
import { POSView } from '../../POSDomain';

const POSPage: React.FC = () => {
  // POSView now uses stores and router directly - no props needed
  return <POSView />;
};

export default POSPage;

