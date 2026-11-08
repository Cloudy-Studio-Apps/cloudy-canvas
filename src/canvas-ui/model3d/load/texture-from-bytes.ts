import type { Texture } from "three";
import type { ThreeKit } from "./load-three.types";

/** A color texture from a picture's bytes, with the blob URL to revoke when it is no longer used. */
export async function textureFromBytes(
  kit: ThreeKit,
  bytes: Uint8Array,
): Promise<{ texture: Texture; url: string }> {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart]));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const texture = new kit.THREE.Texture(image);
    texture.colorSpace = kit.THREE.SRGBColorSpace;
    texture.wrapS = kit.THREE.RepeatWrapping;
    texture.wrapT = kit.THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return { texture, url };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("A texture picture could not be decoded");
  }
}
