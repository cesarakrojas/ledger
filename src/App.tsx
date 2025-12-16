/**
 * App.tsx - Application Entry Component
 * 
 * ARCHITECTURE MIGRATION COMPLETE (Phase 3)
 * =========================================
 * 
 * This file is now OBSOLETE. The application architecture has been migrated:
 * 
 * OLD ARCHITECTURE (this file):
 * - All state management in this single component
 * - Manual view switching via state variables
 * - Props drilling through domain components
 * 
 * NEW ARCHITECTURE:
 * - State Management: Zustand stores (src/stores/)
 *   - transactionStore: Transaction CRUD, today's transactions, totals
 *   - inventoryStore: Product management
 *   - debtStore: Debt/libreta management  
 *   - contactStore: Contact management
 *   - configStore: Theme, currency, categories, payment methods
 *   - uiStore: Modals, menus, UI state
 * 
 * - Navigation: React Router v6 (src/routes.tsx)
 *   - File-based lazy loading
 *   - Nested routes with AppLayout
 *   - Named path helpers
 * 
 * - Domain Components: Use stores directly
 *   - No more prop drilling
 *   - Components are self-contained
 *   - Optional props for backward compatibility
 * 
 * ENTRY POINT: src/main.tsx uses RouterProvider directly
 * LAYOUT: src/AppLayout.tsx handles app shell
 * PAGES: src/pages/ contains route components
 * 
 * This file is kept for reference. It can be safely deleted.
 */

// Re-export the router for any legacy imports
export { router, paths } from './routes';

// Default export for any legacy usage
import React from 'react';

const LegacyApp: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
          App.tsx is Deprecated
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Please use the RouterProvider in main.tsx instead.
        </p>
      </div>
    </div>
  );
};

export default LegacyApp;
