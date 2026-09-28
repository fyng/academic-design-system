# academic-design-system

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
| `core/specimen-*.html` → `core/out/*.png` | Reference sheets for colour and charts |
| `formats/web/scss/instrument-prussian/` | The web format in Sass: `_tokens.scss` (framework-agnostic) and `_al-folio.scss` (al-folio adapter) |
| `formats/publication/` | The journal figure spec |
| `formats/abstract/kit/` | The abstract kit: `ga-kit.css`/`ga-kit.js` (layout, type roles, motion, lint), `ga-bio.js`, `ga-charts.js`, `icons.js`, and `render.cjs` (PNG/MP4/WebM renderer) |

## Using it in a project

Add it as a submodule at `design-system/` (the name the docs and the reference site use):

```bash
git submodule add https://github.com/fyng/academic-design-system.git design-system
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
3. Regenerate what is generated: `node core/tokens.mjs` after editing tokens;
   re-render a specimen (`node formats/abstract/kit/render.cjs core/specimen-color.html --still`,
   then move `core/out/specimen-color.png` into place if needed) when its look changes.
4. Push the branch and open a pull request here. Keep it about the system; anything
   that only one project needs (a page layout, a figure) stays in that project.
5. Once it merges, bump the pointer in each project that should pick it up:
   `git submodule update --remote design-system`, then commit `design-system`.

Changes are shared by every consumer, so prefer additive changes (a new token, a new
adapter, a new kit helper) over changing existing values. When an existing value, path
or kit API must change, say so in the pull request and check the consumers you know of.
See [`CLAUDE.md`](CLAUDE.md) for the same rules written for coding agents.

