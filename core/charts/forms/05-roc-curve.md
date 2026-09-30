---
id: form-05
name: ROC curve
family: response
specimens: [core/specimen-forms-01-08.html]
kit: [ch.line, ch.ref, ch.lineKey]
see_also: [form-15]
---
# 05 · ROC curve

- A square plot, with a dotted chance diagonal.
- Model in `prussian`, baseline or comparator in `context`. ROC curves converge at the
  corners, so use a line key in the lower-right triangle, with the metric printed:
  "model AUROC 0.81".
- Report AUROC to 2–3 significant digits, as the paper does.
- If positives are under about 10 %, show a PR curve as well or instead.

## In each format

- Specimens: `../../specimen-forms-01-08.html` → `../../out/specimen-forms-01-08.png`.
- Kit: `ch.line`, `ch.ref`, `ch.lineKey` (`../../../kit/README.md`).
