import { useEffect } from "react";

import { tabsSupported } from "@platform";
import { fileTabs } from "./file-tabs-instance";
import { closeTab } from "./close-tab";
import { tabKeymap } from "./tab-keybindings";

/** Runs a tab command; `Home` is `null`. */
function run(command: string): void {
  const { tabs, activeId } = fileTabs.store.get();
  const order = [null, ...tabs.map((tab) => tab.id)];
  const step = (by: number) => {
    const at = order.indexOf(activeId);
    fileTabs.activate(order[(at + by + order.length) % order.length] ?? null);
  };
  if (command === "tab.next") step(1);
  else if (command === "tab.previous") step(-1);
  else if (command === "tab.close") {
    if (activeId !== null) void closeTab(activeId);
  } else if (command === "tab.reopen") fileTabs.reopenClosed();
  else {
    const target = tabs[Number(command.slice("tab.goTo".length)) - 1];
    if (target) fileTabs.activate(target.id);
  }
}

/**
 * The tab shortcuts (`tabKeymap`): next/previous (Home included, wrapping), close, reopen and go
 * to the 1st…9th file tab. Desktop only. Listens on the window in the capture phase so a focused
 * canvas or field doesn't swallow them, and stops a key only when a tab command took it.
 * Repeats are ignored for the commands that change the tabs once.
 */
export function useTabShortcuts(): void {
  useEffect(() => {
    if (!tabsSupported()) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const command = tabKeymap.commandFor(event);
      if (!command) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat && command !== "tab.next" && command !== "tab.previous") return;
      run(command);
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []);
}
