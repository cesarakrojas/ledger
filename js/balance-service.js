// Balance Service - extends MemoryStorageService
class BalanceService extends MemoryStorageService {
    constructor() {
        super('balanceEntries');
    }

    /**
     * Create a new balance entry
     * @param {Object} formData - Form data
     * @returns {Promise<Object>} Created entry
     */
    async createBalanceEntry(formData) {
        try {
            const amount = typeof formData.amount === 'string' 
                ? parseFloat(formData.amount) || 0 
                : formData.amount;

            const balanceEntry = {
                category: formData.category,
                description: formData.description,
                amount: amount,
                date: formData.date,
                type: formData.type,
                reference: formData.reference || '',
                status: 'completed',
                currency: formData.currency || 'USD',
                isDeleted: false
            };

            return await this.create(balanceEntry);
        } catch (error) {
            console.error('Error creating balance entry:', error);
            throw error;
        }
    }

    /**
     * Update balance entry
     * @param {string} id - Entry ID
     * @param {Object} formData - Form data
     * @returns {Promise<Object>} Updated entry
     */
    async updateBalanceEntry(id, formData) {
        try {
            const amount = formData.amount !== undefined
                ? (typeof formData.amount === 'string' ? parseFloat(formData.amount) || 0 : formData.amount)
                : undefined;

            const updateData = { ...formData };
            if (amount !== undefined) {
                updateData.amount = amount;
            }

            return await this.update(id, updateData);
        } catch (error) {
            console.error('Error updating balance entry:', error);
            throw error;
        }
    }

    /**
     * Get balance entries by category
     * @param {string} category - Category name
     * @returns {Promise<Array>} Array of entries
     */
    async getBalanceEntriesByCategory(category) {
        return await this.getAll({
            filters: [
                { field: 'isDeleted', operator: '==', value: false },
                { field: 'category', operator: '==', value: category }
            ],
            orderBy: { field: 'date', direction: 'desc' }
        });
    }

    /**
     * Get balance entries by type
     * @param {string} type - Type (income/expense)
     * @returns {Promise<Array>} Array of entries
     */
    async getBalanceEntriesByType(type) {
        return await this.getAll({
            filters: [
                { field: 'isDeleted', operator: '==', value: false },
                { field: 'type', operator: '==', value: type }
            ],
            orderBy: { field: 'date', direction: 'desc' }
        });
    }

    /**
     * Get income entries
     * @returns {Promise<Array>} Array of income entries
     */
    async getIncomeEntries() {
        return await this.getBalanceEntriesByType('income');
    }

    /**
     * Get expense entries
     * @returns {Promise<Array>} Array of expense entries
     */
    async getExpenseEntries() {
        return await this.getBalanceEntriesByType('expense');
    }

    /**
     * Get balance entries by date range
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Promise<Array>} Array of entries
     */
    async getBalanceEntriesByDateRange(startDate, endDate) {
        return await this.getAll({
            filters: [
                { field: 'isDeleted', operator: '==', value: false },
                { field: 'date', operator: '>=', value: startDate },
                { field: 'date', operator: '<=', value: endDate }
            ],
            orderBy: { field: 'date', direction: 'desc' }
        });
    }

    /**
     * Get balance entries by type and date range
     * @param {string} type - Type (income/expense)
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Promise<Array>} Array of entries
     */
    async getBalanceEntriesByTypeAndDateRange(type, startDate, endDate) {
        return await this.getAll({
            filters: [
                { field: 'isDeleted', operator: '==', value: false },
                { field: 'type', operator: '==', value: type },
                { field: 'date', operator: '>=', value: startDate },
                { field: 'date', operator: '<=', value: endDate }
            ],
            orderBy: { field: 'date', direction: 'desc' }
        });
    }

    /**
     * Get balance entries by category and date range
     * @param {string} category - Category
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Promise<Array>} Array of entries
     */
    async getBalanceEntriesByCategoryAndDateRange(category, startDate, endDate) {
        return await this.getAll({
            filters: [
                { field: 'isDeleted', operator: '==', value: false },
                { field: 'category', operator: '==', value: category },
                { field: 'date', operator: '>=', value: startDate },
                { field: 'date', operator: '<=', value: endDate }
            ],
            orderBy: { field: 'date', direction: 'desc' }
        });
    }

    /**
     * Search balance entries
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Array of matching entries
     */
    async searchBalanceEntries(searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const results = await this.getActive();

        return results.filter(entry =>
            entry.description.toLowerCase().includes(searchTermLower) ||
            (entry.reference && entry.reference.toLowerCase().includes(searchTermLower)) ||
            entry.category.toLowerCase().includes(searchTermLower)
        );
    }

