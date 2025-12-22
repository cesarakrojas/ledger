/**
 * BarcodeScanner.tsx - Barcode Scanner Components
 * 
 * Reusable barcode scanning UI components:
 * - BarcodeScannerModal: Full-screen modal with camera viewfinder
 * - BarcodeScanButton: Trigger button for opening scanner
 * 
 * The actual barcode detection logic is stubbed for later implementation.
 * This provides the complete UI/UX experience.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '../icons';

// =============================================================================
// Types
// =============================================================================

export interface BarcodeScanResult {
  barcode: string;
  format?: string;
}

export interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: BarcodeScanResult) => void;
  title?: string;
  subtitle?: string;
}

export interface BarcodeScanButtonProps {
  onScan: (result: BarcodeScanResult) => void;
  title?: string;
  subtitle?: string;
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

// =============================================================================
// BarcodeIcon Component (inline for this file)
// =============================================================================

const ScannerIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || 'w-6 h-6'}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
  </svg>
);

// =============================================================================
// BarcodeScannerModal Component
// =============================================================================

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Escanear Código',
  subtitle = 'Apunta la cámara al código de barras',
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setManualInput('');
      setShowManualInput(false);
      setError(null);
    } else {
      setIsScanning(false);
    }
  }, [isOpen]);

  // Simulate scanner initialization
  useEffect(() => {
    if (!isOpen || !isScanning) return;

    // TODO: Initialize actual barcode scanner here
    // This is where you would integrate a library like:
    // - @aspect-app/react-barcode-scanner
    // - html5-qrcode
    // - quagga2
    // - zxing-js/browser

    // For now, we just show the UI
    console.log('[BarcodeScanner] Scanner initialized (stub)');

    return () => {
      // TODO: Cleanup scanner
      console.log('[BarcodeScanner] Scanner cleanup (stub)');
    };
  }, [isOpen, isScanning]);

  // Handle manual barcode submission
  const handleManualSubmit = useCallback(() => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      setError('Ingresa un código válido');
      return;
    }
    
    onScan({ barcode: trimmed, format: 'manual' });
    onClose();
  }, [manualInput, onScan, onClose]);

  // Simulate a scan for demo purposes (remove in production)
  const handleSimulateScan = useCallback(() => {
    // Generate a random barcode for testing
    const randomBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000;
    onScan({ barcode: randomBarcode.toString(), format: 'EAN-13' });
    onClose();
  }, [onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm">
        <div>
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <p className="text-white/70 text-sm">{subtitle}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Cerrar escáner"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Scanner Viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        {/* Camera preview placeholder */}
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          {/* Simulated camera view with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800" />
          
          {/* Scanning frame overlay */}
          <div className="relative z-10 w-72 h-72">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-emerald-500 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-emerald-500 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-emerald-500 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-emerald-500 rounded-br-lg" />
            
            {/* Scanning line animation */}
            <div className="absolute left-4 right-4 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-scan-line" />
            
            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 rounded-full" />
            </div>
          </div>

          {/* Instructions text */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white/80 text-sm mb-2">
              Coloca el código de barras dentro del marco
            </p>
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Escaneando...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-black/90 backdrop-blur-sm px-4 py-4 space-y-3 safe-area-bottom">
        {error && (
          <div className="text-red-400 text-sm text-center bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {showManualInput ? (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => {
                  setManualInput(e.target.value);
                  setError(null);
                }}
                placeholder="Ingresa el código manualmente"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowManualInput(false)}
                className="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleManualSubmit}
                className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Demo scan button - remove in production */}
            <button
              onClick={handleSimulateScan}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <ScannerIcon className="w-5 h-5" />
              Simular Escaneo (Demo)
            </button>
            
            <button
              onClick={() => setShowManualInput(true)}
              className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
            >
              Ingresar código manualmente
            </button>
          </div>
        )}
      </div>

      {/* CSS for scan line animation */}
      <style>{`
        @keyframes scan-line {
          0%, 100% { top: 1rem; }
          50% { top: calc(100% - 1rem); }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
        .safe-area-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
};

// =============================================================================
// BarcodeScanButton Component
// =============================================================================

export const BarcodeScanButton: React.FC<BarcodeScanButtonProps> = ({
  onScan,
  title,
  subtitle,
  className = '',
  iconOnly = false,
  size = 'md',
  variant = 'secondary',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScan = useCallback((result: BarcodeScanResult) => {
    onScan(result);
    setIsModalOpen(false);
  }, [onScan]);

  // Size classes
  const sizeClasses = {
    sm: iconOnly ? 'p-1.5' : 'px-2.5 py-1.5 text-xs',
    md: iconOnly ? 'p-2' : 'px-3 py-2 text-sm',
    lg: iconOnly ? 'p-3' : 'px-4 py-2.5 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm',
    secondary: 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent',
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`
          inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-colors
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        aria-label="Escanear código de barras"
      >
        <ScannerIcon className={iconSizeClasses[size]} />
        {!iconOnly && <span>Escanear</span>}
      </button>

      <BarcodeScannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScan={handleScan}
        title={title}
        subtitle={subtitle}
      />
    </>
  );
};

// =============================================================================
// Exports
// =============================================================================

export default BarcodeScannerModal;
