<p align="center">
  <img src="src-tauri/icons/source/app-icon.png" alt="Cloudy Canvas" width="112">
</p>

<h1 align="center">Cloudy Canvas</h1>

<p align="center">
  Whiteboards and designs in one desktop app, with your files kept on your own disk.
  <br>
  by <strong>DarkRedgm</strong> · part of <strong>Cloudy Studio</strong>
</p>

<p align="center">
  <a href="https://github.com/Cloudy-Studio-Apps/cloudy-canvas/releases/latest">Download</a> ·
  <a href="docs/plugins.md">Plugins</a> ·
  <a href="#building-from-source">Build from source</a>
</p>

> **Early demo.** Cloudy Canvas is under heavy development. Expect missing features and rough edges, and keep copies of files that matter to you.

## What it is

One app with two kinds of files on a shared canvas engine:

- **Boards** (`.cboard`), FigJam-style whiteboards with sticky notes, shapes, connectors, text, sections, tables, freehand drawing, stickers, images, link cards, database schemas (DBML) and ER diagrams.
- **Designs** (`.cdesign`), Figma-style design files with pages, frames, a layer tree, rectangles, ellipses, polygons, stars, lines, vectors with a pen tool, text with system and Google fonts, gradients, image fills with cropping, boolean operations, masks, strokes, and effects (shadows, blurs, noise, glass, custom shaders).

Also:

- **Local-first.** Files are plain files on your disk, autosaved as you work. No account is needed.
- **Figma and FigJam import.** Open a `.fig` or `.jam` file ("Save local copy…" in Figma) and it becomes an editable design or board.
- **AI agents.** The app runs a local MCP server, so Claude Code, Cursor, Codex, VS Code and other agents can read and edit the open board or design while you watch. Every agent edit is one undo step. Open the **Agents** menu in the top bar to connect one.
- **Plugins.** New element types, tools, panels and agent tools can be added as plugins. See [docs/plugins.md](docs/plugins.md) and [examples/plugins](examples/plugins).
- **Exports.** PNG, JPG, PDF and CSV.

**Roadmap:** the desktop app with local files, then a web version of the same app, then real-time collaboration.

## Download

Get the latest build from [Releases](https://github.com/Cloudy-Studio-Apps/cloudy-canvas/releases/latest):

| Platform             | File                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| Windows 10/11        | `Cloudy Canvas_<version>_x64-setup.exe`                                    |
| Linux (most distros) | `Cloudy Canvas_<version>_amd64.AppImage` (make it executable, then run it) |

Windows SmartScreen may warn about an unknown publisher because the installer isn't code-signed yet. Choose **More info › Run anyway**.

## Building from source

Built with Tauri 2, React 19, TypeScript, Vite, PixiJS, Yjs, Tailwind CSS v4 and Zustand.

### Prerequisites

On every OS you need [Rust](https://rustup.rs) (stable) and Node.js 20+ with pnpm (`corepack enable`).

**Windows 11:** the [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the _Desktop development with C++_ workload, and the MSVC toolchain (`rustup default stable-msvc`). WebView2 is already installed on Windows 11.

**Arch Linux / CachyOS:**

```sh
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl \
  appmenu-gtk-module libappindicator-gtk3 librsvg xdotool
```

For other systems, see [Tauri's prerequisites](https://v2.tauri.app/start/prerequisites/).

### Development

```sh
pnpm install
pnpm tauri dev      # the desktop app
pnpm dev            # the frontend alone in a browser (native dialogs unavailable)
pnpm lint           # ESLint
pnpm typecheck      # TypeScript
pnpm format         # Prettier (format:check to verify)
```

### Release builds

| Command                   | Builds                                                 | Output                                                         |
| ------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| `pnpm release:linux`      | An AppImage                                            | `src-tauri/target/release/bundle/appimage/`                    |
| `pnpm release:arch`       | A pacman package with the desktop entry and file types | `packaging/arch/`                                              |
| `pnpm release:win`        | A Windows installer, cross-built on Linux              | `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/` |
| `pnpm release`            | The AppImage and the Windows installer                 |                                                                |
| `pnpm release:win:native` | NSIS and MSI installers, run **on Windows**            | `src-tauri/target/release/bundle/`                             |

<details>
<summary>Cross-building the Windows installer on Linux</summary>

`pnpm release:win` uses [`cargo-xwin`](https://github.com/rust-cross/cargo-xwin) and NSIS:

```sh
sudo pacman -S --needed clang lld llvm
paru -S nsis                                # from the AUR (or yay -S nsis)
rustup target add x86_64-pc-windows-msvc
cargo install --locked cargo-xwin
```

The first run downloads the Windows SDK, so it takes a while. Cross-building only makes the NSIS installer; build on Windows for an `.msi`.

</details>

### Project layout

```
src/
  app/        app shell: entry, router, providers, MCP server wiring, plugin loading
  platform/   Tauri implementations of the shared interfaces (storage, dialogs, fonts, …)
  shared/     product-agnostic code: core types and helpers, design system, app stores
  canvas/     the canvas engine every product shares (plain TypeScript, no React)
  canvas-ui/  React pieces every editor shares
  products/
    board/    the board: engine side, modules (one folder per feature) and its editor
    design/   the design: engine side, modules and its editor
  pages/      home, settings, design-system preview
src-tauri/    the Rust desktop shell
```

Every feature is a module that plugs into extension points, the same API plugins use. [`CLAUDE.md`](CLAUDE.md) documents the architecture and conventions in detail.

## Contributing

Issues and pull requests are welcome. Before opening a PR, run `pnpm lint`, `pnpm typecheck` and `pnpm format:check`, and follow the conventions in [`CLAUDE.md`](CLAUDE.md).

## License

Copyright © 2026 DarkRedgm.

Cloudy Canvas is free software, licensed under the [GNU Affero General Public License v3.0](LICENSE). You may use, study, change and share it. If you distribute a modified version, or run one as a service others use over a network, you must publish its source under the same license.

### Third-party content

- Emoji graphics: [Twemoji](https://github.com/jdecked/twemoji), © Twitter, Inc. and other contributors, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- The [Inter](https://rsms.me/inter/) typeface by Rasmus Andersson, licensed under the [SIL Open Font License 1.1](https://openfontlicense.org).
- Icons from [Lucide](https://lucide.dev) (ISC) and [Simple Icons](https://simpleicons.org) (CC0). Brand logos are trademarks of their owners.
- Other dependencies keep their own licenses, listed in `package.json` and `src-tauri/Cargo.toml`.

Figma and FigJam are trademarks of Figma, Inc. Cloudy Canvas is not affiliated with or endorsed by Figma.
