import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const sourceRoot = process.argv[2] ? resolve(process.argv[2]) : null;
if (!sourceRoot) {
  throw new Error("Usage: node scripts/package-unity-web.mjs <Unity Web build folder>");
}

const sourceBuild = resolve(sourceRoot, "Build");
const targetGame = resolve("public/game");
const targetBuild = resolve(targetGame, "Build");
const sourceFiles = readdirSync(sourceBuild);
const loader = requireOne(sourceFiles, ".loader.js");
const framework = requireOne(sourceFiles, ".framework.js.unityweb");
const wasm = requireOne(sourceFiles, ".wasm.unityweb");
const data = requireOne(sourceFiles, ".data.unityweb");

mkdirSync(targetBuild, { recursive: true });
for (const file of readdirSync(targetBuild)) {
  if (/\.(?:loader\.js|framework\.js\.unityweb|wasm\.unityweb)$/.test(file) ||
      /\.data\.unityweb\.part-\d+$/.test(file)) {
    rmSync(resolve(targetBuild, file));
  }
}

const loaderName = copyHashed(loader, ".loader.js");
const frameworkName = copyHashed(framework, ".framework.js.unityweb");
const wasmName = copyHashed(wasm, ".wasm.unityweb");

const dataSource = readFileSync(resolve(sourceBuild, data));
const dataHash = digest(dataSource);
const partSize = 30 * 1024 * 1024;
const dataParts = [];
for (let offset = 0, index = 0; offset < dataSource.length; offset += partSize, index += 1) {
  const name = `${dataHash}.data.unityweb.part-${String(index).padStart(2, "0")}`;
  writeFileSync(resolve(targetBuild, name), dataSource.subarray(offset, offset + partSize));
  dataParts.push(name);
}

const indexPath = resolve(targetGame, "index.html");
let indexSource = readFileSync(indexPath, "utf8");
indexSource = indexSource
  .replace(/var loaderUrl = buildUrl \+ "\/[^"]+\.loader\.js";/,
    `var loaderUrl = buildUrl + "/${loaderName}";`)
  .replace(/frameworkUrl: buildUrl \+ "\/[^"]+\.framework\.js\.unityweb"/,
    `frameworkUrl: buildUrl + "/${frameworkName}"`)
  .replace(/codeUrl: buildUrl \+ "\/[^"]+\.wasm\.unityweb"/,
    `codeUrl: buildUrl + "/${wasmName}"`)
  .replace(/var dataPartUrls = \[[\s\S]*?\n      \];/,
    `var dataPartUrls = [\n${dataParts.map((name) =>
      `        buildUrl + "/${name}"`).join(",\n")}\n      ];`);
writeFileSync(indexPath, indexSource);

const manifestPath = resolve(targetGame, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.version = "0.9.3-web-mission-1";
manifest.release = "anonymous-play-funnel";
manifest.dataParts = dataParts.length;
manifest.builtAt = "2026-07-22";
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify({
  loader: loaderName,
  framework: frameworkName,
  wasm: wasmName,
  dataParts,
  sourceDataBytes: dataSource.length,
}, null, 2));

function requireOne(files, suffix) {
  const matches = files.filter((file) => file.endsWith(suffix));
  if (matches.length !== 1) {
    throw new Error(`Expected one ${suffix} file, found ${matches.length}`);
  }
  return matches[0];
}

function copyHashed(sourceName, suffix) {
  const sourcePath = resolve(sourceBuild, sourceName);
  const name = `${digest(readFileSync(sourcePath))}${suffix}`;
  copyFileSync(sourcePath, resolve(targetBuild, name));
  return name;
}

function digest(value) {
  return createHash("md5").update(value).digest("hex");
}
