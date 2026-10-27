import { Palette } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";

import { TokenStore } from "@canvas";
import { useEditorModules } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useCreateVariable, useVariablesWindowOpen } from "../../../variables/ui";
import { Button, EmptyState } from "@shared/ui/kit";
import { useStyleguide } from "../hooks/use-styleguide";
import { useSystemPage } from "../hooks/use-system-page";
import { styleguideStartActions } from "../styleguide.points";
import { t } from "../../styleguide.i18n";

/**
 * What the Design system mode shows while there's no system page (an overlay of the mode): with no
 * tokens, a way to start (the contributed `styleguideStartActions`, such as the color wizard,
 * then a color, later imported tokens); with tokens from before the view existed, a button that
 * sets it up (and the start actions too while there's no color).
 */
export function StyleguideEmpty() {
  const engine = useDesignEngine();
  const page = useSystemPage();
  const { styleguide, categories } = useStyleguide();
  const createVariable = useCreateVariable();
  const { host } = useEditorModules();
  const actions = useMemo(
    () => [...host.get(styleguideStartActions)].sort((a, b) => a.order - b.order),
    [host],
  );
  const tokens = useSyncExternalStore(
    (listener) => engine.doc.observeTokens(listener),
    () => {
      const store = TokenStore.of(engine.doc);
      return store.isEmpty
        ? "none"
        : store.variables().some((v) => v.type === "color")
          ? "colors"
          : "some";
    },
  );
  // The Variables window (an overlay too) opens over the canvas instead.
  const windowOpen = useVariablesWindowOpen();
  if (page || windowOpen) return null;
  const started = actions.map(({ id, component: Action }, i) => (
    <Action key={id} primary={i === 0} />
  ));
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-background/90">
      {tokens !== "none" ? (
        <EmptyState
          icon={<Palette className="size-8" />}
          title={t("empty.setUp.title")}
          description={t("empty.setUp.description")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                size="sm"
                variant={tokens === "some" && actions.length ? "outline" : "default"}
                onClick={() => styleguide.setup(categories)}
              >
                {t("empty.setUp.action")}
              </Button>
              {tokens === "some" && started}
            </div>
          }
        />
      ) : (
        <EmptyState
          icon={<Palette className="size-8" />}
          title={t("empty.none.title")}
          description={t("empty.none.description")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {started}
              <Button
                size="sm"
                variant={actions.length ? "outline" : "default"}
                onClick={() => createVariable("color")}
              >
                {t("empty.none.addColor")}
              </Button>
              <Button size="sm" variant="outline" disabled title={t("empty.none.comingSoon")}>
                {t("empty.none.importTokens")}
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}
