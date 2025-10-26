// Main Application Logic

// Category Constants
const CATEGORIES = {
    income: [
        { value: 'sales', label: 'Ventas' },
        { value: 'services', label: 'Servicios' },
        { value: 'investment', label: 'Ingresos por Inversión' },
        { value: 'refund', label: 'Reembolso' },
        { value: 'other', label: 'Otros Ingresos' }
    ],
    expense: [
        { value: 'purchase', label: 'Compra' },
        { value: 'payroll', label: 'Nómina' },
        { value: 'rent', label: 'Alquiler' },
        { value: 'utilities', label: 'Servicios Públicos' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'supplies', label: 'Suministros de Oficina' },
        { value: 'other', label: 'Otros Gastos' }
    ]
};

// Filter Input IDs for bulk operations
const FILTER_IDS = [
    'categoryFilter',
    'categoryFilterMobile',
    'typeFilterMobile',
    'fromDate',
    'toDate',
    'fromDateMobile',
    'toDateMobile',
    'searchInput'
];

// Application State
const appState = {
    currentEntries: [],
    currentFilter: {},
    activeTab: 'all',
    isSubmitting: false,
    editingEntryId: null
};

/**
 * Initialize the application
 */
async function init() {
    console.log('Initializing Balance & Ledger application...');
    
    // Populate category filter dropdowns
    populateCategoryFilters();
    
    // Load sample data on first run
    const samplesLoaded = loadSampleData();
    if (samplesLoaded) {
        console.log('Sample data loaded for demonstration');
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    await loadEntries();
    
    console.log('Application initialized successfully');
}

/**
 * Populate category filter dropdowns with all available categories
 */
function populateCategoryFilters() {
    // Combine all unique categories from income and expense
    const allCategories = new Set();
    
    CATEGORIES.income.forEach(cat => allCategories.add(JSON.stringify(cat)));
    CATEGORIES.expense.forEach(cat => allCategories.add(JSON.stringify(cat)));
    
    // Convert back to objects and sort by label
    const uniqueCategories = Array.from(allCategories)
        .map(str => JSON.parse(str))
        .sort((a, b) => a.label.localeCompare(b.label));
    
    // Populate both desktop and mobile dropdowns
    const categoryFilterDesktop = document.getElementById('categoryFilter');
    const categoryFilterMobile = document.getElementById('categoryFilterMobile');
    
    const optionsHTML = uniqueCategories.map(cat => 
        `<option value="${cat.value}">${cat.label}</option>`
    ).join('');
    
    // Keep the "All Categories" / "Category" option and add the rest
    if (categoryFilterDesktop) {
        const defaultOption = categoryFilterDesktop.querySelector('option[value=""]');
        categoryFilterDesktop.innerHTML = defaultOption.outerHTML + optionsHTML;
    }
    
    if (categoryFilterMobile) {
        const defaultOption = categoryFilterMobile.querySelector('option[value=""]');
        categoryFilterMobile.innerHTML = defaultOption.outerHTML + optionsHTML;
    }
}


/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Header buttons
    document.getElementById('newEntryBtn').addEventListener('click', () => openForm('income'));
    document.getElementById('newExpenseBtn').addEventListener('click', () => openForm('expense'));
    document.getElementById('refreshBtn').addEventListener('click', loadEntries);

    // Export/Import buttons
    document.getElementById('exportJSONBtn')?.addEventListener('click', handleExportJSON);
    document.getElementById('exportCSVBtn')?.addEventListener('click', handleExportCSV);
    document.getElementById('importBtn')?.addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile')?.addEventListener('change', handleImport);

    // Export/Import dropdown toggle
    const exportImportBtn = document.getElementById('exportImportBtn');
    const exportImportMenu = document.getElementById('exportImportMenu');
    
    exportImportBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        exportImportMenu.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!exportImportMenu?.contains(e.target) && e.target !== exportImportBtn) {
            exportImportMenu?.classList.add('hidden');
        }
    });
    
    // Close dropdown after selecting an option
    exportImportMenu?.addEventListener('click', () => {
        exportImportMenu.classList.add('hidden');
    });

    // Tab buttons
    document.getElementById('tabAll').addEventListener('click', () => switchTab('all'));
    document.getElementById('tabIncome').addEventListener('click', () => switchTab('income'));
    document.getElementById('tabExpense').addEventListener('click', () => switchTab('expense'));

    // Desktop filters
    document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
        handleFilterChange('category', e.target.value);
    });
    document.getElementById('fromDate')?.addEventListener('change', (e) => {
        handleFilterChange('fromDate', e.target.value);
    });
    document.getElementById('toDate')?.addEventListener('change', (e) => {
        handleFilterChange('toDate', e.target.value);
    });
    document.getElementById('searchInput')?.addEventListener('input', debounce((e) => {
        handleFilterChange('search', e.target.value);
    }, 300));
    document.getElementById('clearFilters')?.addEventListener('click', clearFilters);

    // Mobile filters
    document.getElementById('categoryFilterMobile')?.addEventListener('change', (e) => {
        handleFilterChange('category', e.target.value);
    });
    document.getElementById('typeFilterMobile')?.addEventListener('change', (e) => {
        handleFilterChange('type', e.target.value);
    });
    document.getElementById('fromDateMobile')?.addEventListener('change', (e) => {
        handleFilterChange('fromDate', e.target.value);
    });
    document.getElementById('toDateMobile')?.addEventListener('change', (e) => {
        handleFilterChange('toDate', e.target.value);
    });
    document.getElementById('dateToggleMobile')?.addEventListener('click', () => {
        const dateInputs = document.getElementById('dateInputsMobile');
        dateInputs.classList.toggle('hidden');
    });
    document.getElementById('clearFiltersMobile')?.addEventListener('click', clearFilters);

    // Form modal
    document.getElementById('cancelFormBtn').addEventListener('click', closeForm);
    document.getElementById('balanceForm').addEventListener('submit', handleFormSubmit);

    // Close modal on background click
    document.getElementById('formModal').addEventListener('click', (e) => {
        if (e.target.id === 'formModal') {
            closeForm();
        }
    });

    // Event delegation for table actions (edit/delete)
    setupTableEventDelegation();

    // Window resize - re-render table when switching between mobile/desktop
    window.addEventListener('resize', debounce(() => {
        renderTable();
    }, 250));
}

