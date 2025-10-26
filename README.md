# Balance & Ledger - Static Site

A standalone, mobile-responsive static web application for managing balance entries and financial ledgers. Built with HTML, Tailwind CSS, and vanilla JavaScript with **in-memory storage** (session-only).

## 📋 Features

- **Financial Overview**: Real-time summary cards showing total income, expenses, and net balance
- **Transaction Management**: Create, edit, view, and delete income/expense transactions
- **Advanced Filtering**: Filter by category, type, date range, and search
- **Data Import/Export**: Backup and restore data via JSON or CSV files
- **Mobile Optimized**: Fully responsive design with mobile-first approach
- **Memory-Based Storage**: All data stored in browser memory (resets on page refresh)
- **Tab Navigation**: Quick access to all transactions, income, or expenses
- **Financial Health Indicator**: Visual profit margin and health status
- **Toast Notifications**: Beautiful, non-intrusive user feedback system
- **Input Validation**: Comprehensive validation and XSS protection
- **CSP Compliant**: Secure code with no inline event handlers

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - works with `file://` protocol!

### Installation

1. **Download or clone this folder** to your local machine

2. **Open the application**:
   - **Option 1**: Simply double-click `index.html` to open in your browser ✨
   - **Option 2**: Use a local server (optional, but recommended):
     - VS Code Live Server: Right-click `index.html` → "Open with Live Server"
     - Python: `python -m http.server 8000`
     - Node.js: `npx http-server`

3. **Start using**: No configuration needed! The app works immediately.

## 💾 Data Storage

**Important**: This application uses **in-memory storage only**. 

- ✅ Data persists during your session
- ❌ All data is **lost when you refresh or close the page**
- 📝 Perfect for testing, demos, or temporary calculations
- 🔒 No data leaves your browser - completely private

### Want to Persist Data?

You can easily extend this app to use:
- **localStorage**: Survives page refreshes (add ~10 lines of code)
- **IndexedDB**: For larger datasets
- **Backend API**: Connect to your own server
- **Firebase**: Re-enable the Firebase version (see git history)

## 📁 File Structure

```
balance-static/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # Custom CSS styles
├── js/
│   ├── utils.js           # Utility functions
│   ├── firebase-service.js # Memory storage service (renamed for compatibility)
│   ├── balance-service.js  # Balance-specific service
│   ├── components.js       # UI component functions
│   └── app.js             # Main application logic
└── README.md              # This file
```

## 🎨 Features in Detail

### Summary Cards
- **Total Income**: Displays sum of all income transactions
- **Total Expenses**: Displays sum of all expense transactions
- **Net Balance**: Shows profit/loss with visual indicators
- **Financial Health**: Automated assessment based on profit margin

### Transaction Management
- Create new income or expense entries
- **Edit existing transactions** with full form pre-population
- View all transactions in table or mobile card format
- Delete transactions with confirmation (removes from memory)
- Session-based data (no persistence)

### Data Management
- **Export to JSON**: Backup data with metadata and version info
- **Export to CSV**: Excel/Google Sheets compatible format
- **Import from JSON**: Restore data with validation
- **Import from CSV**: Bulk import with error reporting

### Filtering Options
- **Category**: Sales, Purchase, Adjustment, Manual, Other
- **Type**: Income or Expense
- **Date Range**: Custom date range selection
- **Search**: Text search in description and reference fields

### User Experience
- **Toast Notifications**: Success, error, warning, and info messages
- **Input Validation**: Real-time validation with detailed error messages
- **XSS Protection**: All inputs sanitized and escaped
- **CSP Compliant**: No inline JavaScript, secure by design
- **Responsive Design**: Optimized for all screen sizes

### Mobile Experience
- Responsive design adapts to screen size
- Touch-friendly buttons and controls
- Compact card layout for transactions
- Collapsible filter sections
- Optimized forms for mobile input

## 📱 Mobile Optimization

The application is optimized for mobile browsers:
- Minimum tap target size of 44px
- Font size of 16px to prevent auto-zoom on iOS
- Touch-friendly controls and gestures
- Responsive grid layouts
- Optimized modals for small screens

