# Core

What every format shares: the principles, the voice, and five elements. The formats
(`../formats/`) build on this and add only what their medium needs.

| Element | File | Covers |
|---|---|---|
| Colour | [`color.md`](color.md) | Palettes grouped by meaning, and how they were validated |
| Typography | [`typography.md`](typography.md) | One family (IBM Plex), type roles, numbers and units |
| Charts | [`charts/`](charts/README.md) | Choosing a form, the chart grammar and glyphs; one file per form in `charts/forms/` (26 forms) |
| Icons | [`icons.md`](icons.md) | Health Icons, custom glyphs, when an icon takes colour |
| Illustration | [`illustration.md`](illustration.md) | Cells, tissue, body maps, model systems, zooms, arrows and method boxes |
| Tokens | `tokens.mjs` → `tokens.css`, `tokens.json` | Every colour and font value. Edit the `.mjs`, run `node core/tokens.mjs` |
| Specimens | `specimen-color.html`, `specimen-scales.html`, `specimen-forms-<numbers>.html` → `out/*.png` | Reference sheets for colour, scales and the chart forms, drawn with the kit (`../kit/`). Each chart specimen is named by the forms it draws. The journal figure specimens are Typst, in `../formats/publication/` |

| Format | For | Adds |
|---|---|---|
| [Web](../formats/web/README.md) | Personal and project websites | A serif display face, light and dark themes, page chrome |
| [Publication](../formats/publication/README.md) | Journal figures | Sizes in mm and pt, panel letters, export |
| [Abstract](../formats/abstract/README.md) | Graphical abstracts, animated or still | The 1600 × 900 canvas, the three-panel arc, motion |

## What we make

A **scientific statement**, drawn or set. A page, a figure or an abstract reads like
the paper, not an advertisement. It says what the work is, shows the evidence, and
states the finding with the paper's hedges intact.

## Principles

1. **Ink is for data and argument.** Flat marks on white paper. A wash fill groups
   things.
2. **Show the data.** Plot the observations themselves where they fit, with the
   summary on top. Choose the form by the data's job (`charts/README.md`).
3. **Colour means something, or it is grey.** Every coloured mark has a role from
   `color.md`: valence, emphasis, identity, magnitude or direction. Everything else
   uses ink or context grey. One accent per figure.
4. **Label things directly.** Put words next to the marks they name. Add a legend when
   direct labels would collide.
5. **One voice.** Reading text is IBM Plex Sans in every format. Hierarchy comes from
   size, weight (400/500), case and colour.
6. **Quiet structure.** White space and alignment separate things; hairlines are
   for axes, grids and rules.
7. **Fewer words.** Draw the object instead of naming it, and label only what the
   drawing cannot say.
8. **Accessible by construction.** Palettes are validated for colour-vision
   deficiency, text meets contrast minimums, and colour always has a second cue
   (a label, a position or a shape).
9. **Checked, not eyeballed.** Tools check what they can (the kit's lint,
   the token validation). Look at the data before choosing the form: its n, its
   modes, its range per group, its outliers.

## Voice

| Write | Instead of |
|---|---|
| "Can we predict individual adverse event risk…?" | "Revolutionising cancer safety" |
| "predicts", "is associated with", "in 35,669 patients" | "unlocks", "powerful", "first-ever" |
| Sentence case everywhere except the kicker | Title Case Headlines |
| Numbers with units and denominators | Bare percentages without an n |
| The paper's own terms, defined once (ICI, AUROC) | New jargon invented for the figure |

## Writing

- **Name the science.** A title a reader could search for ("LLM diagnosis
  extraction") beats a project name ("MSK-Tox"). Brand names belong in the kicker.
- **Be specific about the method.** Say which kind of model ("Bayesian", "topic
  model", "machine learning") and what it acts on ("drug response").
- **A finding is a claim** with a subject and an active verb ("Immortalization biases
  cell line vulnerability"). The paper's hedge stays in the sentence that states it.
- **One term per thing.** Once a figure calls it a "spot", it is a spot everywhere.
- **Abbreviations** only where the field uses them unexpanded (ST, LLM, ICI, irAE).
- **Hyphenate compound modifiers** before a noun ("cell-type proportions").
- **Numbers** come from the paper, with denominators ("35,669 patients").
- **Each piece of text has one job.** A label names a mark; a caption states the
  point with its number. No label restates a title or a conclusion.

Each format names its own kinds of text: the abstract's title, panel titles,
conclusions and take-home (`../formats/abstract/README.md`), or a journal figure's
panel letters and legend (`../formats/publication/README.md`).

## Figures are light

Figures are drawn on white paper in every format. On a dark web page they sit on their
own paper card (`../formats/web/README.md`, *Embedding figures*).
