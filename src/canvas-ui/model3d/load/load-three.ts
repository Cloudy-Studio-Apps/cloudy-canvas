import type { ThreeKit } from "./load-three.types";

let kit: Promise<ThreeKit> | null = null;

/**
 * three.js and its loaders, fetched on first use so people who never open a 3D model don't pay for
 * them at startup or in the main bundle. This is the only place that imports them at run time.
 */
export function loadThree(): Promise<ThreeKit> {
  kit ??= fetchThree().catch((error: unknown) => {
    kit = null;
    throw error;
  });
  return kit;
}

async function fetchThree(): Promise<ThreeKit> {
  const [THREE, gltf, obj, mtl, fbx, exporter] = await Promise.all([
    import("three"),
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/loaders/OBJLoader.js"),
    import("three/examples/jsm/loaders/MTLLoader.js"),
    import("three/examples/jsm/loaders/FBXLoader.js"),
    import("three/examples/jsm/exporters/GLTFExporter.js"),
  ]);
  return {
    THREE,
    GLTFLoader: gltf.GLTFLoader,
    OBJLoader: obj.OBJLoader,
    MTLLoader: mtl.MTLLoader,
    FBXLoader: fbx.FBXLoader,
    GLTFExporter: exporter.GLTFExporter,
  };
}
