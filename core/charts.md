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
- `out/specimen-chart-forms-iv.png`: forms 18, 19 and 21 (`specimen-chart-forms-iv.html`).
- `out/specimen-chart-forms-v.png`: form 20, simple and as an atlas
  (`specimen-chart-forms-v.html`).
- `out/specimen-chart-forms-vi.png`: forms 22–24, findings on the body
  (`specimen-chart-forms-vi.html`).
- `out/specimen-chart-forms-vii.png`: forms 25 and 26 (`specimen-chart-forms-vii.html`).
- `out/specimen-chart-forms-viii.png`: form 27 and the segment callout
  (`specimen-chart-forms-viii.html`).

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
| Counts in a matrix (patients per gene × tumour type) | Count matrix (18) |
| Two measures per cell of a matrix (how many have it, how much) | Dot matrix (19) |
| Observations in a learned space (cells, patients, codes) | Labelled embedding (20) |
| Many variables for thousands of individuals in groups | Radial track stack (21) |
| Counts per anatomical site | Body map (22) |
| A share compared between body regions | Body map with region dials (22) |
| Where a tumour's clones spread, and which clones seeded | Route map (23) beside its clone tree (24) |
| A cohort's clinical course, patient by patient | Swimmer plot (25) |
| A few items per unit, each with a state (metastases per patient) | Unit columns (26) |
| Alterations per gene and patient, with when each arose | Oncoprint (27) |
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
- **Segment callout.** To name what one part of a bar holds (the actionable
  drivers among the truncal mutations), outline the part 1.5 px `ink` and open a
  flare from it to a short list set beside the bar: a pale wash (slate 100 or the
  part's 100 step) that widens from the part's height to the list's. The list's
  title is `muted`; its items are `ink`, gene names italic.

**Glyphs**

Records of events and states (a patient's course, a clone's role, a second hit in a
gene) are drawn as glyphs, one mark per kind, so a reader learns them once and reads
them in every panel.

- **Shape says the kind**: a diamond for a procedure (surgery), a circle for a
  measurement or a sample from a known site, a triangle and a square for samples taken
  at relapse and at progression, × for relapse, a short vertical tick for death.
- **Fill says the class** (where a clone lives, which site a sample came from), from
  one palette per job (`color.md`).
- **A ring says the role**: 2.5 px `ink` for the primary role (seeds from the
  primary), 2.5 px `muted` for the secondary (seeds from a metastasis). A glyph
  without a role has the 1 px paper ring of any point.
- **A digit or letter inside** carries a count (regions sampled) or repeats the role
  (P, M), 500 weight, in paper on dark fills and ink on light ones, so the role
  survives greyscale.
- **A small ring inside a cell** (paper fill, 1 px `ink`) marks a second event on top
  of the cell's class (a biallelic hit in an oncoprint).
- A glyph means one thing across the figure. The key draws each glyph as it is used,
  grouped under a title per kind (Event, Treatment, Sample).
- Sizes: 11 px glyphs (7–8 px for minor, repeated events such as treatment cycles),
  13 px when they carry a digit.

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

### 18 · Count matrix

For counts over two categorical axes, when the counts are the finding: patients with
a driver in each gene per tumour type, events per site per arm.

- One cell per pair, separated by a 2 px paper gap. The **count is printed in every
  filled cell** (`tick`, 11 px), ink on the light steps and paper from step 700 on.
  Zero stays blank, and the caption says so.
- The shade bins a **share** (the count over its column's n), so columns of
  different size compare: five steps of the quantity ramp (100, 200, 400, 700, 900),
  edges at round shares (0, .05, .1, .2, .4, 1). The key is the five swatches with
  the edges printed between them, above the grid.
- Rows sort by their total; columns by the story (organ, or n). Row names left of
  the grid; column names read upward above it.
- Right of the grid, one column of row totals in the `tick` role, titled once
  ("Total"), and, when it matters how each row's count splits, a 100 % bar per row
  (form 08's rules, a 0–1 axis beneath, the legend below as square swatches). The
  bar's parts keep to the categorical slots and skip teal, which the matrix already
  uses.

### 19 · Dot matrix

For two measures per cell of a matrix: the share of tumours with a signature and the
burden among them, the share of cells expressing a gene and its mean level.

- Every cell is a `wash` square with a 2 px paper gap, so a cell without a dot reads
  as measured and absent. A cell that was not measured has no square.
- The dot's **area** carries the share (radius ∝ √share); the largest dot fills
  the cell less 1.5 px. Its **colour** carries the magnitude on the quantity ramp
  from step 300, so the lightest dot still shows on the wash. Use a log scale when
  the magnitude spans decades, and cap it (`color.md`).
- Each column's n sits in a row above the grid in the `tick` role, with "n" at the
  row's left; column names read upward above that.
- Row groups (SBS, DBS, ID) part with a 10 px gap and are named upward at the left
  beside a `rule` bar. A text column right of the grid (`tick`) annotates each row
  (the proposed aetiology) and stays blank where there is nothing to say.
- Two keys beneath: dots in `context` at three shares (0.25, 0.5, 1), and the colour
  key with labelled ends.

### 20 · Labelled embedding

For observations placed in a learned space (UMAP, t-SNE, a model's latent space):
cells, patients, clinical codes. Position means similarity; the coordinates mean
nothing.

- No ticks, no frame and no gridlines. An **axis stub** at the bottom-left corner,
  two 34 px `ink-2` arms with open heads, names the projection ("UMAP 1", "UMAP 2").
- Points are small and ringless (r 2, 75–80 % opacity), drawn in shuffled order so
  no group always sits on top; grey points go first.
- **Colour** follows `color.md`: identity slots in order; a lineage or ordered
  states take the ordinal steps of one ramp (400–800); an eighth type folds into
  `context` and keeps its name.
- **Names replace the legend.** Each group's name sits at the edge of its cloud in
  its text step, with a 3 px paper halo where it crosses points. A legend (dots and
  names, above the plot) is for when groups interleave so much that names would not
  point at one place.
- **Atlas.** When the story runs from the whole space down to single items, zoom in
  steps: the overview; a subset re-embedded on its own; magnified insets of that.
  - A source region is framed 1 px `ink`, and two straight 1 px `ink-2` leaders join
    its facing corners to the next view's. A re-embedded subset has a `rule` frame;
    a magnified inset an `ink` one, with its points enlarged (r 3) and ringed.
  - Colour carries the top level at every zoom. In a subset, the clusters that the
    insets examine keep their colour and the rest turn `context`. Leaves are
    **named, not coloured**: callouts in one column right of the inset (`tick`,
    18–20 px apart), ordered by the points' height, each leader a 1 px `ink-2` line
    from a 1 px `ink` ring on the point.
  - Each inset is named in its subset, beside its source frame, in the text step.

### 21 · Radial track stack

For many variables across thousands of individuals in groups: the drivers of every
patient in a pan-cancer cohort. It is the track stack (17) bent into a circle, so a
long axis of individuals fits a square panel. With a few hundred individuals or
fewer, use the straight track stack.

- Individuals run clockwise from 12 o'clock, one angular slice each, in **sectors**
  by group with a 1.5° gap between sectors. An 8° opening at 12 o'clock holds the
  scale. Within a sector, sort individuals by the outer bar.
- From the outside in: the **bar ring** (26 px deep, `context`, one bar per
  individual, its scale running to a round number at or above the peak, labelled
  once on a short axis in the opening); the **sector ring** (5 px, `ink-2` and
  `context` alternating); then one **heat ring** per variable (11–12 px deep, 2 px
  paper gaps).
- Each heat ring takes its own hue's ramp (steps 200–800 for counts; one step for
  present or absent). Zero stays paper. Hues follow the categorical order, and the
  ring's order is the key's order.
- Sector names sit outside the bar ring in the `tick` role, reading horizontally:
  standing on the ring at the top, hanging from it at the bottom, level with it at
  the sides.
- The **ring key** lists the rings outside in, each a short ramp strip and its name,
  with the strips' end values under the last one. The centre stays empty.

### 22 · Body map

For counts per anatomical site: metastases by organ, samples by site, lesions by
region. The body gives the sites their places, so no axis is needed.

- The body is neutral (`illustration.md`, *Body maps*): wash fill, `context`
  outline, organ cores in slate 200. The patient's right is the viewer's left.
- **Site bubbles**: one circle per site at its place, **area** proportional to the
  count, the count inside in paper (13 px, or 11 px in small bubbles). Bigger
  bubbles are drawn first, each with a 1 px paper ring, so overlapping sites stay
  apart.
- Colour follows the site: a registered organ keeps its entity colour (`color.md`,
  *Entities*); any other site is `ink-2`. Register a site that recurs across figures
  before it needs a colour.
- Names sit in two columns beside the body, the patient's right side on the left,
  each on a 1 px `ink-2` leader from the bubble's edge, pushed apart to one line
  pitch in height order so leaders do not cross. A bubble too small to hold its
  count puts it after its name ("Bone (7)").
- **Region dials.** To compare a share between regions (intrathoracic against
  extrathoracic), draw one dial per region instead of bubbles per site: a paper disc
  with a 4 px ring in the region's colour, a wedge for the share filled clockwise
  from 12 o'clock, and both counts inside. The region's name sits beside its dial in
  its text step, on a paper halo, and a test between regions on a bracket beside
  them.

### 23 · Route map

For where a tumour spread and from where: seeding routes in one patient, drawn on
the body map (22).

- The primary is an open ring (paper fill, 2.5 px `ink`); each metastasis a 13 px
  dot at its site, filled with the colour of the lineage that seeded it.
- A route is a 2 px arrow with an open head from the source site to the seeded site,
  in the lineage's colour. Every route bows to the left of its direction of travel by
  a quarter of its length, so routes that share an end fan out instead of stacking,
  and each stops short of its target so the dot stays whole.
- **One hue per seeding lineage** (the categorical slots not already used by the
  location classes: ochre, violet, rose), its 500 step for the clone that seeded
  from the primary and a lighter step (300 for dots, 400 for arrows) for its
  descendants that seeded again from a metastasis.
- Set the route map beside the lineage's clone tree (24); the two share colours, so
  no key is needed for the lineages.

### 24 · Clone tree

For a tumour's phylogeny: which subclones exist, where each lives, and which seeded
metastases.

- The root sits on a short stem at the top; edges are straight 1.5 px `ink-2` lines;
  leaves take equal slots across the width and a parent sits over the middle of its
  children.
- Nodes are 16 px circle glyphs (*Glyphs*). **Fill is where the clone lives**:
  trunk `context`, shared `blue-300`, primary-unique `blue-700`, metastasis-unique
  `teal-500`. Beside a route map, seeding clones and their metastatic descendants
  take their lineage's colour instead (23).
- **Ring and letter are its seeding role**: P with a 2.5 px `ink` ring for a clone
  that seeds from the primary, M with a 2.5 px `muted` ring for one that seeds from a
  metastasis.
- The key lists the location classes and the two roles, drawn as glyphs.

### 25 · Swimmer plot

For a cohort's clinical course: one row per patient on a shared time axis. Form 17
is one patient's record in depth; the swimmer plot is every patient's in outline.

- Rows sort by survival (or follow-up), shortest first. A 1.5 px `rule` line runs
  from time 0 to the row's end; a death ends it with a tick.
- Events are glyphs on the line (*Glyphs*): surgery a `prussian` diamond with the
  number of regions sampled inside; adjuvant cycles small `context` circles;
  relapse ×; samples hollow triangles and squares; radiotherapy a small `ink`
  diamond.
- Treatment intervals are 8 px bars on the line, square-cornered.
- Samples taken at the end (autopsy) sit after the row's end as dots two rows deep,
  each **coloured by its site as on the body map** (22). Colour then has one job, the
  site, so treatment bars take slate steps (700, 400, 200) and annotation strips use
  hues that no site in the figure uses.
- Annotation strips (histology, stage, smoking) are squares left of the plot, one
  column each, named upward above it; the patient's label sits left of them.
- Keys: events and treatments beside the plot as glyph keys; strips and sample sites
  beneath it.

### 26 · Unit columns

For a few items per unit when each item has a state: metastases per patient, imaged
and sampled or not.

- One dot per item (r 6, 1 px `ink-2` ring), stacked into a column per unit. The y
  axis counts items, so a column's height is its total.
- States stack in one fixed order from the baseline up, darkest first; the lightest
  state is hollow (paper fill, ring only).
- Columns sort by total; unit names hang below the axis, reading upward.
- A key of the states sits above the plot, in stack order.
- Past about 30 items per column, use stacked bars (08) instead.

### 27 · Oncoprint

For alterations per gene (rows) and patient (columns), and when each arose.

- Every cell is a `wash` square with a 2 px paper gap, so an unaltered cell reads as
  tested and wild type.
- An altered cell is filled by its **class**. For clonal timing, use the clone
  tree's location classes (24): truncal `context`, shared subclonal `blue-300`,
  primary-unique `blue-700`, metastasis-unique `teal-500`.
- A **second event** in the same gene (a biallelic hit, loss of the other allele) is
  a small ring inside the cell: paper fill, 1 px `ink` edge (*Glyphs*).
- Row groups (amplification, LOH, mutation) part with a 10 px gap and are named
  upward at the left beside a `rule` bar, as in form 19. Gene names are italic,
  right-aligned left of the grid, sorted within a group by frequency.
- Right of each row, its classes stack into a bar on a shared count axis (ticks at 0
  and the number of patients, above the grid).
- Annotation strips (histology, treatment) run under the grid in their own palettes
  and are named at the right; patient names hang below them, reading upward.

