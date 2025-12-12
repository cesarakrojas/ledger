import React, { useRef } from 'react';
import { XMarkIcon } from './icons';
import { CARD_FORM, ICON_BTN } from '../utils/styleConstants';
import { TEXT_PAGE_TITLE_RESPONSIVE } from '../utils/constants';

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
      <div className={`w-full mx-auto flex flex-col ${CARD_FORM}`}>
        <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
          <h2 className={TEXT_PAGE_TITLE_RESPONSIVE}>{title}</h2>
          <button
            onClick={onClose}
            className={`${ICON_BTN} p-2.5`}
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="flex-1 px-4 min-h-0 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
