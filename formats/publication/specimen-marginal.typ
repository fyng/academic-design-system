// Specimen marginal: a composite panel with marginal strips, a main plot with
// strips on its top and right, drawn at 3x with its distances dimensioned. The
// rules are the constants in spec-lib.typ (README, *Composite panels*).
// Compile from formats/publication/:
//   typst compile --root ../.. --font-path ../../core/fonts specimen-marginal.typ out/specimen-marginal.pdf
//   typst compile --root ../.. --font-path ../../core/fonts --format png --ppi 300 specimen-marginal.typ out/specimen-marginal.png

#import "fig.typ": *
#import "spec-lib.typ": *

#set page(width: 210mm, height: 160mm, margin: 0pt, fill: white)
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
#let dash-rect(x, y, w, h) = put(x, y, rect(width: w, height: h, stroke: (paint: guide-col, thickness: 0.35pt, dash: "dashed")))
#let axes-y(x, y, len) = put(x, y, line(angle: 90deg, length: len, stroke: axes))
#let axes-x(x, y, len) = put(x, y, line(length: len, stroke: axes))

#let SA = 3
#let (aw, ah) = (44mm, 40mm)
#let (aox, aoy) = (24mm, 22mm)
#let apx(v) = aox + v * SA
#let apy(v) = aoy + v * SA

// Density along the identity line: a coarse 2D histogram, capped.
#let dens(i, j) = {
  let d = calc.abs(i - j)
  let c = calc.exp(-(d * d) / 3) * (0.35 + 0.65 * calc.exp(-calc.pow(i - 8.5, 2) / 12))
  calc.min(1, c)
}
#let hist-x = range(12).map(i => calc.exp(-calc.pow(i - 8.5, 2) / 8) + 0.06)

#let panel-a = context {
  let yticks = ((0, [1.5]), (0.5, [3]), (1, [4.5]))
  let xticks = yticks
  let yw = calc.max(..yticks.map(((f, s)) => measure(tick(s)).width))
  let m = margins(aw, ah, yw: yw)
  let ar = marginal-areas(aw, ah, m)
  let mn = ar.main
  let n = 12
  let q = tokens.sequential.quantity
  block(width: aw, height: ah, {
    put(m.l, m.edge, head[Predicted vs measured])
    // main: density cells, identity line, axes, ticks, titles
    let cw = mn.w / n
    let ch = mn.h / n
    for i in range(n) {
      for j in range(n) {
        let v = dens(i, j)
        if v > 0.04 {
          let k = calc.min(9, calc.max(1, calc.ceil(v * 9)))
          put(mn.x + i * cw, mn.y + mn.h - (j + 1) * ch, rect(width: cw, height: ch, fill: rgb(q.at(str(k * 100))), stroke: 0.5pt + white))
        }
      }
    }
    put(mn.x, mn.y, line(start: (0pt, mn.h), end: (mn.w, 0pt), stroke: (paint: ink-2, thickness: 0.5pt, dash: (1pt, 2pt))))
    axes-y(mn.x, mn.y, mn.h)
    axes-x(mn.x, mn.y + mn.h, mn.w)
    for (f, s) in xticks {
      put(mn.x + f * mn.w, mn.y + mn.h, line(angle: 90deg, length: tick-len, stroke: axes))
      put(mn.x + f * mn.w - 10mm, mn.y + mn.h + tick-len + m.kgap, box(width: 20mm, align(center, tick(s))))
    }
    for (f, s) in yticks {
      put(mn.x - tick-len, mn.y + mn.h - f * mn.h, line(length: tick-len, stroke: axes))
      put(mn.x - tick-len - m.kgap - m.yw, mn.y + mn.h - f * mn.h - cap-tick / 2, box(width: m.yw, align(right, tick(s))))
    }
    put(mn.x, ah - m.edge - desc - cap-title, box(width: mn.w, align(center, axis[Measured (g/dL)])))
    put(0mm, mn.y, band-label(2 * m.edge + cap-title, mn.h, axis[Predicted (g/dL)]))
    // top strip: histogram of x, bars in context grey, one tick at the peak
    let bw = mn.w / n
    for (i, v) in hist-x.enumerate() {
      let bh = v / 1.06 * ar.top.h
      put(ar.top.x + i * bw, ar.top.y + ar.top.h - bh, rect(width: bw, height: bh, fill: context-grey, stroke: 0.5pt + white))
    }
    put(ar.top.x - tick-len, ar.top.y, line(length: tick-len, stroke: axes))
    axes-y(ar.top.x, ar.top.y, ar.top.h)
    put(ar.top.x - tick-len - m.kgap - m.yw, ar.top.y - cap-tick / 2, box(width: m.yw, align(right, tick[80k])))
    // right strip: histogram of y
    let bh = mn.h / n
    for (j, v) in hist-x.enumerate() {
      let bl = v / 1.06 * ar.right.w
      put(ar.right.x, ar.right.y + mn.h - (j + 1) * bh, rect(width: bl, height: bh, fill: context-grey, stroke: 0.5pt + white))
    }
    axes-x(ar.right.x, ar.right.y + ar.right.h, ar.right.w)
    put(ar.right.x + ar.right.w, ar.right.y + ar.right.h, line(angle: 90deg, length: tick-len, stroke: axes))
    put(ar.right.x + ar.right.w - 10mm, ar.right.y + ar.right.h + tick-len + m.kgap, box(width: 20mm, align(center, tick[80k])))
  })
}

