import { tabHandles } from "@canvas-ui/tabs/tab-handles";
import { fileTabs } from "./file-tabs-instance";
import { stopDocumentAutosave } from "./hosted-tabs";

/** How long leaving waits for the editor's closing work, as quitting does, so a stuck save can't hold every later route change. */
const LEAVE_TIMEOUT_MS = 5000;

/**
 * Closes a file tab where tabs aren't supported (Android: one file at a time), as leaving its
 * editor did before tabs: the editor's closing work (the engine's last writes, the sweep, the
 * pending autosave) runs while it's still mounted and the document still there, and only then the
 * tab closes and its document goes. That wait is capped at `LEAVE_TIMEOUT_MS`, like the quit
 * tasks. Nothing is asked: Android keeps each file's own close guard, and the close-tab question
 * isn't mounted there.
 */
export async function leaveFile(id: string): Promise<void> {
  const finished = tabHandles
    .get(id)
    ?.finish()
    .catch(() => undefined);
  if (finished) await withinLeaveTimeout(finished);
  stopDocumentAutosave(id);
  fileTabs.close(id);
}

async function withinLeaveTimeout(work: Promise<void>): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, LEAVE_TIMEOUT_MS);
  });
  try {
    await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
