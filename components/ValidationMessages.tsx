import { ValidationMessage } from "@/components/ValidationMessage";

type ValidationMessagesProps = {
  errors: string[];
  warnings: string[];
};

export function ValidationMessages({
  errors,
  warnings,
}: ValidationMessagesProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {errors.map((error) => (
        <ValidationMessage key={`error-${error}`} tone="error" message={error} />
      ))}
      {warnings.map((warning) => (
        <ValidationMessage
          key={`warning-${warning}`}
          tone="warning"
          message={warning}
        />
      ))}
    </div>
  );
}
