/** What hosts show about an element type (tooltips, menus, listings). */
export interface ElementInfo {
  type: string;
  label: string;
  description: string;
  /** Shortcut of the tool that creates it, e.g. "S". */
  shortcut?: string;
}
