import type { ModelBaker } from "@canvas";
import type { WebGLRenderer } from "three";
import { importModel, loadModel, loadThree } from "../load";
import type { ThreeKit } from "../load";
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
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("The picture could not be encoded"));
      blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)), reject);
    }, "image/png");
  });
}

/** The shared renderer; a new one when the cached one lost its WebGL context. */
function rendererFor(kit: ThreeKit): WebGLRenderer {
  if (renderer?.getContext().isContextLost()) {
    renderer.dispose();
    renderer = null;
  }
  if (!renderer) {
    renderer = createPictureRenderer(kit);
    renderer.domElement.addEventListener("webglcontextlost", () => {
      renderer = null;
    });
  }
  if (renderer.getContext().isContextLost()) {
    renderer = null;
    throw new Error("WebGL is not available to draw the model's picture");
  }
  return renderer;
}

/** Imports models and draws their picture off screen with one shared WebGL renderer. */
export const modelBaker: ModelBaker = {
  importModel,
  bake: (source, view, box) =>
    inTurn(async () => {
      const kit = await loadThree();
      const loaded = await loadModel(source);
      try {
        const gl = rendererFor(kit);
        const { scene, camera } = buildPictureScene(kit, loaded);
        renderPicture(
          gl,
          scene,
          camera,
          loaded,
          view,
          pictureSize(box, gl.capabilities.maxTextureSize),
        );
        return await toBytes(gl.domElement);
      } finally {
        loaded.dispose();
      }
    }),
};
