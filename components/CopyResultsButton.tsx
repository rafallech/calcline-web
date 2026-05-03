"use client";

import { useState } from "react";

type CopyResultsButtonProps = {
  text?: string;
  label?: string;
  copiedLabel?: string;
};

export function CopyResultsButton({
  text,
  label = "Copy results",
  copiedLabel = "Copied",
}: CopyResultsButtonProps) {
  const [copied, setCopied] = useState(false);
  const disabled = !text;

  async function copyResults() {
    if (!text) {
      return;
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copyResults}
      disabled={disabled}
      className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
