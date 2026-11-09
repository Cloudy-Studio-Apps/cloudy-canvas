# Title bar

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

- **`TitleBar`** (`title-bar.tsx`) is the desktop window's top bar (`AppFrame` renders it only where
  `tabsSupported()`; Android has none), and the native decorations are off (`windowChrome`). Left
  to right: the seal menu, the Home tab, the file tabs, `+`, empty space that drags the window
  (`data-tauri-drag-region`; double-click maximizes) and the window controls. Where the system
  draws the controls (`windowChrome.drawsControls` false: macOS) it leaves room on the left for
  the native traffic lights instead. The active tab has a 2px `bg-primary` top line.
- **`SealMenu`** (`seal-menu.tsx`) is the seal trigger and the one main menu for every tab. On
  Home (`HomeMenu`): New board, New design, Open file… (`useOpenFile` from `@pages/home`), Theme,
  Settings, About. On a file tab (`FileTabMenu`): the menu its editor registered
  (`tabMenus.get(activeId)`, read as the menu opens, rendered with `canvas-ui`'s
  `MainMenuSectionsView`: File, Edit, View, Settings, About from the product's `mainMenu` point),
  then Theme (`ThemeSubmenu`). There is no "Back to home" item: the Home tab does that.
- **`HomeTabButton`**: icon only, first, never closed or moved; `fileTabs.activate(null)`.
- **`TabButton`**: the product's icon (a spinner while `load.status === "loading"`), the name with
  an ellipsis, `TabAvatars`, and a dot while `unsaved` that the close button replaces on hover or
  focus. A click activates it (the route follows, see [app/tabs](../tabs/README.md)), a
  middle-click or the close button calls `closeTab`, never `fileTabs.close` directly.
- **`TabAvatars`**: the collaborators whose state's `fileId` is the tab's (`CollaboratorAvatar`).
  They pulse while an agent called the tab within the last 2 minutes and it isn't the active one.
- **`useTabReorder`**: dragging a tab with the pointer-based `useRowDrag` (never HTML5
  `draggable`); the drop side comes from the pointer's x, and `fileTabs.move` reorders.
- **`NewTabButton`**: a menu with New board and New design, which navigate to `/<type>/<createId()>`
  (the route sync opens the tab).
- **`useWindowTitle`**: "<active tab name> — Cloudy Canvas", or "Cloudy Canvas" on Home.
- Loaders show inside the editor area under the bar (`absolute inset-0`), never over the whole
  window.
