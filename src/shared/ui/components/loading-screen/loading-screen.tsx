import { HoppingSeal } from "@shared/ui/brand/hopping-seal";
import { cn } from "@shared/ui/lib/utils";
import type { LoadingScreenProps } from "./loading-screen.types";

/**
 * The preloader: the mascot hopping, what is loading, the current stage and a progress bar. It fills the
 * element it's placed in and takes the pointer, so nothing behind it can be used while it shows.
 */
export function LoadingScreen({ title, stage, progress, className }: LoadingScreenProps) {
  const ratio = progress && progress.total > 0 ? Math.min(progress.done / progress.total, 1) : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center gap-4 p-6 text-center", className)}
    >
      <HoppingSeal size={88} />
      <div className="space-y-1">
        <p className="text-md font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground tabular-nums">
          {stage}
          {progress && progress.total > 0 && ` · ${progress.done} / ${progress.total}`}
        </p>
      </div>
      <div className="h-1 w-56 overflow-hidden rounded-xs bg-muted">
        {ratio === null ? (
          <div className="h-full w-1/3 animate-indeterminate bg-primary" />
        ) : (
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${ratio * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}
