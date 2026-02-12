'use client';

import { InputHTMLAttributes, forwardRef, useState, useCallback } from 'react';

interface ColorPickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ label, value, onChange, className = '', ...props }, ref) => {
    const [hexInput, setHexInput] = useState<string | null>(null);

    const handleHexChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setHexInput(raw);

        // Auto-add # prefix
        const normalized = raw.startsWith('#') ? raw : `#${raw}`;
        if (HEX_REGEX.test(normalized) && onChange) {
          // Create a synthetic event matching the color input's onChange signature
          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: normalized.toLowerCase() },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      },
      [onChange]
    );

    const handleHexBlur = useCallback(() => {
      setHexInput(null);
    }, []);

    const displayValue = hexInput !== null ? hexInput : (value as string) || '#000000';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-zinc-400 mb-1.5">{label}</label>
        )}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <input
              ref={ref}
              type="color"
              value={value}
              onChange={onChange}
              className={`w-10 h-10 rounded-lg cursor-pointer border-2 border-zinc-700
                bg-transparent [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none
                [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-none ${className}`}
              {...props}
            />
          </div>
          <input
            type="text"
            value={displayValue}
            onChange={handleHexChange}
            onBlur={handleHexBlur}
            onFocus={(e) => e.target.select()}
            maxLength={7}
            spellCheck={false}
            className="text-sm text-zinc-400 font-mono uppercase bg-transparent border-none
              outline-none w-[5.5rem] focus:text-zinc-200 selection:bg-violet-500/30"
          />
        </div>
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';
