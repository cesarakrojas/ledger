/**
 * ContactDetailPage.tsx - Page for viewing contact details
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContactDetailPage as ContactDetail } from '../../ContactsDomain';
import { NotFoundView } from '../../TransactionsDomain';
import { useContactStore } from '../../stores';
import { paths } from '../../routes';

const ContactDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Get data from stores
  const { getById } = useContactStore();
  
  const contact = id ? getById(id) : undefined;
  
  const handleClose = () => {
    navigate(paths.contacts());
  };
  
  const handleEdit = (contactId: string) => {
    navigate(paths.contactsEdit(contactId));
  };
  
  if (!contact) {
    return (
      <NotFoundView
        message="Contacto no encontrado"
        buttonLabel="Volver a Contactos"
        onBack={handleClose}
      />
    );
  }
  
  return (
    <ContactDetail
      contact={contact}
      onClose={handleClose}
      onEdit={handleEdit}
    />
  );
};

export default ContactDetailPage;
