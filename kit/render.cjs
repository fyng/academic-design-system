#!/usr/bin/env node
// Render a graphical abstract (HTML + CSS keyframes) to a poster PNG, an MP4
// and an animated WebP preview; or render the figure blocks of Markdown specs
// (chart form files) to one PNG each.
//
// Every animation on the page is paused and seeked to an exact time, so each
// frame is deterministic; the poster is simply the frame at --poster seconds.
//
//   node <design-system>/kit/render.cjs precision-safety.html [--fps 30] [--poster 14.5] [--still] [--force]
//   node <design-system>/kit/render.cjs core/charts/forms/*.md [--all] [--force]
//
// Output goes to an out/ folder beside the figure's HTML, or to the image path
// written above each figure block (kit/figures.cjs). A figure whose image already
// carries its block's hash is skipped unless --all is given (use it after a kit
// change). --force renders despite the layout check; --fit prints each drawing's
// bounds, to size a new figure's canvas.
//
// Needs Playwright (global install is fine: NODE_PATH=$(npm root -g)) and an
// ffmpeg binary (FFMPEG env var, `ffmpeg` on PATH, or python's imageio-ffmpeg);
// figure blocks need no ffmpeg.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const figures = require("./figures.cjs");

const args = process.argv.slice(2);
const mdFiles = args.filter((a) => a.endsWith(".md")).map((a) => path.resolve(a));
if (mdFiles.length) renderFigures(mdFiles).catch((e) => { console.error(e); process.exit(1); });
else renderPage();

async function renderFigures(files) {
  const all = args.includes("--all"), force = args.includes("--force");
  const fallback = process.env.CHROME_PATH || "/opt/pw-browsers/chromium";
  const browser = await chromium.launch().catch(() => chromium.launch({ executablePath: fallback }));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kare-figures-"));
  let drawn = 0, skipped = 0, failed = 0;
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const { sections, figures: figs } = figures.parse(text);
    const stem = path.basename(file, ".md");
    for (const fig of figs) {
      const out = path.join(path.dirname(file), fig.image ? fig.image.path : `out/${stem}.${fig.variant}.png`);
      const name = `${path.relative(process.cwd(), file)} figure=${fig.variant}`;
      if (!all && figures.readPngText(out, "kare-figure") === fig.hash) { skipped++; continue; }
      const title = [sections[0].title, fig.section === "main" ? "" : fig.sectionTitle].filter(Boolean).join(": ");
      const html = path.join(tmp, `${stem}.${fig.variant}.html`);
      fs.writeFileSync(html, figures.page(fig, { kitDir: __dirname, title, desc: fig.image ? fig.image.alt : "" }));
      const page = await browser.newPage({ viewport: { width: fig.w, height: fig.h }, deviceScaleFactor: 2 });
      const errs = [];
      page.on("pageerror", (e) => errs.push(e.message));
      await page.goto("file://" + html + "?render");
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => window.GA_READY || window.GA_ERROR, null, { timeout: 15000 }).catch(() => errs.push("the figure did not finish drawing"));
      const lint = await page.evaluate(() => window.GA_LINT || []);
      if (args.includes("--fit")) {
        // the drawing's bounds against the canvas, to size a new figure's w and h
        const b = await page.evaluate(() => {
          // every drawn leaf, cut to the clip paths above it
          const clipOf = (g) => {
            const r = document.getElementById(g.getAttribute("clip-path").slice(5, -1))?.querySelector("rect");
            if (!r) return null;
            const m = g.getScreenCTM(), p = (x, y) => new DOMPoint(x, y).matrixTransform(m);
            const [a, c] = [p(+r.getAttribute("x"), +r.getAttribute("y")), p(+r.getAttribute("x") + +r.getAttribute("width"), +r.getAttribute("y") + +r.getAttribute("height"))];
            return [a.x, a.y, c.x, c.y];
          };
          let box = [Infinity, Infinity, -Infinity, -Infinity];
          for (const el of document.querySelectorAll("svg.ga .ga-stage *")) {
            if (el.children.length || el.closest("defs, clipPath, title, desc")) continue;
            const r = el.getBoundingClientRect();
            if (!r.width && !r.height) continue;
            let e = [r.left, r.top, r.right, r.bottom];
            for (let g = el.closest("[clip-path]"); g; g = g.parentElement?.closest("[clip-path]")) {
              const c = clipOf(g);
              if (c) e = [Math.max(e[0], c[0]), Math.max(e[1], c[1]), Math.min(e[2], c[2]), Math.min(e[3], c[3])];
            }
            if (e[2] <= e[0] || e[3] <= e[1]) continue;
            box = [Math.min(box[0], e[0]), Math.min(box[1], e[1]), Math.max(box[2], e[2]), Math.max(box[3], e[3])];
          }
          return [Math.floor(box[0]), Math.floor(box[1]), Math.ceil(box[2]), Math.ceil(box[3])];
        });
        const m = figures.MARGIN, dx = Math.max(0, m - b[0]), dy = Math.max(0, m - b[1]);
        console.log(`${name}: drawing spans x ${b[0]}..${b[2]}, y ${b[1]}..${b[3]}; fits w=${b[2] + m + dx} h=${b[3] + m + dy}${dx || dy ? ` after moving it by (${dx}, ${dy})` : ""}`);
      }
      if (errs.length || (lint.length && !force)) {
        console.error(`${name}: ${[...errs, ...lint].join("\n  ")}\n  open ${html}?debug to see the boxes`);
        failed++;
        await page.close();
        continue;
      }
      await page.evaluate(() => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = 1e6; } });
      const png = await page.screenshot({ clip: { x: 0, y: 0, width: fig.w, height: fig.h } });
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, figures.stampPng(png, "kare-figure", fig.hash));
      console.log("figure ->", path.relative(process.cwd(), out));
      drawn++;
      await page.close();
    }
  }
  await browser.close();
  console.log(`${drawn} drawn, ${skipped} up to date${failed ? `, ${failed} failed` : ""}`);
  if (failed) process.exit(1);
}

function renderPage() {
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
}
