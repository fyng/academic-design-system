# Illustration

Schematics explain what a chart cannot: the objects the work is about, and how a
method turns one into another. Draw them simply, and let the drawing carry the
explanation. Sizes are px on the abstract canvas; `../formats/publication/README.md`
gives the print equivalents.

## Drawing biology

The kit's `GA.bio` layer (`../kit/ga-bio.js`) draws
each of these.

- **Cells.** A round cytoplasm in the cell type's tint with a 1.5 px outline in its
  mark colour, and an offset nucleus in the mark colour. The same glyph is the cell
  type's legend swatch wherever the type appears. Colours come from the cell-type
  family (`color.md`).
- **Tissue.** A silhouette in neutral wash with a slightly darker core for inner
  anatomy, outlined in `context`. Tissue stays neutral, so colour is kept for the
  cell types measured in it.
- **Body maps.** An anterior body from the head to the upper thighs: the Expression
  Atlas anatomogram (CC BY 4.0, vendored in `../kit/anatomy.js`), drawn as tissue is:
  a wash silhouette, a `context` outline, and twelve organs (brain, lungs, heart,
  liver, stomach, spleen, pancreas, kidneys, adrenals, colon, small intestine,
  bladder) in `rule`, parted by 1 px wash lines. It carries findings, not
  colour: site bubbles, dials, routes (`charts/forms/22-body-map.md`, `charts/forms/23-route-map.md`). The patient's
  right is the viewer's left, and the sites have fixed places (`GA.bio`'s
  `B.SITES`), so a site sits in the same spot in every figure.
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
  map as small multiples, labelled with the cell glyph and `k = 1`, so each spot
  holds a single wedge.
- **Matrices.** A hairline grid in `rule` with a glyph at each row (a spot ring, a
  cell) and braces labelled with the dimension (*D*, *N*). Cells stay empty unless
  their values are the point; then they take the quantity ramp or the entity's colour.
- **Model notation.** Variables are circles (r 26, ink-2 ring, paper fill; observed
  ones filled `rule`), labelled with `math` type. Plates are 1.5 px ink-2 rectangles
  with a 4 px radius and the index top-left (`d = 1…D`). Edges are the standard
  prussian arrow.
- **Notes.** A muted `note` label, one to three words, with a thin muted leader from
  the mark. Use them for notation a reader outside the field cannot decode; the
  drawing says the rest.

## Arrows and method boxes

- Arrows are prussian (or the finding's colour), 2.5 px, with open chevron heads.
- **Arrows between side-by-side items are straight.** The kit's `connect()` runs them
  along the middle of the two items' overlap. Curves are only for endpoints that are
  offset (fan-in, fan-out), and then they leave and enter perpendicular to the box edge.
- **Method boxes** all look the same: wash fill, an icon, and a short label ("LLM",
  "ML model"). Name the method by what readers know, not the algorithm, unless the
  algorithm is the point (icons: `icons.md`).

