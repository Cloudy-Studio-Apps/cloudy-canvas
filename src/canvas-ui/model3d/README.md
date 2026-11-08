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
