# Shapes

Diagram shapes (R): rectangles, ellipses, diamonds and the other variants, with a label and the shape panel.

- **Tier:** feature
- **Requires:** connector
- **Contributes:** kinds `GeoKind`; boardCanvas: `kinds`, `options`, `tools`; boardEditor: `selectionPanels`, `toolPanels`, `tools`
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `geo.viewer.ts` (the module the HTML viewer loads instead), `geo.canvas.ts` (its canvas side: what `register` gives `boardCanvas`, no UI), `geo.kind.ts`, `geo.draw.ts`, `variants/` (each shape), `shape.tool.ts`, `geo-spec-properties.ts`, `ui/`.

## How it works

- `geo/`: `GeoKind extends QuickConnectKind` (its `specProperties`, `GEO_SPEC_PROPERTIES`, give agents' `create_shapes` the `kind`, `fill` and `stroke` fields, `kind` listing the registered variants), which delegates the outline (and its connector `sideAnchor`s) to the element's variant. Each variant (`kind`: rectangle, ellipse, diamond, …) is a `GeoVariant` subclass in `geo/variants/<id>.variant.ts`, registered at runtime in `geoVariants` (`variant.registry.ts`), with its label, picker `icon` (an SVG path), default size, `outline` and optional `decorate`. `variantOf(id)` falls back to the rectangle for unknown ids. The shape picker lists `geoVariants.all()`. `PolygonVariant` covers the polygon ones.
