import type { ShareGuest } from "@canvas";
import type { CanvasFileContextValue } from "@canvas-ui";
import type { DesignEngine } from "@design";
import type { FileInfo } from "@shared/core";

export interface DesignSessionProps {
  id: string;
  engine: DesignEngine;
  /** `null` for a new design that hasn't been saved yet. */
  info: FileInfo | null;
  /** A live session joined as a guest (the design isn't a file here). */
  live?: ShareGuest;
}

export interface FileDesignSessionProps {
  id: string;
  engine: DesignEngine;
  info: FileInfo | null;
}

export interface LiveDesignSessionProps {
  engine: DesignEngine;
  live: ShareGuest;
}

export interface DesignSessionViewProps {
  engine: DesignEngine;
  file: CanvasFileContextValue;
  /** Takes the file's preview; a saved file asks before it closes (live sessions don't). */
  capture?: () => Promise<void>;
}
