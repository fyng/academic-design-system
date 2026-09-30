// Specimen figure: a US Letter page holding a full-page multipanel figure
// assembled with fig.typ. Locked margins: 6 mm at the sides, 8 mm at top and
// bottom. Guidelines divide the plotting space: the height into six units, each
// row's width into equal columns (4, 2 and 3 here) with a 3 mm gutter, and every
// panel takes one unit or several adjacent ones. Row 1 is the typical case;
// row 2 is atypical: its columns divide differently, d one unit for the whole
// column, the other column in thirds with e taking two and f one. The layout
// uses fig-span and fig-at. Compile from formats/publication/:
//   typst compile --root ../.. --font-path ../../core/fonts specimen-figure.typ out/specimen-figure.pdf
//   typst compile --root ../.. --font-path ../../core/fonts --format png --ppi 300 specimen-figure.typ out/specimen-figure.png

#import "fig.typ": *
#import "spec-lib.typ": *

// Layout (mm): Letter page, locked margins, the figure fills the rest.
#let page-w = 215.9mm
#let page-h = 279.4mm
#let border-x = 6mm
#let border-y = 8mm
#let fig-w = page-w - 2 * border-x
#let fig-h = page-h - 2 * border-y
#let gut = 3mm

// Guidelines, with fig-span. Height: six row units. A row of `n` columns
// divides the width into `n` equal units; a panel spans `k` adjacent units
// (and their gutters).
#let row(i, k: 1) = fig-span(fig-h, 6, i, k: k, gutter: gut)
#let col(n, i, k: 1) = fig-span(fig-w, n, i, k: k, gutter: gut)
#let row1 = row(0)
#let row2 = row(1, k: 4) // row 2 spans four row units
#let row3 = row(5)
#let e-rows = fig-span(row2, 3, 0, k: 2, gutter: gut) // row 2, right column in thirds
#let f-rows = fig-span(row2, 3, 2, gutter: gut)
#let ru = row1.len
#let cu(n) = col(n, 0).len
#let cx(n, i) = col(n, i).at
#let cspan(n, k) = col(n, 0, k: k).len
#let (y2, h2, y3) = (row2.at, row2.len, row3.at)

// A panel: its letter zone (shaded, 5 mm square) over `body`, which fills the
// w x h cell. Charts dash their own plot area; `guides` dashes the default one.
#let panel(n, w, h, body, guides: false) = fig-panel(n, block(width: w, height: h, {
  place(top + left, rect(width: letter-zone, height: letter-zone, fill: guide-col.lighten(75%), stroke: guide))
  body
  if guides { plot-guide(w, h) }
}), width: w)

// Deterministic pseudo-random number in [0, 1).
#let rnd(i) = calc.rem(calc.abs(calc.sin(i * 12.9898) * 43758.5453), 1)

// ---- panels ---------------------------------------------------------------

