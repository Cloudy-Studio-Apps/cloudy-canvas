import type * as THREE from "three";
import type { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import type { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import type { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

/** three.js and the loaders, fetched together the first time a model is used. */
export interface ThreeKit {
  THREE: typeof THREE;
  GLTFLoader: typeof GLTFLoader;
  OBJLoader: typeof OBJLoader;
  MTLLoader: typeof MTLLoader;
  FBXLoader: typeof FBXLoader;
  GLTFExporter: typeof GLTFExporter;
}
