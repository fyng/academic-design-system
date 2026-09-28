// Assembles journal figures from panels drawn at final size in the project's
// own tool. Sizes and panel letters follow formats/publication/README.md;
// colours come from core/tokens.json. Compile with
// `typst compile --font-path <design-system>/core/fonts fig1.typ`.

#let tokens = json("../../core/tokens.json")
#let ink = rgb(tokens.neutral.ink)
#let ink-2 = rgb(tokens.neutral.at("ink-2"))
#let muted = rgb(tokens.neutral.muted)

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
// labels are ink; axis titles are ink-2; ticks and notes are muted.
#let head(body) = context text(font: _font-500(text.font), size: 7pt, weight: 500, fill: ink, body)
#let axis(body) = context text(font: _font-500(text.font), size: 7pt, weight: 500, fill: ink-2, body)
#let label(body) = text(size: 7pt, fill: ink, body)
#let tick(body) = text(size: 6pt, fill: muted, body)
#let cap(body) = text(size: 6pt, fill: muted, body)
#let note(body) = text(size: 6pt, fill: muted, body)

// Panel letter in the journal's style, bold, ink. The journal comes from the
// page unless given here.
#let fig-letter(n, journal: none) = context {
  let j = if journal != none { journal } else { _journal.get() }
  let l = letters.at(j, default: letters.nature)
  let s = if l.lower { lower(n) } else { upper(n) }
  text(size: l.size, weight: 700, fill: ink, s)
}

// The panel grid: one gutter throughout (4–6 mm, 5 mm default). Rows size to
// their content, so panels in a row share one height when they are drawn to
// the same height (the panel contract). `rows` takes an int — expanded to
// `1fr`, to stretch rows over a fixed page height — or a list of tracks;
// children may be `grid.cell(colspan: ..)` for wide panels.
#let fig-grid(gutter: 5mm, columns: 2, rows: none, ..children) = {
  if gutter < 4mm or gutter > 6mm { panic("gutter must be 4–6 mm, got " + str(gutter)) }
  let cols = if type(columns) == int { (1fr,) * columns } else { columns }
  if rows == none {
    grid(columns: cols, column-gutter: gutter, row-gutter: gutter, ..children)
  } else {
    let rws = if type(rows) == int { (1fr,) * rows } else { rows }
    grid(columns: cols, rows: rws, column-gutter: gutter, row-gutter: gutter, ..children)
  }
}

// One panel: the letter sits on the panel's top edge, outside the plot, then
// the panel at scale 1 by width only (the height follows the aspect ratio, so
// nothing is cropped). `source` is a file path (SVG, PDF, PNG, JPG) or Typst
// content for a panel drawn here; `width` sizes the panel inside its cell.
// The letter style follows the page's journal unless `journal:` is given.
#let fig-panel(n, source, journal: none, width: 100%, alt: none) = context {
  let j = if journal != none { journal } else { _journal.get() }
  let l = letters.at(j, default: letters.nature)
  let band = l.size * 1.5
  block(width: width, breakable: false, {
    if n != none {
      // place(bottom) sets the letter's baseline on the band's bottom edge,
      // which is the panel's top edge.
      box(width: 100%, height: band)[#place(bottom + left, fig-letter(n, journal: j))]
    }
    if type(source) == str { image(source, width: 100%, fit: "contain", alt: alt) } else { source }
  })
}
