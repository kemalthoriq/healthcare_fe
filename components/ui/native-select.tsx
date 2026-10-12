import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "cn"

function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select
        data-slot="native-select"
        className="h-11 w-full appearance-none rounded-md border border-input bg-card py-2 pr-9 pl-3 text-base shadow-xs outline-none transition-colors focus-visible:border-sage-600 focus-visible:ring-3 focus-visible:ring-sage-100 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-neutral-500"
      />
    </div>
  )
}

export { NativeSelect }
