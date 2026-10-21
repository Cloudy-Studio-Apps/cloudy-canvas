/**
 * An image a tool returns, sent to the agent as MCP image content (e.g. a picture of the board)
 * instead of text.
 */
export class ToolImage {
  constructor(
    /** The encoded file, as base64. */
    readonly data: string,
    /** e.g. `image/png`. */
    readonly mimeType: string,
  ) {}
}
