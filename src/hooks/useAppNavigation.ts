import { useCallback, useEffect, useState } from 'react';

type AppView = 'home' | 'inventory' | 'libreta' | 'clients' | 'settings' | 'reports' | 'new-inflow' | 'new-expense' | 'transaction-detail';

/**
 * Centralized scroll reset utility.
 * Resets the main scroll container to the top.
 * This is the single source of truth for scroll position management.
 */
const resetScrollPosition = () => {
  // Target the main scroll container
  const mainElement = document.querySelector('main');
  if (mainElement) {
    mainElement.scrollTop = 0;
  }
  // Also reset window as fallback (for edge cases)
  window.scrollTo(0, 0);
};

export function useAppNavigation() {
  const [view, setView] = useState<AppView>('home');

  // Inventory navigation
  const [inventoryViewMode, setInventoryViewMode] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Libreta/debt navigation
  const [libretaViewMode, setLibretaViewMode] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);

  // Clients navigation
  const [clientsViewMode, setClientsViewMode] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Settings navigation
  const [settingsViewMode, setSettingsViewMode] = useState<'main' | 'category-editor'>('main');

  // Transaction selection
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const navigate = useCallback((to: AppView) => {
    setView(to);
    // Centralized scroll reset on navigation
    resetScrollPosition();
  }, []);

  const changeInventoryView = useCallback((mode: 'list' | 'create' | 'edit' | 'detail', productId?: string) => {
    setInventoryViewMode(mode);
    if (mode === 'edit' && productId) {
      setEditingProductId(productId);
      setSelectedProductId(null);
    } else if (mode === 'detail' && productId) {
      setSelectedProductId(productId);
      setEditingProductId(null);
    } else {
      setEditingProductId(null);
      setSelectedProductId(null);
    }
    // Reset scroll when changing inventory sub-views
    resetScrollPosition();
  }, []);

  const changeLibretaView = useCallback((mode: 'list' | 'create' | 'edit' | 'detail', debtId?: string) => {
    setLibretaViewMode(mode);
    if (mode === 'edit' && debtId) {
      setEditingDebtId(debtId);
      setSelectedDebtId(null);
    } else if (mode === 'detail' && debtId) {
      setSelectedDebtId(debtId);
      setEditingDebtId(null);
    } else {
      setEditingDebtId(null);
      setSelectedDebtId(null);
    }
    // Reset scroll when changing libreta sub-views
    resetScrollPosition();
  }, []);

  const changeClientsView = useCallback((mode: 'list' | 'create' | 'edit' | 'detail', contactId?: string) => {
    setClientsViewMode(mode);
    if (mode === 'edit' && contactId) {
      setEditingContactId(contactId);
      setSelectedContactId(null);
    } else if (mode === 'detail' && contactId) {
      setSelectedContactId(contactId);
      setEditingContactId(null);
    } else {
      setEditingContactId(null);
      setSelectedContactId(null);
    }
    // Reset scroll when changing clients sub-views
    resetScrollPosition();
  }, []);

  const changeSettingsView = useCallback((mode: 'main' | 'category-editor') => {
    setSettingsViewMode(mode);
    // Reset scroll when changing settings sub-views
    resetScrollPosition();
  }, []);

  // When top-level `view` changes, reset child module states when leaving their modules.
  useEffect(() => {
    if (view !== 'inventory') {
      setInventoryViewMode('list');
      setEditingProductId(null);
      setSelectedProductId(null);
    }

    if (view !== 'libreta') {
      setLibretaViewMode('list');
      setEditingDebtId(null);
      setSelectedDebtId(null);
    }

    if (view !== 'clients') {
      setClientsViewMode('list');
      setEditingContactId(null);
      setSelectedContactId(null);
    }

    if (view !== 'settings') {
      setSettingsViewMode('main');
    }
  }, [view]);

  return {
    // top level
    view,
    navigate,

    // inventory
    inventoryViewMode,
    changeInventoryView,
    editingProductId,
    selectedProductId,

    // libreta
    libretaViewMode,
    changeLibretaView,
    editingDebtId,
    selectedDebtId,

    // clients
    clientsViewMode,
    changeClientsView,
    editingContactId,
    selectedContactId,

    // settings
    settingsViewMode,
    changeSettingsView,

    // transactions
    selectedTransactionId,
    setSelectedTransactionId,
  } as const;
}
