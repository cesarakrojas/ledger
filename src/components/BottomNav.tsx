/**
 * BottomNav.tsx - Bottom Navigation Bar Component
 * 
 * Uses NavLink for proper active states and navigation.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { CashIcon, BookOpenIcon, InventoryIcon, QuestionMarkIcon } from '../UIComponents';
import { ROUTES } from '../routes';

// =============================================================================
// BottomNav Component
// =============================================================================

const navItems = [
  { to: ROUTES.HOME, icon: CashIcon, label: 'Inicio' },
  { to: ROUTES.LIBRETA, icon: BookOpenIcon, label: 'Libreta' },
  { to: ROUTES.INVENTORY, icon: InventoryIcon, label: 'Inventario' },
  { to: ROUTES.COMING_SOON, icon: QuestionMarkIcon, label: 'Pronto' },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50 safe-area-bottom">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex justify-around items-center">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.HOME}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
