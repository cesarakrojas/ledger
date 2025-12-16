/**
 * routes.tsx - Route definitions for the application
 * 
 * Centralized route configuration using React Router v6
 */

import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Lazy load route components for better performance
const AppLayout = React.lazy(() => import('./layouts/AppLayout'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const NewInflowPage = React.lazy(() => import('./pages/NewInflowPage'));
const NewExpensePage = React.lazy(() => import('./pages/NewExpensePage'));
const TransactionDetailPage = React.lazy(() => import('./pages/TransactionDetailPage'));

// Inventory routes
const InventoryPage = React.lazy(() => import('./pages/inventory/InventoryPage'));
const ProductDetailPage = React.lazy(() => import('./pages/inventory/ProductDetailPage'));
const ProductFormPage = React.lazy(() => import('./pages/inventory/ProductFormPage'));

// Libreta (Debts) routes
const LibretaPage = React.lazy(() => import('./pages/libreta/LibretaPage'));
const DebtDetailPage = React.lazy(() => import('./pages/libreta/DebtDetailPage'));
const DebtFormPage = React.lazy(() => import('./pages/libreta/DebtFormPage'));

// Contacts routes
const ContactsPage = React.lazy(() => import('./pages/contacts/ContactsPage'));
const ContactDetailPage = React.lazy(() => import('./pages/contacts/ContactDetailPage'));
const ContactFormPage = React.lazy(() => import('./pages/contacts/ContactFormPage'));

// Settings routes
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'));
const CurrencyEditorPage = React.lazy(() => import('./pages/settings/CurrencyEditorPage'));
const CategoryEditorPage = React.lazy(() => import('./pages/settings/CategoryEditorPage'));
const PaymentMethodsPage = React.lazy(() => import('./pages/settings/PaymentMethodsPage'));

// Other routes
const ComingSoonPage = React.lazy(() => import('./pages/ComingSoonPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// =============================================================================
// Route Path Constants
// =============================================================================

export const ROUTES = {
  // Home & Transactions
  HOME: '/',
  NEW_INFLOW: '/new-inflow',
  NEW_EXPENSE: '/new-expense',
  TRANSACTION_DETAIL: '/transaction/:id',
  
  // Inventory
  INVENTORY: '/inventory',
  INVENTORY_NEW: '/inventory/new',
  INVENTORY_EDIT: '/inventory/:id/edit',
  INVENTORY_DETAIL: '/inventory/:id',
  
  // Libreta (Debts)
  LIBRETA: '/libreta',
  LIBRETA_NEW: '/libreta/new',
  LIBRETA_EDIT: '/libreta/:id/edit',
  LIBRETA_DETAIL: '/libreta/:id',
  
  // Contacts
  CONTACTS: '/contacts',
  CONTACTS_NEW: '/contacts/new',
  CONTACTS_EDIT: '/contacts/:id/edit',
  CONTACTS_DETAIL: '/contacts/:id',
  
  // Settings
  SETTINGS: '/settings',
  SETTINGS_CURRENCY: '/settings/currency',
  SETTINGS_CATEGORIES: '/settings/categories',
  SETTINGS_PAYMENT_METHODS: '/settings/payment-methods',
  
  // Other
  COMING_SOON: '/coming-soon',
} as const;

// =============================================================================
// Path Helpers - Generate paths with parameters
// =============================================================================

export const paths = {
  home: () => ROUTES.HOME,
  newInflow: () => ROUTES.NEW_INFLOW,
  newExpense: () => ROUTES.NEW_EXPENSE,
  transactionDetail: (id: string) => `/transaction/${id}`,
  
  inventory: () => ROUTES.INVENTORY,
  inventoryNew: () => ROUTES.INVENTORY_NEW,
  inventoryEdit: (id: string) => `/inventory/${id}/edit`,
  inventoryDetail: (id: string) => `/inventory/${id}`,
  
  libreta: () => ROUTES.LIBRETA,
  libretaNew: () => ROUTES.LIBRETA_NEW,
  libretaEdit: (id: string) => `/libreta/${id}/edit`,
  libretaDetail: (id: string) => `/libreta/${id}`,
  
  contacts: () => ROUTES.CONTACTS,
  contactsNew: () => ROUTES.CONTACTS_NEW,
  contactsEdit: (id: string) => `/contacts/${id}/edit`,
  contactsDetail: (id: string) => `/contacts/${id}`,
  
  settings: () => ROUTES.SETTINGS,
  settingsCurrency: () => ROUTES.SETTINGS_CURRENCY,
  settingsCategories: () => ROUTES.SETTINGS_CATEGORIES,
  settingsPaymentMethods: () => ROUTES.SETTINGS_PAYMENT_METHODS,
  
  comingSoon: () => ROUTES.COMING_SOON,
};

// =============================================================================
// Router Configuration
// =============================================================================

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Home & Transactions
      { index: true, element: <HomePage /> },
      { path: 'new-inflow', element: <NewInflowPage /> },
      { path: 'new-expense', element: <NewExpensePage /> },
      { path: 'transaction/:id', element: <TransactionDetailPage /> },
      
      // Inventory
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'inventory/new', element: <ProductFormPage /> },
      { path: 'inventory/:id/edit', element: <ProductFormPage /> },
      { path: 'inventory/:id', element: <ProductDetailPage /> },
      
      // Libreta (Debts)
      { path: 'libreta', element: <LibretaPage /> },
      { path: 'libreta/new', element: <DebtFormPage /> },
      { path: 'libreta/:id/edit', element: <DebtFormPage /> },
      { path: 'libreta/:id', element: <DebtDetailPage /> },
      
      // Contacts
      { path: 'contacts', element: <ContactsPage /> },
      { path: 'contacts/new', element: <ContactFormPage /> },
      { path: 'contacts/:id/edit', element: <ContactFormPage /> },
      { path: 'contacts/:id', element: <ContactDetailPage /> },
      
      // Settings
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/currency', element: <CurrencyEditorPage /> },
      { path: 'settings/categories', element: <CategoryEditorPage /> },
      { path: 'settings/payment-methods', element: <PaymentMethodsPage /> },
      
      // Other
      { path: 'coming-soon', element: <ComingSoonPage /> },
      
      // 404 catch-all
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
