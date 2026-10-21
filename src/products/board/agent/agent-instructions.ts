/** Sent to agents when they connect (MCP `instructions`). */
export const AGENT_INSTRUCTIONS = [
  "Cloudy Canvas is a desktop whiteboard (FigJam-style boards). These tools act on the board open in the app window, live, while the user watches.",
  "Start with get_board. If no board is open, use list_recent_boards and open_board, or new_board.",
  "Coordinates are world units with x/y at the top-left corner; a sticky is 200x200. Check list_shapes to find free space before placing shapes.",
  "Shapes are sticky notes, marker strokes and geo shapes (rectangle, ellipse, diamond, …).",
  "Every editing call is one undo step, so the user can undo it with Ctrl+Z. Changes aren't written to disk until save_board.",
].join("\n");
