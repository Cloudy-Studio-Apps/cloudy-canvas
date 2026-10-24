export type RelayTestState =
  | { status: "idle" }
  | { status: "testing" }
  | { status: "ok"; millis: number }
  | { status: "failed"; message: string };