/**
 * Set up event delegation for table actions
 */
function setupTableEventDelegation() {
    const tableContainer = document.getElementById('tableContainer');
    
    tableContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const action = target.dataset.action;
        
        if (!action) return;
        
        e.preventDefault();
        
        if (action === 'delete') {
            const id = target.dataset.id;
            const description = target.dataset.description || 'this transaction';
            await deleteEntry(id, description);
        } else if (action === 'edit') {
            const id = target.dataset.id;
            await editEntry(id);
        }
    });
}


/**
 * Load balance entries
 */
async function loadEntries() {
    try {
        showLoading();
        
        let filteredEntries = [];

        // Apply filters using optimized queries
        if (appState.currentFilter.fromDate && appState.currentFilter.toDate) {
            if (appState.currentFilter.type && appState.currentFilter.category) {
                filteredEntries = await balanceService.getBalanceEntriesByTypeAndDateRange(
                    appState.currentFilter.type, appState.currentFilter.fromDate, appState.currentFilter.toDate
                );
                filteredEntries = filteredEntries.filter(entry => entry.category === appState.currentFilter.category);
            } else if (appState.currentFilter.type) {
                filteredEntries = await balanceService.getBalanceEntriesByTypeAndDateRange(
                    appState.currentFilter.type, appState.currentFilter.fromDate, appState.currentFilter.toDate
                );
            } else if (appState.currentFilter.category) {
                filteredEntries = await balanceService.getBalanceEntriesByCategoryAndDateRange(
                    appState.currentFilter.category, appState.currentFilter.fromDate, appState.currentFilter.toDate
                );
            } else {
                filteredEntries = await balanceService.getBalanceEntriesByDateRange(
                    appState.currentFilter.fromDate, appState.currentFilter.toDate
                );
            }
        } else if (appState.currentFilter.type) {
            filteredEntries = await balanceService.getBalanceEntriesByType(appState.currentFilter.type);
            if (appState.currentFilter.category) {
                filteredEntries = filteredEntries.filter(entry => entry.category === appState.currentFilter.category);
            }
        } else if (appState.currentFilter.category) {
            filteredEntries = await balanceService.getBalanceEntriesByCategory(appState.currentFilter.category);
        } else {
            filteredEntries = await balanceService.getActiveBalanceEntries();
        }

        // Apply search filter client-side
        if (appState.currentFilter.search) {
            const searchLower = appState.currentFilter.search.toLowerCase();
            filteredEntries = filteredEntries.filter(entry =>
                entry.description.toLowerCase().includes(searchLower) ||
                (entry.reference && entry.reference.toLowerCase().includes(searchLower))
            );
        }

        appState.currentEntries = filteredEntries;

        // Get summary
        const summary = await balanceService.getBalanceSummary(
            appState.currentFilter.fromDate, 
            appState.currentFilter.toDate
        );

        // Update UI
        updateSummary(summary);
        updateTabCounts(appState.currentEntries);
        updateClearFiltersButton(appState.currentFilter);
        updateLastRefresh();
        renderTable();

    } catch (error) {
        console.error('Error loading entries:', error);
        showError('Error al cargar las entradas de balance. Por favor intenta nuevamente.');
    } finally {
        hideLoading();
    }
}

