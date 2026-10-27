// Starts a release: `pnpm release:tag 0.2.0` dates the changelogs' unreleased changes as 0.2.0,
// writes the version everywhere it's kept, commits it, tags it `v0.2.0` and pushes both. The tag
// starts `.github/workflows/release.yml`, which builds every package into a draft release and
// publishes it once every build passed.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

import { CHANGELOG_HEADINGS } from "../src/shared/core/app-updates/changelog/changelog-headings.ts";
import { readChangelogs } from "./changelog/changelog-files.mjs";

const version = process.argv[2]?.replace(/^v/, "");
if (!version || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  fail("Usage: pnpm release:tag <version>, e.g. pnpm release:tag 0.2.0");
}
const tag = `v${version}`;

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

if (git("branch", "--show-current") !== "master") fail("Release from the master branch.");
if (git("status", "--porcelain") !== "") fail("Commit or stash your changes first.");
if (git("tag", "--list", tag) !== "") fail(`The tag ${tag} already exists.`);

try {
  execFileSync("node", ["scripts/changelog/check-changelog.mjs"], { stdio: "inherit" });
} catch {
  fail("Fix the changelogs first.");
}
const changelogs = readChangelogs();
for (const { file, entries } of changelogs) {
  if (entries.some((entry) => entry.version === version)) fail(`${file} already has ${version}.`);
  if ((entries[0]?.groups.length ?? 0) === 0) fail(`${file} has no unreleased changes to release.`);
}

/** Replaces the one match of `pattern` in a file, failing when there's none. */
function replaceIn(path, pattern, replacement) {
  const text = readFileSync(path, "utf8");
  if (!pattern.test(text)) fail(`Couldn't find the version in ${path}.`);
  writeFileSync(path, text.replace(pattern, replacement));
}

// The unreleased changes become the version's; a new, empty unreleased section goes above them.
const now = new Date();
const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
  .map((part) => String(part).padStart(2, "0"))
  .join("-");
for (const { locale, file } of changelogs) {
  const heading = `## ${CHANGELOG_HEADINGS[locale].unreleased}`;
  replaceIn(file, new RegExp(`^${heading}$`, "m"), `${heading}\n\n## ${version} - ${today}`);
}

replaceIn("package.json", /^(  "version": ")[^"]+(",)$/m, `$1${version}$2`);
replaceIn("src-tauri/tauri.conf.json", /^(  "version": ")[^"]+(",)$/m, `$1${version}$2`);
replaceIn("src-tauri/Cargo.toml", /^(version = ")[^"]+(")$/m, `$1${version}$2`);
replaceIn(
  "src-tauri/Cargo.lock",
  /(name = "cloudy-canvas"\nversion = ")[^"]+(")/,
  `$1${version}$2`,
);

const files = [
  ...changelogs.map((changelog) => changelog.file),
  "package.json",
  "src-tauri/tauri.conf.json",
  "src-tauri/Cargo.toml",
  "src-tauri/Cargo.lock",
];
git("add", ...files);
git("commit", "-m", `Release ${tag}`);
git("tag", "-a", tag, "-m", `Cloudy Canvas ${tag}`);
git("push", "origin", "master", tag);

console.log(
  `Pushed ${tag}. GitHub Actions is building it, and publishes it once every build passed:`,
);
console.log("https://github.com/Cloudy-Studio-Apps/cloudy-canvas/actions");

function fail(message) {
  console.error(message);
  process.exit(1);
}
