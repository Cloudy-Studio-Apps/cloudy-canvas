# 3D models (UI side)

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

- **Edit locks** (`use-remote-model-locks.ts`): `useRemoteModelLocks(engine, fileId)` feeds the
  engine's `MODEL_EDIT_LOCKS` (`canvas/model3d/`) with the model each collaborator on the file has
  live (`CollaboratorState.editing`). A lock disappears with its collaborator.
