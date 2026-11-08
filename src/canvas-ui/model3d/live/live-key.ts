import type { CanvasEngine } from "@canvas";

const tokens = new WeakMap<CanvasEngine<object>, number>();
let next = 0;

/** Names an element of one editor, so two editors' models with the same id are never mixed up. */
export function liveKey(engine: CanvasEngine<object>, id: string): string {
  let token = tokens.get(engine);
  if (token === undefined) {
    token = ++next;
    tokens.set(engine, token);
  }
  return `${token}:${id}`;
}
