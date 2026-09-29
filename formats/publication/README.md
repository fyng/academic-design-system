# Publication: journal figures

Multi-panel figures for papers: Nature, Science, Cell Press, PNAS and similar
journals, and preprints. The format builds on `../../core/`; this file sets figure
sizes in mm and pt, panel letters, the figure legend, statistics and export. It is a
spec: figures are drawn in the project's own tools (matplotlib, ggplot, Illustrator)
to these values.

## Size

Draw at the final printed size, so text and strokes need no scaling.

| Journal | 1 column | 1.5 column | Full width | Height |
|---|---|---|---|---|
| Nature | 89 mm | 120–136 mm | 183 mm | ≤ 170 mm, so the legend fits below |
| Science | 57 mm | – | 121 mm (2 col), 184 mm (3 col) | – |
| Cell Press | 85 mm | 114 mm | 174 mm | ≤ 200 mm, shorter so the legend fits |
| PNAS | 87 mm | 114 mm | 178 mm | ≤ 225 mm |

For a preprint or a journal not listed, use Nature's sizes.

## Type

IBM Plex Sans in every role (`../../core/typography.md`), with the fonts embedded.
Cell Press asks for Arial only, so Cell Press figures swap Plex for Arial and keep
the same sizes and weights.

| Role | Size | Weight | Colour | Use |
|---|---|---|---|---|
| Panel letter | 8 pt | Bold | ink | `a`, `b`, `c` at each panel's top-left |
| `head` | 6 pt | 500 | ink | Optional panel title, one line |
| `axis` | 6 pt | 500 | black | Axis titles |
| `label` | 7 pt | 400 | ink | Direct labels, row and column names |
| `tick` | 5 pt | 400, tabular figures | black | Tick labels, keys |
| `cap`, `note` | 6 pt | 400 | muted | n, scale bars, callouts |
| `group` | 5 pt | 500, caps, +12 % tracking | ink | Group headers in a track stack (*Composite panels*) |

- These sizes sit inside Nature's range (5–7 pt, panel letters 8 pt) and Science's
  (from 5 pt). Tick labels at 5 pt are below Cell Press (6–8 pt) and PNAS (from 6 pt):
  for those journals set `tick` at 6 pt.
- Every figure in a paper uses the same sizes, so figures read as one set.
- Panel letters are the one bold text, because journals ask for it:

| Journal | Panel letters |
|---|---|
| Nature, preprints | Lowercase, 8 pt bold, upright: **a**, **b** |
| Science | Capitals, 10 pt bold, upper left of each part; inside the edge of an image: **A**, **B** |
| Cell Press, PNAS, NEJM | Capitals, 8 pt bold: **A**, **B** |

- Colours come from the core roles (`../../core/color.md`), with one change: axis
  lines, ticks, tick labels and axis titles are black, for contrast in print. Other
  text is ink or muted, because journals ask for black or grey text.

## The panel contract

Every panel reserves margins around its plot area, so axes align across panels
drawn by any tool. The margins follow from the type and the gaps (*Spacing inside the
margins*, below), and grow with the panel. For a 30 × 24 mm cell they are:

| Edge | Reserves | mm |
|---|---|---|
| Left | y ticks, their labels (5 pt, 4 characters or the widest label), the y title (6 pt) | 8.8 |
| Bottom | x ticks, their labels, the x title (6 pt) | 5.8 |
| Top | `head` or a key, one line (6 pt) | 3.6 |
| Right | nothing | 2.0 |

### Spacing inside the margins

Font sizes stay fixed at every panel size. The gaps grow with the panel at a
discount, and the plot area takes all the remaining space. Distances run outward
from the axis to the edge of the panel's cell; ink is the glyphs' cap top to
baseline, and descenders hang 0.5 mm below.

| Distance | Base (mm) | Scales |
|---|---|---|
| Tick length, outward from the axis | 0.5 | no |
| Tick text to tick mark | 0.5 | yes |
| Axis title to tick text (y: to the widest label, ≤ 4 characters) | 0.6 | yes |
| Axis title, ink to the cell edge | 1.0 | yes |
| Head, ink to the cell's top edge | 1.0 | yes |
| Head to plot | 0.6 | yes |
| Right margin | 2.0 | no |

- **Base** values hold for the reference cell, 30 × 24 mm. For a cell of w × h,
  the scale is s = √(w·h / (30·24)), and each scaling gap is its base times
  1 + d·(s − 1). The discount d is 0.5 in the specimen (`gap-discount` in
  `spec-lib.typ`); 0.3 keeps the gaps tighter.