// Panel c: the margins of its own cell, dimensioned. The spacing inside them is
// defined in specimen-panel.typ.
#let contract-panel(w, h) = {
  let m = margins(w, h)
  let pw = w - m.l - m.r
  let ph = h - m.t - m.b
  let fmt1(v) = {
    let n = int(calc.round(v / 1mm * 10))
    str(calc.quo(n, 10)) + "." + str(calc.rem(n, 10))
  }
  block(width: w, height: h, {
    place(top + left, dx: m.l, dy: m.edge, head[Head])
    place(top + left, dx: m.l, dy: m.t, block(width: pw, height: ph, stroke: (left: axes, bottom: axes),
      align(center + horizon, text(size: 6pt, fill: guide-text)[plot area #fmt1(pw) × #fmt1(ph) mm])))
    place(top + left, dy: m.t + ph / 2 - 1mm, dim-h(m.l, fmt1(m.l), above: true))
    place(top + left, dx: m.l + pw, dy: m.t + ph / 2 - 1mm, dim-h(m.r, fmt1(m.r), above: false))
    place(top + left, dx: m.l + pw / 4, dy: 0mm, dim-v(m.t, fmt1(m.t)))
    place(top + left, dx: m.l + pw / 4, dy: m.t + ph, dim-v(m.b, fmt1(m.b)))
    // dotted extensions of the plot area edges into the margins
    for y in (m.t, m.t + ph) { place(top + left, dy: y, line(length: m.l, stroke: edge-line)) }
    for x in (m.l, m.l + pw) { place(top + left, dx: x, line(angle: 90deg, length: h, stroke: edge-line)) }
  })
}

// Panel b: two survival curves, 1/4 width.
#let survival-panel(w, h) = chart(w, h,
  (pw, ph) => {
    place(top + left, curve(stroke: 1pt + prussian, curve.move((0%, 0%)), curve.line((25%, 0%)), curve.line((25%, 20%)), curve.line((55%, 20%)), curve.line((55%, 55%)), curve.line((100%, 55%))))
    place(top + left, curve(stroke: 1pt + context-grey, curve.move((0%, 0%)), curve.line((40%, 0%)), curve.line((40%, 10%)), curve.line((80%, 10%)), curve.line((80%, 30%)), curve.line((100%, 30%))))
  },
  xticks: ((0, [0]), (0.5, [30]), (1, [60])), yticks: ((0, [0]), (0.5, [0.5]), (1, [1])),
  xtitle: [Days], ytitle: [Survival], guide: true,
)

// Panel d: heatmap of z-scores; the ramp is the sequential `quantity` scale.
#let heat-panel(w, h) = {
  let (nr, nc) = (36, 20)
  chart(w, h,
    (pw, ph) => {
      let cw = pw / nc
      let rh = ph / nr
      for i in range(nr) {
        for j in range(nc) {
          let v = calc.sin(i * 0.55) * calc.cos(j * 0.6 + i * 0.05) + (rnd(i * 31 + j) - 0.5) * 0.7
          let k = calc.max(0, calc.min(8, calc.floor((v + 1.4) / 2.8 * 9)))
          place(top + left, dx: j * cw, dy: i * rh, rect(width: cw, height: rh, fill: rgb(ramp.at(str((k + 1) * 100))), stroke: 0.5pt + white))
        }
      }
    },
    xticks: ((0.5 / nc, [1]), (9.5 / nc, [10]), (19.5 / nc, [20])), yticks: ((1 - 0.5 / nr, [1]), (1 - 17.5 / nr, [18]), (0.5 / nr, [36])),
    xtitle: [Sample], ytitle: [Gene], head-txt: [Expression], guide: true,
  )
}

// Highlighted genes: name, log2 fold change, -log10 P, side of the label, mean z.
#let hits = (
  (name: "MYC", x: -2.0, y: 6.4, side: right, mu: -1.4),
  (name: "CDK6", x: -1.5, y: 4.3, side: right, mu: -0.9),
  (name: "SOX2", x: 1.3, y: 3.8, side: left, mu: 0.8),
  (name: "KRT8", x: 2.1, y: 6.0, side: left, mu: 1.5),
)

