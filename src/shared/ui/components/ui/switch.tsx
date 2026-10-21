import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@shared/ui/lib/utils";

/** An on/off toggle with square corners (the design system has no pills). */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-sm border border-transparent p-0.5 shadow-xs transition-colors outline-none",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-border-strong",
        "focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-[2px] bg-surface shadow-xs transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
