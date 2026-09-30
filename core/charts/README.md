# Charts

A chart is one sentence of evidence. It shows one comparison, reads in a few
seconds, and is labelled well enough to stand alone. The same grammar serves every
format; each format sets the sizes and the tools (`../../formats/`).

This file holds what every chart shares: how to choose a form, and the grammar
(frame, marks, labels, glyphs, colour). Each form has its own file in `forms/`,
named by its number and a short name (`forms/22-body-map.md`), which holds both its
rules and its figures (*Figures*, below). Form numbers are permanent: a new form
takes the next number, and a retired number is not reused. `../../INDEX.md` lists
every form with its figures, and `out/` holds one contact sheet per family
(`out/sheet-anatomy.png`), laying out every figure of its forms.

Sizes are px on the abstract canvas. `../../formats/publication/README.md` gives the
print equivalents that every form shares; a form's own print sizes are in its file.

## Forms by family

This table is the list of families: a form's `family` must be one of them, and each
row lists exactly its forms.

| Family | Forms |
|---|---|
| Comparison (`comparison`) | [01 · Ranked bars](forms/01-ranked-bars.md), [02 · Forest plot](forms/02-forest-plot.md), [10 · Small multiples](forms/10-small-multiples.md), [11 · Amounts](forms/11-amounts.md), [12 · Lollipop](forms/12-lollipop.md), [16 · Dumbbell](forms/16-dumbbell.md) |
| Distribution (`distribution`) | [09 · Beeswarm](forms/09-beeswarm.md), [13 · ECDF](forms/13-ecdf.md) |
| Response and models (`response`) | [04 · Dose–response](forms/04-dose-response.md), [05 · ROC curve](forms/05-roc-curve.md), [06 · Volcano](forms/06-volcano.md), [15 · Predicted vs observed](forms/15-predicted-observed.md) |
| Time and clinical course (`time`) | [03 · Survival curves](forms/03-survival-curves.md), [17 · Patient timeline](forms/17-patient-timeline.md), [25 · Swimmer plot](forms/25-swimmer-plot.md) |
| Matrices (`matrix`) | [07 · Heatmap](forms/07-heatmap.md), [18 · Count matrix](forms/18-count-matrix.md), [19 · Dot matrix](forms/19-dot-matrix.md), [21 · Radial track stack](forms/21-radial-track-stack.md) |
| Composition (`composition`) | [08 · Composition bars](forms/08-composition-bars.md), [14 · Composition columns](forms/14-composition-columns.md), [26 · Unit columns](forms/26-unit-columns.md) |
| Embedding (`embedding`) | [20 · Labelled embedding](forms/20-labelled-embedding.md) |
| Anatomy and phylogeny (`anatomy`) | [22 · Body map](forms/22-body-map.md), [23 · Route map](forms/23-route-map.md), [24 · Clone tree](forms/24-clone-tree.md) |

## Figures

A form file is one Markdown document that a reader or an agent can take whole: front
matter to find it by, the rules as prose, and the figures that show them, each drawn
by code in the file itself.

````markdown
---
id: form-22                    # permanent; the file is NN-name.md
name: Body map                 # 1–3 words
kind: chart
family: anatomy                # a row of *Forms by family*
job: ["Counts per anatomical site", "A share compared between body regions"]
kit: [GA.bio.body, GA.bio.bubbles, GA.bio.dial]
sources: ["Hessey, Bunkum, Huebner et al., Nature 2026, Figs 1a and 4h"]
see_also: [form-23, form-25]   # runs both ways
---
# 22 · Body map

For counts per anatomical site … (the lead paragraph: what the form is for)

- The rules of the main figure.

![Metastases per site on the body map, as bubbles sized by count](out/22-body-map.main.png)

```js figure=main w=521 h=453
const B = GA.bio(ga);
const body = B.body({ cx: 267, y: 16, h: 420 });
…
```

## Region dials

