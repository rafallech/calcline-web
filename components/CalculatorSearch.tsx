"use client";

import { useMemo, useState } from "react";
import { CalculatorCard } from "@/components/CalculatorCard";
import {
  calculatorCategories,
  type CalculatorCategory,
  type CalculatorInfo,
} from "@/lib/calculators";

type CalculatorSearchProps = {
  calculators: CalculatorInfo[];
};

type ActiveCategory = "all" | CalculatorCategory;

export function CalculatorSearch({ calculators }: CalculatorSearchProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const categoryById = useMemo(
    () => new Map(calculatorCategories.map((category) => [category.id, category])),
    [],
  );
  const filteredCalculators = useMemo(() => {
    return calculators.filter((calculator) => {
      const category = categoryById.get(calculator.category);
      const matchesCategory =
        activeCategory === "all" || calculator.category === activeCategory;
      const matchesQuery = normalizedQuery
        ? [
            calculator.title,
            calculator.shortTitle,
            calculator.description,
            ...(calculator.searchKeywords ?? []),
            category?.label ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, calculators, categoryById, normalizedQuery]);
  const groupedCalculators = useMemo(
    () =>
      calculatorCategories
        .map((category) => ({
          ...category,
          calculators: filteredCalculators.filter(
            (calculator) => calculator.category === category.id,
          ),
        }))
        .filter((category) => category.calculators.length > 0),
    [filteredCalculators],
  );
  const totalCount = calculators.length;
  const activeCount = filteredCalculators.length;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
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

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Categories</p>
            <p className="text-sm text-slate-500">
              {activeCount} of {totalCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CategoryButton
              active={activeCategory === "all"}
              label="All"
              count={totalCount}
              onClick={() => setActiveCategory("all")}
            />
            {calculatorCategories.map((category) => (
              <CategoryButton
                key={category.id}
                active={activeCategory === category.id}
                label={category.label}
                count={
                  calculators.filter(
                    (calculator) => calculator.category === category.id,
                  ).length
                }
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {groupedCalculators.length > 0 ? (
        <div className="space-y-7">
          {groupedCalculators.map((category) => (
            <section key={category.id} className="space-y-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {category.label}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {category.calculators.map((calculator) => (
                  <CalculatorCard
                    key={calculator.slug}
                    calculator={calculator}
                  />
                ))}
              </div>
            </section>
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

type CategoryButtonProps = {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
};

function CategoryButton({ active, label, count, onClick }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-700/20 ${
        active
          ? "border-cyan-700 bg-cyan-50 text-cyan-950"
          : "border-slate-300 bg-white text-slate-700 hover:border-cyan-700 hover:text-cyan-900"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded px-1.5 py-0.5 text-xs ${
          active ? "bg-cyan-100 text-cyan-950" : "bg-slate-100 text-slate-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
