import { useEffect, useRef, useState } from "react";

import { Input } from "@shared/ui/components/ui/input";
import { normalizeHex } from "./normalize-hex";
import type { ColorPickerProps } from "./color-picker.types";

/**
 * Picks any color: the system color chooser plus a hex field (applied on Enter or blur). Give it a
 * `key` of the color so the field resets when the color changes from outside.
 */
export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hex, setHex] = useState(color);

  // React's onChange fires on every step of a drag; the native "change" fires once it's picked.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const commit = () => onChange(input.value);
    input.addEventListener("change", commit);
    return () => input.removeEventListener("change", commit);
  }, [onChange]);

  const commitHex = () => {
    const next = normalizeHex(hex);
    if (next) onChange(next);
    else setHex(color);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="color"
        aria-label="Pick a color"
        defaultValue={normalizeHex(color) ?? "#000000"}
        key={color}
        className="size-8 shrink-0 cursor-pointer rounded-md border bg-surface p-0.5"
      />
      <Input
        aria-label="Hex color"
        value={hex}
        spellCheck={false}
        aria-invalid={normalizeHex(hex) === null}
        onChange={(event) => setHex(event.target.value)}
        onBlur={commitHex}
        onKeyDown={(event) => {
          if (event.key === "Enter") commitHex();
        }}
        className="font-mono uppercase"
      />
    </div>
  );
}
