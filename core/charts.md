# Charts

A chart is one sentence of evidence. It shows one comparison, reads in a few
seconds, and is labelled well enough to stand alone. The same grammar serves every
format; each format sets the sizes and the tools (`../formats/`).

Reference sheets, synthetic data:

- `out/specimen-charts.png`: forms 01–08, drawn with the abstract kit
  (`specimen-charts.html`).
- `out/specimen-chart-forms.png`: forms 09–14 and the grouped heatmap (07)
  (`specimen-chart-forms.html`).
- `out/specimen-chart-forms-iii.png`: Kaplan–Meier by risk group and with numbers
  at risk (03), forms 15 and 16 (`specimen-chart-forms-iii.html`).

Sizes below are px on the abstract canvas. `../formats/publication/README.md` gives
the print equivalents.

## Choosing the form

Start from the data's job.

| The data's job | Form |
|---|---|
| Compare groups of observations | Beeswarm with a median (09) |
| A factorial experiment | Small multiples, the tested factor on x (10) |
| A distribution | ECDF (13), or the points themselves when n < 30 (09) |
| Amounts for a few categories or time points | Bars from zero (11) |
| Amounts across orders of magnitude | Dots on a log axis (11) |
| Compare named categories, ranked | Ranked horizontal bars (01) |
| Ranked values that carry a scale (fold change per gene) | Lollipop coloured by the scale (12) |
| Effect sizes with uncertainty | Forest / interval plot (02) |
| One metric, two methods, across cohorts | Dumbbell (16) |
| Time to event | Cumulative incidence or Kaplan–Meier steps (03) |
| One patient's record against a model's predictions over time | Patient timeline (17) |
| Response against dose | Dose–response curve, log dose (04) |
| Classifier performance | ROC (or PR when positives are rare) (05) |
| A regression's predictions against the measured values | Predicted vs observed (15) |
| Many tests, effect against significance | Volcano (06) |
| Matrix of values (tissue × drug, gene × cell) | Heatmap (07), grouped when columns carry an annotation |
| Parts of a whole, a few units | 100 % stacked bars (08) |
| Parts of a whole, many samples | Stacked columns grouped by dominant part (14) |
| One share per location in space | Proportion dials in small multiples (`illustration.md`) |
| Two measures on different scales | Two panels that share the x-axis |
| One number is the story | Set the number large, in `head` or `take`, with its n |

## Grammar (all forms)

**Frame**

- Left and bottom axes, 1.5 px `ink-2`, with 5 px outward ticks. The plot area is
  open on the top and right.
- **y title:** horizontal, above the axis, left-aligned to it. Each format may set its
  own; publication rotates it into the left margin (`../formats/publication/README.md`).
- **x title:** right-aligned under the ticks, at the high end of the axis.
  Units go in parentheses.
- **Ticks:** 3–5 per axis, at round values, in the `tick` role (tabular, muted).
  Drop an axis when every value is labelled directly (bars).
- **Baselines:** a bar's axis starts at 0, because its length carries the value.
  Dots, lines and boxes carry the value by position, so their axis starts where the
  data do. For values across orders of magnitude, use a log axis with dots.
- **Gridlines:** off by default. Turn them on (`grid: "y"`) when readers must read
  values off the plot, as 1 px `rule`, solid.
- **Reference lines** (null effect, chance, threshold, 50 %) are the one dotted
  element: 1.5 px, `2 4` dash, muted.
- **Schematic charts** (illustrating a shape, not reporting data) have no numeric
  ticks and say "schematic" in the caption.

**Marks**

| Mark | Spec |
|---|---|
| Line | 2.5 px, round joins and caps |
| Step curve | Same as line, drawn as steps |
| Bar | Square corners, grows from 0. ≤ 22 px thick in ranked bars; about half the band in vertical bars |
| Point | r 4.5, 1 px paper ring so overlaps stay legible; r 3–3.5 for about 100 per group |
| Not-significant point | Hollow: paper fill, 1.5 px ring in the series colour |
| Summary (median, mean) | Short `ink` bar, 3 px, with a 1.5 px paper halo so it reads over points |
| Confidence interval | 2 px line without caps (forest, summaries), or a ribbon at 14 % opacity |
| Box (large n, one mode) | `wash` fill, 1.5 px `ink-2` outline, `ink` median, whiskers to 1.5 IQR |
| Stacked segments / heat cells | Square corners, separated by a 2 px paper gap |

**Labels**

- **Label directly.** Put a series name just past its line end, and values at bar
  tips. Label the extreme or the focus.
- **Add a legend or line key when direct labels would collide**, for example
  converging curves (ROC) or many small segments (composition). Place it above the
  plot, in the plot's empty region, or directly below, in series order.
- Label text uses the series' **text step** (`--harm-text`, `--cat-n-text`) or
  `muted`. Journal figures set labels in ink with a colour swatch
  (`../formats/publication/README.md`).

**Colour** (see `color.md`)

