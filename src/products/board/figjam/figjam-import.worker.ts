import { serveFigmaWorker } from "@canvas/figma";

import { readAndConvertFigJam } from "./read-and-convert-figjam";

// Reads and converts a `.jam` file off the UI thread (see `convertFigJamFile`), so the app keeps
// drawing its loading screen while a large board is decoded.
serveFigmaWorker(readAndConvertFigJam, "The FigJam file couldn't be read.");
