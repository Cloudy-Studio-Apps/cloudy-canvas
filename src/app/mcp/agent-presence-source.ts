import type { ActorWorkspace } from "@canvas";
import {
  AGENT_SOURCE,
  type CollaboratorState,
  type McpMessageContext,
  type PresencePoint,
  type PresenceRect,
} from "@shared/core";
import { agentColor, agentName, identifyAgent } from "@shared/agent-server";
import { COLLABORATOR_GONE_MS } from "@shared/stores/collaborators-store";
import { notifyError } from "@shared/stores/toast-store";
import { agentCallLabel } from "./agent-call-label";
import { presenceKey } from "./agent-presence-key";
import type {
  AgentPresenceSource,
  AgentPresenceSourceOptions,
} from "./agent-presence-source.types";
import { workspaceState } from "./collaborator-state";
import type { PresenceFile } from "./presence-file.types";
import { trackAgentCall } from "./track-agent-call";

/**
 * Agents as collaborators (`PresenceSink`): who connected, the call each one runs, and from its
 * workspace on the open file its page, view, selection and a cursor on what it last touched. It
 * also notes, for the agent's next reply, the steps the user undid or redid of its work.
 */
export function createAgentPresenceSource(
  options: AgentPresenceSourceOptions,
): AgentPresenceSource {
  const { openFile, sink, read, all, notes } = options;
  /** Agents with a call running now: their history changes are their own, not the user's. */
  const inCall = new Map<string, number>();
  const watched = new WeakSet<ActorWorkspace<object>>();

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
    if (!read(key)) join(key, null, context.userAgent);
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

  const leave = (id: string) => {
    openFile()?.engine.dropWorkspace(id);
    sink.leave(id);
  };

  return {
    connected: (session, client, context) =>
      join(presenceKey({ ...context, session }), client?.name ?? null, context.userAgent),
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
      const file = openFile();
      const workspace = file?.engine.workspace(key);
      if (file && workspace) {
        watch(key, file, workspace);
        workspace.history.setNextLabel(agentCallLabel(tool, "done"));
      }
      const tracker = workspace && trackAgentCall(workspace, args);
      setInCall(key, 1);

      return ({ ok, error }) => {
        setInCall(key, -1);
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
        const now = openFile();
        if (now && workspace && now.engine.findWorkspace(key) === workspace) {
          if (call && call.changed.length > 0) workspace.select(call.changed);
          if (call?.bounds) workspace.followEdit(call.bounds);
          Object.assign(state, workspaceState(now, workspace), {
            cursor: cursorAfter(call?.bounds ?? null, read(key)?.state, now.id, workspace),
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

/**
 * Where the cursor goes after a call: the middle of what it touched; else where it was, when
 * that's on the same file and page; else the middle of the agent's view.
 */
function cursorAfter(
  touched: PresenceRect | null,
  previous: CollaboratorState | undefined,
  fileId: string,
  workspace: ActorWorkspace<object>,
): PresencePoint {
  if (touched) return centerOf(touched);
  const samePlace = previous?.fileId === fileId && previous.scope === workspace.scope;
  return samePlace && previous.cursor ? previous.cursor : centerOf(workspace.viewport);
}

/** The point at the middle of a box, or the point itself. */
function centerOf(spot: PresencePoint | PresenceRect): PresencePoint {
  return "w" in spot ? { x: spot.x + spot.w / 2, y: spot.y + spot.h / 2 } : spot;
}
