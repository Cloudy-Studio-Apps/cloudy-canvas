// An example plugin: a data source type written in plain JavaScript with no build step. It
// registers one type on the data module's `dataSourceTypes` point (from `host.require("data")`)
// and its settings form is made from the settings it lists. Its text is in English and Spanish
// (`locales/`).

const CATEGORIES = ["Chairs", "Lamps", "Tables", "Shelves", "Rugs"];
const NAMES = ["Oslo", "Lima", "Kyoto", "Nordic", "Milan", "Aria", "Bondi", "Cedar"];
const COLORS = ["#dcecf9", "#f6ead2", "#fbe1da", "#dcf2e4", "#e6dcf6"];
const DEFAULT_COUNT = 24;

// A small picture as an inline SVG `data:` URL, so the source works offline.
function pictureFor(label, color) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180" viewBox="0 0 240 180">' +
    `<rect width="240" height="180" fill="${color}"/>` +
    '<text x="120" y="98" font-family="sans-serif" font-size="22" text-anchor="middle" ' +
    `fill="#334155">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makeProducts(count) {
  const products = [];
  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const name = `${NAMES[i % NAMES.length]} ${category.slice(0, -1)}`;
    products.push({
      id: i + 1,
      name,
      price: 19 + ((i * 37) % 280) + 0.99,
      category,
      image: pictureFor(name, COLORS[i % COLORS.length]),
    });
  }
  return products;
}

export default async function activate(api) {
  const read = async (lang) => JSON.parse(await api.plugin.readText(`locales/${lang}.json`));
  const t = api.core.defineMessages({ en: await read("en"), es: await read("es") });

  return api.core.defineModule({
    id: "sample-products-source",
    register(host) {
      // `data` is a core module: no `requires` needed.
      const data = host.require("data");
      host.contribute(data.dataSourceTypes, {
        id: "sample-products",
        get label() {
          return t("label");
        },
        icon: "Table",
        settings: [{ key: "count", kind: "number", label: t("count"), min: 1, max: 200 }],
        defaultName: () => t("name"),
        async update(settings, ctx) {
          const asked = typeof settings.count === "number" ? Math.floor(settings.count) : NaN;
          const count = Math.min(200, Math.max(1, Number.isFinite(asked) ? asked : DEFAULT_COUNT));
          if (ctx.signal.aborted) throw new Error("Cancelled.");
          return { text: JSON.stringify(makeProducts(count)), mime: "application/json" };
        },
      });
    },
  });
}
