/**
 * SettingsDomain.tsx
 * Domain module for all settings and configuration functionality
 * Contains: SettingsView, CategoryEditorView, PaymentMethodsEditorView
 */

import React, { useState, useCallback } from 'react';
import type { CategoryConfig } from './SharedDefs';
import {
  CURRENCIES,
  CARD_STYLES,
  TEXT_PAGE_TITLE,
  FORM_FOOTER,
  BTN_FOOTER_PRIMARY,
  BTN_FOOTER_SECONDARY,
  DIVIDER,
  TOGGLE_BTN_BASE,
  TOGGLE_BTN_INACTIVE,
  TOGGLE_BTN_ACTIVE_EMERALD,
  TOGGLE_BTN_ACTIVE_RED
} from './SharedDefs';
import {
  SunIcon,
  MoonIcon,
  ChevronRightIcon,
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from './UIComponents';

// =============================================================================
// CategoryRename type export
// =============================================================================
export interface CategoryRename {
  oldName: string;
  newName: string;
}

// =============================================================================
// SettingsView
// =============================================================================
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
  const [localCurrencyCode, setLocalCurrencyCode] = useState(currencyCode);

  const hasUnsavedChanges = useCallback(() => {
    return localCurrencyCode !== currencyCode;
  }, [localCurrencyCode, currencyCode]);

  const handleSaveChanges = () => {
    const config: CategoryConfig = {
      enabled: true,
      inflowCategories: initialConfig.inflowCategories,
      outflowCategories: initialConfig.outflowCategories
    };
    onSave(config);
    
    if (localCurrencyCode !== currencyCode) {
      onCurrencyChange(localCurrencyCode);
    }
  };

  return (
    <div className="w-full space-y-6 pb-40">
      <div className={CARD_STYLES}>
        <h2 className={`${TEXT_PAGE_TITLE} mb-6`}>Ajustes</h2>

        {/* Appearance Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Apariencia</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Cambia entre claro y modo nocturno</p>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-600">
                {isDarkMode ? <MoonIcon className="w-5 h-5 text-indigo-500" /> : <SunIcon className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-white">Tema de Apariencia</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isDarkMode ? 'Modo oscuro activado' : 'Modo claro activado'}
                </p>
              </div>
            </div>
            <button onClick={onToggleTheme} className="p-3 rounded-xl bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
              {isDarkMode ? <SunIcon className="w-6 h-6 text-amber-400"/> : <MoonIcon className="w-6 h-6 text-indigo-400"/>}
            </button>
          </div>
        </div>

        <div className={DIVIDER}></div>

        {/* Currency Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Moneda</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Selecciona la moneda para mostrar los montos</p>
          <select value={localCurrencyCode} onChange={(e) => setLocalCurrencyCode(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
            {CURRENCIES.map((currency) => (
              <option key={currency.iso} value={currency.currency_code}>
                {currency.name} - {currency.currency_name} ({currency.currency_code})
              </option>
            ))}
          </select>
        </div>

        <div className={DIVIDER}></div>

        {/* Payment Methods Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Métodos de Pago</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Configura los métodos de pago disponibles para tus transacciones</p>
          {onEditPaymentMethods && (
            <button onClick={onEditPaymentMethods} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-3">
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

        <div className={DIVIDER}></div>

        {/* Categories Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Categorías</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Administra las categorías para tus transacciones</p>
          {onEditCategories && (
            <button onClick={onEditCategories}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <span className="font-medium text-slate-700 dark:text-slate-200">Editar Categorías</span>
              <ChevronRightIcon className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-20 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-center">
          <button onClick={handleSaveChanges} disabled={!hasUnsavedChanges()}
            className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${
              hasUnsavedChanges()
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}>
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

// =============================================================================
// CategoryEditorView
// =============================================================================
interface CategoryEditorViewProps {
  inflowCategories: string[];
  outflowCategories: string[];
  onSave: (inflowCategories: string[], outflowCategories: string[], renames: CategoryRename[]) => void;
  onCancel: () => void;
}

export const CategoryEditorView: React.FC<CategoryEditorViewProps> = ({
  inflowCategories: initialInflow,
  outflowCategories: initialOutflow,
  onSave,
  onCancel
}) => {
  const [inflowCategories, setInflowCategories] = useState<string[]>(initialInflow);
  const [outflowCategories, setOutflowCategories] = useState<string[]>(initialOutflow);
  const [newInflowCategory, setNewInflowCategory] = useState('');
  const [newOutflowCategory, setNewOutflowCategory] = useState('');
  const [editingInflowIndex, setEditingInflowIndex] = useState<number | null>(null);
  const [editingOutflowIndex, setEditingOutflowIndex] = useState<number | null>(null);
  const [editingInflowValue, setEditingInflowValue] = useState('');
  const [editingOutflowValue, setEditingOutflowValue] = useState('');
  const [activeTab, setActiveTab] = useState<'inflow' | 'outflow'>('inflow');

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
    if (editingInflowIndex !== null && editingInflowValue.trim()) {
      const trimmedValue = editingInflowValue.trim();
      const isDuplicate = inflowCategories.some((cat, i) => i !== editingInflowIndex && cat === trimmedValue);
      if (!isDuplicate) {
        const newCategories = [...inflowCategories];
        newCategories[editingInflowIndex] = trimmedValue;
        setInflowCategories(newCategories);
      }
      setEditingInflowIndex(null);
      setEditingInflowValue('');
    }
  };

  const handleCancelEditInflow = () => {
    setEditingInflowIndex(null);
    setEditingInflowValue('');
  };

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
    if (editingOutflowIndex !== null && editingOutflowValue.trim()) {
      const trimmedValue = editingOutflowValue.trim();
      const isDuplicate = outflowCategories.some((cat, i) => i !== editingOutflowIndex && cat === trimmedValue);
      if (!isDuplicate) {
        const newCategories = [...outflowCategories];
        newCategories[editingOutflowIndex] = trimmedValue;
        setOutflowCategories(newCategories);
      }
      setEditingOutflowIndex(null);
      setEditingOutflowValue('');
    }
  };

  const handleCancelEditOutflow = () => {
    setEditingOutflowIndex(null);
    setEditingOutflowValue('');
  };

  const handleSave = () => {
    const renames: CategoryRename[] = [];
    
    initialInflow.forEach((oldName, index) => {
      if (index < inflowCategories.length) {
        const newName = inflowCategories[index];
        if (oldName !== newName) {
          renames.push({ oldName, newName });
        }
      }
    });
    
    initialOutflow.forEach((oldName, index) => {
      if (index < outflowCategories.length) {
        const newName = outflowCategories[index];
        if (oldName !== newName) {
          renames.push({ oldName, newName });
        }
      }
    });
    
    onSave(inflowCategories, outflowCategories, renames);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-container">
        {/* Tab Toggle */}
        <div className="bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl flex">
          <button type="button" onClick={() => setActiveTab('inflow')}
            className={`flex-1 ${TOGGLE_BTN_BASE} text-sm ${activeTab === 'inflow' ? TOGGLE_BTN_ACTIVE_EMERALD : TOGGLE_BTN_INACTIVE}`}>
            Ingresos ({inflowCategories.length})
          </button>
          <button type="button" onClick={() => setActiveTab('outflow')}
            className={`flex-1 ${TOGGLE_BTN_BASE} text-sm ${activeTab === 'outflow' ? TOGGLE_BTN_ACTIVE_RED : TOGGLE_BTN_INACTIVE}`}>
            Gastos ({outflowCategories.length})
          </button>
        </div>

        {/* Inflow Categories */}
        {activeTab === 'inflow' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">Categorías disponibles para clasificar ingresos</p>
            <div className="flex gap-2">
              <input type="text" value={newInflowCategory} onChange={(e) => setNewInflowCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddInflowCategory()}
                placeholder="Nueva categoría de ingreso"
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <button type="button" onClick={handleAddInflowCategory}
                disabled={!newInflowCategory.trim() || inflowCategories.includes(newInflowCategory.trim())}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center">
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {inflowCategories.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No hay categorías de ingresos</p>
                  <p className="text-sm mt-1">Agrega una nueva categoría arriba</p>
                </div>
              ) : (
                inflowCategories.map((category, index) => (
                  <div key={index}
                    className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    {editingInflowIndex === index ? (
                      <>
                        <input type="text" value={editingInflowValue} onChange={(e) => setEditingInflowValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditInflow(); if (e.key === 'Escape') handleCancelEditInflow(); }}
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus />
                        <button type="button" onClick={handleSaveEditInflow} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors">✓</button>
                        <button type="button" onClick={handleCancelEditInflow} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">✕</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{category}</span>
                        <button type="button" onClick={() => handleStartEditInflow(index)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={() => handleDeleteInflowCategory(index)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Outflow Categories */}
        {activeTab === 'outflow' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">Categorías disponibles para clasificar gastos</p>
            <div className="flex gap-2">
              <input type="text" value={newOutflowCategory} onChange={(e) => setNewOutflowCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOutflowCategory()}
                placeholder="Nueva categoría de gasto"
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
              <button type="button" onClick={handleAddOutflowCategory}
                disabled={!newOutflowCategory.trim() || outflowCategories.includes(newOutflowCategory.trim())}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center">
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {outflowCategories.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No hay categorías de gastos</p>
                  <p className="text-sm mt-1">Agrega una nueva categoría arriba</p>
                </div>
              ) : (
                outflowCategories.map((category, index) => (
                  <div key={index}
                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    {editingOutflowIndex === index ? (
                      <>
                        <input type="text" value={editingOutflowValue} onChange={(e) => setEditingOutflowValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditOutflow(); if (e.key === 'Escape') handleCancelEditOutflow(); }}
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" autoFocus />
                        <button type="button" onClick={handleSaveEditOutflow} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors">✓</button>
                        <button type="button" onClick={handleCancelEditOutflow} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">✕</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{category}</span>
                        <button type="button" onClick={() => handleStartEditOutflow(index)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={() => handleDeleteOutflowCategory(index)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className={FORM_FOOTER}>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button type="button" onClick={handleSave} className={BTN_FOOTER_PRIMARY}>Guardar</button>
          <button type="button" onClick={onCancel} className={BTN_FOOTER_SECONDARY}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PaymentMethodsEditorView
// =============================================================================
interface PaymentMethodsEditorViewProps {
  paymentMethods: string[];
  onSave: (methods: string[]) => void;
  onCancel: () => void;
}

export const PaymentMethodsEditorView: React.FC<PaymentMethodsEditorViewProps> = ({
  paymentMethods: initialMethods,
  onSave,
  onCancel
}) => {
  const [methods, setMethods] = useState<string[]>(initialMethods);
  const [newMethod, setNewMethod] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAddMethod = () => {
    if (newMethod.trim() && !methods.includes(newMethod.trim())) {
      setMethods([...methods, newMethod.trim()]);
      setNewMethod('');
    }
  };

  const handleDeleteMethod = (index: number) => {
    setMethods(methods.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(methods[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const trimmedValue = editingValue.trim();
      const isDuplicate = methods.some((m, i) => i !== editingIndex && m === trimmedValue);
      if (!isDuplicate) {
        const newMethods = [...methods];
        newMethods[editingIndex] = trimmedValue;
        setMethods(newMethods);
      }
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleSave = () => {
    onSave(methods);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-container">
        <p className="text-sm text-slate-500 dark:text-slate-400">Configura los métodos de pago disponibles para registrar transacciones</p>
        <div className="flex gap-2">
          <input type="text" value={newMethod} onChange={(e) => setNewMethod(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMethod()}
            placeholder="Nuevo método de pago"
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <button type="button" onClick={handleAddMethod}
            disabled={!newMethod.trim() || methods.includes(newMethod.trim())}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center">
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {methods.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>No hay métodos de pago configurados</p>
              <p className="text-sm mt-1">Agrega un nuevo método arriba</p>
            </div>
          ) : (
            methods.map((method, index) => (
              <div key={index}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl">
                {editingIndex === index ? (
                  <>
                    <input type="text" value={editingValue} onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus />
                    <button type="button" onClick={handleSaveEdit} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors">✓</button>
                    <button type="button" onClick={handleCancelEdit} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">✕</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{method}</span>
                    <button type="button" onClick={() => handleStartEdit(index)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={() => handleDeleteMethod(index)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={FORM_FOOTER}>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button type="button" onClick={handleSave} className={BTN_FOOTER_PRIMARY}>Guardar</button>
          <button type="button" onClick={onCancel} className={BTN_FOOTER_SECONDARY}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};
