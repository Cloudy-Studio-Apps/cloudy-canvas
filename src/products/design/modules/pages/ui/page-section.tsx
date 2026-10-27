import { Maximize } from "lucide-react";

import { CommitInput, useEngineState } from "@canvas-ui";
import { DESIGN_PAGES } from "../design-pages";
import { PanelIconButton, PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { usePages } from "./use-pages";
import { t } from "../pages.i18n";

/** With nothing selected: the page on screen (its name, editable), its zoom, and zoom to fit. */
export function PageSection() {
  const engine = useDesignEngine();
  const zoom = useEngineState((state) => state.zoom);
  const current = useEngineState((state) => state.scope);
  const page = usePages().find((other) => other.id === current);
  return (
    <PanelSection
      title={t("section.title")}
      actions={
        <PanelIconButton
          label={t("section.zoomToFit", { shortcut: engine.keymap.label("zoomToFit") ?? "" })}
          onClick={() => engine.zoomToFit()}
        >
          <Maximize />
        </PanelIconButton>
      }
    >
      {page && (
        <CommitInput
          aria-label={t("section.name")}
          value={page.name}
          onCommit={(name) => engine.service(DESIGN_PAGES).rename(page.id, name)}
          className="mb-1.5 h-7 text-sm"
        />
      )}
      <p className="text-xs text-muted-foreground">
        {t("section.zoom", { percent: Math.round(zoom * 100) })}
      </p>
    </PanelSection>
  );
}
