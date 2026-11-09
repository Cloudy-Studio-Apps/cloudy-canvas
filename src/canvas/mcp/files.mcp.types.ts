import type { FileType } from "@shared/core";

import type {
  AgentFileCandidates,
  AgentFileRef,
  AgentNewFile,
  AgentProjectChoice,
} from "./agent-tabs.types";
import type { AgentRecentFile } from "./agent-file.types";
import type { AgentPlugin } from "./plugins.mcp.types";

/** A file the agent opened or created: it now works in its tab. */
export interface AgentFileOpened {
  type: FileType;
  /** The tab's name: the document's title, else the file's name. */
  name: string;
}

/** What the file and plugin tools reach, for the calling agent (see `app/mcp/agent-host.ts`). */
export interface FilesAgentHost {
  /** The recent files of one type, or of both when `type` is left out. */
  recentFiles(type?: FileType): Promise<AgentRecentFile[]>;
  /**
   * Opens a file (by id or name) in a background tab and moves the agent there. Without a `type`
   * a name is looked up in both products; several matches change nothing and give the candidates.
   */
  openFile(
    type: FileType | undefined,
    ref: AgentFileRef,
  ): Promise<AgentFileOpened | AgentFileCandidates>;
  /**
   * A new file of `type` in a background tab. A name that matches a project resolves with the
   * matching projects, creating nothing, until `project` says which (or `"none"`).
   */
  newFile(type: FileType, options: AgentNewFile): Promise<AgentFileOpened | AgentProjectChoice>;
  /** The installed plugins and what happened to them when the app started. */
  plugins(): AgentPlugin[];
}
