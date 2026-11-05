import { optionalBoolean, optionalNumber, optionalString, stringArg } from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { DESIGN_DATA_SOURCES } from "../model";
import { describeSource, summarizeSource } from "./describe-source";
import { patchFields } from "./field-args";
import { readRowsPath, ROWS_PATH_SCHEMA } from "./rows-path-arg";
import { readShapeArg, SHAPE_SCHEMA } from "./shape-arg";
import { SHAPE_ERRORS } from "../table";
import { readSnapshotRows } from "../update";
import {
  checkFormat,
  inUndoStep,
  readSecretValues,
  readSettingValues,
  readSource,
  requireType,
  SOURCE_SCHEMA,
} from "./source-args";

const DEVICE_NOTE =
  "Nothing updates on its own: call update_data_source. Secrets (keys, header values) are kept " +
  "on this device, never in the file, and are never returned.";

const BINDING_NOTE =
  "A link's header secrets are bound to the URL's origin they were given for: once `url` " +
  "points at another origin they read as not set (and aren't sent) until given again. A file's " +
  "absolute path (and a file source's `imagesFolder`, where its image file names are read) " +
  "stays on this device; the settings keep only the name, and another device has to be given " +
  "the path again (`files[].onDevice`). Files in the app's own data folder are never read.";

const SETTINGS_SCHEMA = {
  type: "object",
  description:
    "The type's settings by key, e.g. a file's absolute `path`; a link's `url`, `method` (GET, " +
    "POST), `plainHeaders` (name to value, kept in the file), `headers` (name to value, the " +
    "values kept on this device), `auth` (none, apikey, bearer, basic) with `apiKeyName` and " +
    "`apiKeyIn` (header, query) and the secrets `apiKey`, `token` or `username` + the secret " +
    "`password`, and for POST `bodyKind` (none, form, json, text) with `form` (name to value) " +
    "or `body` (text). Unknown keys are an error.",
};

const SECRETS_SCHEMA = {
  type: "object",
  description:
    "Secret values kept on this device, by setting key or `<pairs key>.<name>` for a header's " +
    "value (e.g. `headers.Authorization`).",
};

const FORMAT_SCHEMA = {
  type: "string",
  description: '"auto" (by extension, content type, then content) or a format id (csv, json).',
};

