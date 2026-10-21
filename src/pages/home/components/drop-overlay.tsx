import { FileDown } from "lucide-react";

/** Shown over Home while files are dragged onto the window. */
export function DropOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 flex animate-in items-center justify-center bg-background/80 p-6 backdrop-blur-sm fade-in-0"
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-primary text-center">
        <FileDown className="size-10 text-primary" />
        <p className="text-lg font-semibold">Drop to open</p>
        <p className="text-sm text-muted-foreground">Boards (.cboard) and designs (.cdesign)</p>
      </div>
    </div>
  );
}
