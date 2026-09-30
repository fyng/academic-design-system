---
id: form-25
name: Swimmer plot
family: time
specimens: [core/specimen-forms-25-26.html]
kit: [ch.swimmer, GA.glyph, GA.glyphKey]
sources: ["Hessey, Bunkum, Huebner et al., Nature 2026, Fig. 1a"]
see_also: [form-17, form-22, form-26]
---
# 25 · Swimmer plot

For a cohort's clinical course: one row per patient on a shared time axis. Form 17
is one patient's record in depth; the swimmer plot is every patient's in outline.

- Rows sort by survival (or follow-up), shortest first. The follow-up line runs from
  time 0 to the row's end and **carries the disease state**: 1.5 px `rule` until
  relapse, 2.5 px `ink-2` after it. A death ends the row with a tick.
- Few glyphs (*Glyphs*): surgery a `prussian` diamond with the number of regions
  sampled inside; radiotherapy a small `ink` diamond; every sample a circle.
- Treatments, adjuvant ones included, are 8 px bars on the line, square-cornered.
- **Every sample is a circle in its site's colour, as on the body map** (22):
  biopsies sit on the line when they were taken; samples taken at the end (autopsy)
  sit after the row's end, two rows deep. Colour then has one job, the site, so
  treatment bars take slate steps (700, 400, 200) and annotation strips use hues that
  no site in the figure uses.
- Annotation strips (histology, stage, smoking) are squares left of the plot, one
  column each, named upward above it; the patient's label sits left of them.
- Keys beside the plot: the two line states, the events, the treatments. Strips and
  sample sites beneath it.

## In each format

- Specimens: `../../specimen-forms-25-26.html` → `../../out/specimen-forms-25-26.png`.
- Kit: `ch.swimmer`, `GA.glyph`, `GA.glyphKey` (`../../../kit/README.md`).

| Element | Canvas | Print |
|---|---|---|
| Treatment bar | 8 px | 1.8 mm |
