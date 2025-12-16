/**
 * AppLayout.tsx - Main application layout component
 * 
 * Contains the header, navigation, and outlet for child routes.
 * This replaces the layout code that was in App.tsx.
 */

import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bars3Icon, BellIcon, ErrorNotification, SuccessModal, MobileMenu } from '../components';
import { useConfigStore, useUIStore } from '../stores';
import { paths } from '../routes';
import { BottomNav } from '../components/BottomNav';

// Reset scroll position on route change
const useScrollReset = () => {
  const location = useLocation();
  
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [location.pathname]);
};

// =============================================================================
// AppLayout Component
// =============================================================================

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Reset scroll on route change
  useScrollReset();
  
  // Config store - using selectors for performance
  const setDarkMode = useConfigStore(state => state.setDarkMode);
  
  // UI store - using selectors for performance
  const isMenuOpen = useUIStore(state => state.isMenuOpen);
  const setMenuOpen = useUIStore(state => state.setMenuOpen);
  const successModal = useUIStore(state => state.successModal);
  const hideSuccessModal = useUIStore(state => state.hideSuccessModal);
  
  // Sync theme from DOM on mount (stores are initialized in main.tsx)
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, [setDarkMode]);
  
  // Type for MobileMenu compatibility
  type ViewType = 'home' | 'inventory' | 'libreta' | 'clients' | 'settings' | 'coming-soon' | 'new-inflow' | 'new-expense' | 'transaction-detail';
  
  // Determine current "view" for MobileMenu compatibility
  const getCurrentView = (): ViewType => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/inventory')) return 'inventory';
    if (path.startsWith('/libreta')) return 'libreta';
    if (path.startsWith('/contacts')) return 'clients';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/coming-soon')) return 'coming-soon';
    return 'home';
  };
  
  // Handle menu navigation (convert old view names to routes)
  const handleMenuNavigate = (view: ViewType) => {
    switch (view) {
      case 'home':
        navigate(paths.home());
        break;
      case 'inventory':
        navigate(paths.inventory());
        break;
      case 'libreta':
        navigate(paths.libreta());
        break;
      case 'clients':
        navigate(paths.contacts());
        break;
      case 'settings':
        navigate(paths.settings());
        break;
      case 'coming-soon':
        navigate(paths.comingSoon());
        break;
      default:
        navigate(paths.home());
    }
    setMenuOpen(false);
  };
  
  // Determine if bottom nav should be visible
  // Hide on form pages and detail views
  const shouldShowBottomNav = (): boolean => {
    const path = location.pathname;
    
    // Hide on these paths
    const hideOnPaths = [
      '/new-inflow',
      '/new-expense',
      '/transaction/',
    ];
    
    // Hide if path includes any of these patterns
    for (const hidePath of hideOnPaths) {
      if (path.includes(hidePath)) return false;
    }
    
    // Hide on detail/edit/new pages for domains
    if (path.match(/\/(inventory|libreta|contacts|settings)\/[^/]+/)) {
      return false;
    }
    
    return true;
  };
  
  const showBottomNav = shouldShowBottomNav();
  
  return (
    <div className="h-screen text-slate-900 dark:text-slate-200 transition-colors duration-300 font-sans flex flex-col overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-800 dark:to-teal-900 rounded-b-[3rem]"></div>
      
      <div className="relative flex flex-col flex-1 min-h-0">
        {/* Top Navigation Bar */}
        <nav className="flex justify-between items-center mb-4 sm:mb-6 relative z-10 flex-shrink-0 px-4 pt-4">
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Mi Empresa S.A</h1>
          <button
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors relative"
            aria-label="Notificaciones"
          >
            <BellIcon className="w-6 h-6" />
          </button>
        </nav>

        {/* Mobile-first slide-in drawer menu */}
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setMenuOpen(false)}
          currentView={getCurrentView()}
          onNavigate={handleMenuNavigate}
        />

        {/* Main Content Area - Outlet renders child routes */}
        <main className={`flex flex-col items-center flex-1 overflow-y-auto overflow-x-hidden scroll-container min-h-0 ${showBottomNav ? 'pb-20' : ''}`}>
          <React.Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          }>
            <Outlet />
          </React.Suspense>
        </main>
      </div>
      
      {/* Success Modal - Rendered at app root level */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => {
          hideSuccessModal();
          navigate(paths.home());
        }}
        title={successModal.title}
        message={successModal.message}
        type={successModal.type}
      />
      
      {/* Bottom Navigation Bar */}
      {showBottomNav && <BottomNav />}
      
      {/* Global Error Notifications */}
      <ErrorNotification />
    </div>
  );
};

export default AppLayout;
