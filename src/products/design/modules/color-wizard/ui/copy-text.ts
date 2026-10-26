import { clipboard } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";

/** Copies text and says so (or why it couldn't). */
export function copyText(text: string, what: string): void {
  clipboard.writeText(text).then(
    () => toast({ title: `${what} copied` }),
    (error: unknown) => notifyError(`Couldn't copy ${what.toLowerCase()}`, error),
  );
}
