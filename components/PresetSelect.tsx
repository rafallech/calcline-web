"use client";

import type { ChangeEvent } from "react";
import { ValidationMessage } from "@/components/ValidationMessage";

export type PresetSelectOption = {
  id: string;
  label: string;
};

type PresetSelectProps = {
  id: string;
  label: string;
  value: string;
  options: PresetSelectOption[];
  onChange: (value: string) => void;
  customValue?: string;
  customLabel?: string;
  description?: string;
  warning?: string;
  disabled?: boolean;
};

export function PresetSelect({
  id,
  label,
  value,
  options,
  onChange,
  customValue = "custom",
  customLabel = "Custom",
  description,
  warning,
  disabled = false,
}: PresetSelectProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      >
        <option value={customValue}>{customLabel}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {description ? (
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
      {warning ? <ValidationMessage tone="warning" message={warning} /> : null}
    </div>
  );
}
