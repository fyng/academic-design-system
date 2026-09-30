---
id: form-03
name: Survival curves
family: time
specimens: [core/specimen-forms-01-08.html, core/specimen-forms-03-15-16.html]
kit: [ch.line, ch.ribbon, ch.censor, ch.atRisk, ch.lineKey]
see_also: [form-13, form-17]
---
# 03 · Survival curves

- Step curves, with a step-shaped CI ribbon (14 %) for the focus series.
- Focus group in the finding's colour, comparator in `context`. Labels go just past
  the line ends, so leave about 70 px to the right of the plot.
- The x-axis is time with its unit ("Months on ICI"). The y-axis is a percentage from 0.
- In full figures, add a numbers-at-risk row beneath the axis in the `tick` role:
  one row per group, named left of the axis in the group's text colour, counts under
  the x ticks, "Number at risk" above in `muted`. With delayed entry (a landmark
  cohort, left truncation) the counts can rise; the legend says so.
- Censored observations are short vertical ticks on the curve, in its colour.
- **Risk groups** (quartiles of a score) are ordered and carry valence: benefit 700
  and 400, harm 400 and 700, with Q1 the lowest risk. The curves cross, so a line key
  above the plot replaces end labels.
- The statistics sit in the plot's empty corner in the `cap` role, one per line:
  n, the log-rank *P*, and the C-index.

## In each format

- Specimens: `../../specimen-forms-01-08.html` → `../../out/specimen-forms-01-08.png`, `../../specimen-forms-03-15-16.html` → `../../out/specimen-forms-03-15-16.png`.
- Kit: `ch.line`, `ch.ribbon`, `ch.censor`, `ch.atRisk`, `ch.lineKey` (`../../../kit/README.md`).
