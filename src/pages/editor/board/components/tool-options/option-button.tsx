import type { ComponentProps } from "react";

import { cn } from "@ui/lib/utils";

interface OptionButtonProps extends ComponentProps<"button"> {
  selected: boolean;
}

/** Square toggle used for every choice in the tool options panel. */
export function OptionButton({ selected, className, ...props }: OptionButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors outline-none hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40",
        selected && "bg-primary-soft hover:bg-primary-soft",
        className,
      )}
      {...props}
    />
  );
}
