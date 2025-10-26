// Utility Functions

// Constants for validation
const VALIDATION_CONSTANTS = {
    MAX_AMOUNT: 999999999.99,
    MIN_AMOUNT: 0.01,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_REFERENCE_LENGTH: 100,
    DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/
};

// UI Constants - Badge Colors and Styling
const UI_CONSTANTS = {
    categoryBadges: {
        // Income categories
        sales: 'bg-blue-100 text-blue-800',
        services: 'bg-cyan-100 text-cyan-800',
        investment: 'bg-emerald-100 text-emerald-800',
        refund: 'bg-teal-100 text-teal-800',
        // Expense categories
        purchase: 'bg-purple-100 text-purple-800',
        payroll: 'bg-rose-100 text-rose-800',
        rent: 'bg-orange-100 text-orange-800',
        utilities: 'bg-amber-100 text-amber-800',
        marketing: 'bg-pink-100 text-pink-800',
        supplies: 'bg-violet-100 text-violet-800',
        // Common
        adjustment: 'bg-yellow-100 text-yellow-800',
        manual: 'bg-gray-100 text-gray-800',
        other: 'bg-indigo-100 text-indigo-800'
    },
    statusBadges: {
        completed: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800'
    },
    typeColors: {
        income: 'text-green-600 bg-green-50',
        expense: 'text-red-600 bg-red-50'
    },
    toastIcons: {
        success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>`,
        error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>`,
        warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>`,
        info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
               </svg>`
    },
    toastStyles: {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    }
};

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Sanitize input text
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum length
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, maxLength = null) {
    if (typeof input !== 'string') return '';
    
    // Remove any HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Limit length if specified
    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
}

/**
 * Validate balance entry data
 * @param {Object} data - Entry data to validate
 * @returns {Object} Validation result { isValid: boolean, errors: string[] }
 */
