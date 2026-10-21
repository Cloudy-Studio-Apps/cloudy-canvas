/** What a card asks the host to do (see `ToolContext.activate`). */
export const EMBED_ACTIONS = {
  /** Play the video in place. */
  play: "embed.play",
  /** Open the link in the browser. */
  open: "embed.open",
} as const;
