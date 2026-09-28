# Charts

In a graphical abstract, a chart is one sentence of evidence. It shows one
comparison, reads in about 3 seconds, and is labelled well enough to stand alone.
The same grammar serves full paper figures.

Reference sheet: `out/specimen-charts.png`, built from `specimen-charts.html` with
`kit/ga-charts.js`.

```js
const ch = GA.chart(ga, { x, y, w, h, xd: [0, 24], yd: [0, 0.12],
  xTicks: [0, 12, 24], yTicks: [0, 0.1], xTitle: "Months on ICI", yTitle: "Cumulative incidence", at: 10.9 });
ch.line(points, { curve: "step", color: "var(--harm)" });
ch.label("carriers", 24, 0.08, { dx: 10, color: "var(--harm-text)" });
```

`x, y, w, h` place the **plot area**; titles and ticks sit outside it. All chart text
goes through `ga.text`, so the lint covers it. Curves are also linted: a label
sitting on a line fails the render.

## Choosing the form

| The data's job | Form |
|---|---|
| Compare named categories | Ranked horizontal bars (01) |
| Effect sizes with uncertainty | Forest / interval plot (02) |
| Time to event | Cumulative incidence or Kaplan–Meier steps (03) |
| Response against dose | Dose–response curve, log dose (04) |
| Classifier performance | ROC (or PR when positives are rare) (05) |
| Many tests, effect against significance | Volcano (06) |
| Matrix of values (tissue × drug) | Heatmap (07) |
| Parts of a whole per unit | 100 % stacked bars (08) |
| One share per location in space (cell type per spot) | Proportion dials in small multiples, one type per map (see `DESIGN.md`, *Drawing biology*) |
| One number is the story | Not a chart. Set the number large, in `head` or `take`, with its n |

Never use 3D, dual y-axes, pies over 3 slices, radar charts, or smoothed
survival curves.

## Grammar (all forms)

**Frame**

- Draw left and bottom axes only, 1.5 px `ink-2`, with 5 px outward ticks.
  There is no box around the plot.
- **y title:** horizontal, above the axis, left-aligned to it. It is never rotated.
- **x title:** right-aligned under the ticks, at the high end of the axis.
  Units go in parentheses.
- **Ticks:** 3–5 per axis, at round values, in the `tick` role (tabular, muted).
  Omit an axis when every value is labelled directly (bars).
- **Gridlines:** off by default. Turn them on (`grid: "y"`) only when readers must
  read values off the plot, as 1 px `rule`, solid.
- **Reference lines** (null effect, chance, threshold, 50 %) are the one dotted
  element: 1.5 px, `2 4` dash, muted.
- **Schematic charts** (illustrating a shape, not reporting data) have no numeric
  ticks and say "schematic" in the caption.

**Marks**

| Mark | Spec |
|---|---|
| Line | 2.5 px, round joins and caps |
| Step curve | Same as line; steps are never smoothed |
| Bar | ≤ 22 px thick, 4 px rounded data end, square at the baseline, grows from 0 |
| Point | r 4.5, 1 px paper ring so overlaps stay legible |
| Not-significant point | Hollow: paper fill, 1.5 px ring in the series colour |
| Confidence interval | 2 px line without caps (forest), or a ribbon at 14 % opacity |
| Stacked segments / heat cells | Separated by a 2 px paper gap, never outlined |

**Labels**

- **Label directly.** Put a series name just past its line end, and values at bar
  tips. Label only the extreme or the focus, never every point.
- **Use a legend or line key only when direct labels would collide**, for example
  converging curves (ROC) or many small segments (composition). Place it in the
  plot's empty region or directly below, in series order.
- Label text uses the series' **text step** (`--harm-text`, `--cat-n-text`) or
  `muted`. It never uses the 500 mark colour or a lighter one.

**Colour** (see `color.md`)

- One series: ink, or the finding's colour.
- Focus against comparator: finding colour against `context` grey.
- Direction of effect: valence (benefit / harm) or direction (violet / ochre).
- Identity: categorical slots in order.

**Motion**

The frame fades in (0.4 s). Then marks arrive: lines draw left to right (1.2 s),
bars grow from the baseline (80 ms stagger), points fade in. Ribbons and labels come
last. The order is the reading order: what is measured, then what was found.

## Forms

### 01 · Ranked bars

- Horizontal, sorted by value, with category names left of the baseline and values
  at the tips (no x-axis).
- One accent bar (the finding); the rest in `context`. If every bar matters equally,
  all bars are ink-2.
- Percentages are rounded to integers unless the difference lives in the decimal.

### 02 · Forest / intervals

- Use a log scale for ratios (OR, HR, RR), with ticks at 0.25, 1 and 4, or at
  0.5, 1 and 2.
- Draw a dotted null line at 1 (or at 0 for differences).
- A filled point means the CI excludes the null; a hollow point means it doesn't.
- Colour by direction when direction is the point: harm above 1, benefit below.
  Non-significant rows are `ink-2`.
- Row labels are the variable names; the y title names the family ("HLA allele").

### 03 · Cumulative incidence / Kaplan–Meier

- Use step curves only. Add a CI ribbon (step-shaped, 14 %) for the focus series only.
- Focus group in the finding's colour, comparator in `context`. Labels go just past
  the line ends, so leave about 70 px to the right of the plot.
- The x-axis is time with its unit ("Months on ICI"). The y-axis is a percentage from 0.
- In full figures, add a numbers-at-risk row beneath the axis in the `tick` role.

### 04 · Dose–response

- Log₁₀ dose on x, with ticks at decades (.001 … 10). Viability or response is on y,
  from 0 to 1.
- Show the fitted curve only; use points only when the individual measurements are
  the story. A dotted line at 0.5 marks the IC₅₀.
- Sensitive against resistant is valence: `benefit` against `context`. Labels go in
  the empty region beside each curve.

### 05 · ROC

- Use a square plot, with a dotted chance diagonal.
- Model in `prussian`, baseline or comparator in `context`. ROC curves converge at the
  corners, so use a line key in the lower-right triangle, with the metric printed:
  "model AUROC .81".
- Report AUROC to 2–3 significant digits, as the paper does, without a leading zero.
- If positives are under about 10 %, show a PR curve as well or instead.

### 06 · Volcano

- Effect (log₂ FC) on x, symmetric about 0, and −log₁₀ *P* on y.
- Dotted threshold lines. Hits are coloured by **direction** (violet down, ochre up);
  non-hits are `context` at 55 % opacity, drawn first.
- Label at most 5 named hits, with leader lines if needed. The corner labels
  "down" and "up" go at the bottom corners, which stay empty.

### 07 · Heatmap

- Diverging values use the valence scale (sensitive = blue, resistant = vermilion)
  or the direction scale. Magnitude uses a sequential scale. The midpoint is `wash`.
- Cells are separated by a 2 px paper gap. Rows and columns are clustered or
  meaningfully ordered, never alphabetical by default.
- The key sits beneath the grid, with labelled ends and midpoint. There are no
  numbers in the cells unless the matrix is at most 5 × 5.

### 08 · Composition (100 % stacked)

- Horizontal bars, with categorical slots in fixed order and the same order in every
  bar. At most 5 parts; the rest fold into "other" (`context`).
- The legend goes below, in stack order. Put labels inside segments only when they
  fit with padding.
- Sort units by the part the story is about.
- For spatial composition (e.g. deconvolved spots), use scatter-pies on the tissue
  with the same colours. The legend is shared with any bar chart.