function validateBalanceEntry(data) {
    const errors = [];
    
    // Validate date
    if (!data.date) {
        errors.push('La fecha es requerida');
    } else if (!VALIDATION_CONSTANTS.DATE_FORMAT.test(data.date)) {
        errors.push('Formato de fecha inválido');
    } else {
        const entryDate = new Date(data.date);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        if (isNaN(entryDate.getTime())) {
            errors.push('Fecha inválida');
        } else if (entryDate > today) {
            errors.push('La fecha no puede estar en el futuro');
        }
    }
    
    // Validate amount
    if (data.amount === undefined || data.amount === null || data.amount === '') {
        errors.push('El monto es requerido');
    } else {
        const amount = parseFloat(data.amount);
        if (isNaN(amount)) {
            errors.push('El monto debe ser un número válido');
        } else if (amount < VALIDATION_CONSTANTS.MIN_AMOUNT) {
            errors.push(`El monto debe ser al menos $${VALIDATION_CONSTANTS.MIN_AMOUNT}`);
        } else if (amount > VALIDATION_CONSTANTS.MAX_AMOUNT) {
            errors.push(`El monto no puede exceder $${formatNumber(VALIDATION_CONSTANTS.MAX_AMOUNT)}`);
        }
    }
    
    // Validate type
    if (!data.type) {
        errors.push('El tipo de transacción es requerido');
    } else if (!['income', 'expense'].includes(data.type)) {
        errors.push('Tipo de transacción inválido');
    }
    
    // Validate category
    const validCategories = [
        // Income categories
        'sales', 'services', 'investment', 'refund',
        // Expense categories
        'purchase', 'payroll', 'rent', 'utilities', 'marketing', 'supplies',
        // Common
        'adjustment', 'manual', 'other'
    ];
    if (!data.category) {
        errors.push('La categoría es requerida');
    } else if (!validCategories.includes(data.category)) {
        errors.push('Categoría inválida');
    }
    
    // Validate description
    if (!data.description || !data.description.trim()) {
        errors.push('La descripción es requerida');
    } else if (data.description.length > VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH) {
        errors.push(`La descripción no puede exceder ${VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH} caracteres`);
    }
    
    // Validate reference (optional)
    if (data.reference && data.reference.length > VALIDATION_CONSTANTS.MAX_REFERENCE_LENGTH) {
        errors.push(`La referencia no puede exceder ${VALIDATION_CONSTANTS.MAX_REFERENCE_LENGTH} caracteres`);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Sanitize balance entry data
 * @param {Object} data - Entry data to sanitize
 * @returns {Object} Sanitized data
 */
function sanitizeBalanceEntry(data) {
    return {
        date: data.date ? data.date.trim() : '',
        type: data.type ? data.type.trim().toLowerCase() : '',
        amount: data.amount,
        category: data.category ? data.category.trim().toLowerCase() : '',
        description: sanitizeInput(data.description, VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH),
        reference: sanitizeInput(data.reference || '', VALIDATION_CONSTANTS.MAX_REFERENCE_LENGTH),
        currency: data.currency || 'USD'
    };
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format date string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!date) return '';
    
    let dateObj;
    
    // Handle YYYY-MM-DD string format to avoid timezone issues
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-').map(Number);
        // Create date in local timezone to avoid UTC conversion issues
        dateObj = new Date(year, month - 1, day);
    } else {
        dateObj = typeof date === 'string' ? new Date(date) : date;
    }
    
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(dateObj);
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile
 */
function isMobile() {
    return window.innerWidth < 768;
}

/**
 * Show loading spinner
 */
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
        loading.classList.add('flex');
    }
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast transform transition-all duration-300 translate-x-full opacity-0';
    
    toast.innerHTML = `
        <div class="${UI_CONSTANTS.toastStyles[type]} rounded-lg shadow-lg px-4 py-3 flex items-center space-x-3 min-w-[300px] max-w-md">
            <div class="flex-shrink-0">${UI_CONSTANTS.toastIcons[type]}</div>
            <div class="flex-1 text-sm font-medium">${escapeHtml(message)}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 hover:opacity-75">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        });
    });
    
    // Auto remove after duration
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

/**
 * Show error message
 * @param {string} message - Error message to display
 * @param {number} duration - Duration in milliseconds
 */
function showError(message, duration = 4000) {
    showToast(message, 'error', duration);
    console.error('Error:', message);
}

/**
 * Show success message
 * @param {string} message - Success message to display
 * @param {number} duration - Duration in milliseconds
 */
function showSuccess(message, duration = 3000) {
    showToast(message, 'success', duration);
    console.log('Success:', message);
}

/**
 * Show warning message
 * @param {string} message - Warning message to display
 * @param {number} duration - Duration in milliseconds
 */
function showWarning(message, duration = 3500) {
    showToast(message, 'warning', duration);
    console.warn('Warning:', message);
}

/**
 * Show info message
 * @param {string} message - Info message to display
 * @param {number} duration - Duration in milliseconds
 */
function showInfo(message, duration = 3000) {
    showToast(message, 'info', duration);
    console.info('Info:', message);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Export data to JSON file
 * @param {Array} data - Data to export
 * @param {string} filename - Filename for export
 */
function exportToJSON(data, filename = `balance-export-${Date.now()}.json`) {
    try {
        const exportData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            totalEntries: data.length,
            entries: data
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess(`${data.length} transacciones exportadas a ${filename}`);
        return true;
    } catch (error) {
        console.error('Error exporting to JSON:', error);
        showError('Error al exportar datos. Por favor intenta nuevamente.');
        return false;
    }
}

/**
 * Export data to CSV file
 * @param {Array} data - Data to export
 * @param {string} filename - Filename for export
 */
function exportToCSV(data, filename = `balance-export-${Date.now()}.csv`) {
    try {
        if (data.length === 0) {
            showWarning('No hay datos para exportar');
            return false;
        }

        // CSV Headers
        const headers = ['Fecha', 'Tipo', 'Monto', 'Categoría', 'Descripción', 'Referencia', 'Estado'];
        
        // Convert data to CSV rows
        const csvRows = data.map(entry => {
            return [
                entry.date,
                entry.type,
                entry.amount,
                entry.category,
                `"${(entry.description || '').replace(/"/g, '""')}"`, // Escape quotes
                `"${(entry.reference || '').replace(/"/g, '""')}"`,
                entry.status || 'completed'
            ].join(',');
        });
        
        // Combine headers and rows
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess(`${data.length} transacciones exportadas a ${filename}`);
        return true;
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        showError('Error al exportar datos. Por favor intenta nuevamente.');
        return false;
    }
}

/**
 * Import data from JSON file
 * @param {File} file - File to import
 * @returns {Promise<Object>} Import result
 */
