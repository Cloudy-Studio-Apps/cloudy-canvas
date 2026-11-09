# File tabs (desktop)

Status: design, approved for planning once reviewed. Prototype (throwaway):
`.superpowers/brainstorm/60521-1794210440/content/tabs-prototype-v2.html`.

## Why

Today the desktop app shows one file at a time: opening another file replaces the open editor
(with only a "lose unsaved changes?" toast, `app/open-requests/confirm-leave.ts`), and the
single-instance plugin sends every OS open into that one window. Working the way the app is now
meant to be used (projects, libraries next to the files that use them, a board beside a design,
agents working while the user does something else) means closing and reopening files all day.

The user's priorities, in their words: **optimization and UX** on desktop. Tabs must make the app
feel like a professional desktop tool (Figma desktop, JetBrains, VS Code) and must not make it
heavier than one window per file would.

## Goals

1. On desktop, several files open at once as **tabs in the window's title bar**, with Home as a
   fixed first tab.
2. **Only the tab on screen draws.** Background tabs cost as little as possible (see Tab
   states and memory).
3. **Agents are collaborators bound to one tab**, like a friend who joined one file through a
   live link. Several agents can work on different tabs at the same time, in the background,
   while the user works on another.
4. One **main menu** (the seal) for every tab, in the title bar.

## Non-goals

- **Android keeps one file at a time**, exactly as now: no tab bar, the board's back arrow and the
  design rail's seal menu (with "Back to home") stay where they are there. _Builder-check call:_
  one code path: Android runs the same tab model limited to one file tab (opening a file
  replaces it, as today), with no tab bar, so editors and agent binding work the same way
  everywhere.
- No tearing tabs out into separate windows, no split view of two tabs.
- The web build is not targeted by this work; nothing here should block it later (the tab model
  is plain TypeScript, the title bar is the only desktop-specific part).

## Anti-goals (a failure even if it works)

- **The view never jumps on its own.** Nothing (an agent, a finished load, an OS open… see below
  for the one exception) switches the user's active tab without the user asking.
- An agent never sees or touches a file other than the tab it's bound to.
- Background tabs never draw, and many open tabs never make the active one slower.
- No tab that can't be clicked: a loading tab is clickable and closable.
- An unsaved tab is never closed or hibernated without the user agreeing.

## The window (decided)

Title bar, left to right (prototype v2):

```
[seal ▾] [⌂ Home] [● Cortijo Hierbabuena · Posts (C)] [Sprint board ● (A)] [+] ...drag... [— ☐ ✕]
```

- **Custom title bar**: the native decorations are replaced; the tab bar is the title bar
  (draggable empty space, double-click to maximize, the window buttons drawn by the app). On
  macOS the traffic lights stay native and the seal sits after them (builder's call how:
  overlay title bar style).
- **Seal menu** at the far left: the one main menu for every tab. Its items follow the active
  tab:
  - On **Home**: New board, New design, Open file…, Theme, Settings, About.
  - On a **file**: File, Edit, (Transform for designs), View, Theme, Settings, About: the menu
    the design rail's seal shows today, **without "Back to home"** (the Home tab does that).
    The board gets the same menu, filled by its modules like the design's. **The board has no
    main menu point today** (its top bar holds back, About, save and history buttons), so this
    is in scope: a board main menu point mirroring the design's (`designEditor.mainMenu`,
    `products/design/modules/core/core.menu.ts`), its core groups (File, Edit, View, Theme,
    Settings, About), and the title bar's seal rendering whichever product's menu the active tab
    has. Buttons in the board's top bar that duplicate menu items may stay.
  - On desktop the design rail loses its seal (the rail starts with its panel tabs) and the
    board's top bar loses its ← back arrow.
- **Home tab**: icon only, always first, can't be closed or moved. Home is the existing Home
  page.
- **File tab**: product icon (board / design color), name, avatars of the collaborators and
  agents in it, and the close button. A dot replaces the close button while the file has unsaved
  changes; hovering shows the close button. Middle-click closes. Drag to reorder.
