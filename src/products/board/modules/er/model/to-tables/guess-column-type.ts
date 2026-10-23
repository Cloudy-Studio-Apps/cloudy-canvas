/**
 * A column type guessed from its name (ER attributes have none): ids and counts are integers,
 * dates dates, money decimals, the rest text. The user corrects them in the database panel.
 */
export function guessColumnType(name: string): string {
  const n = name.toLowerCase();
  if (/(^|_)id$|^id_|^(num|n|nro|numero|número|cantidad|count|edad|age|qty)(_|$)/.test(n)) {
    return "integer";
  }
  if (/fecha|date|_at$|^dia$|day/.test(n)) return "date";
  if (/precio|price|importe|amount|total|salario|salary|sueldo|cuota|coste|cost/.test(n))
    return "decimal";
  return "varchar";
}
