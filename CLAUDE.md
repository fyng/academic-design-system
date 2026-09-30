# kare: notes for agents

This repo is the shared design system for Feiyang Huang's projects. It is usually
checked out as a git submodule at `design-system/` inside another project
(the reference consumer is `fyng/fyng.github.io`). Read `README.md` first.

## Where to look

`INDEX.md` lists every doc, chart form, specimen and kit file. It is generated, so
it is always current; start there when you do not know where something lives.

| Question | File |
|---|---|
| Principles, voice, how to write figure text | `core/README.md` |
| Which colour for a mark; token names and values | `core/color.md`; values in `core/tokens.mjs` |
| Type roles, numbers, units | `core/typography.md` |
| Which chart form fits the data | `core/charts/README.md`, *Choosing the form* |
| Axes, marks, labels, glyphs shared by every chart | `core/charts/README.md`, *Grammar* |
| Everything about one chart form | `core/charts/forms/NN-name.md` (`grep -l "id: form-22" core/charts/forms/*`) |
| Chart forms of one kind | `grep -l "family: anatomy" core/charts/forms/*` |
| Cells, tissue, body maps, arrows, method boxes | `core/illustration.md` |
| Icons | `core/icons.md`; code in `kit/icons.js` |
| Drawing a figure in HTML; the kit API and renderer | `kit/README.md` |
| A website | `formats/web/README.md` |
| A journal figure: sizes, panel contract, Typst assembly | `formats/publication/README.md` |
| A graphical abstract: canvas, arc, motion | `formats/abstract/README.md` |
| Who a form or artwork is credited to | `ACKNOWLEDGEMENTS.md` |

## Rules

- **Core and formats.** `core/` holds what every format shares: principles and voice
  (`core/README.md`), `color.md`, `typography.md`, `charts/`, `icons.md`,
  `illustration.md`, and the tokens. `kit/` is the HTML implementation of the core
  grammar that the specimens and graphical abstracts are drawn with. `formats/web/`
  (websites, Sass), `formats/publication/` (journal figures) and `formats/abstract/`
  (graphical abstracts) add only what their medium needs. Read the core element and
  the format README before designing anything.
- **Chart forms.** One file per form in `core/charts/forms/`, named `NN-name.md`
  with a 1–3 word name. Its front matter (`id`, `name`, `family`, `specimens`, `kit`,
  `sources`, `see_also`) is what `tools/index.mjs` reads. A form's print sizes and
  kit calls live in its file, under *In each format*. Numbers are permanent: a new
  form takes the next number, and a retired one is never reused.
- **Positive templates.** Describe what to do and show it (a specimen, a form spec).
  Write a constraint only when it is necessary.
- **Generated files.** `core/tokens.css` and `core/tokens.json` come from
  `core/tokens.mjs`; edit the `.mjs` and run `node core/tokens.mjs`. `INDEX.md` comes
  from `tools/index.mjs`; run `npm run check` after adding, moving or renaming a
  file, and fix what it reports.
- **What belongs here.** Tokens, rules, framework adapters, the kit, the renderer,
  the index tool and the vendored fonts (`core/fonts/`).
  Project content (figure sources, page layouts, publish scripts) stays in the
  consuming project, and explorations stay out of the repo.
- **Code only where it is the system.** The token generator, the Sass, the kit, the
  renderer and the index tool ship here. Specimens are HTML pages drawn with the kit,
  or Typst sources in `formats/publication/` (compiled to `out/`), and every image
  in an `out/` folder is rendered from one, so no image outlives its source. A chart
  specimen is named by the forms it draws (`specimen-forms-22-24.html`). A second
  plotting stack (e.g. a matplotlib adapter) joins only as a maintained format
  adapter, with its own specimen.
- **Contributing from a consumer.** Branch inside the submodule, commit and push
  here, open a PR against `main`, then bump the submodule pointer in the consumer.
  Never edit a copy of these files inside a consumer.
- **Shared by several projects.** Prefer additive changes. When changing an existing
  token value, path or kit API, call it out in the PR description.
- **Docs and code together.** A change to tokens, Sass or the kit updates the doc
  that describes it in the same commit.
