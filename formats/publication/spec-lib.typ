// Shared by the specimens: colours, guide styles, dimension helpers and the
// chart frame (axes, ticks, labels, titles) that follows the panel contract.

#import "fig.typ": *

#let axes = 0.5pt + axis-ink
#let guide-col = rgb(tokens.semantic.accent)
#let guide-text = rgb(tokens.semantic.at("accent-text"))
#let guide = 0.35pt + guide-col
#let prussian = rgb(tokens.neutral.prussian)
#let context-grey = rgb(tokens.neutral.context)
#let ramp = tokens.sequential.quantity

#let edge-line = (paint: guide-col, thickness: 0.35pt, dash: "dotted")

// ---- guides ---------------------------------------------------------------

// Horizontal dimension: a line of length `len` with end ticks and a label.
#let dim-h(len, txt, above: true) = box(width: len, height: 2mm, {
  place(horizon, line(length: len, stroke: guide))
  place(left + horizon, line(start: (0pt, -0.8mm), end: (0pt, 0.8mm), stroke: guide))
  place(right + horizon, line(start: (0pt, -0.8mm), end: (0pt, 0.8mm), stroke: guide))
  place(center + (if above { bottom } else { top }), dy: if above { -1.2mm } else { 1.2mm }, text(size: 6pt, fill: guide-text, txt))
})

// Vertical dimension of length `len`, label to the right.
#let dim-v(len, txt) = box(width: 2mm, height: len, {
  place(center, line(angle: 90deg, length: len, stroke: guide))
  place(top + center, line(start: (-0.8mm, 0pt), end: (0.8mm, 0pt), stroke: guide))
  place(bottom + center, line(start: (-0.8mm, 0pt), end: (0.8mm, 0pt), stroke: guide))
  place(left + horizon, dx: 2.2mm, box(width: 14mm, text(size: 6pt, fill: guide-text, txt)))
})


// Dimension in a strip too narrow for a label beside it: the label sits on the
// line, on paper.
#let dim-h-in(len, txt) = box(width: len, height: 2mm, {
  place(horizon, line(length: len, stroke: guide))
  place(left + horizon, line(start: (0pt, -0.8mm), end: (0pt, 0.8mm), stroke: guide))
  place(right + horizon, line(start: (0pt, -0.8mm), end: (0pt, 0.8mm), stroke: guide))
  place(center + horizon, box(fill: white, inset: (x: 0.6mm, y: 0.2mm), text(size: 6pt, fill: guide-text, txt)))
})

// Vertical dimension with the label rotated beside the line, in a strip `w` wide.
#let dim-v-rot(len, txt, w: 5mm, off: 0.8mm, label-left: false) = box(width: w, height: len, {
  place(top + left, dx: off, line(angle: 90deg, length: len, stroke: guide))
  place(top + left, dx: off - 0.8mm, line(start: (0mm, 0pt), end: (1.6mm, 0pt), stroke: guide))
  place(bottom + left, dx: off - 0.8mm, line(start: (0mm, 0pt), end: (1.6mm, 0pt), stroke: guide))
  let lab = box(width: 100mm, align(center, rotate(-90deg, text(size: 6pt, fill: guide-text, txt))))
  if label-left {
    place(top + left, dx: off - 0.8mm - 2.4mm, box(width: 2.4mm, height: len, align(center + horizon, lab)))
  } else {
    place(top + left, dx: off + 0.8mm, box(width: w - off - 0.8mm, height: len, align(center + horizon, lab)))
  }
})

// Vertical dimension, label to the left.
#let dim-vl(len, txt) = box(width: 2mm, height: len, {
  place(center, line(angle: 90deg, length: len, stroke: guide))
  place(top + center, line(start: (-0.8mm, 0pt), end: (0.8mm, 0pt), stroke: guide))
  place(bottom + center, line(start: (-0.8mm, 0pt), end: (0.8mm, 0pt), stroke: guide))
  place(left + horizon, dx: -2.2mm - 14mm, box(width: 14mm, align(right, text(size: 6pt, fill: guide-text, txt))))
})

// ---- chart parts ----------------------------------------------------------

#let band-label(width, height, body) = block(
  width: width,
  height: height,
  align(center + horizon, box(width: 100mm, align(center, rotate(-90deg, body)))),
)

