import type { ComponentType } from "react";

/** What a database panel action gets: the table the panel shows, or `null` for the schema. */
export interface DbPanelActionProps {
  tableId: string | null;
}

/** A button in the database panel's header (the db-export module's Export code). */
export interface DbPanelAction {
  id: string;
  /** Lower first. */
  order: number;
  component: ComponentType<DbPanelActionProps>;
}
