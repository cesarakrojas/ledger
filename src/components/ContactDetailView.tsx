import React from 'react';
import type { Contact } from '../SharedDefs';
import { formatDate, DETAIL_VIEW_CONTAINER, DETAIL_VIEW_HEADER, DETAIL_VIEW_FOOTER, ICON_BTN_CLOSE, BTN_FOOTER_PRIMARY, BTN_FOOTER_SECONDARY } from '../SharedDefs';
import { CloseIcon, PencilIcon, UserIcon } from '../UIComponents';

interface ContactDetailViewProps {
  contact: Contact;
  onClose: () => void;
  onEdit: () => void;
}

export const ContactDetailView: React.FC<ContactDetailViewProps> = ({
  contact,
  onClose,
  onEdit
}) => {
  const isClient = contact.type === 'client';
  const typeLabel = isClient ? 'Cliente' : 'Proveedor';

  const handleCall = () => {
    if (contact.phone) {
      window.open(`tel:${contact.phone}`, '_self');
    }
  };

  return (
    <div className={DETAIL_VIEW_CONTAINER}>
      
      {/* 1. HEADER */}
      <div className={DETAIL_VIEW_HEADER}>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white ml-2">Contacto</h2>
        <button 
          onClick={onClose} 
          className={ICON_BTN_CLOSE}
          aria-label="Cerrar"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container">
        
        {/* HERO SECTION */}
        <div className="bg-white dark:bg-slate-800 pb-8 pt-8 px-6 text-center shadow-sm">
          
          {/* Avatar */}
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            isClient 
              ? 'bg-emerald-100 dark:bg-emerald-900/30' 
              : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            <UserIcon className={`w-10 h-10 ${
              isClient 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-blue-600 dark:text-blue-400'
            }`} />
          </div>
          
          {/* Type Pill */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3 ${
            isClient
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {typeLabel}
          </div>
          
          {/* Name */}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {contact.name}
          </h1>
        </div>

        {/* DETAILS LIST */}
        <div className="mt-4 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4">
          
          {contact.phone && (
            <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Teléfono</span>
              <a 
                href={`tel:${contact.phone}`}
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          )}

          {contact.address && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Dirección
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {contact.address}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <div>
              <span className="block text-xs text-slate-500 mb-1">Creado</span>
              <span className="text-sm font-medium text-slate-800 dark:text-white">
                {formatDate(contact.createdAt)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-xs text-slate-500 mb-1">Actualizado</span>
              <span className="text-sm font-medium text-slate-800 dark:text-white">
                {formatDate(contact.updatedAt)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Spacer */}
        <div className="h-6 bg-slate-50 dark:bg-slate-900"></div>
      </div>

      {/* 3. COMPACT FOOTER */}
      <div className={DETAIL_VIEW_FOOTER}>
        <div className="grid grid-cols-2 gap-3">
          {contact.phone ? (
            <button
              onClick={handleCall}
              className={BTN_FOOTER_PRIMARY}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Llamar</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-xl font-semibold cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Llamar</span>
            </button>
          )}
          
          <button
            onClick={onEdit}
            className={BTN_FOOTER_SECONDARY}
          >
            <PencilIcon className="w-5 h-5" />
            <span>Editar</span>
          </button>
        </div>
      </div>

    </div>
  );
};
