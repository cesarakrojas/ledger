/**
 * LibretaPage.tsx - Main debts/libreta list page
 * Now simplified - LibretaView uses stores directly
 */

import React from 'react';
import { LibretaView } from '../../DebtsDomain';

const LibretaPage: React.FC = () => {
  // LibretaView now uses stores and router directly - no props needed
  return <LibretaView />;
};

export default LibretaPage;
