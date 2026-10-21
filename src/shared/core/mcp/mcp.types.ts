/** A JSON Schema object describing a tool's arguments. */
export type JsonSchema = Record<string, unknown>;

export interface McpTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  /** Returns the result (a string, or a value sent as JSON); throwing reports a tool error. */
  run(args: Record<string, unknown>): unknown;
}

export interface McpServerDefinition {
  name: string;
  version: string;
  /** Guidance sent to agents when they connect. */
  instructions?: string;
  tools: readonly McpTool[];
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
