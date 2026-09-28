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
| `head` | 7 pt | 500 | ink | Optional panel title, one line |
| `axis` | 7 pt | 500 | ink-2 | Axis titles |
| `label` | 7 pt | 400 | ink | Direct labels, row and column names |
| `tick` | 6 pt | 400 | muted | Tick labels, keys |
| `cap`, `note` | 6 pt | 400 | muted | n, scale bars, callouts |

- These sizes sit inside every journal's range (Nature: 5–7 pt, panel letters 8 pt;
  Science: from 5 pt; Cell Press: 6–8 pt; PNAS: from 6 pt).
- Every figure in a paper uses the same sizes, so figures read as one set.
- Panel letters are the one bold text, because journals ask for it:

| Journal | Panel letters |
|---|---|
| Nature, preprints | Lowercase, 8 pt bold, upright: **a**, **b** |
| Science | Capitals, 10 pt bold, upper left of each part; inside the edge of an image: **A**, **B** |
| Cell Press, PNAS, NEJM | Capitals, 8 pt bold: **A**, **B** |

- Colours come from the core roles (`../../core/typography.md`); labels are ink
  because journals ask for black or grey text.

## The panel contract

Every panel reserves the same margins around its plot area, so axes align across
panels drawn by any tool. The values fit the type above with 1 mm gaps.

| Edge | Reserves | mm |
|---|---|---|
| Left | y ticks (2 pt), their labels (6 pt, ≤ 5 characters), the y title (7 pt) | 12 |
| Bottom | x ticks, their labels, the x title (7 pt) | 9 |
| Top | `head` or a key, one line (7 pt) | 6 |
| Right | nothing | 2 |

A Nature 1-column panel of 89 × 34 mm therefore has a plot area of 75 × 19 mm.
Three habits keep a panel inside the contract:

- Tick labels stay ≤ 5 characters. "0.001" fits; "120,000" does not — rescale the
  axis or move the factor into the title ("Length (×10³ µm)").
- The head is one line. Longer titles belong in the legend.
- Units, n and callouts live inside the plot area, not in the margins.

**In matplotlib** place the axes at the contract's fractions of the figure, and
embed TrueType so text stays text:

```python
from matplotlib import pyplot as plt

mm = 1 / 25.4
plt.rcParams["pdf.fonttype"] = 42
fig = plt.figure(figsize=(89 * mm, 34 * mm))
# left 12, bottom 9, width 75, height 19 mm, as figure fractions
ax = fig.add_axes([12 / 89, 9 / 34, 75 / 89, 19 / 34])
fig.savefig("panel-a.pdf")  # never bbox_inches="tight": it crops the margins away
```

Set the type roles on top of this: 6 pt tick labels, 7 pt titles (`ax.tick_params(labelsize=6)`).

**In ggplot** fix the panel size and save through cairo so fonts embed:

```r
library(ggplot2)
library(egg)

p <- ggplot(...) +
  theme_gray(base_size = 7) +                                   # pt
  theme(axis.text = element_text(size = 6))                     # the tick role
p <- egg::set_panel_size(p, width = unit(75, "mm"), height = unit(19, "mm"))
ggsave("panel-a.pdf", p, width = 89, height = 34, units = "mm", device = cairo_pdf)
```

To assemble panels side by side, give patchwork each column's width:
`p1 + p2 + plot_layout(widths = unit(c(75, 75), "mm"))`.

## Lines and marks

Canvas px from the core docs become these pt values at print size.

| Element | Canvas | Print |
|---|---|---|
| Axis, tick | 1.5 px, 5 px long | 0.5 pt, 2 pt long, outward |
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
  is set in `ink-2` beside its mark, with a short swatch or line key in the series
  colour where the link needs it.
- Export in RGB. Science asks for CMYK at first submission; convert then.

## Layout

- Panels sit on a shared grid: axes aligned across a row, the same plot height in a
  row, the same gutter throughout (4–6 mm). Each panel reserves the margins of the
  panel contract (above).
- A panel letter sits at the top-left of its panel, outside the plot area, on the
  line of the panel's top edge.
- Repeated panels share axes and labels (form 10, small multiples): label the y-axis
  once per row and the x title once per column.
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
style, the grid, and the type roles. Colours read from `../../core/tokens.json`.

```typst
#import "design-system/formats/publication/fig.typ": *

#fig-page(journal: "nature", width: "full", height: auto)[
  #fig-grid(columns: 2,
    fig-panel("a", "panels/a.svg"),
    fig-panel("b", "panels/b.png", width: 40mm),
  )
]
```

| Helper | Job |
|---|---|
| `fig-page` | The page: journal preset × column width (or a length), height in mm or auto, margin 0 |
| `fig-grid` | The panel grid: 5 mm gutter (4–6 mm), one shared height per row |
| `fig-panel` | The letter on the panel's top edge, then the file at scale 1 by width |
| `fig-letter` | A panel letter in the journal's style |
| `head`, `axis`, `label`, `tick`, `cap`, `note` | The type roles |

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

## Graphical abstracts for journals

Cell Press journals ask for a square graphical abstract: 1,200 × 1,200 px, Arial
8–12 pt, TIFF, PDF or JPG. `../abstract/README.md` covers the 16:9 canvas.

## Sources

Links to each journal's guidelines are in the root `README.md`, *Sources*. The
Science, Cell Press and PNAS values come from 2022–2024 copies of their pages.
