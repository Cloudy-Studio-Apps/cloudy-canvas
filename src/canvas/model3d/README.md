# 3D models (engine side)

_Plain TypeScript both products share. The three.js side (loaders, live view, picture bake) is in
`canvas-ui/model3d/`; each product's element kind lives in its own `modules/model3d/`._

- **Data** (`model3d.types.ts`): `ModelData` is what a model element holds on top of its product's
  base: the model's asset (`modelAssetId`, plus `mtlAssetId` for an OBJ), `format`, `fileName`,
  `fileSize`, the saved `pictureAssetId` the canvas and exports show, the view (`angle` in degrees,
  `zoom`) and the `textures` slots. A slot is missing when it is neither `embedded` nor has an
  `assetId`. `model3d.constants.ts` has the size warning (`MODEL_SIZE_WARNING_BYTES`), the
  accepted `MODEL_EXTENSIONS`, the picture's scale and side cap, the live view's release delay,
  `DEFAULT_MODEL_VIEW`, `ZOOM_RANGE` and `MODEL_ACTIONS` (`edit`: the element action a kind's
  `editElement` or a context menu sends to open the live view).
- **Source** (`model-source.ts`): `modelSource(doc, data)` reads what the viewer draws a stored
  model from (`ModelSource`): its bytes, the picture of every slot whose asset is in the document
  and the missing slots; `null` when the model's asset isn't there.
- **Kinds** (`model-kind.ts`): a kind that holds a model has `modelData(el)` (`ModelKind`,
  `isModelKind`). `modelAssets(data)` lists every asset id it holds. Kinds still report the
  picture through `kind.assets(el)` so copies, exports and the renderer find it.
- **Ids** (`model-asset-id.ts`): every asset of a 3D object is made with `newModelAssetId()`, which
  starts with `model3d:`. `isModelAssetId` is how the sweep tells them apart from images and
  others, so it never removes an asset it doesn't own. Never use the prefix for anything else.
- **The sweep** (`sweep-model-assets.ts`): `unusedModelAssets(doc, kinds)` lists the `model3d:`
  assets no element of the document refers to (every page, not only the one on screen; a copy
  keeps the data alive), nor the file's picture list (`doc.assetIndex()`) nor a style or variable
  (any `model3d:` id written in `doc.tokenRecords()`, e.g. an image paint made from a converted
  model's picture). It is the module's `assetSweeps` hook; `engine.sweepAssets()` runs all
  hooks and removes the result with `doc.removeAssets`.
- **When it runs:** only when undo can no longer reach the data. Assets are outside undo and a
  file autosaves, so removing a model's data as soon as the element goes would break Ctrl+Z, and
  every edit leaves an old picture undo may need. So `useCanvasAutosave` sweeps when the file opens,
  before the app quits and when the editor closes (after a live edit wrote itself and just before
  the closing save writes it), never in the debounced autosave. Guests never save, and a read-only document is left alone, so only
  the host sweeps. The file gets lighter on close, not when a model is deleted or converted.
  Yjs drops the deleted bytes from the saved update (the document keeps `gc` on).
- **Edit locks** (`model-edit-locks.ts`): `MODEL_EDIT_LOCKS` is who has each model live (one
  person at a time): this user's own lock (`lockLocal`, `holderOf` gives `"self"`) and the
  others' from presence (`setRemote`). It is one registry per shared document, kept in a `WeakMap`
  by the document's `Y.Doc`: an agent's workspace has its own service cache over its own proxy of
  the document, and must still see the user's lock and everyone else's. Agents treat any holder,
  the user included, as busy (`assertModelFree`).
- **Import** (`to-model-data.ts`): `toModelData(imp, ids)` builds the `ModelData` of a fresh import
  (default view; a slot keeps its `file` and `embedded` and gets its stored picture's asset id).
  `MODEL_BASE_SIZE` (400) is the height a model is placed at before it is fit to the view. The
  drop flow is the `importFiles` point (see `clipboard/`); the work is in `canvas-ui/model3d/import/`.
- **Hiding the picture while live:** `engine.coverElements(source, ids)` hides elements on the
  engine's own canvas (`ElementView.setCovered`; captures for file previews show them, exports and
  agents' pictures build their own views and never see it). `useModelEditSession` covers the live
  model; a kind's `draw` always draws the saved picture.
- **Storing an import** (`store-model.ts`): `storeModel(baker, imp, rect, doc)` bakes the first picture
  and adds the model, material, textures and picture as assets, returning the `ModelData`; the drop
  flow and agents' `model3d_add` both use it (`importedSource` is the `ModelSource` of an import).
- **Agent tool pieces** (`mcp/`): what the products' model tools share. `angleArg`/`zoomArg`/`rejectViewPatch`
  (a kind's `completePatch` uses the last to refuse `angle`/`zoom` patches), `textureArgs`, `assertModelFree(engine, id, noun)` (read-only
  or anyone holds the model live, the user included), `readAgentModel` + `agentModelReport` (the
  reading half of `model3d_add` and the slots, missing ones and size warning they report;
  `storeModel` writes), `setModelView` (the whole `model3d_view_set`: validate, read, bake off screen,
  recheck, one undo step), the input schemas `ADD_MODEL_PROPERTIES`/`SET_MODEL_VIEW_PROPERTIES` and
  the shared tools' name, description and schema (`MODEL_ADD_TOOL`, `MODEL_VIEW_SET_TOOL`,
  `MODEL_CONVERT_TO_PNG_TOOL`, `model-tool-specs.ts`: `model3d_add` takes the design's `name` and
  `parent` too, "Designs only."), so both products serve one `model3d_*` tool each. Each product
  keeps its own `requireModel`, factory, convert and `run`.