/**
 * Render the table based on active tab
 */
function renderTable() {
    let entriesToShow = appState.currentEntries;

    // Filter by active tab
    if (appState.activeTab === 'income') {
        entriesToShow = appState.currentEntries.filter(e => e.type === 'income');
    } else if (appState.activeTab === 'expense') {
        entriesToShow = appState.currentEntries.filter(e => e.type === 'expense');
    }

    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = renderBalanceTable(entriesToShow, deleteEntry);
}

/**
 * Switch active tab
 * @param {string} tab - Tab name (all/income/expense)
 */
function switchTab(tab) {
    appState.activeTab = tab;

    // Update tab buttons
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(t => {
        t.classList.remove('active', 'border-blue-500', 'text-blue-600');
        t.classList.add('border-transparent', 'text-gray-500');
    });

    const activeButton = document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
    activeButton.classList.remove('border-transparent', 'text-gray-500');

    // Update filter if needed
    if (tab === 'all') {
        delete appState.currentFilter.type;
    } else {
        appState.currentFilter.type = tab;
    }

    renderTable();
}

/**
 * Handle filter change
 * @param {string} field - Filter field
 * @param {string} value - Filter value
 */
function handleFilterChange(field, value) {
    if (value) {
        appState.currentFilter[field] = value;
    } else {
        delete appState.currentFilter[field];
    }

    // Sync mobile and desktop filters
    syncFilters();

    loadEntries();
}

/**
 * Sync filter values between mobile and desktop
 */
function syncFilters() {
    const filterMap = {
        categoryFilter: appState.currentFilter.category || '',
        categoryFilterMobile: appState.currentFilter.category || '',
        typeFilterMobile: appState.currentFilter.type || '',
        fromDate: appState.currentFilter.fromDate || '',
        toDate: appState.currentFilter.toDate || '',
        fromDateMobile: appState.currentFilter.fromDate || '',
        toDateMobile: appState.currentFilter.toDate || '',
        searchInput: appState.currentFilter.search || ''
    };

    // Apply values to all filter inputs
    Object.entries(filterMap).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
}

/**
 * Clear all filters
 */
