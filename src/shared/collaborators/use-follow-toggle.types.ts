export interface FollowToggle {
  /** The id of the collaborator the user follows, `null` for none. */
  following: string | null;
  /** Follows `id`, or stops following when it's the one followed. */
  toggle(id: string): void;
}
