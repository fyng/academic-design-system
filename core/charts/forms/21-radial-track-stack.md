---
id: form-21
name: Radial track stack
family: matrix
specimens: [core/specimen-forms-18-19-21.html]
kit: [GA.radial]
sources: ["PCAWG Consortium, Nature 2020, Fig. 2a"]
see_also: [form-07]
---
# 21 · Radial track stack

For many variables across thousands of individuals in groups: the drivers of every
patient in a pan-cancer cohort. It is the oncoprint (07) bent into a circle, so a
long axis of individuals fits a square panel. Use it to show a cohort's shape at a
glance; for data the reader must evaluate, use the oncoprint.

- Individuals run clockwise from 12 o'clock, one angular slice each, in **sectors**
  by group with a 1.5° gap between sectors. An 8° opening at 12 o'clock holds the
  scale. Within a sector, sort individuals by the outer bar.
- From the outside in: the **bar ring** (26 px deep, `context`, one bar per
  individual, its scale running to a round number at or above the peak, labelled
  once on a short axis in the opening); the **sector ring** (5 px, `ink-2` and
  `context` alternating); then one **heat ring** per variable (11–12 px deep, 2 px
  paper gaps).
- Each heat ring takes its own hue's ramp (steps 200–800 for counts; one step for
  present or absent). Zero stays paper. Hues follow the categorical order, and the
  ring's order is the key's order.
- Sector names sit outside the bar ring in the `tick` role, reading horizontally:
  standing on the ring at the top, hanging from it at the bottom, level with it at
  the sides.
- The **ring key** lists the rings outside in, each a short ramp strip and its name,
  with the strips' end values under the last one. The centre stays empty.

## In each format

- Specimens: `../../specimen-forms-18-19-21.html` → `../../out/specimen-forms-18-19-21.png`.
- Kit: `GA.radial` (`../../../kit/README.md`).

**In print** the radial stack is square: the circle and its sector names fill the
cell's width, and the ring key sits in a corner the circle leaves free.

| Distance | mm |
|---|---|
| Bar ring depth | 4.0 |
| Sector ring depth | 0.8 |
| Heat ring depth | 1.5–2.0 |
| Between rings | 0.3 |
| Sector gap / opening at 12 o'clock | 1.5° / 8° |
| Sector name to the bar ring | 1.5 |

- The inner radius stays at least 40 % of the outer, so the innermost ring's slices
  keep their width; drop rings before shrinking it.