// Panel e: volcano plot with the highlighted genes called out.
#let volcano-panel(w, h) = chart(w, h,
  (pw, ph) => {
    let sx(x) = (x + 3) / 6 * pw
    let sy(y) = ph - y / 8 * ph
    let dash = (paint: ink-2, thickness: 0.5pt, dash: (1pt, 2pt))
    place(top + left, line(start: (sx(-1), 0pt), end: (sx(-1), ph), stroke: dash))
    place(top + left, line(start: (sx(1), 0pt), end: (sx(1), ph), stroke: dash))
    place(top + left, line(start: (0pt, sy(1.3)), end: (pw, sy(1.3)), stroke: dash))
    for i in range(400) {
      let x = (rnd(i) + rnd(i + 900) + rnd(i + 1900) - 1.5) * 2.4
      let y = calc.min(7.6, calc.abs(x) * (0.8 + 2.4 * rnd(i + 500)) + rnd(i + 77) * 1.2)
      let hit = calc.abs(x) > 1 and y > 1.3
      place(top + left, dx: sx(x) - 1pt, dy: sy(y) - 1pt, circle(radius: 1pt, fill: if hit { prussian } else { context-grey }, stroke: none))
    }
    for g in hits {
      place(top + left, dx: sx(g.x) - 1.5pt, dy: sy(g.y) - 1.5pt, circle(radius: 1.5pt, fill: ink, stroke: 0.25pt + white))
      let off = if g.side == right { 2.2mm } else { -2.2mm - 10mm }
      place(top + left, dx: sx(g.x) + off, dy: sy(g.y) - 1.2mm, box(width: 10mm, align(if g.side == right { left } else { right }, label(g.name))))
    }
  },
  xticks: ((0, [−3]), (0.5, [0]), (1, [3])), yticks: ((0, [0]), (0.5, [4]), (1, [8])),
  xtitle: [log₂ fold change], ytitle: [−log₁₀ P], head-txt: [Differential expression], guide: true,
)

// Beeswarm offsets (mm) for values `ys` (mm): each point takes the nearest
// free slot beside the group's centre.
#let swarm-x(ys, d: 1.1, step: 0.5) = {
  let placed = ()
  let slots = (0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8, 9, -9).map(c => c * step)
  for y in ys.sorted() {
    let x = slots.find(x => placed.all(p => calc.pow(p.at(0) - x, 2) + calc.pow(p.at(1) - y, 2) >= d * d))
    placed.push((if x == none { slots.last() } else { x }, y))
  }
  placed
}

// Panel f: expression of the highlighted genes across the 20 samples,
// beeswarm with a median bar (form 09).
#let swarm-panel(w, h) = {
  let n = hits.len()
  chart(w, h,
    (pw, ph) => {
      let lo = -3
      let hi = 3
      let yz(v) = (hi - v) / (hi - lo) * ph
      for (k, g) in hits.enumerate() {
        let cx = (k + 0.5) / n * pw
        let vals = range(20).map(j => g.mu + (rnd(k * 97 + j) + rnd(k * 97 + j + 500) - 1) * 1.6)
        let pts = swarm-x(vals.map(v => yz(v) / 1mm))
        for p in pts {
          place(top + left, dx: cx + p.at(0) * 1mm - 1.5pt, dy: p.at(1) * 1mm - 1.5pt, circle(radius: 1.5pt, fill: ink-2, stroke: 0.25pt + white))
        }
        let med = (vals.sorted().at(9) + vals.sorted().at(10)) / 2
        place(top + left, dx: cx - 5mm, dy: yz(med) - 1pt, block(width: 10mm, height: 2pt, fill: white, align(horizon, line(length: 100%, stroke: 1pt + ink))))
      }
    },
    xticks: hits.enumerate().map(((k, g)) => ((k + 0.5) / n, tick(text(size: 7pt, g.name)))),
    yticks: ((0, [−3]), (0.5, [0]), (1, [3])),
    ytitle: [z-score], head-txt: [Highlighted genes], guide: true,
  )
}

// Panel g: the raster at scale 1 by width, below the letter zone, with a scale
// bar of true printed length on a paper underlay.
#let raster-panel(w, h) = block(width: w, height: h, {
  place(top + left, dy: letter-zone, image("out/specimen-micrograph.png", width: w, height: h - letter-zone, fit: "cover"))
  place(bottom + right, dx: -2mm, dy: -2mm, block(width: 12.6mm, height: 5.9mm, fill: white,
    align(center + horizon, {
      box(width: 10mm, align(center, line(length: 100%, stroke: 0.5pt + ink)))
      v(0.7mm)
      box(width: 10mm, align(center, cap[20 µm]))
    })))
})

