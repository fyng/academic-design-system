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
| [`INDEX.md`](INDEX.md) | Generated map of every doc, chart form, specimen and kit file. Start here to find something |
| `core/*.md` | The shared elements: `color.md`, `typography.md`, `icons.md`, `illustration.md` |
| `core/charts/` | Charts: `README.md` (choosing a form, the grammar, glyphs, the form file) and `forms/NN-name.md`, one file per chart form holding its rules and the code of its figures, rendered to `core/charts/forms/out/`; `core/charts/out/sheet-<family>.png` lays out each family's figures |
| `core/tokens.mjs` → `tokens.css`, `tokens.json` | Every colour and font value. Edit `tokens.mjs`, run `node core/tokens.mjs` |
| `core/fonts/ibm-plex-sans/` | Vendored IBM Plex Sans static TTFs (SIL OFL) for print figures |
| `core/specimen-*.html` → `core/out/*.png` | Reference sheets for colour and scales |
| `kit/` | The HTML kit that draws every non-Typst specimen and graphical abstract: `ga-kit.css`/`ga-kit.js` (layout, type roles, motion, lint), `ga-charts.js`, `ga-bio.js`, `anatomy.js`, `icons.js`, `render.cjs` (PNG/MP4/WebM renderer, and the figure blocks of Markdown specs) and `figures.cjs` (reads figure blocks) |
| `formats/web/scss/instrument-prussian/` | The web format in Sass: `_tokens.scss` (framework-agnostic) and `_al-folio.scss` (al-folio adapter) |
| `formats/publication/` | The journal figure spec: the panel contract, composite panels, `fig.typ` that assembles figures in Typst, and the specimens (`specimen-figure.typ`, `specimen-panel.typ`, `specimen-marginal.typ`, `specimen-multitrack-timeline.typ`, sharing `spec-lib.typ`) |
| `formats/abstract/` | The graphical abstract: canvas, arc, text, type sizes and motion |
| `tools/index.mjs`, `tools/sheets.mjs` | `index.mjs` writes `INDEX.md` and checks that paths, form files, figures, specimens and kit calls agree (`npm run check`); `sheets.mjs` writes the contact sheets (`npm run figures`) |

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
`kit/README.md` for a graphical abstract or any kit-drawn figure, *Assembling with Typst*
in `formats/publication/README.md` for a journal figure.

## Contributing

Every project that uses the system can improve it. Change it here, not in a copy.

1. In the project, work inside the submodule: `cd design-system && git switch -c <branch>`.
2. Make the change, and keep the docs and the code in step: a new token, rule or kit
   feature is documented in the matching core or format README in the same commit.
   Shared guidance goes in `core/`; guidance for one medium goes in its format. A new
   chart form takes the next number and its own file, `core/charts/forms/NN-name.md`
   (copy an existing one: `core/charts/README.md`, *Figures*, describes the file).
3. Regenerate what is generated: `node core/tokens.mjs` after editing tokens, then
   re-render the specimens it affects (`node kit/render.cjs core/specimen-color.html --still`
   writes `core/out/specimen-color.png`). Every image in an `out/` folder comes from a
   specimen in the repo, so a token or kit change shows up in the specimens. After
   editing a form's figure, `npm run figures` renders it and rewrites the contact
   sheets (`node kit/render.cjs core/charts/forms/*.md --all` first after a kit change).
   Then run `npm run check`, which rewrites `INDEX.md` and fails on a broken path, a
   form file without its front matter, a stale figure, or a kit call that does not exist.
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
[`ACKNOWLEDGEMENTS.md`](ACKNOWLEDGEMENTS.md) credits the work behind each chart form, the
glyph grammar and the body map's anatomy.

**Type, icons and colour**

- [IBM Plex](https://github.com/IBM/plex) (SIL Open Font License) and
  [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (SIL Open Font License)
- [Health Icons](https://healthicons.org) (MIT), via `@iconify-json/healthicons`
- Björn Ottosson, [OKLab](https://bottosson.github.io/posts/oklab/): the space the hue ramps are built in
- Machado, Oliveira and Fernandes, [a physiologically based model for simulating colour
  vision deficiency](https://doi.org/10.1109/TVCG.2009.113), IEEE TVCG 2009: the CVD check
- Nuñez, Anderton and Renslow, [cividis](https://doi.org/10.1371/journal.pone.0199239),
  PLOS ONE 2018
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) contrast minimums

**Web**

- [al-folio](https://github.com/alshedivat/al-folio), the Jekyll theme the web adapter targets
