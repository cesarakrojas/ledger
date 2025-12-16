/**
 * uiStore.ts - Zustand store for UI state management
 * 
 * Manages transient UI state like modals, menus, and notifications.
 * Replaces the UI state from App.tsx.
 * 
 * Note: Confirmation dialogs are handled locally in components using
 * the ConfirmationModal component with local state for better UX control.
 */

import { create } from 'zustand';

// ============================================
// Store Types
// ============================================

interface SuccessModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'inflow' | 'expense';
}

interface UIState {
  // Mobile menu
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
  
  // Success Modal
  successModal: SuccessModalState;
  showSuccessModal: (title: string, message: string, type?: 'inflow' | 'expense') => void;
  hideSuccessModal: () => void;
}

// ============================================
// Store Implementation
// ============================================

export const useUIStore = create<UIState>((set) => ({
  // Mobile menu state
  isMenuOpen: false,
  
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  
  // Success modal state
  successModal: {
    isOpen: false,
    title: '',
    message: '',
    type: 'inflow',
  },
  
  showSuccessModal: (title, message, type = 'inflow') => {
    set({
      successModal: {
        isOpen: true,
        title,
        message,
        type,
      },
    });
  },
  
  hideSuccessModal: () => {
    set({
      successModal: {
        isOpen: false,
        title: '',
        message: '',
        type: 'inflow',
      },
    });
  },
}));
