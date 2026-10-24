import { cn } from "@shared/ui/lib/utils";
import type { OptionButtonProps } from "./option-button.types";

/**
 * Square toggle used for every choice in the tool options panel: a swatch, a pen, a size. It
 * holds any content (not only an icon), so it isn't an `IconButton`; it has the same states.
 */
export function OptionButton({ selected, className, ...props }: OptionButtonProps) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: the tool options toggle, any content (swatches, pens)
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "flex size-control cursor-pointer items-center justify-center rounded-md transition-colors outline-none hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40",
        selected && "bg-primary-soft hover:bg-primary-soft",
        className,
      )}
      {...props}
    />
  );
}
