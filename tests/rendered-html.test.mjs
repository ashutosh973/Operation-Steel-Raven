import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const escapedBasePath = basePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("exports the final Operation Steel Raven homepage", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

  assert.match(html, /<title>Operation Steel Raven<\/title>/i);
  assert.match(html, /Enter the[\s\S]*Black Pines/i);
  assert.match(html, /Mission 01/i);
  assert.match(html, new RegExp(`href="${escapedBasePath}\\/play\\/"`, "i"));
  assert.match(html, /fictional Korona Corridor/i);
  assert.match(html, /not real/i);
  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape/i);
});

test("exports the Mission 1 deployment route", async () => {
  const html = await readFile(new URL("../out/play/index.html", import.meta.url), "utf8");

  assert.match(html, /<title>Play Mission 1 · Operation Steel Raven<\/title>/i);
  assert.match(html, /Stand by, Raven/i);
  assert.match(html, /role="status"/i);
  assert.match(html, /Mouse &amp; keyboard \/ controller/i);
  assert.match(html, /Fictional setting/i);
});

test("contains only the dependencies and source needed by the game portal", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Operation Steel Raven/);
  assert.match(page, /href="\/play"/);
  assert.match(layout, /export const metadata/);
  assert.match(layout, /operation-steel-raven-x-live-thumbnail\.png/);
  assert.doesNotMatch(page, /SkeletonPreview/);
  assert.doesNotMatch(layout, /SkeletonPreview|next\/headers/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|drizzle|tailwind|react-loading-skeleton/);
});

test("publishes a clear evaluation and third-party content policy", async () => {
  const [license, notices, readme, packageSource] = await Promise.all([
    readFile(new URL("../LICENSE", import.meta.url), "utf8"),
    readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(license, /EVALUATION LICENSE/i);
  assert.match(license, /All rights reserved/i);
  assert.match(license, /personal, non-commercial evaluation/i);
  assert.match(notices, /Unity WebGL runtime/i);
  assert.match(notices, /respective licenses and terms/i);
  assert.match(readme, /THIRD_PARTY_NOTICES\.md/);
  const packageMetadata = JSON.parse(packageSource);
  assert.equal(packageMetadata.license, "UNLICENSED");
  assert.equal(
    packageMetadata.repository.url,
    "git+https://github.com/ashutosh973/Operation-Steel-Raven.git",
  );
  assert.equal(packageMetadata.homepage, "https://ashutosh973.github.io/Operation-Steel-Raven/");
});

test("ships a complete Unity Mission 1 browser package", async () => {
  const [manifestSource, gameHtml, buildFiles] = await Promise.all([
    readFile(new URL("../public/game/manifest.json", import.meta.url), "utf8"),
    readFile(new URL("../public/game/index.html", import.meta.url), "utf8"),
    readdir(new URL("../public/game/Build/", import.meta.url)),
  ]);

  const manifest = JSON.parse(manifestSource);
  assert.equal(manifest.mission, "border-crossing");
  assert.equal(manifest.platform, "webgl");
  assert.equal(manifest.entry, "./index.html");
  assert.ok(manifest.dataParts >= 4);

  const requiredBuildFiles = [
    /\.loader\.js$/,
    /\.framework\.js\.unityweb$/,
    /\.wasm\.unityweb$/,
  ];
  for (const pattern of requiredBuildFiles) {
    const file = buildFiles.find((candidate) => pattern.test(candidate));
    assert.ok(file, `Missing Unity build file matching ${pattern}`);
    assert.match(gameHtml, new RegExp(file.replaceAll(".", "\\.")));
  }

  const dataParts = buildFiles
    .filter((candidate) => /\.data\.unityweb\.part-\d+$/.test(candidate))
    .sort();
  assert.equal(dataParts.length, manifest.dataParts);
  const partStats = await Promise.all(
    dataParts.map((file) => stat(new URL(`../public/game/Build/${file}`, import.meta.url))),
  );
  for (const [index, file] of dataParts.entries()) {
    assert.match(gameHtml, new RegExp(file.replaceAll(".", "\\.")));
    assert.ok(partStats[index].size < 40 * 1024 * 1024, `${file} is too large for Git hosting`);
  }
  assert.ok(partStats.reduce((total, item) => total + item.size, 0) > 100 * 1024 * 1024);

  await Promise.all([
    access(new URL("../out/game/index.html", import.meta.url)),
    ...dataParts.map((file) => access(new URL(`../out/game/Build/${file}`, import.meta.url))),
  ]);
});

test("exports one privacy-first analytics bridge", async () => {
  const [layout, launcher, analyticsClient, gameHtml, privacyHtml] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/play/GameLauncher.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/analytics/client.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/game/index.html", import.meta.url), "utf8"),
    readFile(new URL("../out/privacy/index.html", import.meta.url), "utf8"),
  ]);

  assert.equal((layout.match(/<AnalyticsProvider \/>/g) ?? []).length, 1);
  assert.match(analyticsClient, /NEXT_PUBLIC_PLAUSIBLE_DOMAIN/);
  assert.match(analyticsClient, /globalPrivacyControl/);
  assert.match(analyticsClient, /doNotTrack/);
  assert.doesNotMatch(analyticsClient, /localStorage|sessionStorage|document\.cookie/);

  assert.match(launcher, /message\.origin !== window\.location\.origin/);
  assert.match(launcher, /message\.source !== iframeRef\.current\?\.contentWindow/);
  assert.match(launcher, /trackAnalyticsEvent\("launch_clicked"/);
  assert.match(gameHtml, /postMessage\(message, window\.location\.origin\)/);
  assert.doesNotMatch(gameHtml, /postMessage\([^\n]+,\s*["']\*["']/);
  assert.match(gameHtml, /\.then\(\(unityInstance\) => \{[\s\S]*reportUnityLoaded\(\)/);
  assert.match(gameHtml, /queuedAnalyticsEvents/);
  assert.match(privacyHtml, /Anonymous, minimal measurement/i);
});
