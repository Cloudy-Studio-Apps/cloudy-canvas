import { cn } from "@ui/lib/utils";
import { SealLogo } from "./seal-logo";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <SealLogo size={30} />
      <span className="text-md font-semibold tracking-tight text-foreground">Cloudy Canvas</span>
    </span>
  );
}
