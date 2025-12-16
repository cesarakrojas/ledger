/**
 * InventoryPage.tsx - Main inventory list page
 * Now simplified - InventoryView uses stores directly
 */

import React from 'react';
import { InventoryView } from '../../InventoryDomain';

const InventoryPage: React.FC = () => {
  // InventoryView now uses stores and router directly - no props needed
  return <InventoryView />;
};

export default InventoryPage;
