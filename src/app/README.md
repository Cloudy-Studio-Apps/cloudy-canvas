# App shell

_How it works. The rules are in the root [CLAUDE.md](../../CLAUDE.md)._

## Browser behavior

A release shouldn't act like a browser page. `installBrowserGuard()` (`platform/browser-guard.ts`, called in `main.tsx`) turns off the webview's own right-click menu everywhere but text fields, and on Windows the keys WebView2 acts on by itself (`isBrowserReservedKey`: F5, Ctrl+R, Ctrl+P, Ctrl+F, …), which would reload the app and lose work. Dev builds keep both. `contextmenu` is handled in the bubble phase, because Radix skips its own handler on an event that's already prevented; `keydown` in the capture phase, and listeners that skip prevented events still take these keys, since some are app shortcuts too (Ctrl+G).

## Android

- **Files live in the app.** A picked file is only an address that stops working, so the app keeps its own (`platform/app-library.ts`, `<appData>/files/`). Saving asks nothing (`saveCanvasFileDialog` returns a free path there), opening copies the file in, with a file input because that's what gives its real name (`importPickedFile`, `pickWithFileInput`; a Figma file goes in the cache for its import), and Save as hands out a copy through the system's dialog (`exportFile`). `TauriStorage` keeps the index whole, as it's the only way to the files, and removing a file from it deletes it, so Home says Delete and asks first (`confirmDelete`). A file's other way out is Home's Save a copy.
- **Going to the background** runs `appLifecycle.onBackground` tasks (autosave, the preview picture), since Android may close the app without warning. They aren't quit tasks: those end live sessions, and the app usually comes back.
- **The back button** (`back-button/`): closes what's open on top, else goes to Home, else leaves the app (`leave_app`).
- **Signing:** release builds read their key from `src-tauri/gen/android/keystore.properties` (gitignored; copy `keystore.properties.example` next to it: `storeFile`, `storePassword`, `keyAlias`, `keyPassword`), set in `app/build.gradle.kts`; without it they come out unsigned. The keystore itself lives outside the repo, and losing it means no more updates to installed apps.
- **Crash symbols:** `pnpm release:play` builds the Rust libraries unstripped (`CARGO_PROFILE_RELEASE_STRIP=false`, overriding `strip = true` in `Cargo.toml`) and the release build type sets `debugSymbolLevel = "SYMBOL_TABLE"`, so the `.aab` carries the native symbols Play uses to name functions in crash and ANR reports. Gradle still strips the libraries it installs.
- **Not there yet:** opening files from other apps. A file manager rarely sends a `.cboard` with the type the manifest's intent filters ask for.

## Window

The router's root element is `AppFrame` (`tabs/`): the Home area (Home, Settings, Projects, Join
through `<Outlet />`) with the open file tabs' editors over it. File routes (`/board/:id`,
`/design/:id`) open their tab through the route sync, and the active tab's route stays in the
address. See [tabs/](tabs/README.md).

## Startup

The first load holds Home and the app's shell, never a product or the canvas engine, so the window shows something fast. Anything in Home's static imports that reaches `@board`, `@design`, `@canvas` or `@canvas-ui` (a type import doesn't) brings them all back into the first load: a value Home needs from a product moves to `shared/` instead.

1. `index.html` shows the splash (see `shared/ui`), which needs none of the app's code.
2. `main.tsx` runs `loadPlugins()`. The products only load this early when a plugin is enabled and trusted (`plugins/activate-plugin.ts`), because the plugin API holds both and their modules must register before the products compose.
3. React renders, replacing the splash. Every route sits under `AppFrame` (see Window below); every route but Home is a `lazyPage` (`lazy-page.tsx`, built on `lazyComponent`, which the tabs' editors use too): opening one loads it, with the loading screen until it's there.
4. `preloadProducts()` (`preload-products.ts`) loads the board, the design and, where agents can connect, `mcp/agent-runtime.ts` behind the first page, with gaps so the window can answer, then sets `useProductsStore`'s `ready`: Home's starters wait for it, and from then on opening a product is instant. The agent menu's tools are empty until this finishes.

An agent's request that arrives before that loads `agent-runtime.ts` itself, so agents never depend on the preload.
