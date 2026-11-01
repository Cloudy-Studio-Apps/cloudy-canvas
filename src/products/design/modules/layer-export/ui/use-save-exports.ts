import { useOverwritePrompt } from "@canvas-ui";
import { exportFile, exportFiles } from "@platform";
import type { RenderedExport } from "../export-nodes.types";
import { useExportDestinationStore } from "./export-destination-store";

/**
 * Saves drawn exports: one goes through the save dialog, several into a folder or a zip called
 * `name`, as chosen (asking first, through `overwrite`, when files would be replaced).
 */
export function useSaveExports() {
  const overwrite = useOverwritePrompt();
  const destination = useExportDestinationStore((state) => state.destination);

  const save = async (files: readonly RenderedExport[], name: string): Promise<boolean> => {
    const [only] = files;
    if (files.length === 1 && only) {
      const fileName = only.path.split("/").pop() ?? only.path;
      const dot = fileName.lastIndexOf(".");
      const extension = fileName.slice(dot + 1);
      return exportFile(only.file, fileName.slice(0, dot), {
        extension,
        label: extension.toUpperCase(),
      });
    }
    const entries = await Promise.all(
      files.map(async ({ path, file }) => ({
        path,
        content: new Uint8Array(await file.arrayBuffer()),
      })),
    );
    return exportFiles(entries, name, overwrite.confirm, { as: destination });
  };

  return { save, overwrite };
}
