"use client";

import { useAppMode, type AppMode } from "@/components/ModeProvider";

const modes: { value: AppMode; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "engineer", label: "Inżynier" },
];

export function ModeToggle() {
  const { mode, setMode } = useAppMode();

  return (
    <div className="grid grid-cols-2 rounded-md border border-slate-300 bg-slate-50 p-1 text-sm font-medium">
      {modes.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setMode(item.value)}
          className={`min-h-9 rounded px-3 transition ${
            mode === item.value
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-950"
          }`}
          aria-pressed={mode === item.value}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
