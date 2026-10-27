# Workspaces

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Workspaces

- **Workspaces** (`canvas/workspace/`): a collaborator's own context on the document, so the user's page, mode, tool, selection and undo never change what it works on. `CanvasWorkspace<O>` is the context-level API agent tools use (elements of its scope, scope, selection, `userSelection()`, guides, the edits, exports, `zoomToFit`/`zoomToElement`, undo); `CanvasEngine` implements it for the user and `engine.workspace(id, init?)` makes an `ActorWorkspace` for a collaborator (`findWorkspace`, `dropWorkspace`; all dropped on close): a headless `Scene` of its scope (`productSceneHooks`, refreshed lazily), its selection, its `viewport` (`actor-viewport.ts`: `showArea`, `followEdit`, in the user's view proportions), its services (`ServiceCache` on its document) and its history. The edits the engine and workspaces share are plain functions over `WorkspaceParts` (`workspace/operations/`: delete, reorder, lock, move, arrange, transform, style, bounds, `sceneExportHost`).
