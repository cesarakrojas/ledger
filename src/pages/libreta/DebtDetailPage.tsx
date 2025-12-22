/**
 * DebtDetailPage.tsx - Page for viewing debt details
 * Full-screen overlay pattern - hides app shell header and bottom nav
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DebtDetailView } from '../../DebtsDomain';
import { useUIStore } from '../../stores';

const DebtDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const setHideAppShell = useUIStore(state => state.setHideAppShell);
  const setHideBottomNav = useUIStore(state => state.setHideBottomNav);
  
  // Hide app shell and bottom nav when mounted (full-screen overlay pattern)
  useEffect(() => {
    setHideAppShell(true);
    setHideBottomNav(true);
    
    return () => {
      setHideAppShell(false);
      setHideBottomNav(false);
    };
  }, [setHideAppShell, setHideBottomNav]);
  
  // DebtDetailView now uses stores and router directly
  // Just pass the debt ID, it will look up the debt from store
  return (
    <div className="w-full h-full animate-fade-in">
      <DebtDetailView debtId={id} />
    </div>
  );
};

export default DebtDetailPage;
