// Specimen panel: one panel at 5x, with the spacing between the axis, its tick
// labels, its titles and the edge of the allocated cell. The rules are the
// constants in spec-lib.typ (README, *Spacing inside the margins*). Compile
// from formats/publication/:
//   typst compile --root ../.. --font-path ../../core/fonts specimen-panel.typ out/specimen-panel.pdf
//   typst compile --root ../.. --font-path ../../core/fonts --format png --ppi 300 specimen-panel.typ out/specimen-panel.png

#import "fig.typ": *
#import "spec-lib.typ": *

#let S = 5 // the panel is drawn at this scale; dimensions read in real mm
#let (cw, ch) = (30mm, 24mm) // the cell
#let m = margins(cw, ch) // the margins: the spacing rules, summed
#let (l, t, r, b) = (m.l, m.t, m.r, m.b)
#let (edge-gap, tick-gap, title-gap) = (m.edge, m.kgap, m.tgap)
#let (pw, ph) = (cw - l - r, ch - t - b)
#let (ox, oy) = (18mm, 30mm) // the cell's corner on the page
#let px(v) = ox + v * S // real x in the cell -> page
#let py(v) = oy + v * S

#set page(width: 196mm, height: 166mm, margin: 0pt, fill: white)
#set text(font: "IBM Plex Sans", size: 7pt, fill: ink, lang: "en")
#set par(spacing: 0em)
#_journal.update("nature")

#let fmt(v) = {
  let n = int(calc.round(v / 1mm * 10))
  str(calc.quo(n, 10)) + "." + str(calc.rem(n, 10))
}
#let put(x, y, body) = place(top + left, dx: x, dy: y, body)
#let dotted-v(x, y0, y1) = put(x, y0, line(angle: 90deg, length: y1 - y0, stroke: edge-line))
#let dotted-h(y, x0, x1) = put(x0, y, line(length: x1 - x0, stroke: edge-line))

// The cell, with the panel drawn at scale.
#put(ox, oy, rect(width: cw * S, height: ch * S, fill: guide-col.lighten(94%), stroke: guide))
#put(px(l), py(t), rect(width: pw * S, height: ph * S, stroke: (paint: guide-col, thickness: 0.35pt, dash: "dashed")))
#put(ox, oy, scale(S * 100%, origin: top + left, reflow: true, chart(cw, ch,
  (w, h) => place(top + left, curve(stroke: 1pt + prussian, curve.move((0pt, h * 0.8)), curve.line((w * 0.5, h * 0.3)), curve.line((w, h * 0.5)))),
  xticks: ((0, [0]), (1, [10])), yticks: ((0, [−0.2]), (1, [0.2])),
  xtitle: [Time (d)], ytitle: [Response], head-txt: [Head],
)))

// Boundaries along the x axis (real mm from the cell's left edge), and along y
// from the x axis down and from the cell's top edge.
#let xs = (0mm, edge-gap, edge-gap + cap-title + desc, l - tick-len - tick-gap - label-w, l - tick-len - tick-gap, l - tick-len, l)
#let ys = (0mm, tick-len, tick-len + tick-gap, tick-len + tick-gap + cap-tick, b - edge-gap - desc - cap-title, b - edge-gap, b - edge-gap + desc, b)

// Chain above the cell: left of the y axis, then the head and the cell's top.
#let chain-h(y, bounds, labels) = for (i, lab) in labels.enumerate() {
  put(px(bounds.at(i)), y, dim-h((bounds.at(i + 1) - bounds.at(i)) * S, lab, above: calc.even(i)))
}
#chain-h(oy - 9mm, xs, ([#fmt(edge-gap)], [#fmt(cap-title + desc)], [#fmt(title-gap)], [#fmt(label-w)], [#fmt(tick-gap)], [#fmt(tick-len)]))
#for x in xs { dotted-v(px(x), oy - 9mm, oy + ch * S) }
#put(px(l) + pw * S, oy - 9mm, dim-h(r * S, [#fmt(r)], above: false))
#put(ox, oy - 17mm, dim-h(l * S, [#fmt(l)]))
#dotted-v(px(l + pw), oy - 9mm, oy + ch * S)
#put(px(l), oy - 17mm, dim-h(pw * S, [#fmt(pw)]))
#put(ox - 7mm, py(t), dim-vl(ph * S, [#fmt(ph)]))
#for y in (t, t + ph) { dotted-h(py(y), ox - 7mm, ox) }

// Chain to the right of the cell: the top margin, then below the x axis.
#let xr = ox + cw * S + 8mm
#let chain-v(x, y0, bounds, labels) = for (i, lab) in labels.enumerate() {
  let seg = (bounds.at(i + 1) - bounds.at(i)) * S
  put(x, y0 + bounds.at(i) * S, if calc.even(i) { dim-v(seg, lab) } else { dim-vl(seg, lab) })
}
#let y-axis = py(t + ph)
#chain-v(xr, y-axis, ys, ([#fmt(tick-len)], [#fmt(tick-gap)], [#fmt(cap-tick)], [#fmt(title-gap)], [#fmt(cap-title)], [#fmt(desc)], [#fmt(edge-gap)]))
#for y in ys { dotted-h(y-axis + y * S, ox, xr) }
// The top: head cap top, its baseline and descender, then the plot area.
#let top-b = (0mm, edge-gap, edge-gap + cap-title + desc, t)
#chain-v(xr, oy, top-b, ([#fmt(edge-gap)], [#fmt(cap-title + desc)], [#fmt(title-gap)]))
#for y in top-b { dotted-h(oy + y * S, ox, xr) }
#put(xr + 10mm, oy, dim-v(t * S, [#fmt(t)]))
#put(xr + 10mm, y-axis, dim-v(b * S, [#fmt(b)]))

// Type in the panel: role, size, weight, colour role.
#put(ox, oy + ch * S + 8mm, text(size: 6pt, fill: guide-text)[
  head · 6 pt, 500, ink #h(6mm) axis title · 6 pt, 500, black #h(6mm) tick label · 5 pt, 400, black #h(6mm) axis, tick · 0.5 pt, black #h(6mm) 5× scale: sizes above are real
])
