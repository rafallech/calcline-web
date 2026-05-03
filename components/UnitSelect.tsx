"use client";

import type { ChangeEvent } from "react";

export type UnitOption = {
  value: string;
  label: string;
};

type UnitSelectProps = {
  id: string;
  label: string;
  value: string;
  options: UnitOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  description?: string;
};

export function UnitSelect({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  description,
}: UnitSelectProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description ? (
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}
