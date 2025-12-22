/**
 * ContactDetailPage.tsx - Page for viewing contact details
 * Full-screen overlay pattern - hides app shell header and bottom nav
 */

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContactDetailPage as ContactDetail } from '../../ContactsDomain';
import { NotFoundView } from '../../TransactionsDomain';
import { useContactStore, useUIStore } from '../../stores';
import { paths } from '../../routes';

const ContactDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Get data from stores
  const { getById } = useContactStore();
  const setHideAppShell = useUIStore(state => state.setHideAppShell);
  const setHideBottomNav = useUIStore(state => state.setHideBottomNav);
  
  // Hide app shell and bottom nav when mounted (full-screen overlay pattern)
  useEffect(() => {
    setHideAppShell(true);
    setHideBottomNav(true);
    
    return () => {
      setHideAppShell(false);
      setHideBottomNav(false);
    };
  }, [setHideAppShell, setHideBottomNav]);
  
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
    <div className="w-full h-full animate-fade-in">
      <ContactDetail
        contact={contact}
        onClose={handleClose}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default ContactDetailPage;
