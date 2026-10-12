import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SearchFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
};

export function SearchField({ id, label, placeholder, value, maxLength, onChange }: SearchFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Search
          aria-hidden="true"
          strokeWidth={1.75}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
        />
        <Input
          id={id}
          type="search"
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
