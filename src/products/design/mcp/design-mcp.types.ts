import type { AgentFile, AgentRecentFile, McpTool, McpToolGroup, ElementKinds } from "@canvas";
import type { FontFamily } from "@shared/core";

import type { DesignEngine, DesignWorkspace } from "../design-engine.types";
import type { DesignToolOptions } from "../design-options.types";

/**
 * The design open in the window as an agent works on it: `engine` is the agent's own workspace
 * (its page, selection and undo). Its layer tree is `engine.service(DESIGN_TREE)`.
 */
export type AgentDesign = AgentFile<DesignWorkspace>;

/** The design open in the window with its engine (the user's), which gives each agent a workspace. */
export type OpenDesign = AgentFile<DesignEngine>;

/** What design tools can reach beyond the engine, implemented by the app. */
export interface DesignAgentHost {
  design(): AgentDesign | null;
  recentFiles(): Promise<AgentRecentFile[]>;
  /** Opens a design in the window and resolves once it's ready. */
  openDesign(id: string): Promise<AgentDesign>;
  newDesign(): Promise<AgentDesign>;
  /** Writes a file to an absolute path (exports), replacing what's there. */
  writeFile(path: string, file: Blob): Promise<void>;
  /** Reads a file from an absolute path (images to place). */
  readFile(path: string): Promise<Uint8Array>;
  /** The font families texts can use: installed ones, then Google's. */
  fontFamilies(): Promise<FontFamily[]>;
}

/** A tool that acts on the open design. */
export type DesignMcpTool = McpTool<DesignAgentHost>;

/** What a group of design tools is made with: the design's composed element kinds. */
export interface DesignAgentContext {
  kinds: ElementKinds<DesignToolOptions>;
}

/**
 * Agent tools a design module adds (see `designMcpTools`), made when the agent server starts.
 * Most groups ignore the context.
 */
export type DesignMcpToolGroup = McpToolGroup<DesignAgentHost, DesignAgentContext>;
