---
id: form-17
name: Patient timeline
family: time
specimens: [formats/publication/specimen-multitrack-timeline.typ]
kit: []
see_also: [form-25, form-03]
---
# 17 · Patient timeline

For one patient's record, observed and predicted, over time: a track stack, the
composite panel in `../../../formats/publication/README.md` (*Composite panels*), drawn
in `../../../formats/publication/specimen-multitrack-timeline.typ`.

- One time axis on top. Tracks stack below in groups (risk, events, treatment, sites,
  labs), each group opened by a header in the `group` role.
- An `ink` rule at the start time runs from the axis through every track.
- Observed data are `vermilion-500` with a paper ring: event dots, interval bars
  and lab measurements. Interval bars are round-capped, as *Glyphs* allows where
  predictions overlay the record.
- Predicted data are blue: lines in `blue-600`, probabilities as a heat strip on the
  blue ramp (100 at 0, 700 at 1), drawn under the observed marks.
- Vermilion for observed and blue for predicted is an exception to valence
  (`../../color.md`): here the two hues say where a mark comes from, not whether it
  is good or bad.
- The risk line takes the valence diverging scale, each segment coloured by its
  value, with a dotted zero rule when 0 lies in range. It is the only track whose
  colour carries a judgement, and it sits at the top.
- Value tracks carry two ticks at round numbers; lanes and events carry none.
- The patient (ID, age, sex, stage, status) sits top left above the label column,
  in `muted`.
- When tracks outnumber the cell, keep the top-ranked lanes and say so in the
  legend.

## In each format

- Specimens: `../../../formats/publication/specimen-multitrack-timeline.typ` → `../../../formats/publication/out/specimen-multitrack-timeline.png`.
- Kit: none; the specimen is drawn in Typst.

The track stack's distances in print are the publication format's composite panel (`../../../formats/publication/README.md`, *Composite panels*).
