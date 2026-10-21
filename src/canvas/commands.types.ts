/** Runs a command. Returns `false` when there was nothing to do, so the key event isn't consumed. */
export type CommandHandler = () => boolean | void;

/** Command id → handler. Built-in ids are in `createCommands`; each tool adds `tool.<id>`. */
export type Commands = Readonly<Record<string, CommandHandler>>;
