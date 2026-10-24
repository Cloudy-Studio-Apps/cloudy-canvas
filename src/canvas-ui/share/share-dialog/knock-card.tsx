import { Button } from "@shared/ui/components/ui/button";
import { PersonBadge } from "./person-badge";
import type { KnockCardProps } from "./share-dialog.types";

/** "Ana wants to join": let them in to edit or to view, or not. */
export function KnockCard({ host, knock }: KnockCardProps) {
  const { peer, identity, appVersion } = knock;
  const otherVersion = appVersion !== __APP_VERSION__;
  return (
    <div
      role="alertdialog"
      aria-label={`${identity.name} wants to join`}
      className="pointer-events-auto space-y-3 rounded-card border bg-surface p-3 shadow-soft"
    >
      <div className="flex items-center gap-2">
        <PersonBadge identity={identity} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{identity.name} wants to join</p>
          {otherVersion && (
            <p className="text-xs text-muted-foreground">
              Uses Cloudy Canvas {appVersion} (you have {__APP_VERSION__})
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => host.deny(peer)}>
          Deny
        </Button>
        <Button variant="outline" size="sm" onClick={() => host.admit(peer, "view")}>
          Can view
        </Button>
        <Button size="sm" onClick={() => host.admit(peer, "edit")}>
          Can edit
        </Button>
      </div>
    </div>
  );
}