- **Margins** follow from the sums: left = title edge gap + title (cap + descender)
  + title gap + label width + tick-text gap + tick; top = edge gap + head
  (cap + descender) + head gap; bottom = tick + tick-text gap + tick text +
  title gap + title + edge gap. The label width is the widest y tick label, at
  least 4.2 mm (four characters at 5 pt); the tick text is the x tick labels' cap
  height, at least 1.2 mm (5 pt). Longer or larger labels grow the margin. For the reference cell that is 8.8 / 3.6 / 2.0 /
  5.8 mm (left / top / right / bottom); a 100 × 175 mm cell gets 12.9 / 6.7 / 2.0 /
  9.9 mm.
- Titles sit against the cell edge and tick text against the ticks, so both keep
  their place when labels change.
- The y title reads upward, rotated in the left margin and centred on the axis; the
  x title is right-aligned under the ticks. The rotated y title is this format's
  rule; core keeps it horizontal above the axis (`../../core/charts.md`).
- `specimen-panel.typ` draws the reference panel at 5× with each distance
  dimensioned (`out/specimen-panel.pdf`, `.png`). `margins()` in `spec-lib.typ`
  computes the margins from the measured tick labels; the figure specimen shares it.

Three habits keep panels aligned and inside their margins:

- Tick labels stay short, so the margins stay at their defaults. "0.01" fits;
  "120,000" grows the left margin — rescale the axis or move the factor into the
  title ("Length (×10³ µm)"). Where one panel's labels grow its margin, give the
  panels of its row the same margin, so their axes align.
- The head is one line. Longer titles belong in the legend.
- Units, n and callouts live inside the plot area, not in the margins.

### Ticks

- Every axis has a tick at its start and at its end.
- A small plot (one fifth of the figure width or narrower, or the same in height) can
  carry just those two.
- A larger plot carries at least three ticks per axis: the start, the end and a
  round value between.
- On a heatmap or a categorical axis, the first and last categories take the ticks.

**In matplotlib** place the axes at the margins' fractions of the figure, and
embed TrueType so text stays text:

```python
from matplotlib import pyplot as plt

mm = 1 / 25.4
plt.rcParams["pdf.fonttype"] = 42
fig = plt.figure(figsize=(89 * mm, 34 * mm))
# an 89 x 34 mm cell: left 9.9, bottom 6.9, width 77.1, height 22.7 mm, as figure fractions
ax = fig.add_axes([9.9 / 89, 6.9 / 34, 77.1 / 89, 22.7 / 34])
fig.savefig("panel-a.pdf")  # never bbox_inches="tight": it crops the margins away
```

Set the type roles on top of this: 5 pt tick labels, 6 pt titles
(`ax.tick_params(labelsize=5)`). Matplotlib's axes, ticks and their text are black
by default; keep them so.

**In ggplot** fix the panel size and save through cairo so fonts embed:

```r
library(ggplot2)
library(egg)

p <- ggplot(...) +
  theme_classic(base_size = 6) +                                # pt: the axis role
  theme(axis.text = element_text(size = 5, colour = "black"),   # the tick role
        axis.title = element_text(colour = "black"),
        axis.line = element_line(colour = "black", linewidth = 0.5 / .pt),
        axis.ticks = element_line(colour = "black", linewidth = 0.5 / .pt),
        axis.ticks.length = unit(0.5, "mm"))
p <- egg::set_panel_size(p, width = unit(77.1, "mm"), height = unit(22.7, "mm"))
ggsave("panel-a.pdf", p, width = 89, height = 34, units = "mm", device = cairo_pdf)
```

To assemble panels side by side, give patchwork each column's width:
`p1 + p2 + plot_layout(widths = unit(c(77.1, 77.1), "mm"))`.

## Composite panels

A composite panel has one letter, one head and one legend sentence over several
plot areas that share axes: a scatter with marginal histograms, a heatmap with a
column of counts, a patient timeline's tracks. The panel contract's margins frame
the whole cell, so the outer axes align with the neighbouring panels; the extra
plot areas come out of the plot area. Two specimens draw the arrangements at scale with each distance
dimensioned: `specimen-marginal.typ` (marginal strips) and
`specimen-multitrack-timeline.typ` (a track stack), compiled to `out/` as PDF and
PNG. The constants are in `spec-lib.typ`.

