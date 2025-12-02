export const INPUT_BASE_CLASSES = 'w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-slate-900 dark:text-slate-100';

// Standardized Form Styles
export const FORM_LABEL = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2';

// Standardized Button Styles
export const BTN_PRIMARY = 'w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg';
export const BTN_SECONDARY = 'w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors';
export const BTN_DANGER = 'w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl transition-colors';

// Header action buttons (inflow/expense buttons in main view)
export const BTN_HEADER_INFLOW = 'flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-transform transform hover:scale-105';
export const BTN_HEADER_OUTFLOW = 'flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-red-500/30 transition-transform transform hover:scale-105';

// Standardized Form Footer
export const FORM_FOOTER = 'flex-shrink-0 pt-4 px-4 pb-4 -mx-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-3 safe-area-inset-bottom';

// Error Banner
export const ERROR_BANNER = 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-fade-in';

export interface CurrencyOption {
  name: string;
  iso: string;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { name: "Estados Unidos", iso: "us", currency_name: "Dólar estadounidense", currency_code: "USD", currency_symbol: "$" },
  { name: "Argentina", iso: "ar", currency_name: "Peso argentino", currency_code: "ARS", currency_symbol: "$" },
  { name: "Bolivia", iso: "bo", currency_name: "Boliviano", currency_code: "BOB", currency_symbol: "Bs" },
  { name: "Brazil", iso: "br", currency_name: "Real brasileño", currency_code: "BRL", currency_symbol: "R$" },
  { name: "Chile", iso: "cl", currency_name: "Peso chileno", currency_code: "CLP", currency_symbol: "$" },
  { name: "Colombia", iso: "co", currency_name: "Peso colombiano", currency_code: "COP", currency_symbol: "$" },
  { name: "Costa Rica", iso: "cr", currency_name: "Colón costarricense", currency_code: "CRC", currency_symbol: "₡" },
  { name: "Cuba", iso: "cu", currency_name: "Peso cubano", currency_code: "CUP", currency_symbol: "$" },
  { name: "Ecuador", iso: "ec", currency_name: "Dólar estadounidense", currency_code: "USD", currency_symbol: "$" },
  { name: "El Salvador", iso: "sv", currency_name: "Dólar estadounidense", currency_code: "USD", currency_symbol: "$" },
  { name: "Guatemala", iso: "gt", currency_name: "Quetzal guatemalteco", currency_code: "GTQ", currency_symbol: "Q" },
  { name: "Honduras", iso: "hn", currency_name: "Lempira hondureña", currency_code: "HNL", currency_symbol: "L" },
  { name: "Mexico", iso: "mx", currency_name: "Peso mexicano", currency_code: "MXN", currency_symbol: "$" },
  { name: "Nicaragua", iso: "ni", currency_name: "Córdoba nicaragüense", currency_code: "NIO", currency_symbol: "C$" },
  { name: "Panama", iso: "pa", currency_name: "Balboa/Dólar estadounidense", currency_code: "PAB", currency_symbol: "B/." },
  { name: "Paraguay", iso: "py", currency_name: "Guaraní paraguayo", currency_code: "PYG", currency_symbol: "₲" },
  { name: "Peru", iso: "pe", currency_name: "Sol peruano", currency_code: "PEN", currency_symbol: "S/." },
  { name: "Spain", iso: "es", currency_name: "Euro", currency_code: "EUR", currency_symbol: "€" },
  { name: "Uruguay", iso: "uy", currency_name: "Peso uruguayo", currency_code: "UYU", currency_symbol: "$" },
  { name: "Venezuela", iso: "ve", currency_name: "Bolívar", currency_code: "VES", currency_symbol: "Bs" }
];

export const DEFAULT_CURRENCY = "USD";

// Helper to get currency symbol by code
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES.find(c => c.currency_code === currencyCode);
  return currency?.currency_symbol || '$';
};