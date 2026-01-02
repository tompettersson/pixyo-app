'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-zinc-400 mb-1.5">{label}</label>
        )}
        <select
          ref={ref}
          className={`w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
            transition-all cursor-pointer ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';





