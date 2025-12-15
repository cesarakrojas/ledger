import React, { useState } from 'react';
import { FORM_FOOTER, BTN_FOOTER_PRIMARY, BTN_FOOTER_SECONDARY } from '../SharedDefs';
import { PlusIcon, TrashIcon, PencilIcon } from '../UIComponents';

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
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-container">
        
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configura los métodos de pago disponibles para registrar transacciones
        </p>

        {/* Add New Method */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMethod}
            onChange={(e) => setNewMethod(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMethod()}
            placeholder="Nuevo método de pago"
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleAddMethod}
            disabled={!newMethod.trim() || methods.includes(newMethod.trim())}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Methods List */}
        <div className="space-y-2">
          {methods.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>No hay métodos de pago configurados</p>
              <p className="text-sm mt-1">Agrega un nuevo método arriba</p>
            </div>
          ) : (
            methods.map((method, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl"
              >
                {editingIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{method}</span>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(index)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMethod(index)}
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
