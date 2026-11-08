# Prototype mode: design

_Approved mockup: [docs/prototype/prototype-mode.html](../../prototype/prototype-mode.html) (2026-11-05)._

Prototyping in a `.cdesign` is a **mode**, like Catalog and Design system, not a properties tab: it
changes how the canvas works (its own tools, link arrows, a player), so it's one
`defineDesignMode({…})` in a new feature module, `prototype`. The Design mode loses its Prototype
tab. One file holds an app's flows and a website's side by side; each flow says which device it
plays on.

## Words

- **Screen**: a top-level frame of a design page (`isFrame(el) && el.parentId === null`).
- **Interaction**: what a layer (or a screen itself) does: a trigger, an action and a transition.
- **Flow**: a named starting screen with the device it plays on. A page can hold several.
- **Player**: the overlay that plays a flow in its device.

## Data (in the Yjs doc, so undo, files, copies and live sessions get it)

- **Interactions** are an optional node field, `interactions: PrototypeInteraction[]`, read
  defensively (`nodeInteractions(el)`, `[]` when missing or malformed), as the catalog reads
  `repeatCopy`. Any node can have them, a screen included.
- **Flows** are records, like brochures: a `prototype-flow` element kind that is never on a
  page's canvas, drawn or hit.
- Copies: `remapIds` already points a link at a copied screen's copy; a link to a screen that
  wasn't copied keeps pointing at the original (Figma does the same). Flows aren't copied.
- Deleting a screen, in the same undo step (`onRemove`): interactions whose `to` was removed go,
  flows starting at it go, and a deleted design page's flows go.

```ts
type PrototypeTrigger = "click" | "hover" | "press" | "enter" | "leave" | "drag" | "key" | "delay";
type PrototypeAction = "navigate" | "back" | "overlay" | "swap" | "close" | "link";
type PrototypeAnimation =
  "instant" | "dissolve" | "move-in" | "move-out" | "push" | "slide-in" | "slide-out";
type PrototypeDirection = "left" | "right" | "up" | "down"; // where things move
type PrototypeEasing = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring";
type OverlayPosition = "top" | "center" | "bottom";
type PrototypePlatform = "mobile" | "tablet" | "desktop" | "web";

interface PrototypeTransition {
  animation: PrototypeAnimation;
  direction: PrototypeDirection; // used by move-in, move-out, push, slide-in, slide-out
  duration: number; // ms, 0–5000
  easing: PrototypeEasing;
}
interface PrototypeInteraction {
  id: string; // createId()
  trigger: PrototypeTrigger;
  key?: string; // trigger "key": KeyboardEvent.key, compared case-insensitively
  delay?: number; // trigger "delay": ms after the screen shows, 0–60000
  action: PrototypeAction;
  to?: string; // navigate, overlay, swap: a screen's id
  url?: string; // link: http(s) only
  transition: PrototypeTransition;
  overlay?: { position: OverlayPosition; closeOutside: boolean; dim: boolean }; // overlay, swap
}
interface PrototypeFlowElement extends CanvasElement {
  type: "prototype-flow";
  name: string;
  page: string; // the design page it belongs to
  start: string; // a screen of that page
  platform: PrototypePlatform;
  device: string; // an id of PROTOTYPE_DEVICES[platform]
  orientation: "portrait" | "landscape"; // mobile and tablet; ignored otherwise
  hints: boolean; // a missed click flashes the hotspots
}
```

Defaults: a new interaction is `click → navigate` with `dissolve`, `left`, `300`, `ease-out`. A new
overlay interaction gets `{ position: "center", closeOutside: true, dim: true }`. A new flow is named
after its screen (`"<screen> flow"`); a screen wider than 600 units gets `web`/`browser-1280`, any
other `mobile`/`iphone-16`.

Devices (`PROTOTYPE_DEVICES`, labels in i18n):

| Platform | Ids                                            | Chrome in the player                    |
| -------- | ---------------------------------------------- | --------------------------------------- |
| mobile   | `iphone-16`, `iphone-se`, `pixel-9`            | a phone body                            |
| tablet   | `ipad-air`, `galaxy-tab`                       | a tablet body                           |
| desktop  | `window-mac`, `window-windows`, `window-linux` | a title bar with that OS's buttons      |
| web      | `browser-1280`, `browser-1440`, `browser-fit`  | a browser bar showing `<page>/<screen>` |

