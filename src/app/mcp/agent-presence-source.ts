import type { ActorWorkspace } from "@canvas";
import { AGENT_SOURCE, type CollaboratorState, type McpMessageContext } from "@shared/core";
import { agentColor, agentName, identifyAgent } from "@shared/agent-server";
import { COLLABORATOR_GONE_MS } from "@shared/stores/collaborators-store";
import { notifyError } from "@shared/stores/toast-store";
import { agentCallLabel } from "./agent-call-label";
import { cursorAfter } from "./agent-cursor";
import { presenceKey } from "./agent-presence-key";
import type {
  AgentPresenceSource,
  AgentPresenceSourceOptions,
} from "./agent-presence-source.types";
import { workspaceState } from "./collaborator-state";
import type { PresenceFile } from "./presence-file.types";
import type { CallTracker } from "./track-agent-call.types";
import { trackAgentCall } from "./track-agent-call";

/**
 * Agents as collaborators (`PresenceSink`): who connected, the call each one runs, and from its
 * workspace on its tab's file its page, view, selection and a cursor on what it last touched. It
 * also notes, for the agent's next reply, the steps the user undid or redid of its work.
 */
export function createAgentPresenceSource(
  options: AgentPresenceSourceOptions,
): AgentPresenceSource {
  const { fileFor, isBound, sink, read, all, notes } = options;
  /** Agents with a call running now: their history changes are their own, not the user's. */
  const inCall = new Map<string, number>();
  const watched = new WeakSet<ActorWorkspace<object>>();
  /** The client name each session gave, so it's named the same when it joins another file. */
  const clients = new Map<string, string | null>();
  /** Calls whose file wasn't ready when they started (`prepared` attaches them). */
  const waiting = new Map<string, Set<() => void>>();

  const join = (key: string, clientName: string | null, userAgent: string | null) => {
    const others = all().filter((c) => c.id !== key);
    const { client, name } = identifyAgent(clientName, userAgent);
    sink.join({
      id: key,
      source: AGENT_SOURCE,
      kind: "agent",
      name: agentName(
        name,
        others.map((c) => c.name),
      ),
      color: agentColor(
        client,
        others.map((c) => c.color),
      ),
      avatar: { type: "agent", clientId: client.id },
      permissions: { undo: true },
    });
  };

  const ensureJoined = (context: McpMessageContext) => {
    const key = presenceKey(context);
    if (!read(key)) join(key, clients.get(key) ?? null, context.userAgent);
    return key;
  };

  /** Mirrors a workspace's page, view and selection into the agent's state as they change. */
  const watch = (key: string, file: PresenceFile, workspace: ActorWorkspace<object>) => {
    if (watched.has(workspace)) return;
    watched.add(workspace);
    workspace.onChange(() => sink.patch(key, workspaceState(file, workspace)));
    workspace.history.onChange(({ kind, label }) => {
      if (inCall.has(key) || (kind !== "undone" && kind !== "redone")) return;
      notes.record(key, kind === "undone" ? "undid" : "redid", label);
    });
  };

  const setInCall = (key: string, delta: 1 | -1) => {
    const count = (inCall.get(key) ?? 0) + delta;
    if (count > 0) inCall.set(key, count);
    else inCall.delete(key);
  };

  const setWaiting = (key: string, attach: () => void, on: boolean) => {
    const set = waiting.get(key) ?? new Set();
    if (on) set.add(attach);
    else set.delete(attach);
    if (set.size > 0) waiting.set(key, set);
    else waiting.delete(key);
  };

  const leave = (id: string) => {
    fileFor(id)?.engine.dropWorkspace(id);
    sink.leave(id);
  };

  return {
    connected: (session, client, context) => {
      const key = presenceKey({ ...context, session });
      clients.set(key, client?.name ?? null);
      join(key, client?.name ?? null, context.userAgent);
    },
    // Messages before a session (`initialize` itself) are left to `connected`.
    seen: (context) => {
      if (context.session) sink.patch(ensureJoined(context), {}, { lastSeen: Date.now() });
    },
    toolCall(tool, args, context) {
      const key = ensureJoined(context);
      const startedAt = Date.now();
      const running = (read(key)?.running ?? 0) + 1;
      sink.patch(
        key,
        { activity: { label: agentCallLabel(tool, "running"), status: "running", startedAt } },
        { running, lastSeen: startedAt },
      );
      let file: PresenceFile | null = null;
      let workspace: ActorWorkspace<object> | undefined;
      let tracker: CallTracker | undefined;
      /** Watches the call in the agent's workspace, once its file is there. */
      const attach = () => {
        if (workspace) return;
        file = fileFor(key);
        workspace = file?.engine.workspace(key);
        if (!file || !workspace) return;
        setWaiting(key, attach, false);
        watch(key, file, workspace);
        workspace.history.setNextLabel(agentCallLabel(tool, "done"));
        tracker = trackAgentCall(workspace, args);
      };
      attach();
      if (!workspace) setWaiting(key, attach, true);
      setInCall(key, 1);

      return ({ ok, error }) => {
        setWaiting(key, attach, false);
        setInCall(key, -1);
        // Moving to another tab left the old file (`leave`): it joins again.
        ensureJoined(context);
        const call = tracker?.finish();
        const label = agentCallLabel(tool, "done", call?.changed.length ?? 0);
        const state: Partial<CollaboratorState> = {
          activity: {
            label,
            status: ok ? "done" : "error",
            startedAt,
            ...(error ? { error } : {}),
          },
        };
        const now = fileFor(key);
        const current = now?.engine.findWorkspace(key);
        if (!isBound(key)) {
          // A call that needed no file binds nothing and leaves nothing behind.
          if (file && workspace) file.engine.dropWorkspace(key);
        } else if (now && current) {
          if (current === workspace) {
            if (call && call.changed.length > 0) current.select(call.changed);
            if (call?.bounds) current.followEdit(call.bounds);
          } else watch(key, now, current);
          Object.assign(state, workspaceState(now, current), {
            cursor: cursorAfter(
              current === workspace ? (call?.bounds ?? null) : null,
              read(key)?.state,
              now.id,
              current,
            ),
          });
        }
        sink.patch(key, state, {
          running: Math.max(0, (read(key)?.running ?? 1) - 1),
          lastSeen: Date.now(),
        });
        if (!ok) {
          const name = read(key)?.name ?? "An agent";
          notifyError(`${name}: ${agentCallLabel(tool, "running").toLowerCase()} failed`, error);
        }
      };
    },
    prepared(key) {
      for (const attach of [...(waiting.get(key) ?? [])]) attach();
    },
    leave,
    prune(now) {
      for (const c of all()) {
        if (
          c.source === AGENT_SOURCE &&
          c.running === 0 &&
          now - c.lastSeen >= COLLABORATOR_GONE_MS
        )
          leave(c.id);
      }
    },
  };
}
