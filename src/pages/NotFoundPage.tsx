/**
 * NotFoundPage.tsx - 404 page for unmatched routes
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CARD_EMPTY_STATE } from '../SharedDefs';
import { paths } from '../routes';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full animate-fade-in space-y-6">
      <div className={CARD_EMPTY_STATE}>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Página no encontrada</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          La página que buscas no existe o ha sido movida.
        </p>
        <button
          onClick={() => navigate(paths.home())}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/30 transition-colors"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
