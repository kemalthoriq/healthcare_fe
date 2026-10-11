import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  description?: string;
  tone?: "default" | "danger";
  children: React.ReactNode;
};

export function SectionCard({ title, description, tone = "default", children }: SectionCardProps) {
  return (
    <section
      className={cn("rounded-lg bg-card p-6 shadow-sm", tone === "danger" && "border border-danger/30 shadow-none")}
    >
      <h2 className={cn("text-[17px] font-semibold", tone === "danger" ? "text-danger" : "text-neutral-900")}>
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
