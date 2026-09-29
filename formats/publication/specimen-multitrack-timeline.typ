// Specimen multitrack timeline: a composite panel of tracks stacked under one
// shared time axis, drawn at 1.8x with its distances dimensioned. The rules are
// the constants in spec-lib.typ (README, *Composite panels*).
// Compile from formats/publication/:
//   typst compile --root ../.. --font-path ../../core/fonts specimen-multitrack-timeline.typ out/specimen-multitrack-timeline.pdf
//   typst compile --root ../.. --font-path ../../core/fonts --format png --ppi 300 specimen-multitrack-timeline.typ out/specimen-multitrack-timeline.png

#import "fig.typ": *
#import "spec-lib.typ": *

#set page(width: 210mm, height: 128mm, margin: 0pt, fill: white)
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
// Form 17 colours: observed in vermilion 500, predicted in blue, the risk line on
// the valence scale.
#let obs = rgb(tokens.ramps.vermilion.at("500"))
#let pred = rgb(tokens.ramps.blue.at("600"))
#let prob(f) = color.mix((rgb(tokens.ramps.blue.at("100")), (1 - f) * 100%), (rgb(tokens.ramps.blue.at("700")), f * 100%))
#let valence(v) = rgb(tokens.diverging.valence.at(int(calc.round((calc.clamp(v, -1, 1) + 1) / 2 * 14))))
#let obs-dot(x, y, r) = put(x - r, y - r, circle(radius: r, fill: obs, stroke: 0.25pt + white))
#let axes-y(x, y, len) = put(x, y, line(angle: 90deg, length: len, stroke: axes))
#let axes-x(x, y, len) = put(x, y, line(length: len, stroke: axes))

#let SB = 1.8
#let bw = 90mm
#let (box-x, boy) = (10mm, 16mm)
#let bpx(v) = box-x + v * SB
#let bpy(v) = boy + v * SB

// Groups and their tracks: (kind, label).
#let groups = (
  ("Risk", (("value", "Log hazard"),)),
  ("Progression", (("event", "Progression"),)),
  ("Treatment", (("lane", "Carboplatin"), ("lane", "Pembrolizumab"), ("lane", "Pemetrexed"))),
  ("Laboratory", (("value", "Albumin (g/dL)"), ("value", "RDW (%)"))),
)

// Track layout: y of each group header and track, from the top of the stack.
#let stack-layout() = {
  let y = 0mm
  let out = ()
  for (g, tracks) in groups {
    let gy = y
    y += group-gap
    let ts = ()
    for (i, (kind, lab)) in tracks.enumerate() {
      if i > 0 { y += track-gap }
      ts.push((kind: kind, label: lab, y: y, h: track-h.at(kind)))
      y += track-h.at(kind)
    }
    out.push((name: g, y: gy, tracks: ts))
    y += track-gap
  }
  (groups: out, h: y)
}

#let stack-geom() = {
  let st = stack-layout()
  let lw = calc.max(..groups.map(((g, ts)) => ts.map(((k, l)) => measure(text(size: 6pt, l)).width)).flatten())
  let vw = measure(tick[−2]).width
  let m0 = margins(bw, 60mm)
  let (edge, tgap, kgap) = (m0.edge, m0.tgap, m0.kgap)
  // top: head, x title, tick text, tick; bottom: the edge gap
  let t = edge + cap-title + desc + tgap + cap-title + desc + tgap + cap-tick + kgap + tick-len
  let l = edge + lw + label-gap + vw + kgap + tick-len
  let h = t + st.h + edge
  (st: st, lw: lw, vw: vw, edge: edge, tgap: tgap, kgap: kgap, t: t, l: l, r: right-margin, h: h, pw: bw - l - right-margin)
}

#let wave(x, a, b, c) = a * calc.sin(x * b + c) + 0.3 * a * calc.sin(x * 3.1 * b)

