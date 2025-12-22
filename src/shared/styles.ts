/**
 * shared/styles.ts - Tailwind CSS Class Constants
 * 
 * Centralized style definitions for consistent UI across the application.
 * All classes are organized by category for easy discovery and maintenance.
 */

// ============================================
// CARD STYLES
// ============================================

/** Base card styles (internal use) */
const CARD_BASE = 'bg-white dark:bg-slate-800 shadow-lg';

/** Standard card with padding */
export const CARD_STYLES = `${CARD_BASE} p-6`;

/** Card without padding (for custom layouts) */
export const CARD_STYLES_NO_PADDING = CARD_BASE;

/** Interactive card for clickable elements */
export const CARD_INTERACTIVE = `${CARD_BASE} hover:shadow-xl transition-shadow cursor-pointer`;

/** Interactive card with padding and enhanced hover effects */
export const CARD_INTERACTIVE_ENHANCED = `group ${CARD_BASE} p-5 hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-emerald-500/20`;

/** Empty state card with centered content */
export const CARD_EMPTY_STATE = `${CARD_BASE} p-12 text-center`;

/** Form container with flex layout */
export const CARD_FORM = `${CARD_BASE} flex flex-col overflow-hidden`;

/** Product item card for forms (NewInflowForm, NewExpenseForm) */
export const CARD_PRODUCT_ITEM = 'bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden flex relative';

// ============================================
// SECTION CONTAINERS
// ============================================

/** Settings section container */
export const SETTINGS_SECTION = 'p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg';

/** Cart summary container - inflow variant */
export const CART_SUMMARY_INFLOW = 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4';

/** Cart summary container - outflow variant */
export const CART_SUMMARY_OUTFLOW = 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4';

// ============================================
// DETAIL VIEW STYLES
// ============================================

/** Full-screen overlay container for detail/form pages - covers entire viewport */
export const FULL_SCREEN_OVERLAY = 'w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden';

/** Detail View Header (TransactionDetailView, ProductDetailView, DebtDetailView, ContactDetailView) */
export const DETAIL_VIEW_HEADER = 'flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0 z-10';

/** Detail View Container (outer wrapper for detail modals) - now uses full screen */
export const DETAIL_VIEW_CONTAINER = 'w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden';

/** Detail View Footer (action area at bottom) */
export const DETAIL_VIEW_FOOTER = 'bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 safe-area-inset-bottom flex-shrink-0';

// ============================================
// LIST ITEM STYLES
// ============================================

/** List Item Interactive (App.tsx transactions, LibretaView debts, InventoryView products) */
export const LIST_ITEM_INTERACTIVE = 'group flex items-center justify-between py-4 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors duration-200 cursor-pointer';

// ============================================
// ICON BUTTON STYLES
// ============================================

/** Icon button base */
export const ICON_BTN = 'p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors';

/** Icon button for close actions */
export const ICON_BTN_CLOSE = 'p-2 -mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors';

// ============================================
// FOOTER ACTION BUTTONS
// ============================================

/** Footer button - primary action */
export const BTN_FOOTER_PRIMARY = 'flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-colors';

/** Footer button - secondary action */
export const BTN_FOOTER_SECONDARY = 'flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors';

/** Footer button - danger action */
export const BTN_FOOTER_DANGER = 'flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-colors';

/** Footer button - edit action */
export const BTN_FOOTER_EDIT = 'flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-colors';

/** Footer button - disabled state */
export const BTN_FOOTER_DISABLED = 'flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-xl font-semibold cursor-not-allowed transition-colors';

// ============================================
// INPUT STYLES
// ============================================

/** Base input classes */
export const INPUT_BASE_CLASSES = 'w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-slate-900 dark:text-slate-100';

/** Date input variant (larger for touch) */
export const INPUT_DATE_CLASSES = 'w-full px-4 py-3.5 text-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-700 dark:text-slate-200';

// ============================================
// TYPOGRAPHY STYLES
// ============================================

/** Page title */
export const TEXT_PAGE_TITLE = 'text-2xl font-bold text-slate-800 dark:text-white';

/** Page title - responsive variant */
export const TEXT_PAGE_TITLE_RESPONSIVE = 'text-xl sm:text-2xl font-bold text-slate-800 dark:text-white';

/** Section header */
export const TEXT_SECTION_HEADER = 'text-lg font-semibold text-slate-800 dark:text-white';

/** Detail header */
export const TEXT_DETAIL_HEADER = 'text-lg font-bold text-slate-800 dark:text-white';

