# Colour

**Colour does one job at a time.** Before picking a colour, name the job. The palette
for that job follows from the tables below. If a mark has no job, it is ink or
context grey.

Reference sheet: `out/specimen-color.png`. The values live in `tokens.mjs`; use the
CSS variables (`var(--harm)`) or `tokens.json` in a figure, so a change to a token
reaches every figure.

## Foundations

### Neutrals

| Token | Hex | Contrast on paper | Use |
|---|---|---|---|
| `paper` | `#ffffff` | – | Background. Figures are always light |
| `ink` | `#16181d` | 17.9:1 | Titles, body, primary marks |
| `ink-2` | `#4a4e58` | 8.3:1 | Labels, axes |
| `muted` | `#6b707b` | 5.0:1 | Captions, ticks. **The lightest text colour** |
| `context` | `#a3a8b1` | 2.4:1 | De-emphasised *data* (comparator series, non-hits). Marks only; text uses `muted` |
| `rule` | `#d9dbe0` | – | Hairlines, dividers, gridlines |
| `wash` | `#f4f5f7` | – | Grouping fills; the diverging midpoint |
| `prussian` | `#1f4e79` | 8.7:1 | Structural ink: panel numbers, arrows, method boxes, models |

### Hue ramps

There are eight families (blue, vermilion, teal, ochre, violet, moss, rose, slate),
each with steps 100–900. They are generated in OKLCH at fixed lightness, so
**a step number means the same lightness in every hue**. That lets any hue swap
into a role without re-checking contrast:

| Step | Use |
|---|---|
| 100 | Washes: background of a highlighted box or pill |
| 200–300 | Light end of scales |
| **500** | **Marks**: bars, lines, dots, icons (≥ 3:1 on paper) |
| **600** | **Text in a hue**: direct labels, accent words (≥ 5:1 on paper) |
| 700–900 | Dark end of scales; 700 is the text step for blue-family benefit |

## Palettes by theme

### 1. Valence: when one outcome is better

For data that carry a judgement: toxicity against response, risk against protection,
resistance against sensitivity.

| Role | Mark | Text | Wash | Means |
|---|---|---|---|---|
| **Harm** `--harm` | vermilion 500 | vermilion 600 | vermilion 100 | adverse events, risk, toxicity, resistance, worse survival |
| **Benefit** `--benefit` | blue 600 | blue 700 | blue 100 | response, sensitivity, protection, better survival |

- **Why blue, not green, for benefit:** red and green are the pair most confused
  under deuteranopia. Blue against vermilion stays opposite for every reader.
- A figure about safety makes *harm* the focus; a figure about efficacy makes
  *benefit* the focus. The other side (or a null result) is context grey.
- For things that are merely "up" or "down", use *Direction*.

### 2. Emphasis: the one thing to look at

| Role | Value | Rule |
|---|---|---|
| **Accent** `--accent` | vermilion 500 (text 600) | One accent per figure: the finding's key phrase and its mark |
| **Context** `--context` | grey `#a3a8b1` | Everything the accent is compared against |

- **The accent takes the valence of the finding.** In a harm story it is vermilion,
  which is the default. In a benefit story, redefine it for that figure:
  `--accent: var(--benefit)`, `--accent-text: var(--benefit-text)`. Otherwise one
  vermilion finding would read as harm.
- **Focus + context beats a rainbow.** When the story is one series against the
  rest, colour one and grey the rest instead of assigning categorical hues.

### 3. Identity: which thing is which

For categories with no order or judgement, such as tissues, cell types, cohorts or
model systems.

| Slot | Hue | Mark | Text step |
|---|---|---|---|
| 1 | blue | `#2268ba` | `#2268ba` |
| 2 | ochre | `#b07b06` | `#8b6001` |
| 3 | teal | `#099a94` | `#047974` |
| 4 | vermilion | `#d85737` | `#b43818` |
| 5 | violet | `#9b6bce` | `#7d4eab` |
| 6 | moss | `#629742` | `#477825` |
| 7 | rose | `#c95a8b` | `#a63d6d` |

- **Assign in order.** Series *n* gets slot *n*. An 8th category folds
  into "other" (context grey), or the chart becomes small multiples.
- **One job per panel.** A chart that uses harm and benefit keeps to them; a chart
  that uses categorical slots keeps to those.
- **Colour follows the entity, not its rank.** Survivors of a filter or a re-sort
  keep their colours.
- **When an axis already names the groups**, draw their marks in `ink-2` and let
  colour carry a factor the axis doesn't (treated against control across panels,
  for example).
- **Up to three categories can touch anywhere** (scatter, maps, spatial plots):
  slots 1–3 are distinct in every pairing. With more, add direct labels or shapes,
  or facet.

### 4. Entities: colour that persists across figures

Some things appear in many figures and keep one colour everywhere. They are
registered in `tokens.mjs` (`entity`) and exposed as `--organ-lungs` and so on.

| Organ | Colour | Organ | Colour |
|---|---|---|---|
| lungs | blue 600 | thyroid | violet 500 |
| liver | ochre 500 | kidney | moss 500 |
| colon | teal 500 | skin | rose 500 |
| adrenal | vermilion 500 | | |

Register new recurring entities (lesion classes, model systems, cell types) before
their first use, and draw them from the categorical hues. A registered colour beats
slot order. If two registered entities that are close in hue sit side by side,
label them directly.

#### Cell types: a family palette

