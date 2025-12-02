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

