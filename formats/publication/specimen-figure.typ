// Specimen figure: a Nature full-width (183 mm) multipanel figure assembled
// with fig.typ. It shows the grid, panel letters, gutters and type roles, the
// panel contract as annotated placeholder panels, one imported SVG schematic
// and one raster panel with a scale bar. Compile from formats/publication/:
//   typst compile --root ../.. --font-path ../../core/fonts specimen-figure.typ out/specimen-figure.pdf
//   typst compile --root ../.. --font-path ../../core/fonts --format png --ppi 300 specimen-figure.typ out/specimen-figure.png

#import "fig.typ": *

#let hairline = 0.5pt + rgb("#d9dbe0")

// A label rotated into a vertical band: the text lays out on one line in a
// wide box, and the band box centres the rotated result, so no dx arithmetic
// is needed.
#let band-label(width, height, body) = block(
  width: width,
  height: height,
  align(center + horizon, box(width: 100mm, align(center, rotate(-90deg, body)))),
)

// Panel b: the panel contract, drawn as a placeholder panel. The plot area
// sits at the contract insets; each reserved margin is labelled with its value.
#let contract-panel() = block(width: 100%, height: 34mm, {
  place(top + left, dx: 12mm, dy: 1.7mm, head[Panel head, one line])
  place(top + right, dy: 2.2mm, cap[6 mm])
  place(top + left, dx: 12mm, dy: 6mm, block(
    width: 75mm,
    height: 19mm,
    stroke: hairline,
    align(center + horizon, {
      label[plot area]
      linebreak()
      cap[axes align across panels from any tool]
    }),
  ))
  place(top + left, dx: 0mm, dy: 6mm, band-label(6.8mm, 19mm, cap[y ticks + y title · 12 mm]))
  place(top + left, dx: 87mm, dy: 6mm, band-label(2mm, 19mm, cap[2 mm]))
  place(top + left, dx: 12mm, dy: 27.4mm, cap[x ticks + x title · 9 mm])
})

// A key entry: a short line swatch in the series colour, named in the tick role.
#let key-item(colour, txt) = box(baseline: 35%)[
  #box(width: 5mm)[#line(length: 100%, stroke: 0.5pt + colour)]
  #h(1mm)
  #tick(txt)
]

// Panel d: a key in the reserved top margin, above the plot area.
#let key-panel() = block(width: 100%, height: 30mm, {
  place(top + left, dx: 12mm, dy: 1.8mm, box(stack(dir: ltr, spacing: 4mm,
    key-item(rgb("#1f4e79"), [sensitive]),
    key-item(rgb("#a3a8b1"), [resistant]),
  )))
  place(top + left, dx: 12mm, dy: 6mm, rect(width: 43.667mm, height: 15mm, stroke: hairline))
})

// Panel e: small multiples on a shared row — one y title and y ticks per row,
// one x title per column.
#let small-mult-panel() = block(width: 100%, height: 30mm, {
  place(top + left, dx: 12mm, dy: 6mm, rect(width: 20.33mm, height: 15mm, stroke: hairline))
  place(top + left, dx: 35.33mm, dy: 6mm, rect(width: 20.33mm, height: 15mm, stroke: hairline))
  place(top + left, dx: 4mm, dy: 5.2mm, box(width: 6.3mm, align(right, tick[1])))
  place(top + left, dx: 4mm, dy: 19.8mm, box(width: 6.3mm, align(right, tick[0])))
  place(top + left, dx: 0mm, dy: 6mm, band-label(6.8mm, 15mm, axis[Cell line]))
  place(top + left, dx: 34mm, dy: 23.2mm, box(width: 21.667mm, align(right, axis[Time (days)])))
  place(top + left, dx: 12mm, dy: 27.4mm, cap[one y title per row, one x title per column])
})

// Panel c: the raster at scale 1 by width, with a scale bar of true printed
// length (a 10 mm line in Typst is 10 mm on paper) on a paper underlay, so it
// reads over a busy image.
#let raster-panel() = block(width: 100%, height: 30mm, {
  image("../../core/out/specimen-scales.png", width: 100%, fit: "contain")
  place(top + left, dx: 40.23mm, dy: 23.1mm, block(
    width: 12.6mm,
    height: 5.9mm,
    fill: white,
    align(center + horizon, {
      box(width: 10mm, align(center, line(length: 100%, stroke: 0.5pt + ink)))
      v(0.7mm)
      box(width: 10mm, align(center, cap[10 mm]))
    }),
  ))
})

#fig-page(journal: "nature", width: "full", height: auto)[
  #fig-grid(columns: 6, rows: (auto, auto), gutter: 5mm,
    grid.cell(colspan: 3, fig-panel("a", "specimen-schematic.svg")),
    grid.cell(colspan: 3, fig-panel("b", contract-panel())),
    grid.cell(colspan: 2, fig-panel("c", raster-panel(), width: 53.33mm)),
    grid.cell(colspan: 2, fig-panel("d", key-panel())),
    grid.cell(colspan: 2, fig-panel("e", small-mult-panel())),
  )
  #v(2.5mm)
  #cap[Nature full width, 183 mm · gutter 5 mm · rows share one height · letters sit on the panel's top edge, outside the plot · reserved margins are the panel contract (panel b)]
]
