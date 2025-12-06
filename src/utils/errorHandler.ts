/**
 * Centralized error handling and user notification system
 */

export interface AppError {
  type: 'storage' | 'network' | 'validation' | 'unknown';
  message: string;
  details?: string;
  timestamp: string;
}

export type ErrorHandler = (error: AppError) => void;

let errorHandlers: ErrorHandler[] = [];

/**
 * Register an error handler (e.g., to show toast notifications)
 */
export const registerErrorHandler = (handler: ErrorHandler): (() => void) => {
  errorHandlers.push(handler);
  
  // Return unsubscribe function
  return () => {
    errorHandlers = errorHandlers.filter(h => h !== handler);
  };
};

/**
 * Report an error to all registered handlers
 */
export const reportError = (error: AppError): void => {
  // Log to console for debugging
  console.error('[AppError]', error.type, error.message, error.details);
  
  // Notify all handlers
  errorHandlers.forEach(handler => {
    try {
      handler(error);
    } catch (e) {
      console.error('Error in error handler:', e);
    }
  });
};

/**
 * Create an error object
 */
export const createError = (
  type: AppError['type'],
  message: string,
  details?: string
): AppError => ({
  type,
  message,
  details,
  timestamp: new Date().toISOString(),
});

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  STORAGE_FULL: 'El almacenamiento está lleno. No se pudo guardar.',
  STORAGE_ERROR: 'Error al acceder al almacenamiento local.',
  PARSE_ERROR: 'Error al procesar los datos.',
  NOT_FOUND: 'El elemento solicitado no existe.',
  VALIDATION_ERROR: 'Los datos proporcionados no son válidos.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado.',
} as const;