// Spacing (formats/publication/README.md, *Spacing*), in mm. Ink is measured from
// the cap top to the baseline; descenders hang below. Font sizes stay fixed; the
// gaps grow with the panel at a discount.
#let tick-len = 0.5mm // tick, outward from the axis
#let cap-tick = 1.231mm // 5 pt cap height
#let cap-title = 1.478mm // 6 pt cap height
#let desc = 0.5mm // 6 pt descender
#let label-w = 4.2mm // four characters at 5 pt: the least the y tick labels reserve
#let right-margin = 2mm
#let ref-cell = (30mm, 24mm) // the reference cell, where the gaps are at their base
#let gap-discount = 0.5 // share of the panel's linear growth the gaps follow

// The margins of a w x h cell. Each gap is its base value times
// 1 + gap-discount * (s - 1), where s is the cell's linear scale against the
// reference cell. `yw` is the widest y tick label and `xh` the x tick labels'
// ink height; longer or larger labels grow the margins past the defaults.
#let margins(w, h, yw: label-w, xh: cap-tick) = {
  let yw = calc.max(yw, label-w)
  let xh = calc.max(xh, cap-tick)
  let s = calc.sqrt((w / 1mm) * (h / 1mm) / ((ref-cell.at(0) / 1mm) * (ref-cell.at(1) / 1mm)))
  let k = 1 + gap-discount * (s - 1)
  let edge = 1mm * k // ink to the cell edge: axis title, head
  let tgap = 0.6mm * k // axis title to tick text, head to plot
  let kgap = 0.5mm * k // tick text to tick mark
  (
    edge: edge, tgap: tgap, kgap: kgap, k: k,
    l: edge + cap-title + desc + tgap + yw + kgap + tick-len,
    t: edge + cap-title + desc + tgap,
    r: right-margin,
    b: tick-len + kgap + xh + tgap + cap-title + desc + edge,
    yw: yw, xh: xh,
  )
}

// The plot area of a cell with margins `m`, dashed.
#let plot-rect(w, h, m) = place(top + left, dx: m.l, dy: m.t,
  rect(width: w - m.l - m.r, height: h - m.t - m.b, stroke: (paint: guide-col, thickness: 0.35pt, dash: "dashed")))

// Axes, ticks, tick labels and titles in the margins; `plot` draws into the
// plot area (pw x ph). Tick positions are fractions of the axis. The margins
// fit the measured tick labels; `guide` dashes the plot area.
#let chart(w, h, plot, xticks: (), yticks: (), xtitle: none, ytitle: none, head-txt: none, guide: false) = context {
  let yw = calc.max(0mm, ..yticks.map(((f, s)) => measure(tick(s)).width))
  let xh = calc.max(0mm, ..xticks.map(((f, s)) => measure(tick(s)).height))
  let m = margins(w, h, yw: yw, xh: xh)
  let (l, t, r, b) = (m.l, m.t, m.r, m.b)
  let (pw, ph) = (w - l - r, h - t - b)
  block(width: w, height: h, {
    if head-txt != none { place(top + left, dx: l, dy: m.edge, head(head-txt)) }
    place(top + left, dx: l, dy: t, block(width: pw, height: ph, plot(pw, ph)))
    place(top + left, dx: l, dy: t, line(angle: 90deg, length: ph, stroke: axes))
    place(top + left, dx: l, dy: t + ph, line(length: pw, stroke: axes))
    for (f, s) in xticks {
      place(top + left, dx: l + f * pw, dy: t + ph, line(angle: 90deg, length: tick-len, stroke: axes))
      place(top + left, dx: l + f * pw - 15mm, dy: t + ph + tick-len + m.kgap, box(width: 30mm, align(center, tick(s))))
    }
    for (f, s) in yticks {
      place(top + left, dx: l - tick-len, dy: t + ph - f * ph, line(length: tick-len, stroke: axes))
      place(top + left, dx: l - tick-len - m.kgap - m.yw, dy: t + ph - f * ph - cap-tick / 2, box(width: m.yw, align(right, tick(s))))
    }
    if xtitle != none { place(top + left, dx: l, dy: h - m.edge - desc - cap-title, box(width: pw, align(right, axis(xtitle)))) }
    if ytitle != none { place(top + left, dx: 0mm, dy: t, band-label(2 * m.edge + cap-title, ph, axis(ytitle))) }
    if guide { plot-rect(w, h, m) }
  })
}

// The plot area of a cell with default margins, dashed.
#let plot-guide(w, h) = plot-rect(w, h, margins(w, h))
