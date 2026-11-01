import type { ColorConversion, ColorConverter, RenderingIntent } from "@shared/core";

import { t } from "../platform.i18n";

/** Where a profile's class sits in its header, and the one a press has. */
const CLASS_OFFSET = 12;
const OUTPUT_CLASS = "prtr";

/** Little CMS, loaded the first time a file goes to press. */
const library = async () => {
  const [lcms, { default: wasm }] = await Promise.all([
    import("lcms-wasm"),
    import("lcms-wasm/dist/lcms.wasm?url"),
  ]);
  const api = await lcms.instantiate({ locateFile: () => wasm });
  return { lcms, api };
};
let loaded: ReturnType<typeof library> | null = null;
/** The library, loaded once; a load that failed is tried again next time. */
const load = () => {
  loaded ??= library().catch((error: unknown) => {
    loaded = null;
    throw error;
  });
  return loaded;
};

function classOf(profile: Uint8Array): string {
  return String.fromCharCode(...profile.subarray(CLASS_OFFSET, CLASS_OFFSET + 4));
}

/** Color management with Little CMS: sRGB into a print profile, with black point compensation. */
export const colorConversion: ColorConversion = {
  async readProfile(profile) {
    const { lcms, api } = await load();
    const handle = api.cmsOpenProfileFromMem(profile, profile.length);
    if (!handle) throw new Error(t("printProfile.unreadable"));
    try {
      const space = api.cmsGetColorSpaceASCII(handle).trim();
      if (space !== "CMYK" || classOf(profile) !== OUTPUT_CLASS) {
        throw new Error(t("printProfile.notCmyk"));
      }
      const name = api.cmsGetProfileInfoASCII(handle, lcms.cmsInfoDescription, "en", "US");
      return { name: name?.trim() || t("printProfile.unnamed") };
    } finally {
      api.cmsCloseProfile(handle);
    }
  },

  async converter(profile, intent: RenderingIntent): Promise<ColorConverter> {
    const { lcms, api } = await load();
    const output = api.cmsOpenProfileFromMem(profile, profile.length);
    if (!output) throw new Error(t("printProfile.unreadable"));
    const input = api.cmsCreate_sRGBProfile();
    const transform = api.cmsCreateTransform(
      input,
      lcms.TYPE_RGB_8,
      output,
      lcms.TYPE_CMYK_8,
      intent === "perceptual" ? lcms.INTENT_PERCEPTUAL : lcms.INTENT_RELATIVE_COLORIMETRIC,
      lcms.cmsFLAGS_BLACKPOINTCOMPENSATION,
    );
    api.cmsCloseProfile(input);
    api.cmsCloseProfile(output);
    if (!transform) throw new Error(t("printProfile.unreadable"));
    return {
      rgbToCmyk: (rgb) => api.cmsDoTransform(transform, rgb, rgb.length / 3),
      close: () => api.cmsDeleteTransform(transform),
    };
  },
};
