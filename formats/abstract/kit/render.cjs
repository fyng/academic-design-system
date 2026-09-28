#!/usr/bin/env node
// Render a graphical abstract (HTML + CSS keyframes) to a poster PNG, an MP4
// and an animated WebP preview.
//
// Every animation on the page is paused and seeked to an exact time, so each
// frame is deterministic; the poster is simply the frame at --poster seconds.
//
//   node <design-system>/formats/abstract/kit/render.cjs precision-safety.html [--fps 30] [--poster 14.5] [--still] [--force]
//
// Output goes to an out/ folder beside the figure's HTML.
//
// Needs Playwright (global install is fine: NODE_PATH=$(npm root -g)) and an
// ffmpeg binary (FFMPEG env var, `ffmpeg` on PATH, or python's imageio-ffmpeg).
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const file = path.resolve(args.find((a) => a.endsWith(".html")));
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : dflt;
};
const stillOnly = args.includes("--still");
const slug = path.basename(file, ".html");
const outDir = path.join(path.dirname(file), "out");
fs.mkdirSync(outDir, { recursive: true });

function ffmpegBin() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return "ffmpeg";
  } catch {}
  return execFileSync("python3", ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"]).toString().trim();
}

(async () => {
  // Prefer Playwright's own browser; fall back to a preinstalled Chromium when the
  // installed Playwright expects a browser build that isn't on disk.
  const fallback = process.env.CHROME_PATH || "/opt/pw-browsers/chromium";
  const browser = await chromium.launch().catch(() => chromium.launch({ executablePath: fallback }));
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const load = async (pg) => {
    await pg.goto("file://" + file + "?render");
    await pg.evaluate(() => document.fonts.ready);
    // Kit-built figures lay themselves out after fonts load; wait for that.
    await pg.waitForFunction(() => !window.GA_KIT || window.GA_READY, null, { timeout: 15000 });
  };
  await load(page);
  const lint = await page.evaluate(() => window.GA_LINT || []);
  if (lint.length) {
    console.error(`layout check failed (${lint.length}):\n  ` + lint.join("\n  ") + "\nOpen with ?debug to see the boxes; pass --force to render anyway.");
    if (!args.includes("--force")) { await browser.close(); process.exit(1); }
  }
  const duration = opt("duration", await page.evaluate(() => window.GA_DURATION || 16));
  const poster = opt("poster", await page.evaluate(() => window.GA_POSTER || 14.5));
  const fps = opt("fps", 30);

  const seek = (t) =>
    page.evaluate((ms) => {
      for (const a of document.getAnimations()) {
        a.pause();
        a.currentTime = ms;
      }
    }, t * 1000);

  // Poster at 2x for print / retina.
  const hi = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
  await load(hi);
  await hi.evaluate((ms) => {
    for (const a of document.getAnimations()) {
      a.pause();
      a.currentTime = ms;
    }
  }, poster * 1000);
  const posterPath = path.join(outDir, `${slug}.png`);
  await hi.screenshot({ path: posterPath });
  console.log("poster ->", posterPath);
  if (stillOnly) return browser.close();

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `ga-${slug}-`));
  const n = Math.round(duration * fps);
  for (let i = 0; i < n; i++) {
    await seek(i / fps);
    await page.screenshot({ path: path.join(tmp, `f${String(i).padStart(5, "0")}.png`) });
  }
  await browser.close();

  const ff = ffmpegBin();
  const inp = ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(tmp, "f%05d.png")];
  const mp4 = path.join(outDir, `${slug}.mp4`);
  execFileSync(ff, [...inp, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", mp4]);
  console.log("video  ->", mp4);
  // VP9 WebM: fallback for browsers without H.264 (some Linux builds, test Chromium)
  const webm = path.join(outDir, `${slug}.webm`);
  execFileSync(ff, [...inp, "-c:v", "libvpx-vp9", "-pix_fmt", "yuv420p", "-b:v", "0", "-crf", "34", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", webm]);
  console.log("webm   ->", webm);
  const webp = path.join(outDir, `${slug}.webp`);
  execFileSync(ff, [...inp, "-vf", "fps=15,scale=800:-1:flags=lanczos", "-c:v", "libwebp", "-lossless", "0", "-q:v", "70", "-loop", "0", webp]);
  console.log("webp   ->", webp);
  fs.rmSync(tmp, { recursive: true, force: true });
})();
