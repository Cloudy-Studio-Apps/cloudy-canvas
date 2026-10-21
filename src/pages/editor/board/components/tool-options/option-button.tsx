import { cn } from "@ui/lib/utils";
import type { OptionButtonProps } from "./option-button.types";

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
