---
id: form-07
name: Heatmap
family: matrix
specimens: [core/specimen-forms-01-08.html, core/specimen-forms-09-14.html, core/specimen-forms-07-08.html]
kit: [ch.heat, ch.oncoprint, ch.key]
sources: ["Li, Friends Don't Let Friends Make Bad Graphs (grouped heatmap)", "Hessey, Bunkum, Huebner et al., Nature 2026, Fig. 2a (categorical cells)"]
see_also: [form-18, form-19, form-24]
---
# 07 · Heatmap

- Diverging values use the valence scale (sensitive = blue, resistant = vermilion)
  or the direction scale, with the midpoint (`wash`) at the value that means no
  change. Magnitude uses a sequential scale from 0.
- Order rows and columns by clustering or by a known variable. When columns carry an
  annotation (cell type, cohort), **group** them: a 6–8 px gap between groups, the
  group's name and n above it, and rows ordered by the group where each peaks.
- Cells are separated by a 2 px paper gap. In dense matrices (hundreds of columns),
  keep the gaps between rows and between groups and let columns touch.
- Unmeasured cells stay blank (paper), and the caption says so.
- The key sits beneath the grid, with labelled ends and midpoint. When the scale is
  capped (`../../color.md`, *Magnitude*), the key's end reads "> 2". Put numbers in the
  cells when the matrix is 5 × 5 or smaller.
- **Categorical cells (the oncoprint).** When each cell holds a class rather than a
  value (alterations per gene and patient, and when each arose):
  - Every cell is a `wash` square, as in form 19, so an unaltered cell reads as
    tested and wild type; an untested one has no square.
  - An altered cell is filled by its class. For clonal timing, use the clone tree's
    location classes (24): truncal `context`, shared subclonal `blue-300`,
    primary-unique `blue-700`, metastasis-unique `teal-500`.
  - A second event in the same gene (a biallelic hit) is a small ring inside the
    cell: paper fill, 1 px `ink` edge (*Glyphs*).
  - Row groups (amplification, LOH, mutation) part with a 10 px gap and are named
    as in form 19; gene names are italic and sort by frequency within a group.
  - Each row's classes stack into a bar at its right on a count axis, as form 18's
    totals do; annotation strips (histology, treatment) run under the grid, named
    at the right.

## In each format

- Specimens: `../../specimen-forms-01-08.html` → `../../out/specimen-forms-01-08.png`, `../../specimen-forms-09-14.html` → `../../out/specimen-forms-09-14.png`, `../../specimen-forms-07-08.html` → `../../out/specimen-forms-07-08.png`.
- Kit: `ch.heat`, `ch.oncoprint`, `ch.key` (`../../../kit/README.md`).
