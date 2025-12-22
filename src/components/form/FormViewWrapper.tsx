/**
 * form/FormViewWrapper.tsx - Form View Container
 * 
 * Reusable wrapper component for form views.
 * Full-screen overlay that hides the app shell header and bottom nav.
 * Provides consistent styling: white card container, header with title/close button, flex layout.
 */

import React, { useRef, useEffect } from 'react';
import { FULL_SCREEN_OVERLAY, TEXT_PAGE_TITLE, TRANSITION_COLORS } from '../../shared';
import { useUIStore } from '../../stores';
import { ChevronLeftIcon } from '../icons';

interface FormViewWrapperProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

/**
 * Reusable wrapper component for form views
 * Full-screen overlay pattern - hides app shell header and bottom nav
 * Provides consistent styling: white card container, header with title/close button, flex layout
 */
export const FormViewWrapper: React.FC<FormViewWrapperProps> = ({ 
  title, 
  onClose, 
  children,
  maxWidth: _maxWidth = '4xl'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setHideAppShell = useUIStore(state => state.setHideAppShell);
  const setHideBottomNav = useUIStore(state => state.setHideBottomNav);
  
  // Hide app shell and bottom nav when form is mounted
  useEffect(() => {
    setHideAppShell(true);
    setHideBottomNav(true);
    
    return () => {
      setHideAppShell(false);
      setHideBottomNav(false);
    };
  }, [setHideAppShell, setHideBottomNav]);
  
  return (
    <div ref={containerRef} className={`${FULL_SCREEN_OVERLAY} animate-fade-in`}>
      {/* Form Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`}
            aria-label="Volver"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h2 className={TEXT_PAGE_TITLE}>{title}</h2>
        </div>
      </div>
      
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800">
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};
