/**
 * POSPage.tsx - Point of Sale module scaffold
 *
 * Mobile-first single-screen POS experience that fits the app's visual style.
 */

import React, { useMemo, useState } from 'react';
import { SearchIcon, CreditCardIcon, UserIcon, DocumentTextIcon } from '../../components/icons';
import { POSService } from '../../services';
import { formatCurrency } from '../../shared/formatters';

// Local mock data adapted from provided implementation
const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'grains', name: 'Grains & Nuts' },
  { id: 'drinks', name: 'Soft Drinks' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'sweets', name: 'Sweets' },
  { id: 'wellness', name: 'Wellness' },
];

const PRODUCTS = [
  { id: '1', name: 'American Almonds', price: 12.71, category: 'grains', unit: 'kg' },
  { id: '2', name: 'Kombucha (Pineapple)', price: 4.36, category: 'drinks', unit: 'Units' },
  { id: '3', name: 'Dark Fantasy Choco', price: 13.31, category: 'sweets', unit: 'Units' },
  { id: '4', name: 'Cheddar Cheese', price: 8.5, category: 'dairy', unit: 'kg' },
  { id: '5', name: 'Chickpeas Dry', price: 5.2, category: 'grains', unit: 'kg' },
  { id: '6', name: 'Coca Cola', price: 1.5, category: 'drinks', unit: 'Units' },
  { id: '7', name: 'Corn Flakes', price: 4.99, category: 'grains', unit: 'Box' },
  { id: '8', name: 'Energy Drink', price: 2.99, category: 'drinks', unit: 'Can' },
  { id: '9', name: 'Potato Chips', price: 3.49, category: 'sweets', unit: 'Bag' },
  { id: '10', name: 'Instant Noodles', price: 1.2, category: 'grains', unit: 'Cup' },
];