// Panel h: small multiples on a shared row: one y title and ticks per row, one
// x title per column, one gutter apart. The cell's margins apply to the row as
// a whole.
#let multiples-panel(w, h, guides: false) = {
  let n = 4
  let gap = gut
  let m = margins(w, h)
  let pw = (w - m.l - m.r - (n - 1) * gap) / n
  let ph = h - m.t - m.b
  block(width: w, height: h, {
    place(top + left, dx: 0mm, dy: m.t, band-label(2 * m.edge + cap-title, ph, axis[Response]))
    for k in range(n) {
      let x0 = m.l + k * (pw + gap)
      place(top + left, dx: x0, dy: m.t, rect(width: pw, height: ph, stroke: (left: axes, bottom: axes)))
      place(top + left, dx: x0, dy: m.t, curve(stroke: 1pt + prussian, curve.move((0pt, ph * 0.9)), curve.line((pw * 0.5, ph * (0.7 - 0.12 * k))), curve.line((pw, ph * (0.5 - 0.1 * k)))))
      place(top + left, dx: x0 - 0.4mm, dy: m.t + ph + tick-len + m.kgap, tick[0])
      place(top + left, dx: x0 + pw - 2.2mm, dy: m.t + ph + tick-len + m.kgap, tick[6])
      place(top + left, dx: x0, dy: h - m.edge - desc - cap-title, box(width: pw, align(center, axis[Time (d)])))
      if guides { place(top + left, dx: x0, dy: m.t, rect(width: pw, height: ph, stroke: (paint: guide-col, thickness: 0.35pt, dash: "dashed"))) }
    }
    place(top + left, dx: m.l - tick-len - m.kgap - 8mm, dy: m.t + ph - cap-tick / 2, box(width: 8mm, align(right, tick[0])))
    place(top + left, dx: m.l - tick-len - m.kgap - 8mm, dy: m.t - cap-tick / 2, box(width: 8mm, align(right, tick[1])))
  })
}

// ---- page -----------------------------------------------------------------

#let unused = tiling(size: (3mm, 3mm), {
  rect(width: 100%, height: 100%, fill: rgb(tokens.neutral.rule).lighten(55%), stroke: none)
  line(start: (0pt, 100%), end: (100%, 0pt), stroke: 0.4pt + rgb(tokens.neutral.rule))
})

#set page(width: page-w, height: page-h, margin: 0pt, fill: unused)
#set text(font: "IBM Plex Sans", size: 7pt, fill: ink, lang: "en")
#set par(spacing: 0em)
#_journal.update("nature")

#let ox = border-x
#let oy = border-y
#let at(x, y, body) = place(top + left, dx: ox + x, dy: oy + y, body)
#let r1 = (n: 4, y: 0mm, h: ru)
#let r3 = (n: 3, y: y3, h: ru)
#let t3 = f-rows.len
#let hv = e-rows.len
#let hf = f-rows.len
#let fmt(v) = str(calc.round(v / 1mm, digits: 1))

#place(top + left, rect(width: fig-w, height: fig-h, fill: white, stroke: guide), dx: ox, dy: oy)

// Guidelines: every unit of every row is a tile. Row 2 spans four row units.
#let tile(x, y, w, h) = at(x, y, rect(width: w, height: h, fill: guide-col.lighten(94%), stroke: (paint: guide-col, thickness: 0.35pt, dash: "dotted")))
#for r in (r1, r3) { for i in range(r.n) { tile(cx(r.n, i), r.y, cu(r.n), r.h) } }
#tile(cx(2, 0), y2, cu(2), h2)
#for j in range(3) { tile(cx(2, 1), y2 + j * (t3 + gut), cu(2), t3) }

// A panel over several units also covers the gutters between them; dotted lines
// keep the unit edges.
#let span-fill(n, i, k, r) = {
  at(cx(n, i), r.y, rect(width: cspan(n, k), height: r.h, fill: guide-col.lighten(94%), stroke: none))
  for m in range(i + 1, i + k) {
    for x in (cx(n, m) - gut, cx(n, m)) {
      at(x, r.y, line(angle: 90deg, length: r.h, stroke: (paint: guide-col, thickness: 0.35pt, dash: "dotted")))
    }
  }
}
#span-fill(4, 2, 2, r1)
#span-fill(3, 1, 2, r3)
#at(cx(2, 1), y2 + t3, rect(width: cu(2), height: gut, fill: guide-col.lighten(94%), stroke: none))
#for y in (y2 + t3, y2 + t3 + gut) { at(cx(2, 1), y, line(length: cu(2), stroke: (paint: guide-col, thickness: 0.35pt, dash: "dotted"))) }

