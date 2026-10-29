/** A name before and after a target converted it. */
export interface ConvertedName {
  source: string;
  converted: string;
}

/** Names that convert to the same thing (`order_items` and `order_item` → `OrderItem`). */
export interface NameCollision {
  converted: string;
  sources: string[];
}
