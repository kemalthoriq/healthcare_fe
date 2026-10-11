import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type StepHeaderProps = {
  title: string;
  description?: string;
  onBack?: () => void;
};

export function StepHeader({ title, description, onBack }: StepHeaderProps) {
  return (
    <div className="space-y-2">
      {onBack && (
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="-ml-3 text-neutral-700">
          <ArrowLeft aria-hidden="true" strokeWidth={1.75} />
          Kembali
        </Button>
      )}
      <h2 className="text-xl font-semibold lg:text-[22px]">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
