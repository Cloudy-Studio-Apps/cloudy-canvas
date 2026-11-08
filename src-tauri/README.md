# src-tauri

The Rust crate of the desktop shell. It registers plugins, holds config and capabilities, and carries
transports; business logic lives in TypeScript.

## Commands

- `set_hidden(path)` (`src/hidden.rs`): sets the hidden attribute on a file or folder on Windows (runs
  `attrib +h`), does nothing elsewhere. Used for a project's `.cloudy` folder
  (`platform/tauri-project-fs.ts`).
