/**
 * The memory policy's numbers (see the README's table); tunable, these are the starting values.
 */
export const TAB_LIMITS = {
  /** A tab just left keeps its engine this long, so quick switching back stays instant. */
  leaveGraceMs: 30_000,
  /** An agent counts as calling its tab for this long after its last call. */
  agentActiveMs: 120_000,
  /** The most recently shown tabs keep their document… */
  recentTabs: 5,
  /** …and so does any tab shown more recently than this; older ones hibernate. */
  hibernateAfterMs: 600_000,
  /** At most this many engines kept in the background. */
  maxHeadless: 3,
} as const;

/** How often the app re-applies the policy (time alone moves tabs down). */
export const TAB_POLICY_INTERVAL_MS = 10_000;
