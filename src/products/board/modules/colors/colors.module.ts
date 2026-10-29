import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardMcpTools } from "../../board-points";
import { colorTools } from "./mcp";
import { BoardColorsPanel, ColorsButton } from "./ui";
import * as colorsApi from ".";
import * as colorsUi from "./ui";
import { registerColorsCanvas } from "./colors.canvas";

/**
 * Board colors: the document's color variables, which board elements' colors bind to, kept up to
 * date by the token sync (in every edit's undo step), with one mode per axis for the whole board.
 */
export const colorsModule = defineModule({
  id: "colors",
  tier: "feature",
  exports: { ...colorsApi, ...colorsUi },
  register(host) {
    registerColorsCanvas(host);
    host.contribute(boardMcpTools, { id: "colors", tools: () => colorTools });
    host.contribute(boardEditor.sidePanels, {
      id: "colors.panel",
      order: 30,
      component: BoardColorsPanel,
    });
    host.contribute(boardEditor.topBar, { id: "colors", order: 15, component: ColorsButton });
  },
});
