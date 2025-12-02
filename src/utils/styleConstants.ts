/**
 * Reusable Tailwind CSS class combinations for consistent styling
 */

// Base card styles
const CARD_BASE = 'bg-white dark:bg-slate-800 shadow-lg rounded-2xl';

// Standard card with padding
export const CARD_STYLES = `${CARD_BASE} p-6`;

// Card without padding (for custom layouts)
export const CARD_STYLES_NO_PADDING = CARD_BASE;

// Interactive card for clickable elements
export const CARD_INTERACTIVE = `${CARD_BASE} hover:shadow-xl transition-shadow cursor-pointer`;

// Interactive card with padding and enhanced hover effects
export const CARD_INTERACTIVE_ENHANCED = `group ${CARD_BASE} p-5 hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-emerald-500/20`;

// Empty state card with centered content
export const CARD_EMPTY_STATE = `${CARD_BASE} p-12 text-center`;

// Form container with flex layout
export const CARD_FORM = `${CARD_BASE} flex flex-col overflow-hidden`;

// Product item card for forms (NewInflowForm, NewExpenseForm)
export const CARD_PRODUCT_ITEM = 'bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden flex relative';

// Settings section container
export const SETTINGS_SECTION = 'p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg';

// Cart summary container (consistent border width)
export const CART_SUMMARY_INFLOW = 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4';
export const CART_SUMMARY_OUTFLOW = 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4';

// ============================================
// HIGH PRIORITY STANDARDIZED PATTERNS
// ============================================

// Detail View Header (TransactionDetailView, ProductDetailView, DebtDetailView)
export const DETAIL_VIEW_HEADER = 'flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0 z-10';

// List Item Interactive (App.tsx transactions, LibretaView debts, InventoryView products)
export const LIST_ITEM_INTERACTIVE = 'group flex items-center justify-between py-4 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors duration-200 cursor-pointer';

// Icon Buttons (Close buttons, action icon buttons)
export const ICON_BTN = 'p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors';
export const ICON_BTN_CLOSE = 'p-2 -mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors';

// Footer Action Buttons (Detail views footers)
export const BTN_FOOTER_PRIMARY = 'flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-colors';
export const BTN_FOOTER_SECONDARY = 'flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors';
export const BTN_FOOTER_DANGER = 'flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-colors';
export const BTN_FOOTER_EDIT = 'flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-colors';

// Detail View Container (outer wrapper for detail modals)
export const DETAIL_VIEW_CONTAINER = 'w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 rounded-t-[2rem] overflow-hidden shadow-2xl';

// Detail View Footer (action area at bottom)
export const DETAIL_VIEW_FOOTER = 'bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 safe-area-inset-bottom flex-shrink-0';

