# Google Play listing graphics

The store listing's images. The SVGs are the sources; the PNGs are what gets uploaded.

| File                           | Play Console field                     | Spec                      |
| ------------------------------ | -------------------------------------- | ------------------------- |
| `icon-512.png`                 | App icon (Ícono de la app)             | 512×512 PNG, under 1 MB   |
| `feature-graphic-1024x500.png` | Feature graphic (Gráfico de funciones) | 1024×500 PNG, under 15 MB |

- **Icon:** the app icon's artwork (`src-tauri/icons/source/app-icon.svg`) on a full-bleed square.
  Play rounds the corners and adds the shadow itself, so it has no radius or padding. Change the
  artwork in both files.
- **Feature graphic:** the seal and the name on the brand blue. Its text is set in Noto Sans, so
  render it on a machine that has that font.

Render them again after a change (needs `rsvg-convert` and ImageMagick; Play rejects alpha):

```sh
cd packaging/play-store
rsvg-convert -w 512 -h 512 icon.svg -o icon-512.png
rsvg-convert -w 1024 -h 500 feature-graphic.svg -o feature-graphic-1024x500.png
magick icon-512.png -alpha off icon-512.png
magick feature-graphic-1024x500.png -alpha off feature-graphic-1024x500.png
```
