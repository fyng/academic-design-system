# Icons

Icons name things a reader already knows: a patient, an organ, a model, a drug. Their
code lives in the abstract kit (`../formats/abstract/kit/icons.js`), where
`ga.icon(name, …)` places them; other formats use the same glyphs as SVG.

- Use Health Icons (MIT) from `@iconify-json/healthicons`, on a 48-unit grid, as
  solid silhouettes in a single colour. Draw custom icons (`adrenal`, `note`, `tree`,
  `molecule`: a drug as a skeletal structure) in the same style and add them to the
  kit's `icons.js`.
- Colour an icon only when it is an entity with a registered colour (organs). Otherwise
  use ink or prussian.
- Icon size can encode a quantity (grade, for example) only if a caption says so.
- In a method box, name the method by what readers know: `llm` (a speech bubble with
  text) for language models, `network` for trained models. Keep icons brand-agnostic:
  a model is a network, not a vendor's sparkle or swirl.
