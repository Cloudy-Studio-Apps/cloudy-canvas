import { LIVE_RELEASE_DELAY_MS } from "@canvas";
import type { ModelTextureSlot, Size } from "@canvas";
import type { WebGLRenderer } from "three";

import {
  buildPictureScene,
  canvasBytes,
  createPictureRenderer,
  pictureSize,
  renderPicture,
} from "../bake";
import type { ModelView } from "../bake";
import { loadModel, loadThree } from "../load";
import type { LiveScene, LiveSourceReader } from "./live-model.types";

// The one live model (only one is live at a time) and its renderer, kept a while after the view
// closes so reopening it right away is instant.
let renderer: WebGLRenderer | null = null;
let live: LiveScene | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let generation = 0;

function cancelRelease(): void {
  if (timer !== null) clearTimeout(timer);
  timer = null;
}

function dropScene(): void {
  live?.loaded.dispose();
  live = null;
}

/** Frees the model, its textures and the WebGL context. */
function releaseAll(): void {
  cancelRelease();
  generation++;
  dropScene();
  renderer?.domElement.remove();
  renderer?.dispose();
  renderer?.forceContextLoss();
  renderer = null;
}

/**
 * The live scene of `key`, built with the textures named by `texturesKey`: the one kept from
 * before when it matches, else the model loaded again (into the same renderer). `null` when a
 * newer call took over while this one loaded. Throws when the model can't be read or shown.
 */
export async function acquireLiveScene(
  key: string,
  texturesKey: string,
  read: LiveSourceReader,
): Promise<LiveScene | null> {
  cancelRelease();
  if (live && live.key === key && live.texturesKey === texturesKey) return live;
  const turn = ++generation;
  const kit = await loadThree();
  if (turn !== generation) return null;
  const source = read();
  if (!source) throw new Error("The model's data is missing from this file");
  const loaded = await loadModel(source);
  if (turn !== generation) {
    loaded.dispose();
    return null;
  }
  dropScene();
  if (renderer?.getContext().isContextLost()) releaseAll();
  renderer ??= createPictureRenderer(kit);
  const { scene, camera } = buildPictureScene(kit, loaded);
  live = { key, texturesKey, loaded, scene, camera, renderer };
  return live;
}

/** Puts the live scene's canvas in `host`, filling it. */
export function attachLiveScene(scene: LiveScene, host: HTMLElement): void {
  const canvas = scene.renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  host.appendChild(canvas);
}

/** Draws the live scene into its canvas at `size` pixels. */
export function drawLiveScene(scene: LiveScene, view: ModelView, size: Size): void {
  if (live !== scene) return;
  const max = Math.min(scene.renderer.capabilities.maxTextureSize, 4096);
  const k = Math.min(1, max / Math.max(size.w, size.h, 1));
  const pixels = { w: Math.max(1, Math.round(size.w * k)), h: Math.max(1, Math.round(size.h * k)) };
  renderPicture(scene.renderer, scene.scene, scene.camera, scene.loaded, view, pixels);
}

/** The view closed: everything is freed `LIVE_RELEASE_DELAY_MS` later, unless it reopens first. */
export function releaseLiveScene(key: string): void {
  if (!live || live.key !== key) return;
  live.renderer.domElement.remove();
  cancelRelease();
  timer = setTimeout(releaseAll, LIVE_RELEASE_DELAY_MS);
}

/**
 * The saved picture of `key` drawn from its live scene (no loading), or `null` when it isn't
 * kept or its textures differ (then the off-screen baker draws it).
 */
export function bakeLiveScene(
  key: string,
  texturesKey: string,
  view: ModelView,
  box: Size,
): Promise<Uint8Array> | null {
  if (!live || live.key !== key || live.texturesKey !== texturesKey) return null;
  const gl = live.renderer;
  if (gl.getContext().isContextLost()) return null;
  renderPicture(
    gl,
    live.scene,
    live.camera,
    live.loaded,
    view,
    pictureSize(box, gl.capabilities.maxTextureSize),
  );
  return canvasBytes(gl.domElement);
}

/** Names the texture slots a model is built with, to tell when they changed. */
export function texturesKeyOf(textures: readonly ModelTextureSlot[]): string {
  return textures.map((slot) => `${slot.name}=${slot.assetId ?? ""}`).join("|");
}