Cell types in one figure are members of one kind, so they share one hue band,
blue through violet to magenta, instead of taking categorical slots. They read as
related and distinct at once.

| Token | Mark | Tint (`-wash`) | OKLCH |
|---|---|---|---|
| `--cell-1` | `#3e45a2` indigo | `#a8b1da` | 0.44 0.148 275 |
| `--cell-2` | `#5c87ec` cornflower | `#b8ccf7` | 0.64 0.159 265 |
| `--cell-3` | `#b855a6` orchid | `#e2b8d8` | 0.60 0.160 335 |
| `--cell-4` | `#721f65` plum | `#c7a2bd` | 0.40 0.142 335 |

- The four were chosen by search over the 265–335° band, for the widest separation
  under colour-vision deficiency with every mark at least 3:1 on paper. Every pair
  is at least 10.7 apart under protanopia and deuteranopia, and at least 15 apart
  for normal vision.
- The mark colour is for nuclei, outlines, dial wedges and matrix fills. The tint
  (62 % toward paper, 40 % chroma) is for cytoplasm and other large fills.
- **Four is the limit.** With more cell types, fold the rest into "other" (context
  grey) or split into small multiples. A panel uses either the family palette or
  the categorical slots.
- Defined in `tokens.mjs` (`family.cell`).

### 5. Magnitude: how much

One hue, light to dark.

| Scale | Ramp | Use |
|---|---|---|
| **Quantity** (default) | teal 100 → 900 | Expression, counts, density, anything without a judgement |
| **Harm** | vermilion 100 → 900 | Risk, toxicity grade, predicted probability of harm |
| **Benefit** | blue 100 → 900 | Response rate, sensitivity |

- **The ends mean something.** The lightest step sits at zero (or the minimum), the
  darkest at the maximum.
- Ordered classes that also carry a judgement (risk quartiles) take the valence
  arms instead: benefit 700 and 400, then harm 400 and 700.
- Continuous fields (heatmaps, spatial maps) use the full 100–900. Discrete ordered
  classes (grades 1–4, tiers, doses, stages) use steps 400–800, so the lightest class
  is still ≥ 2:1 on paper and the order shows in the colour.
- **Cap the scale** when a few outliers would use up its range: end it near the 95th
  percentile and label the key's end "> 2". A rank plot of the values shows where
  the cap belongs.
- **Dense images** (e.g. per-pixel spatial expression) may use *cividis*, the one
  multi-hue scale, because it is perceptually uniform and CVD-safe.
- Show a key with labelled ends, and the cap when there is one.

### 6. Direction: which way, without judging

For signed quantities where neither side is better: log fold change, bias, embedding
axes, up- and down-regulation.

| Scale | Negative arm | Midpoint | Positive arm |
|---|---|---|---|
| **Valence** (see §1) | blue (benefit) | `wash` | vermilion (harm) |
| **Direction** | violet | `wash` | ochre |

- The midpoint is a neutral grey, placed at the value that means "no change": 0 for
  a fold change, the mean for a z score.
- Arms are symmetric, with equal steps each side, from 200 to 800.
- Violet and ochre are chosen because they are warm and cool, CVD-safe, and carry no
  "good" or "bad" meaning. Use them for volcano plots, fold-change heatmaps and
  cell-line bias.

### 7. Structure: the figure itself

Structure is not data, so it uses structural ink.

- **Arrows and flow:** prussian, 2.5 px.
- **Method boxes** (LLM, model, pipeline step): benefit-wash fill, 12 px corners, a
  prussian icon above a short prussian label.
- **Dividers, axes and gridlines:** `rule` and `ink-2` hairlines.
- **Pills and tags:** a wash fill with the matching `*-text` colour.

## Validation

Validation is computed, not eyeballed. It uses OKLab ΔE (×100) under the
Machado–Oliveira–Fernandes 2009 protanopia and deuteranopia simulation, plus WCAG
contrast against `paper`.

| Check | Result |
|---|---|
| Categorical, adjacent pairs: CVD ΔE (target ≥ 8) | **8.7** worst (rose–moss) |
| Categorical, adjacent pairs: normal-vision ΔE (floor 15) | **19.4** worst |
| Slots 1–3, all pairs: CVD ΔE | **14.4** worst |
| All 500 marks vs paper | ≥ 3:1 |
| All 600 text steps vs paper | ≥ 5:1 (4.5:1 needed) |
| Ordinal ramps 400–800 | monotone lightness, adjacent ΔL ≥ 0.06, light end ≥ 2:1 |

**How the order was chosen:** all 720 orderings that open on blue were enumerated.
Among those passing every gate, we kept the one with the widest all-pairs separation
for the first three slots. That is blue, ochre, teal, which suits the two- or
three-group comparisons typical of our figures. It also keeps vermilion out of the
first three, so harm-red doesn't turn up by accident in a neutral comparison.

**If you change a hue:** edit `tokens.mjs`, regenerate, and re-run a CVD validator
(any OKLab/Machado implementation) on the categorical order and the ordinal ramps
before using it. To see a scale the way readers will, view it in normal vision,
greyscale and simulated deuteranopia, with its OKLab lightness plotted along it:
a good ramp changes steadily in every view (`specimen-scales.html` → `out/specimen-scales.png`).

## The look

Charts sit on white paper with hairline axes. Colour lands on data, and each hue
follows the data's meaning rather than a brand.
