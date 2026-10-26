// Prints the order each product loads its built-in modules in (`node scripts/module-order.mjs`).
// Chained hooks run in this order, so a change to `requires`/`after` that moves a module shows here.
import { loadOrder, PRODUCTS } from "./module-info.mjs";

for (const product of PRODUCTS) console.log(`${product}: ${loadOrder(product).join(", ")}`);
