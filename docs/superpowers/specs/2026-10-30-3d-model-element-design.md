# 3D models on the canvas

Status: design, awaiting approval. Date: 2026-10-30.

## Intent

A user can put a 3D model (FBX, OBJ, GLB/glTF) on a Board or Design canvas, turn it to the exact
angle they want, and use it next to everything else. When they're done, they can flatten it into a
plain image for good, which makes the file lighter.

The model must never make the canvas slow. A canvas with 50 models should cost about the same to
draw as a canvas with 50 images.

## Goals

- Import FBX, OBJ and GLB/glTF in both Board and Design.
- A 3D object is a normal element: it moves, resizes, layers, copies and exports like the others.
- Rotate by dragging, or by typing exact X, Y, Z values. Zoom by scrolling or typing.
- Assign textures, including when they're missing from the import.
- Convert to PNG permanently, leaving a plain image element.
- Agents can place, turn and convert models over MCP.
- Everything looks native in all themes and reuses existing components.

## Non-goals (first version)

- Animations, lighting controls, material editing beyond assigning a texture image.
- Scenes with several models in one element.
- Moving the model inside its box (pan). Only rotate and zoom.
- Turning a converted PNG back into 3D.

## Anti-goals

These count as failures even if the feature technically works:

- Any live 3D running on the canvas when nobody is editing a model.
- App startup or bundle cost for people who never use 3D.
- A panel that looks bolted on: raw inputs, hard-coded colors, or anything that breaks in a theme.
- Convert to PNG leaving the model behind in the file.
- An agent inserting the same model again each time it wants to move it.

## The user's flow (decided by the user)

1. **At rest:** the object shows a saved picture of its last angle. No 3D is running.
2. **Editing:** right click → Edit opens live 3D on that object only. Clicking away or pressing Esc
   finishes.
3. **After editing:** the object goes back to being an image. To change it, repeat the flow.
4. **Convert to PNG:** right click → Convert to PNG is permanent. The 3D object is forgotten, and a
   plain square element with the PNG remains.
5. **Side panel:** selecting the object shows a panel with a file picker per texture, and X, Y, Z
   rotation fields, as a small version of a 3D app with only the basic needs. Dragging and typing
   both work.
6. **Large files:** above 10 MB, show a warning that larger files can cause problems.
7. **MCP instructions:** agents reuse the object already inserted and move it. Once the user is
   happy with the final render, the agent asks whether to convert it to PNG for a lighter file.

The approved panel mockup has, top to bottom: **Model** (file name, size), **Rotation** (X, Y, Z),
**View** (Zoom, Reset view), **Textures** (a thumbnail and picker per slot, missing ones flagged),
then **Edit in 3D** and **Convert to PNG**.

## Calls made by the designer

The user hasn't explicitly decided these; each can be overruled.

**Editing**

- Finishing updates the picture immediately. The 3D view is released a few seconds later, so
  reopening right after a misclick is instant. This is how "after a few seconds" is honored without
  the object looking stuck.
- Only one model is live at a time. Opening another finishes the current one.
- Selecting shows the panel but keeps the object an image. The first change in the panel makes it go
  live, exactly like choosing Edit. There is one editing path, not two.
- Edit shows a loading state while the model is prepared.
- Lighting is fixed and sensible. Scroll zooms the model, not the canvas, while editing.
- Rotation is the model's rotation in degrees. Reset view returns to the fit-on-import angle and
  100% zoom.

**Import**

- Also accept GLB/glTF, the cleanest format of the three.
- The 10 MB warning asks before inserting (Continue / Cancel). It counts the model plus its textures.
  It warns only; there is no hard limit.
- The element's box starts from the model's fitted framing. The first picture is rendered on import
  so it never appears empty.