function clearFilters() {
    appState.currentFilter = {};

    // Reset all filter inputs using the constant array
    FILTER_IDS.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        }
    });

    loadEntries();
}


/**
 * Open form modal
 * @param {string} type - Transaction type (income/expense)
 * @param {Object} entry - Optional entry data for editing
 */
function openForm(type = 'income', entry = null) {
    appState.editingEntryId = entry ? entry.id : null;
    
    // Populate category options based on type
    const categorySelect = document.getElementById('entryCategory');
    const categories = CATEGORIES[type];
    
    categorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat.value}">${cat.label}</option>`
    ).join('');
    
    if (entry) {
        // Editing existing entry
        document.getElementById('modalTitle').textContent = 
            entry.type === 'income' ? 'Editar Entrada de Ingreso' : 'Editar Entrada de Gasto';
        
        document.getElementById('entryType').value = entry.type;
        document.getElementById('entryDate').value = entry.date;
        document.getElementById('entryAmount').value = entry.amount;
        document.getElementById('entryCategory').value = entry.category;
        document.getElementById('entryReference').value = entry.reference || '';
        document.getElementById('entryDescription').value = entry.description;
        
        document.getElementById('submitFormBtn').textContent = 'Actualizar Transacción';
    } else {
        // Creating new entry
        document.getElementById('modalTitle').textContent = 
            type === 'income' ? 'Nueva Entrada de Ingreso' : 'Nueva Entrada de Gasto';
        
        document.getElementById('entryType').value = type;
        document.getElementById('entryDate').value = getCurrentDate();
        document.getElementById('entryAmount').value = '';
        document.getElementById('entryCategory').value = categories[0].value; // First category as default
        document.getElementById('entryReference').value = '';
        document.getElementById('entryDescription').value = '';
        
        document.getElementById('submitFormBtn').textContent = 'Guardar Transacción';
    }

    // Hide errors
    document.getElementById('formErrors').classList.add('hidden');

    // Show modal
    document.getElementById('formModal').classList.remove('hidden');
    
    // Focus first field
    setTimeout(() => {
        document.getElementById('entryDate').focus();
    }, 100);
}

/**
 * Close form modal
 */
function closeForm() {
    appState.editingEntryId = null;
    document.getElementById('formModal').classList.add('hidden');
    document.getElementById('balanceForm').reset();
    document.getElementById('formErrors').classList.add('hidden');
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    if (appState.isSubmitting) return;

    // Get form data
    let formData = {
        date: document.getElementById('entryDate').value,
        type: document.getElementById('entryType').value,
        amount: parseFloat(document.getElementById('entryAmount').value),
        category: document.getElementById('entryCategory').value,
        reference: document.getElementById('entryReference').value,
        description: document.getElementById('entryDescription').value,
        currency: 'USD'
    };

    // Sanitize input
    formData = sanitizeBalanceEntry(formData);

    // Validate
    const validation = validateBalanceEntry(formData);
    
    if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
    }

    try {
        appState.isSubmitting = true;
        document.getElementById('submitFormBtn').disabled = true;
        document.getElementById('submitFormBtn').textContent = appState.editingEntryId ? 'Actualizando...' : 'Guardando...';

        if (appState.editingEntryId) {
            // Update existing entry
            await balanceService.updateBalanceEntry(appState.editingEntryId, formData);
            showSuccess('Transacción actualizada exitosamente');
        } else {
            // Create new entry
            await balanceService.createBalanceEntry(formData);
            showSuccess('Transacción guardada exitosamente');
        }

        closeForm();
        await loadEntries();

    } catch (error) {
        console.error('Error saving transaction:', error);
        showError('Error al guardar la transacción. Por favor intenta nuevamente.');
    } finally {
        appState.isSubmitting = false;
        document.getElementById('submitFormBtn').disabled = false;
        document.getElementById('submitFormBtn').textContent = appState.editingEntryId ? 'Actualizar Transacción' : 'Guardar Transacción';
    }
}

