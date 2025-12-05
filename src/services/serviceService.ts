import type { Service, ServiceFilters } from '../types';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { generateId } from '../utils/idGenerator';
import { reportError, createError, ERROR_MESSAGES } from '../utils/errorHandler';
import { createStorageAccessor } from '../utils/performanceUtils';

const STORAGE_KEY = STORAGE_KEYS.SERVICES;

// Create storage accessor for services
const serviceStorage = createStorageAccessor<Service>(
  STORAGE_KEY,
  {
    loadErrorMsg: 'Error al cargar servicios',
    saveErrorMsg: 'Error al guardar servicios',
    storageFullMsg: ERROR_MESSAGES.STORAGE_FULL,
    dispatchEvents: true
  },
  (error) => reportError(createError(error.type as 'storage', error.message, error.details))
);

// Get all services with optional filters
export const getAllServices = (filters?: ServiceFilters): Service[] => {
  let services = serviceStorage.get();
  
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    services = services.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.description?.toLowerCase().includes(term) ||
      s.category?.toLowerCase().includes(term)
    );
  }
  
  if (filters?.category) {
    services = services.filter(s => s.category === filters.category);
  }
  
  if (filters?.activeOnly) {
    services = services.filter(s => s.isActive);
  }
  
  return services.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

// Get only active services (for selection lists)
export const getActiveServices = (): Service[] => {
  return getAllServices({ activeOnly: true });
};

// Create a new service with error handling
export const createService = (
  name: string,
  price: number,
  description?: string,
  category?: string,
  isActive: boolean = true
): Service | null => {
  try {
    // Validation
    if (!name || name.trim().length === 0) {
      reportError(createError('validation', 'El nombre del servicio es requerido'));
      return null;
    }
    
    if (price < 0) {
      reportError(createError('validation', 'El precio debe ser mayor o igual a cero'));
      return null;
    }
    
    const services = serviceStorage.get();
    
    const newService: Service = {
      id: generateId(),
      name: name.trim(),
      description: description?.trim(),
      price,
      isActive,
      category: category?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    services.push(newService);
    const saved = serviceStorage.save(services);
    
    if (!saved) {
      return null;
    }
    
    return newService;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    reportError(createError('storage', 'Error al crear servicio', errorMsg));
    return null;
  }
};

// Update an existing service with error handling
export const updateService = (
  serviceId: string,
  updates: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    isActive?: boolean;
  }
): Service | null => {
  try {
    const services = serviceStorage.get();
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    
    if (serviceIndex === -1) {
      reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Servicio no encontrado'));
      return null;
    }
    
    const currentService = services[serviceIndex];
    
    const updatedService: Service = {
      ...currentService,
      name: updates.name?.trim() || currentService.name,
      description: updates.description?.trim(),
      price: updates.price !== undefined ? updates.price : currentService.price,
      category: updates.category?.trim(),
      isActive: updates.isActive !== undefined ? updates.isActive : currentService.isActive,
      updatedAt: new Date().toISOString()
    };
    
    services[serviceIndex] = updatedService;
    const saved = serviceStorage.save(services);
    
    if (!saved) {
      return null;
    }
    
    return updatedService;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    reportError(createError('storage', 'Error al actualizar servicio', errorMsg));
    return null;
  }
};

// Delete a service with error handling
export const deleteService = (serviceId: string): boolean => {
  try {
    const services = serviceStorage.get();
    const serviceExists = services.some(s => s.id === serviceId);
    
    if (!serviceExists) {
      reportError(createError('validation', ERROR_MESSAGES.NOT_FOUND, 'Servicio no encontrado'));
      return false;
    }
    
    const filteredServices = services.filter(s => s.id !== serviceId);
    return serviceStorage.save(filteredServices);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    reportError(createError('storage', 'Error al eliminar servicio', errorMsg));
    return false;
  }
};

// Toggle service active status
export const toggleServiceStatus = (serviceId: string): Service | null => {
  const service = getServiceById(serviceId);
  if (!service) return null;
  
  return updateService(serviceId, { isActive: !service.isActive });
};

// Get service by ID
export const getServiceById = (serviceId: string): Service | null => {
  const services = serviceStorage.get();
  return services.find(s => s.id === serviceId) || null;
};

// Get all unique categories from services
export const getCategories = (): string[] => {
  const services = serviceStorage.get();
  const categories = services
    .map(s => s.category)
    .filter((c): c is string => !!c);
  return Array.from(new Set(categories)).sort();
};

// Get service stats
export const getServiceStats = (): {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
} => {
  const services = serviceStorage.get();
  const activeServices = services.filter(s => s.isActive).length;
  
  return {
    totalServices: services.length,
    activeServices,
    inactiveServices: services.length - activeServices
  };
};

// Subscribe to service changes
export const subscribeToServices = (callback: (services: Service[]) => void): () => void => {
  callback(serviceStorage.get());
  
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(serviceStorage.get());
    }
  };
  
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};