/** Data sources: listing them, and adding, configuring, updating and removing them. */
export const dataTools: DesignMcpTool[] = [
  {
    name: "list_data_sources",
    description:
      "The data sources of the design (a file or a link whose rows can fill layers): id, name " +
      "(the identifier bindings use), type, format, row count, when it was last updated, the " +
      `last error and the secrets this device lacks. ${DEVICE_NOTE}`,
    inputSchema: { type: "object", properties: {} },
    run: async (host) => {
      const { engine } = requireDesign(host);
      const list = engine.service(DESIGN_DATA_SOURCES).list();
      return { sources: await Promise.all(list.map((s) => summarizeSource(engine, s))) };
    },
  },
  {
    name: "get_data_source",
    description:
      "One data source in full: settings, fields (path, alias, type, format, hidden), the " +
      "secrets it uses with `set` true or false (their values are never returned), the files it " +
      "reads with `onDevice`, and sample " +
      `rows from its last update. ${BINDING_NOTE}`,
    inputSchema: {
      type: "object",
      required: ["source"],
      properties: {
        source: SOURCE_SCHEMA,
        rows: { type: "number", description: "Sample rows to return (default 5, at most 50)." },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const source = readSource(engine, args);
      const rows = optionalNumber(args, "rows") ?? 5;
      if (rows < 0 || rows > 50) throw new Error('"rows" must be from 0 to 50.');
      return describeSource(engine, source, Math.floor(rows));
    },
  },
  {
    name: "add_data_source",
    description:
      "Adds a data source in one undo step and, unless `update` is false, fetches it right " +
      "away. `type` is a source type id (file, http); see the settings each one takes in the " +
      `error of a wrong key. Returns the source. ${DEVICE_NOTE}`,
    inputSchema: {
      type: "object",
      required: ["type", "settings"],
      properties: {
        type: { type: "string", description: "A source type id: file or http." },
        settings: SETTINGS_SCHEMA,
        secrets: SECRETS_SCHEMA,
        format: FORMAT_SCHEMA,
        rowsPath: ROWS_PATH_SCHEMA,
        name: {
          type: "string",
          description: "Becomes a lower-case identifier; default from the settings.",
        },
        update: { type: "boolean", description: "Fetch the data now (default true)." },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const sources = engine.service(DESIGN_DATA_SOURCES);
      const type = requireType(sources.types(), stringArg(args, "type"));
      const settings = readSettingValues(
        args,
        "settings",
        type.settings,
        `Source type "${type.id}"`,
      );
      if (!settings) throw new Error('"settings" must be an object.');
      const secrets = readSecretValues(args, type.settings, settings);
      const format = optionalString(args, "format");
      if (format !== undefined) checkFormat(sources.formats(), format);
      const update = optionalBoolean(args, "update") ?? true;
      const created = await sources.create({
        sourceType: type.id,
        settings,
        secrets,
        format,
        rowsPath: readRowsPath(args),
        name: optionalString(args, "name"),
      });
      const result = update ? await sources.update(created.id) : undefined;
      const source = sources.get(created.id) ?? created;
      return { ...(await describeSource(engine, source, 5)), update: result };
    },
  },
  {
    name: "update_data_source",
    description:
      "Fetches a data source again into a new snapshot (one undo step; a failure changes " +
      "nothing), or every source with `all: true`. May take a while. Returns the result of " +
      "each: ok, rowCount, changed, the error, `warnings` (a link that reads pages and stopped " +
      "early, keeping the rows it had) and imagesFailed: how many pictures the data " +
      "names (image-url, image-base64 and image-file fields) couldn't be saved in the file " +
      "(imagesOverLimit of them past the 2,000 new pictures one Update saves). Missing secrets " +
      "fail it with `Missing: …`.",
    inputSchema: {
      type: "object",
      properties: {
        source: SOURCE_SCHEMA,
        all: { type: "boolean", description: "Update every source, one after another." },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const sources = engine.service(DESIGN_DATA_SOURCES);
      const all = optionalBoolean(args, "all") ?? false;
      if (all === (args.source !== undefined))
        throw new Error('Give either "source" or "all": true.');
      const targets = all ? sources.list() : [readSource(engine, args)];
      const results = [];
      for (const target of targets) {
        results.push({
          source: target.id,
          name: target.name,
          ...(await sources.update(target.id)),
        });
      }
      return { results };
    },
  },
  {
    name: "set_data_source",
    description:
      "Changes a data source in one undo step: `name`, `settings` (merged into the current " +
      "ones; null removes a secret setting), `secrets`, `format` and `formatOptions`, `rowsPath`, " +
      "`fields` (patches matched by `path`: alias, type, format, hidden; an unknown path is an " +
      "error) and `shape` (applied last, so `fields` names the paths as they are now). Nothing " +
      `is fetched: call update_data_source after changing where data comes ` +
      `from. ${DEVICE_NOTE} ${BINDING_NOTE}`,
    inputSchema: {
      type: "object",
      required: ["source"],
      properties: {
        source: SOURCE_SCHEMA,
        name: { type: "string" },
        settings: SETTINGS_SCHEMA,
        secrets: SECRETS_SCHEMA,
        format: FORMAT_SCHEMA,
        formatOptions: { type: "object", description: "The format's options by key." },
        rowsPath: ROWS_PATH_SCHEMA,
        shape: SHAPE_SCHEMA,
        fields: {
          type: "array",
          items: {
            type: "object",
            required: ["path"],
            properties: {
              path: { type: "string", description: "The field's path (get_data_source)." },
              alias: {
                type: "string",
                description:
                  'A label shown for the field in pickers and the rows table; bindings keep using the path. "" clears it.',
              },
              type: {
                type: "string",
                description:
                  "text, integer, number, currency, boolean, date, color, url, image-url, image-base64, image-file, list or object.",
              },
              format: {
                type: "object",
                description:
                  "decimals (a whole number 0-20), currency (a 3-letter ISO code), dateStyle (short, medium, long), prefix, suffix, trueText, falseText (text), list (all, first, count: how a list field's items show).",
              },
              hidden: { type: "boolean" },
            },
          },
        },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const sources = engine.service(DESIGN_DATA_SOURCES);
      const source = readSource(engine, args);
      const type = requireType(sources.types(), source.sourceType);
      const name = optionalString(args, "name");
      if (name !== undefined && name.trim() === "") throw new Error('"name" is empty.');
      const given = readSettingValues(args, "settings", type.settings, `Source type "${type.id}"`);
      const settings = given ? { ...source.settings, ...given } : undefined;
      const secrets = readSecretValues(args, type.settings, settings ?? source.settings);
      const format = optionalString(args, "format");
      if (format !== undefined) checkFormat(sources.formats(), format);
      const nextFormat = format ?? source.format;
      const spec = sources.formats().find((f) => f.id === nextFormat);
      const options = readSettingValues(
        args,
        "formatOptions",
        spec?.options ?? [],
        `Format "${nextFormat}"`,
      );
      if (options && !spec)
        throw new Error('"formatOptions" needs an explicit "format" (not "auto").');
      const fields = patchFields(source, args);
      const rowsPath = readRowsPath(args);
      // Checked before anything is written: data this device can't read (missing or broken)
      // can't be shaped again.
      const read = args.shape === undefined ? null : readSnapshotRows(engine.doc, source.snapshot);
      if (args.shape !== undefined && !read) throw new Error(SHAPE_ERRORS.unreadable);
      const shape = readShapeArg(args, read?.raw ?? []);
      const keepOptions = format === undefined || format === source.format;
      await inUndoStep(engine, async () => {
        if (name !== undefined) sources.rename(source.id, name);
        if (format !== undefined || options) {
          const base = keepOptions ? source.formatOptions : {};
          sources.setFormat(source.id, nextFormat, { ...base, ...options });
        }
        if (settings || secrets)
          await sources.setSettings(source.id, settings ?? source.settings, secrets);
        if (fields) sources.setFields(source.id, fields);
        if (rowsPath !== undefined) sources.setRowsPath(source.id, rowsPath);
        if (shape !== undefined) await sources.setShape(source.id, shape);
      });
      return describeSource(engine, sources.get(source.id) ?? source, 5);
    },
  },
  {
    name: "remove_data_source",
    description:
      "Deletes a data source in one undo step (undo brings the source back, not its secrets, " +
      "which are removed from this device).",
    inputSchema: {
      type: "object",
      required: ["source"],
      properties: { source: SOURCE_SCHEMA },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const source = readSource(engine, args);
      await engine.service(DESIGN_DATA_SOURCES).remove(source.id);
      return { removed: source.id, name: source.name };
    },
  },
];
