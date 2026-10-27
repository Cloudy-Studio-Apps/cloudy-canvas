import { defineModule } from "@shared/core";
import { useBoardEngine } from "@board/ui/board-engine-context";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { EmbedKind } from "./embed.kind";
import { createPastedEmbed } from "./pasted-embed";
import { EmbedPlayer, useEmbedPreviews } from "./ui";
import * as embedApi from ".";
import * as embedUi from "./ui";

/**
 * Pasted links shown as cards: the kind, pasting a link (before any other text paste), the
 * player over a playing video and loading the cards' previews.
 */
export const embedModule = defineModule({
  id: "embed",
  tier: "feature",
  exports: { ...embedApi, ...embedUi },
  register(host) {
    host.contribute(boardCanvas.kinds, new EmbedKind());
    host.contribute(boardCanvas.pasteText, (text, at, index) => createPastedEmbed(text, at, index));

    host.contribute(boardEditor.overlays, { id: "embed.player", component: EmbedPlayer });
    host.contribute(boardEditor.sessionHooks, {
      id: "embed.previews",
      use: function useEmbedPreviewsOfBoard() {
        useEmbedPreviews(useBoardEngine());
      },
    });
  },
});