async function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const content = e.target.result;
                const importData = JSON.parse(content);
                
                // Validate import data structure
                if (!importData.entries || !Array.isArray(importData.entries)) {
                    throw new Error('Formato de archivo inválido: falta el array de entradas');
                }
                
                // Validate and sanitize each entry
                const validEntries = [];
                const errors = [];
                
                for (let i = 0; i < importData.entries.length; i++) {
                    const entry = importData.entries[i];
                    
                    // Sanitize
                    const sanitized = sanitizeBalanceEntry({
                        date: entry.date,
                        type: entry.type,
                        amount: entry.amount,
                        category: entry.category,
                        description: entry.description,
                        reference: entry.reference || '',
                        currency: entry.currency || 'USD'
                    });
                    
                    // Validate
                    const validation = validateBalanceEntry(sanitized);
                    
                    if (validation.isValid) {
                        validEntries.push(sanitized);
                    } else {
                        errors.push({
                            index: i + 1,
                            errors: validation.errors
                        });
                    }
                }
                
                resolve({
                    success: true,
                    totalEntries: importData.entries.length,
                    validEntries,
                    invalidEntries: errors.length,
                    errors,
                    version: importData.version
                });
                
            } catch (error) {
                reject({
                    success: false,
                    message: error.message
                });
            }
        };
        
        reader.onerror = () => {
            reject({
                success: false,
                message: 'Error al leer el archivo'
            });
        };
        
        reader.readAsText(file);
    });
}

/**
 * Import data from CSV file
 * @param {File} file - File to import
 * @returns {Promise<Object>} Import result
 */
async function importFromCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const content = e.target.result;
                const lines = content.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    throw new Error('El archivo CSV está vacío o es inválido');
                }
                
                // Skip header row
                const dataLines = lines.slice(1);
                
                const validEntries = [];
                const errors = [];
                
                for (let i = 0; i < dataLines.length; i++) {
                    try {
                        // Parse CSV line (basic parsing, doesn't handle all edge cases)
                        const values = dataLines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                        
                        if (values.length < 6) {
                            errors.push({
                                index: i + 2, // +2 because we skipped header and arrays are 0-indexed
                                errors: ['Formato CSV inválido: no hay suficientes columnas']
                            });
                            continue;
                        }
                        
                        const entry = {
                            date: values[0],
                            type: values[1],
                            amount: parseFloat(values[2]),
                            category: values[3],
                            description: values[4],
                            reference: values[5] || '',
                            currency: 'USD'
                        };
                        
                        // Sanitize
                        const sanitized = sanitizeBalanceEntry(entry);
                        
                        // Validate
                        const validation = validateBalanceEntry(sanitized);
                        
                        if (validation.isValid) {
                            validEntries.push(sanitized);
                        } else {
                            errors.push({
                                index: i + 2,
                                errors: validation.errors
                            });
                        }
                    } catch (error) {
                        errors.push({
                            index: i + 2,
                            errors: [error.message]
                        });
                    }
                }
                
                resolve({
                    success: true,
                    totalEntries: dataLines.length,
                    validEntries,
                    invalidEntries: errors.length,
                    errors
                });
                
            } catch (error) {
                reject({
                    success: false,
                    message: error.message
                });
            }
        };
        
        reader.onerror = () => {
            reject({
                success: false,
                message: 'Error al leer el archivo'
            });
        };
        
        reader.readAsText(file);
    });
}

/**
 * Get badge color class for category
 * @param {string} category - Category type
 * @returns {string} Tailwind CSS classes
 */
function getCategoryBadge(category) {
    return UI_CONSTANTS.categoryBadges[category] || UI_CONSTANTS.categoryBadges.other;
}

/**
 * Get badge color class for status
 * @param {string} status - Status type
 * @returns {string} Tailwind CSS classes
 */
function getStatusBadge(status) {
    return UI_CONSTANTS.statusBadges[status] || UI_CONSTANTS.statusBadges.completed;
}

/**
 * Get color class for transaction type
 * @param {string} type - Transaction type (income/expense)
 * @returns {string} Tailwind CSS classes
 */
function getTypeColor(type) {
    return UI_CONSTANTS.typeColors[type] || UI_CONSTANTS.typeColors.income;
}
