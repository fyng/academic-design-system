---
id: form-12
name: Lollipop
family: comparison
specimens: [core/specimen-forms-09-14.html]
kit: [ch.lollipop, ch.key]
sources: ["Li, Friends Don't Let Friends Make Bad Graphs"]
---
# 12 · Lollipop

For ranked values that also carry a colour scale, or signed values about a reference.

- One row per item, sorted by value. A 2 px `rule` stem runs from the reference
  (0, or the null) to a dot at the value.
- The dot takes the scale colour with a 1 px `ink-2` ring, so light steps stay
  visible: the quantity ramp for one-sided values, the direction ramp centred on 0
  for signed values.
- Row labels left of the plot in `ink-2`; a dotted reference line at the stem origin.
- Show the colour key beneath, with labelled ends and midpoint.

## In each format

- Specimens: `../../specimen-forms-09-14.html` → `../../out/specimen-forms-09-14.png`.
- Kit: `ch.lollipop`, `ch.key` (`../../../kit/README.md`).
