// An example plugin: everything a module can add, written in plain JavaScript with no build step.
// It gets the app's building blocks from `api` (see docs/plugins.md) and imports nothing. Its text
// is in English and Spanish (`locales/`); the MCP tool's stays English, like the app's.

const COLORS = [
  { key: "ice", value: "#dcecf9" },
  { key: "sand", value: "#f6ead2" },
  { key: "blush", value: "#fbe1da" },
  { key: "mint", value: "#dcf2e4" },
];
const SIZE = { w: 280, h: 120 };
const EDGE = 6;
const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v12H8l-4 4z"/>' +
  '<path d="M8 4v12"/></svg>';

export default async function activate(api) {
  const { canvas, canvasUi, board, core } = api;
  const { React } = api.libs;
  const ink = board.INK_COLOR;
  const read = async (lang) => JSON.parse(await api.plugin.readText(`locales/${lang}.json`));
  const t = core.defineMessages({ en: await read("en"), es: await read("es") });

  function createCallout(center, color, text, index) {
    const rect = {
      x: Math.round(center.x - SIZE.w / 2),
      y: Math.round(center.y - SIZE.h / 2),
      w: SIZE.w,
      h: SIZE.h,
    };
    return { ...canvas.createElementBase("callout", rect, index), color, text };
  }

  class CalloutKind extends canvas.TextBoxKind {
    type = "callout";
    label = t("kind.label");
    description = t("kind.description");
    tool = "callout";
    // Agents create callouts with create_callout, and change them with update_shapes.
    creatable = false;
    patchableFields = new Set(["x", "y", "w", "h", "text", "color"]);

    draw(view, el) {
      view.graphics
        .clear()
        .rect(0, 0, el.w, el.h)
        .fill({ color: el.color })
        .rect(0, 0, EDGE, el.h)
        .fill({ color: ink, alpha: 0.7 });
      view.placeText(el.text, this.textStyle(), el.w, el.h);
    }

    textStyle() {
      return { fontSize: 16, color: ink, align: "left", vAlign: "top", padX: 20, padY: 14 };
    }

    optionsOf(el) {
      return { calloutColor: el.color };
    }

    restyle(_el, options) {
      return options.calloutColor ? { color: options.calloutColor } : {};
    }
  }

  /** Click to drop a callout centered on the pointer, then type into it. */
  class CalloutTool {
    id = "callout";
    cursor = "crosshair";

    constructor(ctx) {
      this.ctx = ctx;
    }

    onPointerDown(p) {
      const { doc } = this.ctx;
      const callout = createCallout(
        p.world,
        this.ctx.getOptions().calloutColor,
        "",
        doc.nextIndex(),
      );
      doc.checkpoint();
      doc.add(callout);
      canvas.selectAndEdit(this.ctx, callout.id);
    }
  }

  /** The color panel, for the tool and for selected callouts. */
  function CalloutOptions() {
    const engine = canvasUi.useEngine();
    const color = canvasUi.useEngineState((state) => state.options.calloutColor);
    return React.createElement(
      canvasUi.FloatingPanel,
      { role: "group", "aria-label": t("colors.panel"), className: "gap-1 px-2" },
      COLORS.map((c) =>
        React.createElement(canvasUi.ColorSwatch, {
          key: c.value,
          label: t(`colors.${c.key}`),
          color: c.value,
          selected: color === c.value,
          onSelect: () => engine.setToolOptions({ calloutColor: c.value }),
        }),
      ),
    );
  }

  const createCalloutTool = {
    name: "create_callout",
    description:
      "Adds a callout (a highlighted note with a colored edge) to the open board as one undo " +
      "step and returns its id. x/y are its center in world units.",
    inputSchema: {
      type: "object",
      required: ["text"],
      properties: {
        text: { type: "string" },
        x: { type: "number" },
        y: { type: "number" },
        color: { enum: COLORS.map((c) => c.value) },
      },
    },
    run: (host, args) => {
      const { engine } = board.requireBoard(host);
      const center = {
        x: canvas.optionalNumber(args, "x") ?? 0,
        y: canvas.optionalNumber(args, "y") ?? 0,
      };
      const color = canvas.optionalString(args, "color") ?? COLORS[0].value;
      const callout = createCallout(
        center,
        color,
        canvas.stringArg(args, "text"),
        engine.doc.nextIndex(),
      );
      canvas.asUndoStep(engine.doc, () => engine.doc.add(callout));
      return { id: callout.id };
    },
  };

  return core.defineModule({
    id: "callout",
    register(host) {
      host.contribute(board.boardCanvas.kinds, new CalloutKind());
      host.contribute(board.boardCanvas.tools, {
        id: "callout",
        create: (ctx) => new CalloutTool(ctx),
        keys: [{ key: "o" }],
      });
      host.contribute(board.boardCanvas.options, { calloutColor: COLORS[0].value });
      host.contribute(board.boardMcpTools, { id: "callout", tools: () => [createCalloutTool] });

      // Its button goes on the toolbar after the built-in tools; as it adds an element, it's
      // listed in the library too (name and description from the kind).
      host.contribute(board.boardEditor.tools, {
        tool: "callout",
        element: "callout",
        icon: { svg: ICON },
        toolbar: { group: 1, order: 110 },
        library: { keywords: ["note", "highlight"] },
      });
      host.contribute(board.boardEditor.toolPanels, { tool: "callout", component: CalloutOptions });
      host.contribute(board.boardEditor.selectionPanels, {
        type: "callout",
        component: CalloutOptions,
      });
    },
  });
}