#put(aox, aoy, rect(width: aw * SA, height: ah * SA, fill: guide-col.lighten(94%), stroke: guide))
#put(aox, aoy, scale(SA * 100%, origin: top + left, reflow: true, panel-a))
#context {
  let yw = measure(tick[1.5]).width
  let m = margins(aw, ah, yw: yw)
  let ar = marginal-areas(aw, ah, m)
  let (mn, tp, rt) = (ar.main, ar.top, ar.right)
  for r in (mn, tp, rt) { dash-rect(apx(r.x), apy(r.y), r.w * SA, r.h * SA) }
  // across the top: left margin, main, gap, depth, right margin
  let yA = aoy - 9mm
  let xs = (0mm, m.l, mn.x + mn.w, rt.x, rt.x + rt.w, aw)
  let labs = ([#fmt(m.l)], [main #fmt(mn.w)], [#fmt(sat-gap)], [#fmt(marginal-depth)], [#fmt(m.r)])
  for (i, lab) in labs.enumerate() {
    put(apx(xs.at(i)), yA, dim-h((xs.at(i + 1) - xs.at(i)) * SA, lab, above: calc.even(i)))
  }
  for x in xs { dotted-v(apx(x), yA, aoy + ah * SA) }
  // down the right: top margin, depth, gap, main, bottom margin
  let xR = aox + aw * SA + 6mm
  let ys = (0mm, m.t, tp.y + tp.h, mn.y, mn.y + mn.h, ah)
  let vl = ([#fmt(m.t)], [#fmt(marginal-depth)], [#fmt(sat-gap)], [main #fmt(mn.h)], [#fmt(m.b)])
  for (i, lab) in vl.enumerate() {
    let seg = (ys.at(i + 1) - ys.at(i)) * SA
    put(xR, apy(ys.at(i)), if calc.even(i) { dim-v(seg, lab) } else { dim-vl(seg, lab) })
  }
  for y in ys { dotted-h(apy(y), aox, xR) }
  put(aox, aoy + ah * SA + 5mm, box(width: 170mm, text(size: 6pt, fill: guide-text)[
    Marginal strips, 3×. The contract's margins frame the whole cell; the strips come out of the plot area, #fmt(sat-gap) mm from it and #fmt(marginal-depth) mm deep. A strip shares the main axis, carries no title and one tick at the round number just above its peak, set in the main axis's tick column.
  ]))
}
