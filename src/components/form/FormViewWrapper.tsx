/**
 * form/FormViewWrapper.tsx - Form View Container
 * 
 * Reusable wrapper component for form views.
 * Provides consistent styling: white card container, header with title/close button, flex layout.
 */

import React, { useRef } from 'react';
import { CARD_FORM, TEXT_PAGE_TITLE, TRANSITION_COLORS } from '../../shared';
import { ChevronLeftIcon } from '../icons';

interface FormViewWrapperProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

/**
 * Reusable wrapper component for form views
 * Provides consistent styling: white card container, header with title/close button, flex layout
 * Uses h-full to fill parent container - scroll reset handled centrally by navigation
 */
export const FormViewWrapper: React.FC<FormViewWrapperProps> = ({ 
  title, 
  onClose, 
  children,
  maxWidth: _maxWidth = '4xl'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="w-full h-full mx-auto animate-fade-in animate-slide-in-right flex items-stretch">
      <div className={`w-full ${CARD_FORM}`}>
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
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
        <div className="flex-1 overflow-hidden px-6">
          {children}
        </div>
      </div>
    </div>
  );
};
