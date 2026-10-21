import {
  INVALID_PARAMS,
  INVALID_REQUEST,
  isRecord,
  isRequest,
  isResponse,
  METHOD_NOT_FOUND,
  PARSE_ERROR,
  rpcError,
  rpcResult,
} from "./json-rpc";
import type { JsonRpcRequest, JsonRpcResponse, McpServerDefinition } from "./mcp.types";

/** Newest first; the client's version is echoed back when it's one of these. */
const PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

/**
 * Handles one MCP message body (Streamable HTTP, stateless) and returns the reply body, or `""`
 * when there is nothing to answer (notifications and responses).
 */
export async function handleMcpMessage(body: string, server: McpServerDefinition): Promise<string> {
  let message: unknown;
  try {
    message = JSON.parse(body);
  } catch {
    return JSON.stringify(rpcError(null, PARSE_ERROR, "Parse error"));
  }
  if (Array.isArray(message)) {
    const replies = await Promise.all(message.map((item) => handleOne(item, server)));
    const answered = replies.filter((reply) => reply !== null);
    return answered.length > 0 ? JSON.stringify(answered) : "";
  }
  const reply = await handleOne(message, server);
  return reply ? JSON.stringify(reply) : "";
}

async function handleOne(
  message: unknown,
  server: McpServerDefinition,
): Promise<JsonRpcResponse | null> {
  if (isResponse(message)) return null;
  if (!isRequest(message)) return rpcError(null, INVALID_REQUEST, "Invalid request");
  // Notifications (`notifications/initialized`, `notifications/cancelled`, …) need no answer.
  if (message.id === undefined) return null;
  const id = message.id;
  switch (message.method) {
    case "initialize":
      return rpcResult(id, initializeResult(message, server));
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, {
        tools: server.tools.map(({ name, description, inputSchema }) => ({
          name,
          description,
          inputSchema,
        })),
      });
    case "tools/call":
      return callTool(message, server);
    default:
      return rpcError(id, METHOD_NOT_FOUND, `Method not found: ${message.method}`);
  }
}

function initializeResult(request: JsonRpcRequest, server: McpServerDefinition) {
  const requested = request.params?.protocolVersion;
  const protocolVersion =
    typeof requested === "string" && PROTOCOL_VERSIONS.includes(requested)
      ? requested
      : PROTOCOL_VERSIONS[0];
  return {
    protocolVersion,
    capabilities: { tools: { listChanged: false } },
    serverInfo: { name: server.name, version: server.version },
    ...(server.instructions ? { instructions: server.instructions } : {}),
  };
}

async function callTool(
  request: JsonRpcRequest,
  server: McpServerDefinition,
): Promise<JsonRpcResponse> {
  const id = request.id ?? null;
  const name = request.params?.name;
  const tool = server.tools.find((candidate) => candidate.name === name);
  if (!tool) return rpcError(id, INVALID_PARAMS, `Unknown tool: ${String(name)}`);
  const args = request.params?.arguments;
  try {
    const value = await tool.run(isRecord(args) ? args : {});
    return rpcResult(id, { content: [{ type: "text", text: toText(value) }] });
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    return rpcResult(id, { content: [{ type: "text", text }], isError: true });
  }
}

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value ?? null, null, 2);
}
