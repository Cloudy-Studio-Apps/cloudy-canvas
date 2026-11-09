# Agent (MCP) server

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

Agents (Claude Code, Cursor, …) connect to the running app at `http://127.0.0.1:47821/mcp`. If that port is taken the server tries the next nine, and the URL is written to `mcp.json` in the app data folder. Access is on by default, with no auth: only loopback, with Host and Origin checked against DNS rebinding.

Android has no agents: `agentChannel` is `null` there, nothing listens, the tools aren't preloaded and the agents menu and settings page don't show.

## Agents are collaborators

- **Agents are collaborators** (see Collaborators and workspaces): sessions only tell agents apart. `handleMcpMessage(body, server, context, observer)` gives a session on `initialize` (unknown ids are kept, never refused), passes the `McpMessageContext` to `McpServerTool.run(args, context)`, appends `server.notesFor(context)` after a result, and reports to a `McpObserver` (`connected` with `clientInfo`, `seen`, `toolCall` → its outcome). `createAgentServerDefinition({ hostFor, prepare, notesFor })` runs each call, after `prepare` readied the agent's tab (see Agents and tabs), with `agentHostFor(presenceKey(context), agentTabs)` (`app/mcp/agent-host.ts`): its tab's file comes with that agent's own workspace (`withWorkspace`, `engine.workspace(id)`), so `AgentBoard`/`AgentDesign` are `AgentFile<BoardWorkspace | DesignWorkspace>` while the editors register `OpenBoard`/`OpenDesign` (the user's engine). `app/mcp/agent-presence-source.ts` is the agent presence source (on the file of the agent's tab, `presenceFileFor`; a call that started before that tab's editor was mounted is watched once `prepare` is done, `presence.prepared`): identification (`identifyAgent`, `AgentClient.match` against the client's name or User-Agent; `agentName` numbers a second one, `agentColor` its brand colour or a free one), activity (`agentCallLabel`, a sentence from the tool's name, also stamped on the agent's undo steps with `history.setNextLabel`), and after each call (`trackAgentCall`: what changed in the workspace, else the ids the arguments name) the agent's selection becomes what it changed, its view follows (`followEdit`) and its cursor goes to the middle; failed calls toast. Steps the user undoes or redoes outside the agent's calls are noted (`createUndoNotes`) and sent with its next reply.

## Agents and tabs

Each agent session works in **one** file tab, like a collaborator who joined one file; the user's
view never moves for it.

- **Binding** (`agentTabs`, `createAgentTabs` in `agent-tab-binding.ts`, made in `agent-runtime.ts`):
  session id (`presenceKey`) → tab id, in memory only (after a restart every session binds again),
  mirrored on the tab with `fileTabs.bindAgent`/`unbindAgent` so the memory policy never hibernates
  it. An unbound session binds on its first call that needs a file (`host.board()`/`host.design()`)
  to the active tab, when that has an editor; on Home it stays unbound and the tool answers that no
  file is open. Calls that need no file (recent files) don't bind; opening or creating one binds there.
- **Before every call** (`prepareAgentCall`, `agent-tab-files.ts`, the server definition's
  `prepare`, which ends the call once its `run` settles): a bound session's call is begun on its
  tab (`fileTabs.beginAgentCall`, before anything is checked), so the policy raises a `document` or
  `hibernated` tab to `headless` (loading it) and, until `endAgentCall`, takes nothing away: not
  past `maxHeadless` (the cap waits for the call to end), not by a leave already in progress. Then
  it waits for the tab's editor (`waitForTabEditor`: the tab `headless` or `active` and its file
  in `boardFiles`/`designFiles`; 15 s, then `The board "Sprint board" couldn't be opened.`). A tab
  whose file failed to load fails the call at once with the load's message and unbinds the
  session, so it can open another file. An unbound session waits for the active tab's editor while
  it loads, so its first file call binds there instead of finding no file; `prepare` doesn't know
  which tool runs, so that wait also holds its calls that need no file (`list_tabs`, recent files,
  projects) until the active tab's editor is there (at most 15 s), which is accepted: it only
  happens for an unbound session while the tab on screen is loading. A headless editor is
  suspended (no drawing, no input), but its scene follows the document and `engine.workspace(id)`
  works, so tools run there as on screen.
- **The host** (`agentHostFor`): `board()`/`design()` are the bound tab's file in the agent's
  workspace (`null` for the other product); `openBoard(id)`/`openDesign(id)` open the file in a
  **background** tab (`fileTabs.open(…, { activate: false })`, an already open tab is reused),
  `newBoard()`/`newDesign()` a new file (a fresh `createId()`, which the loader creates), then bind
  the session there and wait for its editor. They never change the active tab.
