import "./viewer-i18n-boot";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { embeddedFontLoader, ViewerApp, ViewerError } from "@board/modules/viewer/ui";
import { TooltipProvider } from "@shared/ui/components/ui/tooltip";
import { applyViewerTheme } from "./apply-viewer-theme";
import { openViewerBoard } from "./open-viewer-board";
import { readViewerFile } from "./read-viewer-file";
import "../app/styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");
applyViewerTheme();

async function start() {
  try {
    const file = await readViewerFile();
    const board = await openViewerBoard(file);
    return (
      <ViewerApp
        file={file}
        product={board.product}
        document={board.document}
        fonts={embeddedFontLoader(file.fonts)}
        parts={board.parts}
      />
    );
  } catch (error) {
    console.error("[viewer] The board couldn't be opened:", error);
    return <ViewerError reason="data" />;
  }
}

void start().then((content) =>
  createRoot(root).render(
    <StrictMode>
      <TooltipProvider>{content}</TooltipProvider>
    </StrictMode>,
  ),
);
