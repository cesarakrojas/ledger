import React from 'react';
import { BTN_ACTION_PRIMARY } from '../../utils/constants';

export interface NotFoundViewProps {
  message: string;
  buttonLabel: string;
  onBack: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  message,
  buttonLabel,
  onBack,
}) => {
  return (
    <div className="w-full h-full max-w-4xl mx-auto flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-slate-600 dark:text-slate-400">{message}</p>
        <button
          onClick={onBack}
          className={BTN_ACTION_PRIMARY + ' mt-4'}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};
