import { fileURLToPath } from "node:url";
import { build, type Plugin, type Rollup } from "vite";

const ID = "virtual:board-viewer-runtime";
const RESOLVED = `\0${ID}`;
const CONFIG = fileURLToPath(new URL("../../vite.viewer.config.ts", import.meta.url));

/**
 * `virtual:board-viewer-runtime`: the board's HTML viewer built into one HTML file (with
 * `vite.viewer.config.ts`), as a string the HTML export fills with a board. Built the first time
 * it's imported and kept; in dev, built again after a source file changes.
 */
export function viewerRuntime(): Plugin {
  let runtime: Promise<string> | null = null;
  return {
    name: "cloudy:viewer-runtime",
    resolveId: (id) => (id === ID ? RESOLVED : null),
    async load(id) {
      if (id !== RESOLVED) return null;
      runtime ??= buildRuntime();
      return `export default ${JSON.stringify(await runtime)};`;
    },
    configureServer(server) {
      server.watcher.on("change", (file) => {
        if (!file.includes(`${"/"}src${"/"}`)) return;
        runtime = null;
        const module = server.moduleGraph.getModuleById(RESOLVED);
        if (module) server.moduleGraph.invalidateModule(module);
      });
    },
  };
}

async function buildRuntime(): Promise<string> {
  const result = await build({ configFile: CONFIG, build: { write: false } });
  const outputs = (Array.isArray(result) ? result : [result]) as Rollup.RollupOutput[];
  for (const { output } of outputs) {
    for (const file of output) {
      if (file.type === "asset" && file.fileName.endsWith(".html")) return String(file.source);
    }
  }
  throw new Error("The viewer runtime's build made no HTML file.");
}
