import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/sanitize-png.mjs <image.png>");

const source = readFileSync(file);
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
if (!source.subarray(0, 8).equals(signature)) throw new Error("Input is not a PNG file");

const removable = new Set(["caBX", "eXIf", "iTXt", "tEXt", "zTXt"]);
const output = [source.subarray(0, 8)];
let offset = 8;
let foundEnd = false;

while (offset + 12 <= source.length) {
  const length = source.readUInt32BE(offset);
  const end = offset + length + 12;
  if (end > source.length) throw new Error("PNG contains a truncated chunk");
  const type = source.toString("ascii", offset + 4, offset + 8);
  if (!removable.has(type)) output.push(source.subarray(offset, end));
  offset = end;
  if (type === "IEND") {
    foundEnd = true;
    break;
  }
}

if (!foundEnd) throw new Error("PNG does not contain an IEND chunk");
writeFileSync(file, Buffer.concat(output));
