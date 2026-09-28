# Typography

**One family: IBM Plex.** Every role in a figure is set in **IBM Plex Sans**.
**IBM Plex Mono** is for literal codes (allele names, sample IDs), where a
fixed-width face signals "copy this exactly".

Next to chart labels and numbers, a second typeface reads as two voices, so figures
keep to one sans family and let the data carry the contrast. The web format adds a
serif display face for names and page titles (`../formats/web/README.md`).

## Why IBM Plex Sans

| Need | How Plex meets it |
|---|---|
| **Reads small** | Large x-height and open counters. Holds up at 13 px on the canvas (about 6.5 px when a figure is shown 800 px wide) |
| **Unambiguous glyphs** | `I l 1` and `0 O` are all distinct. That matters for gene and allele names (IL1B, HLA-DRB1\*15) and for sample IDs |
| **Quiet competence** | A neutral grotesque with engineered details. It reads as an instrument, not a brand |
| **Numbers** | Tabular and proportional figures, a true minus, and superscripts |
| **Continuity** | Already the website's body face, so figures and pages share a voice |
| **Open** | SIL Open Font License, free on Google Fonts |

Candidates compared before choosing: Instrument Sans (calm, but `I`/`l` identical),
Source Sans 3 (very readable, but more humanist and warmer than the site), and Geist
(crisp, but reads as a software brand).

Load the fonts with:

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;1,400;1,500&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
```

For offline renders, install the same files to `~/.fonts`.
The CSS tokens are `--font-text` and `--font-mono`.

## Roles

Every format uses the same roles. Hierarchy comes from **size, weight (400/500), case
and colour**. Sizes depend on the medium, so each format sets them:
`../formats/abstract/README.md` in canvas px, `../formats/publication/README.md` in pt.

| Role | Setting | Colour | Use |
|---|---|---|---|
| `kicker` | 500, caps, +12 % tracking | muted | `PROJECT · VENUE YEAR` above the title |
| `title` | 500, −1.5 % tracking | ink | What the work is, as a statement or question. ≤ 2 lines, broken by hand at a phrase boundary |
| `head` | 500, −1 % tracking | ink | Panel header: number in prussian, then the panel title (`01  Pan-cancer drug screen atlas`) |
| `body` | 400 | ink | Findings and running text |
| `label` | 400 | ink-2 | Names on the diagram |
| `cap` | 400 | muted | Scale, n, "schematic", secondary notes |
| `tag` | **Mono** 500, +4 % tracking | ink-2 | Literal codes: HLA-DRB1\*15, PT A |
| `axis` | 500 | ink-2 | Chart axis titles |
| `tick` | 400, tabular figures | muted | Tick labels, keys, legends |
| `take` | 400, plain | ink | The single take-home sentence |
| `note` | 400 | muted | Callouts that explain a mark |
| `math` | 400; Latin italic, Greek upright | ink | Variables and indices: θ, *z*<sub>*d,m*</sub>, *k* = 1. Greek stays upright because Plex's italic θ reads as ϑ; subscripts at 70 % |

- **Weights:** 400 for reading, 500 for structure (title, head, kicker, axis) and for
  the accent phrase. Two weights keep the hierarchy calm.
- **Tracking:** tighten large text (title, head, take) slightly. Track caps out
  (+12 %). Leave body text at 0.
- **Emphasis** is italic. The accent colour marks the one phrase that carries the
  finding, at most once per panel, and only when that phrase *is* the key point.
  The take-home is plain.
- **Case:** sentence case. Caps in `kicker`, which is tracked.
- **Text colour is a text token** (`ink`, `ink-2`, `muted`, or a `*-text` step from
  `color.md`); the 500 steps are for marks.

## Numbers and units

- **Figures:** tabular in ticks and tables (`tick` does this); proportional elsewhere.
- **Minus:** true minus `−` (U+2212). The abstract kit's chart layer converts
  negative tick labels automatically.
- **Thousands:** use a comma (35,669). Use no separator for years and IDs.
- **Decimals:** drop the leading zero only for bounded metrics (AUROC .81).
  Keep it elsewhere (0.42 µM).
- **P values:** *P* italic capital, `P = 3 × 10⁻⁸`. Use superscript digits, not `e-8`.
- **Units:** after a space, in the axis title (`Drug (µM)`, `Months on ICI`).
  Use `µ`, not `u`.
- **Ranges:** an en dash (`2014–2023`).
- **Counts carry denominators:** "35,669 patients", "7,734 images from 657 lesions".
- **Gene and allele names** follow nomenclature. Human genes are italic
  (*HLA-DRB1*). Specific alleles take the `tag` role (HLA-DRB1\*15).
