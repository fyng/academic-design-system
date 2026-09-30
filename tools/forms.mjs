// Reads the chart forms: front matter, figure blocks and the families they belong to.
// Shared by tools/index.mjs (checks and INDEX.md) and tools/sheets.mjs (contact sheets).
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const read = (p) => readFileSync(join(root, p), "utf8");
export const figures = createRequire(import.meta.url)("../kit/figures.cjs");
export const formDir = "core/charts/forms";
export const chartsReadme = "core/charts/README.md";

// Flat front matter: `key: value` or `key: [a, "b, c"]`, one per line
export function frontMatter(text, fail = () => {}) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return fail("no front matter"), {};
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) { fail(`unreadable front matter line: ${line}`); continue; }
    const v = kv[2].trim();
    fm[kv[1]] = v.startsWith("[")
      ? v.slice(1, -1).match(/"(?:[^"\\]|\\.)*"|[^,\s][^,]*/g)?.map((s) => (s.startsWith('"') ? JSON.parse(s) : s.trim())) ?? []
      : v;
  }
  return fm;
}

// The families, in order, from the "Forms by family" table of core/charts/README.md:
// | Comparison (`comparison`) | [01 · Ranked bars](forms/01-ranked-bars.md), … |
export function readFamilies() {
  const text = read(chartsReadme);
  const sec = text.slice(text.indexOf("## Forms by family"));
  const rows = [...sec.slice(0, sec.indexOf("\n## ", 3) >>> 0).matchAll(/^\| (.+?) \(`(\w+)`\) \| (.*) \|$/gm)];
  return rows.map(([, label, id, cell]) => ({ id, label, files: [...cell.matchAll(/\]\(forms\/([^)]+)\)/g)].map((m) => `${formDir}/${m[1]}`) }));
}

// Every form file, sorted, with its front matter and figure blocks
export function readForms(fail = () => {}) {
  return readdirSync(join(root, formDir))
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((name) => {
      const file = `${formDir}/${name}`, text = read(file);
      const fm = frontMatter(text, (msg) => fail(file, msg));
      const { sections, figures: figs } = figures.parse(text);
      return { n: name.slice(0, 2), file, stem: basename(name, ".md"), text, sections, figures: figs, ...fm };
    });
}
