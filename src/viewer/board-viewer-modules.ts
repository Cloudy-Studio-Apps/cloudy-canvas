import type { AppModule } from "@shared/core";
import { colorsViewerModule } from "@board/modules/colors/colors.viewer";
import { connectorViewerModule } from "@board/modules/connector/connector.viewer";
import { coreViewerModule } from "@board/modules/core/core.viewer";
import { dbViewerModule } from "@board/modules/db/db.viewer";
import { drawViewerModule } from "@board/modules/draw/draw.viewer";
import { embedViewerModule } from "@board/modules/embed/embed.viewer";
import { erViewerModule } from "@board/modules/er/er.viewer";
import { geoViewerModule } from "@board/modules/geo/geo.viewer";
import { imageViewerModule } from "@board/modules/image/image.viewer";
import { sectionViewerModule } from "@board/modules/section/section.viewer";
import { stickerViewerModule } from "@board/modules/sticker/sticker.viewer";
import { stickyViewerModule } from "@board/modules/sticky/sticky.viewer";
import { tableViewerModule } from "@board/modules/table/table.viewer";
import { textViewerModule } from "@board/modules/text/text.viewer";
import { viewerViewerModule } from "@board/modules/viewer/viewer.viewer";

/** The board's built-in modules as the viewer loads them, in the board's order (`board-modules.ts`). */
export const BOARD_VIEWER_MODULES: readonly AppModule[] = [
  coreViewerModule,
  colorsViewerModule,
  drawViewerModule,
  stickyViewerModule,
  stickerViewerModule,
  textViewerModule,
  geoViewerModule,
  connectorViewerModule,
  sectionViewerModule,
  tableViewerModule,
  imageViewerModule,
  embedViewerModule,
  dbViewerModule,
  erViewerModule,
  viewerViewerModule,
];
