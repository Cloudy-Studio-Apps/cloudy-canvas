/** Changes are autosaved once neither the document nor the user's input changed for this long… */
export const AUTOSAVE_DELAY_MS = 1500;
/** …or, after this long of continuous editing, at the next short pause (`OVERDUE_PAUSE_MS`). */
export const AUTOSAVE_MAX_WAIT_MS = 10_000;
/** The pause an overdue autosave still waits for, so it never lands mid-gesture. */
export const OVERDUE_PAUSE_MS = 500;
/**
 * A file whose save takes long (a large one: encoding it stops the UI) waits for a quiet this
 * many times what its last save took, and at most this many times that before it's overdue.
 */
export const QUIET_PER_SAVE_COST = 3;
export const MAX_WAIT_PER_SAVE_COST = 30;