**Marginal strips** sit on the top or right of the main plot and share its axis.

| Distance | mm |
|---|---|
| Strip to the main plot area | 1.0 |
| Strip depth (3–6 mm; at most a quarter of the main plot) | 4.0 |

- The shared axis carries ticks only on the main plot.
- A strip has no axis title; its scale goes in the legend. It carries one tick, at
  the round number at or just above its peak (80k, 150k), and its scale runs to that
  tick. The tick sits in the main plot's tick column so it adds no margin.
- Strips are `context` grey, or the main plot's colour at its middle step.

**A track stack** sets tracks one above another under one shared axis.

| Distance | mm |
|---|---|
| Track height: value track (a line, with its own y axis) | 6.0 |
| Track height: event row, lane (a heat strip or intervals) | 2.5 |
| Between tracks, with a 0.25 pt `rule` hairline in the gap | 0.5 |
| Group header row, above each group's first track | 2.5 |
| Track label to the value ticks, or to the plot | 1.0 |

- One shared axis, on top when the stack reads in time; the x title right-aligns
  above the tick labels. The bottom margin is then the edge gap alone.
- Track labels (6 pt, 400, ink) right-align in a label column. The column is as wide
  as the widest label and grows the left margin; wrap a long label onto two lines
  before it grows the column past a fifth of the cell.
- Group headers take the `group` role, flush with the cell's left edge gap.
- Value tracks carry a y axis with two ticks at round numbers. Their labels sit left
  of the axis, between the label column and the ticks, and within the track's
  height: the top label hangs from the track's top edge and the bottom one stands on
  its bottom edge, so neighbouring tracks never collide and no label touches the
  data. Events and lanes carry no axis.
- Hairlines run from the label column to the plot's right edge; no track has a box.
- A black 0.5 pt rule marks the start time: it runs down from the time axis through
  every track, over lanes and under marks, and the value tracks' y axes sit on it.
- When the tracks do not fit the cell, drop tracks (keep the top-ranked lanes and
  say so in the legend) before shrinking type or track heights.

## Lines and marks

Canvas px from the core docs become these pt values at print size.

| Element | Canvas | Print |
|---|---|---|
| Axis, tick | 1.5 px, 5 px long | 0.5 pt black, 0.5 mm long, outward |
| Data line, step curve | 2.5 px | 1 pt |
| Reference line | 1.5 px, `2 4` dash | 0.5 pt, `1 2` dash |
| Confidence interval line | 2 px | 0.75 pt |
| Point | r 4.5, 1 px paper ring | r 1.5 pt, 0.25 pt paper ring |
| Point, dense beeswarm | r 3 | r 1 pt |
| Summary bar | 3 px | 1 pt, with a 0.5 pt paper halo |
| Paper gap (segments, cells) | 2 px | 0.5 pt |

Strokes stay between 0.5 and 1 pt, which every journal accepts (Nature 0.25–1 pt,
Science from 0.5 pt, Cell Press 0.5–1.5 pt).

## Colour

- The core palettes carry over as they are (`../../core/color.md`). They are
  validated for colour-vision deficiency, which journals ask for.
- **Labels are ink.** Nature and Science ask for black or grey text, so a direct label
  is set in `ink` beside its mark (core's `label` is `ink-2`; print takes the darker
  step for legibility at 7 pt), with a short swatch or line key in the series
  colour where the link needs it.
- Export in RGB. Science asks for CMYK at first submission; convert then.

## Layout

- **Margins.** Journals ask for a figure cropped to its final size, so a figure has
  no border of its own. A preview on a Letter page locks its margins: 6 mm at left
  and right, 8 mm at top and bottom. The figure fills the rest.
- **Guidelines divide the plotting space.** Cut the height into rows and each row's
  width into equal columns: halves, thirds, quarters, fifths or sixths, with one
  gutter (3–6 mm; 2 mm for a small, dense figure) between units. Each guideline set gives units; a panel takes one
  unit or several adjacent ones (and the gutters between them). Rows may use
  different column counts.
- **Typical rows.** Divide the row, then give each panel whole units: four columns,
  panels a and b one unit each, panel c two.
- **Atypical rows.** Columns of one row may divide differently. A large panel takes
  a whole column or several row units, and the neighbouring column divides on its own
  into halves, thirds or more: panel d one unit, the other column in thirds with e
  taking two and f one. Every panel still takes whole units.
