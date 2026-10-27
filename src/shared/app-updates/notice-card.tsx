import { SealLogo } from "@shared/ui/brand/seal-logo";
import type { NoticeCardProps } from "./notice-card.types";

/** The card in the bottom-left corner the update notices use: logo, title, one line, actions. */
export function NoticeCard({ title, description, children }: NoticeCardProps) {
  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex w-80 gap-3 rounded-card border bg-surface p-4 shadow-popover"
    >
      <SealLogo size={32} className="shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
