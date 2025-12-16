/**
 * ContactFormPage.tsx - Page for creating/editing contacts
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContactFormPage as ContactForm } from '../../ContactsDomain';
import { paths } from '../../routes';

const ContactFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const isEditMode = Boolean(id);
  
  const handleBack = () => {
    navigate(paths.contacts());
  };
  
  return (
    <ContactForm
      mode={isEditMode ? 'edit' : 'create'}
      contactId={id || null}
      onBack={handleBack}
    />
  );
};

export default ContactFormPage;
