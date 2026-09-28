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

| Role | Size | Weight | Use |
|---|---|---|---|
| Panel letter | 8 pt | Bold | `a`, `b`, `c` at each panel's top-left |
| `head` | 7 pt | 500 | Optional panel title, one line |
| `axis` | 7 pt | 500 | Axis titles |
| `label` | 7 pt | 400 | Direct labels, row and column names |
| `tick` | 6 pt | 400 | Tick labels, keys |
| `cap`, `note` | 6 pt | 400 | n, scale bars, callouts |

- These sizes sit inside every journal's range (Nature: 5–7 pt, panel letters 8 pt;
  Science: from 5 pt; Cell Press: 6–8 pt; PNAS: from 6 pt).
- Every figure in a paper uses the same sizes, so figures read as one set.
- Panel letters are the one bold text, because journals ask for it:

| Journal | Panel letters |
|---|---|
| Nature, preprints | Lowercase, 8 pt bold, upright: **a**, **b** |
| Science | Capitals, 10 pt bold, upper left of each part; inside the edge of an image: **A**, **B** |
| Cell Press, PNAS, NEJM | Capitals, 8 pt bold: **A**, **B** |

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
| Bar corner | 4 px | 0.75 pt |
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
  row, the same gutter throughout (4–6 mm).
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

## Graphical abstracts for journals

Cell Press journals ask for a square graphical abstract: 1,200 × 1,200 px, Arial
8–12 pt, TIFF, PDF or JPG. `../abstract/README.md` covers the 16:9 canvas.

## Sources

Links to each journal's guidelines are in the root `README.md`, *Sources*. The
Science, Cell Press and PNAS values come from 2022–2024 copies of their pages.
