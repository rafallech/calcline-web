export type ResultTextItem = {
  label: string;
  value: string | number;
  unit?: string;
};

export type ResultTextSection = {
  title: string;
  items: ResultTextItem[];
};

type FormatResultsTextInput = {
  title: string;
  inputs: ResultTextItem[];
  sections: ResultTextSection[];
  warnings?: string[];
};

export function formatResultsText({
  title,
  inputs,
  sections,
  warnings = [],
}: FormatResultsTextInput): string {
  const lines = [title, "", "Inputs:", ...formatItems(inputs)];

  for (const section of sections) {
    lines.push("", `${section.title}:`, ...formatItems(section.items));
  }

  if (warnings.length > 0) {
    lines.push("", "Warnings:", ...warnings.map((warning) => `- ${warning}`));
  }

  return lines.join("\n");
}

function formatItems(items: ResultTextItem[]): string[] {
  return items.map((item) => {
    const unit = item.unit ? ` ${item.unit}` : "";

    return `- ${item.label}: ${item.value}${unit}`;
  });
}
