import { CircleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  help?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
};

export function fieldDescribedBy(id: string, hasHelp: boolean, hasError: boolean): string | undefined {
  return [hasHelp ? `${id}-help` : null, hasError ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function FormField({ id, label, optional, help, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-muted-foreground">(opsional)</span>}
      </Label>
      {children}
      {help && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm text-danger">
          <CircleAlert aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
