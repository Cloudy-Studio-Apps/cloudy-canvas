import { TokenStore } from "@canvas";
import type { ModuleHost } from "@shared/core";
import type { DesignToolOptions } from "../../design-options.types";
import { designCanvas, designSelectRedirects } from "../../design-points";
import { prepareSheetCopies, sheetRedirect } from "./sheet";
import { styleguideCategories, styleguideTemplates } from "./styleguide.points";
import { syncStyleguide } from "./system";
import { TOKEN_SHEET_TOOL, TokenSheetTool } from "./tool";
import { t } from "./styleguide.i18n";

/**
 * Live elements: clicks and copies of what they generated, keeping them in step with the tokens,
 * and the tool that places one.
 */
export function registerStyleguideCanvas(host: ModuleHost): void {
  // A click on what a template generated selects the element it belongs to.
  host.contribute(designSelectRedirects, sheetRedirect);
  // A generated layer copied on its own pastes as an ordinary layer.
  host.contribute(designCanvas.prepareCopies, prepareSheetCopies);

  // Read when an edit settles: every module has contributed by then.
  let options: DesignToolOptions | null = null;
  const sources = {
    categories: () => host.get(styleguideCategories),
    template: (id: string) => host.find(styleguideTemplates, id),
    options: () =>
      (options ??= Object.assign({}, ...host.get(designCanvas.options)) as DesignToolOptions),
  };
  // The system page and every live element follow the tokens, in the edit's undo step.
  host.contribute(designCanvas.afterEdit, (doc, change, kinds) =>
    syncStyleguide(doc, change, kinds, sources),
  );

  // Live elements on any page: the tool places one with the first category that has tokens.
  host.contribute(designCanvas.tools, {
    id: TOKEN_SHEET_TOOL,
    create: (ctx) =>
      new TokenSheetTool(ctx, () => {
        const store = TokenStore.of(ctx.doc);
        const categories = host.get(styleguideCategories);
        const first =
          categories.find((c) => !c.untitled && c.groups(store, ctx.doc).length > 0) ??
          categories.find((c) => !c.untitled) ??
          categories[0];
        return first ?? { id: "colors", label: t("canvas.fallback") };
      }),
    keys: [{ key: "d", shift: true }],
  });
}
