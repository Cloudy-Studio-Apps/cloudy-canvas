import { agentConfigFiles } from "@platform";
import type { AgentConfigFile, AgentConfigState } from "./agent-config.types";
import { SERVER_NAME } from "./server-name";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The file's settings; throws when it isn't a JSON object, so a broken file is never overwritten. */
async function readConfig(path: string): Promise<Record<string, unknown>> {
  const text = await agentConfigFiles.read(path);
  if (text === null || text.trim() === "") return {};
  const config: unknown = JSON.parse(text);
  if (!isRecord(config)) throw new Error(`${path} isn't a JSON object.`);
  return config;
}

/** Whether the app is installed and already has the server at `url`. */
export async function agentConfigState(
  file: AgentConfigFile,
  url: string | null,
): Promise<AgentConfigState> {
  const path = await agentConfigFiles.find(file.base, file.path);
  if (!path) return "absent";
  if (!url) return "ready";
  const servers = await readConfig(path).then(
    (config) => config.mcpServers,
    () => undefined,
  );
  const current = isRecord(servers) ? servers[SERVER_NAME] : undefined;
  return JSON.stringify(current) === JSON.stringify(file.entry(url)) ? "installed" : "ready";
}

/** Adds (or updates) the server at `url` in the app's config file, keeping everything else. */
export async function installAgentConfig(file: AgentConfigFile, url: string): Promise<void> {
  const path = await agentConfigFiles.find(file.base, file.path);
  if (!path) throw new Error("The agent app isn't installed.");
  const config = await readConfig(path);
  const servers = config.mcpServers ?? {};
  if (!isRecord(servers)) throw new Error(`mcpServers in ${path} isn't a JSON object.`);
  config.mcpServers = { ...servers, [SERVER_NAME]: file.entry(url) };
  await agentConfigFiles.write(path, `${JSON.stringify(config, null, 2)}\n`);
}