To compare a share between regions … (the variant's lead paragraph)

- The variant's own rules, then its image and figure block, `figure=region-dials`.

## In each format

| Element | Canvas | Print |
|---|---|---|
````

- **Variants are sections.** The figure before the first `##` heading is `main`; a
  figure under a `##` heading is named by that heading's slug, so
  `forms/22-body-map.md#region-dials` links the section and names the figure. A
  form's print sizes go last, under *In each format*.
- **A job is a row of *Choosing the form*.** Each entry of `job` is the text of a row
  below that links the form, and each row that links a form is one of its jobs.
- **A figure block** is a `js` block whose info string gives its name and its canvas
  in px, `figure=<name> w=<w> h=<h>`. Its code runs inside `GA.build` on that canvas
  with a 16 px margin (`../../kit/README.md`), with `ga`, `GA`, `tok(name)` and
  `ramp(hue, steps)` in scope. It draws with synthetic data from a seeded `GA.rng`,
  places marks from the canvas origin, and passes no `at`: a figure is still.
- **Its image sits above it**, `![alt](out/<file>.<name>.png)`, the alt text saying
  what the figure shows. `node kit/render.cjs core/charts/forms/*.md` renders every
  figure whose code changed (`--all` after a kit change; `--fit` prints each
  drawing's bounds, to set `w` and `h`), and `node tools/sheets.mjs` rewrites the
  contact sheets; `npm run figures` does both. Each image carries its block's hash,
  so `npm run check` fails on a stale one.
- A form drawn outside the kit (17, in Typst) names its source in `specimens` and
  shows its image instead of a figure block.

## Choosing the form

Start from the data's job.

| The data's job | Form |
|---|---|
| Compare groups of observations | Beeswarm with a median ([09](forms/09-beeswarm.md)) |
| A factorial experiment | Small multiples, the tested factor on x ([10](forms/10-small-multiples.md)) |
| A distribution | ECDF ([13](forms/13-ecdf.md)), or the points themselves when n < 30 ([09](forms/09-beeswarm.md)) |
| Amounts for a few categories or time points | Bars from zero ([11](forms/11-amounts.md)) |
| Amounts across orders of magnitude | Dots on a log axis ([11](forms/11-amounts.md)) |
| Compare named categories, ranked | Ranked horizontal bars ([01](forms/01-ranked-bars.md)) |
| Ranked values that carry a scale (fold change per gene) | Lollipop coloured by the scale ([12](forms/12-lollipop.md)) |
| Effect sizes with uncertainty | Forest / interval plot ([02](forms/02-forest-plot.md)) |
| One metric, two methods, across cohorts | Dumbbell ([16](forms/16-dumbbell.md)) |
| Time to event | Cumulative incidence or Kaplan–Meier steps ([03](forms/03-survival-curves.md)) |
| One patient's record against a model's predictions over time | Patient timeline ([17](forms/17-patient-timeline.md)) |
| Response against dose | Dose–response curve, log dose ([04](forms/04-dose-response.md)) |
| Classifier performance | ROC (or PR when positives are rare) ([05](forms/05-roc-curve.md)) |
| A regression's predictions against the measured values | Predicted vs observed ([15](forms/15-predicted-observed.md)) |
| Many tests, effect against significance | Volcano ([06](forms/06-volcano.md)) |
| Matrix of values (tissue × drug, gene × cell) | Heatmap ([07](forms/07-heatmap.md)), grouped when columns carry an annotation |
| Matrix of classes (alterations per gene and patient, and when each arose) | Heatmap with categorical cells, the oncoprint ([07](forms/07-heatmap.md)) |
| Counts in a matrix (patients per gene × tumour type) | Count matrix ([18](forms/18-count-matrix.md)) |
| Two measures per cell of a matrix (how many have it, how much) | Dot matrix ([19](forms/19-dot-matrix.md)) |
| Observations in a learned space (cells, patients, codes) | Labelled embedding ([20](forms/20-labelled-embedding.md)) |
| Many variables for thousands of individuals in groups | Radial track stack ([21](forms/21-radial-track-stack.md)) to show the cohort; the oncoprint ([07](forms/07-heatmap.md)) to evaluate it |
| Counts per anatomical site | Body map ([22](forms/22-body-map.md)) |
| A share compared between body regions | Body map with region dials ([22](forms/22-body-map.md)) |
| Where a tumour's clones spread, and which clones seeded | Route map ([23](forms/23-route-map.md)) beside its clone tree ([24](forms/24-clone-tree.md)) |
| A cohort's clinical course, patient by patient | Swimmer plot ([25](forms/25-swimmer-plot.md)) |
| A few items per unit, each with a state (metastases per patient) | Unit columns ([26](forms/26-unit-columns.md)) |
| Parts of a whole, a few units | 100 % stacked bars ([08](forms/08-composition-bars.md)) |
| Parts of a whole, many samples | Stacked columns grouped by dominant part ([14](forms/14-composition-columns.md)) |
| One share per location in space | Proportion dials in small multiples (`../illustration.md`) |
| Two measures on different scales | Two panels that share the x-axis |
| One number is the story | Set the number large, in `head` or `take`, with its n |

## Grammar (all forms)

**Frame**

- Left and bottom axes, 1.5 px `ink-2`, with 5 px outward ticks. The plot area is
  open on the top and right.
- **Axis titles are centred on their axis**, in every form and format. The x title
  sits under the tick labels, centred on the x axis. The y title reads upward in the
  left margin, left of the tick labels, centred on the y axis. Units go in
  parentheses.
- A plot without a y axis line, whose rows are named instead (ranked bars, forest
  plot, heatmap, composition bars), names its rows or its measure in a title above
  the plot, left-aligned.
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
- **Keys of matrices** (07, 18, 19) sit beneath the grid. A key may sit above
  instead when the plot leaves room there and a key beneath would add a row that is
  mostly empty (form 18).
- Label text uses the series' **text step** (`--harm-text`, `--cat-n-text`) or
  `muted`. Journal figures set labels in ink with a colour swatch
  (`../../formats/publication/README.md`).

**Glyphs**

Records of events and states (a patient's course, a clone's role, a second hit in a
gene) are drawn as glyphs, one mark per kind, so a reader learns them once and reads
them in every panel.

- **Shape says the kind, and there are few**: a diamond for a procedure (surgery,
  radiotherapy), a circle for a sample or a measurement, an x for death, a short
  vertical tick for a censored observation (form 03), a bar for an interval (a
  treatment). Interval bars are square-cornered in a plot of data alone (form 25)
  and may be round-capped where predictions overlay the record (form 17). Samples of
  different kinds (at relapse, at progression) share the circle; their place on the
  timeline tells them apart.
- **A change of state changes the line, not a glyph**: the swimmer plot's
  follow-up line is 1.5 px `rule` until relapse and 2.5 px `ink-2` after it (form 25).
- **Fill says the class** (where a clone lives, which site a sample came from), from
  one palette per job (`../color.md`).
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
- Sizes are a reference range; each form sets its own for its context: about 11 px
  for a glyph, 8–9 px for minor events (radiotherapy, a biopsy), 13–16 px when it
  carries a digit or letter or stands for a clone (form 24).

**Colour** (see `../color.md`)

- One series: ink, or the finding's colour.
- Groups named by the axis: `ink-2` points, `ink` summaries.
- Focus against comparator: finding colour against `context` grey.
- Direction of effect: valence (benefit / harm) or direction (violet / ochre).
- Identity: categorical slots in order.
- Ordered categories (doses, stages, binned values): steps of one ramp from anywhere
  in 100–900 (`../color.md`, *Magnitude*).
- Ordered categories with a judgement (risk groups): the valence arms, benefit 700
  and 400 for the better half, harm 400 and 700 for the worse (`../color.md`, *Magnitude*).
- A model against comparators: the model in `prussian`, comparators in `context`.
