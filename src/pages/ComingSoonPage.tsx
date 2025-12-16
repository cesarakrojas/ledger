/**
 * ComingSoonPage.tsx - Placeholder for upcoming features
 */

import React from 'react';
import { CARD_EMPTY_STATE } from '../shared';
import { QuestionMarkIcon } from '../components';

const ComingSoonPage: React.FC = () => {
  return (
    <div className="w-full animate-fade-in space-y-6">
      <div className={CARD_EMPTY_STATE}>
        <QuestionMarkIcon className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Próximamente</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Estamos trabajando en algo nuevo para ti.</p>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-3 font-medium">¡Mantente atento!</p>
      </div>
    </div>
  );
};

export default ComingSoonPage;
