'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface ColorPickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ label, value, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-zinc-400 mb-1.5">{label}</label>
        )}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              ref={ref}
              type="color"
              value={value}
              className={`w-10 h-10 rounded-lg cursor-pointer border-2 border-zinc-700 
                bg-transparent [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none
                [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-none ${className}`}
              {...props}
            />
          </div>
          <span className="text-sm text-zinc-400 font-mono uppercase">{value}</span>
        </div>
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';