    /**
     * Get active balance entries
     * @param {Array} additionalFilters - Additional filters
     * @returns {Promise<Array>} Array of entries
     */
    async getActiveBalanceEntries(additionalFilters = []) {
        return await this.getActive({
            filters: additionalFilters,
            orderBy: { field: 'date', direction: 'desc' }
        });
    }

    /**
     * Get balance summary
     * @param {string} startDate - Optional start date
     * @param {string} endDate - Optional end date
     * @returns {Promise<Object>} Summary object
     */
    async getBalanceSummary(startDate, endDate) {
        try {
            let entries = await this.getActiveBalanceEntries();

            if (startDate && endDate) {
                entries = entries.filter(entry =>
                    entry.date >= startDate && entry.date <= endDate
                );
            }

            const income = entries.filter(entry => entry.type === 'income');
            const expenses = entries.filter(entry => entry.type === 'expense');

            const totalIncome = income.reduce((sum, entry) => sum + entry.amount, 0);
            const totalExpenses = expenses.reduce((sum, entry) => sum + entry.amount, 0);
            const netIncome = totalIncome - totalExpenses;

            return {
                totalIncome,
                totalExpenses,
                netIncome,
                entriesCount: entries.length
            };
        } catch (error) {
            console.error('Error getting balance summary:', error);
            return {
                totalIncome: 0,
                totalExpenses: 0,
                netIncome: 0,
                entriesCount: 0
            };
        }
    }

    /**
     * Get balance by category breakdown
     * @param {string} startDate - Optional start date
     * @param {string} endDate - Optional end date
     * @returns {Promise<Object>} Category breakdown
     */
    async getBalanceByCategoryBreakdown(startDate, endDate) {
        try {
            let entries = await this.getActiveBalanceEntries();

            if (startDate && endDate) {
                entries = entries.filter(entry =>
                    entry.date >= startDate && entry.date <= endDate
                );
            }

            const breakdown = {};

            entries.forEach(entry => {
                if (!breakdown[entry.category]) {
                    breakdown[entry.category] = { income: 0, expenses: 0, net: 0 };
                }

                if (entry.type === 'income') {
                    breakdown[entry.category].income += entry.amount;
                } else {
                    breakdown[entry.category].expenses += entry.amount;
                }

                breakdown[entry.category].net =
                    breakdown[entry.category].income - breakdown[entry.category].expenses;
            });

            return breakdown;
        } catch (error) {
            console.error('Error getting category breakdown:', error);
            return {};
        }
    }

    /**
     * Record purchase transaction
     * @param {string} purchaseId - Purchase ID
     * @param {number} amount - Amount
     * @param {string} description - Description
     * @param {string} date - Optional date
     * @returns {Promise<Object>} Created entry
     */
    async recordPurchaseTransaction(purchaseId, amount, description, date) {
        const formData = {
            date: date || getCurrentDate(),
            type: 'expense',
            amount,
            category: 'purchase',
            reference: purchaseId,
            description,
            currency: 'USD'
        };

        return await this.createBalanceEntry(formData);
    }

    /**
     * Record sale transaction
     * @param {string} saleId - Sale ID
     * @param {number} amount - Amount
     * @param {string} description - Description
     * @param {string} date - Optional date
     * @returns {Promise<Object>} Created entry
     */
    async recordSaleTransaction(saleId, amount, description, date) {
        const formData = {
            date: date || getCurrentDate(),
            type: 'income',
            amount,
            category: 'sales',
            reference: saleId,
            description,
            currency: 'USD'
        };

        return await this.createBalanceEntry(formData);
    }

    /**
     * Cancel sale transaction
     * @param {string} saleId - Sale ID
     * @returns {Promise<boolean>} Success status
     */
    async cancelSaleTransaction(saleId) {
        try {
            const saleTransactions = await this.getAll({
                filters: [
                    { field: 'isDeleted', operator: '==', value: false },
                    { field: 'reference', operator: '==', value: saleId },
                    { field: 'category', operator: '==', value: 'sales' }
                ]
            });

            if (saleTransactions.length === 0) {
                return false;
            }

            for (const transaction of saleTransactions) {
                await this.softDelete(transaction.id);
            }

            return true;
        } catch (error) {
            console.error('Error canceling sale transaction:', error);
            return false;
        }
    }
}

// Create singleton instance
const balanceService = new BalanceService();
