// Writes INDEX.md and checks that the repo agrees with itself.
//
//   node tools/index.mjs           -> writes INDEX.md; exits 1 if a check fails
//   node tools/index.mjs --check   -> writes nothing; also fails if INDEX.md is stale
//
// Checks: every chart form file has valid front matter, a name of 1-3 words that
// matches its file name, a family from the table in core/charts/README.md that lists
// it, jobs that match the choosing table both ways, kit calls that exist in kit/, and
// see_also ids that exist and link both ways; every figure block is named for its
// section and has its rendered, current image; every contact sheet is current; every
// path written in backticks or linked in a doc resolves; every kit specimen has its
// rendered PNG.
import { writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { root, read, figures, formDir, chartsReadme, readForms, readFamilies } from "./forms.mjs";
import { sheetDir, sheetPath, cards, sheetHash } from "./sheets.mjs";

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

function walk(dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    if (name.startsWith(".") || name === "node_modules" || name === "fonts") continue;
    const p = dir ? `${dir}/${name}` : name;
    if (statSync(join(root, p)).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const files = walk("");
const docs = files.filter((f) => f.endsWith(".md") && f !== "INDEX.md");

// ---- chart forms ----------------------------------------------------------------
const KINDS = ["chart"];
const families = readFamilies();
const kitSrc = files.filter((f) => f.startsWith("kit/") && f.endsWith(".js")).map(read).join("\n");
// ch.hbars -> `ch.hbars = (`; GA.radial -> `GA.radial = `; GA.bio.body -> `B.body = `
const kitDefined = (call) => {
  const parts = call.split(".");
  const name = parts.pop();
  const owner = parts.join(".") === "GA.bio" ? "B" : parts.join(".");
  return new RegExp(`\\b${owner.replace(".", "\\.")}\\.${name}\\s*=`).test(kitSrc);
};
const slugOf = (n, name) => `${n}-${name.toLowerCase().replace(/ vs /g, "-").replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`;

// "Choosing the form" in core/charts/README.md: | The data's job | Form, linked |
const choosing = (() => {
  const text = read(chartsReadme), i = text.indexOf("## Choosing the form");
  const sec = text.slice(i, text.indexOf("\n## ", i + 3));
  return [...sec.matchAll(/^\| (.+?) \| (.+) \|$/gm)]
    .map(([, job, cell]) => ({ job, forms: [...cell.matchAll(/\]\(forms\/(\d\d)-/g)].map((m) => `form-${m[1]}`) }))
    .filter((r) => r.forms.length);
})();

const forms = readForms(fail).map((f) => {
  const { file, n, text } = f;
  if (f.id !== `form-${n}`) fail(file, `id is "${f.id}", expected "form-${n}"`);
  for (const k of ["id", "name", "kind", "family", "job", "kit"]) if (f[k] === undefined) fail(file, `front matter lacks "${k}"`);
  if (f.name) {
    const words = f.name.split(/\s+/).length;
    if (words > 3) fail(file, `name "${f.name}" has ${words} words; use 1-3`);
    if (f.stem !== slugOf(n, f.name)) fail(file, `file name should be ${slugOf(n, f.name)}.md for "${f.name}"`);
    if (!text.includes(`\n# ${n} · ${f.name}\n`)) fail(file, `heading should be "# ${n} · ${f.name}"`);
  }
  if (f.kind && !KINDS.includes(f.kind)) fail(file, `unknown kind "${f.kind}" (${KINDS.join(", ")})`);
  const fam = families.find((x) => x.id === f.family);
  if (f.family && !fam) fail(file, `unknown family "${f.family}" (${families.map((x) => x.id).join(", ")}; the table in ${chartsReadme})`);
  else if (fam && !fam.files.includes(file)) fail(chartsReadme, `family ${f.family} does not list ${basename(file)}`);
  for (const s of f.specimens || []) if (!existsSync(join(root, s))) fail(file, `specimen ${s} does not exist`);
  for (const c of f.kit || []) if (!kitDefined(c)) fail(file, `kit call ${c} is not defined in kit/`);
  for (const j of f.job || []) if (!choosing.some((r) => r.job === j && r.forms.includes(f.id))) fail(file, `job "${j}" is not a row of *Choosing the form* that links ${f.id}`);
  // figures: named for their section, each with its current image
  const seen = new Set();
  for (const fig of f.figures) {
    const where = `${file}:${fig.line}`, img = `out/${f.stem}.${fig.variant}.png`;
    if (fig.variant !== fig.section) fail(where, `figure=${fig.variant} should be figure=${fig.section}, the slug of its section`);
    if (seen.has(fig.variant)) fail(where, `a second figure=${fig.variant}`);
    seen.add(fig.variant);
    if (!fig.image) { fail(where, `put the image above the block: ![…](${img})`); continue; }
    if (fig.image.path !== img) fail(where, `image should be ${img}`);
    const png = join(root, dirname(file), fig.image.path);
    if (!existsSync(png)) fail(where, `has no rendered ${fig.image.path} (node kit/render.cjs ${file})`);
    else if (figures.readPngText(png, "kare-figure") !== fig.hash) fail(where, `${fig.image.path} is stale (node kit/render.cjs ${file})`);
  }
  if (!f.figures.length && !(f.specimens || []).length) fail(file, "has neither a figure block nor a specimen");
  return f;
});
const ids = new Set(forms.map((f) => f.id));
forms.forEach((f, i) => {
  if (Number(f.n) !== i + 1) fail(f.file, `form numbers should run 01, 02, … without gaps; found ${f.n} at position ${i + 1}`);
  for (const s of f.see_also || []) if (!ids.has(s)) fail(f.file, `see_also ${s} is not a form`);
});
// see_also runs both ways: a form that points at another is pointed back at
const byId = new Map(forms.map((f) => [f.id, f]));
for (const f of forms) for (const s of f.see_also || []) {
  const g = byId.get(s);
  if (g && !(g.see_also || []).includes(f.id)) fail(g.file, `see_also lacks ${f.id}, which lists ${g.id}`);
}
// every row of the choosing table is a job of each form it links
for (const r of choosing) for (const id of r.forms) {
  const f = byId.get(id);
  if (f && !(f.job || []).includes(r.job)) fail(f.file, `job lacks "${r.job}", which *Choosing the form* links to ${id}`);
}
for (const fam of families) for (const file of fam.files) if (!forms.some((f) => f.file === file && f.family === fam.id)) fail(chartsReadme, `family ${fam.id} lists ${basename(file)}, which is not in that family`);
// every image in the forms' out/ folder belongs to a figure block
const drawn = new Set(forms.flatMap((f) => f.figures.filter((g) => g.image).map((g) => join(dirname(f.file), g.image.path))));
for (const p of files.filter((p) => p.startsWith(`${formDir}/out/`))) if (!drawn.has(p)) fail(p, "belongs to no figure block; delete it");

// ---- contact sheets -------------------------------------------------------------
const sheets = families.map((fam) => ({ fam, cs: cards(fam, forms), path: sheetPath(fam.id) })).filter((s) => s.cs.length);
for (const s of sheets) {
  if (!existsSync(join(root, s.path))) fail(s.path, "is missing (node tools/sheets.mjs)");
  else if (figures.readPngText(join(root, s.path), "kare-sheet") !== sheetHash(s.fam, s.cs)) fail(s.path, "is stale (node tools/sheets.mjs)");
}
for (const p of files.filter((p) => p.startsWith(`${sheetDir}/`))) if (!sheets.some((s) => s.path === p)) fail(p, "is not a contact sheet of any family; delete it");

// ---- paths in docs ------------------------------------------------------------------
// Paths that live in a consuming project, not here.
const CONSUMER = /^(design-system\/|\.\.\/design-system\/|_sass\/|_config\.yml|assets\/|graphical_abstracts\/|panels\/|out\/<|<)/;
// A path is written with a slash; a bare file name ("fig.typ") is named in the
// context of a folder the sentence already gives. NN marks a placeholder.
const looksLikePath = (s) =>
  s.replace(/\/$/, "").includes("/") && !/\s|\*|<|>|NN|^https?:|^#|^--|^\$|^~|^@/.test(s) &&
  (/\.(md|html|js|cjs|mjs|css|scss|json|typ|png|pdf|svg|ttf)$/.test(s) || /\/$/.test(s));
function resolves(from, p) {
  const clean = p.replace(/#.*$/, "");
  if (!clean || basename(clean) === "INDEX.md") return true; // INDEX.md is written below
  return [join(root, dirname(from), clean), join(root, clean)].some((c) => existsSync(c));
}
for (const doc of docs) {
  const text = read(doc).replace(/```[\s\S]*?```/g, "");
  const seen = new Set();
  for (const [, p] of text.matchAll(/`([^`\n]+)`/g)) if (looksLikePath(p)) seen.add(p);
  for (const [, p] of text.matchAll(/\]\(([^)\s]+)\)/g)) if (!/^https?:|^#|^mailto:/.test(p)) seen.add(p.replace(/^<|>$/g, ""));
  for (const p of seen) {
    if (CONSUMER.test(p)) continue;
    if (!resolves(doc, p)) fail(doc, `path does not resolve: ${p}`);
  }
}

// ---- INDEX.md ---------------------------------------------------------------------
const title = (f) => (read(f).replace(/^---\n[\s\S]*?\n---\n/, "").match(/^# (.+)$/m) || [, ""])[1];
const code = (s) => "`" + s + "`";
const link = (p, text = p) => `[${text}](${p})`;
const L = [];
L.push("# Index", "");
L.push("GENERATED by `tools/index.mjs` (`npm run check`). Edit the files it lists, not this one.", "");
L.push("## Docs", "", "| File | Title |", "|---|---|");
for (const d of docs.filter((d) => !d.startsWith(formDir + "/"))) L.push(`| ${link(d)} | ${title(d)} |`);
L.push("", "## Chart forms", "");
L.push(`${forms.length} forms, one file each in ${code(formDir + "/")}, each drawing its figures (${link("core/charts/README.md#figures", "*Figures*")}). Grammar and choosing a form: ${link("core/charts/README.md")}.`, "");
L.push("| Form | Family | File | Figures | Kit |", "|---|---|---|---|---|");
const figLinks = (f) => [
  ...f.figures.filter((g) => g.image).map((g) => link(join(dirname(f.file), g.image.path), g.variant)),
  ...(f.specimens || []).map((s) => code(basename(s))),
].join(", ");
for (const f of forms)
  L.push(`| ${f.n} · ${f.name} | ${f.family} | ${link(f.file, basename(f.file))} | ${figLinks(f)} | ${(f.kit || []).map(code).join(", ") || "–"} |`);
L.push("", "### By family", "", "| Family | Forms | Contact sheet |", "|---|---|---|");
for (const fam of families) {
  const sh = sheets.find((s) => s.fam === fam);
  L.push(`| ${fam.label} (${code(fam.id)}) | ${forms.filter((f) => f.family === fam.id).map((f) => `${f.n} ${f.name}`).join(", ")} | ${sh ? link(sh.path, basename(sh.path)) : "–"} |`);
}
const specimens = files.filter((f) => /(^|\/)specimen-[^/]*\.(html|typ)$/.test(f)).sort();
const kitSpecimens = specimens.filter((f) => f.endsWith(".html") && !f.startsWith("formats/web/"));
for (const s of kitSpecimens) {
  const png = `${dirname(s)}/out/${basename(s, ".html")}.png`;
  if (!existsSync(join(root, png))) fail(s, `has no rendered ${png} (node kit/render.cjs ${s} --still)`);
}
const outputs = (s) => {
  const base = `${dirname(s)}/out/${basename(s).replace(/\.(html|typ)$/, "")}`;
  return [".png", ".pdf"].map((x) => base + x).filter((p) => existsSync(join(root, p)));
};
L.push("", "## Specimens", "", "| Source | Output | Forms |", "|---|---|---|");
for (const s of specimens) {
  const drawnBy = forms.filter((f) => (f.specimens || []).includes(s)).map((f) => f.n);
  L.push(`| ${link(s)} | ${outputs(s).map((o) => link(o, basename(o))).join(", ") || "–"} | ${drawnBy.join(", ") || "–"} |`);
}
L.push("", "## Code", "", "| File | What |", "|---|---|");
const head = (f) => {
  const t = read(f).split("\n").find((l) => /^\s*(\/\/|\/\*|\*)/.test(l) && /\w/.test(l)) || "";
  return t.replace(/^\s*(\/\/+|\/\*+|\*+)\s*/, "").replace(/\*\/\s*$/, "").replace(/\|/g, "\\|").trim();
};
for (const f of files.filter((f) => /\.(js|cjs|mjs|css|scss|typ)$/.test(f) && !/specimen-/.test(f) && f !== "core/tokens.css")) L.push(`| ${link(f)} | ${head(f)} |`);
L.push("");
const index = L.join("\n");

const check = process.argv.includes("--check");
if (check) {
  const cur = existsSync(join(root, "INDEX.md")) ? read("INDEX.md") : "";
  if (cur !== index) fail("INDEX.md", "is out of date; run node tools/index.mjs");
} else writeFileSync(join(root, "INDEX.md"), index);

if (errors.length) {
  console.error(`${errors.length} problem(s):\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`${check ? "checked" : "wrote INDEX.md;"} ${forms.length} forms, ${docs.length} docs, ${specimens.length} specimens: all consistent`);
