# Lamina: design preferences for lab figures

Lamina is the visual system for the lab's graphical abstracts, charts and schematic figures.
The website has its own system (`../website/DESIGN.md`); `../README.md` explains the split.
This file holds the high-level preferences. The details are in:

| File | Covers |
|---|---|
| [`typography.md`](typography.md) | One family (IBM Plex Sans), type roles, numbers and units |
| [`color.md`](color.md) | Palettes grouped by what they mean, and how they were validated |
| [`charts.md`](charts.md) | Chart grammar and rules for eight common forms |
| `tokens.mjs` → `tokens.css`, `tokens.json` | The values. Edit `tokens.mjs`, run `node artifacts/tokens.mjs` |
| `specimen-*.html` → `out/specimen-*.png` | Visual reference sheets, built with the kit |

The kit (`../kit/`) implements the system, so following it is mostly automatic.
This document says *why*, so you can decide the cases the kit doesn't cover.

## What a Lamina figure is

A **scientific statement**, drawn. It reads like the paper's abstract, not an advertisement:

- **The title says what the work is**, in plain words: a statement ("Spot-based spatial
  transcriptomics cell-type deconvolution without a single-cell reference") or, when the
  work answers one, a question ("Can we predict…?"). Never a slogan.
- **Each panel ends with a finding**, stated as the paper states it, with the
  paper's hedges intact ("predicts propensity", not "reveals").
- **The take-home is one plain sentence** that says why it matters to the field.
  No accent colour or italics by default: emphasis that lands on anything but the key
  point backfires, and a single sentence rarely needs it.
- **Schematic is labelled schematic.** Any chart that is illustrative rather than
  real data says so in its caption, and has no numeric ticks.
  Real numbers come from the paper and nowhere else.

## Principles

1. **One idea per panel, three panels.** Resource → method → finding is the default arc,
   read left to right. A fourth panel means the story has not been cut enough.
2. **Ink is for data and argument.** No decorative gradients, drop shadows, 3D, clip-art
   scenes or background textures. Use a wash fill only to group things.
3. **Colour means something or it is grey.** Every coloured mark has a role from
   `color.md`: valence, emphasis, identity, magnitude or direction. Everything else uses
   ink or context grey. One accent per figure.
4. **Label things directly.** Put words next to the marks they name. Use a legend only
   when direct labels would collide.
5. **One voice.** Every word is IBM Plex Sans. Hierarchy comes from size, weight
   (400/500), case and colour, not from mixing typefaces. Mono is kept for literal codes.
6. **Quiet structure.** No dividers between panels or around the header and take-home:
   the gutters and white space separate them. Hairlines (1.5 px, `--rule`) are for axes
   and grids. The grid shows through alignment, not boxes or lines.
7. **Fewer words, fewer lines.** Draw the object instead of naming it; label only what
   the drawing cannot say. If a label repeats the panel title or conclusion, cut it.
8. **Motion follows the argument.** Things appear in the order you would explain them
   aloud. Nothing moves once it has arrived. There are no loops within the loop.
9. **Accessible by construction.** Palettes are validated for colour-vision deficiency,
   text meets contrast minimums, and there is no meaning by colour alone.
   Every figure carries a `<title>` and `<desc>` that state its content in full.
10. **Checked, not eyeballed.** The kit's lint blocks a render on overlaps, margin
   overflow, divider crossings, and arrows or curves running through labels.
   Never use `--force` to ship.

## Voice

| Do | Don't |
|---|---|
| "Can we predict individual adverse event risk…?" | "Revolutionising cancer safety" |
| "predicts", "is associated with", "in 35,669 patients" | "unlocks", "powerful", "first-ever" |
| Sentence case everywhere except the kicker | Title Case Headlines |
| Numbers with units and denominators | Bare percentages without an n |
| The paper's own terms, defined once (ICI, AUROC) | New jargon invented for the figure |

## Writing

Every word on a figure is one of six kinds of text, each with one job.

| Text | Job | Form | Examples |
|---|---|---|---|
| **Title** | Say what the work is about | The question it answers, or a statement of the work, naming its scope. ≤ 2 lines | "How can we integrate ex vivo drug screens across model systems, cancer types, and drug modalities for treatment insights?" |
| **Panel title** | Say what the panel shows, in the field's terms | A resource, a method, or a finding as a short active claim. ≤ 6 words where possible | Resource: "Pan-cancer drug screen atlas". Method: "Bayesian drug response modeling", "Machine learning risk model". Finding: "Immortalization biases cell line vulnerability", "Topic model infers cell type mixture" |
| **Conclusion** | State the panel's result | One sentence: the paper's claim, with its hedge and its key number | "In 35,669 patients, germline variants predict propensity for immune-related adrenal insufficiency" |
| **Take-home** | Say why it matters | One plain sentence, no styling | "A precision safety paradigm is needed to complement response prediction in personalized medicine." |
| **Label** | Name a mark | 1–3 words, next to the mark | "organoids", "skin tumors" |
| **Note** | Decode what the drawing cannot | 1–3 words, muted, with a leader | "observed gene" |

Rules:

- **Name the science, not the brand.** A panel title a reader could search for
  ("LLM diagnosis extraction") beats a project name ("MSK-Tox") or a one-word stage
  ("Harmonize", "Atlas"). Brand names belong in the kicker.
- **Be specific about the method.** Say which kind of model ("Bayesian", "topic
  model", "machine learning"), and what it acts on ("drug response", "cell type
  mixture").
- **A finding title is a claim** with a subject and an active verb ("Immortalization
  biases…"). Keep the paper's hedge in the conclusion underneath.
- **One term per thing.** Once a figure calls it a "spot", it is a spot in every
  panel, label and conclusion.
- **Abbreviations** only where the field uses them unexpanded (ST, LLM, ICI, irAE);
  spell out the rest.
- **Hyphenate compound modifiers** before a noun ("cell-type proportions",
  "dose-response curve"), not after it ("proportions of each cell type").
- **Numbers** come from the paper, with denominators ("35,669 patients").
- **Don't repeat.** No label restates the panel title or the conclusion.

## Canvas

- **1600 × 900 (16:9)**, white paper, 64 px margins, 8 px spacing grid.
- **Header, y 44–187:** a kicker (`PROJECT · VENUE YEAR`) and a title of at most two
  lines. No rule underneath.
- **Panels, y 204–766:** three columns of 437 px with 80 px gutters, no dividers.
  Each panel has a header, the number in prussian and a title in `head`
  (`01  Pan-cancer drug screen atlas`), wrapping to two lines at most, then the
  visual, and the conclusion at the foot. When any panel title wraps, every panel's
  visual starts below a two-line header, so the panels stay aligned.
  No step word, no caption line.
- **Take-home, y 812–860:** one plain sentence in `take` type.
- Figures are always light. On a dark page, they sit on their own paper card; there is
  no dark variant (see `../website/DESIGN.md`, *Embedding Lamina figures*).

## Motion

- **Loop 16 s** (always under 20 s, no sound). Header 0–1 s, panels about 4 s each,
  take-home at about 13.4 s, then hold. There is no closing fade: the last frame is
  the complete figure, identical to the poster (the static image, t = 15 s). A figure that
  explains a mechanism may run 18 s, with the poster at 17 s.
- **Vocabulary:** `in` (rise 12 px and fade) for text; `pop` for icons and boxes;
  `draw` for arrows and curves; `grow` for bars; `fade` for chart frames and fields;
  `zoom` for an inset growing out of its source; `sweep` for a proportion wedge
  filling clockwise from 12 o'clock; `move` for marks travelling into place when the
  travel is the point (samples clustering in an embedding). Nothing else.
- **Timing:** enter 0.6–0.8 s, draws 0.8–1.2 s, stagger 80 ms. Arrowheads appear
  as their line finishes. Chart frames come before the data, and labels come after
  the marks land.
- Reduced-motion users get the poster frame.

## Iconography

- Use Health Icons (MIT) from `@iconify-json/healthicons`, on a 48-unit grid, as
  solid silhouettes in a single colour. Draw custom icons (`adrenal`, `note`, `tree`, `molecule`: a drug as a skeletal structure)
  in the same style and add them to `kit/icons.js`.
- Colour an icon only when it is an entity with a registered colour (organs). Otherwise
  use ink or prussian.
- Icon size can encode a quantity (grade, for example) only if a caption says so.

## Drawing biology

Draw the objects the work is about, simply, and let the drawing carry the
explanation. The kit's `GA.bio` layer (`kit/ga-bio.js`) draws each of these.

- **Cells.** A round cytoplasm in the cell type's tint with a 1.5 px outline in its
  mark colour, and an offset nucleus in the mark colour. The same glyph is the cell
  type's legend swatch wherever the type appears. Colours come from the cell-type
  family (`color.md`).
- **Tissue.** A silhouette in neutral wash with a slightly darker core for inner
  anatomy, outlined in `context`. Tissue is never coloured: colour is kept for the
  cell types measured in it.
- **Model systems.** Drawn neutral (wash fill, ink-2 outline and nucleus), because the
  comparison, not the system, carries colour. An **organoid** is a ring of cells around
  a lumen; a **cell line** is a monolayer of flattened cells on a dish line;
  **patient-derived cells** are three loose cells; **xenograft-derived cells** are a
  cell beside a small mouse.
- **Screen atlases.** Samples as rows, drugs as columns. Group rows by model system
  and columns by drug modality, with small gaps between groups and a label on each;
  mark each row's cancer type with a strip in its registered organ colour. A tested
  pair is a small dose-response curve; an untested pair stays blank.
- **Spots (pixels).** Paper-filled rings with a `context` outline on a regular
  lattice inside the tissue.
- **Zoom.** To look inside one thing, ink its outline, run two dotted tangent leaders
  (muted, 1.5 px, `1 4` dash) to a circular inset (wash fill, ink-2 outline), and draw
  the contents inside. In motion the inset grows out of its source (`zoom`), so the
  eye travels with it. The inset may also be a whole chart: ink the source cell
  (for example one cell of an atlas), run the leaders from its corners to the plot's,
  and grow the chart out of it. Such a zoom may cross into the next panel when it
  follows one object from overview to detail.
- **Measurements and fits.** Show measured data as they are collected: a few doses,
  a small dot for each replicate, scattered by noise. The model's fit is a smooth
  line drawn after the dots land, in the same colour. No words are needed for the
  difference.
- **Proportion dials.** A wedge inside each spot shows one cell type's share of
  that spot, filled clockwise from 12 o'clock. Show one type per map and repeat the
  map as small multiples, labelled with the cell glyph and `k = 1`. A spot never
  holds a many-slice pie.
- **Matrices.** A hairline grid in `rule` with a glyph at each row (a spot ring, a
  cell) and braces labelled with the dimension (*D*, *N*). Cells stay empty unless
  their values are the point; then they take the quantity ramp or the entity's colour.
- **Model notation.** Variables are circles (r 26, ink-2 ring, paper fill; observed
  ones filled `rule`), labelled with `math` type. Plates are 1.5 px ink-2 rectangles
  with a 4 px radius and the index top-left (`d = 1…D`). Edges are the standard
  prussian arrow.
- **Notes.** A muted `note` label, one to three words, with a thin muted leader from
  the mark. Use them only for notation a reader outside the field cannot decode,
  never for what the drawing already shows.

## Arrows and method boxes

- Arrows are prussian (or the finding's colour), 2.5 px, with open chevron heads.
- **Arrows between side-by-side items are straight.** The kit's `connect()` runs them
  along the middle of the two items' overlap. Curves are only for endpoints that are
  offset (fan-in, fan-out), and then they leave and enter perpendicular to the box edge.
- **Method boxes** all look the same: wash fill, an icon, and a short label ("LLM",
  "ML model"). Name the method by what readers know, not the algorithm, unless the
  algorithm is the point. Icons: `llm` (a speech bubble with text) for language models,
  `network` for trained models. Avoid vendor-associated glyphs such as sparkles or
  swirls; icons stay brand-agnostic.

## Deliverables per figure

`out/<slug>.png` (poster, 2×), `out/<slug>.mp4` (H.264), `out/<slug>.webm` (VP9 fallback),
and `out/<slug>.webp` (preview, not committed), written to an `out/` folder beside the
figure's HTML. Render with `node <design-system>/kit/render.cjs <slug>.html` from the
folder that holds the figure; the render fails if lint fails.

Figures live in the project that publishes them, not here. A figure page loads the kit
by relative path from the design system checkout, for example
`<link rel="stylesheet" href="../design-system/kit/ga-kit.css">`.

## On a website

How a figure is published is up to the consuming site. fyng.github.io, the reference
consumer, does it like this (its `graphical_abstracts/README.md` has the details):

1. A publish script copies the PNG, MP4 and WebM into the site's assets and makes a
   640 px `<slug>-thumb.png`.
2. The paper's bibliography entry names the figure, and the publication list shows the
   thumbnail in the entry's preview slot.
3. The slot shows the static poster, scaled to the column. The animation plays in an
   expanded view sized to fit the viewport (portrait and landscape):
   - on laptops, while hovering the thumbnail; a click opens it as an overlay;
   - on phones, a tap opens the overlay; tap anywhere, the × or Esc closes it.
   The animation plays once, then snaps to the poster (its last frame, aligned
   pixel for pixel), so viewers can zoom into or copy the figure. Closing and
   reopening the view replays it.
   Reduced-motion users get the enlarged poster only. The video loads on first open.
