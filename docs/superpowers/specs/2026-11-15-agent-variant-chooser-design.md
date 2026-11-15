# Agent variant chooser — design

## Intent

When the user asks an agent for "two or three variants to choose from", today they read the
agent's reply, look at the canvas, then go back to the chat and type "option B". That round trip
feels wrong. Instead the agent hands the variants to the app, the app shows a chooser in the
agent's tab, and the user picks there with one click; the agent learns the pick and continues.

## Goals

- An agent tool that asks the user to choose between variants the agent already drew.
- A chooser in the agent's tab only: other tabs are untouched, and a background tab shows that it
  is waiting for a pick.
- One click to keep one variant (the others are deleted) or keep all; an optional note goes back to
  the agent with the pick ("B, but with A's header").
- The agent gets the pick in the same call when the user is quick, and is stopped (not left to
  guess) when the user is not.
- Works the same in boards and designs.

## Non-goals

- Generating variants: the agent draws them with the existing tools.
- Hidden or staged variants: they are normal elements on the page.
- A second canvas or picture previews (approach B, below).
- Merging variants in the UI ("A's header with B's colours"): that is what the note is for.
- Surviving an app restart: a pending chooser lives in memory.

## Anti-goals

- The agent keeps editing as if the user had chosen. This is the failure that matters most: the
  wait times out and the agent continues on a guess. The design blocks it in the app, not only in
  the reply text.
- The user's view moving on its own. The view only moves when the user presses the chooser's
  buttons.
- An agent stuck forever: closing the chooser, closing the tab or ending the session always ends
  the choice.

## Constraints

- **Timeouts.** The app's own transport answers each MCP call within 30 s
  (`REPLY_TIMEOUT`, `src-tauri/src/mcp/routes.rs`). Agent apps cut tool calls at about 60 s
  (Claude Desktop, Codex default, Cursor agent mode, the MCP SDK default); Claude Code's CLI
  waits much longer but backgrounds calls after about 2 minutes. So the tool waits **25 s**, which
  every client tolerates, and never relies on a longer hold.
- Agents work in exactly one tab (`agentTabs`, `src/app/mcp/README.md`, Agents and tabs); the
  chooser belongs to that tab.
- Every tool call goes through `runAgentTool` (`src/app/mcp/agent-tool-dispatch.ts`), which is the
  one place to enforce the lock.
- Notes after a result already exist: `server.notesFor(context)` (today `undoNotes.take`) appends
  text to an agent's next reply. The late pick uses the same channel.
- Tools carry no read/write flag (`McpTool`, `src/canvas/mcp/mcp-tool.types.ts`), so the lock
  cannot let read-only tools through without adding one (see The lock).
- Project rules: module conventions, i18n (en + es), changelog entry, semantic tokens, sharp radii,
  shared kit pieces, types in `.types.ts` files, READMEs updated.

## Approaches

1. **The chooser steers the user's own canvas (chosen).** The variants already sit side by side on
   the page, so the chooser is a slim bar over the agent's tab: previous/next arrows that zoom the
   real view to each variant (`engine.zoomToElement`/`zoomToElements`), "Compare all" that fits all
   of them, "Keep this", "Keep all" and a note field. Fully live (it _is_ the canvas), nothing
   rendered twice, cheapest to build.
2. **A separate overlay with its own preview.** A dimmed modal over the tab showing pictures from
   the thumbnail renderer or a second small live canvas. Looks more like a dedicated "pick one"
   screen, but renders the content twice, and a live second canvas is real extra work. Rejected for
   cost and because it is less live than the canvas itself.

Waiting strategy, also weighed:

- **Hold the call until the user picks** (keep-alives over the event stream): only Claude Code's
  CLI would tolerate it; Desktop, Codex and Cursor cut at about 60 s. Rejected.
- **Never wait** (show the chooser, return at once, deliver the pick later): always forces the user
  back to the chat. Rejected.
- **Wait 25 s, then stop the agent and lock it (chosen, the user's idea):** a quick pick needs no
  chat at all; a slow one needs only "go on".

## Decided

### Placement

The agent draws the variants **side by side on the current page** as normal top-level elements
(frames in a design, sections or groups on a board), then calls the tool. Nothing about the
variants is special in the document.

### The tool

One tool group shared by both products (see Tool scope below), two tools, names following the tool-name rules
(`docs`: `canvas/mcp` Tool names); working names:

- `variants_choose({ ids: string[], labels?: string[], question?: string })`
  - Validates first: 2 to 6 ids, each a top-level element on the current page of the agent's tab
    file, no duplicates; `labels` (if given) the same length; no chooser already open in that tab.
    Any failure throws a message the agent can act on, and nothing opens.
  - Opens the chooser in the agent's tab and waits up to 25 s.
  - **Picked in time:** returns `{ choice: "one", kept: id, label, removed: ids, note? }` or
    `{ choice: "all", note? }`.
  - **Not picked in time:** returns `{ choice: "pending" }` with the text "The user hasn't chosen
    yet. End your turn now and wait for them; they will tell you to go on." and the lock starts.
- `variants_choice()`: returns the pick if made (`one`/`all`/`dismissed`), else `pending`. Allowed
  while locked; it is how an agent that was told "go on" reads the result explicitly.

The agent instructions (shared part) gain a short paragraph: when offering the user options to
choose between, draw them side by side and call `variants_choose`; on `pending`, end the turn.

### The lock

While a chooser opened by session S is pending past its 25 s, **every tool call from S is refused**
in `runAgentTool`, before `prepare`, with the same "end your turn" message, except
`variants_choice`. Reads are refused too: tools have no read/write flag, and a reliable "stop" is
worth more than letting reads through. (This corrects what was said in the conversation, that
reads would still work.) Other agents and the user are not locked.

The lock lifts when the choice is made, dismissed, the tab closes, or the session ends.

### The chooser bar

- Shown over the agent's tab only, docked at the bottom centre of the canvas area, in the editor
  chrome style (`canvas-ui`, kit pieces, semantic tokens, 4–6 px radii).
- Contents: the agent's name and colour and its `question` (or a default "Pick a variant"); the
  current variant's label ("B · 2 of 3"); previous / next; "Compare all"; "Keep this"; "Keep all";
  a one-line note field (`useCommitField`); a close button.
- Opening it zooms the user's view to fit all variants (this is the user's view moving on the
  agent's behalf, accepted: it happens only in the agent's tab, and only once, when the chooser
  opens). Arrows zoom to one variant each; the current variant is outlined.
