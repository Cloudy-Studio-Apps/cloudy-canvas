import type { BoardEngine } from "@board";
import type { ShareGuest } from "@canvas";
import type { CanvasFileContextValue } from "@canvas-ui";
import type { FileInfo } from "@shared/core";

export interface BoardSessionProps {
  id: string;
  engine: BoardEngine;
  info: FileInfo | null;
  /** A live session joined as a guest (the board isn't a file here). */
  live?: ShareGuest;
}

export interface FileBoardSessionProps {
  id: string;
  engine: BoardEngine;
  info: FileInfo | null;
}

export interface LiveBoardSessionProps {
  engine: BoardEngine;
  live: ShareGuest;
}

export interface BoardSessionViewProps {
  engine: BoardEngine;
  file: CanvasFileContextValue;
}
