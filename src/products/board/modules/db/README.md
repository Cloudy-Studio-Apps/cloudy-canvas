# Database schemas

Database tables and enums drawn on the board and edited as DBML, with the relation lines between them and the schema panel.

- **Tier:** feature
- **Requires:** sticky
- **Contributes:** kinds `DbEnumKind`, `DbTableKind`; boardCanvas: `kinds`, `links`, `onRemove`, `options`, `prepareCopies`, `tools`; boardEditor: `sidePanels`, `toolPanels`, `tools`, `topBar`; `boardMcpTools`
- **Points it owns:** —
- **MCP tools:** `apply_schema_dbml`, `apply_table_dbml`, `get_schema_dbml`, `get_table_dbml`, `import_schema_dbml`, `tidy_schema`
- **Files:** `table/`, `enum/`, `card/` (their base), `schema/` (`DbSchema`, the DBML language), `links/`, `db.tool.ts`, `db.mcp.ts`, `ui/`.

## How it works

- `db/`: the database schema, one family in one folder:
  - `card/`: `DbCardKind`, the base of tables and enums (sized by content, not resizable, created by the `db` tool or DBML, never from an agent's spec; agents may only move them) and the card frame drawer and row layout.
  - `table/`: `DbTableKind`. Columns are a plain JSON array; a relation lives on the source column (`column.ref`) and points at the target by table/column **id**, so moves and renames never break it. Tables keep `indexes` and a `note`, drawn as bubbles beside the table (`noteHidden` is view state, written with `doc.updateUntracked`). A column's `type` is the bare name (`varchar`) and its arguments live in `typeArgs` (`column-type.ts`; aliases like `int` → `integer` are normalized, `type-aliases.ts`). The kind offers the note ×/icon and the column handles (`db-table.interactions.ts`); dragging a handle runs `ColumnConnectGesture`, which links the dropped-on row (a header means its primary key).
  - `enum/`: `DbEnumKind`; columns use an enum by naming it as their type.
  - `schema/`: tables, enums and stickies with a `noteName` (DBML sticky notes) form the board's single schema. `DbSchema` is the facade and the only place that edits it (`table-edits.ts`, `enum-edits.ts`, `schema-dbml.ts`); it observes the document only while something subscribes, so it needs no cleanup. DBML is a generated view (`dbml/`: a hand-written parser and serializer for a subset). Parsed text goes through `reconcile*.ts`, which match by name then position so ids survive; `add-missing-tables.ts` creates tables that refs name but nothing defines (on import, paste and blur only). `layout/` tidies it: `schemaGraph` links tables and enums (relations and enum types), `connectedGroup` finds a card's linked group (`DbSchema.connectedTo`, the panel's Select linked), and `tidySchema` (`DbSchema.tidy`, the panel's Tidy up, the `tidy_schema` agent tool) lays each group out in layers (referenced cards left of their users, barycenter ordering, linked rows leveled), stacks the groups and wraps unlinked cards below.
  - `links/`: `DbLinks`, the board's `CanvasLinks` for relations (crow's feet) and enum links. `pruneRefs` is the board's `onRemove`.