/**
 * Show form errors
 * @param {Array} errors - Array of error messages
 */
function showFormErrors(errors) {
    const errorList = document.getElementById('errorList');
    errorList.innerHTML = errors.map(error => `<li>${error}</li>`).join('');
    document.getElementById('formErrors').classList.remove('hidden');
}


/**
 * Edit entry
 * @param {string} id - Entry ID
 */
async function editEntry(id) {
    try {
        const entry = await balanceService.getById(id);
        openForm(entry.type, entry);
    } catch (error) {
        console.error('Error loading entry for edit:', error);
        showError('Error al cargar la transacción. Por favor intenta nuevamente.');
    }
}

/**
 * Delete entry
 * @param {string} id - Entry ID
 * @param {string} description - Entry description for confirmation
 */
async function deleteEntry(id, description = 'this transaction') {
    // Create custom confirmation dialog
    const confirmed = await showConfirmDialog(
        'Eliminar Transacción',
        `¿Estás seguro de que deseas eliminar "${description}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) {
        return;
    }

    try {
        showLoading();
        await balanceService.softDelete(id);
        showSuccess('Transacción eliminada exitosamente');
        await loadEntries();
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showError('Error al eliminar la transacción. Por favor intenta nuevamente.');
    } finally {
        hideLoading();
    }
}

/**
 * Show confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @returns {Promise<boolean>} User's choice
 */
function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        // For now, use native confirm - can be enhanced with custom modal later
        const result = confirm(message);
        resolve(result);
    });
}


/**
 * Handle export to JSON
 */
async function handleExportJSON() {
    try {
        const entries = await balanceService.getActiveBalanceEntries();
        if (entries.length === 0) {
            showWarning('No hay transacciones para exportar');
            return;
        }
        exportToJSON(entries);
    } catch (error) {
        console.error('Error exporting to JSON:', error);
        showError('Error al exportar datos');
    }
}

/**
 * Handle export to CSV
 */
async function handleExportCSV() {
    try {
        const entries = await balanceService.getActiveBalanceEntries();
        if (entries.length === 0) {
            showWarning('No hay transacciones para exportar');
            return;
        }
        exportToCSV(entries);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        showError('Error al exportar datos');
    }
}

/**
 * Handle import from file
 * @param {Event} e - Change event
 */
async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        showLoading();
        
        let result;
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'json') {
            result = await importFromJSON(file);
        } else if (fileExtension === 'csv') {
            result = await importFromCSV(file);
        } else {
            showError('Formato de archivo no soportado. Por favor usa archivos JSON o CSV.');
            return;
        }
        
        if (!result.success) {
            showError(result.message || 'Error al importar datos');
            return;
        }
        
        // Show import summary
        if (result.invalidEntries > 0) {
            const proceed = confirm(
                `Resumen de Importación:\n\n` +
                `Total de entradas en el archivo: ${result.totalEntries}\n` +
                `Entradas válidas: ${result.validEntries.length}\n` +
                `Entradas inválidas: ${result.invalidEntries}\n\n` +
                `¿Deseas importar las ${result.validEntries.length} entradas válidas?`
            );
            
            if (!proceed) {
                showInfo('Importación cancelada');
                return;
            }
        }
        
        // Import valid entries
        let imported = 0;
        for (const entry of result.validEntries) {
            try {
                await balanceService.createBalanceEntry(entry);
                imported++;
            } catch (error) {
                console.error('Error importing entry:', error);
            }
        }
        
        showSuccess(
            `Se importaron exitosamente ${imported} de ${result.totalEntries} transacciones` +
            (result.invalidEntries > 0 ? ` (${result.invalidEntries} omitidas por errores)` : '')
        );
        
        await loadEntries();
        
    } catch (error) {
        console.error('Error importing file:', error);
        showError('Error al importar datos. Por favor verifica el formato del archivo.');
    } finally {
        hideLoading();
        // Reset file input
        e.target.value = '';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

