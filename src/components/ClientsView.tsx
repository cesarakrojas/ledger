import React, { useState, useEffect, useCallback, memo } from 'react';
import type { Contact } from '../SharedDefs';
import { CARD_STYLES, LIST_ITEM_INTERACTIVE, TEXT_PAGE_TITLE, BTN_ACTION_PRIMARY, useDebouncedValue } from '../SharedDefs';
import { PlusIcon, UserIcon } from '../UIComponents';
import { ContactService } from '../CoreServices';

interface ClientsViewProps {
  onChangeView?: (mode: 'list' | 'create' | 'edit' | 'detail', contactId?: string) => void;
}

// Memoized filter controls
interface ContactFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}

const ContactFilters = memo<ContactFiltersProps>(({ 
  searchTerm, 
  setSearchTerm, 
  selectedType, 
  setSelectedType 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Buscar contactos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
        >
          <option value="">Todos</option>
          <option value="client">Clientes</option>
          <option value="supplier">Proveedores</option>
        </select>
    </div>
  );
});

ContactFilters.displayName = 'ContactFilters';

// Memoized contact item
interface ContactItemProps {
  contact: Contact;
  onClick: () => void;
}

const ContactItem = memo<ContactItemProps>(({ contact, onClick }) => {
  const typeLabel = contact.type === 'client' ? 'Cliente' : 'Proveedor';
  const typeColor = contact.type === 'client' 
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

  return (
    <div
      onClick={onClick}
      className={LIST_ITEM_INTERACTIVE}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          contact.type === 'client' 
            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
            : 'bg-blue-100 dark:bg-blue-900/30'
        }`}>
          <UserIcon className={`w-5 h-5 ${
            contact.type === 'client' 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {contact.name}
          </p>
          {contact.phone && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {contact.phone}
            </p>
          )}
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}>
        {typeLabel}
      </span>
    </div>
  );
});

ContactItem.displayName = 'ContactItem';

export const ClientsView: React.FC<ClientsViewProps> = ({ 
  onChangeView 
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Debounce search for performance
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 200);

  const loadContacts = useCallback(() => {
    const allContacts = ContactService.getAll({
      searchTerm: debouncedSearchTerm || undefined,
      type: selectedType as 'client' | 'supplier' | undefined
    });
    setContacts(allContacts);
  }, [debouncedSearchTerm, selectedType]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadContacts();
    };

    window.addEventListener('contactsUpdated', handleStorageChange);
    return () => window.removeEventListener('contactsUpdated', handleStorageChange);
  }, [loadContacts]);

  const handleContactClick = useCallback((contactId: string) => {
    onChangeView?.('detail', contactId);
  }, [onChangeView]);

  const handleCreateClick = useCallback(() => {
    onChangeView?.('create');
  }, [onChangeView]);

  // Group contacts by type
  const clients = contacts.filter(c => c.type === 'client');
  const suppliers = contacts.filter(c => c.type === 'supplier');

  return (
<div className="w-full space-y-6">
      <div className={CARD_STYLES}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className={TEXT_PAGE_TITLE}>Clientes y Proveedores
</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Para la gestión de deudas
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className={BTN_ACTION_PRIMARY}
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nuevo Contacto</span>
          </button>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>
        <ContactFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />

        <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm || selectedType 
                ? 'No se encontraron contactos con esos filtros'
                : 'No hay contactos registrados'}
            </p>
            <button
              onClick={handleCreateClick}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              Agregar Contacto
            </button>
          </div>
        ) : (
          <div>
            {!selectedType ? (
              <>
                {clients.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Clientes ({clients.length})
                    </h3>
                    <div className="space-y-2">
                      {clients.map(contact => (
                        <ContactItem
                          key={contact.id}
                          contact={contact}
                          onClick={() => handleContactClick(contact.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {suppliers.length > 0 && (
                  <>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                        Proveedores ({suppliers.length})
                      </h3>
                      <div className="space-y-2">
                        {suppliers.map(contact => (
                          <ContactItem
                            key={contact.id}
                            contact={contact}
                            onClick={() => handleContactClick(contact.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="space-y-2">
                {contacts.map(contact => (
                  <ContactItem
                    key={contact.id}
                    contact={contact}
                    onClick={() => handleContactClick(contact.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