- **Letter zone.** Each panel's top-left corner holds its letter in a 5 mm square.
  No plot element, image or text enters the square: charts keep it free through the
  panel contract's margins, and an image starts below it.
- Each panel reserves the margins of the panel contract (above), so axes align
  across a row.
- Repeated panels share axes and labels (form 10, small multiples): label the y-axis
  once per row and the x title once per column. Small multiples sit one gutter
  apart, 2 mm at the least.
- Keys and legends sit above the plot or beside it, inside the panel.
- Micrographs carry a scale bar, labelled with its length.

## Figure legend

The legend is the figure's text, set in the paper, not in the figure.

- **Title:** one sentence stating the finding, in the paper's words, with its hedge.
- **Then one sentence per panel,** by letter: what is plotted, n per group, what the
  centre and the spread are (median, mean ± SD, 95 % CI), and the test with its exact
  *P* value.
- Name what a mark stands for once ("each dot is one patient").

## Statistics on the page

- Show each observation where n allows (form 09); journals ask for individual points
  at small n, and Nature journals for points or box plots from n > 5.
- Say in the legend what every error bar is.
- Nature journals keep the leading zero on every decimal (C-index 0.78,
  *P* = 0.16), which overrides the core rule for bounded metrics
  (`../../core/typography.md`). The ticks on one axis share their decimal places
  (0.50, 0.75, 1.00).
- A statistics block inside the plot area (n, *P*, C-index) takes the `tick` role,
  5 pt, so it fits a small panel's empty corner.
- Give exact *P* values in the figure (`../../core/typography.md`). In a dense
  panel, where many comparisons share the space (a grouped dumbbell, a row of
  tests per cohort), stars may stand in: * *P* < 0.05, ** *P* < 0.01,
  *** *P* < 0.001, and "ns"; the legend defines them and gives the test, and the
  exact values go in a supplementary table.
- PNAS asks for numerical axes from zero (log axes excepted); PNAS figures start
  position axes at 0 too.

## Export

| Content | Format | Resolution at print size |
|---|---|---|
| Charts, schematics, text | Vector PDF (or EPS, SVG), fonts embedded as TrueType (matplotlib `pdf.fonttype 42`), text editable | – |
| Photographs, micrographs | TIFF (LZW) | 300 dpi; Nature 450 dpi |
| Images with text or thin lines | TIFF, or the image embedded in the vector PDF | 600 dpi |
| One-colour line art as raster | TIFF | 1,000 dpi |

- One file per figure, with all its panels, named `fig<n>.pdf`.
- Keep the source (script and data) next to each figure in the project, so a
  revision re-runs.

## Assembling with Typst

Panels come out of the project's tool at final size (*Export*), and `fig.typ` puts
them on one page: the page from a journal preset, panel letters in the journal's
style, the guidelines (*Layout*), and the type roles. Colours read from
`../../core/tokens.json`.

`fig-span` cuts a length, or a span it returned, into equal units with gutters, and
returns the units a panel takes. `fig-at` places a panel in the cell two spans make.
One call covers rows, columns, and a column that divides on its own:

```typst
#import "design-system/formats/publication/fig.typ": *

#let (W, H) = (183mm, 120mm)
#fig-page(journal: "nature", width: W, height: H)[
  #let row(i, k: 1) = fig-span(H, 3, i, k: k)   // three row units
  // Row 1, typical: four columns; a and b one unit each, c two.
  #fig-at(fig-span(W, 4, 0), row(0), fig-panel("a", path("panels/a.svg")))
  #fig-at(fig-span(W, 4, 1), row(0), fig-panel("b", path("panels/b.pdf")))
  #fig-at(fig-span(W, 4, 2, k: 2), row(0), fig-panel("c", path("panels/c.svg")))
  // Rows 2–3, atypical: d takes the left half; the right half in thirds.
  #let lower = row(1, k: 2)
  #fig-at(fig-span(W, 2, 0), lower, fig-panel("d", path("panels/d.png")))
  #fig-at(fig-span(W, 2, 1), fig-span(lower, 3, 0, k: 2), fig-panel("e", path("panels/e.svg")))
  #fig-at(fig-span(W, 2, 1), fig-span(lower, 3, 2), fig-panel("f", path("panels/f.svg")))
]
```

