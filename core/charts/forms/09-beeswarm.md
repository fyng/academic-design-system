---
id: form-09
name: Beeswarm
family: distribution
specimens: [core/specimen-forms-09-14.html]
kit: [ch.swarm, ch.summary]
sources: ["Li, Friends Don't Let Friends Make Bad Graphs"]
see_also: [form-10, form-13]
---
# 09 · Beeswarm

For comparing groups of observations: it shows the shape, the n and the outliers
along with the centre.

- Every observation is a point, placed without overlap around the group's centre
  (a beeswarm, or a quasirandom layout when n is large).
- The median (or mean, if the paper reports means) is a summary bar across the swarm;
  add its 95 % CI as a 2 px line when the comparison needs it.
- Point radius 4.5 up to about 50 per group, 3–3.5 for about 100. For several hundred
  per group and one mode, a box with the points behind it in `context` at 40 % keeps
  the width in check.
- Group names are the x tick labels; the points are `ink-2`. Colour carries a second
  factor when there is one.
- For n below about 30, this is also the form for a distribution: the points say
  more than any histogram or violin of the same data.

## In each format

- Specimens: `../../specimen-forms-09-14.html` → `../../out/specimen-forms-09-14.png`.
- Kit: `ch.swarm`, `ch.summary` (`../../../kit/README.md`).
