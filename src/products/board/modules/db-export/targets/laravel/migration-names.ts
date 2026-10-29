const pad = (n: number) => String(n).padStart(2, "0");

/** Laravel's migration file prefix, `2026_10_29_100000`, `index` seconds after `now`. */
export function migrationStamp(now: Date, index: number): string {
  const at = new Date(now.getTime() + index * 1000);
  const date = `${at.getFullYear()}_${pad(at.getMonth() + 1)}_${pad(at.getDate())}`;
  return `${date}_${pad(at.getHours())}${pad(at.getMinutes())}${pad(at.getSeconds())}`;
}