- **Keep this:** removes the other variants in **one undo step in the user's history** (the user
  made the choice), then resolves the pick. **Keep all:** resolves without changes. **Close:**
  resolves as `dismissed` ("closed without choosing").
- The user may edit the canvas while the bar is open. If a variant is deleted meanwhile, it drops
  out of the bar; with one left, the bar still offers Keep this / Keep all.

### Background tabs

A tab with a pending chooser shows a badge on its tab button ("waiting for your pick") in the agent
colour. The chooser opens when the user switches to it.

### The late pick

A pick made after the timeout is stored for that session. The agent's **next call** gets it appended
as a note (`notesFor`, next to undo notes): "The user chose B (id …); the other variants were
removed. Note: …". Since every call but `variants_choice` is refused until the pick, the first call
after "go on" is either `variants_choice` or a call that now succeeds and carries the note.

### Calls settled after the builder check (designer's calls)

- **Several agents in one tab.** The chooser is per tab, the lock per session: a second agent's
  `variants_choose` in a tab with an open chooser throws "Another agent is waiting for the user's
  pick in this tab"; that agent is not locked. "Keep this" removes only the listed variant ids
  (with whatever they contain), never anything else.
- **When the lock lifts.** At the user's click (keep this, keep all, close), not when the agent
  reads the pick. The pick is a note on the agent's next call that succeeds; a call refused by the
  lock does not take the notes (the lock check runs before anything reads `notesFor`).
- **Delivered once.** A pick returned by `variants_choose` within the 25 s is marked delivered and
  is not repeated as a note. `variants_choice` keeps answering the last pick until that session's
  next `variants_choose`, so an agent whose reply got lost can still read it.
- **Pages.** The chooser is tied to the page (and file) it opened on. While the user looks at
  another page, the bar shows only the question and "Back to variants", which returns to that page;
  arrows, "Keep this" and "Keep all" act only on the variants' page. Variants the user deleted drop
  out, as above.
- **Removing variants** goes through the same path as the user's own delete (whatever the delete
  command uses, so bindings, links and children are cleaned up the same way), as one undo step.
- **Tool scope.** `variants_choose` and `variants_choice` are file tools shared by both products
  (same schema, one implementation each), not app tools: with no file they get the usual
  `NO_FILE_OPEN`. The lock check itself sits in `runAgentTool` and covers every tool.

### Lifetime

- One chooser per tab at a time.
- Tab closed: resolved as `dismissed`; the lock lifts (the session's next call hits "Your tab was
  closed" anyway).
- Session ended or pruned: the chooser closes, nothing is deleted.
- App restart: gone (memory only).

### Text

Bar strings and the badge in en + es through the owning folder's `t`; tool texts in English.
Changelog entry (New / Novedades), written for users, no internal names.

## Left to the builder

- Exact folder split: the tool group (likely `canvas/mcp/variants.mcp.ts`, wired into both
  products like the other shared tools), the pending-choice store (a small `Store` keyed by tab, mirrored on the tab like
  agent bindings so the tab button can show the badge), and the bar (`canvas-ui`, mounted by both
  editors).
- How the bar learns its tab's pending choice and how the tool's wait resolves (a promise in the
  store resolved by the bar's actions or by the 25 s timer).
- The outline on the current variant (an overlay drawn like collaborator selections, or reuse the
  agent's selection).
- Exact tool names within the naming rules, icon choices, wording of messages.
- Which READMEs change (at least `src/app/mcp/README.md`, `src/canvas/mcp/README.md`, the
  `canvas-ui` folder holding the bar, `src/canvas/tabs/README.md` for the badge).

## Changed while planning and building

- The bar sits top centre, like the follow bar: the bottom centre holds the toolbar.
- The lock covers the whole time a choice is pending, during the 25 s wait and after it (one rule).
- Pruned agents keep their chooser: the user can still pick, and the agent may come back.
- The tools are an app group served like `tabs_*` (`scope: "app"`); the host throws `NO_FILE_OPEN`
  without a file, instead of one implementation per product.
- Calls refused while an agent waits don't toast "failed": the badge and the bar already say why.
