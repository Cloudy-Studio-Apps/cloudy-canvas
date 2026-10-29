/** Singular → plural for the irregular nouns schemas use. */
const IRREGULAR: Readonly<Record<string, string>> = {
  person: "people",
  child: "children",
  man: "men",
  woman: "women",
  mouse: "mice",
  goose: "geese",
  tooth: "teeth",
  foot: "feet",
  datum: "data",
  index: "indices",
  matrix: "matrices",
  vertex: "vertices",
  analysis: "analyses",
  crisis: "crises",
  criterion: "criteria",
  cache: "caches",
  movie: "movies",
  cookie: "cookies",
  niche: "niches",
};

const IRREGULAR_PLURAL = new Map(Object.entries(IRREGULAR).map(([one, many]) => [many, one]));

/** Words that are the same in the singular and the plural. */
const UNCOUNTABLE = new Set([
  "data",
  "information",
  "equipment",
  "series",
  "species",
  "news",
  "metadata",
  "media",
  "feedback",
  "staff",
  "sheep",
  "fish",
  "audio",
  "software",
]);

/** The plural of one lowercase English word. */
function pluralWord(word: string): string {
  if (UNCOUNTABLE.has(word) || IRREGULAR_PLURAL.has(word)) return word;
  const irregular = IRREGULAR[word];
  if (irregular) return irregular;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  if (/[^f]fe$/.test(word)) return `${word.slice(0, -2)}ves`;
  if (/[^f]f$/.test(word) && !/(roof|chief|proof|belief)$/.test(word)) {
    return `${word.slice(0, -1)}ves`;
  }
  return `${word}s`;
}

/** The singular of one lowercase English word. */
function singularWord(word: string): string {
  if (UNCOUNTABLE.has(word) || word in IRREGULAR) return word;
  const irregular = IRREGULAR_PLURAL.get(word);
  if (irregular) return irregular;
  if (/[^aeiou]ies$/.test(word)) return `${word.slice(0, -3)}y`;
  if (/(ss|us|is)$/.test(word)) return word;
  if (/(s|x|z|ch|sh)es$/.test(word)) return word.slice(0, -2);
  if (/(ive|ove)s$/.test(word)) return word.slice(0, -1);
  if (/[^aeiou]ves$/.test(word)) return `${word.slice(0, -3)}f`;
  if (/s$/.test(word)) return word.slice(0, -1);
  return word;
}

/** Inflects only the last word of a name, keeping its separators (`order_items` → `order_item`). */
function inflectLast(name: string, inflect: (word: string) => string): string {
  const match = /([A-Za-z]+)$/.exec(name);
  if (!match?.[1]) return name;
  const last = match[1];
  // camelCase / PascalCase: the last word starts at the last capital.
  const split = /^(.*?)([A-Z]?[a-z]+)$/.exec(last);
  const head = split?.[1] ?? "";
  const word = split?.[2] ?? last;
  const lower = word.toLowerCase();
  const inflected = inflect(lower);
  const cased =
    word === word.toUpperCase()
      ? inflected.toUpperCase()
      : word[0] === word[0]?.toUpperCase()
        ? inflected.charAt(0).toUpperCase() + inflected.slice(1)
        : inflected;
  return name.slice(0, name.length - last.length) + head + cased;
}

/** `order_item` → `order_items`, `category` → `categories`, `person` → `people`. */
export function plural(name: string): string {
  return inflectLast(name, pluralWord);
}

/** `order_items` → `order_item`, `categories` → `category`, `people` → `person`. */
export function singular(name: string): string {
  return inflectLast(name, singularWord);
}
