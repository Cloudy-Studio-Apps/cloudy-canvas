import type { ActorWorkspace } from "@canvas";

/** The open file as the agent presence source needs it: its id and the user's engine. */
export interface PresenceFile {
  id: string;
  engine: {
    workspace(id: string): ActorWorkspace<object>;
    findWorkspace(id: string): ActorWorkspace<object> | undefined;
    dropWorkspace(id: string): void;
    scopeLabel(scope: string | null): string | null;
  };
}
