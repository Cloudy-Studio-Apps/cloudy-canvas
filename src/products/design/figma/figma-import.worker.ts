import { serveFigmaWorker } from "@canvas/figma";

import { readAndConvertFigma } from "./read-and-convert-figma";

// Reads and converts a `.fig` file off the UI thread (see `convertFigmaFile`), so the app keeps
// drawing its loading screen while a large file is decoded.
serveFigmaWorker(readAndConvertFigma, "The Figma file couldn't be read.");
