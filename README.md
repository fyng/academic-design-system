# kare

Named for [Susan Kare](https://en.wikipedia.org/wiki/Susan_Kare).

The shared design system for Feiyang Huang's academic work: websites, journal
figures, graphical abstracts, charts and schematics. Projects pull it in as a git
submodule, build with it, and send improvements back here so every project gets them.

It has a **core** that every format shares, and one folder per **format** that adds
what its medium needs.

| Part | For | Entry point |
|---|---|---|
| **Core** | Principles, voice, and the elements: colour, typography, charts, icons, illustration, tokens | [`core/README.md`](core/README.md) |
| **Web** (Instrument / Prussian) | Personal and project websites | [`formats/web/README.md`](formats/web/README.md) |
| **Publication** | Journal figures (Nature, Science, Cell and similar) | [`formats/publication/README.md`](formats/publication/README.md) |
| **Abstract** (Lamina canvas) | Graphical abstracts, animated and still | [`formats/abstract/README.md`](formats/abstract/README.md) |

Every format shares white paper, the same ink (`#16181d`), Prussian blue (`#1f4e79`),
a vermilion accent, IBM Plex Sans for reading, and hairlines in place of boxes. That way
a figure sits naturally on a web page or in a paper. The formats differ where the job
differs: the web adds a serif display face and a dark theme; publication sets sizes in
mm and pt; the abstract adds a canvas, an arc and motion.

## What's here

| Path | What |
|---|---|
| `core/*.md` | The shared elements: `color.md`, `typography.md`, `charts.md`, `icons.md`, `illustration.md` |
| `core/tokens.mjs` → `tokens.css`, `tokens.json` | Every colour and font value. Edit `tokens.mjs`, run `node core/tokens.mjs` |
| `core/fonts/ibm-plex-sans/` | Vendored IBM Plex Sans static TTFs (SIL OFL) for print figures |
| `core/specimen-*.html` → `core/out/*.png` | Reference sheets for colour, scales and charts |
| `formats/web/scss/instrument-prussian/` | The web format in Sass: `_tokens.scss` (framework-agnostic) and `_al-folio.scss` (al-folio adapter) |
| `formats/publication/` | The journal figure spec: the panel contract, composite panels, `fig.typ` that assembles figures in Typst, and the specimens (`specimen-figure.typ`, `specimen-panel.typ`, `specimen-marginal.typ`, `specimen-multitrack-timeline.typ`, sharing `spec-lib.typ`) |
| `formats/abstract/kit/` | The abstract kit: `ga-kit.css`/`ga-kit.js` (layout, type roles, motion, lint), `ga-bio.js`, `ga-charts.js`, `icons.js`, and `render.cjs` (PNG/MP4/WebM renderer) |

## Using it in a project

Add it as a submodule at `design-system/` (the name the docs and the reference site use):

```bash
git submodule add https://github.com/fyng/kare.git design-system
git config -f .gitmodules submodule.design-system.branch main
```

Anyone cloning the project then runs `git clone --recurse-submodules …`, or
`git submodule update --init` in an existing clone. CI needs `submodules: true` on
`actions/checkout`; while this repo is private, also pass a token that can read it
(see fyng.github.io's `.github/workflows/deploy.yml`).

Then follow the format's README: *Using it* in `formats/web/README.md` for a site,
*The kit* in `formats/abstract/README.md` for a graphical abstract.

## Contributing

Every project that uses the system can improve it. Change it here, not in a copy.

1. In the project, work inside the submodule: `cd design-system && git switch -c <branch>`.
2. Make the change, and keep the docs and the code in step: a new token, rule or kit
   feature is documented in the matching core or format README in the same commit.
   Shared guidance goes in `core/`; guidance for one medium goes in its format.
3. Regenerate what is generated: `node core/tokens.mjs` after editing tokens, then
   re-render the specimens it affects (`node formats/abstract/kit/render.cjs core/specimen-color.html --still`
   writes `core/out/specimen-color.png`). Every image in an `out/` folder comes from a
   specimen page in the repo, so a token or kit change shows up in the specimens.
4. Push the branch and open a pull request here. Keep it about the system; anything
   that only one project needs (a page layout, a figure) stays in that project.
5. Once it merges, bump the pointer in each project that should pick it up:
   `git submodule update --remote design-system`, then commit `design-system`.

Changes are shared by every consumer, so prefer additive changes (a new token, a new
adapter, a new kit helper) over changing existing values. When an existing value, path
or kit API must change, say so in the pull request and check the consumers you know of.
See [`CLAUDE.md`](CLAUDE.md) for the same rules written for coding agents.

## Sources

The system draws on these works. Thanks to their authors.

**Charts**

- Chenxin Li, [*Friends Don't Let Friends Make Bad Graphs*](https://github.com/cxli233/FriendsDontLetFriends)
  ([doi:10.5281/zenodo.7542491](https://doi.org/10.5281/zenodo.7542491)), MIT licence.
  The source of chart forms 09–14, the grouped heatmap and the capped scale.
- The figures that chart forms 18–21 are drawn from:
  - count matrix (18) and radial track stack (21): The ICGC/TCGA Pan-Cancer Analysis
    of Whole Genomes Consortium, [Pan-cancer analysis of whole genomes](https://doi.org/10.1038/s41586-020-1969-6),
    *Nature* 2020, Fig. 2
  - dot matrix (19): Alexandrov et al., [The repertoire of mutational signatures in
    human cancer](https://doi.org/10.1038/s41586-020-1943-3), *Nature* 2020, Fig. 3
  - labelled embedding (20): Bergen et al., [Generalizing RNA velocity to transient
    cell states through dynamical modeling](https://doi.org/10.1038/s41587-020-0591-3),
    *Nature Biotechnology* 2020, Fig. 2a; the atlas: [A multimodal and temporal
    foundation model for virtual patient representations at healthcare system
    scale](https://arxiv.org/abs/2604.18570), arXiv 2026, Fig. 2a–c
- The glyph grammar, chart forms 22–26 (body map, route map, clone tree, swimmer
  plot, unit columns), the categorical heatmap (07) and the named part (08): Hessey, Bunkum,
  Huebner et al., [Evolutionary characterization of lung cancer
  metastasis](https://doi.org/10.1038/s41586-026-10428-4), *Nature* 2026, Figs 1–5

**Journal figure guidelines** (`formats/publication/README.md`)

- Nature: [final submission](https://www.nature.com/nature/for-authors/final-submission)
  and [research figure guide](https://research-figure-guide.nature.com/figures/preparing-figures-our-specifications/)
- Science: [preparing an initial manuscript](https://www.science.org/content/page/instructions-preparing-initial-manuscript)
  and [preparing a revised manuscript](https://www.science.org/content/page/instructions-preparing-revised-manuscript)
- Cell Press: [figure guidelines](https://www.cell.com/figure-guidelines)
  and [graphical abstract guidelines](https://www.cell.com/pb/assets/raw/shared/figureguidelines/GA_guide-1537202744020.pdf)
- PNAS: [submitting your manuscript](https://www.pnas.org/author-center/submitting-your-manuscript)
  and [digital art guidelines](https://www.pnas.org/pb-assets/authors/digitalart-1675347574760.pdf)
- NEJM: [technical guidelines for figures](https://www.nejm.org/pb-assets/pdfs/TechnicalGuidelines_2025-1758311142233.pdf)

**Type, icons and colour**

- [IBM Plex](https://github.com/IBM/plex) (SIL Open Font License) and
  [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (SIL Open Font License)
- [Health Icons](https://healthicons.org) (MIT), via `@iconify-json/healthicons`
- The body map's anatomy: the male anatomogram from [Expression Atlas](https://www.ebi.ac.uk/gxa/),
  EMBL-EBI ([`@ebi-gene-expression-group/anatomogram`](https://www.npmjs.com/package/@ebi-gene-expression-group/anatomogram)
  2.4.0), CC BY 4.0; curated to an outline, a silhouette and twelve organs in
  `formats/abstract/kit/anatomy.js`
- Björn Ottosson, [OKLab](https://bottosson.github.io/posts/oklab/): the space the hue ramps are built in
- Machado, Oliveira and Fernandes, [a physiologically based model for simulating colour
  vision deficiency](https://doi.org/10.1109/TVCG.2009.113), IEEE TVCG 2009: the CVD check
- Nuñez, Anderton and Renslow, [cividis](https://doi.org/10.1371/journal.pone.0199239),
  PLOS ONE 2018
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) contrast minimums

**Web**

- [al-folio](https://github.com/alshedivat/al-folio), the Jekyll theme the web adapter targets
