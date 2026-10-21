import { cn } from "@ui/lib/utils";
import type { ShapeSelectProps } from "./shape-select.types";

/** A compact native select, styled like the panel's inputs. */
export function ShapeSelect({
  value,
  options,
  onChange,
  placeholder,
  className,
  ...props
}: ShapeSelectProps) {
  // Keep a value the list doesn't know (e.g. a custom cardinality) selectable.
  const known = value === "" || options.some((option) => option.value === value);
  return (
    <select
      aria-label={props["aria-label"]}
      value={value}
      className={cn(
        "h-7 min-w-0 cursor-pointer rounded-md border border-input bg-surface px-1.5 text-sm text-foreground outline-none",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
        className,
      )}
      onChange={(event) => onChange(event.target.value)}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {!known && <option value={value}>{value}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
