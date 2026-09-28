# Typography

**One family: IBM Plex.** Every role on the canvas is set in **IBM Plex Sans**.
**IBM Plex Mono** appears only for literal codes (allele names, sample IDs), where a
fixed-width face signals "copy this exactly". No serif is used in figures.

The website uses a serif display face; see `../website/DESIGN.md`. Figures do not.
Next to chart labels and numbers, a second typeface reads as two voices. One sans
family keeps a figure quiet and lets the data carry the contrast.

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

Sizes are px on the 1600 × 900 canvas (`GA.ROLE` in `kit/ga-kit.js`), shown as
size/line height. Hierarchy comes from **size, weight (400/500), case and colour**,
never from a second face.

| Role | Setting | Size | Colour | Use |
|---|---|---|---|---|
| `kicker` | 500, caps, +12 % tracking | 13/17 | muted | `PROJECT · VENUE YEAR` above the title |
| `title` | 500, −1.5 % tracking | 38/44 | ink | What the work is, as a statement or question. ≤ 2 lines, break by hand at a phrase boundary |
| `head` | 500, −1 % tracking | 28/34 | ink | Panel header: number in prussian, then the panel title (`01  Pan-cancer drug screen atlas`); ≤ 2 lines. See `DESIGN.md`, *Writing* |
| `body` | 400 | 17/24 | ink | Panel conclusions (the findings) |
| `label` | 400 | 17/24 | ink-2 | Names on the diagram |
| `cap` | 400 | 15/20 | muted | Scale, n, "schematic", secondary notes |
| `tag` | **Mono** 500, +4 % tracking | 13/17 | ink-2 | Literal codes only: HLA-DRB1\*15, PT A |
| `axis` | 500 | 14/18 | ink-2 | Chart axis titles |
| `tick` | 400, tabular figures | 13/16 | muted | Tick labels, keys, legends |
| `take` | 400, plain | 28/36 | ink | The single take-home sentence |
| `note` | 400 | 14/18 | muted | Callouts that explain a mark |
| `math` | 400; Latin italic, Greek upright | 17/22 | ink | Variables and indices: θ, *z*<sub>*d,m*</sub>, *k* = 1. Latin letters italic; Greek upright, because Plex's italic θ reads as ϑ; subscripts at 70 % |

Rules:

- **13 px is the floor.** Nothing smaller.
- **Weights:** 400 for reading, 500 for structure (title, head, kicker, axis)
  and for the accent phrase. There is no 600 or 700; a heavy weight shouts.
- **Tracking:** tighten large text (title, head, take) slightly. Track caps out
  (+12 %). Leave body text at 0.
- **Emphasis** is italic (`*…*` in kit markup). The accent colour (`{…}`) marks the
  one phrase that carries the finding, at most once per panel, and only when that
  phrase *is* the key point. The take-home is plain.
- **Case:** sentence case. Caps only in `kicker`, which is tracked.
- **Line length:** body ≤ 437 px (one column). The title may span the full 1472 px.
- **Text colour is always a text token** (`ink`, `ink-2`, `muted`, or a `*-text` step
  from `color.md`), never a 500-step mark colour.

## Numbers and units

- **Figures:** tabular in ticks and tables (`tick` does this); proportional elsewhere.
- **Minus:** true minus `−` (U+2212), not a hyphen. The chart layer converts
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
