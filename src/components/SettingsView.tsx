import React, { useState, useCallback } from 'react';
import type { CategoryConfig } from '../SharedDefs';
import { CURRENCIES, TEXT_PAGE_TITLE, CARD_STYLES } from '../SharedDefs';
import { SunIcon, MoonIcon, ChevronRightIcon, CreditCardIcon } from '../UIComponents';

interface SettingsViewProps {
  onSave: (config: CategoryConfig) => void;
  initialConfig: CategoryConfig;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currencyCode: string;
  onCurrencyChange: (currencyCode: string) => void;
  onEditCategories?: () => void;
  onEditPaymentMethods?: () => void;
  paymentMethods?: string[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onSave,
  initialConfig,
  isDarkMode,
  onToggleTheme,
  currencyCode,
  onCurrencyChange,
  onEditCategories,
  onEditPaymentMethods,
  paymentMethods = []
}) => {
  // Local state for settings
  const [localCurrencyCode, setLocalCurrencyCode] = useState(currencyCode);

  // Track if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    const configChanged = localCurrencyCode !== currencyCode;
    return configChanged;
  }, [localCurrencyCode, currencyCode]);

  // Save all changes
  const handleSaveChanges = () => {
    // Save category config (keeping existing categories, always enabled)
    const config: CategoryConfig = {
      enabled: true,
      inflowCategories: initialConfig.inflowCategories,
      outflowCategories: initialConfig.outflowCategories
    };
    onSave(config);
    
    // Save currency if changed
    if (localCurrencyCode !== currencyCode) {
      onCurrencyChange(localCurrencyCode);
    }
  };

  return (
    <div className="w-full space-y-6 pb-40">
      {/* Single Settings Card */}
      <div className={CARD_STYLES}>
        {/* Header */}
        <h2 className={`${TEXT_PAGE_TITLE} mb-6`}>Ajustes</h2>

        {/* Appearance Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Apariencia</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Cambia entre claro y modo nocturno
          </p>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-600">
                {isDarkMode ? (
                  <MoonIcon className="w-5 h-5 text-indigo-500" />
                ) : (
                  <SunIcon className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-white">Tema de Apariencia</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isDarkMode ? 'Modo oscuro activado' : 'Modo claro activado'}
                </p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className="p-3 rounded-xl bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
              {isDarkMode ? <SunIcon className="w-6 h-6 text-amber-400"/> : <MoonIcon className="w-6 h-6 text-indigo-400"/>}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>

        {/* Currency Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Moneda</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Selecciona la moneda para mostrar los montos
          </p>
          <select
            value={localCurrencyCode}
            onChange={(e) => setLocalCurrencyCode(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.iso} value={currency.currency_code}>
                {currency.name} - {currency.currency_name} ({currency.currency_code})
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>

        {/* Payment Methods Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Métodos de Pago</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Configura los métodos de pago disponibles para tus transacciones
          </p>

          {/* Edit Payment Methods Button */}
          {onEditPaymentMethods && (
            <button
              onClick={onEditPaymentMethods}
              className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-3"
            >
              <div className="p-2 rounded-lg bg-white dark:bg-slate-600">
              <CreditCardIcon className="w-5 h-5 text-blue-500" />
            </div>
              <div className="flex-1">
              <p className="font-medium text-slate-800 dark:text-white">{paymentMethods.length} métodos configurados</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {paymentMethods.length > 0 ? paymentMethods.slice(0, 3).join(', ') + (paymentMethods.length > 3 ? '...' : '') : 'Sin métodos configurados'}
              </p>
            </div>
              <ChevronRightIcon className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>

        {/* Categories Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Categorías</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Administra las categorías para tus transacciones
          </p>

          {/* Edit Categories Button */}
          {onEditCategories && (
            <button
              onClick={onEditCategories}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">Editar Categorías</span>
              <ChevronRightIcon className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Footer - Always Visible Save Button - Positioned above bottom navigation */}
      <div className="fixed bottom-20 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-center">
          {/* Save Button */}
          <button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges()}
            className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${
              hasUnsavedChanges()
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
