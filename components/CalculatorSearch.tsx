"use client";

import { useMemo, useState } from "react";
import { CalculatorCard } from "@/components/CalculatorCard";
import type { CalculatorInfo } from "@/lib/calculators";

type CalculatorSearchProps = {
  calculators: CalculatorInfo[];
};

export function CalculatorSearch({ calculators }: CalculatorSearchProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCalculators = useMemo(
    () =>
      normalizedQuery
        ? calculators.filter((calculator) =>
            [
              calculator.title,
              calculator.shortTitle,
              calculator.description,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery),
          )
        : calculators,
    [calculators, normalizedQuery],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label
          htmlFor="calculator-search"
          className="text-sm font-medium text-slate-700"
        >
          Search calculators
        </label>
        <input
          id="calculator-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by name or topic"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      {filteredCalculators.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCalculators.map((calculator) => (
            <CalculatorCard key={calculator.slug} calculator={calculator} />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          No calculators match this search.
        </p>
      )}
    </div>
  );
}