- **+** opens the new file choice (board or design), like Home's new file buttons.
- **Loading**: a tab whose file is loading shows a spinner instead of its icon, and stays
  clickable. Clicking it shows the loader **inside the editor area** under the title bar (not
  today's full-window `CanvasLoadingOverlay`); when the load finishes the editor appears in
  place.
- **Opening a file** that's already open switches to its tab instead of opening a second copy.
- **Files from the OS** (double-click, drop on the window, `cloudy-canvas://` links, a live
  session join link) open as a new tab **and become active**: that's the one case where the user
  asked for the file themselves. _(Designer's call, not discussed with the user.)_ Dropping a file onto the editor's canvas keeps today's meaning
  (import into the file), dropping it on the tab bar opens it.
- **Unsaved** means what it means today (`canvas-ui/file/README.md`): autosave is on by default
  and drafts autosave, so a tab is unsaved only when it has **changes nothing will save**
  (autosave off or failing), and while an autosave is still pending. The dot shows only then.
  Each tab tracks this itself; the single `useUnsavedChangesStore` flag goes away on desktop.
- **Closing a tab** with unsaved changes asks first (save / don't save / cancel); otherwise it
  flushes its pending autosave and closes. **Closing the window** keeps today's `CloseFileGuard`
  behavior, once for all tabs: flush every tab's pending autosave, and ask only when some tab
  has changes nothing will save. Hibernated tabs are never unsaved, so they're never loaded for
  this.
- **Shortcuts** (bound in the app's keybindings, labels through `keymap.label`, never
  hard-coded): next / previous tab, close tab, reopen the last closed tab, go to tab 1–9.
- **Restart**: the open tabs come back in their order with the same active tab, but each file
  loads only when its tab is clicked (or an agent calls on it). Tabs are remembered by file id,
  drafts included (a draft has a stable id in storage); a file that's gone by then is dropped
  from the list. _Builder-check call:_ "reopen closed tab" keeps a stack of the last 10 closed
  tabs for the running session.

## Tab states and memory (decided)

The user's priority: the best optimization possible without breaking the experience. A tab
holds two things with very different costs, and each is kept only while something needs it:

- **The document**: the Yjs doc and its undo history. Fairly cheap; all that sync, autosave and
  live sessions need.
- **The engine**: scene, drawing, images, 3D data, caches, GPU resources. The expensive part;
  needed only to show the file or for agent tools (geometry comes from the scene, root rule 12).

So a tab is in one of four states, and only the active one draws:

| State          | In memory                                        |
| -------------- | ------------------------------------------------ |
| **Hibernated** | the file id, name, type, path                    |
| **Document**   | the document and its undo history                |
| **Headless**   | + the engine and scene, **no drawing, no input** |
| **Active**     | + drawing and the user's mouse and keyboard      |

What decides a tab's state:

| Tab situation                                                   | State                     | Why                                                                                               |
| --------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| On screen                                                       | Active                    |                                                                                                   |
| Just left (a short grace, ~30 s)                                | Headless                  | quick back-and-forth switching stays instant                                                      |
| An agent bound and calling (until ~2 min since its last call)   | Headless                  | agent tools need the scene                                                                        |
| An agent bound but quiet                                        | Document                  | agents work in bursts; the engine is rebuilt on its next call (the call waits; agents don't mind) |
| A live session (hosting or joined), no agent calling            | Document, still connected | remote edits only need the document; the engine is rebuilt when the user comes back               |
| Nobody there, among the 5 most recent tabs or used < 10 min ago | Document                  | coming back keeps the undo history; the engine is rebuilt in a moment                             |
| Nobody there, older than that, saved                            | Hibernated                | reloads from the file when clicked                                                                |
| Restored at startup, never clicked                              | Hibernated                |                                                                                                   |

- **Never hibernated**: tabs with an agent bound, a live session, or unsaved changes.
  Hibernating a live tab would disconnect it: a host's guests would lose the session, and a
  guest would vanish from the others' screens and re-download the whole file each time, so a
  live tab stays connected with its document only.
- **Hibernating loses the tab's undo history** (the user accepted this; closing a file loses it
  today too). Coming back from Document or Headless keeps it.
- **Cap**: at most ~3 Headless engines at once; past that, the least recently used one drops to
  Document and rebuilds on its next need.
- Coming back to a Document tab shows the in-editor loader only if rebuilding the engine takes
  long enough to notice (builder's call on the delay before it shows).
- The numbers (30 s, 2 min, 5 tabs, 10 min, 3 engines) are tunable constants; these are the
  starting values.
- Autosave and thumbnails work on a background tab's document without drawing (a thumbnail
  needs the engine, so it's taken when the tab leaves Headless, as the editor does on close
  today).

## Agents and tabs (decided)

An agent session is a collaborator in **one** tab, the same way a live-session friend is in one
file: it never gets access to the user's whole workspace.

- **Binding**: an agent session binds to the tab that is active when it makes its first call
  that needs a file (an editing or reading tool on the file). Calls that don't need a file (the
  tab list, recent files, projects) don't bind. If Home is active then, it stays unbound and the
  call fails with "no file open: open, create or switch to a file". The binding is per MCP
  session id, so calls don't carry a tab id; the session id already identifies the agent
  (`app/mcp`, `presenceKey(context)`). Bindings live in memory only: after an app restart every
  session starts unbound and binds again by the same rule.
- **A bound tab never hibernates.** It is Headless while the agent is calling and drops to
  Document when the agent goes quiet (see Tab states and memory).
- **Stays put**: when the user switches tabs, the agent keeps working in its own tab, in the
  background. Its avatar shows on that tab's button and pulses while it edits a tab that isn't
  on screen; the user can click in to watch.
- **Moving is leave + join**: when the agent moves to another file (open, create or switch, below)
  it leaves its tab like a collaborator disconnecting (its cursor, selection and avatar disappear
  there, its workspace there ends) and joins the other one with a fresh workspace. In code it's
  re-linking the session to another tab.
- **What an agent can do** (the user's own examples):
  1. _"Let's work on a new post design for Cortijo Hierbabuena"_ → **create** a file: it opens as
     a new background tab, and the agent moves there.
  2. _"Open the Famac brand manual and let's continue"_ → **open** a file by name (recent files
     and the projects' files): an already open tab is reused, else a new background tab opens;
     the agent moves there.
  3. _"Go to the Cortijo Hierbabuena tab"_ → **switch** to an open tab by name.
- **Name matches**: open and switch take a name. When it matches more than one file or tab, the
  tool changes nothing and returns the candidates (name, type, project, path); the agent asks the
  user, as with the project match below. One exact match proceeds.
- It sees the **list of open tabs** (names, types, which one is its own, who is in each) as a
  resource or a small tool, nothing of their content.
- **None of this switches the user's view** (anti-goal 1).
- **Its tab is closed**: the agent is disconnected from that file; its next call fails with a clear
  "your tab was closed: open, create or switch to a file" error, never silently lands in another
  file.
- Today's `openBoard` / `newBoard` / `openDesign` / `newDesign` in `app/mcp/agent-host.ts`
  navigate the one window to the file; they become "open in a background tab and bind this
  session to it". `getActiveBoard`/`getActiveDesign` (`createActiveFile`, "the one open file")
  become "this session's tab".

### Where a file an agent creates is saved (decided)

- By default it's a **draft**, autosaved by the app like any new file (`saveDraft`).
- If a **project's name matches** what the user asked for, the create tool says so and the agent
  asks the user in chat ("There's a Cortijo Hierbabuena project, save it there?"). If the user
  agrees (or named the project themselves), the file is created in that project's folder and
  autosaves there from the start, the way a new file made from a project home does today
  (`?dir=&project=`, `canvas-ui/file/README.md`). The agent never picks a project on a loose match by itself.

## Live sessions

A live session stays per file: hosting a session shares that tab only; the guests' avatars show on
that tab. Joining someone's session opens it as a new active tab. In the background a live tab
keeps its document connected and drops its engine; it never hibernates.

## What exists to build on

- Routes `/board/:id`, `/design/:id` (`app/router.tsx`) mount one editor; `DesignEditor` /
  `BoardEditor` load a file and mount `useCanvasEngine`.
- One-file assumptions to replace: `useUnsavedChangesStore` (one `dirty` flag), `confirmLeave`,
  `createActiveFile` / `useAgentFile` (`canvas-ui/agent/`), `agentHostFor` (`app/mcp/`), the
  window title, `app/open-requests/` (opens replace the window today).
- Agent sessions and per-agent workspaces already exist (`app/mcp/README.md`, `withWorkspace`,
  `engine.workspace(id)`).
- Drafts exist (`Storage.saveDraft`); projects are in `shared/core/projects/`.

## Left to the builder

- How tabs map to routing (keep the router for Home/Settings/Projects and hold editors in a tab
  host, or a route per tab), as long as background tabs keep their state.
- How an editor goes between Document, Headless and Active (pausing the renderer and input, detaching the
  canvas element) and whether the engine is kept per tab or rebuilt from the document.
- The tab list resource vs. tool, and the exact MCP tool names and shapes (following
  `docs/modules.md` MCP files and the existing tool naming).
- Where the tab model lives (plain TS, so a future web build can reuse it) and where the title
  bar lives (desktop UI), within the layering rules.
- Exact tuning of the memory thresholds, and how a closed tab is remembered for "reopen closed tab".
- Settings, Projects and other non-file pages: whether they show in the Home tab or as their own
  tab; keep it simple (in the Home tab is fine).