- **Tab and file tools**: `list_tabs` (name, type, `mine`, the agents in it; never binds, no content) and `switch_tab(name)` are `tabsTools` (`canvas/mcp/tabs.mcp.ts`, served beside the products' tools), on `TabsAgentHost` (`app/mcp/tabs/tabs-host.ts`); switching is a rebind to the open tab (`bindAgentToTab`, leave + join). `open_board`/`open_design` take `id` or `name`: the name is case-insensitive, whole, without the extension, and looks in the recent files and in the user's projects' files (`tabs/agent-file-lookup.ts`, walking folders with `projectFs.scan`). One match opens it (a project file never opened is registered first); several change nothing and return `{ candidates: [{ name, type, project, path }] }`; none throws naming what was searched. `new_board`/`new_design` take an optional `name` and `project`: with `project` a project's id the file is created in its folder (`params: { dir, project }`, like a new file from the project's home), `"none"` or no matching project makes a draft, and a `name` matching a project's name (every word of one among the words of the other, case-insensitive; `projectNameMatches`) creates nothing and returns `{ matchingProjects: [{ id, name }] }` for the agent to ask the user (`tabs/agent-new-file.ts`). A new file's `name` becomes its document's title (`doc.setMeta`), so the tab and the draft are named after it. Tab names are the button's name, else the document's title, else the product's untitled name (`tabs/tab-display-name.ts`), so every listed name works with `switch_tab`; `collaborators` lists the people and agents in the tab's file (the title bar's avatar rule, `live:` prefix tolerated) and bound agents not seen yet as "An agent". Project file lists are scanned level by level in parallel (hidden folders and `node_modules` skipped) and kept 10 s. Opening tools answer with the tab's name and that the agent now works there.
- **Moving is leave + join**: binding to another tab first leaves the file the session was in
  (`presence.leave`: its workspace there is dropped and its presence goes; it joins again, with the
  same client name, when the call ends), so it starts with a fresh workspace in the new file. An
  unbound session's calls are watched on the active tab's file; one that bound nothing drops the
  workspace it made there.
- **Its tab closed**: the binding stays, pointing at a tab that's gone, so the session's next file
  call throws `Your tab was closed: open, create or switch to a file.` and unbinds it; the call
  after binds again by the rule above. A session that ends (`ended`, `use-agent-server.ts`) leaves
  and is unbound. An agent quiet long enough to be pruned (`presence.prune`) leaves its file but
  keeps its binding, on purpose: unbinding would let its next call bind silently to whatever tab is
  on screen. Its tab therefore stays at least `document` (never hibernated) until the app restarts.

## The app wires it up

- **The app wires it up** in `app/mcp/` (`useAgentServer`, mounted by `<AgentServer />` in the providers, which imports what needs the products from `agent-runtime.ts` when they load or a request arrives, see [Startup](../README.md#startup)): one server with the board's and the design's tools (one set of names, so neither shadows the other) and both products' instructions; `agentHost` implements `AgentHost` and `DesignAgentHost`. Each mounted board and design registers itself for agents under its tab with `useAgentBoard` (`products/board/ui/agent/`, `boardFiles`) and `useAgentDesign` (`products/design/ui/agent/`, `designFiles`), both `useAgentFile` on a `createAgentFiles` registry ([canvas-ui/agent/](../../canvas-ui/agent/README.md)); `getActiveBoard()`/`getActiveDesign()` are the active tab's. The on/off setting is `shared/stores/agent-server-store.ts`, and `shared/agent-server/` is the menu in the top bars and the Settings panel (switch, URL, "Connect an agent…"), which open `ConnectAgentDialog` (`connect-agent-dialog/`): a grid of agent apps with their logos (`brand-icons.ts`, copied from Simple Icons, Lucide where there's none), "Other AI tools", one app's setup (snippet, where it goes, "Add to …") and "Install manually" (the default settings: URL, transport, the generic JSON). The apps are data, `AGENT_CLIENTS` (`agent-clients.ts`: Claude Code, Codex, Cursor, VS Code, Antigravity, Gemini CLI, Claude Desktop through `mcp-remote`, Windsurf, and under `more` Zed and opencode; `GENERIC_AGENT_CLIENT` is the manual JSON); Cursor and VS Code have a one-click `installLink`, whose `cursor://`/`vscode:` schemes are allowed in the capabilities.