/** Detail header title (with margin) */
export const TEXT_DETAIL_HEADER_TITLE = 'text-lg font-bold text-slate-800 dark:text-white ml-2';

/** Label - uppercase variant */
export const TEXT_LABEL_UPPERCASE = 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400';

/** Metadata text */
export const TEXT_METADATA = 'text-xs text-slate-500 dark:text-slate-400';

/** Large value text */
export const TEXT_VALUE_LARGE = 'text-xl font-bold';

/** Extra large value text */
export const TEXT_VALUE_XL = 'text-2xl font-bold';

// ============================================
// FORM STYLES
// ============================================

/** Form label */
export const FORM_LABEL = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2';

/** Form footer container */
export const FORM_FOOTER = 'sticky bottom-0 flex-shrink-0 pt-4 px-6 pb-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-3 safe-area-inset-bottom z-20';

// ============================================
// BUTTON STYLES
// ============================================

/** Primary button - full width */
export const BTN_PRIMARY = 'w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg';

/** Secondary button - full width */
export const BTN_SECONDARY = 'w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors';

/** Danger button - full width */
export const BTN_DANGER = 'w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl transition-colors';

/** Header action button - inflow */
export const BTN_HEADER_INFLOW = 'flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/30 transition-transform transform hover:scale-105';

/** Header action button - outflow */
export const BTN_HEADER_OUTFLOW = 'flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-red-500/30 transition-transform transform hover:scale-105';

/** Page action button - primary */
export const BTN_ACTION_PRIMARY = 'flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/30 transition-transform transform hover:scale-105';

/** Page action button - secondary */
export const BTN_ACTION_SECONDARY = 'flex items-center justify-center gap-2 bg-orange-500 text-white border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700 dark:text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105';

// ============================================
// TOGGLE BUTTON STYLES
// ============================================

/** Toggle button - base */
export const TOGGLE_BTN_BASE = 'py-3 px-4 rounded-lg font-semibold transition-all';

/** Toggle button - inactive state */
export const TOGGLE_BTN_INACTIVE = 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600';

/** Toggle button - active emerald */
export const TOGGLE_BTN_ACTIVE_EMERALD = 'bg-emerald-600 text-white shadow-lg';

/** Toggle button - active red */
export const TOGGLE_BTN_ACTIVE_RED = 'bg-red-600 text-white shadow-lg';

/** Toggle button - active blue */
export const TOGGLE_BTN_ACTIVE_BLUE = 'bg-blue-600 text-white shadow-lg';

// ============================================
// STATUS BADGES
// ============================================

/** Badge - success */
export const BADGE_SUCCESS = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';

/** Badge - danger */
export const BADGE_DANGER = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

/** Badge - warning */
export const BADGE_WARNING = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';

/** Badge - info */
export const BADGE_INFO = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

// ============================================
// ICON BACKGROUNDS
// ============================================

/** Icon background - emerald */
export const ICON_BG_EMERALD = 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';

/** Icon background - red */
export const ICON_BG_RED = 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';

/** Icon background - blue */
export const ICON_BG_BLUE = 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';

/** Icon background - orange */
export const ICON_BG_ORANGE = 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';

// ============================================
// AMOUNT/CURRENCY TEXT COLORS
// ============================================

/** Amount text - inflow (positive) */
export const TEXT_AMOUNT_INFLOW = 'text-emerald-600 dark:text-emerald-400';

/** Amount text - outflow (negative) */
export const TEXT_AMOUNT_OUTFLOW = 'text-red-600 dark:text-red-400';

// ============================================
// STAT CARDS
// ============================================

/** Stat card - emerald */
export const STAT_CARD_EMERALD = 'bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-xl';

/** Stat card - red */
export const STAT_CARD_RED = 'bg-red-100 dark:bg-red-900/50 p-4 rounded-xl';

/** Stat card - orange */
export const STAT_CARD_ORANGE = 'bg-orange-100 dark:bg-orange-900/50 p-4 rounded-xl';

// ============================================
// DIVIDERS & BANNERS
// ============================================

/** Divider line */
export const DIVIDER = 'border-t border-slate-200 dark:border-slate-700 my-6';

/** Error banner */
export const ERROR_BANNER = 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-fade-in';

// ============================================
// TRANSITION UTILITIES
// ============================================

/** Transition - colors only */
export const TRANSITION_COLORS = 'transition-colors';

/** Transition - all properties */
export const TRANSITION_ALL = 'transition-all';

/** Transition - base with duration */
export const TRANSITION_BASE = 'transition-colors duration-150';
