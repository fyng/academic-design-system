// Assembles journal figures from panels drawn at final size in the project's
// own tool. Sizes and panel letters follow formats/publication/README.md;
// colours come from core/tokens.json. Compile with
// `typst compile --font-path <design-system>/core/fonts fig1.typ`.

#let tokens = json("../../core/tokens.json")
#let ink = rgb(tokens.neutral.ink)
#let ink-2 = rgb(tokens.neutral.at("ink-2"))
#let muted = rgb(tokens.neutral.muted)
// Axes, ticks and their text are black in print, for contrast.
#let axis-ink = black

// Column widths per journal (formats/publication/README.md, *Size*, which also
// gives the height caps). Cell Press asks for Arial, which is not vendored:
// install it and add its folder to --font-path.
#let journals = (
  nature: (col1: 89mm, col15: 136mm, full: 183mm, font: "IBM Plex Sans"),
  science: (col1: 57mm, col15: none, full: 184mm, font: "IBM Plex Sans"),
  cell: (col1: 85mm, col15: 114mm, full: 174mm, font: "Arial"),
  pnas: (col1: 87mm, col15: 114mm, full: 178mm, font: "IBM Plex Sans"),
)

// Panel letters per journal (formats/publication/README.md, *Type*).
#let letters = (
  nature: (size: 8pt, lower: true),
  science: (size: 10pt, lower: false),
  cell: (size: 8pt, lower: false),
  pnas: (size: 8pt, lower: false),
)

// The page's journal, so panels and letters pick up its letter style without
// every helper call passing `journal:` again.
#let _journal = state("fig-journal", "nature")

// The vendored static TTFs register the 500 weight under IBM's legacy family
// name; prefer it and fall back to a family that carries a real 500.
#let plex-500 = ("IBM Plex Sans Medm", "IBM Plex Sans")

// The font a 500 role uses: IBM's legacy Medium family under Plex, the page
// font otherwise (Cell Press's Arial has no 500 and sets it as 400).
#let _font-500(families) = {
  let names = if type(families) == str { (families,) } else { families }
  if names.any(n => lower(n).contains("plex sans")) { plex-500 } else { families }
}

// Page setup: width from the journal preset or a length, height in mm or auto
// (the page then fits the figure), margin 0.
#let fig-page(journal: "nature", width: "full", height: auto, body) = {
  let j = journals.at(journal, default: none)
  if j == none {
    panic("unknown journal: " + journal + "; use one of " + journals.keys().join(", "))
  }
  let w = if type(width) == length { width } else {
    let v = j.at(width, default: none)
    if v == none {
      panic(width + " is not a column preset or a length; Science has no 1.5-column preset (its two-column figure is 121 mm)")
    }
    v
  }
  {
    set page(width: w, height: height, margin: 0pt)
    set text(font: j.font, size: 7pt, fill: ink, lang: "en")
    // Figures compose in exact mm; no hidden spacing between blocks.
    set par(spacing: 0em)
    _journal.update(journal)
    // An auto-height page omits the last line's leading, which clips its
    // descenders; the spacer gives it back.
    if height == auto { body + v(0.65em) } else { body }
  }
}

// Type roles (formats/publication/README.md, *Type*). Letters, heads and
// labels are ink; axis titles and ticks are black; notes are muted.
#let head(body) = context text(font: _font-500(text.font), size: 6pt, weight: 500, fill: ink, body)
#let axis(body) = context text(font: _font-500(text.font), size: 6pt, weight: 500, fill: axis-ink, body)
#let label(body) = text(size: 7pt, fill: ink, body)
#let tick(body) = text(size: 5pt, fill: axis-ink, number-type: "lining", number-width: "tabular", body)
#let cap(body) = text(size: 6pt, fill: muted, body)
#let note(body) = text(size: 6pt, fill: muted, body)
// Group header in a composite panel's track stack: caps, tracked, 500.
#let group(body) = context text(font: _font-500(text.font), size: 5pt, weight: 500, tracking: 0.12em, fill: ink, upper(body))