## 🎯 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🛠️ Customization

### Styling
- Edit `css/styles.css` for custom styles
- Tailwind CSS classes can be modified in `index.html`

### Storage Persistence (Optional)
Want to save data between sessions? Add localStorage support:

```javascript
// In js/firebase-service.js, add to constructor:
constructor(collectionName) {
    this.collectionName = collectionName;
    // Load from localStorage if available
    const saved = localStorage.getItem(collectionName);
    window.memoryDB = window.memoryDB || {};
    window.memoryDB[collectionName] = saved ? JSON.parse(saved) : [];
    this.storage = window.memoryDB[collectionName];
}

// Add save method after any create/update/delete:
saveToLocalStorage() {
    localStorage.setItem(this.collectionName, JSON.stringify(this.storage));
}
```

### Business Logic
- Modify validation rules in `js/app.js` → `handleFormSubmit()`
- Customize summary calculations in `js/balance-service.js` → `getBalanceSummary()`

## 🐛 Troubleshooting

### Data Not Showing
- Check browser console for errors (F12)
- Ensure JavaScript is enabled
- Try refreshing the page

### Mobile Display Issues
- Clear browser cache
- Test in different mobile browsers
- Check viewport meta tag in HTML

### Starting Fresh
- Simply refresh the page - all data will be cleared
- Or click the refresh button in the app

## 📄 License

This is a standalone module extracted from a larger ERP system. Use freely for your projects.

## 🤝 Contributing

This is a static site template. Feel free to:
- Add new features
- Improve mobile experience
- Enhance styling
- Add authentication
- Create additional reports

## 📞 Support

For issues or questions:
1. Check browser console for errors (F12)
2. Verify JavaScript is enabled
3. Try a different browser
4. Refresh the page to reset data

## 🔄 Updates

**Version 2.0.0** - Memory Storage Release
- Removed Firebase dependency
- Implemented in-memory storage
- No configuration required
- Works with file:// protocol
- Truly standalone static site

**Version 2.1.0** - Critical Improvements (Current)
- ✅ Professional toast notification system
- ✅ Comprehensive input validation and sanitization
- ✅ XSS protection for all user inputs
- ✅ Edit functionality for transactions
- ✅ Export to JSON and CSV
- ✅ Import from JSON and CSV with validation
- ✅ CSP-compliant (no inline event handlers)
- ✅ Event delegation for better security
- ✅ Enhanced error handling
- ✅ Mobile and desktop optimizations

**Version 1.0.0** - Initial Release (Firebase)
- Basic CRUD operations
- Mobile-responsive design
- Firebase integration
- Advanced filtering
- Financial summaries

---

## 🆕 What's New in v2.1.0

### 📝 Edit Transactions
Click the "Edit" button on any transaction to modify it. The form will pre-populate with existing data, and you can update any field. Available on both desktop and mobile views.

### 💾 Export Your Data
Backup your transactions by clicking the "Data" dropdown:
- **Export as JSON**: Full backup with metadata (recommended for re-importing)
- **Export as CSV**: Spreadsheet format for Excel/Google Sheets

### 📥 Import Data
Restore or bulk-import transactions:
1. Click "Data" → "Import Data"
2. Select a JSON or CSV file
3. Review the import summary
4. Confirm to import valid entries

The import process validates all data and shows you exactly what will be imported.

### 🔒 Security & Validation
All user inputs are now:
- ✅ Validated before saving (amount, date, description, etc.)
- ✅ Sanitized to prevent XSS attacks  
- ✅ Limited to safe lengths
- ✅ Checked for proper formats

You'll see clear error messages if something isn't right!

### 🎉 Better User Experience
- Beautiful toast notifications (no more browser alerts!)
- Real-time form validation
- Improved error messages
- CSP-compliant security
- Mobile-optimized interactions

---

**Built with ❤️ using HTML, Tailwind CSS, and Vanilla JavaScript**

**Zero Dependencies • Zero Configuration • 100% Client-Side**
