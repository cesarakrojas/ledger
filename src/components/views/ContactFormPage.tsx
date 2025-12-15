import React, { useState, useEffect } from 'react';
import type { Contact } from '../../SharedDefs';
import { CARD_FORM, TEXT_PAGE_TITLE, TRANSITION_COLORS } from '../../SharedDefs';
import { ContactForm } from '../ContactForm';
import { XMarkIcon } from '../../UIComponents';
import { ContactService } from '../../CoreServices';

export interface ContactFormPageProps {
  mode: 'create' | 'edit';
  contactId: string | null;
  onBack: () => void;
}

export const ContactFormPage: React.FC<ContactFormPageProps> = ({ mode, contactId, onBack }) => {
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (mode === 'edit' && contactId) {
      const foundContact = ContactService.getById(contactId);
      setContact(foundContact);
    } else {
      setContact(null);
    }
  }, [mode, contactId]);

  const handleSave = () => {
    onBack();
  };

  const handleDelete = () => {
    if (!contact) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      const success = ContactService.delete(contact.id);
      if (success) {
        onBack();
      }
    }
  };

  return (
    <div className="w-full h-full mx-auto animate-fade-in flex items-stretch">
      <div className={`w-full ${CARD_FORM}`}>
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h2 className={TEXT_PAGE_TITLE}>
            {mode === 'edit' ? 'Editar Contacto' : 'Nuevo Contacto'}
          </h2>
          <button
            onClick={onBack}
            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`}
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden px-6">
          <ContactForm
            contact={contact}
            onSave={handleSave}
            onCancel={onBack}
            onDelete={mode === 'edit' ? handleDelete : undefined}
          />
        </div>
      </div>
    </div>
  );
};
