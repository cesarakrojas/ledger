import React, { useState, useCallback } from 'react';
import type { CategoryConfig } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, SunIcon, MoonIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
import { CURRENCIES, TEXT_PAGE_TITLE } from '../utils/constants';
import { CARD_STYLES } from '../utils/styleConstants';

interface SettingsViewProps {
  onSave: (config: CategoryConfig) => void;
  initialConfig: CategoryConfig;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currencyCode: string;
  onCurrencyChange: (currencyCode: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onSave,
  initialConfig,
  isDarkMode,
  onToggleTheme,
  currencyCode,
  onCurrencyChange
}) => {
  // Local state for all settings
  const [enabled, setEnabled] = useState(initialConfig.enabled);
  const [inflowCategories, setInflowCategories] = useState<string[]>(initialConfig.inflowCategories);
  const [outflowCategories, setOutflowCategories] = useState<string[]>(initialConfig.outflowCategories);
  const [localCurrencyCode, setLocalCurrencyCode] = useState(currencyCode);
  const [newInflowCategory, setNewInflowCategory] = useState('');
  const [newOutflowCategory, setNewOutflowCategory] = useState('');
  const [editingInflowIndex, setEditingInflowIndex] = useState<number | null>(null);
  const [editingOutflowIndex, setEditingOutflowIndex] = useState<number | null>(null);
  const [editingInflowValue, setEditingInflowValue] = useState('');
  const [editingOutflowValue, setEditingOutflowValue] = useState('');
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  // Track if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    const configChanged = 
      enabled !== initialConfig.enabled ||
      JSON.stringify(inflowCategories) !== JSON.stringify(initialConfig.inflowCategories) ||
      JSON.stringify(outflowCategories) !== JSON.stringify(initialConfig.outflowCategories) ||
      localCurrencyCode !== currencyCode;
    return configChanged;
  }, [enabled, inflowCategories, outflowCategories, localCurrencyCode, initialConfig, currencyCode]);

  // Save all changes
  const handleSaveChanges = () => {
    // Save category config
    const config: CategoryConfig = {
      enabled,
      inflowCategories,
      outflowCategories
    };
    onSave(config);
    
    // Save currency if changed
    if (localCurrencyCode !== currencyCode) {
      onCurrencyChange(localCurrencyCode);
    }
  };

  // Inflow category handlers
  const handleAddInflowCategory = () => {
    if (newInflowCategory.trim() && !inflowCategories.includes(newInflowCategory.trim())) {
      setInflowCategories([...inflowCategories, newInflowCategory.trim()]);
      setNewInflowCategory('');
    }
  };

  const handleDeleteInflowCategory = (index: number) => {
    setInflowCategories(inflowCategories.filter((_, i) => i !== index));
  };

  const handleStartEditInflow = (index: number) => {
    setEditingInflowIndex(index);
    setEditingInflowValue(inflowCategories[index]);
  };

  const handleSaveEditInflow = () => {
    if (editingInflowIndex !== null && editingInflowValue.trim() && !inflowCategories.includes(editingInflowValue.trim())) {
      const newCategories = [...inflowCategories];
      newCategories[editingInflowIndex] = editingInflowValue.trim();
      setInflowCategories(newCategories);
      setEditingInflowIndex(null);
      setEditingInflowValue('');
    }
  };

  const handleCancelEditInflow = () => {
    setEditingInflowIndex(null);
    setEditingInflowValue('');
  };

  // Outflow category handlers
  const handleAddOutflowCategory = () => {
    if (newOutflowCategory.trim() && !outflowCategories.includes(newOutflowCategory.trim())) {
      setOutflowCategories([...outflowCategories, newOutflowCategory.trim()]);
      setNewOutflowCategory('');
    }
  };

  const handleDeleteOutflowCategory = (index: number) => {
    setOutflowCategories(outflowCategories.filter((_, i) => i !== index));
  };

  const handleStartEditOutflow = (index: number) => {
    setEditingOutflowIndex(index);
    setEditingOutflowValue(outflowCategories[index]);
  };

  const handleSaveEditOutflow = () => {
    if (editingOutflowIndex !== null && editingOutflowValue.trim() && !outflowCategories.includes(editingOutflowValue.trim())) {
      const newCategories = [...outflowCategories];
      newCategories[editingOutflowIndex] = editingOutflowValue.trim();
      setOutflowCategories(newCategories);
      setEditingOutflowIndex(null);
      setEditingOutflowValue('');
    }
  };

  const handleCancelEditOutflow = () => {
    setEditingOutflowIndex(null);
    setEditingOutflowValue('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-40">
      {/* Single Settings Card */}
      <div className={CARD_STYLES}>
        {/* Header */}
        <h2 className={`${TEXT_PAGE_TITLE} mb-6`}>Ajustes</h2>

        {/* Appearance Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Apariencia</h3>
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

        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Categorías</h3>
            
            {/* Enable/Disable Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {enabled ? 'Activadas' : 'Desactivadas'}
              </span>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                    enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Habilitar el campo de categoría en las transacciones
          </p>

          {/* Categories Content */}
          {enabled && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 px-3 py-2 rounded-lg transition-colors"
                >
                  {categoriesExpanded ? 'Compactar' : 'Editar'}
                  {categoriesExpanded ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {!categoriesExpanded ? (
                /* Compact View - Stats */
                <div className="grid grid-cols-2 gap-4">

                </div>
              ) : (
                /* Expanded View - Editable Lists */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Inflow Categories */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                      Categorías de Ingresos
                      <span className="text-xs bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                        {inflowCategories.length}
                      </span>
                    </h4>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                      {inflowCategories.map((category, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg"
                        >
                          {editingInflowIndex === index ? (
                            <>
                              <input
                                type="text"
                                value={editingInflowValue}
                                onChange={(e) => setEditingInflowValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditInflow();
                                  if (e.key === 'Escape') handleCancelEditInflow();
                                }}
                                className="flex-1 px-3 py-1 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveEditInflow}
                                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                                title="Guardar"
                              >
                                ✓
                              </button>
                              <button
                                onClick={handleCancelEditInflow}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                title="Cancelar"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-slate-700 dark:text-slate-200">{category}</span>
                              <button
                                onClick={() => handleStartEditInflow(index)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteInflowCategory(index)}
                                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      {inflowCategories.length === 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                          No hay categorías de ingresos
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newInflowCategory}
                        onChange={(e) => setNewInflowCategory(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddInflowCategory()}
                        placeholder="Nueva categoría"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                      <button
                        onClick={handleAddInflowCategory}
                        disabled={!newInflowCategory.trim() || inflowCategories.includes(newInflowCategory.trim())}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Outflow Categories */}
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                      Categorías de Gastos
                      <span className="text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full">
                        {outflowCategories.length}
                      </span>
                    </h4>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                      {outflowCategories.map((category, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg"
                        >
                          {editingOutflowIndex === index ? (
                            <>
                              <input
                                type="text"
                                value={editingOutflowValue}
                                onChange={(e) => setEditingOutflowValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditOutflow();
                                  if (e.key === 'Escape') handleCancelEditOutflow();
                                }}
                                className="flex-1 px-3 py-1 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveEditOutflow}
                                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                                title="Guardar"
                              >
                                ✓
                              </button>
                              <button
                                onClick={handleCancelEditOutflow}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                title="Cancelar"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-slate-700 dark:text-slate-200">{category}</span>
                              <button
                                onClick={() => handleStartEditOutflow(index)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOutflowCategory(index)}
                                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      {outflowCategories.length === 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                          No hay categorías de gastos
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOutflowCategory}
                        onChange={(e) => setNewOutflowCategory(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOutflowCategory()}
                        placeholder="Nueva categoría"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      />
                      <button
                        onClick={handleAddOutflowCategory}
                        disabled={!newOutflowCategory.trim() || outflowCategories.includes(newOutflowCategory.trim())}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