- Texture handling, in order:
  1. Embedded textures (GLB, some FBX) just work.
  2. On desktop, look next to the model for its `.mtl` and images. (Only where the app can read that
     folder; the browser build can't, and this step is skipped.)
  3. Files dropped together are matched by file name.
  4. Anything still missing loads plain gray with a notice, and the panel lists it. An OBJ with no
     `.mtl` gets one slot for the whole model.
- A file that can't be parsed reports through `notifyError` and inserts nothing.

**Picture and conversion**

- The picture has a transparent background and is rendered sharper than the box, so it stays crisp
  when zoomed. Its size follows `canvas/image` and `render` limits (builder's choice of multiple).
- Resizing the box does not re-render it until the next edit.
- Convert keeps the same position and size. Design gets a rectangle with the image as its fill (like
  a pasted image); Board gets its picture element. Selection moves to the new element.
- Convert is one undo step and Ctrl+Z restores the 3D object during the session (see Removing data).
- The element's rotation, opacity and layer position on the canvas are unaffected by any of this.

**Everything else**

- 3D code loads the first time a model is opened or imported. It isn't in the main bundle.
- Exports (PNG, PDF, SVG, HTML viewer, thumbnails) use the saved picture.
- In live sessions, everyone sees the picture update. One person edits a model at a time; a second
  person sees it as busy. The model reaches guests with the file, as images do today.
- Agents: `add_model`, `set_model_view` and `convert_model_to_png` per product (names may follow the
  neighboring tools). Agents move and resize with the existing tools. They never convert on their
  own. Over 10 MB the tool result carries the warning rather than a dialog.
- Agents render off-screen, through a standalone picture service the live overlay also uses. They
  never open the live view, so they don't take the one live slot or interrupt the user's edit.
- The "busy" lock is per model, carried in presence with the editor's id, and released when that
  person finishes or drops. `set_model_view` and `convert_model_to_png` on a model someone is editing
  fail with a clear "being edited" error, validated before writing, and never override the unfinished
  edit. The MCP instructions tell agents to wait and retry after the user finishes.

## Removing data, the part that needs care

Today nothing deletes document assets: `CanvasDocument` has `addAsset` but no removal, and assets are
outside undo. Files autosave, so removing a model on save would break Ctrl+Z. Each edit also leaves
an old picture that undo may need.

So the sweep runs when undo can no longer reach the data:

- Add asset removal to `CanvasDocument`, read-only aware like `addAsset`.
- Keep track of which assets belong to 3D objects (models, textures, pictures).
- Sweep on open and on the final save at close: remove tracked assets that no element references.
  Copies share assets, so a model stays while any copy uses it.
- Result: the file gets lighter when closed, not the instant Convert is pressed. Tell the user this
  in the convert confirmation or notice.
- Check that Yjs actually drops the deleted bytes from the saved update (`gc` on the doc). If it
  keeps them, the sweep has to rebuild the document's state, and the design goal isn't met otherwise.
- Live sessions: only the host sweeps.

## How it fits the code

Follow `docs/modules.md`. Products can't import each other, so the shared part sits below them:

| Where                              | What                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/canvas/model3d/`              | Plain TS: element data types, defaults, tracked assets, the sweep, the size warning threshold |
| `src/canvas-ui/model3d/`           | three.js: lazy loaders, the live overlay, the picture bake, the shared panel                  |
| `products/board/modules/model3d/`  | Board module (feature): its kind, factory, context menu, `.canvas.ts`, `.viewer.ts`, MCP      |
| `products/design/modules/model3d/` | Design module (feature, requires `rectangle`): its kind, factory, section, context menu, MCP  |

Element data, on top of each product's base (`BoxKind` for Board; the design node base for Design):
model asset id, source format and file name, picture asset id, `rotation {x,y,z}`, `zoom`, and a
texture slot list (slot name, optional asset id). Elements stay plain data (rule 11) and all edits go
through `CanvasDocument`, with `doc.checkpoint()` first (rule 10); a whole Edit session is one undo
step, like a color drag.

- **Drawing:** the kind draws the picture through the same path images use (`kind.assets(el)`).
- **Live view:** a DOM overlay positioned over the element with `canvas-ui/overlay`, the way image
  crop does it. It holds three.js's own WebGL canvas, separate from Pixi. It's released after the
  delay, disposing geometry, textures and the context.
- **Import:** drop and pick need a new canvas point beside `pasteImage`, since model files aren't
  images (`drop-files.ts`, `canvas/clipboard/`). Skipped-file messages must stop treating them as
  unsupported.
- **Panel:** Design uses `designEditor.propertySections`; Board uses `selectionPanels`. Both render
  the same shared panel from `canvas-ui`.
- **Clipboard:** copying encodes assets as base64 into the system clipboard, which is unworkable for
  a large model. Copying within a file keeps the shared asset id; between files, only the builder's
  size-capped behavior or the picture.
- **MCP:** tools in `.mcp.ts` files, each in one `asUndoStep`, validating before writing (rule 20).
  The two rules from the flow go in `BOARD_MCP_INSTRUCTIONS` and `DESIGN_MCP_INSTRUCTIONS`.
- **Dependency:** `three` and its FBX, OBJ/MTL and GLTF loaders, imported only by dynamic `import()`.

## Look and feel (user requirement)

Must align with the current app style, reuse components where possible and work with every theme.

- `NumberInput` for X, Y, Z and Zoom; `Field`/`Section` for layout; `ImageChooseButton` and
  `chooseImageAsset` for textures; `AppDialog` for the warning and any confirmation; `ToolButton` or
  kit buttons for actions. No raw `<button>` or `<input>`.
- Semantic tokens only, sharp radii (rules 26, 27). The mockup's colors were placeholders.
- The live view's background is transparent, or a token read from the theme, never a fixed color.
  The saved picture never depends on the theme.
- Text through `t` in English and Spanish (rule 30). Errors through `notifyError` (rule 29).
- A changelog entry in both files under New (rule 31).

## Left to the builder

- Exact file split, module wiring and names.
- The picture's resolution multiple, and framing math.
- The fixed lighting setup.
- How "tracked assets" are stored, as long as the sweep's rules hold.
- Whether the file migration is needed (a new element type may not need one).

## Docs to update

READMEs for the new folders and modules; `docs/modules.md` tier tables; `src/canvas/document/README.md`
for asset removal ("nothing deletes unused assets yet" stops being true); `src/canvas/clipboard/README.md`
for model drops; the CLAUDE.md topic table if the 3D folders warrant a row.
