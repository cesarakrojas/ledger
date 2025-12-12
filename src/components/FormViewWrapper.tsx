import React, { useRef } from 'react';
import { XMarkIcon } from './icons';
import { CARD_FORM } from '../utils/styleConstants';
import { TEXT_PAGE_TITLE, TRANSITION_COLORS } from '../utils/constants';

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
  maxWidth = '4xl'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="w-full h-full mx-auto animate-fade-in flex items-stretch">
      <div className={`w-full ${CARD_FORM}`}>
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h2 className={TEXT_PAGE_TITLE}>{title}</h2>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`}
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden px-6">
          {children}
        </div>
      </div>
    </div>
  );
};
