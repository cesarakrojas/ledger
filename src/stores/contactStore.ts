/**
 * contactStore.ts - Zustand store for contact/client/supplier state management
 * 
 * Manages all contact-related state and actions.
 * Replaces the contacts state from App.tsx and local state in ContactsDomain.
 */

import { create } from 'zustand';
import { ContactService } from '../CoreServices';
import type { Contact } from '../SharedDefs';
import { STORAGE_KEYS } from '../SharedDefs';

// ============================================
// Store Types
// ============================================

interface ContactFilters {
  type?: 'client' | 'supplier';
  searchTerm?: string;
}

interface ContactState {
  // Data
  contacts: Contact[];
  isLoading: boolean;
  
  // Derived state
  clients: Contact[];
  suppliers: Contact[];
  totalContacts: number;
  
  // Current filters (for UI sync)
  currentFilters: ContactFilters;
  
  // Actions
  loadContacts: (filters?: ContactFilters) => void;
  setFilters: (filters: ContactFilters) => void;
  createContact: (contactData: {
    type: 'client' | 'supplier';
    name: string;
    phone?: string;
    address?: string;
  }) => Contact | null;
  updateContact: (
    contactId: string,
    updates: {
      name?: string;
      phone?: string;
      address?: string;
      type?: 'client' | 'supplier';
    }
  ) => Contact | null;
  deleteContact: (contactId: string) => boolean;
  getById: (id: string) => Contact | undefined;
  searchByName: (searchTerm: string, type?: 'client' | 'supplier') => Contact[];
}

// ============================================
// Store Implementation
// ============================================

export const useContactStore = create<ContactState>((set, get) => ({
  // Initial state
  contacts: [],
  isLoading: true,
  clients: [],
  suppliers: [],
  totalContacts: 0,
  currentFilters: {},
  
  /**
   * Load all contacts from storage with optional filters
   */
  loadContacts: (filters?: ContactFilters) => {
    const contacts = ContactService.getAll(filters);
    const allContacts = filters ? ContactService.getAll() : contacts;
    
    set({
      contacts,
      clients: allContacts.filter(c => c.type === 'client'),
      suppliers: allContacts.filter(c => c.type === 'supplier'),
      totalContacts: allContacts.length,
      currentFilters: filters || {},
      isLoading: false,
    });
  },
  
  /**
   * Update filters and reload contacts
   */
  setFilters: (filters) => {
    get().loadContacts(filters);
  },
  
  /**
   * Create a new contact and refresh the store
   */
  createContact: (contactData) => {
    const result = ContactService.create(contactData);
    if (result) {
      get().loadContacts(get().currentFilters);
    }
    return result;
  },
  
  /**
   * Update an existing contact
   */
  updateContact: (contactId, updates) => {
    const result = ContactService.update(contactId, updates);
    if (result) {
      get().loadContacts(get().currentFilters);
    }
    return result;
  },
  
  /**
   * Delete a contact
   */
  deleteContact: (contactId) => {
    const result = ContactService.delete(contactId);
    if (result) {
      get().loadContacts(get().currentFilters);
    }
    return result;
  },
  
  /**
   * Get a contact by ID from the current state
   */
  getById: (id) => {
    // First try from filtered contacts
    const fromFiltered = get().contacts.find(c => c.id === id);
    if (fromFiltered) return fromFiltered;
    
    // If not found, fetch directly (in case filters are hiding it)
    return ContactService.getById(id) || undefined;
  },
  
  /**
   * Search contacts by name (for autocomplete)
   */
  searchByName: (searchTerm, type) => {
    return ContactService.searchByName(searchTerm, type);
  },
}));

// ============================================
// Store Initialization Hook
// ============================================

/**
 * Initialize the contact store on app startup.
 * Call this once in your root component.
 */
export const initializeContactStore = () => {
  useContactStore.getState().loadContacts();
  
  // Listen for storage changes (multi-tab sync)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.CONTACTS) {
      useContactStore.getState().loadContacts();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Also listen for custom contact update events
  const handleContactsUpdated = () => {
    useContactStore.getState().loadContacts();
  };
  
  window.addEventListener('contactsUpdated', handleContactsUpdated);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('contactsUpdated', handleContactsUpdated);
  };
};