// Panels, placed with fig-at in the figure's own frame. Panel a is a file at
// its own size (fig-panel with a path); the others are drawn here.
#at(0mm, 0mm, block(width: fig-w, height: fig-h, {
  // Row 1 (typical): a and b take one unit, c two.
  fig-at(col(4, 0), row1, (w, h) => panel("a", w, h, fig-panel(none, path("specimen-schematic.svg")), guides: true))
  fig-at(col(4, 1), row1, (w, h) => panel("b", w, h, survival-panel(w, h)))
  fig-at(col(4, 2, k: 2), row1, (w, h) => panel("c", w, h, contract-panel(w, h)))
  // Row 2 (atypical): d takes the left column; the right column is in thirds.
  fig-at(col(2, 0), row2, (w, h) => panel("d", w, h, heat-panel(w, h)))
  fig-at(col(2, 1), e-rows, (w, h) => panel("e", w, h, volcano-panel(w, h)))
  fig-at(col(2, 1), f-rows, (w, h) => panel("f", w, h, swarm-panel(w, h)))
  // Row 3 (typical): g takes one unit, h two.
  fig-at(col(3, 0), row3, (w, h) => panel("g", w, h, raster-panel(w, h)))
  fig-at(col(3, 1, k: 2), row3, (w, h) => panel("h", w, h, multiples-panel(w, h, guides: true)))
}))

// Critical distances. Column units: row 1 above the figure, row 2 in the gutter
// above it, row 3 below the figure.
#let col-dims(n, y) = for i in range(n) {
  at(cx(n, i), y, dim-h-in(cu(n), [1/#n · #fmt(cu(n))]))
  if i < n - 1 { at(cx(n, i) + cu(n), y, dim-h-in(gut, [#fmt(gut)])) }
}
#col-dims(4, -5mm)
#col-dims(2, y2 - gut / 2 - 1mm)
#col-dims(3, fig-h + 1mm)
// Row units, in the right border.
#at(fig-w + 0.5mm, 0mm, dim-v-rot(ru, [1/6 · #fmt(ru)], w: 5.5mm))
#at(fig-w + 0.5mm, y2, dim-v-rot(h2, [4/6 · #fmt(h2)], w: 5.5mm))
#at(fig-w + 0.5mm, y3, dim-v-rot(ru, [1/6 · #fmt(ru)], w: 5.5mm))
// Row 2: e takes two thirds of the right column, f one.
#at(cu(2), y2, dim-v-rot(hv, [e: 2/3 · #fmt(hv)], w: gut, off: gut - 0.4mm, label-left: true))
#at(cu(2), y2 + hv + gut, dim-v-rot(hf, [f: 1/3 · #fmt(hf)], w: gut, off: gut - 0.4mm, label-left: true))
// The letter zone.
#at(0mm, letter-zone + 1.5mm, dim-h(letter-zone, [5], above: false))
// The locked margins.
#place(top + left, dx: 0mm, dy: page-h / 2, dim-h-in(ox, [6]))
#place(top + left, dx: ox + fig-w, dy: oy - 5mm, dim-h-in(ox, [6]))
#place(top + left, dx: 0.8mm, dy: 0mm, dim-v-rot(oy, [8], w: 4mm))
#place(top + left, dx: 0.8mm, dy: oy + fig-h, dim-v-rot(oy, [8], w: 4mm))
#place(top + left, dx: ox + 8mm, dy: oy + fig-h + 4.6mm, cap[US Letter 215.9 × 279.4 mm. Margins 6 mm at the sides, 8 mm at top and bottom; the shaded area is outside the figure. Lengths in mm.])
