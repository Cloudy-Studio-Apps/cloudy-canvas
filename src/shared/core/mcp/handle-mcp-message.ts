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
import { createId } from "../ids";
import type {
  JsonRpcRequest,
  JsonRpcResponse,
  McpClientInfo,
  McpMessageContext,
  McpObserver,
  McpReply,
  McpServerDefinition,
} from "./mcp.types";
import { ToolImage } from "./tool-image";
import type { Exchange } from "./handle-mcp-message.types";

/** Newest first; the client's version is echoed back when it's one of these. */
const PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

const NO_CONTEXT: McpMessageContext = { session: null, userAgent: null };

/**
 * Handles one MCP message body (Streamable HTTP) and returns the reply: its body, or `""` when
 * there is nothing to answer (notifications and responses), and the session to send back. An
 * agent gets a session when it connects, only to tell agents apart (`observer` hears them).
 */
export async function handleMcpMessage(
  body: string,
  server: McpServerDefinition,
  context: McpMessageContext = NO_CONTEXT,
  observer?: McpObserver,
): Promise<McpReply> {
  const exchange: Exchange = { server, context, observer, session: context.session };
  let message: unknown;
  try {
    message = JSON.parse(body);
  } catch {
    return { body: JSON.stringify(rpcError(null, PARSE_ERROR, "Parse error")), session: null };
  }
  observer?.seen?.(context);
  if (Array.isArray(message)) {
    const replies = await Promise.all(message.map((item) => handleOne(item, exchange)));
    const answered = replies.filter((reply) => reply !== null);
    return {
      body: answered.length > 0 ? JSON.stringify(answered) : "",
      session: exchange.session,
    };
  }
  const reply = await handleOne(message, exchange);
  return { body: reply ? JSON.stringify(reply) : "", session: exchange.session };
}

async function handleOne(message: unknown, exchange: Exchange): Promise<JsonRpcResponse | null> {
  const { server } = exchange;
  if (isResponse(message)) return null;
  if (!isRequest(message)) return rpcError(null, INVALID_REQUEST, "Invalid request");
  // Notifications (`notifications/initialized`, `notifications/cancelled`, …) need no answer.
  if (message.id === undefined) return null;
  const id = message.id;
  switch (message.method) {
    case "initialize":
      connect(message, exchange);
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
      return callTool(message, exchange);
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

/** Gives a connecting agent its session (unless it kept one) and reports who it is. */
function connect(request: JsonRpcRequest, exchange: Exchange): void {
  exchange.session ??= createId();
  const info = request.params?.clientInfo;
  const client: McpClientInfo | null =
    isRecord(info) && typeof info.name === "string"
      ? { name: info.name, version: typeof info.version === "string" ? info.version : null }
      : null;
  exchange.observer?.connected?.(exchange.session, client, {
    ...exchange.context,
    session: exchange.session,
  });
}

async function callTool(request: JsonRpcRequest, exchange: Exchange): Promise<JsonRpcResponse> {
  const id = request.id ?? null;
  const name = request.params?.name;
  const tool = exchange.server.tools.find((candidate) => candidate.name === name);
  if (!tool) return rpcError(id, INVALID_PARAMS, `Unknown tool: ${String(name)}`);
  const rawArgs = request.params?.arguments;
  const args = isRecord(rawArgs) ? rawArgs : {};
  const finish = exchange.observer?.toolCall?.(tool.name, args, exchange.context);
  try {
    const value = await tool.run(args, exchange.context);
    finish?.({ ok: true });
    return rpcResult(id, { content: [toContent(value), ...notes(exchange)] });
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    finish?.({ ok: false, error: text });
    return rpcResult(id, { content: [{ type: "text", text }, ...notes(exchange)], isError: true });
  }
}

/** The server's notes for the caller, as text content after the result. */
function notes({ server, context }: Exchange) {
  return (server.notesFor?.(context) ?? []).map((text) => ({ type: "text", text }));
}

function toContent(value: unknown) {
  if (value instanceof ToolImage) {
    return { type: "image", data: value.data, mimeType: value.mimeType };
  }
  return { type: "text", text: toText(value) };
}

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value ?? null, null, 2);
}
