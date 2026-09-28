# Instrument / Prussian: the website system

This is the design system for personal and project websites, the pages people read in a
browser. Its reference consumer is **fyng.github.io** (al-folio / Jekyll).
It is separate from **Lamina** (`../artifacts/`), which governs the figures we make:
graphical abstracts, charts and schematics.

The source of truth is the Sass in `scss/instrument-prussian/`:

| File | Holds |
|---|---|
| `_tokens.scss` | Font stacks, the `$light` and `$dark` palettes, and a `custom-properties` mixin. Framework-agnostic. |
| `_al-folio.scss` | The al-folio adapter: maps the palettes onto `--global-*` variables and restyles al-folio markup. |
| `_index.scss` | `@use "instrument-prussian"` forwards the tokens. |

This file documents them, and `out/specimen-website.png` shows them in both themes.
For another framework, add a sibling adapter (`_<framework>.scss`) that uses the tokens
the same way; keep page-specific layout in the consuming project.

## Why two systems

| | Website (Instrument / Prussian) | Artifacts (Lamina) |
|---|---|---|
| Read as | Long-form pages, scrolled, at arm's length | Dense figures, glanced at, often scaled down |
| Voice | Editorial, personal | Scientific, instrument-like |
| Type | Serif display + sans body + mono labels | One sans family (IBM Plex Sans), mono only for codes |
| Themes | Light and dark | Always light (paper) |
| Colour | Two inks: prussian links, vermilion hover | Full semantic palettes (harm, benefit, identity, scales) |

The serif makes the site feel like a publication. In a figure, a second typeface
competes with the data and reads inconsistently next to chart labels, so artifacts
use one family.

**Shared DNA** lets a figure sit naturally on a page:
- white paper with the same ink (`#16181d`) and Prussian blue (`#1f4e79`);
- a vermilion accent;
- IBM Plex Sans for reading text, and IBM Plex Mono for small metadata;
- hairline rules instead of boxes and shadows.

## Typography

| Role | Face | Setting | Where |
|---|---|---|---|
| Display | **Instrument Serif** 400 | −1 % tracking; italic for the given name | Name on home page (3.4 rem; 2.6 rem in the sidebar), page and post titles, h1/h3/h4 |
| Body | **IBM Plex Sans** 300 | `strong` is 500 | Paragraphs, lists, publication entries |
| Section label | **IBM Plex Mono** 500 | 0.78 rem, caps, +16 % tracking, muted, hairline above | `h2` |
| Metadata | **IBM Plex Mono** 400 | muted | Nav links, news dates, years, `time`, code, CV badges |
| Publication title | IBM Plex Sans 500 | – | `.publications .title` |

Rules:
- The serif is for names and titles only. It is never used for body text, labels or numbers.
- Body weight is 300, which reads as light on a white page at 16–18 px. Emphasis is 500, never 700.
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

- Two inks only: Prussian means "you can go here" and vermilion means "you are
  pointing at it". There are no other UI colours.
- Dark mode is its own palette, lifted for the dark ground, not an inversion.

## Chrome

- **Hairlines, not boxes:** 1 px divider colour under the navbar, above the footer,
  above each `h2`, and around CV cards.
- **No shadows**, anywhere (navbar, profile image, cards).
- **Corners:** 2 px radius on images and cards. Nearly square, but not sharp.
- **Links:** no underline; the colour changes over 0.15 s.
- **Layout:** a profile page uses a 260 px sticky sidebar with the main column on
  landscape laptops (≥ 992 px); narrower screens get a compact profile row. The
  layout CSS lives with the page that uses it (fyng.github.io: `_sass/_fyng.scss`).

## Embedding Lamina figures

- Show the poster PNG, or the MP4 as `autoplay muted loop playsinline` with the PNG
  as `poster`, at full column width.
- In dark mode, figures keep their white paper. Wrap them in a card with 2 px radius
  and a 1 px divider border, so they read as printed plates.
- The figure's `<desc>` is the image's alt text.
