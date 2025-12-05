import React, { useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from './icons';
import { FORM_FOOTER } from '../utils/constants';
import { BTN_FOOTER_PRIMARY, BTN_FOOTER_SECONDARY } from '../utils/styleConstants';

interface CategoryEditorViewProps {
  inflowCategories: string[];
  outflowCategories: string[];
  onSave: (inflowCategories: string[], outflowCategories: string[]) => void;
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
    if (editingInflowIndex !== null && editingInflowValue.trim()) {
      // Allow same value (no change) or new unique value
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
    onSave(inflowCategories, outflowCategories);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-container">
        
        {/* Tab Toggle */}
        <div className="bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl flex">
          <button
            type="button"
            onClick={() => setActiveTab('inflow')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'inflow'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Ingresos ({inflowCategories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outflow')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'outflow'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Gastos ({outflowCategories.length})
          </button>
        </div>

        {/* Inflow Categories */}
        {activeTab === 'inflow' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Categorías disponibles para clasificar ingresos
            </p>

            {/* Add New Category */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newInflowCategory}
                onChange={(e) => setNewInflowCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddInflowCategory()}
                placeholder="Nueva categoría de ingreso"
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddInflowCategory}
                disabled={!newInflowCategory.trim() || inflowCategories.includes(newInflowCategory.trim())}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Category List */}
            <div className="space-y-2">
              {inflowCategories.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No hay categorías de ingresos</p>
                  <p className="text-sm mt-1">Agrega una nueva categoría arriba</p>
                </div>
              ) : (
                inflowCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl"
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
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveEditInflow}
                          className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditInflow}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{category}</span>
                        <button
                          type="button"
                          onClick={() => handleStartEditInflow(index)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInflowCategory(index)}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                        >
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Categorías disponibles para clasificar gastos
            </p>

            {/* Add New Category */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newOutflowCategory}
                onChange={(e) => setNewOutflowCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOutflowCategory()}
                placeholder="Nueva categoría de gasto"
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={handleAddOutflowCategory}
                disabled={!newOutflowCategory.trim() || outflowCategories.includes(newOutflowCategory.trim())}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Category List */}
            <div className="space-y-2">
              {outflowCategories.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No hay categorías de gastos</p>
                  <p className="text-sm mt-1">Agrega una nueva categoría arriba</p>
                </div>
              ) : (
                outflowCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
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
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveEditOutflow}
                          className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditOutflow}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{category}</span>
                        <button
                          type="button"
                          onClick={() => handleStartEditOutflow(index)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOutflowCategory(index)}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                        >
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

      {/* Sticky Footer */}
      <div className={FORM_FOOTER}>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={handleSave}
            className={BTN_FOOTER_PRIMARY}
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={BTN_FOOTER_SECONDARY}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
