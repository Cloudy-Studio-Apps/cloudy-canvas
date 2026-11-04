/**
 * The most copies an iterator makes in the document while its `designLimit` is unset, so a long
 * list (or one that grows on Update) never floods the file; an export still makes every row.
 */
export const DEFAULT_DESIGN_LIMIT = 24;
