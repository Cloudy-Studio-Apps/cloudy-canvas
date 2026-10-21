# temporal/

Code moved out of `src/` while the board is rebuilt on the element architecture (see "Elements" in
`CLAUDE.md`). Nothing here is compiled, linted or formatted. Paths mirror `src/`.

- Features waiting to be ported: text, connectors, sections, DB tables/enums (DBML) and ER
  diagrams. That covers their engine modules, tools, layers, agent tools and React panels.
- Reference copies of core files from before the rebuild: `shapes.types.ts`, `canvas-engine.ts`,
  `scene.ts`, `hit-test.ts`, the old drawers and so on.

Port a feature into an `src/engine/elements/<type>/` folder (plus its tool and panel), then delete
what it replaced from here.

## Architecture notes for the features in here (from CLAUDE.md before the rebuild)

Paths are relative to `src/engine/`. "Shape" is the old name for an element.

- **Shapes and connectors** (`shape` and `connector` tools). `geo` shapes (`geo/` outlines) have fill, stroke and centered text that's edited with the `TextEditor`. A `connector`'s ends are free points or attached to a shape (`shapeId` plus an optional side).
  - `Scene.refresh()` replaces each connector with a copy resolved by `connectors/resolve-connector.ts` (route, bounds, `points`). So **read shapes for geometry from the scene** (`scene.get`, `ctx.getShape`), not `doc.get`; the stored connector bounds are stale.
  - When shapes change, the engine also redraws the connectors attached to them (`scene.connectorsAttachedTo`). Deleting goes through `remove-shapes.ts`, which frees the attached connector ends and prunes DB refs.
  - Presses on handles (connector ends, resize, quick-connect dots, table columns) are resolved by `find-interaction.ts` before normal selection. The handle geometry lives in `handles/`.
- **Sections** (`section` tool, `sections/`). Membership is geometric: a section's members are the shapes fully inside it, worked out when a drag starts (`withSectionMembers`). Nothing stores parent links, so dropping in, dragging out and resizing need no bookkeeping.
  - Drawing order comes from `zOrderKey` (`document/z-order.ts`): sections first, larger ones further back, then everything else by `index`. Sections render in their own Pixi layer, under the DB relation lines.
  - A section is hit by its title or border only; clicks inside it reach its contents or start a marquee. Deleting a section deletes its members.
