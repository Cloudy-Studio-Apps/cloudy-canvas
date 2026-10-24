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
};

function forms(verb: string): [doing: string, done: string] {
  const irregular = IRREGULAR[verb];
  if (irregular) return irregular;
  const word = verb.charAt(0).toUpperCase() + verb.slice(1);
  if (word.endsWith("e")) return [`${word.slice(0, -1)}ing`, `${word}d`];
  return [`${word}ing`, `${word}ed`];
}

/**
 * A tool call as a sentence for people, made from the tool's name: `create_shapes` is "Creating
 * shapes" while it runs and "Created shapes" after (with how many elements it touched).
 */
export function agentCallLabel(tool: string, state: "running" | "done", touched = 0): string {
  const [verb = tool, ...rest] = tool.split("_");
  const [doing, done] = forms(verb);
  const words = rest
    .join(" ")
    .replace(/\ber\b/g, "ER")
    .replace(/\bdbml\b/g, "DBML");
  const sentence = [state === "running" ? doing : done, words].filter(Boolean).join(" ");
  return state === "done" && touched > 0 ? `${sentence} (${touched})` : sentence;
}
