/**
 * CoreServices.ts - The Backend
 * * Centralized data persistence and business logic for the entire application.
 * All CRUD operations and data management are handled here.
 * * This file imports from SharedDefs.ts only.
 */

import {
  type Transaction,
  type Product,
  type DebtEntry,
  type Contact,
  type InventoryFilters,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  generateId,
  reportError,
  createError,
  createStorageAccessor,
} from './SharedDefs';

// ============================================
// TRANSACTION SERVICE
// ============================================

// Create storage accessor for transactions
const transactionStorage = createStorageAccessor<Transaction>(
  STORAGE_KEYS.TRANSACTIONS,
  {
    loadErrorMsg: 'Error al cargar transacciones',
    saveErrorMsg: 'Error al guardar transacciones',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

export const TransactionService = {
  // Add a transaction
  add: (
    type: 'inflow' | 'outflow',
    description: string,
    amount: number,
    category?: string,
    paymentMethod?: string
  ): Transaction | null => {
    const transactions = transactionStorage.get();
    
    const newTransaction: Transaction = {
      id: generateId(),
      type,
      description,
      amount,
      timestamp: new Date().toISOString(),
      category,
      paymentMethod
    };
    
    transactions.push(newTransaction);
    const saved = transactionStorage.save(transactions);
    
    if (!saved) {
      return null;
    }
    
    return newTransaction;
  },

  // Get all transactions with filters
  getWithFilters: (filters: {
    startDate?: string;
    endDate?: string;
    type?: 'inflow' | 'outflow';
    searchTerm?: string;
  }): Transaction[] => {
    let transactions = transactionStorage.get();
    
    // Filter by date range
    if (filters.startDate) {
      transactions = transactions.filter(t => t.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      transactions = transactions.filter(t => t.timestamp <= endOfDay.toISOString());
    }
    
    // Filter by type
    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      transactions = transactions.filter(t =>
        t.description.toLowerCase().includes(term) ||
        t.category?.toLowerCase().includes(term)
      );
    }
    
    return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Migrate category name across all transactions
  migrateCategoryName: (oldName: string, newName: string): number => {
    const transactions = transactionStorage.get();
    let updatedCount = 0;
    
    const updatedTransactions = transactions.map(transaction => {
      if (transaction.category === oldName) {
        updatedCount++;
        return { ...transaction, category: newName };
      }
      return transaction;
    });
    
    if (updatedCount > 0) {
      transactionStorage.save(updatedTransactions);
    }
    
    return updatedCount;
  },
};

// Legacy exports for backward compatibility during migration
export const addTransaction = TransactionService.add;
export const getTransactionsWithFilters = TransactionService.getWithFilters;
export const migrateTransactionCategoryName = TransactionService.migrateCategoryName;

// ============================================
// INVENTORY SERVICE
// ============================================

// Create storage accessor for products
const productStorage = createStorageAccessor<Product>(
  STORAGE_KEYS.PRODUCTS,
  {
    loadErrorMsg: 'Error al cargar productos',
    saveErrorMsg: 'Error al guardar productos',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

export const InventoryService = {
  // Get all products with optional filters
  getAll: (filters?: InventoryFilters): Product[] => {
    let products = productStorage.get();
    
    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }
    
    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    if (filters?.lowStock) {
      products = products.filter(p => p.quantity <= 10);
    }
    
    return products.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  // Migrate category name across all products
  migrateCategoryName: (oldName: string, newName: string): number => {
    const products = productStorage.get();
    let updatedCount = 0;
    
    const updatedProducts = products.map(product => {
      if (product.category === oldName) {
        updatedCount++;
        return { ...product, category: newName, updatedAt: new Date().toISOString() };
      }
      return product;
    });
    
    if (updatedCount > 0) {
      productStorage.save(updatedProducts);
    }
    
    return updatedCount;
  },

  // Create a new product with cost
  create: (
    name: string,
    price: number,
    cost: number, // <--- NEW PARAM
    quantity: number = 0,
    description?: string,
    category?: string
  ): Product | null => {
    try {
      if (!name || name.trim().length === 0) {
        reportError(createError('validation', 'El nombre del producto es requerido'));
        return null;
      }
      if (price < 0) {
        reportError(createError('validation', 'El precio debe ser mayor o igual a cero'));
        return null;
      }
      // Validation for cost
      if (cost < 0) {
        reportError(createError('validation', 'El costo debe ser mayor o igual a cero'));
        return null;
      }
      if (quantity < 0) {
        reportError(createError('validation', 'La cantidad debe ser mayor o igual a cero'));
        return null;
      }
      
      const products = productStorage.get();
      
      const newProduct: Product = {
        id: generateId(),
        name: name.trim(),
        description: description?.trim(),
        price,
        cost, // <--- SAVE COST
        quantity: Math.max(0, quantity),
        category: category?.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      products.push(newProduct);
      const saved = productStorage.save(products);
      
      if (!saved) return null;
      return newProduct;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      reportError(createError('storage', 'Error al crear producto', errorMsg));
      return null;
    }
  },

  // Update an existing product
  update: (
    productId: string,
    updates: {
      name?: string;
      description?: string;
      price?: number;
      cost?: number; // <--- NEW OPTIONAL
      category?: string;
      quantity?: number;
    }
  ): Product | null => {
    try {
      const products = productStorage.get();
      const productIndex = products.findIndex(p => p.id === productId);
      
      if (productIndex === -1) {
        reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Producto no encontrado'));
        return null;
      }
    
      const currentProduct = products[productIndex];
      
      // Validation for cost update
      if (updates.cost !== undefined && updates.cost < 0) {
          reportError(createError('validation', 'El costo debe ser mayor o igual a cero'));
          return null;
      }

      const updatedProduct: Product = {
        ...currentProduct,
        ...updates,
        name: updates.name?.trim() || currentProduct.name,
        description: updates.description?.trim(),
        category: updates.category?.trim(),
        // Handle cost update (fallback to existing or 0 for legacy data)
        cost: updates.cost !== undefined ? updates.cost : (currentProduct.cost || 0),
        quantity: updates.quantity !== undefined ? Math.max(0, updates.quantity) : currentProduct.quantity,
        updatedAt: new Date().toISOString()
      };
      
      products[productIndex] = updatedProduct;
      const saved = productStorage.save(products);
      
      if (!saved) return null;
      return updatedProduct;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      reportError(createError('storage', 'Error al actualizar producto', errorMsg));
      return null;
    }
  },

  // Delete a product with error handling
  delete: (productId: string): boolean => {
    try {
      const products = productStorage.get();
      const productExists = products.some(p => p.id === productId);
      
      if (!productExists) {
        reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Producto no encontrado'));
        return false;
      }
      
      const filteredProducts = products.filter(p => p.id !== productId);
      return productStorage.save(filteredProducts);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      reportError(createError('storage', 'Error al eliminar producto', errorMsg));
      return false;
    }
  },

  // Get product by ID
  getById: (productId: string): Product | null => {
    const products = productStorage.get();
    return products.find(p => p.id === productId) || null;
  },

  // Get all unique categories
  getCategories: (): string[] => {
    const products = productStorage.get();
    const categories = products
      .map(p => p.category)
      .filter((c): c is string => !!c);
    return Array.from(new Set(categories)).sort();
  },

  // Subscribe to inventory changes
  subscribe: (callback: (products: Product[]) => void): () => void => {
    callback(productStorage.get());
    
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PRODUCTS) {
        callback(productStorage.get());
      }
    };
    
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },
};

// Legacy exports for backward compatibility
export const getAllProducts = InventoryService.getAll;
export const createProduct = InventoryService.create;
export const updateProduct = InventoryService.update;
export const deleteProduct = InventoryService.delete;
export const getProductById = InventoryService.getById;
export const getProductCategories = InventoryService.getCategories;
export const subscribeToInventory = InventoryService.subscribe;
export const migrateProductCategoryName = InventoryService.migrateCategoryName;

// ============================================
// DEBT SERVICE
// ============================================

// Create storage accessor for debts
const debtStorage = createStorageAccessor<DebtEntry>(
  STORAGE_KEYS.DEBTS,
  {
    loadErrorMsg: 'Error al cargar deudas',
    saveErrorMsg: 'Error al guardar deudas',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

// Update overdue statuses and persist changes (internal helper)
const updateOverdueStatuses = (): DebtEntry[] => {
  const debts = debtStorage.get();
  const now = new Date();
  let hasChanges = false;
  
  const updatedDebts = debts.map(debt => {
    if (debt.status === 'pending' && new Date(debt.dueDate) < now) {
      hasChanges = true;
      return { ...debt, status: 'overdue' as const };
    }
    return debt;
  });
  
  // Only persist if there were actual changes
  if (hasChanges) {
    debtStorage.save(updatedDebts);
  }
  
  return updatedDebts;
};

export const DebtService = {
  // Get all debts
  getAll: (): DebtEntry[] => {
    // First, update any overdue statuses and persist
    const debts = updateOverdueStatuses();
    return debts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Migrate category name across all debts
  migrateCategoryName: (oldName: string, newName: string): number => {
    const debts = debtStorage.get();
    let updatedCount = 0;
    
    const updatedDebts = debts.map(debt => {
      if (debt.category === oldName) {
        updatedCount++;
        return { ...debt, category: newName };
      }
      return debt;
    });
    
    if (updatedCount > 0) {
      debtStorage.save(updatedDebts);
    }
    
    return updatedCount;
  },

  // Get a single debt by ID
  getById: (debtId: string): DebtEntry | null => {
    const debts = debtStorage.get();
    return debts.find(d => d.id === debtId) || null;
  },

  // Create a new debt
  create: (
    type: 'receivable' | 'payable',
    counterparty: string,
    amount: number,
    description: string,
    dueDate: string,
    category?: string,
    notes?: string
  ): DebtEntry | null => {
    const debts = debtStorage.get();
    
    const newDebt: DebtEntry = {
      id: generateId(),
      type,
      counterparty: counterparty.trim(),
      amount,
      originalAmount: amount,
      description: description.trim(),
      dueDate,
      status: new Date(dueDate) < new Date() ? 'overdue' : 'pending',
      createdAt: new Date().toISOString(),
      category: category?.trim() || undefined,
      notes: notes?.trim() || undefined,
      payments: []
    };
    
    debts.push(newDebt);
    const saved = debtStorage.save(debts);
    
    if (!saved) {
      return null;
    }
    
    return newDebt;
  },

  // Update an existing debt
  update: (
    debtId: string,
    updates: Partial<Omit<DebtEntry, 'id' | 'createdAt' | 'linkedTransactionId' | 'paidAt'>>
  ): DebtEntry | null => {
    const debts = debtStorage.get();
    const debtIndex = debts.findIndex(d => d.id === debtId);
    
    if (debtIndex === -1) {
      reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Deuda no encontrada'));
      return null;
    }
    
    const updatedDebt: DebtEntry = {
      ...debts[debtIndex],
      ...updates,
      counterparty: updates.counterparty?.trim() || debts[debtIndex].counterparty,
      description: updates.description?.trim() || debts[debtIndex].description,
      category: updates.category?.trim() || undefined,
      notes: updates.notes?.trim() || undefined
    };
    
    // Update status based on due date if changed
    if (updates.dueDate && updatedDebt.status === 'pending') {
      updatedDebt.status = new Date(updates.dueDate) < new Date() ? 'overdue' : 'pending';
    }
    
    debts[debtIndex] = updatedDebt;
    const saved = debtStorage.save(debts);
    
    if (!saved) {
      return null;
    }
    
    return updatedDebt;
  },

  // Delete a debt
  delete: (debtId: string): boolean => {
    const debts = debtStorage.get();
    const debtExists = debts.some(d => d.id === debtId);
    
    if (!debtExists) {
      reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Deuda no encontrada'));
      return false;
    }
    
    const filteredDebts = debts.filter(d => d.id !== debtId);
    return debtStorage.save(filteredDebts);
  },

  // Mark debt as paid and create corresponding transaction
  markAsPaid: (debtId: string): { debt: DebtEntry; transaction: Transaction } | null => {
    const debts = debtStorage.get();
    const debtIndex = debts.findIndex(d => d.id === debtId);
    
    if (debtIndex === -1) {
      reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Deuda no encontrada'));
      return null;
    }
    
    const debt = debts[debtIndex];
    
    if (debt.status === 'paid') {
      reportError(createError('validation', 'La deuda ya está marcada como pagada'));
      return null;
    }
    
    // Create corresponding transaction
    const transactionType = debt.type === 'receivable' ? 'inflow' : 'outflow';
    const transactionDescription = debt.type === 'receivable'
      ? `Abono cobrado: ${debt.counterparty} - ${debt.description}`
      : `Abono pagado: ${debt.counterparty} - ${debt.description}`;
    
    const transaction = TransactionService.add(
      transactionType,
      transactionDescription,
      debt.amount,
      debt.category,
      undefined // paymentMethod
    );
    
    if (!transaction) {
      reportError(createError('storage', 'Error al crear transacción para el pago'));
      return null;
    }
    
    // Create final payment record
    const finalPayment = {
      id: generateId(),
      amount: debt.amount,
      date: new Date().toISOString(),
      transactionId: transaction.id
    };
    
    // Update debt status
    const updatedDebt: DebtEntry = {
      ...debt,
      amount: 0,
      originalAmount: debt.originalAmount || debt.amount,
      status: 'paid',
      paidAt: new Date().toISOString(),
      linkedTransactionId: transaction.id,
      payments: [...(debt.payments || []), finalPayment]
    };
    
    debts[debtIndex] = updatedDebt;
    const saved = debtStorage.save(debts);
    
    if (!saved) {
      return null;
    }
    
    return { debt: updatedDebt, transaction };
  },

  // Make a partial payment on a debt
  makePartialPayment: (
    debtId: string, 
    paymentAmount: number
  ): { debt: DebtEntry; transaction: Transaction } | null => {
    const debts = debtStorage.get();
    const debtIndex = debts.findIndex(d => d.id === debtId);
    
    if (debtIndex === -1) {
      reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Deuda no encontrada'));
      return null;
    }
    
    const debt = debts[debtIndex];
    
    if (debt.status === 'paid') {
      reportError(createError('validation', 'La deuda ya está marcada como pagada'));
      return null;
    }
    
    if (paymentAmount <= 0) {
      reportError(createError('validation', 'El monto del abono debe ser mayor a 0'));
      return null;
    }
    
    if (paymentAmount > debt.amount) {
      reportError(createError('validation', 'El monto del abono no puede ser mayor al saldo'));
      return null;
    }
    
    // Create corresponding transaction for the partial payment
    const transactionType = debt.type === 'receivable' ? 'inflow' : 'outflow';
    const transactionDescription = debt.type === 'receivable'
      ? `Abono cobrado: ${debt.counterparty} - ${debt.description}`
      : `Abono pagado: ${debt.counterparty} - ${debt.description}`;
    
    const transaction = TransactionService.add(
      transactionType,
      transactionDescription,
      paymentAmount,
      debt.category,
      undefined // paymentMethod
    );
    
    if (!transaction) {
      reportError(createError('storage', 'Error al crear transacción para el abono'));
      return null;
    }
    
    const newAmount = debt.amount - paymentAmount;
    const isFullyPaid = newAmount <= 0;
    
    // Create payment record
    const newPayment = {
      id: generateId(),
      amount: paymentAmount,
      date: new Date().toISOString(),
      transactionId: transaction.id
    };
    
    // Update debt with payment history
    const updatedDebt: DebtEntry = {
      ...debt,
      amount: isFullyPaid ? 0 : newAmount,
      originalAmount: debt.originalAmount || debt.amount + paymentAmount,
      status: isFullyPaid ? 'paid' : debt.status,
      paidAt: isFullyPaid ? new Date().toISOString() : debt.paidAt,
      linkedTransactionId: isFullyPaid ? transaction.id : debt.linkedTransactionId,
      payments: [...(debt.payments || []), newPayment]
    };
    
    debts[debtIndex] = updatedDebt;
    const saved = debtStorage.save(debts);
    
    if (!saved) {
      return null;
    }
    
    return { debt: updatedDebt, transaction };
  },

  // Subscribe to debt changes
  subscribe: (callback: (debts: DebtEntry[]) => void): () => void => {
    // Initial call
    callback(DebtService.getAll());
    
    // Listen for storage changes
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.DEBTS) {
        callback(DebtService.getAll());
      }
    };
    
    window.addEventListener('storage', handler);
    
    return () => window.removeEventListener('storage', handler);
  },

  // Get summary statistics
  getStats: () => {
    const debts = DebtService.getAll();
    
    const receivables = debts.filter(d => d.type === 'receivable');
    const payables = debts.filter(d => d.type === 'payable');
    
    const totalReceivablesPending = receivables
      .filter(d => d.status === 'pending' || d.status === 'overdue')
      .reduce((sum, d) => sum + d.amount, 0);
    
    const totalPayablesPending = payables
      .filter(d => d.status === 'pending' || d.status === 'overdue')
      .reduce((sum, d) => sum + d.amount, 0);
    
    const overdueReceivables = receivables.filter(d => d.status === 'overdue').length;
    const overduePayables = payables.filter(d => d.status === 'overdue').length;
    
    return {
      totalReceivablesPending,
      totalPayablesPending,
      netBalance: totalReceivablesPending - totalPayablesPending,
      overdueReceivables,
      overduePayables,
      totalPendingDebts: debts.filter(d => d.status === 'pending' || d.status === 'overdue').length
    };
  },
};

// Legacy exports for backward compatibility
export const getAllDebts = DebtService.getAll;
export const getDebtById = DebtService.getById;
export const createDebt = DebtService.create;
export const updateDebt = DebtService.update;
export const deleteDebt = DebtService.delete;
export const markAsPaid = DebtService.markAsPaid;
export const makePartialPayment = DebtService.makePartialPayment;
export const subscribeToDebts = DebtService.subscribe;
export const getDebtStats = DebtService.getStats;
export const migrateDebtCategoryName = DebtService.migrateCategoryName;

// ============================================
// CONTACT SERVICE
// ============================================

// Create storage accessor for contacts
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

export const ContactService = {
  // Get all contacts with optional filters
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

  // Get contact by ID
  getById: (id: string): Contact | null => {
    const contacts = contactStorage.get();
    return contacts.find(c => c.id === id) || null;
  },

  // Create a new contact
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

  // Update an existing contact
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

  // Delete a contact
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

  // Search contacts by name (for autocomplete)
  searchByName: (searchTerm: string, type?: 'client' | 'supplier'): Contact[] => {
    if (!searchTerm.trim()) {
      return [];
    }
    
    return ContactService.getAll({ searchTerm, type });
  },
};

// Legacy exports for backward compatibility
export const getAllContacts = ContactService.getAll;
export const getContactById = ContactService.getById;
export const createContact = ContactService.create;
export const updateContact = ContactService.update;
export const deleteContact = ContactService.delete;
export const searchContactsByName = ContactService.searchByName;
