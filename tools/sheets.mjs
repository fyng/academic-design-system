// Writes the contact sheets: one PNG per chart family, core/charts/out/sheet-<family>.png,
// laying out every figure of the family's forms with its name and its section's lead
// paragraph as the caption. The sheets are composed from the figures' PNGs, so render
// those first (node kit/render.cjs core/charts/forms/*.md).
//
//   node tools/sheets.mjs          -> writes the sheets whose inputs changed
//   node tools/sheets.mjs --all    -> writes every sheet
//
// Each sheet carries a hash of its inputs, which tools/index.mjs checks.
import { writeFileSync, mkdirSync, mkdtempSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { root, figures, readForms, readFamilies } from "./forms.mjs";

export const sheetDir = "core/charts/out";
export const sheetPath = (family) => `${sheetDir}/sheet-${family}.png`;

// The cards of a family's sheet, in form order: label, image, size and caption
export function cards(family, forms) {
  const out = [];
  for (const f of forms.filter((f) => f.family === family.id))
    for (const fig of f.figures) {
      const sec = f.sections.find((s) => s.slug === fig.section);
      out.push({
        label: `${f.n} · ${f.name}${fig.section === "main" ? "" : ` · ${sec.title}`}`,
        image: join(dirname(f.file), fig.image ? fig.image.path : `out/${f.stem}.${fig.variant}.png`),
        w: fig.w, h: fig.h, hash: fig.hash,
        caption: sec.lead.replace(/`([^`]+)`/g, "$1"),
      });
    }
  return out;
}
export const sheetHash = (family, cs) =>
  createHash("sha256").update(JSON.stringify([family.label, cs.map((c) => [c.label, c.hash, c.caption])])).digest("hex").slice(0, 16);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
// *italic* as the docs write it
const inline = (s) => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");

function page(family, cs) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="file://${join(root, "core/tokens.css")}">
<style>
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--font-text); }
  .sheet { width: 1472px; padding: 40px 64px 56px; }
  .kicker { font-size: 13px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
  h1 { font-size: 34px; font-weight: 500; letter-spacing: -.015em; margin: 8px 0 22px; }
  hr { border: 0; border-top: 1.5px solid var(--rule); margin: 0 0 28px; }
  .cards { display: flex; flex-wrap: wrap; gap: 36px 48px; align-items: flex-start; }
  .card { display: flex; flex-direction: column; gap: 8px; }
  .label { font-size: 13px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--prussian); }
  .card img { display: block; }
  .cap { font-size: 14px; line-height: 1.35; color: var(--muted); max-width: 100%; }
</style>
</head>
<body>
<div class="sheet">
  <div class="kicker">kare · chart forms · synthetic data</div>
  <h1>${esc(family.label)}</h1>
  <hr>
  <div class="cards">
${cs.map((c) => `    <div class="card" style="width:${Math.max(c.w, 300)}px">
      <div class="label">${esc(c.label)}</div>
      <img src="file://${join(root, c.image)}" width="${c.w}" height="${c.h}">
      <div class="cap">${inline(c.caption)}</div>
    </div>`).join("\n")}
  </div>
</div>
</body>
</html>
`;
}

async function main() {
  const all = process.argv.includes("--all");
  const forms = readForms();
  const jobs = [];
  for (const family of readFamilies()) {
    const cs = cards(family, forms);
    if (!cs.length) continue;
    const missing = cs.filter((c) => !existsSync(join(root, c.image)));
    if (missing.length) throw new Error(`${family.id}: render the figures first: ${missing.map((c) => c.image).join(", ")}`);
    const hash = sheetHash(family, cs), out = sheetPath(family.id);
    if (!all && figures.readPngText(join(root, out), "kare-sheet") === hash) continue;
    jobs.push({ family, cs, hash, out });
  }
  if (!jobs.length) return console.log("contact sheets up to date");
  const { chromium } = createRequire(import.meta.url)("playwright");
  const browser = await chromium.launch();
  const tmp = mkdtempSync(join(tmpdir(), "kare-sheets-"));
  mkdirSync(join(root, sheetDir), { recursive: true });
  for (const { family, cs, hash, out } of jobs) {
    const html = join(tmp, `sheet-${family.id}.html`);
    writeFileSync(html, page(family, cs));
    const p = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
    await p.goto("file://" + html);
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
    const png = await p.locator(".sheet").screenshot();
    writeFileSync(join(root, out), figures.stampPng(png, "kare-sheet", hash));
    console.log("sheet ->", out);
    await p.close();
  }
  await browser.close();
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
