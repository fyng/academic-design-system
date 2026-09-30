---
id: form-20
name: Labelled embedding
family: embedding
specimens: [core/specimen-forms-20.html]
kit: [ch.cloud, ch.stub, ch.label, ch.region, ch.frame, ch.callouts, GA.leaders]
sources: ["Bergen et al., Nature Biotechnology 2020, Fig. 2a", "arXiv:2604.18570, Fig. 2a–c (atlas)"]
see_also: [form-08]
---
# 20 · Labelled embedding

For observations placed in a learned space (UMAP, t-SNE, a model's latent space):
cells, patients, clinical codes. Position means similarity; the coordinates mean
nothing.

- No ticks, no frame and no gridlines. An **axis stub** at the bottom-left corner,
  two 34 px `ink-2` arms with open heads, names the projection ("UMAP 1", "UMAP 2").
- Points are small and ringless (r 2, 75–80 % opacity), drawn in shuffled order so
  no group always sits on top; grey points go first.
- **Colour** follows `../../color.md`: identity slots in order; a lineage or ordered
  states take the ordinal steps of one ramp (400–800); an eighth type folds into
  `context` and keeps its name.
- **Names replace the legend.** Each group's name sits at the edge of its cloud in
  its text step, with a 3 px paper halo where it crosses points. A legend (dots and
  names, above the plot) is for when groups interleave so much that names would not
  point at one place.
- **Atlas.** When the story runs from the whole space down to single items, zoom in
  steps: the overview; a subset re-embedded on its own; magnified insets of that.
  - A source region is framed 1 px `ink`, and two straight 1 px `ink-2` leaders join
    its facing corners to the next view's. A re-embedded subset has a `rule` frame;
    a magnified inset an `ink` one, with its points enlarged (r 3) and ringed.
  - Colour carries the top level at every zoom. In a subset, the clusters that the
    insets examine keep their colour and the rest turn `context`. Leaves are
    **named, not coloured**: callouts in one column right of the inset (`tick`,
    18–20 px apart), ordered by the points' height, each leader a 1 px `ink-2` line
    from a 1 px `ink` ring on the point.
  - Each inset is named in its subset, beside its source frame, in the text step.

## In each format

- Specimens: `../../specimen-forms-20.html` → `../../out/specimen-forms-20.png`.
- Kit: `ch.cloud`, `ch.stub`, `ch.label`, `ch.region`, `ch.frame`, `ch.callouts`, `GA.leaders` (`../../../kit/README.md`).

| Element | Canvas | Print |
|---|---|---|
| Embedding point | r 2, no ring | r 0.6 pt, no ring |
| Magnified inset point | r 3, 1 px paper ring | r 1 pt, 0.25 pt paper ring |
| Zoom frame and leaders | 1 px | 0.25 pt, ink and ink-2 |

**Magnified insets in print.** An inset zooms a dense region of a plot or of an
embedding into a second plot area beside it (the atlas above; a scatter's dense
corner), inside the publication panel contract.

| Distance | mm |
|---|---|
| Inset side (square; at least twice the source region's side) | 15–25 |
| Inset to the next inset, stacked | 2.0 |
| Inset to its callout column | 2.5 |
| Callout pitch | 3.0 |

- The source region is framed 0.25 pt ink; two straight 0.25 pt ink-2 leaders join
  its facing corners to the inset's, and cross nothing but the plot they leave.
- An inset of a chart keeps two ticks per axis, at its start and end, so its scale
  reads; an inset of an embedding has none.
- Insets sit in the same panel as their source, under one letter.
