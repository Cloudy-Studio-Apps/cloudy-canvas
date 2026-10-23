import { useUpdateStore } from "@shared/stores/update-store";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { Button } from "@shared/ui/components/ui/button";
import { firstLine } from "./release-notes";

/**
 * The card in the bottom-left corner while a new version is available: Update installs it (or
 * opens its download page for a package install), Later hides it until the next start.
 */
export function UpdateNotice() {
  const status = useUpdateStore((s) => s.status);
  const installKind = useUpdateStore((s) => s.installKind);
  const dismissed = useUpdateStore((s) => s.dismissed);
  const install = useUpdateStore((s) => s.install);
  const dismiss = useUpdateStore((s) => s.dismiss);

  if (!("update" in status)) return null;
  const { update } = status;
  if (status.phase === "available" && dismissed === update.version) return null;

  const busy = status.phase !== "available";
  const summary = firstLine(update.notes);
  const progress = status.phase === "downloading" ? status.progress : 1;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex w-80 gap-3 rounded-card border bg-surface p-4 shadow-popover"
    >
      <SealLogo size={32} className="shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">Cloudy Canvas {update.version} is available</p>
          <p className="truncate text-xs text-muted-foreground">
            {busy
              ? status.phase === "restarting"
                ? "Restarting…"
                : "Downloading the update…"
              : (summary ?? `You have version ${__APP_VERSION__}.`)}
          </p>
        </div>
        {busy ? (
          <div className="h-1.5 overflow-hidden rounded-md bg-muted">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${Math.round((progress ?? 0.1) * 100)}%` }}
            />
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void install()}>
              {installKind === "package" ? "Download" : "Update and restart"}
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Later
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
