# academic-design-system: notes for agents

This repo is the shared design system for Feiyang Huang's projects. It is usually
checked out as a git submodule at `design-system/` inside another project
(the reference consumer is `fyng/fyng.github.io`). Read `README.md` first.

- **Two systems.** Websites follow Instrument / Prussian (`website/DESIGN.md`,
  Sass in `website/scss/instrument-prussian/`). Figures, charts and graphical
  abstracts follow Lamina (`artifacts/DESIGN.md` and its `typography.md`,
  `color.md`, `charts.md`; implemented by `kit/`). Read the relevant DESIGN.md
  before designing anything in either.
- **Generated files.** `artifacts/tokens.css` and `artifacts/tokens.json` come from
  `artifacts/tokens.mjs`; edit the `.mjs` and run `node artifacts/tokens.mjs`.
- **What belongs here.** Tokens, rules, framework adapters, the kit and the renderer.
  Project content (figure sources, page layouts, publish scripts) stays in the
  consuming project.
- **Contributing from a consumer.** Branch inside the submodule, commit and push
  here, open a PR against `main`, then bump the submodule pointer in the consumer.
  Never edit a copy of these files inside a consumer.
- **Shared by several projects.** Prefer additive changes. When changing an existing
  token value or kit API, call it out in the PR description.
- **Docs and code together.** A change to tokens, Sass or the kit updates the doc
  that describes it in the same commit.
