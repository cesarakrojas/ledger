import type { Contact } from '../types';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { generateId } from '../utils/idGenerator';
import { reportError, createError, ERROR_MESSAGES } from '../utils/errorHandler';
import { createStorageAccessor } from '../utils/performanceUtils';

const STORAGE_KEY = STORAGE_KEYS.CONTACTS;

// Create storage accessor for contacts
const contactStorage = createStorageAccessor<Contact>(
  STORAGE_KEY,
  {
    loadErrorMsg: 'Error al cargar contactos',
    saveErrorMsg: 'Error al guardar contactos',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

// Get all contacts with optional filters
export const getAllContacts = (filters?: {
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
};

// Get contact by ID
export const getContactById = (id: string): Contact | null => {
  const contacts = contactStorage.get();
  return contacts.find(c => c.id === id) || null;
};

// Create a new contact
export const createContact = (contactData: {
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
};

// Update an existing contact
export const updateContact = (
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
};

// Delete a contact
export const deleteContact = (contactId: string): boolean => {
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
};
