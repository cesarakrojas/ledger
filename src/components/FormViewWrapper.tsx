import React, { useRef } from 'react';
import { XMarkIcon } from './icons';
import { CARD_FORM } from '../utils/styleConstants';

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
  const maxWidthClass = `max-w-${maxWidth}`;
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="w-full h-full mx-auto animate-fade-in flex items-stretch p-2 sm:p-4">
      <div className={`w-full ${maxWidthClass} mx-auto flex flex-col ${CARD_FORM}`}>
        <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 px-4 min-h-0 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
