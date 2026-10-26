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

| Platform             | File                                           | Install                                      |
| -------------------- | ---------------------------------------------- | -------------------------------------------- |
| Windows 10/11        | `Cloudy Canvas_<version>_x64-setup.exe`        | Run it                                       |
| macOS 12+            | `Cloudy Canvas_<version>_universal.dmg`        | Open it, drag the app to Applications        |
| Ubuntu / Debian      | `Cloudy Canvas_<version>_amd64.deb`            | `sudo apt install ./Cloudy*.deb`             |
| Arch Linux / CachyOS | `cloudy-canvas-<version>-1-x86_64.pkg.tar.zst` | `sudo pacman -U cloudy-canvas-*.pkg.tar.zst` |
| Linux (any distro)   | `Cloudy Canvas_<version>_amd64.AppImage`       | `chmod +x` it, then run it                   |

The Windows, macOS and AppImage versions update themselves: when a new version is out, the app offers to install it. The `.deb` and Arch packages tell you about it and open the download page. Click the logo, or open **Settings › About**, to check by hand.

Windows SmartScreen may warn about an unknown publisher because the installer isn't code-signed yet. Choose **More info › Run anyway**.

### Opening it on macOS

The macOS app runs natively on Apple Silicon and Intel Macs, but it isn't signed with an Apple Developer certificate or notarized yet, so macOS stops it the first time. After dragging it to **Applications**, either:

- run this once in **Terminal**, then open the app as usual:

  ```sh
  xattr -dr com.apple.quarantine "/Applications/Cloudy Canvas.app"
  ```

- or open the app, close the warning, then go to **System Settings › Privacy & Security**, scroll to **Security** and click **Open Anyway** next to "Cloudy Canvas" (on macOS 14 and older, right-click the app › **Open** also works).

If macOS says the app "is damaged and can't be opened", that's the same check: run the `xattr` command above. Later updates install from inside the app and don't ask again.

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

**macOS:** the Xcode Command Line Tools (`xcode-select --install`, or the full Xcode). For the universal build (`pnpm release:mac`), add both Rust targets:

```sh
rustup target add aarch64-apple-darwin x86_64-apple-darwin
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
| `pnpm release:mac`        | A universal `.app` and `.dmg`, run **on macOS**        | `src-tauri/target/universal-apple-darwin/release/bundle/`      |

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

The macOS app can't be cross-built from Linux or Windows: build it on a Mac, or let the release workflow build it on GitHub's macOS runner. It's signed ad hoc (`bundle.macOS.signingIdentity: "-"` in `tauri.conf.json`), which Apple Silicon needs to run it at all; signing with a Developer ID and notarizing would remove the first-launch warning.

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

Every feature is a module that plugs into extension points, the same API plugins use. [`CLAUDE.md`](CLAUDE.md) holds the rules, [`docs/modules.md`](docs/modules.md) the module conventions, and each folder's `README.md` how its code works.

### Publishing a release

Releases are built by GitHub Actions ([`.github/workflows/release.yml`](.github/workflows/release.yml)) when a version tag is pushed:

```sh
pnpm release:tag 0.2.0   # writes the version, commits "Release v0.2.0", tags v0.2.0 and pushes
```

The workflow builds the Windows installer, the macOS disk image, the `.deb`, the AppImage and the Arch package into a **draft** release, with the updater's signatures and `latest.json`. Review the notes and press **Publish**: installed apps then see the update.

One-time setup: create the updater's signing key with `pnpm tauri signer generate -w ~/.tauri/cloudy-canvas.key`, put the public key in `src-tauri/tauri.conf.json` (`plugins.updater.pubkey`), and add the private key and its password to the repository's Actions secrets as `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Keep a backup of the private key: without it, installed copies can't verify new updates.

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
