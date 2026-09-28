# academic-design-system

The shared design system for Feiyang Huang's academic work: websites, graphical
abstracts, charts and schematic figures. Projects pull it in as a git submodule, build
with it, and send improvements back here so every project gets them.

There are two systems, one for things people read in a browser and one for figures.

| System | For | Type | Entry point |
|---|---|---|---|
| **Instrument / Prussian** | Websites (fyng.github.io and project pages) | Instrument Serif display, IBM Plex Sans body, IBM Plex Mono labels | [`website/DESIGN.md`](website/DESIGN.md) |
| **Lamina** | Visual artifacts: graphical abstracts, charts, schematics | IBM Plex Sans throughout; Plex Mono for literal codes only | [`artifacts/DESIGN.md`](artifacts/DESIGN.md) |

They share white paper, the same ink (`#16181d`), Prussian blue (`#1f4e79`), a
vermilion accent, Plex Sans for reading, and hairlines instead of boxes. That way a
Lamina figure sits naturally on a website page. They differ where the job differs:
the website has an editorial serif voice and light and dark themes. Figures use a
single sans family, full semantic colour palettes, and are always light.

## What's here

| Path | What |
|---|---|
| `website/DESIGN.md` | Instrument / Prussian: typography, colour, chrome, embedding figures |
| `website/scss/instrument-prussian/` | The website system in Sass: `_tokens.scss` (framework-agnostic) and `_al-folio.scss` (al-folio adapter) |
| `website/specimen-website.html` → `website/out/specimen-website.png` | Reference sheet, both themes |
| `artifacts/DESIGN.md`, `typography.md`, `color.md`, `charts.md` | Lamina: principles, writing, canvas, motion, drawing biology, charts |
| `artifacts/tokens.mjs` → `tokens.css`, `tokens.json` | Lamina values. Edit `tokens.mjs`, run `node artifacts/tokens.mjs` |
| `artifacts/specimen-*.html` → `artifacts/out/specimen-*.png` | Lamina reference sheets |
| `kit/` | The Lamina kit: `ga-kit.css`/`ga-kit.js` (layout, type roles, motion, lint), `ga-bio.js` (cells, tissue, zooms), `ga-charts.js`, `icons.js`, and `render.cjs` (PNG/MP4/WebM renderer) |

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

**A Jekyll / al-folio site** adds the Sass folder to the load path and uses the adapter:

```yaml
# _config.yml
sass:
  load_paths:
    - _sass
    - design-system/website/scss
exclude:
  - design-system/
```

```scss
// a partial loaded last from assets/css/main.scss
@use "instrument-prussian/al-folio";
// ...then the project's own page-specific layout
```

**Any other Sass project** can `@use "instrument-prussian" as ip;` for the font stacks
(`ip.$font-display`, `ip.$font-body`, `ip.$font-mono`) and palettes (`ip.$light`,
`ip.$dark`, `@include ip.custom-properties(ip.$light)`).

**Figures** live in the project that publishes them. A figure page loads the kit by
relative path and is rendered from its own folder:

```html
<link rel="stylesheet" href="../design-system/kit/ga-kit.css">
<script src="../design-system/kit/icons.js"></script>
<script src="../design-system/kit/ga-kit.js"></script>
<script src="../design-system/kit/ga-bio.js"></script>
```

```bash
node ../design-system/kit/render.cjs my-figure.html   # -> out/my-figure.{png,mp4,webm,webp}
```

The renderer needs Playwright (resolved from the project's `node_modules`, or a global
install via `NODE_PATH=$(npm root -g)`) and ffmpeg.

## Contributing

Every project that uses the system can improve it. Change it here, not in a copy.

1. In the project, work inside the submodule: `cd design-system && git switch -c <branch>`.
2. Make the change, and keep the docs and the code in step: a new token, rule or kit
   feature is documented in the matching `DESIGN.md` / `*.md` in the same commit.
3. Regenerate what is generated: `node artifacts/tokens.mjs` after editing tokens;
   re-render a specimen (`node kit/render.cjs artifacts/specimen-color.html --still`,
   then move `artifacts/out/specimen-color.png` into place if needed) when its look changes.
4. Push the branch and open a pull request here. Keep it about the system; anything
   that only one project needs (a page layout, a figure) stays in that project.
5. Once it merges, bump the pointer in each project that should pick it up:
   `git submodule update --remote design-system`, then commit `design-system`.

Changes are shared by every consumer, so prefer additive changes (a new token, a new
adapter, a new kit helper) over changing existing values. When an existing value or
kit API must change, say so in the pull request and check the consumers you know of.
See [`CLAUDE.md`](CLAUDE.md) for the same rules written for coding agents.
