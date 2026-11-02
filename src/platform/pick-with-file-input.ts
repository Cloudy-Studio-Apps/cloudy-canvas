import type { PickWithFileInputOptions } from "./pick-with-file-input.types";

/**
 * Asks for files with a file input; empty when cancelled. The browser build's way, and Android's:
 * the system dialogs there hand back an address without the file's name.
 */
export function pickWithFileInput({ accept, multiple }: PickWithFileInputOptions): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    if (accept) input.accept = accept;
    input.addEventListener("change", () => resolve([...(input.files ?? [])]));
    input.addEventListener("cancel", () => resolve([]));
    input.click();
  });
}
