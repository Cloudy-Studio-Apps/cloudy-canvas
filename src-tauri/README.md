# src-tauri

The Rust crate of the desktop shell. It registers plugins, holds config and capabilities, and carries
transports; business logic lives in TypeScript.

## Commands

- `set_hidden(path)` (`src/hidden.rs`): sets the hidden attribute on a file or folder on Windows (runs
  `attrib +h`), does nothing elsewhere. Used for a project's `.cloudy` folder
  (`platform/tauri-project-fs.ts`).

## File access

The `fs:scope` in `capabilities/default.json` allows any path (`**`), but on Linux and macOS a glob
never matches a name starting with a dot unless the pattern has the dot itself (the fs plugin's
`requireLiteralLeadingDot`, on by default there). So hidden folders the app writes are listed by
name: `**/.cloudy` and `**/.cloudy/**`, a project's data folder. Add new hidden folders the same
way rather than turning the option off, which would open every dotfile (`~/.ssh`, …) to the webview.