- One series: ink, or the finding's colour.
- Groups named by the axis: `ink-2` points, `ink` summaries.
- Focus against comparator: finding colour against `context` grey.
- Direction of effect: valence (benefit / harm) or direction (violet / ochre).
- Identity: categorical slots in order.
- Ordered categories (doses, stages): the ordinal steps 400, 600, 800 of one ramp.
- Ordered categories with a judgement (risk groups): the valence arms, benefit 700
  and 400 for the better half, harm 400 and 700 for the worse (`color.md`, *Magnitude*).
- A model against comparators: the model in `prussian`, comparators in `context`.

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

- Step curves, with a step-shaped CI ribbon (14 %) for the focus series.
- Focus group in the finding's colour, comparator in `context`. Labels go just past
  the line ends, so leave about 70 px to the right of the plot.
- The x-axis is time with its unit ("Months on ICI"). The y-axis is a percentage from 0.
- In full figures, add a numbers-at-risk row beneath the axis in the `tick` role:
  one row per group, named left of the axis in the group's text colour, counts under
  the x ticks, "Number at risk" above in `muted`. With delayed entry (a landmark
  cohort, left truncation) the counts can rise; the legend says so.
- Censored observations are short vertical ticks on the curve, in its colour.
- **Risk groups** (quartiles of a score) are ordered and carry valence: benefit 700
  and 400, harm 400 and 700, with Q1 the lowest risk. The curves cross, so a line key
  above the plot replaces end labels.
- The statistics sit in the plot's empty corner in the `cap` role, one per line:
  n, the log-rank *P*, and the C-index.

### 04 · Dose–response

- Log₁₀ dose on x, with ticks at decades (.001 … 10). Viability or response is on y,
  from 0 to 1.
- Show the fitted curve; add points when the individual measurements are the story.
  A dotted line at 0.5 marks the IC₅₀.
- Sensitive against resistant is valence: `benefit` against `context`. Labels go in
  the empty region beside each curve.

### 05 · ROC

- A square plot, with a dotted chance diagonal.
- Model in `prussian`, baseline or comparator in `context`. ROC curves converge at the
  corners, so use a line key in the lower-right triangle, with the metric printed:
  "model AUROC .81".
- Report AUROC to 2–3 significant digits, as the paper does, without a leading zero.
- If positives are under about 10 %, show a PR curve as well or instead.

### 06 · Volcano

- Effect (log₂ FC) on x, symmetric about 0, and −log₁₀ *P* on y.
- Dotted threshold lines. Hits are coloured by **direction** (violet down, ochre up);
  non-hits are `context` at 55 % opacity, drawn first.
- Label up to 5 named hits, with leader lines if needed. The corner labels
  "down" and "up" go at the bottom corners, which stay empty.

### 07 · Heatmap

- Diverging values use the valence scale (sensitive = blue, resistant = vermilion)
  or the direction scale, with the midpoint (`wash`) at the value that means no
  change. Magnitude uses a sequential scale from 0.
- Order rows and columns by clustering or by a known variable. When columns carry an
  annotation (cell type, cohort), **group** them: a 6–8 px gap between groups, the
  group's name and n above it, and rows ordered by the group where each peaks.
- Cells are separated by a 2 px paper gap. In dense matrices (hundreds of columns),
  keep the gaps between rows and between groups and let columns touch.
- Unmeasured cells stay blank (paper), and the caption says so.
- The key sits beneath the grid, with labelled ends and midpoint. When the scale is
  capped (`color.md`, *Magnitude*), the key's end reads "> 2". Put numbers in the
  cells when the matrix is 5 × 5 or smaller.

### 08 · Composition (100 % stacked)

- Horizontal bars, with categorical slots in fixed order and the same order in every
  bar. Up to 5 parts; the rest fold into "other" (`context`). Ordered parts (stages)
  take the ordinal steps of one ramp.
- Shares go inside segments when they fit with padding. The legend sits above or
  below the bars, in stack order.
- Sort units by the part the story is about.
- For spatial composition (e.g. deconvolved spots), use proportion dials on the
  tissue with the same colours.
- When the question is whether a part changed, add a points-and-mean panel per part
  (form 10) beside the stack.

### 09 · Beeswarm + median

For comparing groups of observations: it shows the shape, the n and the outliers
along with the centre.

- Every observation is a point, placed without overlap around the group's centre
  (a beeswarm, or a quasirandom layout when n is large).
- The median (or mean, if the paper reports means) is a summary bar across the swarm;
  add its 95 % CI as a 2 px line when the comparison needs it.
- Point radius 4.5 up to about 50 per group, 3–3.5 for about 100. For several hundred
  per group and one mode, a box with the points behind it in `context` at 40 % keeps
  the width in check.
- Group names are the x tick labels; the points are `ink-2`. Colour carries a second
  factor when there is one.
- For n below about 30, this is also the form for a distribution: the points say
  more than any histogram or violin of the same data.

### 10 · Small multiples

For factorial experiments and for any comparison repeated across levels.

- One panel per level of the factors the comparison is not about, laid out as a grid
  (rows for one factor, columns for another). The tested factor goes on x in every
  panel, with the points and a summary (form 09).
- Row and column names are `label` text beside and above the grid.
- Panels share the y scale, so heights compare across the grid. When levels differ
  by orders of magnitude, give each panel its own scale and say so in the caption.
