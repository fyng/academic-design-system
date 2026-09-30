---
id: form-18
name: Count matrix
family: matrix
specimens: [core/specimen-forms-18-19-21.html]
kit: [ch.counts, ch.upText]
sources: ["PCAWG Consortium, Nature 2020, Fig. 2b"]
see_also: [form-07, form-19]
---
# 18 · Count matrix

For counts over two categorical axes, when the counts are the finding: patients with
a driver in each gene per tumour type, events per site per arm.

- One cell per pair, separated by a 2 px paper gap. The **count is printed in every
  filled cell** (`tick`, 11 px), ink on the light steps and paper from step 700 on.
  Zero stays blank, and the caption says so.
- The shade bins a **share** (the count over its column's n), so columns of
  different size compare: five steps of the quantity ramp (100, 200, 400, 700, 900),
  edges at round shares (0, .05, .1, .2, .4, 1). The key is the five swatches with
  the edges printed between them, above the grid.
- Rows sort by their total; columns by the story (organ, or n). Row names left of
  the grid; column names read upward above it.
- Right of the grid, one column of row totals in the `tick` role, titled once
  ("Total"), and, when it matters how each row's count splits, a 100 % bar per row
  (form 08's rules, a 0–1 axis beneath, the legend below as square swatches). The
  bar's parts keep to the categorical slots and skip teal, which the matrix already
  uses.

## In each format

- Specimens: `../../specimen-forms-18-19-21.html` → `../../out/specimen-forms-18-19-21.png`.
- Kit: `ch.counts`, `ch.upText` (`../../../kit/README.md`).

| Element | Canvas | Print |
|---|---|---|
| Count in a cell | `tick`, 11 px | 5 pt, tabular |
