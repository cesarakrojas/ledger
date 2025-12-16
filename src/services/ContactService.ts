/**
 * services/ContactService.ts
 * 
 * Handles all contact-related CRUD operations and business logic.
 * Contacts can be clients (customers) or suppliers (vendors).
 */

import {
  type Contact,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  generateId,
  reportError,
  createError,
  createStorageAccessor,
} from '../shared';

// ============================================
// STORAGE ACCESSOR
// ============================================

const contactStorage = createStorageAccessor<Contact>(
  STORAGE_KEYS.CONTACTS,
  {
    loadErrorMsg: 'Error al cargar contactos',
    saveErrorMsg: 'Error al guardar contactos',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

// ============================================
// SERVICE
// ============================================

export const ContactService = {
  /**
   * Get all contacts with optional filters
   */
  getAll: (filters?: {
    type?: 'client' | 'supplier';
    searchTerm?: string;
  }): Contact[] => {
    let contacts = contactStorage.get();

    // Filter by type
    if (filters?.type) {
      contacts = contacts.filter(c => c.type === filters.type);
    }

    // Filter by search term (name, phone, address)
    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      contacts = contacts.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.address?.toLowerCase().includes(term)
      );
    }

    // Sort by name
    return contacts.sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Get contact by ID
   */
  getById: (id: string): Contact | null => {
    const contacts = contactStorage.get();
    return contacts.find(c => c.id === id) || null;
  },

  /**
   * Create a new contact
   */
  create: (contactData: {
    type: 'client' | 'supplier';
    name: string;
    phone?: string;
    address?: string;
  }): Contact | null => {
    try {
      if (!contactData.name.trim()) {
        reportError(createError('validation', ERROR_MESSAGES.VALIDATION_ERROR, 'El nombre es requerido'));
        return null;
      }

      const now = new Date().toISOString();
      const newContact: Contact = {
        id: generateId(),
        type: contactData.type,
        name: contactData.name.trim(),
        phone: contactData.phone?.trim() || undefined,
        address: contactData.address?.trim() || undefined,
        createdAt: now,
        updatedAt: now
      };

      const contacts = contactStorage.get();
      contacts.push(newContact);
      const success = contactStorage.save(contacts);

      if (!success) {
        return null;
      }

      return newContact;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      reportError(createError('storage', 'Error al crear contacto', errorMsg));
      return null;
    }
  },

  /**
   * Update an existing contact
   */
  update: (
    contactId: string,
    updates: {
      name?: string;
      phone?: string;
      address?: string;
      type?: 'client' | 'supplier';
    }
  ): Contact | null => {
    try {
      const contacts = contactStorage.get();
      const contactIndex = contacts.findIndex(c => c.id === contactId);

      if (contactIndex === -1) {
        reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Contacto no encontrado'));
        return null;
      }

      const currentContact = contacts[contactIndex];
      const updatedContact: Contact = {
        ...currentContact,
        name: updates.name?.trim() || currentContact.name,
        phone: updates.phone?.trim() || currentContact.phone,
        address: updates.address?.trim() || currentContact.address,
        type: updates.type || currentContact.type,
        updatedAt: new Date().toISOString()
      };

      contacts[contactIndex] = updatedContact;
      const success = contactStorage.save(contacts);

      if (!success) {
        return null;
      }

      return updatedContact;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      reportError(createError('storage', 'Error al actualizar contacto', errorMsg));
      return null;
    }
  },

  /**
   * Delete a contact
   */
  delete: (contactId: string): boolean => {
    try {
      const contacts = contactStorage.get();
      const filteredContacts = contacts.filter(c => c.id !== contactId);

      if (filteredContacts.length === contacts.length) {
        reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Contacto no encontrado'));
        return false;
      }

      return contactStorage.save(filteredContacts);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      reportError(createError('storage', 'Error al eliminar contacto', errorMsg));
      return false;
    }
  },

  /**
   * Search contacts by name (for autocomplete)
   */
  searchByName: (searchTerm: string, type?: 'client' | 'supplier'): Contact[] => {
    if (!searchTerm.trim()) {
      return [];
    }
    
    return ContactService.getAll({ searchTerm, type });
  },
};

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

export const getAllContacts = ContactService.getAll;
export const getContactById = ContactService.getById;
export const createContact = ContactService.create;
export const updateContact = ContactService.update;
export const deleteContact = ContactService.delete;
export const searchContactsByName = ContactService.searchByName;
