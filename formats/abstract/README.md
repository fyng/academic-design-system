# Abstract: graphical abstracts

The graphical abstract (the Lamina canvas) states a paper's argument in three panels.
It plays as a 16-second animation on the web and stands as a still poster for
journals and slides. It builds on `../../core/`; this file adds the canvas, the
arc, its kinds of text, type sizes, motion and the kit that implements them.

| File | What |
|---|---|
| `kit/ga-kit.css`, `kit/ga-kit.js` | Layout, type roles, motion, lint |
| `kit/ga-bio.js` | Cells, tissue, body maps, zooms (`../../core/illustration.md`) |
| `kit/ga-charts.js` | Chart forms (`../../core/charts.md`) |
| `kit/icons.js` | Icons (`../../core/icons.md`) |
| `kit/render.cjs` | PNG / MP4 / WebM renderer |
| `specimen-type.html` → `out/specimen-type.png` | Type roles and the canvas |

## What a graphical abstract is

A graphical abstract reads like the paper's abstract:

- **The title says what the work is**, in plain words: a statement ("Spot-based spatial
  transcriptomics cell-type deconvolution without a single-cell reference") or, when the
  work answers one, a question ("Can we predict…?").
- **Each panel ends with a finding**, stated as the paper states it, with the
  paper's hedges intact ("predicts propensity", not "reveals").
- **The take-home is one plain sentence** that says why it matters to the field.
- **Schematic is labelled schematic.** A chart that illustrates a shape says so in its
  caption and has no numeric ticks. Real numbers come from the paper.

## The arc

- **One idea per panel, three panels.** Resource → method → finding is the default
  arc, read left to right. Three panels keep the story cut to its core.
- **Motion follows the argument.** Things appear in the order you would explain them
  aloud, then stay put.
- **Checked by the kit.** The lint blocks a render on overlaps, margin overflow,
  divider crossings, and arrows or curves running through labels; a clean render is
  the check. `--force` is for drafts.

## Writing

Every word on a figure is one of six kinds of text, each with one job.

| Text | Job | Form | Examples |
|---|---|---|---|
| **Title** | Say what the work is about | The question it answers, or a statement of the work, naming its scope. ≤ 2 lines | "How can we integrate ex vivo drug screens across model systems, cancer types, and drug modalities for treatment insights?" |
| **Panel title** | Say what the panel shows, in the field's terms | A resource, a method, or a finding as a short active claim. ≤ 6 words where possible | Resource: "Pan-cancer drug screen atlas". Method: "Bayesian drug response modeling", "Machine learning risk model". Finding: "Immortalization biases cell line vulnerability", "Topic model infers cell type mixture" |
| **Conclusion** | State the panel's result | One sentence: the paper's claim, with its hedge and its key number | "In 35,669 patients, germline variants predict propensity for immune-related adrenal insufficiency" |
| **Take-home** | Say why it matters | One plain sentence, no styling | "A precision safety paradigm is needed to complement response prediction in personalized medicine." |
| **Label** | Name a mark | 1–3 words, next to the mark | "organoids", "skin tumors" |
| **Note** | Decode what the drawing cannot | 1–3 words, muted, with a leader | "observed gene" |

The core writing rules apply (`../../core/README.md`, *Writing*). Here they mean:
a panel title a reader could search for ("LLM diagnosis extraction") rather than a
stage name ("Harmonize"); a finding title as a claim, with the hedge in the
conclusion underneath; labels that add to the panel title and conclusion.

## Canvas

- **1600 × 900 (16:9)**, white paper, 64 px margins, 8 px spacing grid.
- **Header, y 44–187:** a kicker (`PROJECT · VENUE YEAR`) and a title of at most two
  lines, with white space beneath.
- **Panels, y 204–766:** three columns of 437 px with 80 px gutters, no dividers.
  Each panel has a header, the number in prussian and a title in `head`
  (`01  Pan-cancer drug screen atlas`), wrapping to two lines at most, then the
  visual, and the conclusion at the foot. When any panel title wraps, every panel's
  visual starts below a two-line header, so the panels stay aligned.
- **Take-home, y 812–860:** one plain sentence in `take` type.
- The canvas is always light. On a dark page it sits on its own paper card
  (`../web/README.md`, *Embedding figures*).

## Type sizes

Px on the 1600 × 900 canvas (`GA.ROLE` in `kit/ga-kit.js`), as size/line height.
Roles and settings: `../../core/typography.md`.

| Role | Size | Role | Size |
|---|---|---|---|
| `kicker` | 13/17 | `tag` | 13/17 |
| `title` | 38/44 | `axis` | 14/18 |
| `head` | 28/34 | `tick` | 13/16 |
| `body` | 17/24 | `take` | 28/36 |
| `label` | 17/24 | `note` | 14/18 |
| `cap` | 15/20 | `math` | 17/22 |

- **13 px is the smallest size.** Plex holds up at 13 px on the canvas, about 6.5 px
  when the figure is shown 800 px wide.
- **Line length:** body up to 437 px (one column). The title may span the full 1472 px.
- In kit markup, `*…*` sets italic and `{…}` sets the accent colour.

## Motion

- **Loop 16 s** (always under 20 s, no sound). Header 0–1 s, panels about 4 s each,
  take-home at about 13.4 s, then hold. There is no closing fade: the last frame is
  the complete figure, identical to the poster (the static image, t = 15 s). A figure that
  explains a mechanism may run 18 s, with the poster at 17 s.
- **Vocabulary:** `in` (rise 12 px and fade) for text; `pop` for icons and boxes;
  `draw` for arrows and curves; `grow` for bars; `fade` for chart frames and fields;
  `zoom` for an inset growing out of its source; `sweep` for a proportion wedge
  filling clockwise from 12 o'clock; `move` for marks travelling into place when the
  travel is the point (samples clustering in an embedding).
- **Timing:** enter 0.6–0.8 s, draws 0.8–1.2 s, stagger 80 ms. Arrowheads appear
  as their line finishes. Chart frames come before the data, and labels come after
  the marks land.
- Reduced-motion users get the poster frame.

**Charts in motion.** The frame fades in (0.4 s). Then marks arrive: lines draw left
to right (1.2 s), bars grow from the baseline (80 ms stagger), points fade in. Ribbons
and labels come last. The order is the reading order: what is measured, then what was
found.

## The kit

A figure page loads the kit by relative path from the design system checkout and is
rendered from its own folder:

```html
<link rel="stylesheet" href="../design-system/formats/abstract/kit/ga-kit.css">
<script src="../design-system/formats/abstract/kit/icons.js"></script>
<script src="../design-system/formats/abstract/kit/ga-kit.js"></script>
<script src="../design-system/formats/abstract/kit/ga-bio.js"></script>
<script src="../design-system/formats/abstract/kit/ga-charts.js"></script>
```

```bash
node ../design-system/formats/abstract/kit/render.cjs my-figure.html   # -> out/my-figure.{png,mp4,webm,webp}
```

The renderer needs Playwright (resolved from the project's `node_modules`, or a global
install via `NODE_PATH=$(npm root -g)`) and ffmpeg.

Charts use `GA.chart`, which applies the grammar in `../../core/charts.md`:

```js
const ch = GA.chart(ga, { x, y, w, h, xd: [0, 24], yd: [0, 0.12],
  xTicks: [0, 12, 24], yTicks: [0, 0.1], xTitle: "Months on ICI", yTitle: "Cumulative incidence", at: 10.9 });
ch.line(points, { curve: "step", color: "var(--harm)" });
ch.label("carriers", 24, 0.08, { dx: 10, color: "var(--harm-text)" });
```

`x, y, w, h` place the **plot area**; titles and ticks sit outside it. All chart text
goes through `ga.text`, so the lint covers it, and a label sitting on a curve fails the
render. `axes: "x"`, `"y"` or `""` keeps only those axes.

| Mark | Form in `charts.md` |
|---|---|
| `line`, `fn`, `ribbon` | Curves, step curves, ECDF, CI ribbons (03, 04, 05, 13) |
| `dots`, `ref`, `label`, `lineKey`, `key` | Points, dotted reference lines, direct labels, keys |
| `hbars` | Ranked bars (01) |
| `intervals` | Forest plot (02) |
| `heat` | Heatmap; `groups` splits columns, `dense` drops column gaps (07) |
| `stack` | 100 % stacked bars (08) |
| `swarm`, `summary` | Beeswarm with a median bar (09, 10) |
| `vbars` | Bars from zero (11) |
| `lollipop` | Lollipop (12) |
| `columns` | Stacked columns grouped by dominant part (14) |
| `censor`, `atRisk` | Censoring ticks and the numbers-at-risk rows of a Kaplan–Meier plot (03) |
| `hexbin`, `marginal` | Density bins and marginal strips (15) |
| `dumbbell`, `dotKey` | Dumbbell and its key; `p: "exact"` or `"stars"` (16); `square: true` keys bars |
| `counts`, `upText` | Count matrix with totals and a 100 % bar per row (18); column names reading upward |
| `dotMatrix`, `sizeKey` | Dot matrix, area for share and colour for magnitude, and its size key (19) |
| `cloud`, `stub`, `label` (`halo`) | Embedding points, the axis stub, names on the cloud (20) |
| `region`, `frame`, `callouts`, `GA.leaders` | An atlas's zoom: source frame, inset frame, named points in a column, corner-to-corner leaders (20) |
| `GA.radial` → `sectors`, `bars`, `ring`, `key` | Radial track stack (21) |
| `GA.glyph`, `GA.glyphKey` | Glyphs: shape for kind, fill for class, ring for role, a digit or letter inside (*Glyphs*) |
| `GA.bio` → `body`, `bubbles`, `dial` | Body map with site bubbles or region dials (22) |
| `GA.routes`, `GA.cloneTree` | Route map (23) and clone tree (24) |
| `swimmer` | Swimmer plot (25) |
| `units` | Unit columns (26) |
| `oncoprint`, `GA.flare` | Oncoprint (27); segment callout (*Labels*) |

`../../core/specimen-charts.html` and `../../core/specimen-chart-forms.html`,
`-iii.html` through `-viii.html` use every mark.

## Deliverables per figure

`out/<slug>.png` (poster, 2×), `out/<slug>.mp4` (H.264), `out/<slug>.webm` (VP9 fallback),
and `out/<slug>.webp` (preview, not committed), written to an `out/` folder beside the
figure's HTML. Render with `node <design-system>/formats/abstract/kit/render.cjs <slug>.html` from the
folder that holds the figure; the render fails if lint fails.

Figures live in the project that publishes them; the kit loads by relative path
(*The kit*, above).

## On a website

How a figure is published is up to the consuming site. fyng.github.io, the reference
consumer, does it like this (its `graphical_abstracts/README.md` has the details):

1. A publish script copies the PNG, MP4 and WebM into the site's assets and makes a
   640 px `<slug>-thumb.png`.
2. The paper's bibliography entry names the figure, and the publication list shows the
   thumbnail in the entry's preview slot.
3. The slot shows the static poster, scaled to the column. The animation plays in an
   expanded view sized to fit the viewport (portrait and landscape):
   - on laptops, while hovering the thumbnail; a click opens it as an overlay;
   - on phones, a tap opens the overlay; tap anywhere, the × or Esc closes it.
   The animation plays once, then snaps to the poster (its last frame, aligned
   pixel for pixel), so viewers can zoom into or copy the figure. Closing and
   reopening the view replays it.
   Reduced-motion users get the enlarged poster only. The video loads on first open.
