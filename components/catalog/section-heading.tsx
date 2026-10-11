import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  overline: string;
  title: string;
  description?: string;
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({ overline, title, description, as: Tag = "h2", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl space-y-3", className)}>
      <p className="type-overline text-sage-700">{overline}</p>
      <Tag className={cn(Tag === "h1" ? "type-h1" : "type-h2", "text-neutral-900")}>{title}</Tag>
      {description && <p className="max-w-prose text-muted-foreground">{description}</p>}
    </div>
  );
}
