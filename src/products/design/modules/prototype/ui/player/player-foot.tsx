import { formatShortcut } from "@shared/core";
import { PLAYER_KEYS } from "./player-keys";
import type { PlayerFootProps } from "./player-foot.types";
import { t } from "../../prototype.i18n";

/** The hint under the device: tap (a phone or tablet) or click to follow the links, and the keys. */
export function PlayerFoot({ flow }: PlayerFootProps) {
  const touch = flow.platform === "mobile" || flow.platform === "tablet";
  const hint = touch
    ? flow.hints
      ? t("player.foot.tap")
      : t("player.foot.tapPlain")
    : flow.hints
      ? t("player.foot.click")
      : t("player.foot.clickPlain");
  return (
    <footer className="flex shrink-0 justify-center gap-4 p-2 text-xs text-muted-foreground">
      <span>{hint}</span>
      <span>
        {t("player.foot.keys", {
          restart: formatShortcut(PLAYER_KEYS.restart),
          close: formatShortcut(PLAYER_KEYS.close),
        })}
      </span>
    </footer>
  );
}
