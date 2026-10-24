import * as React from "react";

import { cn } from "@shared/ui/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-control w-full min-w-0 rounded-md border border-input bg-surface px-2.5 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-subtle-foreground",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
