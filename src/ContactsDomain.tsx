/**
 * ContactsDomain.tsx
 * Domain module for all contact/clients management functionality
 * Contains: ClientsView, ContactForm, ContactDetailView, ContactDetailPage, ContactFormPage
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Contact } from './shared';
import {
  CARD_STYLES,
  LIST_ITEM_INTERACTIVE,
  TEXT_PAGE_TITLE,
  BTN_ACTION_PRIMARY,
  INPUT_BASE_CLASSES,
  FORM_LABEL,
  FORM_FOOTER,
  ERROR_BANNER,
  BTN_FOOTER_PRIMARY,
  BTN_FOOTER_DANGER,
  BTN_FOOTER_SECONDARY,
  BTN_FOOTER_DISABLED,
  DETAIL_VIEW_CONTAINER,
  DETAIL_VIEW_HEADER,
  DETAIL_VIEW_FOOTER,
  TEXT_DETAIL_HEADER_TITLE,
  ICON_BTN_CLOSE,
  CARD_FORM,
  TRANSITION_COLORS,
  DIVIDER,
  TOGGLE_BTN_BASE,
  TOGGLE_BTN_INACTIVE,
  TOGGLE_BTN_ACTIVE_EMERALD,
  TOGGLE_BTN_ACTIVE_BLUE,
  formatDate
} from './shared';
import {
  PlusIcon,
  UserIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  PhoneIcon,
  ConfirmationModal,
  ChevronLeftIcon,
} from './components';
import { ContactService } from './services';
import { useContactStore } from './stores';
import { paths } from './routes';

// =============================================================================
// ContactFilters (memoized)
// =============================================================================
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

// =============================================================================
// ContactItem (memoized)
// =============================================================================
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
    <div onClick={onClick} className={LIST_ITEM_INTERACTIVE}>
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
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{contact.name}</p>
          {contact.phone && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{contact.phone}</p>
          )}
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}>{typeLabel}</span>
    </div>
  );
});

ContactItem.displayName = 'ContactItem';

// =============================================================================
// ClientsView
// =============================================================================
export interface ClientsViewProps {
  onChangeView?: (mode: 'list' | 'create' | 'edit' | 'detail', contactId?: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = (props) => {
  const navigate = useNavigate();
  
  // Use Zustand store with selectors for performance
  const contacts = useContactStore(state => state.contacts);
  const clients = useContactStore(state => state.clients);
  const suppliers = useContactStore(state => state.suppliers);
  const loadContacts = useContactStore(state => state.loadContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Load contacts on mount and when filters change
  useEffect(() => {
    loadContacts({
      searchTerm: searchTerm || undefined,
      type: selectedType as 'client' | 'supplier' | undefined
    });
  }, [loadContacts, searchTerm, selectedType]);

  const handleContactClick = useCallback((contactId: string) => {
    if (props.onChangeView) {
      props.onChangeView('detail', contactId);
    } else {
      navigate(paths.contactsDetail(contactId));
    }
  }, [props.onChangeView, navigate]);

  const handleCreateClick = useCallback(() => {
    if (props.onChangeView) {
      props.onChangeView('create');
    } else {
      navigate(paths.contactsNew());
    }
  }, [props.onChangeView, navigate]);

  // Use store's clients and suppliers which are already filtered
  const displayedClients = selectedType === 'supplier' ? [] : clients.filter(c => 
    !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedSuppliers = selectedType === 'client' ? [] : suppliers.filter(c => 
    !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      <div className={CARD_STYLES}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className={TEXT_PAGE_TITLE}>Clientes y Proveedores</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Para la gestión de deudas</p>
          </div>
          <button onClick={handleCreateClick} className={BTN_ACTION_PRIMARY}>
            <PlusIcon className="w-5 h-5" />
            <span>Nuevo Contacto</span>
          </button>
        </div>

        <div className={DIVIDER}></div>

        <ContactFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />

        <div className={DIVIDER}></div>

        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm || selectedType 
                ? 'No se encontraron contactos con esos filtros'
                : 'No hay contactos registrados'}
            </p>
            <button onClick={handleCreateClick}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
              Agregar Contacto
            </button>
          </div>
        ) : (
          <div>
            {!selectedType ? (
              <>
                {displayedClients.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Clientes ({displayedClients.length})
                    </h3>
                    <div className="space-y-2">
                      {displayedClients.map(contact => (
                        <ContactItem key={contact.id} contact={contact} onClick={() => handleContactClick(contact.id)} />
                      ))}
                    </div>
                  </div>
                )}
                {displayedSuppliers.length > 0 && (
                  <>
                    <div className={DIVIDER}></div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                        Proveedores ({displayedSuppliers.length})
                      </h3>
                      <div className="space-y-2">
                        {displayedSuppliers.map(contact => (
                          <ContactItem key={contact.id} contact={contact} onClick={() => handleContactClick(contact.id)} />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="space-y-2">
                {contacts.map(contact => (
                  <ContactItem key={contact.id} contact={contact} onClick={() => handleContactClick(contact.id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// ContactForm
// =============================================================================
interface ContactFormProps {
  contact: Contact | null;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ contact, onSave, onCancel, onDelete }) => {
  const [type, setType] = useState<'client' | 'supplier'>('client');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setType(contact.type);
      setName(contact.name);
      setPhone(contact.phone || '');
      setAddress(contact.address || '');
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Por favor ingresa el nombre del contacto.');
      return;
    }

    try {
      if (contact) {
        const result = ContactService.update(contact.id, {
          type,
          name: name.trim(),
          phone: phone.trim() || undefined,
          address: address.trim() || undefined
        });
        if (!result) {
          setFormError('Error al actualizar el contacto.');
          return;
        }
      } else {
        const result = ContactService.create({
          type,
          name: name.trim(),
          phone: phone.trim() || undefined,
          address: address.trim() || undefined
        });
        if (!result) {
          setFormError('Error al crear el contacto.');
          return;
        }
      }
      onSave();
    } catch (error) {
      setFormError('Ocurrió un error inesperado.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 scroll-container pb-4">
        {formError && (
          <div className={ERROR_BANNER}>
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div>
          <label className={FORM_LABEL}>Tipo de Contacto</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setType('client')}
              className={`${TOGGLE_BTN_BASE} ${type === 'client' ? TOGGLE_BTN_ACTIVE_EMERALD : TOGGLE_BTN_INACTIVE}`}>
              Cliente
            </button>
            <button type="button" onClick={() => setType('supplier')}
              className={`${TOGGLE_BTN_BASE} ${type === 'supplier' ? TOGGLE_BTN_ACTIVE_BLUE : TOGGLE_BTN_INACTIVE}`}>
              Proveedor
            </button>
          </div>
        </div>

        <div>
          <label className={FORM_LABEL}>Nombre <span className="text-red-500">*</span></label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder={type === 'client' ? 'Nombre del cliente' : 'Nombre del proveedor'}
            className={INPUT_BASE_CLASSES} required />
        </div>

        <div>
          <label className={FORM_LABEL}>Teléfono</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="Número de teléfono" className={INPUT_BASE_CLASSES} />
        </div>

        <div>
          <label className={FORM_LABEL}>Dirección</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="Dirección (opcional)" rows={3} className={INPUT_BASE_CLASSES} />
        </div>
      </div>

      <div className={FORM_FOOTER}>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button type="submit" className={BTN_FOOTER_PRIMARY}>
            {contact ? 'Actualizar' : 'Crear Contacto'}
          </button>
          {contact && onDelete ? (
            <button type="button" onClick={onDelete} className={BTN_FOOTER_DANGER}>
              <TrashIcon className="w-5 h-5" />
              <span>Eliminar</span>
            </button>
          ) : (
            <button type="button" onClick={onCancel} className={BTN_FOOTER_SECONDARY}>Cancelar</button>
          )}
        </div>
      </div>
    </form>
  );
};

// =============================================================================
// ContactDetailView
// =============================================================================
interface ContactDetailViewProps {
  contact: Contact;
  onClose: () => void;
  onEdit: () => void;
}

export const ContactDetailView: React.FC<ContactDetailViewProps> = ({ contact, onClose, onEdit }) => {
  const isClient = contact.type === 'client';
  const typeLabel = isClient ? 'Cliente' : 'Proveedor';

  const handleCall = () => {
    if (contact.phone) {
      window.open(`tel:${contact.phone}`, '_self');
    }
  };

  return (
    <div className={DETAIL_VIEW_CONTAINER}>
      <div className={DETAIL_VIEW_HEADER}>
        <div className="flex items-center">
          <button onClick={onClose} className={ICON_BTN_CLOSE} aria-label="Volver">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className={TEXT_DETAIL_HEADER_TITLE}>Contacto</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container">
        <div className="bg-white dark:bg-slate-800 pb-8 pt-8 px-6 text-center shadow-sm">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            isClient ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            <UserIcon className={`w-10 h-10 ${
              isClient ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
            }`} />
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3 ${
            isClient
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {typeLabel}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{contact.name}</h1>
        </div>

        <div className="mt-4 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4">
          {contact.phone && (
            <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Teléfono</span>
              <a href={`tel:${contact.phone}`} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                {contact.phone}
              </a>
            </div>
          )}
          {contact.address && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Dirección</span>
              <p className="text-sm text-slate-700 dark:text-slate-300">{contact.address}</p>
            </div>
          )}
          <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <div>
              <span className="block text-xs text-slate-500 mb-1">Creado</span>
              <span className="text-sm font-medium text-slate-800 dark:text-white">{formatDate(contact.createdAt)}</span>
            </div>
            <div className="text-right">
              <span className="block text-xs text-slate-500 mb-1">Actualizado</span>
              <span className="text-sm font-medium text-slate-800 dark:text-white">{formatDate(contact.updatedAt)}</span>
            </div>
          </div>
        </div>
        <div className="h-6 bg-slate-50 dark:bg-slate-900"></div>
      </div>

      <div className={DETAIL_VIEW_FOOTER}>
        <div className="grid grid-cols-2 gap-3">
          {contact.phone ? (
            <button onClick={handleCall} className={BTN_FOOTER_PRIMARY}>
              <PhoneIcon className="w-5 h-5" />
              <span>Llamar</span>
            </button>
          ) : (
            <button disabled className={BTN_FOOTER_DISABLED}>
              <PhoneIcon className="w-5 h-5" />
              <span>Llamar</span>
            </button>
          )}
          <button onClick={onEdit} className={BTN_FOOTER_SECONDARY}>
            <PencilIcon className="w-5 h-5" />
            <span>Editar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// ContactDetailPage
// =============================================================================
export interface ContactDetailPageProps {
  contact: Contact | undefined;
  onClose: () => void;
  onEdit: (contactId: string) => void;
}

export const ContactDetailPage: React.FC<ContactDetailPageProps> = ({ contact, onClose, onEdit }) => {
  const handleEdit = useCallback(() => {
    if (contact) {
      onEdit(contact.id);
    }
  }, [contact, onEdit]);

  if (!contact) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 dark:text-slate-400">Contacto no encontrado</p>
          <button onClick={onClose} className={BTN_ACTION_PRIMARY + ' mt-4'}>Volver a Contactos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full mx-auto animate-fade-in animate-slide-in-right flex items-stretch">
      <ContactDetailView contact={contact} onClose={onClose} onEdit={handleEdit} />
    </div>
  );
};

// =============================================================================
// ContactFormPage
// =============================================================================
export interface ContactFormPageProps {
  mode: 'create' | 'edit';
  contactId: string | null;
  onBack: () => void;
}

export const ContactFormPage: React.FC<ContactFormPageProps> = ({ mode, contactId, onBack }) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && contactId) {
      const foundContact = ContactService.getById(contactId);
      setContact(foundContact);
    } else {
      setContact(null);
    }
  }, [mode, contactId]);

  const handleSave = () => {
    onBack();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!contact) return;
    const success = ContactService.delete(contact.id);
    if (success) {
      setShowDeleteConfirm(false);
      onBack();
    }
  };

  return (
    <>
      <div className="w-full h-full mx-auto animate-fade-in flex items-stretch">
      <div className="w-full h-full mx-auto animate-fade-in animate-slide-in-right flex items-stretch">
        <div className={`w-full ${CARD_FORM}`}>
          <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
            <h2 className={TEXT_PAGE_TITLE}>{mode === 'edit' ? 'Editar Contacto' : 'Nuevo Contacto'}</h2>
            <button onClick={onBack} className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`} aria-label="Cerrar">
              <XMarkIcon className="w-6 h-6" />
                        <div className="flex items-center gap-3">
                          <button
                            onClick={onBack}
                            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${TRANSITION_COLORS}`}
                            aria-label="Volver"
                          >
                            <ChevronLeftIcon className="w-6 h-6" />
                          </button>
                          <h2 className={TEXT_PAGE_TITLE}>{mode === 'edit' ? 'Editar Contacto' : 'Nuevo Contacto'}</h2>
                        </div>
            </button>
          </div>
          <div className="flex-1 overflow-hidden px-6">
            <ContactForm
              contact={contact}
              onSave={handleSave}
              onCancel={onBack}
              onDelete={mode === 'edit' ? handleDelete : undefined}
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Contacto"
        message="¿Estás seguro de que deseas eliminar este contacto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
};
