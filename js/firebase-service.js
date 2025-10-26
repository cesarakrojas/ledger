// Base Memory Storage Service Class
class MemoryStorageService {
    constructor(collectionName) {
        this.collectionName = collectionName;
        // Initialize in-memory storage
        if (!window.memoryDB) {
            window.memoryDB = {};
        }
        if (!window.memoryDB[collectionName]) {
            window.memoryDB[collectionName] = [];
        }
        this.storage = window.memoryDB[collectionName];
        this.nextId = 1;
    }

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `${this.collectionName}_${Date.now()}_${this.nextId++}`;
    }

    /**
     * Get current timestamp
     * @returns {string} ISO timestamp
     */
    getCurrentTimestamp() {
        return new Date().toISOString();
    }

    /**
     * Create a new document
     * @param {Object} data - Document data
     * @returns {Promise<Object>} Created document
     */
    async create(data) {
        try {
            const now = this.getCurrentTimestamp();
            const docData = {
                id: this.generateId(),
                ...data,
                createdAt: now,
                updatedAt: now,
                isDeleted: false
            };

            this.storage.push(docData);
            return { ...docData };
        } catch (error) {
            console.error('Error creating document:', error);
            throw error;
        }
    }

    /**
     * Get document by ID
     * @param {string} id - Document ID
     * @returns {Promise<Object>} Document data
     */
    async getById(id) {
        try {
            const doc = this.storage.find(item => item.id === id);
            if (!doc) {
                throw new Error('Document not found');
            }
            return { ...doc };
        } catch (error) {
            console.error('Error getting document:', error);
            throw error;
        }
    }

    /**
     * Update document
     * @param {string} id - Document ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Updated document
     */
    async update(id, data) {
        try {
            const index = this.storage.findIndex(item => item.id === id);
            if (index === -1) {
                throw new Error('Document not found');
            }

            const updateData = {
                ...this.storage[index],
                ...data,
                updatedAt: this.getCurrentTimestamp()
            };

            this.storage[index] = updateData;
            return { ...updateData };
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    }

    /**
     * Soft delete document
     * @param {string} id - Document ID
     * @returns {Promise<boolean>} Success status
     */
    async softDelete(id) {
        try {
            await this.update(id, { isDeleted: true });
            return true;
        } catch (error) {
            console.error('Error soft deleting document:', error);
            throw error;
        }
    }

    /**
     * Hard delete document
     * @param {string} id - Document ID
     * @returns {Promise<boolean>} Success status
     */
    async delete(id) {
        try {
            const index = this.storage.findIndex(item => item.id === id);
            if (index === -1) {
                throw new Error('Document not found');
            }
            this.storage.splice(index, 1);
            return true;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    /**
     * Apply filters to dataset
     * @param {Array} data - Data array
     * @param {Array} filters - Filter conditions
     * @returns {Array} Filtered data
     */
    applyFilters(data, filters = []) {
        return data.filter(item => {
            return filters.every(filter => {
                const value = item[filter.field];
                switch (filter.operator) {
                    case '==':
                        return value === filter.value;
                    case '!=':
                        return value !== filter.value;
                    case '>':
                        return value > filter.value;
                    case '>=':
                        return value >= filter.value;
                    case '<':
                        return value < filter.value;
                    case '<=':
                        return value <= filter.value;
                    default:
                        return true;
                }
            });
        });
    }

    /**
     * Apply sorting to dataset
     * @param {Array} data - Data array
     * @param {Object} orderBy - Sort configuration
     * @returns {Array} Sorted data
     */
    applySort(data, orderBy) {
        if (!orderBy) return data;

        return [...data].sort((a, b) => {
            const aVal = a[orderBy.field];
            const bVal = b[orderBy.field];
            const direction = orderBy.direction === 'desc' ? -1 : 1;

            // Primary sort by specified field
            if (aVal < bVal) return -1 * direction;
            if (aVal > bVal) return 1 * direction;
            
            // Secondary sort by createdAt (newest first) when primary values are equal
            if (aVal === bVal && a.createdAt && b.createdAt) {
                // Always sort by createdAt DESC so newest entries appear first
                if (a.createdAt < b.createdAt) return 1;
                if (a.createdAt > b.createdAt) return -1;
            }
            
            return 0;
        });
    }

    /**
     * Get all active documents (not deleted)
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async getActive(options = {}) {
        try {
            let results = this.storage.filter(item => item.isDeleted === false);

            // Apply additional filters
            if (options.filters) {
                results = this.applyFilters(results, options.filters);
            }

            // Apply ordering
            if (options.orderBy) {
                results = this.applySort(results, options.orderBy);
            }

            // Apply limit
            if (options.limit) {
                results = results.slice(0, options.limit);
            }

            return results.map(item => ({ ...item }));
        } catch (error) {
            console.error('Error getting active documents:', error);
            throw error;
        }
    }

    /**
     * Get all documents with custom query
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async getAll(options = {}) {
        try {
            let results = [...this.storage];

            // Apply filters
            if (options.filters) {
                results = this.applyFilters(results, options.filters);
            }

            // Apply ordering
            if (options.orderBy) {
                results = this.applySort(results, options.orderBy);
            }

            // Apply limit
            if (options.limit) {
                results = results.slice(0, options.limit);
            }

            return results.map(item => ({ ...item }));
        } catch (error) {
            console.error('Error getting documents:', error);
            throw error;
        }
    }
}
