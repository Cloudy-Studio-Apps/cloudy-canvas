# Assets

The Assets tab of the left panel: the pictures of the project libraries the file uses, and the file's own.

- **Tier:** feature
- **Requires:** image
- **Contributes:** designEditor: `leftTabs`
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `assets.module.ts` (the tab), `ui/` (its content).

## How it works

- **Sources (`use-asset-sources.ts`):** each library the file uses (`ProjectLibrariesContext`; only items whose `kind` is `any` or `design`), then "This file" (`localAssets`). A file outside a project, or while its project is loading or missing, lists only itself; the "+" menu then offers "this file" only. A library's pictures can be added to while its project is open (`editable`). The list follows the libraries (`hub.onChange`, `library.observe`) and the file's index (`doc.observeAssetIndex`).
- **The file's own pictures** are `LibraryAsset` records in the document's `"assetIndex"` map, their bytes in its `"assets"` map under the same id (`addLocalAsset`, `removeLocalAsset`, `moveAssetToLibrary`, in `canvas/libraries/local-assets.ts`). Neither is an undo step.
- **UI (`ui/`):** `AssetsTab` (search, type chips All / Images / SVG / Icons, grid or list kept in `useDesignPanelStore.assetsView`) over one `AssetSourceSection` per source (`TokenSourceHeader`), whose pictures are collapsible groups by slash path (`assetTree`, `AssetGroup`) of `AssetTile`s. A search or filter opens every group and hides empty sources.
- **Placing:** dragging a tile onto the canvas (`useAssetDrag`: pointer events, never HTML5 `draggable`; `engine.clientToWorld` turns the drop into a canvas point) or double-clicking it (the view's center) calls the image module's `placeImage` (a rectangle with an image fill, one undo step, selected). A library picture's bytes are copied into the file's assets under the library asset's id first, so the file works alone (the library mirror finds them there and skips them).
- **Adding (`AddAssetMenu`, `useUploadAssets`):** "+" uploads pictures (`pickImageFiles`) to a library of the project (choosing which; `hub.addAssetFile` skips the ones it has by hash) or to this file only (skipping the same bytes), into the group set by "New group…" (a path prefix kept for the next uploads). SVG files are `svg`, the rest `image`.
- **The file's own pictures' menu (right-click, `LocalAssetMenu`, `useLocalAssetActions`):** Rename, Move to a library the file uses (the library gets the bytes, the file's record goes; layers showing it keep the file's bytes), and Delete, which is disabled while a layer shows the picture.
