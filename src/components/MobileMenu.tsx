import React, { useEffect, useState } from 'react';
import { Bars3Icon, XMarkIcon, CashIcon, UserIcon, Cog6ToothIcon } from './icons';

type ViewType = 'home' | 'settings' | 'inventory' | 'libreta' | 'clients' | 'reports' | 'new-inflow' | 'new-expense' | 'transaction-detail';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
}) => {
  const [slideIn, setSlideIn] = useState(false);

  // Handle body scroll lock and trigger slide-in animation
  useEffect(() => {
    if (isOpen) {
      // lock background scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Use setTimeout for more reliable animation
      const timer = setTimeout(() => setSlideIn(true), 10);
      return () => {
        document.body.style.overflow = originalOverflow;
        setSlideIn(false);
        clearTimeout(timer);
      };
    } else {
      setSlideIn(false);
    }
  }, [isOpen]);

  const handleNavigate = (view: ViewType) => {
    onClose();
    onNavigate(view);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div
        className={`relative ml-0 h-full w-[80vw] max-w-sm sm:max-w-md bg-white dark:bg-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${slideIn ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Bars3Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Menú</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Items with large touch targets */}
        <div className="py-2">
          <nav aria-label="Menú principal" className="py-2">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleNavigate('home')}
                  aria-current={currentView === 'home' || undefined}
                  className="w-full px-5 py-4 text-left flex items-center gap-4 text-lg font-medium text-slate-800 dark:text-slate-100 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <CashIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <span>Inicio</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigate('clients')}
                  aria-current={currentView === 'clients' || undefined}
                  className="w-full px-5 py-4 text-left flex items-center gap-4 text-lg font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <UserIcon className="w-6 h-6 text-slate-400" />
                  <span>Clientes</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('settings')}
                  aria-current={currentView === 'settings' || undefined}
                  className="w-full px-5 py-4 text-left flex items-center gap-4 text-lg font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Cog6ToothIcon className="w-6 h-6 text-slate-400" />
                  <span>Ajustes</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/* Spacer to catch clicks on the right area; click closes via backdrop */}
      <div className="flex-1" />
    </div>
  );
};
