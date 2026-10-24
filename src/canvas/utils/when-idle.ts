/**
 * Resolves when the browser is idle (after the frame being drawn and any input), or after
 * `timeout` ms at the latest; a frame later where there's no `requestIdleCallback`.
 */
export function whenIdle(timeout = 500): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === "function")
      requestIdleCallback(() => resolve(), { timeout });
    else setTimeout(resolve, 16);
  });
}
