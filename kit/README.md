# Kit

The kit draws kare's figures in HTML and SVG, and renders them to PNG, MP4 and WebM.
It implements the core grammar: the chart forms (`../core/charts/`), the
illustration layer (`../core/illustration.md`) and the icons (`../core/icons.md`).
Every specimen in the repo that is not Typst is drawn with it, and the graphical
abstract format (`../formats/abstract/README.md`) builds its canvas, arc and motion
on it.

| File | What |
|---|---|
| `ga-kit.css`, `ga-kit.js` | Layout, type roles, motion, lint. The CSS imports `../core/tokens.css` |
| `ga-charts.js` | Chart forms (`../core/charts/`) |
| `ga-bio.js` | Cells, tissue, body maps, zooms (`../core/illustration.md`) |
| `anatomy.js` | The anatomy the body map draws: a curated Expression Atlas anatomogram (CC BY 4.0). Load it before `ga-bio.js` |
| `icons.js` | Icons (`../core/icons.md`) |
| `render.cjs` | PNG / MP4 / WebM renderer; also renders the figure blocks of Markdown specs |
| `figures.cjs` | Reads figure blocks, writes the page each is drawn on, and stamps each PNG with its block's hash |

## Loading and rendering

A figure page loads the kit by relative path from the design system checkout and is
rendered from its own folder:

```html
<link rel="stylesheet" href="../design-system/kit/ga-kit.css">
<script src="../design-system/kit/icons.js"></script>
<script src="../design-system/kit/ga-kit.js"></script>
<script src="../design-system/kit/ga-bio.js"></script>
<script src="../design-system/kit/ga-charts.js"></script>
```

```bash
node ../design-system/kit/render.cjs my-figure.html   # -> out/my-figure.{png,mp4,webm,webp}
```

The renderer needs Playwright (resolved from the project's `node_modules`, or a global
install via `NODE_PATH=$(npm root -g)`) and ffmpeg.

A figure smaller than the 1600 × 900 canvas passes its size and margin to `GA.build`:
`GA.build({ width: 520, height: 450, margin: 16 }, (ga) => …)`. The lint then keeps
text inside that margin on every side. The chart forms' figure blocks are drawn this
way (`../core/charts/README.md`, *Figures*): given Markdown files, the renderer draws
each block to the PNG named above it, skipping those whose image already carries the
block's hash.

```bash
node kit/render.cjs core/charts/forms/*.md          # changed figures -> core/charts/forms/out/
node kit/render.cjs core/charts/forms/22-body-map.md --all --fit   # redraw; print each drawing's bounds
```

Charts use `GA.chart`, which applies the grammar in `../core/charts/README.md`:

```js
const ch = GA.chart(ga, { x, y, w, h, xd: [0, 24], yd: [0, 0.12],
  xTicks: [0, 12, 24], yTicks: [0, 0.1], xTitle: "Months on ICI", yTitle: "Cumulative incidence", at: 10.9 });
ch.line(points, { curve: "step", color: "var(--harm)" });
ch.label("carriers", 24, 0.08, { dx: 10, color: "var(--harm-text)" });
```

`x, y, w, h` place the **plot area**; titles and ticks sit outside it. All chart text
goes through `ga.text`, so the lint covers it, and a label sitting on a curve fails the
render. `axes: "x"`, `"y"` or `""` keeps only those axes. Axis titles are centred on
their axis: `xTitle` under the tick labels, `yTitle` reading upward left of the widest
y tick label (`yTitleX` sets its baseline instead). Leave the plot's `x` enough room
on the left for it. On a chart with no y axis line, `yTitle` is a heading above the
plot, left-aligned at `yTitleX`.

| Mark | Form (`../core/charts/forms/`) |
|---|---|
| `line`, `fn`, `ribbon` | Curves, step curves, ECDF, CI ribbons ([03](../core/charts/forms/03-survival-curves.md), [04](../core/charts/forms/04-dose-response.md), [05](../core/charts/forms/05-roc-curve.md), [13](../core/charts/forms/13-ecdf.md)) |
| `dots`, `ref`, `label`, `lineKey`, `key` | Points, dotted reference lines, direct labels, keys |
| `hbars` | Ranked bars ([01](../core/charts/forms/01-ranked-bars.md)) |
| `intervals` | Forest plot ([02](../core/charts/forms/02-forest-plot.md)) |
| `heat` | Heatmap; `groups` splits columns, `dense` drops column gaps ([07](../core/charts/forms/07-heatmap.md)) |
| `stack` | 100 % stacked bars ([08](../core/charts/forms/08-composition-bars.md)) |
| `swarm`, `summary` | Beeswarm with a median bar ([09](../core/charts/forms/09-beeswarm.md), [10](../core/charts/forms/10-small-multiples.md)) |
| `vbars` | Bars from zero ([11](../core/charts/forms/11-amounts.md)) |
| `lollipop` | Lollipop ([12](../core/charts/forms/12-lollipop.md)) |
| `columns` | Stacked columns grouped by dominant part ([14](../core/charts/forms/14-composition-columns.md)) |
| `censor`, `atRisk` | Censoring ticks and the numbers-at-risk rows of a Kaplan–Meier plot ([03](../core/charts/forms/03-survival-curves.md)) |
| `hexbin`, `marginal` | Density bins and marginal strips ([15](../core/charts/forms/15-predicted-observed.md)) |
| `dumbbell`, `dotKey` | Dumbbell and its key; `p: "exact"` or `"stars"` ([16](../core/charts/forms/16-dumbbell.md)); `square: true` keys bars |
| `counts`, `upText` | Count matrix with totals and a 100 % bar per row ([18](../core/charts/forms/18-count-matrix.md)); column names reading upward |
| `dotMatrix`, `sizeKey` | Dot matrix, area for share and colour for magnitude, and its size key ([19](../core/charts/forms/19-dot-matrix.md)) |
| `cloud`, `stub`, `label` (`halo`) | Embedding points, the axis stub, names on the cloud ([20](../core/charts/forms/20-labelled-embedding.md)) |
| `region`, `frame`, `callouts`, `GA.leaders` | An atlas's zoom: source frame, inset frame, named points in a column, corner-to-corner leaders ([20](../core/charts/forms/20-labelled-embedding.md)); a named part of a bar ([08](../core/charts/forms/08-composition-bars.md)) |
| `GA.radial` → `sectors`, `bars`, `ring`, `key` | Radial track stack ([21](../core/charts/forms/21-radial-track-stack.md)) |
| `GA.glyph`, `GA.glyphKey` | Glyphs: shape for kind (`circle`, `diamond`, `square`, `x` for death, `tick` for censoring), fill for class, ring for role, a digit or letter inside; keys with glyph, bar and line rows (`../core/charts/README.md`, *Glyphs*) |
| `GA.bio` → `body`, `bubbles`, `dial` | Body map with site bubbles or region dials ([22](../core/charts/forms/22-body-map.md)); needs `anatomy.js` |
| `GA.routes`, `GA.cloneTree` | Route map ([23](../core/charts/forms/23-route-map.md)) and clone tree ([24](../core/charts/forms/24-clone-tree.md)) |
| `swimmer` | Swimmer plot, the follow-up line carrying relapse ([25](../core/charts/forms/25-swimmer-plot.md)) |
| `units` | Unit columns ([26](../core/charts/forms/26-unit-columns.md)) |
| `oncoprint` | Heatmap with categorical cells, the oncoprint ([07](../core/charts/forms/07-heatmap.md)) |

The chart forms' figure blocks (`../core/charts/forms/`) use every mark.
