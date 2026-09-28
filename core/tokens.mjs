// Lamina design tokens: the one source for every colour and type value.
//
//   node core/tokens.mjs      -> writes tokens.css and tokens.json beside it
//
// Ramps are generated in OKLCH so every hue shares the same lightness steps:
// step 500 of any hue is as light as step 500 of any other. Edit the tables
// below, re-run, then re-validate (see color.md, "Validation").
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

// ---- OKLCH -> sRGB hex, reducing chroma until the colour is in gamut ----------
const toS = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function oklchToLinear(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
function hex(L, C, h) {
  for (let c = C; c >= 0; c -= 0.002) {
    const rgb = oklchToLinear(L, c, h);
    if (rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4))
      return "#" + rgb.map((v) => Math.round(Math.min(1, Math.max(0, toS(Math.max(0, v)))) * 255).toString(16).padStart(2, "0")).join("");
  }
}

// ---- ramps -------------------------------------------------------------------
// hue angle and peak chroma per family; chroma tapers toward the light and dark ends
const HUES = {
  blue: [255, 0.15],
  vermilion: [35, 0.17],
  teal: [190, 0.11],
  ochre: [78, 0.14],
  violet: [305, 0.15],
  moss: [135, 0.13],
  rose: [355, 0.15],
  slate: [250, 0.025],
};
const STEPS = { 100: 0.96, 200: 0.9, 300: 0.82, 400: 0.72, 500: 0.62, 600: 0.52, 700: 0.42, 800: 0.32, 900: 0.24 };
const ramps = {};
for (const [name, [h, peak]] of Object.entries(HUES)) {
  ramps[name] = {};
  // washes (L >= .9) get extra taper so pale tints stay quiet
  for (const [step, L] of Object.entries(STEPS)) ramps[name][step] = hex(L, peak * (1 - ((L - 0.6) / 0.42) ** 2 * 0.75) * (L >= 0.9 ? 0.6 : 1), h);
}
const r = (ref) => { const [n, s] = ref.split("."); return ramps[n][s]; };

// ---- neutrals (fixed, not generated) ----------------------------------------------
const neutral = {
  paper: "#ffffff",
  ink: "#16181d", //      17.9:1  titles, body
  "ink-2": "#4a4e58", //   8.3:1  labels
  muted: "#6b707b", //     5.0:1  captions, ticks: the lightest text allowed
  context: "#a3a8b1", //   2.4:1  de-emphasised data marks; never text
  rule: "#d9dbe0", //             hairlines, axes, dividers
  wash: "#f4f5f7", //             panel and box fills
  prussian: "#1f4e79", //  8.7:1  structural ink: step numbers, methods boxes, arrows
};

// ---- categorical: fixed order, chosen by enumeration (see color.md) --------------
const categorical = ["blue.600", "ochre.500", "teal.500", "vermilion.500", "violet.500", "moss.500", "rose.500"];

// ---- semantic roles --------------------------------------------------------------
const semantic = {
  // valence: the data carry a judgement
  harm: "vermilion.500",
  "harm-text": "vermilion.600",
  "harm-wash": "vermilion.100",
  benefit: "blue.600",
  "benefit-text": "blue.700",
  "benefit-wash": "blue.100",
  // emphasis: the one thing to look at. Defaults to harm-family; see color.md
  accent: "vermilion.500",
  "accent-text": "vermilion.600",
  "accent-wash": "vermilion.100",
  // magnitude without judgement
  quantity: "teal.500",
  "quantity-wash": "teal.100",
};

// sequential ramps (continuous: 100-900; ordinal/discrete: 400-800)
const sequential = { quantity: "teal", harm: "vermilion", benefit: "blue" };
// diverging: [negative arm, positive arm]; midpoint is always the neutral wash
const diverging = { valence: ["blue", "vermilion"], direction: ["violet", "ochre"] };

// ---- entity registry: colour follows the entity across every figure --------------
const entity = {
  organ: { lungs: "blue.600", liver: "ochre.500", colon: "teal.500", adrenal: "vermilion.500", thyroid: "violet.500", kidney: "moss.500", skin: "rose.500" },
};

// ---- family palettes: members of one kind drawn from one hue band ------------------
// [L, C, h] in OKLCH. Chosen by search over the blue-violet-magenta band (265-335)
// for the widest CVD separation at >= 3:1 on paper (see color.md, "Family palettes").
// Each member also gets a tint (62 % toward paper, 40 % chroma) for fills such as
// cytoplasm, so tints keep the members apart too.
const family = {
  cell: [[0.44, 0.148, 275], [0.64, 0.159, 265], [0.6, 0.16, 335], [0.4, 0.142, 335]],
};

// ---- type ------------------------------------------------------------------------------
// One family: IBM Plex. Sans for every role; Mono only for literal codes (tag role).
const font = {
  text: '"IBM Plex Sans", system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
};

// ---- emit ----------------------------------------------------------------------------
const css = [];
const line = (k, v, note = "") => css.push(`  --${k}: ${v};${note ? ` /* ${note} */` : ""}`);
css.push("/* GENERATED by core/tokens.mjs. Edit that file, not this one. */", ":root {");
for (const [k, v] of Object.entries(font)) line(`font-${k}`, v);
css.push("");
for (const [k, v] of Object.entries(neutral)) line(k, v);
css.push("");
for (const [n, steps] of Object.entries(ramps)) {
  for (const [s, v] of Object.entries(steps)) line(`${n}-${s}`, v);
}
css.push("");
categorical.forEach((ref, i) => line(`cat-${i + 1}`, r(ref), ref));
// text-safe step (>= 5:1 on paper) for direct labels in the series hue
categorical.forEach((ref, i) => line(`cat-${i + 1}-text`, r(ref.replace(/\.\d+$/, ".600"))));
css.push("");
for (const [k, ref] of Object.entries(semantic)) line(k, r(ref), ref);
css.push("");
for (const [group, map] of Object.entries(entity)) for (const [k, ref] of Object.entries(map)) line(`${group}-${k}`, r(ref), ref);
css.push("");
for (const [group, list] of Object.entries(family))
  list.forEach(([L, C, h], i) => {
    line(`${group}-${i + 1}`, hex(L, C, h), `oklch ${L} ${C} ${h}`);
    line(`${group}-${i + 1}-wash`, hex(L + (0.97 - L) * 0.62, C * 0.4, h));
  });
css.push("}");
const cssText = css.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n") + "\n";
writeFileSync(join(here, "tokens.css"), cssText);

const resolve = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "string" && /^\w+\.\d+$/.test(v) ? r(v) : v]));
const json = {
  font,
  neutral,
  ramps,
  categorical: categorical.map(r),
  semantic: resolve(semantic),
  sequential: Object.fromEntries(Object.entries(sequential).map(([k, n]) => [k, ramps[n]])),
  diverging: Object.fromEntries(Object.entries(diverging).map(([k, [lo, hi]]) => [k, [...[800, 700, 600, 500, 400, 300, 200].map((s) => ramps[lo][s]), neutral.wash, ...[200, 300, 400, 500, 600, 700, 800].map((s) => ramps[hi][s])]])),
  entity: Object.fromEntries(Object.entries(entity).map(([g, m]) => [g, resolve(m)])),
  family: Object.fromEntries(Object.entries(family).map(([g, list]) => [g, list.map(([L, C, h]) => ({ mark: hex(L, C, h), wash: hex(L + (0.97 - L) * 0.62, C * 0.4, h) }))])),
};
writeFileSync(join(here, "tokens.json"), JSON.stringify(json, null, 2) + "\n");
console.log("wrote tokens.css, tokens.json");