const ProductCard: React.FC<{ product: any; onAdd: (p: any) => void }> = ({ product, onAdd }) => {
  const getBgColor = (type: string) => {
    switch (type) {
      case 'grains': return 'bg-orange-100 text-orange-600';
      case 'drinks': return 'bg-red-100 text-red-600';
      case 'sweets': return 'bg-amber-100 text-amber-700';
      case 'dairy': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div onClick={() => onAdd(product)} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col active:scale-95 transition-transform duration-100 touch-manipulation h-full">
      <div className={`h-24 sm:h-32 w-full flex items-center justify-center ${getBgColor(product.category)}`}>
        <div className="w-8 h-8 opacity-50" />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-medium text-slate-800 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
        <div className="mt-auto pt-2 flex justify-between items-center">
          <span className="font-bold text-slate-900">{formatCurrency(product.price)}</span>
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

const NumpadComp: React.FC<{ value: string; onChange: (s: string) => void; onAction: (a: string) => void }> = ({ value, onChange, onAction }) => {
  const keys = ['1','2','3','Qty','4','5','6','%','7','8','9','Price','+/-','0','.','⌫'];
  const handlePress = (key: string) => {
    if (['Qty','%','Price'].includes(key)) { onAction(key); return; }
    if (key === '⌫') { onChange(value.length > 1 ? value.slice(0,-1) : '0'); return; }
    if (value === '0' && key !== '.') onChange(key);
    else { if (key === '.' && value.includes('.')) return; onChange(value + key); }
  };

  return (
    <div className="grid grid-cols-4 gap-2 p-2 bg-slate-50 rounded-xl">
      {keys.map(k => (
        <button key={k} onClick={() => handlePress(k)} className={`h-12 rounded-lg font-semibold text-lg flex items-center justify-center active:scale-95 transition-transform ${['Qty','%','Price'].includes(k) ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : ''} ${k === '⌫' ? 'bg-red-50 text-red-500 border border-red-100' : ''} ${!['Qty','%','Price','⌫'].includes(k) ? 'bg-white border border-slate-200 text-slate-700 shadow-sm' : ''}`}>{k}</button>
      ))}
    </div>
  );
};

const POSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products'|'cart'>('products');
  const [cartLocal, setCartLocal] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [numpadValue, setNumpadValue] = useState('0');

  const subtotal = useMemo(() => cartLocal.reduce((s, it) => s + (it.price * it.qty), 0), [cartLocal]);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const filteredProducts = useMemo(() => PRODUCTS.filter(p => (selectedCategory === 'all' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase())), [selectedCategory, searchQuery]);

  const addToCart = (product: any) => {
    setCartLocal(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartItem = (id: string, updates: any) => setCartLocal(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const removeFromCart = (id: string) => { setCartLocal(prev => prev.filter(i => i.id !== id)); if (editingItem?.id === id) setEditingItem(null); };

  const handleNumpadAction = (action: string) => {
    if (!editingItem) return;
    const val = parseFloat(numpadValue);
    if (Number.isNaN(val)) return;
    if (action === 'Qty') updateCartItem(editingItem.id, { qty: val });
    else if (action === 'Price') updateCartItem(editingItem.id, { price: val });
    else if (action === '%') {
      const currentPrice = editingItem.price;
      const newPrice = currentPrice - (currentPrice * (val / 100));
      updateCartItem(editingItem.id, { price: newPrice });
    }
    setNumpadValue('0');
  };

  const openItemEditor = (item: any) => { setEditingItem(item); setNumpadValue(String(item.qty)); };

  const proceedPayment = () => {
    // Use POSService to complete sale; map cartLocal to expected shape
    const items = cartLocal.map(i => ({ product: i, quantity: i.qty, unitPrice: i.price }));
    POSService.completeSale(items, 'cash');
    setCartLocal([]);
    setActiveTab('products');
    alert('Payment processed');
  };

  return (
    <div className="w-full h-full animate-fade-in flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-bold text-xl text-slate-800">POS<span className="text-emerald-600">Lite</span></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">A</div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ${activeTab === 'products' ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="bg-white px-4 py-3 shadow-sm z-10">
            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-24">
            <div className="grid grid-cols-2 gap-3 pb-8">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
            </div>
          </div>
        </div>

        <div className={`absolute inset-0 bg-white flex flex-col transition-transform duration-300 ${activeTab === 'cart' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveTab('products')} className="p-1 -ml-1 text-slate-500">Back</button>
              <h2 className="font-bold text-lg">Current Order</h2>
            </div>
            <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Guest</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartLocal.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <div className="w-16 h-16 mb-4" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartLocal.map(item => (
                  <div key={item.id} onClick={() => openItemEditor(item)} className={`relative p-3 rounded-xl border flex justify-between items-start transition-colors cursor-pointer ${editingItem?.id === item.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div>
                      <h4 className="font-medium text-slate-900">{item.name}</h4>
                      <div className="text-xs text-slate-500 mt-1 flex gap-2"><span>{item.qty} x {formatCurrency(item.price)} / {item.unit}</span></div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{formatCurrency(item.price * item.qty)}</div>
                      {editingItem?.id === item.id && <div className="text-xs text-indigo-600 font-medium mt-1">Editing</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {editingItem ? (
              <div className="p-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-slate-500 text-sm">Editing: <span className="text-slate-900">{editingItem.name}</span></span>
                  <div className="flex gap-2">
                    <button onClick={() => removeFromCart(editingItem.id)} className="p-2 text-red-500 bg-red-50 rounded-lg">Remove</button>
                    <button onClick={() => setEditingItem(null)} className="p-2 text-slate-500 bg-slate-100 rounded-lg">Close</button>
                  </div>
                </div>

                <div className="flex gap-3 mb-3">
                  <div className="flex-1 bg-slate-100 rounded-lg flex flex-col justify-center px-4 py-2">
                    <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Input</span>
                    <span className="text-2xl font-mono text-slate-900">{numpadValue}</span>
                  </div>
                  <div className="flex-none w-24 bg-white border border-slate-200 rounded-lg flex flex-col justify-center items-center">
                    <span className="text-xs text-slate-400">Current Qty</span>
                    <span className="text-xl font-bold text-emerald-600">{editingItem.qty}</span>
                  </div>
                </div>

                <NumpadComp value={numpadValue} onChange={setNumpadValue} onAction={handleNumpadAction} />
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex flex-col items-center justify-center py-2 bg-slate-50 rounded-lg border border-slate-100">
                    <UserIcon className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-xs font-medium text-slate-600">Customer</span>
                  </button>
                  <button className="flex flex-col items-center justify-center py-2 bg-slate-50 rounded-lg border border-slate-100">
                    <DocumentTextIcon className="w-5 h-5 text-slate-500 mb-1" />
                    <span className="text-xs font-medium text-slate-600">Note</span>
                  </button>
                  <button className="flex flex-col items-center justify-center py-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-5 h-5 text-slate-500 mb-1" />
                    <span className="text-xs font-medium text-slate-600">Actions</span>
                  </button>
                </div>

                <div className="space-y-1 pt-2 border-t border-dashed border-slate-200">
                  <div className="flex justify-between text-slate-500 text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-slate-500 text-sm"><span>Taxes (10%)</span><span>{formatCurrency(tax)}</span></div>
                  <div className="flex justify-between text-slate-900 font-bold text-xl pt-1"><span>Total</span><span>{formatCurrency(total)}</span></div>
                </div>

                <button onClick={proceedPayment} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                  <CreditCardIcon className="w-5 h-5" />
                  Payment {formatCurrency(total)}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`absolute bottom-6 left-4 right-4 z-30 transition-all duration-300 transform ${activeTab === 'products' && cartLocal.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <button onClick={() => setActiveTab('cart')} className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">{cartLocal.reduce((a,b) => a + b.qty, 0)} items</div>
              <span className="text-sm text-slate-300">View Cart</span>
            </div>
            <div className="font-bold text-lg">{formatCurrency(total)}</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
