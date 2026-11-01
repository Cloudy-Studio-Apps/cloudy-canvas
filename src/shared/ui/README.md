# Design system

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Tokens

- **Tokens:** the palette scales, shape, elevation, motion and density defaults live in `src/shared/ui/styles/tokens.css`; the **semantic tokens come from the active theme** (see Themes). Both are mapped to Tailwind in `src/app/styles.css`. Tailwind's default colors and radii are reset, so only design-system values exist.

## Canvas colors are tokens

- Canvas colors are tokens too (`--canvas-*`).

## Code colors are tokens

- Code colors are tokens too (`--syntax-*`, read by the `CodeEditor` theme).

## Document content colors

- Document content colors (sticky/marker palettes in `products/board/palette.ts`) are data saved with the file, not theme tokens.

## Roles

- **Roles:** primary = ice blue, secondary = seal gray, accent = blush peach (use sparingly), board = sand, design = lilac. The mascot/logo is a "foca watona" (spotted seal) peeking over a canvas (`src/shared/ui/brand/`): `SealLogo`, `HoppingSeal` (waiting), `PaintingSeal`, `PattingSeal`, `CelebratingSeal` (something's done: hopping with its flippers waving and sparkles, `animate-seal-wave` and `animate-seal-sparkle`) and `AdriftSeal` (something broke: dizzy on a cracked ice floe bobbing in the water, the error page's). `SealsVideo` is the mascot's clip (`seals-hopping.mp4`, silent, about 1.4 MB, with `seals-hopping-poster.jpg`): looped while `playing`, paused where it is otherwise, only the poster with reduced motion (`usePrefersReducedMotion`, `shared/ui/hooks/`); Home's welcome and seal card and the About dialog show it. The startup splash lives in `index.html` (plain HTML and CSS, so it shows before any of the app's code loads; React replaces it on first render). It's `foca-watona-strip.webp`, 22 frames of a Tenor meme clip of the foca watona plush being squished ([source](https://tenor.com/view/colte-seal-squish-thing-hands-gif-23047502), no stated license), one under the other, written in as a data URL by `scripts/vite/inline-splash-plugin.ts` and moved by a `transform`, because a `<video>` or a requested image stayed blank in WebKitGTK while the app's code loads.