- **Database tables** (`db/`, the `db` tool): each table is a `db-table` shape whose `columns` are a plain JSON array. A relation lives on the source column (`column.ref`) and points at the target by table/column **id**, so moves and renames never break it. Tables keep `indexes` (whose parts are column ids or expressions) and a `note`, which is drawn as a bubble beside the table (`noteHidden` is view state, written with `doc.updateUntracked`). A column's `type` is the bare name (`varchar`) and its arguments live in `typeArgs` (`255`); `document/column-type.ts` splits and joins them (`splitColumnType`, `formatColumnType`), and aliases are normalized on input (`int` → `integer`, `document/type-aliases.ts`). Enums are `db-enum` cards; columns use an enum by naming it as their type. Stickies with a `noteName` are DBML sticky notes. Tables, enums and linked stickies together form the board's single schema (`schema-shapes.ts`).
  - `DbSchema` (`engine.db`) is a facade and the only place that edits the schema. The logic lives in `table-edits.ts`, `enum-edits.ts` (an enum rename also retypes its columns) and `schema-dbml.ts`, which has `applyTableDbml` / `applyEnumDbml` (one slice), `applySchemaDbml` (the whole schema) and `importSchemaDbml` (merge).
  - DBML is a generated view (`db/dbml/`: a hand-written parser and serializer for a subset). Parsed text goes through `reconcile.ts` and `reconcile-*.ts`, which match tables, columns, enums, values and notes by name, then by position for renames, so ids survive. Tables that refs name but nothing defines are created by `add-missing-tables.ts` on import, paste and blur (not while typing, so half-typed names don't become tables). Older boards get new fields filled by `document/fill-shape-defaults.ts`.
  - Relations are resolved in `Scene` and drawn by `render/layers/relation-layer.ts` under the shapes. New relations are dragged from column handles by `tools/connect-gesture.ts`, with `input/edge-auto-pan.ts` panning when the pointer nears the edge.
- **ER diagrams** (`er/`, the `er` tool). These are Chen-notation entity–relationship diagrams with the extended model. The language and the visual editor are documented in `docs/er-language.md`. There are six shape types:
  - `er-entity`: rectangle, doubled when `weak`.
  - `er-relation`: diamond, with `identifying` (double) and `idMark` (the "I" bar). Its `participants` point **by id** at entities or aggregations, with `(min,max)`, a role and an `arrow` flag.
  - `er-attribute`: `ownerId` is an entity, relation, composite attribute, hierarchy (its discriminator) or aggregation. It has key/multi/derived/optional flags, a `look` (`ellipse`/`lollipop`) and an `order`.
  - `er-isa`: hierarchy triangle, with `parentId`, children, `exclusive`/`total` and parent/child cardinalities.
  - `er-aggregate` and `er-constraint`: their **geometry is derived**. `Scene.refresh()` runs `resolve-er.ts`, so the box follows the relation and its participants, and the constraint's `points` follow its relations. Read their geometry from the scene, not the doc. Aggregations sit behind, like sections, and are hit by their border or name only.
  - Lines aren't shapes. `er-links.ts` derives them, including loops for self-relations (`loop-route.ts`), arrows and the total mark. `render/layers/er-link-layer.ts` draws them under the shapes.
  - **A board holds several diagrams.** Every ER shape has `diagram` (an id) and `diagramName` (repeated on each shape of the diagram). Names, text, layout and edits are per diagram. `applyErPlan(doc, plan, scope)` stamps the diagram on every shape it writes, so creators just spread `NO_ER_DIAGRAM`. Boards saved before diagrams existed are split into diagrams by connected component on load (`migrate-er-diagrams.ts`, not an undo step).
  - `ErModel` (`engine.er`) is the board-level facade: `diagram(id)`, `diagrams()`, `diagramOf(shapeId)`, `shape(id)`, `remove(id)` and `newDiagram(center?)` (the `er` tool always starts a new diagram). `EngineState.selectedErDiagram` is the selection's diagram.
  - `ErDiagram` (`er-diagram.ts`) is one diagram:
    - `text()` and `applyText(text, { createMissing })`. The text in `er/lang/` is parsed with the DBML tokenizer; its `Diagram <name> [style: …]` line carries the name. `reconcile-er.ts`/`reconcile-extended.ts` match by name then position, so ids and positions survive. `add-missing-entities.ts` creates named-but-undefined entities on paste/blur only.
    - `textRange(shapeId)`: where the shape's block is written (`serializeErBlocks`), which the Text tab highlights.
    - `relayout()` and `rename(name)`.
    - `edits`: `er-edits.ts` over the pure functions in `er/edits/`. Each edit builds the next model and goes through `applyErPlan` (one undo step, new shapes auto-placed).
  - `er/layout/` is deterministic auto-layout:
    - `entity-grid.ts` gives entities grid cells; hierarchy children go in the row under their parent.
    - `place-isas.ts` places triangles, and `place-relations.ts` places diamonds.
    - `place-aggregates.ts` and `aggregate-boxes.ts` keep outside shapes out of aggregation boxes.
    - `place-attributes.ts`/`fan-out.ts` fan attributes into free directions, avoiding boxes and lines.
    - `resolve-overlaps.ts` cleans up leftover overlaps.
  - `applyErPlan` lays out an all-new diagram fresh and places only new shapes around an existing one.
  - Dragging takes attributes (and an aggregation's contents) along (`withErMembers`). `pruneEr` cleans up orphans after removals.
  - ER names are renamed in place with the `TextEditor`: `ErNamedShape` is part of `EditableShape`, and `editableText()` reads the name.
