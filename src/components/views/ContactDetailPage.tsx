import React, { useCallback } from 'react';
import type { Contact } from '../../SharedDefs';
import { ContactDetailView } from '../ContactDetailView';
import { NotFoundView } from './NotFoundView';

export interface ContactDetailPageProps {
  contact: Contact | undefined;
  onClose: () => void;
  onEdit: (contactId: string) => void;
}

export const ContactDetailPage: React.FC<ContactDetailPageProps> = ({
  contact,
  onClose,
  onEdit,
}) => {
  const handleEdit = useCallback(() => {
    if (contact) {
      onEdit(contact.id);
    }
  }, [contact, onEdit]);

  if (!contact) {
    return (
      <NotFoundView
        message="Contacto no encontrado"
        buttonLabel="Volver a Contactos"
        onBack={onClose}
      />
    );
  }

  return (
    <div className="w-full h-full mx-auto animate-fade-in flex items-stretch">
      <ContactDetailView
        contact={contact}
        onClose={onClose}
        onEdit={handleEdit}
      />
    </div>
  );
};
