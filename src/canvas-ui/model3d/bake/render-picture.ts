import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { PICTURE_MAX_SIDE, PICTURE_SCALE } from "@canvas";
import type { Size } from "@canvas";
import type { LoadedModel, ThreeKit } from "../load";
import { frameModel } from "./frame-model";
import type { ModelView } from "./frame-model.types";
import { addLighting } from "./lighting";

/** Pixels of the picture for a box in world units: `PICTURE_SCALE` times it, longest side capped. */
export function pictureSize(box: Size, maxTexture = PICTURE_MAX_SIDE): Size {
  const longest = Math.max(box.w, box.h, 1);
  const k = Math.min(PICTURE_SCALE, Math.min(PICTURE_MAX_SIDE, maxTexture) / longest);
  return { w: Math.max(1, Math.round(box.w * k)), h: Math.max(1, Math.round(box.h * k)) };
}

/** A renderer that draws with a transparent background and keeps its pixels to be read. */
export function createPictureRenderer(kit: ThreeKit): WebGLRenderer {
  const renderer = new kit.THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = kit.THREE.SRGBColorSpace;
  return renderer;
}

/** Builds the scene the live view and the picture share: the lit model and its camera. */
export function buildPictureScene(
  kit: ThreeKit,
  loaded: LoadedModel,
): { scene: Scene; camera: PerspectiveCamera } {
  const scene = new kit.THREE.Scene();
  const camera = new kit.THREE.PerspectiveCamera();
  scene.add(loaded.object);
  addLighting(kit, scene, camera);
  return { scene, camera };
}

/** Draws the model in the view into the renderer at `size` pixels. */
export function renderPicture(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  loaded: LoadedModel,
  view: ModelView,
  size: Size,
): void {
  renderer.setPixelRatio(1);
  renderer.setSize(size.w, size.h, false);
  camera.aspect = size.w / size.h;
  frameModel(loaded.object, camera, view);
  renderer.render(scene, camera);
}
