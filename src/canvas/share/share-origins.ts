/** Transaction origin of the changes a guest receives from the host. */
export const HOST_ORIGIN = Symbol("share-host");

/** How long a peer gets to send its hello before it's dropped. */
export const HELLO_TIMEOUT_MS = 15_000;

/**
 * How long a peer that was told to go (denied, removed, session ended) gets to close its end
 * before this side closes it (closing at once could drop the message).
 */
export const GOODBYE_MS = 3_000;

/** At most this many guests, admitted or waiting: each initial sync is sent from the host. */
export const MAX_GUESTS = 10;
