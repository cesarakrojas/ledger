/**
 * ContactsPage.tsx - Main contacts list page
 * Now simplified - ClientsView uses stores directly
 */

import React from 'react';
import { ClientsView } from '../../ContactsDomain';

const ContactsPage: React.FC = () => {
  // ClientsView now uses stores and router directly - no props needed
  return <ClientsView />;
};

export default ContactsPage;
