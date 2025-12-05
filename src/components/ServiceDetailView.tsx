import React from 'react';
import type { Service } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CloseIcon, PencilIcon, ServicesIcon } from './icons';
import { DETAIL_VIEW_CONTAINER, DETAIL_VIEW_HEADER, DETAIL_VIEW_FOOTER, ICON_BTN_CLOSE, BTN_FOOTER_PRIMARY, BTN_FOOTER_SECONDARY } from '../utils/styleConstants';
import * as serviceService from '../services/serviceService';

interface ServiceDetailViewProps {
  service: Service;
  currencyCode: string;
  onClose: () => void;
  onEdit: () => void;
  onToggleStatus?: () => void;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
  service,
  currencyCode,
  onClose,
  onEdit,
  onToggleStatus
}) => {
  const handleToggleStatus = () => {
    const result = serviceService.toggleServiceStatus(service.id);
    if (result && onToggleStatus) {
      onToggleStatus();
    }
  };

  return (
    /* MAIN CONTAINER: Matches TransactionView style (Rounded top, shadow, hidden overflow) */
    <div className={DETAIL_VIEW_CONTAINER}>
      
      {/* 1. COMPACT HEADER */}
      <div className={DETAIL_VIEW_HEADER}>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white ml-2">Servicio</h2>
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
        
        {/* HERO SECTION: Icon & Key Stats */}
        <div className="bg-white dark:bg-slate-800 shadow-sm mb-4">
          {/* Icon Block */}
          <div className="flex justify-center pt-6 pb-4">
            <div className={`p-6 rounded-2xl ${
              service.isActive 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              <ServicesIcon className="w-12 h-12" />
            </div>
          </div>

          {/* Title & Price Block */}
          <div className="px-6 pb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
              {service.name}
            </h1>
            
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(service.price, currencyCode)}
              </span>
            </div>

            {/* Status Pill */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              service.isActive 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${service.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              {service.isActive ? 'Servicio Activo' : 'Servicio Inactivo'}
            </div>

            {/* Quick Status Toggle */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  service.isActive 
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                }`}
              >
                {service.isActive ? 'Desactivar Servicio' : 'Activar Servicio'}
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS LIST */}
        <div className="bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4">
          {service.description && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Descripción
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {service.description}
              </p>
            </div>
          )}

          {service.category && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Categoría
              </span>
              <span className="inline-block px-3 py-1 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md">
                {service.category}
              </span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 py-4">
             <div>
                <span className="block text-xs text-slate-500 mb-1">Creado</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{formatDate(service.createdAt)}</span>
             </div>
             <div>
                <span className="block text-xs text-slate-500 mb-1">Actualizado</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{formatDate(service.updatedAt)}</span>
             </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mx-4 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {service.isActive 
                  ? 'Este servicio está visible en las listas de selección.' 
                  : 'Este servicio no aparece en las listas de selección.'}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Puedes cambiar el estado del servicio usando el botón de arriba.
              </p>
            </div>
          </div>
        </div>
        
        {/* Spacer for bottom scroll */}
        <div className="h-6"></div>
      </div>

      {/* 3. COMPACT FOOTER (Action Grid) */}
      <div className={DETAIL_VIEW_FOOTER}>
        <div className="grid grid-cols-2 gap-3">
          {/* Toggle Status Button */}
          <button
            onClick={handleToggleStatus}
            className={service.isActive ? BTN_FOOTER_SECONDARY : BTN_FOOTER_PRIMARY}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{service.isActive ? 'Desactivar' : 'Activar'}</span>
          </button>
          
          {/* Edit Button */}
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
