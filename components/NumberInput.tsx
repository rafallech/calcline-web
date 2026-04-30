"use client";

import type { ChangeEvent } from "react";

type NumberInputProps = {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
};

export function NumberInput({
  id,
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
  placeholder,
  disabled = false,
}: NumberInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex min-h-10 overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-cyan-700 focus-within:ring-2 focus-within:ring-cyan-700/20">
        <input
          id={id}
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-slate-950 outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
        {unit ? (
          <span className="flex min-w-14 items-center justify-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}