Give files as `path("…")`, so they resolve from your file rather than from `fig.typ`.
A vector panel (SVG, PDF) goes in at its own size, as exported, and keeps the letter
zone free through its margins. A raster (PNG, JPG) fills the panel's width below the
zone. `below-zone: true` or `false` overrides the choice.

For a figure whose rows all divide into the same columns, `fig-grid` is shorter:
`#fig-grid(columns: 2, fig-panel("a", path("a.svg")), fig-panel("b", path("b.svg")))`
on a page of `height: auto`.

| Helper | Job |
|---|---|
| `fig-page` | The page: journal preset × column width (or a length), height in mm or auto, margin 0 |
| `fig-span` | `fig-span(of, n, i, k: 1, gutter: 3mm)`: of a length or span, `n` units, the `k` from unit `i` (0-based), gutters included; returns `(at:, len:)` |
| `fig-at` | `fig-at(x, y, body)`: places `body` (content, or `(w, h) => content`) in the cell of spans `x` and `y`; needs a fixed page height |
| `fig-grid` | Equal columns in every row: 3 mm gutter (3–6 mm, down to 2 mm), rows sized to their panels |
| `fig-panel` | The letter in the 5 mm letter zone at the panel's top-left, over content or a `path(…)` file |
| `fig-letter` | A panel letter in the journal's style |
| `letter-zone` | The letter zone's side, 5 mm |
| `head`, `axis`, `label`, `tick`, `cap`, `note`, `group` | The type roles |

Build from the project root, where the design system sits at `design-system/`:

```bash
typst compile --font-path design-system/core/fonts fig1.typ                     # writes fig1.pdf
typst compile --font-path design-system/core/fonts --format png --ppi 300 fig1.typ  # a preview
typst watch --font-path design-system/core/fonts fig1.typ                      # rebuild as you edit
typst fonts --font-path design-system/core/fonts                               # what Typst sees
```

- `typst fonts` should list IBM Plex Sans; if it does not, check `--font-path`.
- The vendored static TTFs register the 500 weight under IBM's legacy family name
  ("IBM Plex Sans Medm"); `fig.typ` resolves it, so `weight: 500` just works.
- Cell Press figures need Arial, which is not vendored: install it and add its
  folder to `--font-path`. Arial has no 500 weight, so `head` and `axis` set as 400.
- Panels import as SVG, PDF, PNG or JPG. Convert TIFF panels to PNG at their
  submission resolution for assembly; keep the TIFFs for submission.
- SVG text stays text in the PDF when the SVG names IBM Plex Sans and the fonts
  are on `--font-path`.
- Compiling a specimen inside the design system itself needs its root:
  `typst compile --root . …` from the repo root.

## Specimen

`specimen-figure.typ` compiles to `out/specimen-figure.pdf` and `.png`: a US Letter
page with the locked margins (6 mm at the sides, 8 mm at top and bottom) and a
203.9 × 263.4 mm figure. Red guides mark the distances: margins, row and column
units, gutters (3 mm), the letter zone (5 mm), the contract's margins (panel c) and
each plot area (dashed). It is wider than any journal column, so it shows the
layout, not a submission size.

The height is six units of 41.4 mm, laid out with `fig-span` and `fig-at`. Each row
divides its width its own way:

| Row | Columns | Panels |
|---|---|---|
| 1, typical | 4 × 48.7 mm | a, b one unit each; c two units |
| 2, atypical | 2 × 100.5 mm, height 4 units; right column in thirds | d takes the left column; e two thirds of the right; f one third |
| 3, typical | 3 × 66.0 mm | g one unit; h two units |

Its raster panel is `specimen-micrograph.html`, a text-free cell field drawn with
the abstract kit and rendered to `out/specimen-micrograph.png` with
`../abstract/kit/render.cjs`.

`specimen-marginal.typ` and `specimen-multitrack-timeline.typ` compile to
`out/specimen-marginal.pdf`, `out/specimen-multitrack-timeline.pdf` and their PNGs: the
two composite arrangements (*Composite panels*), a scatter with marginal strips at 3×
and a track stack at 1.8×, with the distances dimensioned in real mm.

## Graphical abstracts for journals

Cell Press journals ask for a square graphical abstract: 1,200 × 1,200 px, Arial
8–12 pt, TIFF, PDF or JPG. `../abstract/README.md` covers the 16:9 canvas.

## Sources

Links to each journal's guidelines are in the root `README.md`, *Sources*. The
Science, Cell Press and PNAS values come from 2022–2024 copies of their pages.
