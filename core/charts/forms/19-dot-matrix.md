---
id: form-19
name: Dot matrix
family: matrix
specimens: [core/specimen-forms-18-19-21.html]
kit: [ch.dotMatrix, ch.sizeKey]
sources: ["Alexandrov et al., Nature 2020, Fig. 3"]
see_also: [form-07, form-18]
---
# 19 · Dot matrix

For two measures per cell of a matrix: the share of tumours with a signature and the
burden among them, the share of cells expressing a gene and its mean level.

- Every cell is a `wash` square with a 2 px paper gap, so a cell without a dot reads
  as measured and absent. A cell that was not measured has no square.
- The dot's **area** carries the share (radius ∝ √share); the largest dot fills
  the cell less 1.5 px. Its **colour** carries the magnitude on the quantity ramp
  from step 300, so the lightest dot still shows on the wash. Use a log scale when
  the magnitude spans decades, and cap it (`../../color.md`).
- Each column's n sits in a row above the grid in the `tick` role, with "n" at the
  row's left; column names read upward above that.
- Row groups (SBS, DBS, ID) part with a gap (about 10 px) and are named upward at the left
  beside a `rule` bar. A text column right of the grid (`tick`) annotates each row
  (the proposed aetiology) and stays blank where there is nothing to say.
- Two keys beneath: dots in `context` at three shares (0.25, 0.5, 1), and the colour
  key with labelled ends.

## In each format

- Specimens: `../../specimen-forms-18-19-21.html` → `../../out/specimen-forms-18-19-21.png`.
- Kit: `ch.dotMatrix`, `ch.sizeKey` (`../../../kit/README.md`).
