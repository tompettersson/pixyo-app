'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-zinc-400 mb-1.5">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 
            placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
            transition-all ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';