// Panel letter in the journal's style, bold, ink. The journal comes from the
// page unless given here.
#let fig-letter(n, journal: none) = context {
  let j = if journal != none { journal } else { _journal.get() }
  let l = letters.at(j, default: letters.nature)
  let s = if l.lower { lower(n) } else { upper(n) }
  text(size: l.size, weight: 700, fill: ink, s)
}

// The panel grid for simple figures, where every row divides into the same
// equal columns: one gutter throughout (3–6 mm, 3 mm default; 2 mm for a
// small, dense figure). Rows size to their content, so panels in a row share
// one height when they are drawn to the same height (the panel contract). `rows` takes an int — expanded to
// `1fr`, to stretch rows over a fixed page height — or a list of tracks;
// children may be `grid.cell(colspan: ..)` for wide panels.
#let fig-grid(gutter: 3mm, columns: 2, rows: none, ..children) = {
  if gutter < 2mm or gutter > 6mm { panic("gutter must be 2–6 mm, got " + str(gutter)) }
  let cols = if type(columns) == int { (1fr,) * columns } else { columns }
  if rows == none {
    grid(columns: cols, column-gutter: gutter, row-gutter: gutter, ..children)
  } else {
    let rws = if type(rows) == int { (1fr,) * rows } else { rows }
    grid(columns: cols, rows: rws, column-gutter: gutter, row-gutter: gutter, ..children)
  }
}

// Guidelines (formats/publication/README.md, *Layout*). A span is a stretch of
// the figure along one axis, (at: start, len: length). `fig-span` divides a
// span, or a length from 0, into `n` equal units with gutters between them
// and returns the `k` adjacent units from unit `i` (0-based), gutters
// included. Rows, columns and a column's own division all use it.
#let fig-span(of, n, i, k: 1, gutter: 3mm) = {
  let s = if type(of) == length { (at: 0mm, len: of) } else { of }
  if i < 0 or k < 1 or i + k > n { panic("units " + str(i) + "+" + str(k) + " do not fit in " + str(n)) }
  let u = (s.len - (n - 1) * gutter) / n
  (at: s.at + i * (u + gutter), len: k * u + (k - 1) * gutter)
}

// Places `body` in the cell of spans `x` and `y`, relative to the figure's
// top-left. `body` is content or a function (w, h) => content. The figure
// needs a fixed height: give `fig-page` a length.
#let fig-at(x, y, body) = place(top + left, dx: x.at, dy: y.at,
  block(width: x.len, height: y.len, if type(body) == function { body(x.len, y.len) } else { body }))

// The letter zone: a square at each panel's top-left corner that holds the
// panel letter. No plot element enters it.
#let letter-zone = 5mm

// Whether a file is a raster image, from its first bytes.
#let _is-raster(p) = {
  let b = array(read(p, encoding: none).slice(0, 4))
  b.slice(0, 2) == (0xFF, 0xD8) or b == (0x89, 0x50, 0x4E, 0x47) or b == (0x47, 0x49, 0x46, 0x38) or b == (0x52, 0x49, 0x46, 0x46)
}

// One panel. The letter sits in the letter zone at the panel's top-left.
// `source` is Typst content, or a file given as `path("…")` so it resolves
// from the calling file. A vector file (SVG, PDF) is placed at its own size
// and keeps the zone free through its margins; a raster (PNG, JPG, GIF, WebP)
// fills the panel's width below the zone. `below-zone` overrides the choice.
// The letter style follows the page's journal unless `journal:` is given.
#let fig-panel(n, source, journal: none, width: 100%, below-zone: auto, alt: none) = context {
  let j = if journal != none { journal } else { _journal.get() }
  if type(source) == str {
    panic("give the file as path(\"" + source + "\"), so it resolves from your file, not fig.typ")
  }
  block(width: width, breakable: false, {
    if type(source) == path {
      let raster = _is-raster(source)
      let below = if below-zone == auto { raster } else { below-zone }
      let img = if raster { image(source, width: 100%, alt: alt) } else { image(source, alt: alt) }
      if below { pad(top: letter-zone, img) } else { img }
    } else if below-zone == true { pad(top: letter-zone, source) } else { source }
    if n != none {
      place(top + left, box(width: letter-zone, height: letter-zone, align(left + top, fig-letter(n, journal: j))))
    }
  })
}
