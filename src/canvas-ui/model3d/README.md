# 3D models (UI side)

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

- **Edit locks** (`use-remote-model-locks.ts`): `useRemoteModelLocks(engine, fileId)` feeds the
  engine's `MODEL_EDIT_LOCKS` (`canvas/model3d/`) with the model each collaborator on the file has
  live (`CollaboratorState.editing`). A lock disappears with its collaborator.
- **Loading** (`load/`): `importModel(main, others, readSibling)` reads a model file into what the
  document stores (`ModelImport`: bytes, material file, texture slots, first-framing aspect) and
  throws an `Error` when it can't be parsed; `loadModel(source)` builds the three.js object to show
  from stored assets (`ModelSource`) and returns it with a `dispose`. Formats: GLB, glTF, OBJ
  (+ `.mtl`) and FBX. A `.gltf` is re-packed as one GLB on import (its buffers and pictures
  resolved first), `format` staying `gltf`. A slot is one per material (an OBJ with no `.mtl`
  has one called `Model`); a material with no texture is untextured (`file: null`, keeps its own
  look), and only a slot whose `file` wasn't found is missing (`ModelSource.missing`, drawn gray); a texture inside the model is `embedded`. A texture file is
  looked for in this order: embedded, next to the model on disk (`siblingReader(path)` over
  `readLocalFile`; any failure is "not there"), then the other files picked or dropped with the
  model, by name regardless of case; else `data: null` (listed as missing, drawn gray). Files a
  loader asks for that were not given are answered by a stand-in picture whose URL names the file
  (`external-texture.ts`, a 1x1 PNG), which is how missing ones are told apart; a `.gltf`'s are read
  from its JSON (`gltf-files.ts`), since its loader gives no URL back.
- **The lazy rule**: `load/load-three.ts` is the only file that imports `three` and its loaders at
  run time, with dynamic `import()`, memoized (`loadThree`). Everything else uses `import type`, and
  `canvas/` never names three, so no one who never opens a model pays for it at startup or in the
  main bundle.
- **Framing** (`bake/frame-model.ts`): `frameModel(object, camera, view)` fits the model's bounding
  sphere in a 35° perspective camera (it fills the frame at zoom 1; zoom divides the distance) and
  turns the model by the view's `angle` around its box center. It gives the projected bounds'
  aspect (clamped 0.25 to 4), which becomes `ModelImport.aspect`.

## The picture

- `modelBaker` (`bake/model-baker.ts`, a `ModelBaker` from `canvas/model3d/`) is what plain-TS code
  gets to import models and draw their picture: `bake(source, view, box)` loads the model, draws it
  with one shared off-screen `WebGLRenderer` (transparent, created on the first bake) and returns
  PNG bytes. The size is the box times `PICTURE_SCALE`, the longest side capped at
  `PICTURE_MAX_SIDE`. Bakes run one at a time and the loaded model is always disposed.
- `buildPictureScene`, `addLighting` (a hemisphere light and a key light from the camera's upper
  left, fixed values) and `renderPicture` build and draw the scene. The live view reuses them with
  its own canvas, so the picture matches what the user saw.

## Import

- `importModelFiles(files, view, place, doc, nextIndex)` (`import/`) is what a product's
  `importFiles` hook calls: for each model file it imports, asks to continue when the total is over
  `MODEL_SIZE_WARNING_BYTES` (`confirmModelSize`), bakes the first picture at the rect
  `fitInView({ 400 x aspect, 400 }, view, 0.8)`, stores the model, material, textures and picture as
  assets (`newModelAssetId()`) and makes the element with the product's `place(data, rect, index)`.
  A failure shows `notifyError` and the file is still claimed. Companion textures and `.mtl`/`.bin`
  files that were used are claimed too.
- `confirmModelSize(name, bytes)` shows the `ModelSizeDialog`, which an editor mounts once as an
  overlay (a module-level request, `model-size-prompt.ts`); without it the promise never resolves.
- `pickModelFiles()` is the file picker for models (`openFile`, desktop only, one file; `[]` if
  cancelled or on the web).

## Editing

`live/` is the one editing path: right click → Edit and the panel's first change both make the
model live, and finishing writes the result once.

- **The session** (`useModelEditStore`, app UI state): `start(engine, id, data)` makes one model
  live (one at a time across editors; starting another finishes the current one). It's refused
  with a toast when the document is read-only or `MODEL_EDIT_LOCKS.assertFree` throws; otherwise
  it takes the lock (`lockLocal(id)`) and the draft starts from `data`. The store holds the
  engine, so two editors never confuse their ids. `change(patch)` edits only the draft (angle,
  zoom kept in `ZOOM_RANGE`, textures): nothing is written while it's live. `stop()` releases the
  lock at once and calls `finishModelEdit`; an editor closing mid-edit still finishes it
  (`engine.onClose`).
- **Finishing** (`finishModelEdit(engine, id, data, draft)`): when the draft differs, bakes the
  picture at the element's current box (from the live scene when it's still kept, else with
  `modelBaker`), adds it as a new asset (`newModelAssetId()`) and writes `angle`, `zoom`, `textures`
  and `pictureAssetId` in one `asUndoStep`, so the whole edit is one undo step. Nothing changed:
  nothing is written. The old picture stays until the sweep, as undo may need it.
- **The view** (`ModelLiveView`): a DOM overlay over the element, placed with `useViewMapping`
  like `ImageCropOverlay`, holding three.js's own canvas (transparent, drawn only when the view,
  zoom or size changes, never in a loop). Dragging turns the model (0.5° per pixel: across around
  Y, up and down around X); the wheel zooms the model and is prevented, so the canvas doesn't
  zoom; Esc, caught before the canvas and its mode, finishes. A spinner shows while it loads
  (`status: "loading"`).
- **Release** (`live-model.ts`): one live scene and its `WebGLRenderer` are kept for
  `LIVE_RELEASE_DELAY_MS` after the view closes, then the model, its textures and the WebGL
  context are freed. Reopening the same model before then is instant; other textures load it
  again into the same renderer.
- **Mounting it** (`useModelEditSession(engine)`): an editor's overlay calls it once; it starts an
  edit on `MODEL_ACTIONS.edit` (the element's kind must be a `ModelKind`), finishes when the element
  leaves the selection or goes and when the editor unmounts, and returns `{ id, element, data,
frame }` to pass to `<ModelLiveView engine frame data />`. While a model is live it also covers the element on this canvas (`engine.coverElements`), so the old picture doesn't show under the view; the kind always draws the picture.

## The panel (`ui/`)

`ModelPanel` (`{ engine, id, data, onConvert }`) is the properties panel both products show for a
selected model: Model (file name, size), Rotation, View (zoom in %, Reset view), Textures
(`ImageChooseButton` per slot, assets named with `newModelAssetId`), then Edit in 3D and Convert to
PNG. It shows the live draft when this model is live, else the element's data. The first change
calls `useModelEditStore.start` and goes to the draft (no document undo steps until the edit
finishes). Fields are disabled when the document is read-only, someone else holds the model
("Being edited by ..."), or the model's file isn't in this document (`hasModelData`; only Convert
stays enabled). `ConvertModelDialog` (`{ open, onOpenChange, onConfirm }`) asks before converting:
it's permanent, and the file gets lighter once it's closed.
