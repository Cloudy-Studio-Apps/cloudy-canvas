import { usePluginsStore } from "@shared/stores/plugins-store";

/** Whole names that read better than their words do. */
const OVERRIDES: Record<string, [doing: string, done: string]> = {
  history_undo: ["Undoing", "Undid"],
  history_redo: ["Redoing", "Redid"],
};

/** Verbs whose -ing and past forms aren't made by the usual rules. */
const IRREGULAR: Record<string, [doing: string, done: string]> = {
  get: ["Reading", "Read"],
  set: ["Setting", "Set"],
  new: ["Creating a new", "Created a new"],
  undo: ["Undoing", "Undid"],
  redo: ["Redoing", "Redid"],
  flip: ["Flipping", "Flipped"],
  copy: ["Copying", "Copied"],
  apply: ["Applying", "Applied"],
  tidy: ["Tidying up", "Tidied up"],
  view: ["Looking at", "Looked at"],
  convert: ["Converting", "Converted"],
  list: ["Listing", "Listed"],
  find: ["Finding", "Found"],
  select: ["Selecting", "Selected"],
  split: ["Splitting", "Split"],
  put: ["Putting", "Put"],
  run: ["Running", "Ran"],
  show: ["Showing", "Showed"],
  hide: ["Hiding", "Hid"],
  stop: ["Stopping", "Stopped"],
  drop: ["Dropping", "Dropped"],
  swap: ["Swapping", "Swapped"],
  group: ["Grouping", "Grouped"],
  remove: ["Removing", "Removed"],
};

function forms(verb: string): [doing: string, done: string] {
  const irregular = IRREGULAR[verb];
  if (irregular) return irregular;
  const word = verb.charAt(0).toUpperCase() + verb.slice(1);
  if (word.endsWith("e")) return [`${word.slice(0, -1)}ing`, `${word}d`];
  return [`${word}ing`, `${word}ed`];
}

/**
 * A tool call as a sentence for people, made from the tool's name (`<prefix>_<object>_<verb>`):
 * `shapes_create` is "Creating shapes" while it runs and "Created shapes" after (with how many
 * elements it touched). A plugin's id is dropped from the front; the verb is the last word, or
 * the one before `_to_<target>`; the other words, in order, are the object.
 */
export function agentCallLabel(tool: string, state: "running" | "done", touched = 0): string {
  const index = state === "running" ? 0 : 1;
  const override = OVERRIDES[tool];
  const sentence = override ? override[index] : phrase(tool, index);
  return state === "done" && touched > 0 ? `${sentence} (${touched})` : sentence;
}

function phrase(tool: string, index: 0 | 1): string {
  let words = tool.split("_");
  const plugins = usePluginsStore.getState().installed;
  if (words.length > 1 && plugins.some(({ manifest }) => manifest.id === words[0])) {
    words = words.slice(1);
  }
  const target = words.indexOf("to", 1);
  const at = target > 0 && target < words.length - 1 ? target - 1 : words.length - 1;
  const verb = words[at] ?? tool;
  const object = words
    .filter((_, each) => each !== at)
    .join(" ")
    .replace(/\ber\b/g, "ER")
    .replace(/\bdbml\b/g, "DBML");
  return [forms(verb)[index], object].filter(Boolean).join(" ");
}
