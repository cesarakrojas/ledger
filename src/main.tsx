import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { initializeAllStores } from './stores';
import './index.css';

// Initialize all stores before React renders to prevent flash of un-initialized state
// This includes config (theme, currency), and data stores (transactions, inventory, debts, contacts)
const storeCleanup = initializeAllStores();

// Cleanup stores on page unload (for completeness, though browser handles this)
window.addEventListener('beforeunload', storeCleanup);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
