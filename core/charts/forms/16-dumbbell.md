---
id: form-16
name: Dumbbell
family: comparison
specimens: [core/specimen-forms-03-15-16.html]
kit: [ch.dumbbell, ch.dotKey]
see_also: [form-02]
---
# 16 · Dumbbell

For one metric measured by two methods across cohorts or settings: a model against a
clinical score, before against after treatment.

- One row per cohort, the cohort's name (and n) left of the plot in `label`. A 2 px
  `rule` stem joins the comparator dot (`context`) to the model's dot (`prussian`).
- The model's dot is hollow when the difference is not significant, as in form 02.
- Sparse panels print both values at the outer ends in the `tick` role and the exact
  *P* in `muted`, right-aligned in one column at the plot's right edge so the column
  does not stagger with the rows.
- **Dense panels** (many rows, or rows across small multiples) drop the values and
  let the shared axis read them. Stars may replace the exact *P*: one for < 0.05, two
  for < 0.01, three for < 0.001, "ns" otherwise, right-aligned in the same column;
  the legend defines them and a supplementary table gives the exact values.
- Groups of rows (therapy classes) become small multiples that keep one row pitch,
  so a short group ends early rather than spreading its rows.
- A key of the two dots sits above the plot. The x axis spans the data with a small
  pad, shared across small multiples, so the dots use the width; a bounded metric
  need not show its full range.

## In each format

- Specimens: `../../specimen-forms-03-15-16.html` → `../../out/specimen-forms-03-15-16.png`.
- Kit: `ch.dumbbell`, `ch.dotKey` (`../../../kit/README.md`).
