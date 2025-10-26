// UI Components

// SVG Icon Constants
const ICONS = {
    income: `<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
             </svg>`,
    expense: `<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>`
};

/**
 * Format amount with sign and styling
 * @param {Object} entry - Transaction entry
 * @returns {Object} Amount display data
 */
function getAmountDisplay(entry) {
    const sign = entry.type === 'income' ? '+' : '-';
    const color = entry.type === 'income' ? 'text-green-600' : 'text-red-600';
    const bgColor = entry.type === 'income' ? 'bg-green-100' : 'bg-red-100';
    return { sign, color, bgColor, formatted: formatCurrency(entry.amount) };
}

/**
 * Render mobile transaction card
 * @param {Object} entry - Transaction entry
 * @returns {string} HTML string
 */
function renderMobileCard(entry) {
    const amount = getAmountDisplay(entry);
    
    return `
        <div class="flex items-start py-4 border-b border-gray-100 last:border-b-0" data-entry-id="${entry.id}">
            <!-- Left: Colored Circle Indicator -->
            <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${amount.bgColor} mr-3">
                ${ICONS[entry.type]}
            </div>
            
            <!-- Middle: Description + Date + Actions -->
            <div class="flex-1 min-w-0 mr-3">
                <h3 class="font-medium text-base text-gray-900 truncate">
                    ${escapeHtml(entry.description)}
                </h3>
                <div class="text-xs text-gray-500 mt-0.5">
                    ${formatDate(entry.date)}
                </div>
                <div class="mt-1 flex items-center gap-2">
                    <button 
                        data-action="edit" 
                        data-id="${entry.id}"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        aria-label="Editar transacción">
                        Editar
                    </button>
                    <button 
                        data-action="delete" 
                        data-id="${entry.id}"
                        data-description="${escapeHtml(entry.description)}"
                        class="text-red-600 hover:text-red-800 text-sm font-medium"
                        aria-label="Eliminar transacción">
                        Eliminar
                    </button>
                </div>
            </div>
            
            <!-- Right: Amount + Category Badge -->
            <div class="flex-shrink-0 text-right">
                <div class="font-bold text-lg ${amount.color}">
                    ${amount.sign}${amount.formatted}
                </div>
                <div class="mt-1.5 flex justify-end">
                    <span class="inline-flex px-2 py-0.5 text-xs font-medium rounded ${getCategoryBadge(entry.category)}">
                        ${entry.category}
                    </span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render desktop table row
 * @param {Object} entry - Transaction entry
 * @returns {string} HTML string
 */
function renderDesktopRow(entry) {
    const amount = getAmountDisplay(entry);
    
    return `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatDate(entry.date)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(entry.type)}">
                    ${amount.sign} ${entry.type}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <span class="${amount.color}">
                    ${amount.sign}${amount.formatted}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(entry.category)}">
                    ${entry.category}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                ${entry.description}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${entry.reference ? `
                    <span class="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                        ${entry.reference}
                    </span>
                ` : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                    data-action="delete" 
                    data-id="${entry.id}"
                    data-description="${escapeHtml(entry.description)}"
                    class="text-red-600 hover:text-red-900 mr-3 transition-colors"
                    aria-label="Eliminar transacción">
                    Eliminar
                </button>
                <button 
                    data-action="edit" 
                    data-id="${entry.id}"
                    class="text-blue-600 hover:text-blue-900 transition-colors"
                    aria-label="Editar transacción">
                    Editar
                </button>
            </td>
        </tr>
    `;
}

/**
 * Render balance table (mobile and desktop)
 * @param {Array} entries - Balance entries
 * @param {Function} onDelete - Delete callback
 * @returns {string} HTML string
 */
function renderBalanceTable(entries, onDelete) {
    if (entries.length === 0) {
        return `
            <div class="text-center py-12">
                <div class="text-gray-400 text-lg mb-2">No se encontraron transacciones</div>
                <div class="text-gray-500">Comienza registrando tu primera transacción</div>
            </div>
        `;
    }

    const mobile = isMobile();

    if (mobile) {
        // Mobile Layout - Clean Card Design
        return `
            <div class="space-y-0">
                ${entries.map(entry => renderMobileCard(entry)).join('')}
            </div>
        `;
    }

    // Desktop Layout - Table
    return `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${entries.map(entry => renderDesktopRow(entry)).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Update summary cards
 * @param {Object} summary - Summary data
 */
function updateSummary(summary) {
    // Update amounts
    document.getElementById('totalIncome').textContent = formatCurrency(summary.totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(summary.totalExpenses);
    document.getElementById('netBalance').textContent = formatCurrency(Math.abs(summary.netIncome));

    // Update net balance card styling
    const netBalanceCard = document.getElementById('netBalanceCard');
    const netBalanceIcon = document.getElementById('netBalanceIcon');
    const netBalanceAmount = document.getElementById('netBalance');

    if (summary.netIncome >= 0) {
        netBalanceCard.className = 'bg-blue-50 border border-blue-100 rounded-lg p-4';
        netBalanceIcon.className = 'text-blue-600 text-3xl';
        netBalanceIcon.textContent = '↗';
        netBalanceAmount.className = 'text-2xl font-bold text-blue-800';
    } else {
        netBalanceCard.className = 'bg-orange-50 border border-orange-100 rounded-lg p-4';
        netBalanceIcon.className = 'text-orange-600 text-3xl';
        netBalanceIcon.textContent = '↘';
        netBalanceAmount.className = 'text-2xl font-bold text-orange-800';
    }

    // Update health indicator
    const healthIndicator = document.getElementById('healthIndicator');
    if (summary.netIncome >= summary.totalIncome * 0.2) {
        healthIndicator.textContent = 'Excelente';
        healthIndicator.className = 'font-medium text-green-600';
    } else if (summary.netIncome >= 0) {
        healthIndicator.textContent = 'Buena';
        healthIndicator.className = 'font-medium text-yellow-600';
    } else {
        healthIndicator.textContent = 'Requiere Atención';
        healthIndicator.className = 'font-medium text-red-600';
    }

    // Update profit margin
    if (summary.totalIncome > 0) {
        const profitMargin = ((summary.netIncome / summary.totalIncome) * 100).toFixed(1);
        document.getElementById('profitMargin').textContent = profitMargin;

        const profitBar = document.getElementById('profitBar');
        const percentage = Math.min(Math.abs((summary.netIncome / summary.totalIncome) * 100), 100);
        profitBar.style.width = `${percentage}%`;
        profitBar.className = `h-2 rounded-full ${summary.netIncome >= 0 ? 'bg-green-500' : 'bg-red-500'}`;
    } else {
        document.getElementById('profitMargin').textContent = '0.0';
        document.getElementById('profitBar').style.width = '0%';
    }
}

/**
 * Update transaction counts in tabs
 * @param {Array} entries - All entries
 */
function updateTabCounts(entries) {
    const allCount = entries.length;
    const incomeCount = entries.filter(e => e.type === 'income').length;
    const expenseCount = entries.filter(e => e.type === 'expense').length;

    document.getElementById('countAll').textContent = allCount;
    document.getElementById('countIncome').textContent = incomeCount;
    document.getElementById('countExpense').textContent = expenseCount;
}

/**
 * Show/hide clear filters button
 * @param {Object} filters - Current filters
 */
function updateClearFiltersButton(filters) {
    const hasFilters = Object.keys(filters).some(key => filters[key]);
    
    const clearFilters = document.getElementById('clearFilters');
    const clearFiltersMobile = document.getElementById('clearFiltersMobile');
    
    if (hasFilters) {
        clearFilters?.classList.remove('hidden');
        clearFiltersMobile?.classList.remove('hidden');
    } else {
        clearFilters?.classList.add('hidden');
        clearFiltersMobile?.classList.add('hidden');
    }
}

/**
 * Update last refresh time
 */
function updateLastRefresh() {
    const lastRefresh = document.getElementById('lastRefresh');
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    lastRefresh.textContent = `Última actualización: ${timeString}`;
}
