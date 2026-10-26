# Frame (Design module)

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Elements

- **Elements:** `frame/` (`FrameKind`: a container with `cornerRadius` and `clipsContent` ("Clip content" in the frame section, on for new frames: `contentClip(el)` is its area, and the core's `treeClips` clips its descendants to where all their clipping frames overlap); at the top of the page it shows its name above it and is hit by it too; its tool, F/A, places the `framePreset` size on click; while it's on, the properties panel shows `FramePresetsSidebar`: `FRAME_PRESET_GROUPS` (Phone, Tablet, Desktop, Presentation, Watch, Paper, Social media), and a preset adds a frame named after it right of the top-level content (`presetFrameRect`, `useAddPresetFrame`), zooms to it and becomes the click size) and `rectangle/` (`RectangleKind`, R).
