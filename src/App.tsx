// Main app for the management of micro and very small businesses in latin america.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Transaction, CategoryConfig, Product, DebtEntry, Contact } from './types';
import { STORAGE_KEYS } from './utils/storageKeys';
import { CARD_EMPTY_STATE } from './utils/styleConstants';
import { CashIcon, BookOpenIcon, InventoryIcon, Bars3Icon, BellIcon, ChartBarIcon } from './components/icons';
import { SettingsView } from './components/SettingsView';
import { CategoryEditorView } from './components/CategoryEditorView';
import { PaymentMethodsEditorView } from './components/PaymentMethodsEditorView';
import { InventoryView } from './components/InventoryView';
import { ClientsView } from './components/ClientsView';
import { ReportsView } from './components/ReportsView';
import { NewInflowForm } from './components/NewInflowForm';
import { NewExpenseForm } from './components/NewExpenseForm';
import { LibretaView } from './components/LibretaView';
import { FormViewWrapper } from './components/FormViewWrapper';
import { DebtForm } from './components/DebtForm';
import { DebtDetailView } from './components/DebtDetailView';
import { ErrorNotification } from './components/ErrorNotification';
import { SuccessModal } from './components/SuccessModal';
import { HomeView } from './components/views/HomeView';
import { TransactionDetailPage } from './components/views/TransactionDetailPage';
import { ProductDetailPage } from './components/views/ProductDetailPage';
import { ProductFormPage } from './components/views/ProductFormPage';
import { ContactFormPage } from './components/views/ContactFormPage';
import { ContactDetailPage } from './components/views/ContactDetailPage';
import { MobileMenu } from './components/MobileMenu';
import * as inventoryService from './services/inventoryService';
import * as debtService from './services/debtService';
import * as contactService from './services/contactService';
import { calculateTotalInflows, calculateTotalOutflows } from './utils/calculations';
import * as dataService from './services/dataService';
import { useAppNavigation } from './hooks/useAppNavigation';

// --- MAIN APP COMPONENT ---

