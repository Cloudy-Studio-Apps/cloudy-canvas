import { BUILT_IN_RELAY } from "@shared/stores/built-in-relay";
import { RelayDownNote } from "./relay-down-note";
import { t } from "../../settings.i18n";

/** Release builds: the relay sessions use, and a note while the official one can't be reached. */
export function RelayStatus() {
  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{t("collaboration.connection")}</p>
        <p className="text-sm text-muted-foreground">
          {BUILT_IN_RELAY ? t("collaboration.connectBuiltIn") : t("collaboration.connectPublic")}
        </p>
      </div>
      {BUILT_IN_RELAY && <RelayDownNote />}
    </div>
  );
}
