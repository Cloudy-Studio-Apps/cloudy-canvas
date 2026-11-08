import type { ThreeKit } from "./load-three.types";
import type { ModelManager } from "./model-manager.types";
import { baseName, externalUrl, safeDecode } from "./external-texture";

/**
 * A loading manager that serves the files it was given (by lower-case name) from blob URLs and
 * answers every other file with an external stand-in (`externalUrl`). `settled()` resolves when
 * everything it started has finished, since FBX and OBJ textures load after `parse` returns.
 */
export function createModelManager(
  kit: ThreeKit,
  files: ReadonlyMap<string, Uint8Array>,
): ModelManager {
  const manager = new kit.THREE.LoadingManager();
  const urls: string[] = [];
  let pending = 0;
  let waiting: (() => void)[] = [];

  manager.setURLModifier((url) => {
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;
    const name = baseName(safeDecode(url));
    const bytes = files.get(name.toLowerCase());
    if (!bytes) return externalUrl(name);
    const blobUrl = URL.createObjectURL(new Blob([bytes as BlobPart]));
    urls.push(blobUrl);
    return blobUrl;
  });

  const start = manager.itemStart.bind(manager);
  const end = manager.itemEnd.bind(manager);
  manager.itemStart = (url) => {
    pending++;
    start(url);
  };
  manager.itemEnd = (url) => {
    end(url);
    pending--;
    if (pending === 0) {
      const done = waiting;
      waiting = [];
      for (const resolve of done) resolve();
    }
  };

  return {
    manager,
    async settled() {
      await Promise.resolve();
      if (pending > 0) await new Promise<void>((resolve) => waiting.push(resolve));
    },
    dispose() {
      for (const url of urls) URL.revokeObjectURL(url);
      urls.length = 0;
    },
  };
}
