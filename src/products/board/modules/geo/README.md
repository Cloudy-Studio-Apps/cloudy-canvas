# Geo (Board module)

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Geo

- `geo/`: `GeoKind extends QuickConnectKind`, which delegates the outline (and its connector `sideAnchor`s) to the element's variant. Each variant (`kind`: rectangle, ellipse, diamond, …) is a `GeoVariant` subclass in `geo/variants/<id>.variant.ts`, registered at runtime in `geoVariants` (`variant.registry.ts`), with its label, picker `icon` (an SVG path), default size, `outline` and optional `decorate`. `variantOf(id)` falls back to the rectangle for unknown ids. The shape picker lists `geoVariants.all()`. `PolygonVariant` covers the polygon ones.
