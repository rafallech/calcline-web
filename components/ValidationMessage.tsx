export type ValidationTone = "error" | "warning" | "info";

type ValidationMessageProps = {
  tone?: ValidationTone;
  message: string;
};

const toneClassNames: Record<ValidationTone, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-cyan-200 bg-cyan-50 text-cyan-900",
};

export function ValidationMessage({
  tone = "info",
  message,
}: ValidationMessageProps) {
  return (
    <p className={`rounded-md border px-3 py-2 text-sm leading-6 ${toneClassNames[tone]}`}>
      {message}
    </p>
  );
}