- Label the y-axis once, on the first panel, and the x title once, on the last.

### 11 · Amounts

For a few amounts that the reader compares by size: counts, concentrations, yields.

- **Bars from zero:** vertical bars, about half the band wide, from a zero baseline.
  With n ≤ 10 per bar, the replicates sit on the bar as points. One accent bar for the
  finding, the rest `context`.
- **Dots on a log axis** when the amounts span orders of magnitude: one `ink` dot per
  category, with its value beside it. Log ticks at decades (10, 100, 1,000).
- Time points or doses run left to right; for a response over time, a line through
  the means with the replicates as points reads as well as bars.

### 12 · Lollipop

For ranked values that also carry a colour scale, or signed values about a reference.

- One row per item, sorted by value. A 2 px `rule` stem runs from the reference
  (0, or the null) to a dot at the value.
- The dot takes the scale colour with a 1 px `ink-2` ring, so light steps stay
  visible: the quantity ramp for one-sided values, the direction ramp centred on 0
  for signed values.
- Row labels left of the plot in `ink-2`; a dotted reference line at the stem origin.
- Show the colour key beneath, with labelled ends and midpoint.

### 13 · ECDF

For a distribution without bins, or two distributions compared.

- A step curve rising from 0 to 1: each step is one observation, so the curve is
  stable at any n and needs no bin width.
- Focus group in the finding's colour, comparator in `context`, labelled at the right
  end. For n ≤ 20, mark each observation with a dot on its step.
- The y-axis is "Cumulative share" from 0 to 1; the x-axis is the measured value.
- When a histogram suits the audience better (large n), state the bin width and check
  that the shape holds at two other widths.

### 14 · Composition across many samples

For community, cell-type or ancestry composition over dozens to hundreds of samples.

- One 100 % column per sample, parts in one fixed stack order.
- Group samples by their dominant part (or by the design: control, treated), with a
  small gap between groups and the group's name beneath it in the part's text colour.
  Within a group, sort by the dominant part's share.
- Seven categorical slots; further parts fold into "other" in `context`.
- The legend sits above or below the plot, in stack order.

### 15 · Predicted vs observed

For a regression's predictions against the measured values, over many observations.

- A square plot with one scale on both axes and the same ticks; the measured value
  on x, the prediction on y. A dotted identity line runs corner to corner.
- Density as hexagonal bins on the quantity ramp, capped near the 95th percentile of
  the bin counts; the key sits beside the plot with "> cap" at its end. Empty bins
  stay paper. Under about 500 points, plot the points instead (r 3, `ink-2`).
- Marginal strips on the top and right show each axis's distribution, in `context`.
  They share the main axes, carry one tick at their peak and no title
  (`../formats/publication/README.md`, *Composite panels*).
- The metrics (n, MAE, RMSE, with units) sit in the empty corner below the identity
  line in the `cap` role.
- Small multiples of several variables keep their own scales; say so in the caption.

### 16 · Dumbbell

For one metric measured by two methods across cohorts or settings: a model against a
clinical score, before against after treatment.

- One row per cohort, the cohort's name (and n) left of the plot in `label`. A 2 px
  `rule` stem joins the comparator dot (`context`) to the model's dot (`prussian`).
- The model's dot is hollow when the difference is not significant, as in form 02.
- Sparse panels print both values at the outer ends in the `tick` role and the exact
  *P* in `muted`, right-aligned in one column at the plot's right edge so the column
  does not stagger with the rows.
- **Dense panels** (many rows, or rows across small multiples) drop the values and
  let the shared axis read them. Stars may replace the exact *P*: one for < 0.05, two
  for < 0.01, three for < 0.001, "ns" otherwise, right-aligned in the same column;
  the legend defines them and a supplementary table gives the exact values.
- Groups of rows (therapy classes) become small multiples that keep one row pitch,
  so a short group ends early rather than spreading its rows.
- A key of the two dots sits above the plot. The x axis spans the data with a small
  pad, shared across small multiples, so the dots use the width; a bounded metric
  need not show its full range.

### 17 · Patient timeline

For one patient's record, observed and predicted, over time: a track stack, the
composite panel in `../formats/publication/README.md` (*Composite panels*), drawn
in `specimen-multitrack-timeline.typ`.

- One time axis on top. Tracks stack below in groups (risk, events, treatment, sites,
  labs), each group opened by a header in the `group` role.
- A black rule at the start time runs from the axis through every track.
- Observed data are vermilion 500 with a paper ring: event dots, interval bars
  (round-capped), and lab measurements.
- Predicted data are blue: lines in blue 600, probabilities as a heat strip on the
  blue ramp (100 at 0, 700 at 1), drawn under the observed marks.
- The risk line takes the valence diverging scale, each segment coloured by its
  value, with a dotted zero rule when 0 lies in range. It is the only track with
  valence and sits at the top.
- Value tracks carry two ticks at round numbers; lanes and events carry none.
- The patient (ID, age, sex, stage, status) sits top left above the label column,
  in `muted`.
- When tracks outnumber the cell, keep the top-ranked lanes and say so in the
  legend.

