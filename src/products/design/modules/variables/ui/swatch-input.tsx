import { useEffect, useRef } from "react";

import type { SwatchInputProps } from "./variables-ui.types";

/** A color swatch opening the system color chooser; commits once a color is picked. */
export function SwatchInput({ color, label, onCommit }: SwatchInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  // React's onChange fires on every step of a drag; the native "change" fires once it's picked.
  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const commit = () => onCommit(input.value);
    input.addEventListener("change", commit);
    return () => input.removeEventListener("change", commit);
  }, [onCommit]);
  return (
    <label
      className="relative size-4 shrink-0 cursor-pointer overflow-hidden rounded-xs border border-border"
      style={{ backgroundColor: color }}
      title={label}
    >
      <input
        ref={ref}
        type="color"
        aria-label={label}
        defaultValue={color}
        key={color}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}
