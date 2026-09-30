---
id: form-15
name: Predicted vs observed
family: response
specimens: [core/specimen-forms-03-15-16.html, formats/publication/specimen-marginal.typ]
kit: [ch.hexbin, ch.marginal, ch.ref]
---
# 15 · Predicted vs observed

For a regression's predictions against the measured values, over many observations.

- A square plot with one scale on both axes and the same ticks; the measured value
  on x, the prediction on y. A dotted identity line runs corner to corner.
- Density as hexagonal bins on the quantity ramp, capped near the 95th percentile of
  the bin counts; the key sits beside the plot with "> cap" at its end. Empty bins
  stay paper. Under about 500 points, plot the points instead (r 3, `ink-2`).
- Marginal strips on the top and right show each axis's distribution, in `context`.
  They share the main axes, carry one tick at their peak and no title
  (`../../../formats/publication/README.md`, *Composite panels*).
- The metrics (n, MAE, RMSE, with units) sit in the empty corner below the identity
  line in the `cap` role.
- Small multiples of several variables keep their own scales; say so in the caption.

## In each format

- Specimens: `../../specimen-forms-03-15-16.html` → `../../out/specimen-forms-03-15-16.png`, `../../../formats/publication/specimen-marginal.typ`.
- Kit: `ch.hexbin`, `ch.marginal`, `ch.ref` (`../../../kit/README.md`).

Marginal strips follow the publication format's composite panel (`../../../formats/publication/README.md`, *Composite panels*), drawn at scale in `../../../formats/publication/specimen-marginal.typ`.
