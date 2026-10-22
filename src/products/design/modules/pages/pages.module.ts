import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { noNodes } from "@design/ui/modules/section-filters";
import { designAgentTools, designCanvas, designMigrations } from "../../design-points";
import { ensurePages } from "./ensure-pages";
import { PageKind } from "./page";
import { PAGE_GUIDES } from "./page-guides";
import { pruneFrameGuides } from "./prune-frame-guides";
import { PAGE_SCOPES } from "./page-scopes";
import { guidesTools } from "./guides.agent-tools";
import { pagesTools } from "./pages.agent-tools";
import { MOVE_TO_PAGE } from "./ui/move-to-page";
import { PageSection } from "./ui/page-section";
import { usePageCommands } from "./ui/use-page-commands";

/**
 * Pages: the page records and the canvas's scopes (one page on screen at a time, new layers on
 * it), each page's ruler guides, "Page 1" for designs from before pages, the previous/next page commands (PageUp/PageDown),
 * the Page section of the properties panel, "Move to page" in the context menu, and the agent
 * tools. The Pages list is part of the Layers tab.
 */
export const pagesModule = defineModule({
  id: "pages",
  requires: ["core"],
  register(host) {
    host.contribute(designCanvas.kinds, new PageKind());
    host.contribute(designCanvas.scopes, PAGE_SCOPES);
    host.contribute(designCanvas.guides, PAGE_GUIDES);
    host.contribute(designCanvas.onRemove, (doc, removed) => pruneFrameGuides(doc, removed));
    host.contribute(designMigrations, { id: "pages", migrate: ensurePages });
    host.contribute(
      designCanvas.hostCommands,
      { id: "previousPage", label: "Previous page", keys: [{ key: "PageUp", label: "PgUp" }] },
      { id: "nextPage", label: "Next page", keys: [{ key: "PageDown", label: "PgDn" }] },
    );
    host.contribute(
      designAgentTools,
      { id: "pages", tools: () => pagesTools },
      { id: "guides", tools: () => guidesTools },
    );

    host.contribute(designEditor.sessionHooks, { id: "page-commands", use: usePageCommands });
    host.contribute(designEditor.propertySections, {
      id: "page",
      tab: "design",
      order: 10,
      when: noNodes,
      component: PageSection,
    });
    host.contribute(designEditor.contextMenu, {
      id: "pages",
      menu: "selection",
      items: [MOVE_TO_PAGE],
    });
    host.contribute(designEditor.mainMenu, {
      id: "pages",
      order: 37,
      label: "Pages",
      items: [
        { command: "previousPage", label: "Previous page" },
        { command: "nextPage", label: "Next page" },
      ],
    });
  },
});
