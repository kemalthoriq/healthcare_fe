import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-card px-6 py-12 text-center">
      <Icon aria-hidden="true" strokeWidth={1.75} className="size-10 text-sage-400" />
      <h3 className="text-[17px] font-semibold">{title}</h3>
      <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
