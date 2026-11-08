import type { ModelBaker } from "@canvas";
import type { WebGLRenderer } from "three";
import { importModel, loadModel, loadThree } from "../load";
import {
  buildPictureScene,
  createPictureRenderer,
  pictureSize,
  renderPicture,
} from "./render-picture";

let renderer: WebGLRenderer | null = null;
let queue: Promise<unknown> = Promise.resolve();

/** Runs one bake at a time, so two never fight over the shared renderer. */
function inTurn<T>(job: () => Promise<T>): Promise<T> {
  const result = queue.then(job, job);
  queue = result.catch(() => undefined);
  return result;
}

function toBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return reject(new Error("The picture could not be encoded"));
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png");
  });
}

/** Imports models and draws their picture off screen with one shared WebGL renderer. */
export const modelBaker: ModelBaker = {
  importModel,
  bake: (source, view, box) =>
    inTurn(async () => {
      const kit = await loadThree();
      const loaded = await loadModel(source);
      try {
        renderer ??= createPictureRenderer(kit);
        const { scene, camera } = buildPictureScene(kit, loaded);
        renderPicture(renderer, scene, camera, loaded, view, pictureSize(box));
        return await toBytes(renderer.domElement);
      } finally {
        loaded.dispose();
      }
    }),
};
