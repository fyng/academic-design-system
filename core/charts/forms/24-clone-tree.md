---
id: form-24
name: Clone tree
family: anatomy
specimens: [core/specimen-forms-22-24.html]
kit: [GA.cloneTree, GA.glyph, GA.glyphKey]
sources: ["Hessey, Bunkum, Huebner et al., Nature 2026, Figs 3d and 5a"]
see_also: [form-23, form-07]
---
# 24 · Clone tree

For a tumour's phylogeny: which subclones exist, where each lives, and which seeded
metastases.

- The root sits on a short stem at the top; edges are straight 1.5 px `ink-2` lines;
  leaves take equal slots across the width and a parent sits over the middle of its
  children.
- Nodes are 16 px circle glyphs (*Glyphs*). **Fill is where the clone lives**:
  trunk `context`, shared `blue-300`, primary-unique `blue-700`, metastasis-unique
  `teal-500`. Beside a route map, seeding clones and their metastatic descendants
  take their lineage's colour instead (23).
- **Ring and letter are its seeding role**: P with a 2.5 px `ink` ring for a clone
  that seeds from the primary, M with a 2.5 px `muted` ring for one that seeds from a
  metastasis.
- The key lists the location classes and the two roles, drawn as glyphs.

## In each format

- Specimens: `../../specimen-forms-22-24.html` → `../../out/specimen-forms-22-24.png`.
- Kit: `GA.cloneTree`, `GA.glyph`, `GA.glyphKey` (`../../../kit/README.md`).

| Element | Canvas | Print |
|---|---|---|
| Role ring | 2.5 px | 1 pt |
