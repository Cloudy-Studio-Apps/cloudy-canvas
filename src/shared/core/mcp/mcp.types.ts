/** A JSON Schema object describing a tool's arguments. */
export type JsonSchema = Record<string, unknown>;

export interface McpTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  /**
   * Returns the result (a string, a `ToolImage`, or a value sent as JSON); throwing reports a tool
   * error. `context` says who called it.
   */
  run(args: Record<string, unknown>, context: McpMessageContext): unknown;
}

export interface McpServerDefinition {
  name: string;
  version: string;
  /** Guidance sent to agents when they connect. */
  instructions?: string;
  tools: readonly McpTool[];
  /**
   * Notes for the caller, sent after a tool's result as extra text (e.g. "the user undid your
   * last change"); each is sent once.
   */
  notesFor?(context: McpMessageContext): string[];
}

export type JsonRpcId = string | number | null;

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
}

export type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: JsonRpcId; result: unknown }
  | { jsonrpc: "2.0"; id: JsonRpcId; error: { code: number; message: string } };

/** Who sent a message: the agent's MCP session (`null` before it has one) and its User-Agent. */
export interface McpMessageContext {
  session: string | null;
  userAgent: string | null;
}

/** What the agent sent about itself when it connected (`initialize`'s `clientInfo`). */
export interface McpClientInfo {
  name: string;
  version: string | null;
}

/** How a tool call ended. */
export interface McpCallOutcome {
  ok: boolean;
  /** The error's message when it failed. */
  error?: string;
}

/** Hears what agents do, e.g. to show them in the app. Every hook is optional. */
export interface McpObserver {
  /** An agent connected (`initialize`) and was given `session`. */
  connected?(session: string, client: McpClientInfo | null, context: McpMessageContext): void;
  /** Any request from an agent; `session` is `null` for clients that don't keep one. */
  seen?(context: McpMessageContext): void;
  /** A tool call starts; the returned function is called when it ends. */
  toolCall?(
    name: string,
    args: Record<string, unknown>,
    context: McpMessageContext,
  ): ((outcome: McpCallOutcome) => void) | void;
}

/** The reply to send back: its body (`""` for none) and the session to name in it. */
export interface McpReply {
  body: string;
  session: string | null;
}
