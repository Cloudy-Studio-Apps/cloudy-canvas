# App shell

_How it works. The rules are in the root [CLAUDE.md](../../CLAUDE.md)._

## Browser behavior

A release shouldn't act like a browser page. `installBrowserGuard()` (`platform/browser-guard.ts`, called in `main.tsx`) turns off the webview's own right-click menu everywhere but text fields, and on Windows the keys WebView2 acts on by itself (`isBrowserReservedKey`: F5, Ctrl+R, Ctrl+P, Ctrl+F, …), which would reload the app and lose work. Dev builds keep both. `contextmenu` is handled in the bubble phase, because Radix skips its own handler on an event that's already prevented; `keydown` in the capture phase, and listeners that skip prevented events still take these keys, since some are app shortcuts too (Ctrl+G).

## Startup

The first load holds Home and the app's shell, never a product or the canvas engine, so the window shows something fast. Anything in Home's static imports that reaches `@board`, `@design`, `@canvas` or `@canvas-ui` (a type import doesn't) brings them all back into the first load: a value Home needs from a product moves to `shared/` instead.

1. `index.html` shows the splash (see `shared/ui`), which needs none of the app's code.
2. `main.tsx` runs `loadPlugins()`. The products only load this early when a plugin is enabled and trusted (`plugins/activate-plugin.ts`), because the plugin API holds both and their modules must register before the products compose.
3. React renders, replacing the splash. Every route but Home is a `lazyPage` (`lazy-page.tsx`): opening one loads it, with the loading screen until it's there.
4. `preloadProducts()` (`preload-products.ts`) loads the board, the design and `mcp/agent-runtime.ts` behind the first page, with gaps so the window can answer, then sets `useProductsStore`'s `ready`: Home's starters wait for it, and from then on opening a product is instant. The agent menu's tools are empty until this finishes.

An agent's request that arrives before that loads `agent-runtime.ts` itself, so agents never depend on the preload.
