import { Palette } from "lucide-react";
import { useSyncExternalStore } from "react";

import { TokenStore } from "@canvas";
import { STYLEGUIDE_MODE_ID } from "../../mode/styleguide-mode.constants";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import {
  openVariablesWindow,
  useCreateVariable,
  useVariablesWindowOpen,
} from "../../../variables/ui";
import { Button, EmptyState } from "@shared/ui/kit";
import { useStyleguide } from "../hooks/use-styleguide";
import { useSystemPage } from "../hooks/use-system-page";

/**
 * What the Design system mode shows while there's no system page (an `overlays` entry): with no
 * tokens, a way to start (a color, the palette generator, later imported tokens); with tokens from
 * before the view existed, a button that sets it up.
 */
export function StyleguideEmpty() {
  const engine = useDesignEngine();
  const inMode = useDesignState((state) => state.mode === STYLEGUIDE_MODE_ID);
  const page = useSystemPage();
  const { styleguide, categories } = useStyleguide();
  const createVariable = useCreateVariable();
  const hasTokens = useSyncExternalStore(
    (listener) => engine.doc.observeTokens(listener),
    () => !TokenStore.of(engine.doc).isEmpty,
  );
  // The Variables window (an overlay too) opens over the canvas instead.
  const windowOpen = useVariablesWindowOpen();
  if (!inMode || page || windowOpen) return null;
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-background/90">
      {hasTokens ? (
        <EmptyState
          icon={<Palette className="size-8" />}
          title="Set up your design system"
          description="This file has variables and styles. Lay them out as a style guide that stays up to date."
          action={
            <Button size="sm" onClick={() => styleguide.setup(categories)}>
              Set up
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={<Palette className="size-8" />}
          title="No design system yet"
          description="Add variables and styles, and this view lays them out as a style guide that stays up to date."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => createVariable("color")}>
                Add a color
              </Button>
              <Button size="sm" variant="outline" onClick={openVariablesWindow}>
                Generate a palette
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
