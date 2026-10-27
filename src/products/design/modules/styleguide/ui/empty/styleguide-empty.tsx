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
          title="Set up your design system"
          description="This file has variables and styles. Lay them out as a style guide that stays up to date."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                size="sm"
                variant={tokens === "some" && actions.length ? "outline" : "default"}
                onClick={() => styleguide.setup(categories)}
              >
                Set up
              </Button>
              {tokens === "some" && started}
            </div>
          }
        />
      ) : (
        <EmptyState
          icon={<Palette className="size-8" />}
          title="No design system yet"
          description="Add variables and styles, and this view lays them out as a style guide that stays up to date."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {started}
              <Button
                size="sm"
                variant={actions.length ? "outline" : "default"}
                onClick={() => createVariable("color")}
              >
                Add a color
              </Button>
              <Button size="sm" variant="outline" disabled title="Coming soon">
                Import tokens
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}
