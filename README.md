# Cloudy Canvas

A desktop-first canvas app by **DarkRedgm** — think Figma and FigJam in one program. It works with two file types:

- **Board** (`.cboard`): a FigJam-style whiteboard with sticky notes, shapes, connectors and text.
- **Design** (`.cdesign`): a Figma-style design file with frames, shapes, text and images (auto-layout and components later).

Cloudy Canvas is part of the **Cloudy** family of separate apps (Cloudy Paper, Cloudy Sync, …) living in `CloudyStudio/`.

**Roadmap:** desktop app with local files only, then a web version of the same frontend, then real-time collaboration (Yjs + Hocuspocus, Laravel backend).

Built with Tauri 2, React 19, TypeScript (strict), Vite, Tailwind CSS v4, shadcn/ui (Radix), Zustand and React Router.

## Folder structure

```
src/
├── app/        # React shell: main.tsx, App.tsx, router, providers, global styles
├── pages/
│   ├── home/   # Home page and its components
│   └── editor/ # Editor pages (placeholder for now)
├── engine/     # Framework-agnostic canvas engine (plain TS, no React)
├── core/       # Shared types/utils: Storage interface, file types, ids (plain TS, no React)
├── ui/         # Design system: theme tokens (CSS variables), shared + shadcn components
├── platform/   # Tauri-specific implementations (storage, file dialog)
└── stores/     # Zustand stores (UI state only)
src-tauri/      # Rust shell: window config, plugins, capabilities
```

Path aliases: `@app`, `@pages`, `@engine`, `@core`, `@ui`, `@platform`, `@stores` (defined in both `tsconfig.json` and `vite.config.ts`).

## Architecture rules

- **`engine/` and `core/` stay framework- and platform-agnostic.** ESLint blocks imports of `react`, `@ui`, `@pages`, `@app`, `@stores`, `@platform` and `@tauri-apps/*` there.
- **Canvas content never goes in React state.** The engine will render to a `<canvas>` with PixiJS and read/write a Yjs doc; React only hosts it and draws the UI around it.
- **Business logic lives in TypeScript**, not in Rust commands, so the web version can reuse it. Rust handles desktop-only concerns.
- **Platform access goes through interfaces in `core/`** (for example `Storage`), implemented in `platform/`.
- **Ids come from `crypto.randomUUID()`**, never auto-increment.
- **Colors are theme tokens** (CSS variables in `src/ui/styles/tokens.css`) and are never hard-coded in components.

## Design system

The mascot is a **foca watona** (a chubby spotted seal). The logo shows it peeking over a canvas (`src/ui/brand/`), and the palette comes from it.

- **Tokens** live in `src/ui/styles/tokens.css` and are mapped to Tailwind in `src/app/styles.css`. Tailwind's default colors and radii are reset, so only design-system values exist.
- **Two layers:** palette scales (`ice`, `seal`, `blush`, `sand`, `lilac`, 50–950) and semantic tokens (`background`, `surface`, `foreground`, `muted-foreground`, `border`, `primary`, `secondary`, `accent`, `board`, `design`, `destructive`, …). Components use **semantic tokens only**; scales are for brand art and the preview page.
- **Roles:** primary = ice blue, secondary = seal gray, accent = blush peach (use sparingly).
- **Sharp shapes:** 4px for controls (`rounded-md`), 6px for cards and menus (`rounded-card`), 8px maximum. No pills.
- **Light only for now:** dark mode is switched off with `FORCE_LIGHT_THEME` in `src/stores/theme-store.ts` (the code is kept for later).
- **Preview:** in dev builds, open `/design-system` (there's a link in the Home top bar) to see the logo, scales, tokens, type, radii, shadows and components.

## Prerequisites

You need the following on every OS:

- [Rust](https://rustup.rs) (stable, via `rustup`)
- Node.js 20+ and pnpm (`corepack enable`, or install pnpm separately)

### Windows 11

- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** workload
- WebView2 (comes preinstalled on Windows 11)
- Rust MSVC toolchain: `rustup default stable-msvc`

### Arch Linux / CachyOS

```sh
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl \
  appmenu-gtk-module libappindicator-gtk3 librsvg xdotool
```

## Development

```sh
pnpm install
pnpm tauri dev      # run the desktop app
pnpm dev            # frontend only, in the browser (native dialogs are unavailable)
pnpm lint           # ESLint
pnpm typecheck      # TypeScript (app + vite config)
pnpm format         # Prettier (format:check to verify)
pnpm tauri build    # production bundle
```

### Preview Recent files with mock data

```sh
cp .env.example .env.local   # sets VITE_MOCK_RECENTS=true (dev builds only)
pnpm tauri dev
```
