import type { BoardStarter } from "../../../core/ui";
import { DB_SCHEMA } from "../../schema";
import { t } from "../../db.i18n";
import preview from "./database-schema.svg";

/** A shop's tables, small enough to read at a glance. Names stay English: they're code. */
const SAMPLE_DBML = `Table users {
  id int [pk]
  name varchar
  email varchar [unique]
}

Table products {
  id int [pk]
  name varchar
  price decimal
}

Table orders {
  id int [pk]
  user_id int [ref: > users.id]
  created_at timestamp
}

Table order_items {
  order_id int [ref: > orders.id]
  product_id int [ref: > products.id]
  quantity int
}`;

/** Home's "Database schema": a few related tables to edit as DBML or on the board. */
export const databaseSchemaStarter: BoardStarter = {
  id: "database-schema",
  label: t("starters.databaseSchema.label"),
  description: t("starters.databaseSchema.description"),
  preview,
  order: 20,
  start: (engine) => {
    engine.service(DB_SCHEMA).importSchemaDbml(SAMPLE_DBML);
    engine.zoomToFit();
  },
};