export default function App() {
  const {
    view,
    navigate,

    inventoryViewMode,
    changeInventoryView,
    editingProductId,
    selectedProductId,

    libretaViewMode,
    changeLibretaView,
    editingDebtId,
    selectedDebtId,

    clientsViewMode,
    changeClientsView,
    editingContactId,
    selectedContactId,

    selectedTransactionId,
    setSelectedTransactionId,

    settingsViewMode,
    changeSettingsView,
  } = useAppNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [debts, setDebts] = useState<DebtEntry[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [categoryConfig, setCategoryConfig] = useState<CategoryConfig>({
    enabled: true,
    inflowCategories: ['Ventas', 'Otros Ingresos', 'Propinas'],
    outflowCategories: ['Gastos Operativos', 'Salarios', 'Servicios Públicos', 'Mantenimiento', 'Transporte', 'Otros Gastos']
  });
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['Efectivo', 'Tarjeta', 'Transferencia']);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [successModalType, setSuccessModalType] = useState<'inflow' | 'expense' | 'purchase'>('inflow');

  // Centralized data loading function - memoized to prevent re-creation on every render
  const loadAllData = useCallback(() => {
    // Load products
    const prods = inventoryService.getAllProducts();
    setProducts(prods);
    
    // Load transactions
    const txs = dataService.getTransactionsWithFilters({});
    setTransactions(txs);
    
    // Load debts
    const loadedDebts = debtService.getAllDebts({});
    setDebts(loadedDebts);
    
    // Load contacts
    const loadedContacts = contactService.getAllContacts({});
    setContacts(loadedContacts);
    
    // Load category config
    try {
      const savedConfigStr = localStorage.getItem(STORAGE_KEYS.CATEGORY_CONFIG);
      if (savedConfigStr) {
        setCategoryConfig(JSON.parse(savedConfigStr));
      }
    } catch (e) {
      console.error('Error loading category config:', e);
    }

    // Load payment methods
    try {
      const savedMethodsStr = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
      if (savedMethodsStr) {
        setPaymentMethods(JSON.parse(savedMethodsStr));
      }
    } catch (e) {
      console.error('Error loading payment methods:', e);
    }
    
    // Load currency
    const savedCurrency = localStorage.getItem(STORAGE_KEYS.CURRENCY_CODE);
    if (savedCurrency) {
      setCurrencyCode(savedCurrency);
    }
  }, []);

  // Load theme and initial data
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    loadAllData();

    // Listen for storage changes (for multi-tab sync)
    // This single handler covers all data types including debts
    const handleStorageChange = () => {
      loadAllData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prevDarkMode => {
      const newDarkMode = !prevDarkMode;
      
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(STORAGE_KEYS.THEME, 'light');
      }
      
      return newDarkMode;
    });
  }, []);

  const handleSaveCategoryConfig = useCallback((config: CategoryConfig) => {
    setCategoryConfig(config);
    localStorage.setItem(STORAGE_KEYS.CATEGORY_CONFIG, JSON.stringify(config));
  }, []);

  const handleSavePaymentMethods = useCallback((methods: string[]) => {
    setPaymentMethods(methods);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
  }, []);

  const handleCurrencyChange = useCallback((newCurrencyCode: string) => {
    setCurrencyCode(newCurrencyCode);
    localStorage.setItem(STORAGE_KEYS.CURRENCY_CODE, newCurrencyCode);
  }, []);

  const handleAddTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const result = dataService.addTransaction(
      transaction.type,
      transaction.description,
      transaction.amount,
      transaction.category,
      transaction.paymentMethod,
      transaction.items
    );
    
    if (!result) {
      console.error('Error adding transaction');
      return;
    }
    
    // Reload all transactions
    const txs = dataService.getTransactionsWithFilters({});
    setTransactions(txs);
  }, []);

  const loadProducts = useCallback(() => {
    const prods = inventoryService.getAllProducts();
    setProducts(prods);
  }, []);

  const handleInventoryViewChange = useCallback((mode: 'list' | 'create' | 'edit' | 'detail', productId?: string) => {
    // delegate to navigation hook which centralizes reset logic
    changeInventoryView(mode, productId);
  }, [changeInventoryView]);

  const handleLibretaViewChange = useCallback((mode: 'list' | 'create' | 'edit' | 'detail', debtId?: string) => {
    // delegate to navigation hook which centralizes reset logic
    changeLibretaView(mode, debtId);
  }, [changeLibretaView]);

  const handleClientsViewChange = useCallback((mode: 'list' | 'create' | 'edit' | 'detail', contactId?: string) => {
    // delegate to navigation hook which centralizes reset logic
    changeClientsView(mode, contactId);
  }, [changeClientsView]);

  // Reset inventory view mode when leaving inventory - only run cleanup on view change
  // Navigation state resets are handled inside `useAppNavigation`.

  // Filter transactions to show only today's transactions in the main view
  const todayTransactions = useMemo(() => {
    const now = new Date();
    // Get today's date boundaries in local timezone
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    return transactions.filter(t => {
      const txDate = new Date(t.timestamp);
      return txDate >= todayStart && txDate <= todayEnd;
    });
  }, [transactions]);

  const totalInflows = useMemo(() => calculateTotalInflows(todayTransactions), [todayTransactions]);
  const totalOutflows = useMemo(() => calculateTotalOutflows(todayTransactions), [todayTransactions]);
  const inflowCount = useMemo(() => todayTransactions.filter(t => t.type === 'inflow').length, [todayTransactions]);
  const outflowCount = useMemo(() => todayTransactions.filter(t => t.type === 'outflow').length, [todayTransactions]);

  // Callbacks for HomeView
  const handleTransactionClick = useCallback((transactionId: string) => {
    setSelectedTransactionId(transactionId);
    navigate('transaction-detail');
  }, [navigate, setSelectedTransactionId]);

  const handleNewInflow = useCallback(() => navigate('new-inflow'), [navigate]);
  const handleNewExpense = useCallback(() => navigate('new-expense'), [navigate]);



  const SettingsModule = () => {
    if (settingsViewMode === 'category-editor') {
      return (
        <FormViewWrapper title="Editar Categorías" onClose={() => changeSettingsView('main')}>
          <CategoryEditorView
            inflowCategories={categoryConfig.inflowCategories}
            outflowCategories={categoryConfig.outflowCategories}
            onSave={(inflowCategories, outflowCategories) => {
              const newConfig: CategoryConfig = {
                ...categoryConfig,
                inflowCategories,
                outflowCategories
              };
              handleSaveCategoryConfig(newConfig);
              changeSettingsView('main');
            }}
            onCancel={() => changeSettingsView('main')}
          />
        </FormViewWrapper>
      );
    }

    if (settingsViewMode === 'payment-methods-editor') {
      return (
        <FormViewWrapper title="Editar Métodos de Pago" onClose={() => changeSettingsView('main')}>
          <PaymentMethodsEditorView
            paymentMethods={paymentMethods}
            onSave={(methods) => {
              handleSavePaymentMethods(methods);
              changeSettingsView('main');
            }}
            onCancel={() => changeSettingsView('main')}
          />
        </FormViewWrapper>
      );
    }

    return (
      <SettingsView
        onSave={handleSaveCategoryConfig}
        initialConfig={categoryConfig}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        currencyCode={currencyCode}
        onCurrencyChange={handleCurrencyChange}
        onEditCategories={() => changeSettingsView('category-editor')}
        onEditPaymentMethods={() => changeSettingsView('payment-methods-editor')}
        paymentMethods={paymentMethods}
      />
    );
  };

  // Reports Module - wraps imported ReportsView with current data
  const ReportsModule = () => (
    <ReportsView transactions={transactions} debts={debts} currencyCode={currencyCode} />
  );

  // Placeholder shown when a module is intentionally deactivated/unmounted
  const DisabledModule: React.FC<{ name: string }> = ({ name }) => (
    <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-6">
      <div className={CARD_EMPTY_STATE}>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Este módulo está temporalmente desactivado.</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Puedes reactivar el componente en el futuro si lo necesitas.</p>
      </div>
    </div>
  );

  const InventoryModule = () => {
    if (inventoryViewMode === 'create' || inventoryViewMode === 'edit') {
      return <ProductFormPage mode={inventoryViewMode} productId={editingProductId} onBack={handleInventoryListNav} />;
    }

    if (inventoryViewMode === 'detail') {
      return (
        <ProductDetailPage
          product={selectedProduct}
          currencyCode={currencyCode}
          onClose={handleInventoryListNav}
          onEdit={handleProductEdit}
          onProductsChange={loadProducts}
          onSuccess={(title, message) => {
            setSuccessModalTitle(title);
            setSuccessModalMessage(message);
            setSuccessModalType('inflow');
            setShowSuccessModal(true);
          }}
        />
      );
    }

    return <InventoryView viewMode={inventoryViewMode} editingProductId={editingProductId} currencyCode={currencyCode} onChangeView={handleInventoryViewChange} />;
  };

  const NewinflowView = () => {
    return (
      <FormViewWrapper title="Nuevo Ingreso" onClose={() => navigate('home')}>
        <NewInflowForm 
          products={products}
          onAddTransaction={handleAddTransaction}
          categoryConfig={categoryConfig}
          currencyCode={currencyCode}
          paymentMethods={paymentMethods}
          onClose={() => navigate('home')}
          onSuccess={(title, message) => {
            setSuccessModalTitle(title);
            setSuccessModalMessage(message);
            setSuccessModalType('inflow');
            setShowSuccessModal(true);
          }}
        />
      </FormViewWrapper>
    );
  };

  const NewExpenseView = () => {
    return (
      <FormViewWrapper title="Nuevo Gasto" onClose={() => navigate('home')}>
        <NewExpenseForm 
          onAddTransaction={handleAddTransaction} 
          categoryConfig={categoryConfig}
          currencyCode={currencyCode}
          paymentMethods={paymentMethods}
          onClose={() => navigate('home')}
          onSuccess={(title, message, type) => {
            setSuccessModalTitle(title);
            setSuccessModalMessage(message);
            setSuccessModalType(type as 'expense' | 'purchase');
            setShowSuccessModal(true);
          }}
        />
      </FormViewWrapper>
    );
  };

  // Memoized selected transaction for detail page
  const selectedTransaction = useMemo(
    () => transactions.find(t => t.id === selectedTransactionId),
    [transactions, selectedTransactionId]
  );

  const handleNavigateHome = useCallback(() => navigate('home'), [navigate]);

  // Memoized selected product for detail page
  const selectedProduct = useMemo(
    () => products.find(p => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const handleInventoryListNav = useCallback(() => handleInventoryViewChange('list'), [handleInventoryViewChange]);
  const handleProductEdit = useCallback((productId: string) => handleInventoryViewChange('edit', productId), [handleInventoryViewChange]);

  const DebtFormView = () => {
    const handleSave = () => {
      handleLibretaViewChange('list');
    };

    const handleDelete = () => {
      if (editingDebtId && confirm('¿Estás seguro de que deseas eliminar esta deuda?')) {
        const success = debtService.deleteDebt(editingDebtId);
        if (success) {
          handleLibretaViewChange('list');
        }
      }
    };

    return (
      <FormViewWrapper 
        title={editingDebtId ? 'Editar Deuda' : 'Nueva Deuda'} 
        onClose={() => handleLibretaViewChange('list')}
      >
        <DebtForm
          mode={editingDebtId ? 'edit' : 'create'}
          debtId={editingDebtId || undefined}
          onSave={handleSave}
          onCancel={() => handleLibretaViewChange('list')}
          onDelete={editingDebtId ? handleDelete : undefined}
        />
      </FormViewWrapper>
    );
  };

  const DebtDetailPageView = () => {
    const debt = selectedDebtId ? debtService.getDebtById(selectedDebtId) : null;
    
    if (!debt) {
      return (
        <div className="w-full h-full max-w-4xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-slate-600 dark:text-slate-400">Deuda no encontrada</p>
            <button
              onClick={() => handleLibretaViewChange('list')}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/30 transition-colors"
            >
              Volver a Libreta
            </button>
          </div>
        </div>
      );
    }

    const handleEdit = () => {
      handleLibretaViewChange('edit', debt.id);
    };

    const handleMarkAsPaid = () => {
      const result = debtService.markAsPaid(debt.id);
      if (result) {
        handleLibretaViewChange('list');
      }
    };

    const handlePartialPayment = (amount: number) => {
      const result = debtService.makePartialPayment(debt.id, amount);
      if (result) {
        // Refresh the view - if fully paid, go to list, otherwise stay on detail
        if (result.debt.status === 'paid') {
          handleLibretaViewChange('list');
        } else {
          // Force re-render by briefly switching views
          handleLibretaViewChange('list');
          setTimeout(() => handleLibretaViewChange('detail', debt.id), 0);
        }
      }
    };

    return (
      <div className="w-full h-full mx-auto animate-fade-in flex items-stretch">
        <DebtDetailView
          debt={debt}
          onClose={() => handleLibretaViewChange('list')}
          onEdit={handleEdit}
          onMarkAsPaid={handleMarkAsPaid}
          onPartialPayment={handlePartialPayment}
          currencyCode={currencyCode}
        />
      </div>
    );
  };

  const LibretaModule = () => {
    if (libretaViewMode === 'create' || libretaViewMode === 'edit') {
      return <DebtFormView />;
    }

    if (libretaViewMode === 'detail') {
      return <DebtDetailPageView />;
    }

    return (
      <LibretaView
        onChangeView={handleLibretaViewChange}
        currencyCode={currencyCode}
      />
    );
  };

  // Memoized selected contact for detail page
  const selectedContact = useMemo(
    () => contacts.find(c => c.id === selectedContactId),
    [contacts, selectedContactId]
  );

  const handleClientsListNav = useCallback(() => handleClientsViewChange('list'), [handleClientsViewChange]);
  const handleContactEdit = useCallback((contactId: string) => handleClientsViewChange('edit', contactId), [handleClientsViewChange]);

  const ClientsModule = () => {
    if (clientsViewMode === 'create' || clientsViewMode === 'edit') {
      return <ContactFormPage mode={clientsViewMode} contactId={editingContactId} onBack={handleClientsListNav} />;
    }

    if (clientsViewMode === 'detail') {
      return (
        <ContactDetailPage
          contact={selectedContact}
          onClose={handleClientsListNav}
          onEdit={handleContactEdit}
        />
      );
    }

    return <ClientsView onChangeView={handleClientsViewChange} />;
  };

  // Determine if bottom nav is visible for conditional padding
  const showBottomNav = view !== 'new-inflow' && view !== 'new-expense' && view !== 'transaction-detail' && inventoryViewMode === 'list' && libretaViewMode === 'list' && clientsViewMode === 'list' && settingsViewMode === 'main';

  return (
    <div className="h-screen text-slate-900 dark:text-slate-200 transition-colors duration-300 font-sans flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-800 dark:to-teal-900 rounded-b-[3rem]"></div>
      <div className="relative p-2 sm:p-4 md:p-6 flex flex-col flex-1 min-h-0">
        <nav className="flex justify-between items-center mb-4 sm:mb-6 relative z-10 flex-shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
          onClose={() => setIsMenuOpen(false)}
          currentView={view}
          onNavigate={navigate}
        />

        <main className={`flex flex-col items-center flex-1 overflow-y-auto overflow-x-hidden scroll-container min-h-0 ${showBottomNav ? 'pb-20' : 'pb-2'}`}>
          {view === 'home' ? (
            <HomeView
              transactions={todayTransactions}
              currencyCode={currencyCode}
              totalInflows={totalInflows}
              totalOutflows={totalOutflows}
              inflowCount={inflowCount}
              outflowCount={outflowCount}
              onTransactionClick={handleTransactionClick}
              onNewInflow={handleNewInflow}
              onNewExpense={handleNewExpense}
            />
          ) : 
           view === 'new-inflow' ? <NewinflowView /> :
           view === 'new-expense' ? <NewExpenseView /> :
           view === 'transaction-detail' ? (
             <TransactionDetailPage
               transaction={selectedTransaction}
               currencyCode={currencyCode}
               onClose={handleNavigateHome}
             />
           ) :
           view === 'libreta' ? <LibretaModule /> : 
           view === 'clients' ? <ClientsModule /> :
           view === 'settings' ? <SettingsModule /> : 
           view === 'inventory' ? <InventoryModule /> :
           view === 'reports' ? <ReportsModule /> :
           <DisabledModule name="Módulo desactivado" />}
        </main>
      </div>
      
      {/* Success Modal - Rendered at app root level */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('home');
        }}
        title={successModalTitle}
        message={successModalMessage}
        type={successModalType}
      />
      
      {/* Bottom Navigation Bar - Hidden on form pages and detail views */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50 safe-area-bottom">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex justify-around items-center">
            <button
              onClick={() => navigate('home')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                view === 'home' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <CashIcon className="w-6 h-6"/>
              <span className="text-xs font-medium">Inicio</span>
            </button>
            <button
              onClick={() => navigate('libreta')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                view === 'libreta' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <BookOpenIcon className="w-6 h-6"/>
              <span className="text-xs font-medium">Libreta</span>
            </button>
            <button
              onClick={() => navigate('inventory')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                view === 'inventory' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <InventoryIcon className="w-6 h-6"/>
              <span className="text-xs font-medium">Inventario</span>
            </button>
            <button
              onClick={() => navigate('reports')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                view === 'reports' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <ChartBarIcon className="w-6 h-6"/>
              <span className="text-xs font-medium">Reportes</span>
            </button>
          </div>
        </div>
      </nav>
      )}
      
      {/* Global Error Notifications */}
      <ErrorNotification />
    </div>
  );
}