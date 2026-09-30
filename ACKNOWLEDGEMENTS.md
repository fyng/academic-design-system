# Acknowledgements

The chart forms below, the glyph grammar and the body map's anatomy were drawn from
published work. kare re-draws each idea in its own grammar (`core/charts/`) on
synthetic data; no figure is reproduced. Thanks to the authors. This file is the one
place that credits a form; each form file names its sources in its front matter.

## Figures that inspired a form

| Form or rule in `core/charts/` | Inspired by |
|---|---|
| Forms 09–14, the grouped heatmap (07), the capped scale (`core/color.md`) | Chenxin Li. [*Friends Don't Let Friends Make Bad Graphs*](https://github.com/cxli233/FriendsDontLetFriends) ([doi:10.5281/zenodo.7542491](https://doi.org/10.5281/zenodo.7542491)), MIT licence |
| [18 · Count matrix](core/charts/forms/18-count-matrix.md) | The ICGC/TCGA Pan-Cancer Analysis of Whole Genomes Consortium. [Pan-cancer analysis of whole genomes](https://doi.org/10.1038/s41586-020-1969-6). *Nature* (2020), Fig. 2b |
| [19 · Dot matrix](core/charts/forms/19-dot-matrix.md) | Alexandrov, L. B. et al. [The repertoire of mutational signatures in human cancer](https://doi.org/10.1038/s41586-020-1943-3). *Nature* (2020), Fig. 3 |
| [20 · Labelled embedding](core/charts/forms/20-labelled-embedding.md) | Bergen, V. et al. [Generalizing RNA velocity to transient cell states through dynamical modeling](https://doi.org/10.1038/s41587-020-0591-3). *Nature Biotechnology* (2020), Fig. 2a |
| [20 · Labelled embedding](core/charts/forms/20-labelled-embedding.md), atlas | [A multimodal and temporal foundation model for virtual patient representations at healthcare system scale](https://arxiv.org/abs/2604.18570). arXiv:2604.18570 (2026), Fig. 2a–c |
| [21 · Radial track stack](core/charts/forms/21-radial-track-stack.md) | The ICGC/TCGA Pan-Cancer Analysis of Whole Genomes Consortium. [Pan-cancer analysis of whole genomes](https://doi.org/10.1038/s41586-020-1969-6). *Nature* (2020), Fig. 2a |
| [*Glyphs*](core/charts/README.md) (grammar) | Hessey, S., Bunkum, A., Huebner, A. et al. [Evolutionary characterization of lung cancer metastasis](https://doi.org/10.1038/s41586-026-10428-4). *Nature* (2026), Figs 1–5 |
| [22 · Body map](core/charts/forms/22-body-map.md), with region dials | Hessey et al. (2026), Figs 1a and 4h |
| [23 · Route map](core/charts/forms/23-route-map.md) | Hessey et al. (2026), Figs 3d and 5a |
| [24 · Clone tree](core/charts/forms/24-clone-tree.md) | Hessey et al. (2026), Figs 3d and 5a |
| [25 · Swimmer plot](core/charts/forms/25-swimmer-plot.md) | Hessey et al. (2026), Fig. 1a |
| [26 · Unit columns](core/charts/forms/26-unit-columns.md) | Hessey et al. (2026), Fig. 1b |
| [07 · Heatmap](core/charts/forms/07-heatmap.md), categorical cells (oncoprint) | Hessey et al. (2026), Fig. 2a |
| [08 · Composition bars](core/charts/forms/08-composition-bars.md), a named part | Hessey et al. (2026), Fig. 2b |

## Artwork

The body map (forms 22 and 23) draws the male anatomogram from
[Expression Atlas](https://www.ebi.ac.uk/gxa/), EMBL-EBI
([`@ebi-gene-expression-group/anatomogram`](https://www.npmjs.com/package/@ebi-gene-expression-group/anatomogram)
2.4.0), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). kare vendors
a curated subset (the outline, the silhouette and twelve organs, with styles and labels
removed) in `kit/anatomy.js`.