#let panel-b = context {
  let G = stack-geom()
  let (t, l, pw) = (G.t, G.l, G.pw)
  block(width: bw, height: G.h, {
    put(l, G.edge, head[Example patient])
    // shared time axis on top
    let ty = t
    axes-x(l, ty, pw)
    for (f, s) in ((0, [0]), (0.5, [3]), (1, [6])) {
      put(l + f * pw, ty - tick-len, line(angle: 90deg, length: tick-len, stroke: axes))
      put(l + f * pw - 10mm, ty - tick-len - G.kgap - cap-tick, box(width: 20mm, align(center, tick(s))))
    }
    put(l, G.edge + cap-title + desc + G.tgap, box(width: pw, align(right, axis[Years since diagnosis])))
    for gr in G.st.groups {
      let gy = t + gr.y
      put(G.edge, gy, line(length: bw - G.r - G.edge, stroke: hairline))
      put(G.edge, gy + group-gap - 0.6mm - cap-tick, group(gr.name))
      for (i, tr) in gr.tracks.enumerate() {
        let y = t + tr.y
        if i > 0 { put(G.edge, y - track-gap / 2, line(length: bw - G.r - G.edge, stroke: hairline)) }
        put(G.edge, y + tr.h / 2 - 1.1mm, box(width: G.lw, align(right, text(size: 6pt, fill: ink, tr.label))))
        if tr.kind == "value" {
          axes-y(l, y, tr.h)
          for (f, s) in ((0, [−2]), (1, [2])) {
            put(l - tick-len, y + tr.h - f * tr.h, line(length: tick-len, stroke: axes))
            // labels left of the axis, within the track: the top one hangs from its top edge
            put(l - tick-len - G.kgap - G.vw, y + (1 - f) * (tr.h - cap-tick), box(width: G.vw, align(right, tick(s))))
          }
          let n = 60
          let a = tr.h * 0.35
          let pts = range(n + 1).map(k => (k / n * pw, y + tr.h / 2 - wave(k / n * 6, a, 1.2, tr.y / 1mm)))
          if tr.label == "Log hazard" {
            // risk: each segment takes the valence colour of its value
            for k in range(n) {
              let v = wave((k + 0.5) / n * 6, 1, 1.2, tr.y / 1mm) / 1.3
              put(l, 0mm, curve(stroke: (paint: valence(v), thickness: 1pt, cap: "round"), curve.move(pts.at(k)), curve.line(pts.at(k + 1))))
            }
          } else {
            // lab: predicted line, observed dots over it
            put(l, 0mm, curve(stroke: 1pt + pred, curve.move(pts.at(0)), ..pts.slice(1).map(p => curve.line(p))))
            for k in range(2, n, step: 4) {
              let (px, py) = pts.at(k)
              obs-dot(l + px, py + 0.25 * a * calc.sin(k * 2.3), 1.5pt)
            }
          }
        } else if tr.kind == "event" {
          for f in (0.08, 0.62) {
            obs-dot(l + f * pw, y + tr.h / 2, 1.5pt)
          }
        } else {
          let nc = 40
          for k in range(nc) {
            let v = calc.max(0, calc.min(1, 0.5 + wave(k / nc * 6, 0.6, 1.4, tr.y / 1mm)))
            put(l + k / nc * pw, y, rect(width: pw / nc, height: tr.h, fill: prob(v), stroke: none))
          }
          // observed interval: a round-capped vermilion bar with a paper ring
          let iv = ("Carboplatin": (0.06, 0.2), "Pembrolizumab": (0.04, 0.1), "Pemetrexed": (0.08, 0.55)).at(tr.label, default: none)
          if iv != none {
            let (a0, a1) = iv
            put(l + a0 * pw, y + tr.h / 2 - 0.4mm, rect(width: (a1 - a0) * pw, height: 0.8mm, radius: 0.4mm, fill: obs, stroke: 0.25pt + white))
          }
        }
      }
    }
    // start-time rule: from the axis through every track
    put(l, ty, line(angle: 90deg, length: G.st.h, stroke: axes))
  })
}

#context {
  let G = stack-geom()
  let bh = G.h
  put(box-x, boy, rect(width: bw * SB, height: bh * SB, fill: guide-col.lighten(94%), stroke: guide))
  put(box-x, boy, scale(SB * 100%, origin: top + left, reflow: true, panel-b))
  dash-rect(bpx(G.l), bpy(G.t), G.pw * SB, G.st.h * SB)
  // across the top: edge, label column, label gap, value ticks + tick gap + tick, plot
  let yA = boy - 8mm
  let xs = (0mm, G.edge, G.edge + G.lw, G.edge + G.lw + label-gap, G.l, bw - G.r, bw)
  let labs = ([#fmt(G.edge)], [labels #fmt(G.lw)], [#fmt(label-gap)], [#fmt(G.vw + G.kgap + tick-len)], [plot #fmt(G.pw)], [#fmt(G.r)])
  for (i, lab) in labs.enumerate() {
    put(bpx(xs.at(i)), yA, dim-h((xs.at(i + 1) - xs.at(i)) * SB, lab, above: calc.even(i)))
  }
  for x in xs { dotted-v(bpx(x), yA, boy + bh * SB) }
  // down the right: axis margin, then each group's header gap and tracks
  let xR = box-x + bw * SB + 4mm
  put(xR, boy, dim-v(G.t * SB, [axis #fmt(G.t)]))
  for gr in G.st.groups {
    let gy = G.t + gr.y
    put(xR, bpy(gy), dim-vl(group-gap * SB, [#fmt(group-gap)]))
    dotted-h(bpy(gy), bpx(bw), xR)
    for tr in gr.tracks {
      put(xR, bpy(G.t + tr.y), dim-v(tr.h * SB, [#tr.kind #fmt(tr.h)]))
      dotted-h(bpy(G.t + tr.y), bpx(bw), xR)
    }
  }
  put(box-x, boy + bh * SB + 5mm, box(width: 190mm, text(size: 6pt, fill: guide-text)[
    Track stack, #SB×. One time axis, on top; tracks #fmt(track-gap) mm apart with a 0.25 pt `rule` hairline in the gap; each group opens with a #fmt(group-gap) mm header row (5 pt, 500, caps, tracked). Track labels (6 pt, ink) right-align in a label column that grows the left margin; value tracks carry a y axis with two ticks at round numbers, labelled left of the axis within the track's height; events and lanes carry none. A black rule at the start time runs through every track. Colour follows form 17: observed in vermilion, predicted in blue (lines, and probability on the blue ramp), risk on the valence scale. Lengths in mm, real size.
  ]))
}
