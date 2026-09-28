# academic-design-system: notes for agents

This repo is the shared design system for Feiyang Huang's projects. It is usually
checked out as a git submodule at `design-system/` inside another project
(the reference consumer is `fyng/fyng.github.io`). Read `README.md` first.

- **Core and formats.** `core/` holds what every format shares: principles and voice
  (`core/README.md`), `color.md`, `typography.md`, `charts.md`, `icons.md`,
  `illustration.md`, and the tokens. `formats/web/` (websites, Sass),
  `formats/publication/` (journal figures) and `formats/abstract/` (graphical
  abstracts, the HTML kit in `kit/`) add only what their medium needs. Read the core
  element and the format README before designing anything.
- **Positive templates.** Describe what to do and show it (a specimen, a form spec).
  Write a constraint only when it is necessary.
- **Generated files.** `core/tokens.css` and `core/tokens.json` come from
  `core/tokens.mjs`; edit the `.mjs` and run `node core/tokens.mjs`.
- **What belongs here.** Tokens, rules, framework adapters, the kit and the renderer.
  Project content (figure sources, page layouts, publish scripts) stays in the
  consuming project, and explorations stay out of the repo.
- **Code only where it is the system.** The token generator, the Sass, the kit and the
  renderer ship here. Specimens are HTML pages drawn with the kit, and every image in
  an `out/` folder is rendered from one, so no image outlives its source. A second
  plotting stack (e.g. a matplotlib adapter) joins only as a maintained format
  adapter, with its own specimen.
- **Contributing from a consumer.** Branch inside the submodule, commit and push
  here, open a PR against `main`, then bump the submodule pointer in the consumer.
  Never edit a copy of these files inside a consumer.
- **Shared by several projects.** Prefer additive changes. When changing an existing
  token value, path or kit API, call it out in the PR description.
- **Docs and code together.** A change to tokens, Sass or the kit updates the doc
  that describes it in the same commit.
