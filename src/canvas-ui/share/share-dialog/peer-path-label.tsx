import type { PeerPathLabelProps } from "./share-dialog.types";
import { t } from "../share.i18n";

/** "Direct" or "Via relay": how a guest is connected. */
export function PeerPathLabel({ path }: PeerPathLabelProps) {
  if (!path) return <span className="text-xs text-muted-foreground">{t("path.connecting")}</span>;
  return (
    <span className="text-xs text-muted-foreground" title={t(`path.${path}Hint`)}>
      {t(`path.${path}`)}
    </span>
  );
}
