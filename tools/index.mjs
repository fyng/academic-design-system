// Writes INDEX.md and checks that the repo agrees with itself.
//
//   node tools/index.mjs           -> writes INDEX.md; exits 1 if a check fails
//   node tools/index.mjs --check   -> writes nothing; also fails if INDEX.md is stale
//
// Checks: every chart form file has valid front matter, a name of 1-3 words that
// matches its file name, existing specimens, kit calls that exist in kit/, and
// see_also ids that exist and link both ways; every path written in backticks or linked in a doc
// resolves; every kit specimen has its rendered PNG.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => relative(root, p).split("\\").join("/");
const read = (p) => readFileSync(join(root, p), "utf8");
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
const FAMILIES = {
  comparison: "Comparison",
  distribution: "Distribution",
  response: "Response and models",
  time: "Time and clinical course",
  matrix: "Matrices",
  composition: "Composition",
  embedding: "Embedding",
  anatomy: "Anatomy and phylogeny",
};
const kitSrc = files.filter((f) => f.startsWith("kit/") && f.endsWith(".js")).map(read).join("\n");
// ch.hbars -> `ch.hbars = (`; GA.radial -> `GA.radial = `; GA.bio.body -> `B.body = `
const kitDefined = (call) => {
  const parts = call.split(".");
  const name = parts.pop();
  const owner = parts.join(".") === "GA.bio" ? "B" : parts.join(".");
  return new RegExp(`\\b${owner.replace(".", "\\.")}\\.${name}\\s*=`).test(kitSrc);
};
const slugOf = (n, name) => `${n}-${name.toLowerCase().replace(/ vs /g, "-").replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`;

function frontMatter(text, where) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return fail(where, "no front matter"), {};
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) { fail(where, `unreadable front matter line: ${line}`); continue; }
    const v = kv[2].trim();
    fm[kv[1]] = v.startsWith("[")
      ? v.slice(1, -1).match(/"(?:[^"\\]|\\.)*"|[^,\s][^,]*/g)?.map((s) => (s.startsWith('"') ? JSON.parse(s) : s.trim())) ?? []
      : v;
  }
  return fm;
}

const formDir = "core/charts/forms";
const forms = files
  .filter((f) => f.startsWith(formDir + "/"))
  .sort()
  .map((file) => {
    const text = read(file);
    const fm = frontMatter(text, file);
    const n = basename(file).slice(0, 2);
    if (fm.id !== `form-${n}`) fail(file, `id is "${fm.id}", expected "form-${n}"`);
    for (const k of ["id", "name", "family", "specimens", "kit"]) if (fm[k] === undefined) fail(file, `front matter lacks "${k}"`);
    if (fm.name) {
      const words = fm.name.split(/\s+/).length;
      if (words > 3) fail(file, `name "${fm.name}" has ${words} words; use 1-3`);
      if (basename(file, ".md") !== slugOf(n, fm.name)) fail(file, `file name should be ${slugOf(n, fm.name)}.md for "${fm.name}"`);
      if (!text.includes(`\n# ${n} · ${fm.name}\n`)) fail(file, `heading should be "# ${n} · ${fm.name}"`);
    }
    if (fm.family && !FAMILIES[fm.family]) fail(file, `unknown family "${fm.family}" (${Object.keys(FAMILIES).join(", ")})`);
    for (const s of fm.specimens || []) if (!existsSync(join(root, s))) fail(file, `specimen ${s} does not exist`);
    for (const c of fm.kit || []) if (!kitDefined(c)) fail(file, `kit call ${c} is not defined in kit/`);
    return { n, file, ...fm };
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

// ---- specimens --------------------------------------------------------------------
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
L.push(`${forms.length} forms, one file each in ${code(formDir + "/")}. Grammar and choosing a form: ${link("core/charts/README.md")}.`, "");
L.push("| Form | Family | File | Specimens | Kit |", "|---|---|---|---|---|");
for (const f of forms)
  L.push(`| ${f.n} · ${f.name} | ${f.family} | ${link(f.file, basename(f.file))} | ${(f.specimens || []).map((s) => code(basename(s))).join(", ")} | ${(f.kit || []).map(code).join(", ") || "–"} |`);
L.push("", "### By family", "", "| Family | Forms |", "|---|---|");
for (const [k, v] of Object.entries(FAMILIES)) L.push(`| ${v} (${code(k)}) | ${forms.filter((f) => f.family === k).map((f) => `${f.n} ${f.name}`).join(", ")} |`);
L.push("", "## Specimens", "", "| Source | Output | Forms |", "|---|---|---|");
for (const s of specimens) {
  const drawn = forms.filter((f) => (f.specimens || []).includes(s)).map((f) => f.n);
  L.push(`| ${link(s)} | ${outputs(s).map((o) => link(o, basename(o))).join(", ") || "–"} | ${drawn.join(", ") || "–"} |`);
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
