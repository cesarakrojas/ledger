/**
 * list/DetailRow.tsx - Reusable Detail Row Component
 * 
 * A consistent row component for displaying label-value pairs in detail views.
 * Used in transaction details, debt details, and other detail panels.
 */

import React from 'react';

export interface DetailRowProps {
  /** The label text displayed on the left */
  label: string;
  /** The value text displayed on the right */
  value: string;
  /** Whether to use monospace font for the value (useful for IDs, codes) */
  monospace?: boolean;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  monospace = false
}) => (
  <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span
      className={`text-sm font-medium text-slate-900 dark:text-slate-100 ${
        monospace ? 'font-mono text-xs' : ''
      } text-right max-w-[60%] truncate`}
    >
      {value}
    </span>
  </div>
);
