import type { JsonRpcId, JsonRpcRequest, JsonRpcResponse } from "./mcp.types";

export const PARSE_ERROR = -32700;
export const INVALID_REQUEST = -32600;
export const METHOD_NOT_FOUND = -32601;
export const INVALID_PARAMS = -32602;

export function rpcResult(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

export function rpcError(id: JsonRpcId, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isRequest(value: unknown): value is JsonRpcRequest {
  return isRecord(value) && typeof value.method === "string";
}

/** A response sent to us (we never send requests to clients, so it's ignored). */
export function isResponse(value: unknown): boolean {
  return isRecord(value) && "id" in value && ("result" in value || "error" in value);
}
