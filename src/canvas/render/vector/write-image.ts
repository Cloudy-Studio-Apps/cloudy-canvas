import type { Sprite, Texture, TilingSprite } from "pixi.js";

import { imageType } from "../../image";
import { bytesToBase64 } from "../../utils";
import { num } from "./svg-format";
import type { SvgContext } from "./svg-context.types";

/** A sprite as its file, or `null` when it doesn't show an asset (the caller flattens it). */
export function writeSprite(sprite: Sprite, w: SvgContext): string | null {
  const { texture } = sprite;
  const picture = pictureOf(texture, w);
  if (!picture) return null;
  const { frame, source } = texture;
  if (frame.x === 0 && frame.y === 0 && frame.width === source.width) {
    if (frame.height === source.height) return picture;
  }
  // A crop: the picture moved so the part shown lands on the sprite, and cut to it.
  const clip = w.defs.id("c");
  w.defs.add(
    `<clipPath id="${clip}"><rect width="${num(frame.width)}" height="${num(frame.height)}"/></clipPath>`,
  );
  return (
    `<g clip-path="url(#${clip})"><g transform="translate(${num(-frame.x)} ${num(-frame.y)})">` +
    `${picture}</g></g>`
  );
}

/** A tiled picture: a pattern of its file filling the sprite's box. */
export function writeTiles(tiles: TilingSprite, w: SvgContext): string | null {
  if (w.target === "pdf") return null;
  const { texture } = tiles;
  const picture = pictureOf(texture, w);
  if (!picture) return null;
  const { source } = texture;
  const id = w.defs.id("p");
  const turn = (tiles.tileRotation * 180) / Math.PI;
  const place = `rotate(${num(turn)}) scale(${num(tiles.tileScale.x)} ${num(tiles.tileScale.y)})`;
  w.defs.add(
    `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${num(source.width)}"` +
      ` height="${num(source.height)}" patternTransform="${place}">${picture}</pattern>`,
  );
  return `<rect width="${num(tiles.width)}" height="${num(tiles.height)}" fill="url(#${id})"/>`;
}

/** A `<use>` of the texture's whole source, embedded once however often it shows. */
function pictureOf(texture: Texture, w: SvgContext): string | null {
  const { source } = texture;
  const assetId = w.assets.get(source);
  const file = assetId === undefined ? undefined : w.textures.file(assetId);
  if (!file) return null;
  const size = `width="${num(source.width)}" height="${num(source.height)}"`;
  const id = w.defs.once(`image|${assetId}|${size}`, "i", (own) => {
    const data = `data:${imageType(file)};base64,${bytesToBase64(file)}`;
    return `<image id="${own}" ${size} preserveAspectRatio="none" xlink:href="${data}"/>`;
  });
  return `<use xlink:href="#${id}"/>`;
}
