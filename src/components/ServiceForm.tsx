import React, { useState, useEffect } from 'react';
import type { Service } from '../types';
import { TrashIcon, ExclamationCircleIcon } from './icons';
import { INPUT_BASE_CLASSES, FORM_LABEL, FORM_FOOTER, ERROR_BANNER } from '../utils/constants';
import { SETTINGS_SECTION, BTN_FOOTER_PRIMARY, BTN_FOOTER_DANGER, BTN_FOOTER_SECONDARY } from '../utils/styleConstants';
import * as serviceService from '../services/serviceService';

interface ServiceFormProps {
  service: Service | null;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSave, onCancel, onDelete }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || '');
      setPrice(service.price.toString());
      setCategory(service.category || '');
      setIsActive(service.isActive);
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !price || parseFloat(price) < 0) {
      setFormError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      let result;
      if (service) {
        // Update existing service
        result = serviceService.updateService(service.id, {
          name,
          description: description || undefined,
          price: parseFloat(price),
          category: category || undefined,
          isActive
        });
      } else {
        // Create new service
        result = serviceService.createService(
          name,
          parseFloat(price),
          description || undefined,
          category || undefined,
          isActive
        );
      }
      
      if (!result) {
        setFormError('Error al guardar el servicio.');
        return;
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving service:', error);
      setFormError('Error al guardar el servicio.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4 scroll-container">
      {/* Error Banner */}
      {formError && (
        <div className={ERROR_BANNER}>
          <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
          {formError}
        </div>
      )}

      {/* Service Name */}
      <div>
        <label className={FORM_LABEL}>
          Nombre del Servicio <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Corte de cabello"
          required
          className={INPUT_BASE_CLASSES}
        />
      </div>

      {/* Description */}
      <div>
        <label className={FORM_LABEL}>
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del servicio..."
          rows={3}
          className={`${INPUT_BASE_CLASSES} resize-none`}
        />
      </div>

      {/* Price and Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={FORM_LABEL}>
            Precio <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            className={INPUT_BASE_CLASSES}
          />
        </div>
        <div>
          <label className={FORM_LABEL}>
            Categoría
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej: Belleza, Consultoría"
            className={INPUT_BASE_CLASSES}
          />
        </div>
      </div>

      {/* Active Status Toggle */}
      <div className={`flex items-center justify-between ${SETTINGS_SECTION}`}>
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">Estado del Servicio</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isActive 
              ? 'El servicio aparecerá en las listas de selección' 
              : 'El servicio no aparecerá en las listas de selección'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            isActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              isActive ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Status Indicator */}
      <div className={`p-4 rounded-lg ${isActive 
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
        : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
          <span className={`font-medium ${isActive 
            ? 'text-emerald-700 dark:text-emerald-300' 
            : 'text-slate-600 dark:text-slate-400'
          }`}>
            {isActive ? 'Servicio Activo' : 'Servicio Inactivo'}
          </span>
        </div>
      </div>

      </div>

      {/* Form Actions - Sticky Footer */}
      <div className={FORM_FOOTER}>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="submit"
            className={BTN_FOOTER_PRIMARY}
          >
            {service ? 'Actualizar' : 'Crear Servicio'}
          </button>
          {service && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className={BTN_FOOTER_DANGER}
            >
              <TrashIcon className="w-5 h-5" />
              <span>Eliminar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className={BTN_FOOTER_SECONDARY}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
