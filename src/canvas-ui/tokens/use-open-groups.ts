import { useCallback, useState } from "react";

/** Reads the open groups remembered for `key` (empty when storage isn't there). */
function load(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(`token-groups:${key}`);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((v) => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

/** Which groups of an accordion are open, remembered per `key` on this computer. */
export function useOpenGroups(key: string): [Set<string>, (path: string) => void] {
  const [open, setOpen] = useState(() => load(key));
  const toggle = useCallback(
    (path: string) =>
      setOpen((current) => {
        const next = new Set(current);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        try {
          localStorage.setItem(`token-groups:${key}`, JSON.stringify([...next]));
        } catch {
          // Not remembered: fine.
        }
        return next;
      }),
    [key],
  );
  return [open, toggle];
}
