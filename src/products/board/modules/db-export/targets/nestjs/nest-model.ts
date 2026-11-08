import { className } from "../../code";

/** A table's model class name (`order_items` → `OrderItem`). */
export const nestModel = (table: string) => className(table);
