import { isRouteErrorResponse } from "react-router";

import type { DescribedError } from "./describe-error.types";

/** Whatever a route threw, as a message and its stack frames. */
export function describeError(error: unknown): DescribedError {
  if (isRouteErrorResponse(error)) {
    return { message: `${error.status} ${error.statusText}`.trim(), frames: [] };
  }
  if (error instanceof Error) {
    return { message: error.message || error.name, frames: stackFrames(error) };
  }
  return { message: String(error), frames: [] };
}

function stackFrames(error: Error): string[] {
  const origin = window.location.origin;
  return (error.stack ?? "")
    .split("\n")
    .map((line) => line.trim().replaceAll(`${origin}/`, ""))
    .filter((line) => line && line !== `${error.name}: ${error.message}`);
}

/** Whether a frame is the app's own code rather than a dependency's. */
export function isOwnFrame(frame: string): boolean {
  return frame.includes("src/") && !frame.includes("node_modules");
}
