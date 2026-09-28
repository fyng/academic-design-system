# Web: Instrument / Prussian

The format for personal and project websites, the pages people read in a browser.
Its reference consumer is **fyng.github.io** (al-folio / Jekyll). It builds on
`../../core/` and adds a serif display face, light and dark themes, and page chrome.

The source of truth is the Sass in `scss/instrument-prussian/`:

| File | Holds |
|---|---|
| `_tokens.scss` | Font stacks, the `$light` and `$dark` palettes, and a `custom-properties` mixin. Framework-agnostic. |
| `_al-folio.scss` | The al-folio adapter: maps the palettes onto `--global-*` variables and restyles al-folio markup. |
| `_index.scss` | `@use "instrument-prussian"` forwards the tokens. |

`out/specimen-website.png` shows them in both themes. For another framework, add a
sibling adapter (`_<framework>.scss`) that uses the tokens the same way; page-specific
layout stays in the consuming project.

## Using it

A Jekyll / al-folio site adds the Sass folder to the load path and uses the adapter:

```yaml
# _config.yml
sass:
  load_paths:
    - _sass
    - design-system/formats/web/scss
exclude:
  - design-system/
```

```scss
// a partial loaded last from assets/css/main.scss
@use "instrument-prussian/al-folio";
// ...then the project's own page-specific layout
```

Any other Sass project can `@use "instrument-prussian" as ip;` for the font stacks
(`ip.$font-display`, `ip.$font-body`, `ip.$font-mono`) and palettes (`ip.$light`,
`ip.$dark`); `@include ip.custom-properties(ip.$light, "ip-")` emits them as
`--ip-bg`, `--ip-text`, `--ip-theme` and so on.

## How the web adds to the core

| | Figures (core) | Web |
|---|---|---|
| Read as | Dense figures, glanced at, often scaled down | Long-form pages, scrolled, at arm's length |
| Voice | Scientific, instrument-like | Editorial, personal |
| Type | One sans family (IBM Plex Sans), mono for codes | Serif display + sans body + mono labels |
| Themes | Light (paper) | Light and dark |
| Colour | Semantic palettes (harm, benefit, identity, scales) | Two inks: prussian links, vermilion hover |

The serif makes the site feel like a publication; in a figure, one family keeps the
labels and numbers quiet. The shared ground lets a figure sit naturally on a page:
white paper with the same ink (`#16181d`) and Prussian blue (`#1f4e79`), a vermilion
accent, IBM Plex Sans for reading, and hairline rules in place of boxes and shadows.

## Typography

| Role | Face | Setting | Where |
|---|---|---|---|
| Display | **Instrument Serif** 400 | −1 % tracking; italic for the given name | Name on home page (3.4 rem; 2.6 rem in the sidebar), page and post titles, h1/h3/h4 |
| Body | **IBM Plex Sans** 300 | `strong` is 500 | Paragraphs, lists, publication entries |
| Section label | **IBM Plex Mono** 500 | 0.78 rem, caps, +16 % tracking, muted, hairline above | `h2` |
| Metadata | **IBM Plex Mono** 400 | muted | Nav links, news dates, years, `time`, code, CV badges |
| Publication title | IBM Plex Sans 500 | – | `.publications .title` |

Rules:
- The serif is for names and titles; body text, labels and numbers are Plex.
- Body weight is 300, which reads as light on a white page at 16–18 px. Emphasis is 500.
- Section labels are small mono caps with a hairline above. They are wayfinding, not headlines.

Load the fonts from Google Fonts:
`https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap`
(in al-folio, via `third_party_libraries.google_fonts` in `_config.yml`).

## Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `--global-bg-color` | `#ffffff` | `#111317` | Page |
| `--global-card-bg-color` | `#ffffff` | `#16191e` | Cards (CV) |
| `--global-text-color` | `#16181d` | `#e6e6e3` | Text |
| `--global-text-color-light` | `#707480` | `#8b8f98` | Metadata, section labels, dates |
| `--global-theme-color` | `#1f4e79` Prussian | `#86acd6` | Links, accents |
| `--global-hover-color` | `#c2412d` vermilion | `#ef7a5f` | Hover, active |
| `--global-divider-color` | `#e8e8ea` | `#262a31` | Hairlines |
| `--global-code-bg-color` | `#f4f5f7` | `#1b1f25` | Code, washes |
| `--global-footer-text-color` | `#8a8e98` | `#7b808a` | Footer |

- Two inks: Prussian means "you can go here" and vermilion means "you are
  pointing at it". They are the whole UI palette.
- Dark mode is its own palette, lifted for the dark ground, not an inversion.

## Chrome

- **Hairlines, not boxes:** 1 px divider colour under the navbar, above the footer,
  above each `h2`, and around CV cards.
- **Flat surfaces:** the navbar, profile image and cards sit flat on the page.
- **Corners:** 2 px radius on images and cards. Nearly square, but not sharp.
- **Links:** no underline; the colour changes over 0.15 s.
- **Layout:** a profile page uses a 260 px sticky sidebar with the main column on
  landscape laptops (≥ 992 px); narrower screens get a compact profile row. The
  layout CSS lives with the page that uses it (fyng.github.io: `_sass/_fyng.scss`).

## Embedding figures

- Show the poster PNG, or the MP4 as `autoplay muted loop playsinline` with the PNG
  as `poster`, at full column width.
- In dark mode, figures keep their white paper. Wrap them in a card with 2 px radius
  and a 1 px divider border, so they read as printed plates.
- The figure's `<desc>` is the image's alt text.