The device draws around the screen at the screen's own size, scaled to fit the window. It never
resizes the screen.

## The mode (`prototype.mode.ts`)

- `order: 5` (between Design 0 and Catalog 10), icon `Workflow`, tool `prototype.select`.
- Tools: **Select** (`prototype.select`, V: selects any layer, deep, never moves or resizes),
  **Connect** (`prototype.connect`, L), plus `allowTools: ["hand"]`.
- Toolbar: Select, Hand, Connect | Add flow start (Shift+F) | Play (Ctrl+Enter).
- Delete removes the selected layers' interactions, never the layers (its menu label says
  "Remove interactions"); layers are deleted in the Design mode.
- A press on a screen's empty area **selects the screen** (decided with the user, 2026-11-08). The
  Design mode differs: since "select inside frames" there, the same press starts a selection box.
  In this mode screens are the second most common target (flow start, a screen's own triggers,
  "Links to this screen") and the drop target of a dragged link, while a selection box is rarely
  needed (Shift+click covers multi-select for Delete). The name label and Shift+Enter (select
  parent) work in both modes. `PrototypeSelectTool` gets this by passing `SelectTool` a context
  whose `targetAt(world)` is always `targetAt(world, true)`, never asking for the background.
- `prototype.toggle` (Shift+E), a product host command, switches between Design and Prototype
  from either mode.
- Rail: a **Flows** tab, `keep: ["layers"]`.
- Sidebar (replaces the properties panel): a layer's **Interactions**; a screen's **Flow start**,
  **Interactions** and **Links to this screen**; a flow's name, start, platform, device,
  orientation, hints, Play and Delete; with nothing selected, **Show links: All / Selection**.
- Overlays: the link arrows with flow flags, the connect drag line, and the player.
- Layers panel: a ⚡ badge on layers with interactions (`layerBadges`, Prototype mode only).

**Connect:** from the selected layer's square handle (Select tool) or from any layer (Connect
tool), drop on another screen = add `navigate` to it; drop on empty canvas after more than 24
screen px = add `back`; drop on its own screen = nothing. One undo step.

## Arrows (`linkPath`)

A layer with a link to a screen gets one cubic arrow. Forward (target left edge ≥ source right
edge): from the layer's right middle to the target's left edge, `y` clamped 24 units inside it.
Backward: a layer in the lower half of its screen goes under both screens into the target's bottom
edge, otherwise over their tops into its top edge, 36 units clear. Overlay links are dashed. Back
and link get a short stub with a chip ("Back", "Open link"). The selection's arrows are drawn
stronger; "Show links: Selection" hides the rest.

## Player

- One session: a stack of screens (Back pops) and a stack of overlays above it.
- Screens are pictures drawn with `exportElements` in the workspace `prototype:player`, kept
  per screen for the session; hotspots are DOM boxes from the scene's geometry of the screen's
  layers with interactions.
- Transitions follow the interaction (Web Animations): `left` = the new screen comes in from the
  right. Back replays the transition that opened the screen, mirrored.
- Overlays are placed by position and dim when asked. Clicking outside closes them when asked, and
  closing reverses how they opened.
- Triggers: click, while hovering (an overlay closes on leave), while pressing, mouse enter and
  leave, drag (12 px), key press (on what's showing), after delay (cleared on leaving the screen).
- Link opens through `@platform`'s external opener. Only `http:` and `https:` are allowed.
- Bar: flow picker, device label, Back (Alt+←), Restart (R), hotspots (H), Close (Esc). A missed
  click flashes the hotspots for 700 ms when the flow's `hints` is on.

## Agents (MCP)

`list_flows`, `set_flow` (create or update), `remove_flow`, `get_interactions`, `set_interactions`
(replace a layer's list; validates every field and every `to` before writing, in one
`asUndoStep`).

## Not yet (deliberately out of v1)

Smart animate (it needs layers drawn separately), Scroll to and scrolling screens (frames clip
their content), Change to (needs components and variants), a Present mode for slides (it will
reuse this player), comments and sharing a prototype link (web build).
