/**
 * uiStore.ts - Zustand store for UI state management
 * 
 * Manages transient UI state like modals, menus, and notifications.
 * Replaces the UI state from App.tsx.
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
  
  // Generic confirmation dialog (for future use)
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    onCancel: (() => void) | null;
  };
  showConfirmDialog: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
  hideConfirmDialog: () => void;
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
  
  // Confirm dialog state
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  },
  
  showConfirmDialog: (title, message, onConfirm, onCancel) => {
    set({
      confirmDialog: {
        isOpen: true,
        title,
        message,
        onConfirm,
        onCancel: onCancel || null,
      },
    });
  },
  
  hideConfirmDialog: () => {
    set({
      confirmDialog: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
      },
    });
  },
}));
