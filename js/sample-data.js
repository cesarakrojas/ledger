// Sample Data for Demo Purposes
// This will pre-populate the app with sample transactions

function loadSampleData() {
    const sampleEntries = [
        {
            date: '2025-10-25',
            type: 'income',
            amount: 5000,
            category: 'sales',
            description: 'Product sales for Q4',
            reference: 'SALE-001',
            status: 'completed',
            currency: 'USD'
        },
        {
            date: '2025-10-24',
            type: 'expense',
            amount: 1200,
            category: 'purchase',
            description: 'Office supplies and equipment',
            reference: 'PUR-045',
            status: 'completed',
            currency: 'USD'
        },
        {
            date: '2025-10-23',
            type: 'income',
            amount: 3500,
            category: 'sales',
            description: 'Consulting services rendered',
            reference: 'SALE-002',
            status: 'completed',
            currency: 'USD'
        },
        {
            date: '2025-10-22',
            type: 'expense',
            amount: 850,
            category: 'marketing',
            description: 'Marketing and advertising expenses',
            reference: '',
            status: 'completed',
            currency: 'USD'
        },
        {
            date: '2025-10-21',
            type: 'income',
            amount: 2200,
            category: 'sales',
            description: 'Software license renewals',
            reference: 'SALE-003',
            status: 'completed',
            currency: 'USD'
        },
        {
            date: '2025-10-20',
            type: 'expense',
            amount: 450,
            category: 'other',
            description: 'Utilities and maintenance',
            reference: '',
            status: 'completed',
            currency: 'USD'
        },
        {
            date: '2025-10-19',
            type: 'income',
            amount: 4100,
            category: 'sales',
            description: 'Custom development project',
            reference: 'SALE-004',
            status: 'completed',
            currency: 'USD'
        },
        {
            date: '2025-10-18',
            type: 'expense',
            amount: 2500,
            category: 'purchase',
            description: 'Inventory restocking',
            reference: 'PUR-046',
            status: 'completed',
            currency: 'USD'
        },
        {
            date: '2025-10-17',
            type: 'income',
            amount: 1800,
            category: 'sales',
            description: 'Monthly subscription revenue',
            reference: 'SALE-005',
            status: 'completed',
            currency: 'USD'
        },
        {
            date: '2025-10-16',
            type: 'expense',
            amount: 320,
            category: 'other',
            description: 'Price adjustment for returned items',
            reference: 'ADJ-012',
            status: 'completed',
            currency: 'USD'
        }
    ];

    // Check if data already exists
    if (!window.memoryDB || !window.memoryDB.balanceEntries || window.memoryDB.balanceEntries.length === 0) {
        console.log('Loading sample data...');
        sampleEntries.forEach(entry => {
            balanceService.createBalanceEntry(entry);
        });
        console.log(`Loaded ${sampleEntries.length} sample transactions`);
        return true;
    }
    return false;
}

// Export for use in app
window.loadSampleData = loadSampleData;
