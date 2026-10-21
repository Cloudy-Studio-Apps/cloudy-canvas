/** Sent to agents when they connect (MCP `instructions`). */
export const AGENT_INSTRUCTIONS = [
  "Cloudy Canvas is a desktop whiteboard (FigJam-style boards). These tools act on the board open in the app window, live, while the user watches.",
  "Start with get_board. If no board is open, use list_recent_boards and open_board, or new_board.",
  "Coordinates are world units with x/y at the top-left corner; a sticky is 200x200. Check list_shapes to find free space before placing shapes.",
  "Shapes are sticky notes, text labels (sized to their text), marker strokes, connectors (lines between shapes that follow them), geo shapes (rectangle, ellipse, diamond, …), sections (titled areas that group the shapes fully inside them), database tables and enums, and ER diagram elements.",
  "Database tables and enums are edited as DBML (get_schema_dbml, apply_schema_dbml, import_schema_dbml, get_table_dbml, apply_table_dbml). Don't build them from plain shapes.",
  "ER diagrams (Chen notation) are edited as text, one diagram at a time (list_er_diagrams, get_er_text, apply_er_text, relayout_er). A board can hold several; don't build them from plain shapes.",
  "Every editing call is one undo step, so the user can undo it with Ctrl+Z. Changes aren't written to disk until save_board.",
].join("\n");
