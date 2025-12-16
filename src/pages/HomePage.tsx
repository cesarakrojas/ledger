/**
 * HomePage.tsx - Home page with transactions list
 * Now simplified - HomeView uses stores directly
 */

import React from 'react';
import { HomeView } from '../TransactionsDomain';

const HomePage: React.FC = () => {
  // HomeView now uses stores and router directly - no props needed
  return <HomeView />;
};

export default HomePage;
