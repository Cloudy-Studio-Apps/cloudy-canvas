// Little CMS as WebAssembly: only what `lcms-color.ts` calls (the package has no types).
declare module "lcms-wasm" {
  export interface Lcms {
    cmsOpenProfileFromMem(data: Uint8Array, size: number): number;
    cmsCreate_sRGBProfile(): number;
    cmsCloseProfile(profile: number): void;
    cmsGetColorSpaceASCII(profile: number): string;
    cmsGetProfileInfoASCII(
      profile: number,
      info: number,
      language: string,
      country: string,
    ): string | null;
    cmsCreateTransform(
      input: number,
      inputFormat: number,
      output: number,
      outputFormat: number,
      intent: number,
      flags: number,
    ): number;
    cmsDoTransform(transform: number, input: Uint8Array, pixels: number): Uint8Array;
    cmsDeleteTransform(transform: number): void;
  }
  export function instantiate(options?: { locateFile?: (name: string) => string }): Promise<Lcms>;
  export const TYPE_RGB_8: number;
  export const TYPE_CMYK_8: number;
  export const INTENT_PERCEPTUAL: number;
  export const INTENT_RELATIVE_COLORIMETRIC: number;
  export const cmsFLAGS_BLACKPOINTCOMPENSATION: number;
  export const cmsInfoDescription: number;
}

declare module "lcms-wasm/dist/lcms.wasm?url" {
  const url: string;
  export default url;
}
