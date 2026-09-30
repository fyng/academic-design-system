// Figure blocks: the drawings that live inside a Markdown spec (a chart form file).
//
// A figure block is a fenced js block whose info string names the figure and its
// canvas, preceded by the image it renders to:
//
//   ![Site bubbles](out/22-body-map.main.png)
//
//   ```js figure=main w=520 h=500
//   const B = GA.bio(ga);
//   ...
//   ```
//
// The name is `main` for the figure before the first `##` heading and the slug of
// its `##` heading after that, so `22-body-map.md#region-dials` links the section
// and names the figure. The code runs inside GA.build on a w x h canvas with a
// 16 px margin, with `ga`, `GA`, `tok(name)` and `ramp(hue, steps)` in scope.
//
// Used by kit/render.cjs (draws the blocks) and tools/index.mjs (checks them).
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const MARGIN = 16;
const FENCE = /^```js figure=(\S+) w=(\d+) h=(\d+)\s*$/;
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/;

// GitHub's heading anchor: lower case, punctuation dropped, spaces to hyphens
const slug = (s) => s.trim().toLowerCase().replace(/[^\p{L}\p{N}\- ]/gu, "").replace(/ /g, "-");

// A paragraph of prose (not a list, table, image, quote or fence), joined to one line
function lead(lines, from) {
  let i = from;
  while (i < lines.length && !lines[i].trim()) i++;
  if (i >= lines.length || /^(\s*[-*|>!#]|\s*\d+\.|```)/.test(lines[i])) return "";
  const out = [];
  for (; i < lines.length && lines[i].trim(); i++) out.push(lines[i].trim());
  return out.join(" ");
}

function parse(text) {
  const lines = text.split("\n");
  const sections = [{ slug: "main", title: "", lead: "" }];
  const figures = [];
  let fence = null, lastImage = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (fence) {
      if (/^```\s*$/.test(line)) {
        if (fence.fig) figures.push({ ...fence.fig, code: fence.body.join("\n"), end: i + 1 });
        fence = null;
      } else fence.body.push(line);
      continue;
    }
    const f = line.match(FENCE);
    if (f) {
      const sec = sections.at(-1);
      fence = { body: [], fig: { variant: f[1], w: +f[2], h: +f[3], line: i + 1, section: sec.slug, sectionTitle: sec.title, image: lastImage } };
      lastImage = null;
      continue;
    }
    if (/^```/.test(line)) { fence = { body: [] }; lastImage = null; continue; }
    const h = line.match(/^(#{1,6}) (.+)$/);
    if (h) {
      if (h[1].length === 1) sections[0] = { slug: "main", title: h[2], lead: lead(lines, i + 1) };
      else if (h[1].length === 2) sections.push({ slug: slug(h[2]), title: h[2], lead: lead(lines, i + 1) });
      lastImage = null;
      continue;
    }
    const im = line.match(IMAGE);
    if (im) lastImage = { alt: im[1], path: im[2], line: i + 1 };
    else if (line.trim()) lastImage = null;
  }
  for (const fig of figures) fig.hash = hash(fig);
  return { sections, figures };
}

const hash = (fig) => crypto.createHash("sha256").update(`${fig.w}x${fig.h}\n${fig.code}`).digest("hex").slice(0, 16);

// The page a figure is drawn on. Kit files are loaded by absolute file URL, so the
// page can be written anywhere.
function page(fig, { kitDir, title = "", desc = "" }) {
  const k = (f) => "file://" + path.join(kitDir, f);
  const q = (s) => JSON.stringify(s);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title.replace(/</g, "&lt;")}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;1,400;1,500&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${k("ga-kit.css")}">
<style>body { display: block; min-height: 0; } svg.ga { width: ${fig.w}px; max-width: none; }</style>
<script src="${k("icons.js")}"></script>
<script src="${k("ga-kit.js")}"></script>
<script src="${k("anatomy.js")}"></script>
<script src="${k("ga-bio.js")}"></script>
<script src="${k("ga-charts.js")}"></script>
</head>
<body>
<script>
GA.build({ width: ${fig.w}, height: ${fig.h}, margin: ${MARGIN}, duration: 1, poster: 1, title: ${q(title)}, desc: ${q(desc)} }, (ga) => {
  const tok = (n) => getComputedStyle(document.documentElement).getPropertyValue(\`--\${n}\`).trim();
  const ramp = (h, steps) => steps.map((s) => tok(\`\${h}-\${s}\`));
${fig.code}
});
</script>
</body>
</html>
`;
}

// PNG text chunks: the renderer stamps each figure with its block's hash, so the
// index tool can tell a stale image from a current one without a browser.
function pngChunks(buf) {
  const out = [];
  for (let o = 8; o < buf.length; ) {
    const len = buf.readUInt32BE(o), type = buf.toString("latin1", o + 4, o + 8);
    out.push({ type, start: o, data: buf.subarray(o + 8, o + 8 + len) });
    o += 12 + len;
  }
  return out;
}
function stampPng(buf, key, value) {
  const data = Buffer.from(`${key}\0${value}`, "latin1");
  const type = Buffer.from("tEXt", "latin1");
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  type.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(zlib.crc32(Buffer.concat([type, data])) >>> 0, 8 + data.length);
  const ihdrEnd = 8 + 12 + buf.readUInt32BE(8);
  return Buffer.concat([buf.subarray(0, ihdrEnd), chunk, buf.subarray(ihdrEnd)]);
}
function readPngText(file, key) {
  if (!fs.existsSync(file)) return null;
  for (const c of pngChunks(fs.readFileSync(file))) {
    if (c.type !== "tEXt") continue;
    const s = c.data.toString("latin1"), z = s.indexOf("\0");
    if (s.slice(0, z) === key) return s.slice(z + 1);
  }
  return null;
}

module.exports = { MARGIN, parse, slug, hash, page, stampPng, readPngText };
