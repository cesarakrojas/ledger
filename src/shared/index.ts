/**
 * shared/index.ts - Barrel Export
 * 
 * Re-exports all shared modules for convenient imports.
 * 
 * Usage:
 *   import { Transaction, formatCurrency, CARD_STYLES } from './shared';
 * 
 * Or import from specific modules for tree-shaking:
 *   import { Transaction } from './shared/types';
 *   import { formatCurrency } from './shared/formatters';
 */

// Types
export type {
  Transaction,
  CategoryConfig,
  PaymentMethodsConfig,
  Product,
  ProductQuantity,
  InventoryFilters,
  DebtPayment,
  DebtEntry,
  Contact,
  CurrencyOption,
} from './types';

// Storage
export {
  STORAGE_KEYS,
  LEGACY_KEYS,
  createStorageAccessor,
  checkStorageAvailability,
} from './storage';
export type { StorageAccessor, CreateStorageAccessorOptions } from './storage';

// Styles
export {
  // Card styles
  CARD_STYLES,
  CARD_STYLES_NO_PADDING,
  CARD_INTERACTIVE,
  CARD_INTERACTIVE_ENHANCED,
  CARD_EMPTY_STATE,
  CARD_FORM,
  CARD_PRODUCT_ITEM,
  // Section containers
  SETTINGS_SECTION,
  CART_SUMMARY_INFLOW,
  CART_SUMMARY_OUTFLOW,
  // Detail view styles
  DETAIL_VIEW_HEADER,
  DETAIL_VIEW_CONTAINER,
  DETAIL_VIEW_FOOTER,
  // List styles
  LIST_ITEM_INTERACTIVE,
  // Icon buttons
  ICON_BTN,
  ICON_BTN_CLOSE,
  // Footer buttons
  BTN_FOOTER_PRIMARY,
  BTN_FOOTER_SECONDARY,
  BTN_FOOTER_DANGER,
  BTN_FOOTER_EDIT,
  BTN_FOOTER_DISABLED,
  // Input styles
  INPUT_BASE_CLASSES,
  INPUT_DATE_CLASSES,
  // Typography
  TEXT_PAGE_TITLE,
  TEXT_PAGE_TITLE_RESPONSIVE,
  TEXT_SECTION_HEADER,
  TEXT_DETAIL_HEADER,
  TEXT_DETAIL_HEADER_TITLE,
  TEXT_LABEL_UPPERCASE,
  TEXT_METADATA,
  TEXT_VALUE_LARGE,
  TEXT_VALUE_XL,
  // Form styles
  FORM_LABEL,
  FORM_FOOTER,
  // Buttons
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_DANGER,
  BTN_HEADER_INFLOW,
  BTN_HEADER_OUTFLOW,
  BTN_ACTION_PRIMARY,
  BTN_ACTION_SECONDARY,
  // Toggle buttons
  TOGGLE_BTN_BASE,
  TOGGLE_BTN_INACTIVE,
  TOGGLE_BTN_ACTIVE_EMERALD,
  TOGGLE_BTN_ACTIVE_RED,
  TOGGLE_BTN_ACTIVE_BLUE,
  // Badges
  BADGE_SUCCESS,
  BADGE_DANGER,
  BADGE_WARNING,
  BADGE_INFO,
  // Icon backgrounds
  ICON_BG_EMERALD,
  ICON_BG_RED,
  ICON_BG_BLUE,
  ICON_BG_ORANGE,
  // Amount colors
  TEXT_AMOUNT_INFLOW,
  TEXT_AMOUNT_OUTFLOW,
  // Stat cards
  STAT_CARD_EMERALD,
  STAT_CARD_RED,
  STAT_CARD_ORANGE,
  // Dividers & banners
  DIVIDER,
  ERROR_BANNER,
  // Transitions
  TRANSITION_COLORS,
  TRANSITION_ALL,
  TRANSITION_BASE,
} from './styles';

// Currency
export {
  CURRENCIES,
  DEFAULT_COUNTRY_ISO,
  DEFAULT_CURRENCY,
  getCurrencyByIso,
  getCurrencySymbolByIso,
  getCurrencyCodeByIso,
  getCurrencySymbol,
} from './currency';

// Formatters
export {
  formatCurrency,
  formatDate,
  formatTime,
} from './formatters';

// Calculations
export {
  calculateTotalInflows,
  calculateTotalOutflows,
} from './calculations';

// Errors
export {
  registerErrorHandler,
  reportError,
  createError,
  ERROR_MESSAGES,
} from './errors';
export type { AppError, ErrorHandler } from './errors';

// Hooks
export { useDebouncedValue } from './hooks';

// Utils
export { generateId, getTopProducts } from './utils';
