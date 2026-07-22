import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

function fail(message) {
  throw new Error(`Privacy check failed: ${message}`);
}

const trackedFiles = git(["ls-files", "-z"]).split("\0").filter(Boolean);
const scannerPath = "scripts/privacy-check.mjs";
const binaryExtensions = new Set([
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".unityweb",
]);
const textRules = [
  ["email address", /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i],
  ["local workstation path", /(?:\/Users\/|\/private\/var\/folders\/|\/home\/|[A-Z]:\\Users\\)/i],
  ["temporary attachment path", /(?:TemporaryItems|pasted-text)/i],
  ["conversation or assistant artifact", /(?:ChatGPT|Codex|OpenAI|in-app-browser-context|My request for)/i],
  ["private-key material", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["GitHub access token", /(?:github_pat_|gh[pousr]_[A-Z0-9_]{20,})/i],
  ["API credential", /(?:sk-[A-Z0-9_-]{20,}|AIza[A-Z0-9_-]{30,}|AKIA[0-9A-Z]{16})/i],
];

for (const file of trackedFiles) {
  if (file === scannerPath) continue;
  const extension = file.slice(file.lastIndexOf(".")).toLowerCase();
  if (binaryExtensions.has(extension)) continue;

  const source = readFileSync(new URL(`../${file}`, import.meta.url));
  if (source.includes(0)) continue;
  const text = source.toString("utf8");
  for (const [label, pattern] of textRules) {
    if (pattern.test(text)) fail(`${label} detected in ${file}`);
  }
}

const identities = git(["log", "main", "--format=%an%x00%ae%x00%cn%x00%ce"])
  .split("\n")
  .filter(Boolean);
const allowedName = "Operation Steel Raven";
const allowedEmail = "268319767+ashutosh973@users.noreply.github.com";

for (const identity of identities) {
  const [authorName, authorEmail, committerName, committerEmail] = identity.split("\0");
  if (authorName !== allowedName || committerName !== allowedName) {
    fail("a commit uses a non-project author or committer name");
  }
  if (authorEmail !== allowedEmail || committerEmail !== allowedEmail) {
    fail("a commit uses an address other than the approved GitHub noreply address");
  }
}

function pngChunkTypes(buffer) {
  const types = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    types.push(type);
    offset += length + 12;
    if (type === "IEND") break;
  }
  return types;
}

const privatePngChunks = new Set(["caBX", "eXIf", "iTXt", "tEXt", "zTXt"]);
for (const file of trackedFiles.filter((name) => name.endsWith(".png"))) {
  const chunks = pngChunkTypes(readFileSync(new URL(`../${file}`, import.meta.url)));
  const unsafe = chunks.filter((type) => privatePngChunks.has(type));
  if (unsafe.length) fail(`nonessential metadata chunk detected in ${file}`);
}

function jpegMetadataMarkers(buffer) {
  const markers = [];
  let offset = 2;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;
    const length = buffer.readUInt16BE(offset + 2);
    if (marker === 0xe1 || marker === 0xeb || marker === 0xed) markers.push(marker);
    offset += length + 2;
  }
  return markers;
}

for (const file of trackedFiles.filter((name) => /\.jpe?g$/i.test(name))) {
  const markers = jpegMetadataMarkers(readFileSync(new URL(`../${file}`, import.meta.url)));
  if (markers.length) fail(`nonessential metadata segment detected in ${file}`);
}

const opaqueRules = [
  /\/users\//i,
  /\/private\/var\/folders\//i,
  /temporaryitems/i,
  /pasted-text/i,
  /\bchatgpt\b/i,
  /\bcodex\b/i,
  /\bopenai\b/i,
  /in-app-browser-context/i,
  /github_pat_/i,
  /begin private key/i,
];

function scanOpaque(buffer, label) {
  let stringStart = -1;
  for (let index = 0; index <= buffer.length; index += 1) {
    const byte = buffer[index];
    const printable = byte >= 32 && byte <= 126;
    if (printable && stringStart < 0) stringStart = index;
    if ((!printable || index === buffer.length) && stringStart >= 0) {
      if (index - stringStart >= 6) {
        const source = buffer.subarray(stringStart, index).toString("latin1");
        for (const rule of opaqueRules) {
          if (rule.test(source)) fail(`private build marker detected in ${label}`);
        }
      }
      stringStart = -1;
    }
  }
}

const dataParts = trackedFiles
  .filter((name) => /\.data\.unityweb\.part-\d+$/.test(name))
  .sort();
if (dataParts.length) {
  const compressed = Buffer.concat(
    dataParts.map((file) => readFileSync(new URL(`../${file}`, import.meta.url))),
  );
  scanOpaque(gunzipSync(compressed), "Unity data archive");
}

for (const file of trackedFiles.filter((name) => /\.(?:framework\.js|wasm)\.unityweb$/.test(name))) {
  scanOpaque(gunzipSync(readFileSync(new URL(`../${file}`, import.meta.url))), file);
}

console.log(`Privacy check passed for ${trackedFiles.length} tracked files and ${identities.length} commit(s).`);
