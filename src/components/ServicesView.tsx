import React, { useState, useEffect, useCallback, memo } from 'react';
import type { Service } from '../types';
import { PlusIcon, ServicesIcon } from './icons';
import { formatCurrency } from '../utils/formatters';
import * as serviceService from '../services/serviceService';
import { CARD_STYLES, LIST_ITEM_INTERACTIVE } from '../utils/styleConstants';
import { TEXT_PAGE_TITLE, BTN_ACTION_PRIMARY } from '../utils/constants';
import { useDebouncedValue } from '../utils/performanceUtils';

interface ServicesViewProps {
  viewMode?: 'list' | 'create' | 'edit' | 'detail';
  editingServiceId?: string | null;
  currencyCode: string;
  onChangeView?: (mode: 'list' | 'create' | 'edit' | 'detail', serviceId?: string) => void;
}

// Memoized filter controls
interface ServiceFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  showActiveOnly: boolean;
  setShowActiveOnly: (show: boolean) => void;
  categories: string[];
}

const ServiceFilters = memo<ServiceFiltersProps>(({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  showActiveOnly, 
  setShowActiveOnly, 
  categories 
}) => {
  return (
    <div className={CARD_STYLES}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Buscar servicios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
        />
        <div className="grid grid-cols-2 gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
          >
            <option value="">Categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-slate-700 dark:text-slate-200">Solo activos</span>
          </label>
        </div>
      </div>
    </div>
  );
});

ServiceFilters.displayName = 'ServiceFilters';

export const ServicesView: React.FC<ServicesViewProps> = ({ 
  currencyCode,
  onChangeView 
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    inactiveServices: 0
  });
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Load services
  const loadServices = useCallback(() => {
    const filters = {
      searchTerm: debouncedSearchTerm || undefined,
      category: selectedCategory || undefined,
      activeOnly: showActiveOnly || undefined
    };
    const loadedServices = serviceService.getAllServices(filters);
    setServices(loadedServices);
    setStats(serviceService.getServiceStats());
  }, [debouncedSearchTerm, selectedCategory, showActiveOnly]);

  useEffect(() => {
    loadServices();
    setCategories(serviceService.getCategories());

    // Subscribe to changes
    const unsubscribe = serviceService.subscribeToServices(() => {
      loadServices();
      setCategories(serviceService.getCategories());
    });

    return unsubscribe;
  }, [debouncedSearchTerm, selectedCategory, showActiveOnly]);

  const handleCreateService = () => {
    if (onChangeView) onChangeView('create');
  };

  const handleViewService = (service: Service) => {
    if (onChangeView) onChangeView('detail', service.id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className={CARD_STYLES}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className={TEXT_PAGE_TITLE}>Servicios</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gestiona tus servicios disponibles
            </p>
          </div>
          <button
            onClick={handleCreateService}
            className={BTN_ACTION_PRIMARY}
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Servicio
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Servicios</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.totalServices}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Activos</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.activeServices}</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl hidden md:block">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Inactivos</p>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{stats.inactiveServices}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ServiceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showActiveOnly={showActiveOnly}
        setShowActiveOnly={setShowActiveOnly}
        categories={categories}
      />

      {/* Services List */}
      <div className={CARD_STYLES}>
        {services.length === 0 ? (
          <div>
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <ServicesIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No hay servicios registrados</h3>
            <button
              onClick={handleCreateService}
              className="mt-4 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Crear tu primer servicio
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700 -mx-2">
            {services.map(service => {
              // Determine Status Logic per service
              let statusColor = "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300";
              let statusText = "Activo";

              if (!service.isActive) {
                statusColor = "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
                statusText = "Inactivo";
              }

              return (
                <li
                  key={service.id}
                  onClick={() => handleViewService(service)}
                  className={LIST_ITEM_INTERACTIVE}
                >
                  {/* MAIN FLEX CONTAINER: Vertically centered */}
                  <div className="flex items-center justify-between gap-4 w-full">
                    
                    {/* LEFT SIDE: min-w-0 prevents text from pushing the price off screen */}
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      
                      {/* ICON */}
                      <div className={`p-3 rounded-xl shrink-0 ${
                        service.isActive 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        <ServicesIcon className="w-6 h-6" />
                      </div>

                      {/* TEXT CONTENT */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {service.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-1">
                          {service.description || 'Sin descripción'}
                        </p>

                        {/* COMPACT TAGS ROW */}
                        <div className="flex items-center gap-3 mt-1.5">
                          {/* Status Badge */}
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md ${statusColor}`}>
                            {statusText}
                          </span>
                          
                          {/* Category */}
                          {service.category && (
                            <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-600">
                              {service.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE: PRICE - shrink-0 ensures it stays visible */}
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <div className="text-xl sm:text-2xl font-bold whitespace-nowrap flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400">
                        <span>{formatCurrency(service.price, currencyCode)}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Por servicio
                      </span>
                    </div>
                    
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

    </div>
  );
};
