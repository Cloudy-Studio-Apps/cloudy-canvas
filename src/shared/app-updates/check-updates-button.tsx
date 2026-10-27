import { Download, LoaderCircle, RefreshCw } from "lucide-react";

import { appUpdater } from "@platform";
import { useUpdateStore } from "@shared/stores/update-store";
import { Button } from "@shared/ui/components/ui/button";
import type { CheckUpdatesButtonProps } from "./check-updates-button.types";
import { t } from "./app-updates.i18n";

/** Checks for a new version, or installs the one found; says where it stands. */
export function CheckUpdatesButton({ className }: CheckUpdatesButtonProps) {
  const status = useUpdateStore((s) => s.status);
  const installKind = useUpdateStore((s) => s.installKind);
  const check = useUpdateStore((s) => s.check);
  const install = useUpdateStore((s) => s.install);

  if (!appUpdater || import.meta.env.DEV) {
    return <p className="text-xs text-muted-foreground">{t("off")}</p>;
  }

  if (status.phase === "available") {
    return (
      <Button size="sm" className={className} onClick={() => void install()}>
        <Download />
        {t(installKind === "package" ? "download" : "updateTo", { version: status.update.version })}
      </Button>
    );
  }

  const busy =
    status.phase === "checking" || status.phase === "downloading" || status.phase === "restarting";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        className={className}
        disabled={busy}
        onClick={() => void check()}
      >
        {busy ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
        {t(`check.${status.phase}`)}
      </Button>
      {status.phase === "upToDate" && (
        <span className="text-xs text-muted-foreground">{t("upToDate")}</span>
      )}
    </div>
  );
}
