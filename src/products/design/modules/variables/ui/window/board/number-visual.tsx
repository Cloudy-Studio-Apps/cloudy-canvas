import type { NumberVisualProps } from "./board.types";

/** A number drawn for what it's for: a bar, a rounded corner, "Aa" at its size, a fade, a line. */
export function NumberVisual({ kind, value, max }: NumberVisualProps) {
  switch (kind) {
    case "radius":
      return (
        <div
          className="size-10 border-t-2 border-l-2 border-primary bg-primary/10"
          style={{ borderTopLeftRadius: Math.min(value, 40) }}
        />
      );
    case "font":
      return (
        <span className="leading-none font-medium" style={{ fontSize: Math.min(value, 40) }}>
          Aa
        </span>
      );
    case "opacity":
      return (
        <div
          className="relative h-8 w-11 overflow-hidden rounded-md bg-[length:8px_8px]"
          style={{
            backgroundImage: "repeating-conic-gradient(var(--muted) 0 25%, var(--surface) 0 50%)",
          }}
        >
          <div
            className="absolute inset-0 bg-primary"
            style={{ opacity: value > 1 ? value / 100 : value }}
          />
        </div>
      );
    case "stroke":
      return (
        <div
          className="w-full rounded-xs bg-foreground"
          style={{ height: Math.max(1, Math.min(value, 14)) }}
        />
      );
    case "spacing":
      return (
        <div
          className="h-2.5 max-w-full rounded-xs bg-primary"
          style={{ width: `${Math.max(2, (value / Math.max(max, 1)) * 100)}%` }}
        />
      );
    default:
      return <span className="text-2xl font-semibold">{value}</span>;
  }
}
