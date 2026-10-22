/** Sent to agents when they connect (MCP `instructions`). */
export const AGENT_INSTRUCTIONS = [
  "Cloudy Canvas is a desktop whiteboard (FigJam-style boards). These tools act on the board open in the app window, live, while the user watches.",
  "Start with get_board. If no board is open, use list_recent_boards and open_board, or new_board.",
  "A board has a title and a description (get_board, set_board_info): read the description for what the board is about, and set them when you fill a new board.",
  "Coordinates are world units with x/y at the top-left corner; a sticky is 200x200. Check list_shapes to find free space before placing shapes.",
  "Shapes are sticky notes, text labels (sized to their text), geo shapes (rectangle, ellipse, diamond, …), connectors (lines between shapes that follow them), sections (titled areas that group the shapes fully inside them), tables (create with `cells`, one array of texts per row, and `header`; update `cells` and `fills` to change the grid), links shown as cards (`url`), freehand strokes (pen or highlighter, drawn from `points`), stickers, pasted images, database tables and enums, and ER diagram elements.",
  "Create shapes with create_shapes and change them with update_shapes; moving a section or an ER entity moves what's in it. duplicate_shapes copies shapes as Ctrl+D does.",
  "Stickers are stamped with stamp_stickers, using ids from list_stickers (foca watona seals, common stamps and emojis). Images can only be moved and resized.",
  "reorder_shapes changes the drawing order (front, back, one step) and lock_shapes locks shapes in place. align_shapes, distribute_shapes and tidy_up_shapes line shapes up, space them evenly or tidy them into a grid, and scale_shapes scales shapes with their text and lines (update_shapes with w/h only resizes). view_board returns a picture of the board to check how your changes look; export_shapes writes PNG, JPG, PDF or CSV files, and copy_as_png copies shapes to the clipboard.",
  "Database tables and enums are edited as DBML (get_schema_dbml, apply_schema_dbml, import_schema_dbml, get_table_dbml, apply_table_dbml). Don't build them from plain shapes.",
  "ER diagrams (Chen notation) are edited as text, one diagram at a time (list_er_diagrams, get_er_text, apply_er_text, relayout_er). A board can hold several; don't build them from plain shapes.",
  "Every editing call is one undo step, so the user can undo it with Ctrl+Z. When autosave is on (the default), changes are written to disk shortly after; otherwise not until save_board.",
].join("\n");
