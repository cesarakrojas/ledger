import React, { useState, useEffect } from 'react';
import type { Contact } from '../SharedDefs';
import { INPUT_BASE_CLASSES, FORM_LABEL, FORM_FOOTER, ERROR_BANNER, BTN_FOOTER_PRIMARY, BTN_FOOTER_DANGER, BTN_FOOTER_SECONDARY } from '../SharedDefs';
import { ExclamationCircleIcon, TrashIcon } from '../UIComponents';
import { ContactService } from '../CoreServices';

interface ContactFormProps {
  contact: Contact | null;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ contact, onSave, onCancel, onDelete }) => {
  const [type, setType] = useState<'client' | 'supplier'>('client');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setType(contact.type);
      setName(contact.name);
      setPhone(contact.phone || '');
      setAddress(contact.address || '');
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Por favor ingresa el nombre del contacto.');
      return;
    }

    try {
      if (contact) {
        // Update existing contact
        const result = ContactService.update(contact.id, {
          type,
          name: name.trim(),
          phone: phone.trim() || undefined,
          address: address.trim() || undefined
        });
        if (!result) {
          setFormError('Error al actualizar el contacto.');
          return;
        }
      } else {
        // Create new contact
        const result = ContactService.create({
          type,
          name: name.trim(),
          phone: phone.trim() || undefined,
          address: address.trim() || undefined
        });
        if (!result) {
          setFormError('Error al crear el contacto.');
          return;
        }
      }

      onSave();
    } catch (error) {
      setFormError('Ocurrió un error inesperado.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 scroll-container pb-4">
        
        {/* Error Banner */}
        {formError && (
          <div className={ERROR_BANNER}>
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Type Toggle */}
        <div>
          <label className={FORM_LABEL}>Tipo de Contacto</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('client')}
              className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                type === 'client'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Cliente
            </button>
            <button
              type="button"
              onClick={() => setType('supplier')}
              className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                type === 'supplier'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Proveedor
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className={FORM_LABEL}>
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === 'client' ? 'Nombre del cliente' : 'Nombre del proveedor'}
            className={INPUT_BASE_CLASSES}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className={FORM_LABEL}>Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Número de teléfono"
            className={INPUT_BASE_CLASSES}
          />
        </div>

        {/* Address */}
        <div>
          <label className={FORM_LABEL}>Dirección</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Dirección (opcional)"
            rows={3}
            className={INPUT_BASE_CLASSES}
          />
        </div>
      </div>

      {/* Form Actions - Sticky Footer */}
      <div className={FORM_FOOTER}>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="submit"
            className={BTN_FOOTER_PRIMARY}
          >
            {contact ? 'Actualizar' : 'Crear Contacto'}
          </button>
          {contact && onDelete ? (
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
