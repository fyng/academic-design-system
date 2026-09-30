// Chart layer for the kit (see core/charts/).
//
//   const ch = GA.chart(ga, { x, y, w, h, xd: [0, 1], yd: [0, 1], xTitle, yTitle, at });
//   ch.line([[0, 0], [1, 1]], { color: "var(--accent)" });
//
// x, y, w, h place the PLOT AREA on the canvas; tick labels and titles sit
// outside it. Every piece of text goes through ga.text(), so the kit's lint
// sees chart labels like any other label. Data marks are drawn with ga.raw().
//
// House conventions baked in (core/charts/ explains each):
//   - left + bottom axes only, 1.5px ink-2; 5px outward ticks
//   - y title horizontal, above the axis, left-aligned to it
//   - x title right-aligned under the tick labels, at the high end
//   - gridlines off unless asked for (grid: "y" | "x"); 1px rule, solid
//   - reference lines are the one dotted element (1.5px, 2 4)
//   - motion: frame fades in at `at`; marks draw from `at + 0.4`
(function () {
  const fmtDefault = (v) => String(+v.toFixed(6)).replace("-", "−");
  let uid = 0;

  GA.chart = function (ga, o) {
    const X0 = o.x, Y0 = o.y, W = o.w, H = o.h, X1 = X0 + W, Y1 = Y0 + H;
    const at = o.at, mt = at === undefined ? undefined : at + 0.4;
    const lin = (d, r0, r1, log) => (v) => {
      const f = log ? (Math.log10(v) - Math.log10(d[0])) / (Math.log10(d[1]) - Math.log10(d[0])) : (v - d[0]) / (d[1] - d[0]);
      return r0 + f * (r1 - r0);
    };
    const sx = lin(o.xd || [0, 1], X0, X1, o.xlog);
    const sy = lin(o.yd || [0, 1], Y1, Y0, o.ylog);
    const P = (p) => `${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`;
    const ch = { sx, sy, x0: X0, x1: X1, y0: Y0, y1: Y1, w: W, h: H, items: [] };

    // ---- frame ----------------------------------------------------------------
    let frame = "";
    if (o.grid === "y" && o.yTicks) for (const t of o.yTicks) frame += `<path d="M${X0} ${sy(t)}H${X1}" stroke="var(--rule)" stroke-width="1"/>`;
    if (o.grid === "x" && o.xTicks) for (const t of o.xTicks) frame += `<path d="M${sx(t)} ${Y0}V${Y1}" stroke="var(--rule)" stroke-width="1"/>`;
    const axes = o.axes ?? "xy";
    if (axes.includes("y")) frame += `<path d="M${X0} ${Y0}V${Y1}" stroke="var(--ink-2)" stroke-width="1.5" fill="none"/>`;
    if (axes.includes("x")) frame += `<path d="M${X0} ${Y1}H${X1}" stroke="var(--ink-2)" stroke-width="1.5" fill="none"/>`;
    for (const t of o.xTicks || []) frame += `<path d="M${sx(t)} ${Y1}v5" stroke="var(--ink-2)" stroke-width="1.5"/>`;
    for (const t of o.yTicks || []) frame += `<path d="M${X0} ${sy(t)}h-5" stroke="var(--ink-2)" stroke-width="1.5"/>`;
    if (frame) ga.raw(frame, { at, anim: "fade", t: 0.4 });

    const xf = o.xFmt || fmtDefault, yf = o.yFmt || fmtDefault;
    for (const t of o.xTicks || []) ga.text(xf(t), { x: sx(t), y: Y1 + 9, role: "tick", anchor: "middle", at, anim: "fade" });
    for (const t of o.yTicks || []) ga.text(yf(t), { x: X0 - 10, y: sy(t) - 8, role: "tick", anchor: "end", at, anim: "fade" });
    if (o.yTitle) ga.text(o.yTitle, { x: o.yTitleX ?? X0, y: Y0 - 30, role: "axis", at, anim: "fade" });
    if (o.xTitle) ga.text(o.xTitle, { x: X1, y: Y1 + (o.xTicks ? 30 : 10), role: "axis", anchor: "end", at, anim: "fade" });

    const drawAttrs = (t, dur) => (t === undefined ? "" : ` pathLength="1" class="a-draw" style="--d:${t}s;--t:${dur}s"`);

    // ---- marks ------------------------------------------------------------------
    // Polyline through data points. curve: "linear" | "step" (step-after)
    ch.line = (pts, m = {}) => {
      let d = `M${P(pts[0])}`;
      for (let i = 1; i < pts.length; i++) d += m.curve === "step" ? `H${sx(pts[i][0]).toFixed(1)}V${sy(pts[i][1]).toFixed(1)}` : `L${P(pts[i])}`;
      const t = m.at ?? mt;
      const it = ga.raw(`<path d="${d}" fill="none" stroke="${m.color || "var(--ink)"}" stroke-width="${m.width || 2.5}" stroke-linejoin="round" stroke-linecap="round"${m.dash ? ` stroke-dasharray="${m.dash}"` : ""}${drawAttrs(t, m.t || 1.2)}/>`, {});
      // registered for lint: labels may not sit on a curve
      if (m.lint !== false) Object.assign(it, { kind: "curve", path: it.node.querySelector("path") });
      return it;
    };
    // Smooth curve y = f(x) sampled across the x domain (or m.from..m.to)
    ch.fn = (f, m = {}) => {
      const [a, b] = [m.from ?? (o.xd || [0, 1])[0], m.to ?? (o.xd || [0, 1])[1]];
      const n = 80, pts = [];
      for (let i = 0; i <= n; i++) {
        const v = o.xlog ? 10 ** (Math.log10(a) + (i / n) * (Math.log10(b) - Math.log10(a))) : a + (i / n) * (b - a);
        pts.push([v, f(v)]);
      }
      return ch.line(pts, m);
    };
    // Confidence ribbon between two curves sampled at the same x values
    ch.ribbon = (lo, hi, m = {}) => {
      const step = m.curve === "step";
      const seg = (pts) => pts.map((p, i) => (i === 0 ? `${P(p)}` : step ? `H${sx(p[0]).toFixed(1)}V${sy(p[1]).toFixed(1)}` : `L${P(p)}`)).join("");
      const rev = [...lo].reverse();
      let back = `L${P(rev[0])}`;
      for (let i = 1; i < rev.length; i++) back += step ? `V${sy(rev[i - 1][1]).toFixed(1)}H${sx(rev[i][0]).toFixed(1)}` : `L${P(rev[i])}`;
      if (step) back += `V${sy(rev[rev.length - 1][1]).toFixed(1)}`;
      return ga.raw(`<path d="M${seg(hi)}${back}Z" fill="${m.color || "var(--ink)"}" fill-opacity="${m.opacity ?? 0.14}" stroke="none"/>`, { at: m.at ?? (mt === undefined ? undefined : mt + 0.8), anim: "fade", t: 0.6 });
    };
    // Points. m.hollow for "not significant"; m.r radius (>= 4)
    ch.dots = (pts, m = {}) => {
      const r = m.r || 4.5;
      let s = "";
      for (const p of pts) {
        const c = p[2] || m.color || "var(--ink)";
        s += m.hollow || p[3] === "hollow"
          ? `<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="${r - 0.75}" fill="var(--paper)" stroke="${c}" stroke-width="1.5"/>`
          : `<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="${r + 1}" fill="var(--paper)"/><circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="${r}" fill="${c}" fill-opacity="${m.opacity ?? 1}"/>`;
      }
      return ga.raw(s, { at: m.at ?? mt, anim: "fade", t: 0.6 });
    };
    // Reference line: axis "x" draws a vertical line at x = v; "y" horizontal; "diag" y = x
    ch.ref = (axis, v, m = {}) => {
      const d = axis === "x" ? `M${sx(v)} ${Y0}V${Y1}` : axis === "y" ? `M${X0} ${sy(v)}H${X1}` : `M${X0} ${Y1}L${X1} ${Y0}`;
      return ga.raw(`<path d="${d}" stroke="${m.color || "var(--muted)"}" stroke-width="1.5" stroke-dasharray="2 4" stroke-linecap="round" fill="none"/>`, { at: m.at ?? at, anim: "fade" });
    };
    // Direct label at a data point. dx/dy offset in px; anchor as ga.text.
    // m.halo draws a 3px paper halo behind the glyphs, for labels set on points.
    ch.label = (str, x, y, m = {}) => {
      const it = ga.text(str, { x: sx(x) + (m.dx || 0), y: sy(y) + (m.dy ?? -9), role: m.role || "cap", size: m.size, anchor: m.anchor || "start", color: m.color, w: m.w, at: m.at ?? (mt === undefined ? undefined : mt + 1.2), anim: "fade" });
      if (m.halo) it.node.querySelectorAll("text").forEach((t) => t.setAttribute("style", `${t.getAttribute("style") || ""};stroke:var(--paper);stroke-width:3px;stroke-linejoin:round;paint-order:stroke`));
      return it;
    };

    // Horizontal bars for named categories. rows: [{label, v, color}]
    // Bars are <= 22px, square-cornered, and grow from the baseline.
    ch.hbars = (rows, m = {}) => {
      const band = H / rows.length, th = Math.min(m.thickness || 18, band - 6);
      rows.forEach((r, i) => {
        const cy = Y0 + band * (i + 0.5), x = sx(0), w = sx(r.v) - x;
        const t = m.at ?? (mt === undefined ? undefined : mt + i * 0.08);
        ga.raw(`<rect x="${x}" y="${cy - th / 2}" width="${w}" height="${th}" fill="${r.color || m.color || "var(--context)"}"/>`, { at: t, anim: "grow", t: 0.7 });
        ga.text(r.label, { x: X0 - 10, y: cy - 8, role: "label", size: 14, anchor: "end", color: r.labelColor, at: o.at, anim: "fade" });
        if (m.values !== false) ga.text((m.fmt || fmtDefault)(r.v), { x: sx(r.v) + 6, y: cy - 8, role: "tick", color: r.valueColor, at: t === undefined ? undefined : t + 0.5, anim: "fade" });
      });
    };
    // 100% stacked horizontal bars. rows: [{label, parts: [..fractions..]}], colors per part.
    // A 2px paper gap separates segments; no outlines.
    ch.stack = (rows, colors, m = {}) => {
      const band = H / rows.length, th = Math.min(m.thickness || 20, band - 6);
      rows.forEach((r, i) => {
        const cy = Y0 + band * (i + 0.5);
        const tot = r.parts.reduce((a, b) => a + b, 0);
        let acc = 0, s = "";
        r.parts.forEach((p, j) => {
          const xa = X0 + (acc / tot) * W, xb = X0 + ((acc + p) / tot) * W;
          s += `<rect x="${xa + (j ? 1 : 0)}" y="${cy - th / 2}" width="${Math.max(0, xb - xa - (j ? 1 : 0) - (j < r.parts.length - 1 ? 1 : 0))}" height="${th}" fill="${colors[j]}"/>`;
          acc += p;
        });
        ga.raw(s, { at: m.at ?? (mt === undefined ? undefined : mt + i * 0.08), anim: "grow", t: 0.7 });
        ga.text(r.label, { x: X0 - 10, y: cy - 8, role: "label", size: 14, anchor: "end", at: o.at, anim: "fade" });
      });
    };
    // Forest / interval plot on the x scale. rows: [{label, est, lo, hi, color, sig}]
    ch.intervals = (rows, m = {}) => {
      const band = H / rows.length;
      rows.forEach((r, i) => {
        const cy = Y0 + band * (i + 0.5), c = r.color || m.color || "var(--ink)";
        const t = m.at ?? (mt === undefined ? undefined : mt + i * 0.1);
        const dot = r.sig === false
          ? `<circle cx="${sx(r.est)}" cy="${cy}" r="4.75" fill="var(--paper)" stroke="${c}" stroke-width="1.5"/>`
          : `<circle cx="${sx(r.est)}" cy="${cy}" r="6.5" fill="var(--paper)"/><circle cx="${sx(r.est)}" cy="${cy}" r="5.5" fill="${c}"/>`;
        ga.raw(`<path d="M${sx(r.lo)} ${cy}H${sx(r.hi)}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>${dot}`, { at: t, anim: "fade", t: 0.5 });
        ga.text(r.label, { x: X0 - 10, y: cy - 8, role: "label", size: 14, anchor: "end", at: o.at, anim: "fade" });
      });
    };
    // Heatmap. matrix[row][col] in [lo, hi]; ramp: array of hex from lo to hi.
    // Cells separated by a 2px paper gap; labels optional. Values beyond the
    // domain take the end colour (a capped scale); null cells stay blank.
    //   groups: [{label, n}] splits columns into runs of n with a 7px gap and
    //           names each run above the grid
    //   dense:  true drops the gaps between columns (hundreds of columns)
    ch.heat = (matrix, ramp, m = {}) => {
      const [lo, hi] = m.domain || [-1, 1];
      const nr = matrix.length, nc = matrix[0].length, rh = H / nr;
      const groups = m.groups || [{ n: nc }], GAP = m.groups ? 7 : 0;
      const cw = (W - GAP * (groups.length - 1)) / nc;
      const cx = [];
      groups.forEach((g, k) => { for (let j = 0; j < g.n; j++) cx.push(X0 + (cx.length * cw) + k * GAP); });
      const pick = (v) => ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(((v - lo) / (hi - lo)) * (ramp.length - 1))))];
      const gx = m.dense ? 0 : 1;
      let s = "";
      matrix.forEach((row, i) => row.forEach((v, j) => {
        if (v === null || v === undefined) return;
        s += `<rect x="${cx[j] + gx}" y="${Y0 + i * rh + 1}" width="${cw - 2 * gx + (m.dense ? 0.5 : 0)}" height="${rh - 2}" fill="${pick(v)}"/>`;
      }));
      ga.raw(s, { at: m.at ?? mt, anim: "fade", t: 0.8 });
      let j0 = 0;
      if (m.groups) for (const g of groups) {
        if (g.label) ga.text(g.label, { x: cx[j0], y: Y0 - 24, role: "tick", at, anim: "fade" });
        j0 += g.n;
      }
      (m.rowLabels || []).forEach((l, i) => ga.text(l, { x: X0 - 10, y: Y0 + (i + 0.5) * rh - 8, role: "label", size: 14, anchor: "end", at, anim: "fade" }));
      (m.colLabels || []).forEach((l, j) => ga.text(l, { x: cx[j] + cw / 2, y: Y1 + 8, role: "tick", anchor: "middle", at, anim: "fade" }));
    };
    // Summary mark (median or mean) at data (x, y): a short ink bar, 3px, with a
    // paper halo so it reads over points. hw = half-width in px.
    ch.summary = (x, y, m = {}) => {
      const hw = m.hw || 20, X = sx(x), Y = sy(y);
      return ga.raw(`<path d="M${X - hw} ${Y}H${X + hw}" stroke="var(--paper)" stroke-width="6" stroke-linecap="round"/><path d="M${X - hw} ${Y}H${X + hw}" stroke="${m.color || "var(--ink)"}" stroke-width="3"/>`, { at: m.at ?? (mt === undefined ? undefined : mt + 0.6), anim: "fade", t: 0.4 });
    };
    // Beeswarm: every observation as a point, placed without overlap around its
    // group's x, with a summary bar. groups: [{x, values, color}]
    //   r: point radius (4.5 to ~50 per group, 3-3.5 to ~100); summary: "median" | "mean" | false
    ch.swarm = (groups, m = {}) => {
      const r = m.r || 4.5, D = 2 * r + 0.5;
      for (const g of groups) {
        const X = sx(g.x), placed = [], pts = [];
        for (const v of [...g.values].sort((a, b) => a - b)) {
          const Y = sy(v), near = placed.filter((p) => Math.abs(p.y - Y) < D);
          const cand = [0];
          for (const p of near) { const dx = Math.sqrt(D * D - (p.y - Y) ** 2); cand.push(p.dx + dx, p.dx - dx); }
          cand.sort((a, b) => Math.abs(a) - Math.abs(b));
          const dx = cand.find((c) => near.every((p) => (p.dx - c) ** 2 + (p.y - Y) ** 2 >= D * D - 0.01));
          placed.push({ dx, y: Y });
          pts.push([o.xd[0] + ((X + dx - X0) / W) * (o.xd[1] - o.xd[0]), v, g.color || m.color || "var(--ink-2)"]);
        }
        ch.dots(pts, { r, at: m.at });
        if (m.summary !== false) {
          const s = [...g.values].sort((a, b) => a - b), n = s.length;
          const c = m.summary === "mean" ? s.reduce((a, b) => a + b, 0) / n : n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
          const spread = Math.max(...placed.map((p) => Math.abs(p.dx)));
          ch.summary(g.x, c, { hw: m.hw || Math.max(14, Math.min(44, spread + r + 4)), at: m.at === undefined ? undefined : m.at + 0.6 });
        }
      }
    };
    // Vertical bars from a zero baseline. rows: [{x, v, color}]; width in px
    // (default half the band). Square-cornered.
    ch.vbars = (rows, m = {}) => {
      const bw = m.width || Math.abs(sx(1) - sx(0)) / 2;
      rows.forEach((r, i) => {
        const X = sx(r.x) - bw / 2, yb = sy(0), h = yb - sy(r.v);
        const t = m.at ?? (mt === undefined ? undefined : mt + i * 0.08);
        ga.raw(`<rect x="${X}" y="${yb - h}" width="${bw}" height="${h}" fill="${r.color || m.color || "var(--context)"}"/>`, { at: t, anim: "rise", t: 0.7 });
      });
    };
    // Lollipop: one row per item, a 2px rule stem from the reference (m.ref, default 0)
    // to a dot at the value. rows: [{label, v, color}]; the dot has a 1px ink-2 ring.
    ch.lollipop = (rows, m = {}) => {
      const band = H / rows.length, x0 = sx(m.ref ?? 0);
      rows.forEach((r, i) => {
        const cy = Y0 + band * (i + 0.5), t = m.at ?? (mt === undefined ? undefined : mt + i * 0.08);
        ga.raw(`<path d="M${x0} ${cy}H${sx(r.v)}" stroke="var(--rule)" stroke-width="2"/><circle cx="${sx(r.v)}" cy="${cy}" r="${m.r || 5.5}" fill="${r.color || "var(--ink)"}" stroke="var(--ink-2)" stroke-width="1"/>`, { at: t, anim: "fade", t: 0.5 });
        ga.text(r.label, { x: X0 - 10, y: cy - 8, role: "label", size: 14, anchor: "end", at: o.at, anim: "fade" });
      });
    };
    // 100% stacked columns for many samples. cols: [[..fractions..]], colors per part.
    // groups: [{label, n, color}] splits the columns into runs with a 5px gap and names
    // each run beneath the plot. Parts touch within a column; columns keep a 1px gap.
    ch.columns = (cols, colors, m = {}) => {
      const groups = m.groups || [{ n: cols.length }], GAP = m.groups ? 5 : 0;
      const cw = (W - GAP * (groups.length - 1)) / cols.length;
      let j = 0, s = "";
      groups.forEach((g, k) => {
        const gx = X0 + j * cw + k * GAP;
        for (let q = 0; q < g.n; q++, j++) {
          const x = X0 + j * cw + k * GAP, tot = cols[j].reduce((a, b) => a + b, 0);
          let acc = 0;
          cols[j].forEach((p, i) => {
            const ya = Y1 - (acc / tot) * H, yb = Y1 - ((acc + p) / tot) * H;
            s += `<rect x="${x}" y="${yb}" width="${Math.max(0.5, cw - 1)}" height="${ya - yb + 0.3}" fill="${colors[i]}"/>`;
            acc += p;
          });
        }
        if (g.label) ga.text(g.label, { x: gx, y: Y1 + 8, role: "tick", color: g.color, at, anim: "fade" });
      });
      ga.raw(s, { at: m.at ?? mt, anim: "rise", t: 0.8 });
    };
    // Line key: short line swatch + label per series, stacked at canvas px (x, y).
    // For when end labels would collide (converging curves).
    ch.lineKey = (rows, m) => {
      let y = m.y;
      for (const r of rows) {
        ga.raw(`<path d="M${m.x} ${y + 9}h18" stroke="${r.color}" stroke-width="2.5" stroke-linecap="round"/>`, { at: m.at ?? mt, anim: "fade" });
        const t = ga.text(r.label, { x: m.x + 26, y, role: m.role || "tick", color: r.textColor, at: m.at ?? mt, anim: "fade" });
        y = t.b + 6;
      }
    };
    // Colour-scale key: a thin bar with end labels, placed in canvas px
    ch.key = (ramp, m) => {
      const n = ramp.length, w = m.w / n;
      const s = ramp.map((c, i) => `<rect x="${m.x + i * w}" y="${m.y}" width="${w + 0.5}" height="8" fill="${c}"/>`).join("");
      ga.raw(s, { at, anim: "fade" });
      if (m.lo) ga.text(m.lo, { x: m.x, y: m.y + 13, role: "tick", at, anim: "fade" });
      if (m.hi) ga.text(m.hi, { x: m.x + m.w, y: m.y + 13, role: "tick", anchor: "end", at, anim: "fade" });
      if (m.mid) ga.text(m.mid, { x: m.x + m.w / 2, y: m.y + 13, role: "tick", anchor: "middle", at, anim: "fade" });
    };
    // Censoring marks on a step curve: short vertical ticks at data points [[x, y]].
    ch.censor = (pts, m = {}) => {
      const h = m.h || 6, c = m.color || "var(--ink)";
      const s = pts.map((p) => `<path d="M${sx(p[0]).toFixed(1)} ${(sy(p[1]) - h / 2).toFixed(1)}v${h}" stroke="${c}" stroke-width="1.5"/>`).join("");
      return ga.raw(s, { at: m.at ?? (mt === undefined ? undefined : mt + 1), anim: "fade", t: 0.4 });
    };
    // Numbers at risk beneath the x axis. rows: [{label, counts, color}], counts at
    // `times`; m.y is the canvas y of the first row. Labels sit left of the axis in
    // the row's text colour; counts are tick text under each time.
    ch.atRisk = (rows, times, m) => {
      const pitch = m.pitch || 18, lx = X0 - (m.labelGap || 24);
      if (m.title !== false) ga.text(m.title || "Number at risk", { x: lx, y: m.y - pitch, role: "tick", anchor: "end", color: "var(--muted)", at, anim: "fade" });
      rows.forEach((r, i) => {
        const y = m.y + i * pitch;
        ga.text(r.label, { x: lx, y, role: "tick", anchor: "end", color: r.color, at, anim: "fade" });
        times.forEach((t, j) => ga.text(String(r.counts[j]), { x: sx(t), y, role: "tick", anchor: "middle", at, anim: "fade" }));
      });
    };
    // Hexagonal density bins. pts: [[x, y]]; ramp from lo to hi; m.r hexagon radius
    // in px; m.domain [lo, hi] counts, capped at hi (the key's end reads "> hi").
    // Empty bins stay paper. Returns the largest count.
    ch.hexbin = (pts, ramp, m = {}) => {
      const r = m.r || 6, w = Math.sqrt(3) * r, hstep = 1.5 * r, bins = new Map();
      for (const p of pts) {
        const X = sx(p[0]) - X0, Y = sy(p[1]) - Y0;
        if (X < 0 || X > W || Y < 0 || Y > H) continue;
        const row = Math.round(Y / hstep), col = Math.round((X - (row % 2 ? w / 2 : 0)) / w);
        const k = `${row},${col}`;
        bins.set(k, (bins.get(k) || 0) + 1);
      }
      const max = Math.max(...bins.values());
      const [lo, hi] = m.domain || [1, max];
      let s = "";
      for (const [k, n] of bins) {
        const [row, col] = k.split(",").map(Number);
        const cx = X0 + col * w + (row % 2 ? w / 2 : 0), cy = Y0 + row * hstep;
        const f = Math.max(0, Math.min(1, (n - lo) / (hi - lo)));
        const c = ramp[Math.round(f * (ramp.length - 1))];
        const d = [...Array(6)].map((_, i) => { const a = Math.PI / 6 + (i * Math.PI) / 3; return `${(cx + (r - 0.5) * Math.cos(a)).toFixed(1)} ${(cy + (r - 0.5) * Math.sin(a)).toFixed(1)}`; });
        s += `<path d="M${d.join("L")}Z" fill="${c}"/>`;
      }
      ga.raw(`<svg x="${X0}" y="${Y0}" width="${W}" height="${H}" viewBox="${X0} ${Y0} ${W} ${H}" overflow="hidden">${s}</svg>`, { at: m.at ?? mt, anim: "fade", t: 0.8 });
      return max;
    };
    // Marginal strip (a composite panel's satellite): a histogram of `values` along
    // the shared axis, on the "top" or "right" of the plot, `depth` px deep and
    // `gap` px from it, in context grey. The strip's scale runs to the round number
    // at or above the peak count (1, 2, 2.5, 5 × 10^k); m.peak: true labels that
    // tick in the main axis's tick column, a string labels it verbatim.
    ch.marginal = (side, values, m = {}) => {
      const depth = m.depth || 30, gap = m.gap || 8, nb = m.bins || 24;
      const d = side === "top" ? o.xd || [0, 1] : o.yd || [0, 1];
      const cnt = new Array(nb).fill(0);
      for (const v of values) { const i = Math.floor(((v - d[0]) / (d[1] - d[0])) * nb); if (i >= 0 && i < nb) cnt[i]++; }
      const peak = Math.max(...cnt), c = m.color || "var(--context)";
      const e = 10 ** Math.floor(Math.log10(peak));
      const top = [1, 2, 2.5, 5, 10].map((k) => k * e).find((v) => v >= peak);
      let s = "";
      cnt.forEach((n, i) => {
        const len = (n / top) * depth;
        if (side === "top") {
          const xa = X0 + (i / nb) * W, bw = W / nb;
          s += `<rect x="${xa + 0.5}" y="${Y0 - gap - len}" width="${Math.max(0, bw - 1)}" height="${len}" fill="${c}"/>`;
        } else {
          const ya = Y1 - ((i + 1) / nb) * H, bh = H / nb;
          s += `<rect x="${X1 + gap}" y="${ya + 0.5}" width="${len}" height="${Math.max(0, bh - 1)}" fill="${c}"/>`;
        }
      });
      if (side === "top") s += `<path d="M${X0} ${Y0 - gap}V${Y0 - gap - depth}h-5" stroke="var(--ink-2)" stroke-width="1.5" fill="none"/>`;
      else s += `<path d="M${X1 + gap} ${Y1}H${X1 + gap + depth}v5" stroke="var(--ink-2)" stroke-width="1.5" fill="none"/>`;
      ga.raw(s, { at: m.at ?? mt, anim: "fade", t: 0.6 });
      const pk = m.peak === true ? (top >= 1000 ? `${+(top / 1000).toFixed(1)}k` : String(top)) : m.peak;
      if (pk) {
        if (side === "top") ga.text(pk, { x: X0 - 10, y: Y0 - gap - depth - 8, role: "tick", anchor: "end", at, anim: "fade" });
        else ga.text(pk, { x: X1 + gap + depth, y: Y1 + 9, role: "tick", anchor: "middle", at, anim: "fade" });
      }
      return top;
    };
    // Dumbbell (paired comparison) on the x scale. rows: [{label, a, b, p}], a the
    // comparator (context), b the model (m.color, default prussian), joined by a 2px
    // rule stem. b is hollow when p >= .05. m.values prints a and b at the outer
    // ends; m.p: "exact" prints P, "stars" prints stars, false none, right-aligned
    // in one column ending at m.pRight (default: the plot's right edge). m.pitch
    // fixes the row pitch in px (default: the plot height over the rows).
    ch.dumbbell = (rows, m = {}) => {
      const pitch = m.pitch || H / rows.length, cb = m.color || "var(--prussian)", ca = m.colorA || "var(--context)";
      const fv = m.fmt || ((v) => v.toFixed(2).replace(/^0/, ""));
      const stars = (p) => (p < 0.001 ? "***" : p < 0.01 ? "**" : p < 0.05 ? "*" : "ns");
      const fp = (p) => (p < 0.001 ? "*P* < 0.001" : `*P* = ${p < 0.01 ? p.toFixed(3) : p.toFixed(2)}`);
      rows.forEach((r, i) => {
        const cy = Y0 + pitch * (i + 0.5), xa = sx(r.a), xb = sx(r.b), ns = r.p !== undefined && r.p >= 0.05;
        const t = m.at ?? (mt === undefined ? undefined : mt + i * 0.08);
        const dot = (x, c, hollow) => (hollow
          ? `<circle cx="${x}" cy="${cy}" r="4.75" fill="var(--paper)" stroke="${c}" stroke-width="1.5"/>`
          : `<circle cx="${x}" cy="${cy}" r="6.5" fill="var(--paper)"/><circle cx="${x}" cy="${cy}" r="5.5" fill="${c}"/>`);
        ga.raw(`<path d="M${xa} ${cy}H${xb}" stroke="var(--rule)" stroke-width="2"/>${dot(xa, ca, false)}${dot(xb, cb, ns)}`, { at: t, anim: "fade", t: 0.5 });
        ga.text(r.label, { x: X0 - 10, y: cy - 8, role: "label", size: 14, anchor: "end", at: o.at, anim: "fade" });
        const [lo, hi] = r.a <= r.b ? [r.a, r.b] : [r.b, r.a];
        if (m.values) {
          ga.text(fv(lo), { x: sx(lo) - 12, y: cy - 8, role: "tick", anchor: "end", at: t, anim: "fade" });
          ga.text(fv(hi), { x: sx(hi) + 12, y: cy - 8, role: "tick", at: t, anim: "fade" });
        }
        if (m.p && r.p !== undefined) {
          ga.text(m.p === "stars" ? stars(r.p) : fp(r.p), { x: m.pRight ?? X1, y: cy - 8, role: "tick", anchor: "end", color: "var(--muted)", at: t, anim: "fade" });
        }
      });
    };
    // Paired-comparison key: a dot and a name per series, in a row at canvas (x, y).
    // m.square draws square swatches instead, for bars and segments.
    ch.dotKey = (rows, m) => rows.reduce((kx, r) => {
      ga.raw(m.square ? `<rect x="${kx + 1}" y="${m.y + 3}" width="10" height="10" fill="${r.color}"/>` : `<circle cx="${kx + 6}" cy="${m.y + 8}" r="5.5" fill="${r.color}"/>`, { at: m.at ?? at, anim: "fade" });
      return ga.text(r.label, { x: kx + 18, y: m.y, role: "tick", at: m.at ?? at, anim: "fade" }).r + 18;
    }, m.x);

    // Text reading upward, its start at canvas (x, y): column names above a matrix.
    // m.hang: true ends the text at (x, y) instead, so it hangs below a plot.
    // Rotated text is not linted, so keep it clear of other marks.
    ch.upText = (str, x, y, m = {}) => {
      const size = m.size || 13, xb = x + size * 0.36; // centre the cap height on x
      return ga.raw(`<text x="${xb}" y="${y}" transform="rotate(-90 ${xb} ${y})" font-size="${size}"${m.hang ? ` text-anchor="end"` : ""} class="t-${m.role || "tick"}"${m.color ? ` style="fill:${m.color} !important"` : ""}>${str}</text>`, { at: m.at ?? at, anim: "fade" });
    };

    // Count matrix (18): counts in cells, each cell shaded by a binned share.
    // matrix[row][col] counts; 0 or null stays blank. ramp: one colour per bin;
    // m.bins: bin edges, one more than the ramp (0, .05, .1, .2, .4, 1).
    // m.shade(v, i, j) gives the share to bin (default v itself). The count is
    // printed in every filled cell, ink on light steps and paper from step
    // m.dark on. m.rowLabels left of the grid; m.colLabels read upward above it.
    // m.totals prints a column of row totals right of the grid; m.parts with
    // m.partColors adds a 100 % bar per row after it (m.partW px wide).
    ch.counts = (matrix, ramp, m = {}) => {
      const nr = matrix.length, nc = matrix[0].length, cw = W / nc, rh = H / nr;
      const bins = m.bins, dark = m.dark ?? Math.ceil(ramp.length / 2), shade = m.shade || ((v) => v);
      const bin = (v) => { let k = 0; while (k < ramp.length - 1 && v > bins[k + 1]) k++; return k; };
      const fs = m.size || 11;
      let s = "";
      const nums = [];
      matrix.forEach((row, i) => row.forEach((v, j) => {
        if (!v) return;
        const k = bin(shade(v, i, j));
        s += `<rect x="${X0 + j * cw + 1}" y="${Y0 + i * rh + 1}" width="${cw - 2}" height="${rh - 2}" fill="${ramp[k]}"/>`;
        nums.push({ v, i, j, d: k >= dark });
      }));
      ga.raw(s, { at: m.at ?? mt, anim: "fade", t: 0.8 });
      const tt = m.at ?? (mt === undefined ? undefined : mt + 0.5);
      for (const n of nums) ga.text(String(n.v), { x: X0 + (n.j + 0.5) * cw, y: Y0 + (n.i + 0.5) * rh - fs * 0.43, size: fs, role: "tick", anchor: "middle", color: n.d ? "var(--paper)" : "var(--ink)", at: tt, anim: "fade" });
      (m.rowLabels || []).forEach((l, i) => ga.text(l, { x: X0 - 10, y: Y0 + (i + 0.5) * rh - 8, role: "label", size: 13, anchor: "end", at, anim: "fade" }));
      (m.colLabels || []).forEach((l, j) => ch.upText(l, X0 + (j + 0.5) * cw, Y0 - 8));
      if (m.totals) {
        const tx = X1 + (m.totalsW || 44);
        if (m.totalsTitle) ga.text(m.totalsTitle, { x: tx, y: Y0 - 22, role: "tick", anchor: "end", color: "var(--muted)", at, anim: "fade" });
        m.totals.forEach((v, i) => ga.text(String(v), { x: tx, y: Y0 + (i + 0.5) * rh - 7.5, role: "tick", anchor: "end", at, anim: "fade" }));
      }
      if (m.parts) {
        const px = X1 + (m.totals ? (m.totalsW || 44) + 10 : 12), pw = m.partW || 100, th = Math.min(rh - 4, 12);
        let p = "";
        m.parts.forEach((parts, i) => {
          const cy = Y0 + (i + 0.5) * rh, tot = parts.reduce((a, b) => a + b, 0);
          let acc = 0;
          parts.forEach((q, k) => {
            if (!q) return;
            const xa = px + (acc / tot) * pw, xb = px + ((acc + q) / tot) * pw;
            p += `<rect x="${xa + (acc ? 1 : 0)}" y="${cy - th / 2}" width="${Math.max(0.5, xb - xa - (acc ? 1 : 0))}" height="${th}" fill="${m.partColors[k]}"/>`;
            acc += q;
          });
        });
        p += `<path d="M${px} ${Y1 + 2}H${px + pw}" stroke="var(--ink-2)" stroke-width="1.5"/>`;
        for (const f of [0, 0.5, 1]) p += `<path d="M${px + f * pw} ${Y1 + 2}v5" stroke="var(--ink-2)" stroke-width="1.5"/>`;
        ga.raw(p, { at: m.at ?? mt, anim: "grow", t: 0.8 });
        for (const f of [0, 0.5, 1]) ga.text(String(f), { x: px + f * pw, y: Y1 + 11, role: "tick", anchor: "middle", at, anim: "fade" });
        return { partsX: px, partsW: pw };
      }
    };

    // Dot matrix (19): two measures per cell. share[row][col] in [0, 1] sets the
    // dot's AREA (the largest dot fills the cell less a margin); mag[row][col]
    // sets its colour on `ramp` over m.domain (m.log for a log scale; values past
    // the domain take the end colour). Every cell is a wash square, so a share of 0
    // reads as "measured, absent". m.groups: [{label, n}] splits rows with a 10px
    // gap and names each group upward at m.groupX. m.n prints each column's n above
    // the grid; m.notes prints a text column right of the grid (m.notesW wide).
    ch.dotMatrix = (share, mag, ramp, m = {}) => {
      const nr = share.length, nc = share[0].length, GAP = 10;
      const groups = m.groups || [{ n: nr }];
      const rh = (H - GAP * (groups.length - 1)) / nr, cw = W / nc;
      const ry = [];
      groups.forEach((g, k) => { for (let q = 0; q < g.n; q++) ry.push(Y0 + ry.length * rh + k * GAP); });
      const [lo, hi] = m.domain || [0, 1];
      const f = (v) => Math.max(0, Math.min(1, m.log ? (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) : (v - lo) / (hi - lo)));
      const rmax = Math.min(cw, rh) / 2 - 1.5;
      let bg = "", dots = "";
      share.forEach((row, i) => row.forEach((p, j) => {
        const x = X0 + j * cw, y = ry[i];
        bg += `<rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${rh - 2}" fill="var(--wash)"/>`;
        if (p > 0) dots += `<circle cx="${x + cw / 2}" cy="${y + rh / 2}" r="${(rmax * Math.sqrt(p)).toFixed(2)}" fill="${ramp[Math.round(f(mag[i][j]) * (ramp.length - 1))]}"/>`;
      }));
      ga.raw(bg, { at, anim: "fade" });
      ga.raw(dots, { at: m.at ?? mt, anim: "fade", t: 0.8 });
      (m.rowLabels || []).forEach((l, i) => ga.text(l, { x: X0 - 10, y: ry[i] + rh / 2 - 7.5, role: "label", size: 12, anchor: "end", at, anim: "fade" }));
      (m.notes || []).forEach((l, i) => l && ga.text(l, { x: X1 + 12, y: ry[i] + rh / 2 - 7.5, role: "tick", size: 12, at, anim: "fade" }));
      let top = Y0 - 8;
      if (m.n) {
        m.n.forEach((v, j) => ga.text(String(v), { x: X0 + (j + 0.5) * cw, y: Y0 - 20, role: "tick", size: 11, anchor: "middle", at, anim: "fade" }));
        ga.text("n", { x: X0 - 10, y: Y0 - 20, role: "tick", size: 11, anchor: "end", at, anim: "fade" });
        top = Y0 - 28;
      }
      (m.colLabels || []).forEach((l, j) => ch.upText(l, X0 + (j + 0.5) * cw, top, { size: 12 }));
      if (m.groups) groups.forEach((g, k) => {
        const i0 = groups.slice(0, k).reduce((a, b) => a + b.n, 0), ya = ry[i0], yb = ry[i0 + g.n - 1] + rh;
        ch.upText(g.label, m.groupX ?? X0 - 80, yb, { role: "axis", size: 13 });
        ga.raw(`<path d="M${(m.groupX ?? X0 - 80) + 10} ${ya + 2}V${yb - 2}" stroke="var(--rule)" stroke-width="1.5"/>`, { at, anim: "fade" });
      });
      return { rmax, rowY: ry, rh, cw };
    };
    // Size key for a dot matrix: dots at the given shares, in context grey, with
    // the share under each; `title` above. rmax as returned by dotMatrix.
    ch.sizeKey = (shares, rmax, m) => {
      let x = m.x, s = "";
      const cy = m.y + 22 + rmax;
      if (m.title) ga.text(m.title, { x: m.x, y: m.y, role: "tick", color: "var(--muted)", at, anim: "fade" });
      shares.forEach((p) => {
        const r = rmax * Math.sqrt(p);
        s += `<circle cx="${x + rmax}" cy="${cy}" r="${r.toFixed(2)}" fill="var(--context)"/>`;
        ga.text(String(p), { x: x + rmax, y: cy + rmax + 5, role: "tick", size: 12, anchor: "middle", at, anim: "fade" });
        x += 2 * rmax + 16;
      });
      ga.raw(s, { at, anim: "fade" });
    };
    // ---- records (07, 25, 26) -------------------------------------------------------------
    // Swimmer plot (25): one row per patient on a shared time axis. rows: [{label,
    // end, dead, relapse, strips: [colour], bars: [{t0, t1, color}], events: [{t, kind,
    // ...glyph}], samples: [colour]}]. The follow-up line runs from 0 to `end`: 1.5px
    // rule, then 2.5px ink-2 from `relapse` on, so the disease state reads off the
    // line. Treatment bars (8px) sit on it; event glyphs over them; a 12px ink tick
    // ends a row at death.
    // `samples` are dots after the row's end, two rows deep, in the site's colour.
    // strips are annotation squares left of the plot at m.stripX (canvas x per strip),
    // named upward above them (m.stripLabels), with the patient's label left of them.
    ch.swimmer = (rows, m = {}) => {
      const pitch = H / rows.length, gs = m.size || 11, t = m.at ?? mt;
      let line = "", bars = "", ev = "", smp = "", str = "";
      rows.forEach((r, i) => {
        const cy = Y0 + (i + 0.5) * pitch;
        line += `<path d="M${sx(0)} ${cy}H${sx(r.end)}" stroke="var(--rule)" stroke-width="1.5"/>`;
        if (r.relapse !== undefined) line += `<path d="M${sx(r.relapse)} ${cy}H${sx(r.end)}" stroke="var(--ink-2)" stroke-width="2.5"/>`;
        for (const b of r.bars || []) bars += `<rect x="${sx(b.t0)}" y="${cy - 4}" width="${Math.max(2, sx(b.t1) - sx(b.t0))}" height="8" fill="${b.color}"/>`;
        for (const e of r.events || []) ev += GA.glyph(e.kind, sx(e.t), cy, { size: gs, ...e });
        if (r.dead) ev += GA.glyph("tick", sx(r.end), cy, { size: 12 });
        const sr = m.sampleR || 4, sp = 2 * sr + 1.5;
        (r.samples || []).forEach((c, k) => {
          const col = Math.floor(k / 2), row = k % 2;
          smp += `<circle cx="${sx(r.end) + 9 + sr + col * sp}" cy="${cy + (row ? sp / 2 : -sp / 2)}" r="${sr}" fill="${c}" stroke="var(--paper)" stroke-width="1"/>`;
        });
        (r.strips || []).forEach((c, k) => { str += `<rect x="${m.stripX[k]}" y="${cy - pitch / 2 + 1.5}" width="${pitch - 3}" height="${pitch - 3}" fill="${c}"/>`; });
        ga.text(r.label, { x: (m.stripX ? m.stripX[0] : X0) - 8, y: cy - 7.5, role: "tick", size: 12, anchor: "end", at, anim: "fade" });
      });
      ga.raw(str, { at, anim: "fade" });
      ga.raw(line, { at: t, anim: "fade" });
      ga.raw(bars, { at: t === undefined ? undefined : t + 0.2, anim: "grow", t: 0.7 });
      ga.raw(ev + smp, { at: t === undefined ? undefined : t + 0.5, anim: "fade", t: 0.5 });
      (m.stripLabels || []).forEach((l, k) => ch.upText(l, m.stripX[k] + (pitch - 3) / 2, Y0 - 6, { size: 12 }));
    };
    // Unit columns (26): one dot per item, stacked into a column per unit (a patient),
    // coloured by the item's state, states in one fixed order from the baseline up.
    // cols: [{label, parts: [count per state]}], colors: fill per state; a state whose
    // colour is "hollow" is paper with the ring alone. Dots are one unit of y apart,
    // so the y axis counts items; each has a 1px ink-2 ring so light states show.
    ch.units = (cols, colors, m = {}) => {
      const pitch = Math.abs(sy(1) - sy(0)), r = Math.min(pitch / 2 - 0.6, m.r || 6), t = m.at ?? mt;
      let s = "";
      cols.forEach((c, j) => {
        let k = 0;
        c.parts.forEach((n, st) => {
          for (let q = 0; q < n; q++, k++) {
            const hollow = colors[st] === "hollow";
            s += `<circle cx="${g1(sx(j))}" cy="${g1(sy(k + 0.5))}" r="${g1(r)}" fill="${hollow ? "var(--paper)" : colors[st]}" stroke="var(--ink-2)" stroke-width="1"/>`;
          }
        });
        ch.upText(c.label, sx(j), Y1 + 8, { size: 12, hang: true });
      });
      ga.raw(s, { at: t, anim: "rise", t: 0.8 });
    };
    // Categorical heatmap, the oncoprint (07): alterations per gene (rows) and
    // patient (columns). Every cell is a wash square; an altered cell is filled in
    // its class's colour, inset 1px.
    // cell: null | {cls, mark} — mark: true adds a small paper ring with a 1px ink
    // edge, the glyph for a second event in the same gene (a biallelic hit).
    // m.classColors[cls]; m.groups [{label, n}] split rows (10px gap), named upward
    // at m.groupX; m.totals: true adds a stacked bar of each row's classes to the
    // right, m.totalW px for m.totalMax; m.annot: [{label, colors}] strips under the grid.
    ch.oncoprint = (matrix, m = {}) => {
      const nr = matrix.length, nc = matrix[0].length, GAP = 10, groups = m.groups || [{ n: nr }];
      const rh = (H - GAP * (groups.length - 1)) / nr, cw = W / nc, ry = [];
      groups.forEach((g, k) => { for (let q = 0; q < g.n; q++) ry.push(Y0 + ry.length * rh + k * GAP); });
      const cls = m.classes || Object.keys(m.classColors);
      let bg = "", fg = "", mk = "", tot = "";
      matrix.forEach((row, i) => {
        const counts = cls.map(() => 0);
        row.forEach((c, j) => {
          const x = X0 + j * cw, y = ry[i];
          bg += `<rect x="${g1(x + 1)}" y="${g1(y + 1)}" width="${g1(cw - 2)}" height="${g1(rh - 2)}" fill="var(--wash)"/>`;
          if (!c) return;
          counts[cls.indexOf(c.cls)]++;
          fg += `<rect x="${g1(x + 1)}" y="${g1(y + 1)}" width="${g1(cw - 2)}" height="${g1(rh - 2)}" fill="${m.classColors[c.cls]}"/>`;
          if (c.mark) mk += `<circle cx="${g1(x + cw / 2)}" cy="${g1(y + rh / 2)}" r="${g1(Math.min(cw, rh) * 0.22)}" fill="var(--paper)" stroke="var(--ink)" stroke-width="1"/>`;
        });
        if (m.totals) {
          let acc = 0;
          const u = (m.totalW || 60) / (m.totalMax || nc), tx = X1 + 10;
          counts.forEach((n, k) => { if (n) tot += `<rect x="${g1(tx + acc * u)}" y="${g1(ry[i] + 2)}" width="${g1(n * u - (acc + n < counts.reduce((a, b) => a + b, 0) ? 1 : 0))}" height="${g1(rh - 4)}" fill="${m.classColors[cls[k]]}"/>`; acc += n; });
        }
      });
      ga.raw(bg, { at, anim: "fade" });
      ga.raw(fg + mk, { at: m.at ?? mt, anim: "fade", t: 0.8 });
      if (m.totals) {
        const tx = X1 + 10, tw = m.totalW || 60;
        ga.raw(`${tot}<path d="M${tx} ${Y0 - 4}H${tx + tw}" stroke="var(--ink-2)" stroke-width="1.5"/><path d="M${tx} ${Y0 - 4}v-5M${tx + tw} ${Y0 - 4}v-5" stroke="var(--ink-2)" stroke-width="1.5"/>`, { at: m.at ?? mt, anim: "grow", t: 0.8 });
        ga.text("0", { x: tx, y: Y0 - 24, role: "tick", size: 11, anchor: "middle", at, anim: "fade" });
        ga.text(String(m.totalMax || nc), { x: tx + tw, y: Y0 - 24, role: "tick", size: 11, anchor: "middle", at, anim: "fade" });
      }
      (m.rowLabels || []).forEach((l, i) => ga.text(`*${l}*`, { x: X0 - 8, y: ry[i] + rh / 2 - 7, role: "tick", size: 11.5, anchor: "end", color: "var(--ink-2)", at, anim: "fade" }));
      if (m.groups) groups.forEach((g, k) => {
        const i0 = groups.slice(0, k).reduce((a, b) => a + b.n, 0), ya = ry[i0], yb = ry[i0 + g.n - 1] + rh;
        ch.upText(g.label, m.groupX ?? X0 - 70, yb, { role: "axis", size: 13 });
        ga.raw(`<path d="M${(m.groupX ?? X0 - 70) + 10} ${ya + 2}V${yb - 2}" stroke="var(--rule)" stroke-width="1.5"/>`, { at, anim: "fade" });
      });
      let ay = ry[nr - 1] + rh + 6;
      for (const a of m.annot || []) {
        ga.raw(a.colors.map((c, j) => `<rect x="${g1(X0 + j * cw + 1)}" y="${ay}" width="${g1(cw - 2)}" height="10" fill="${c}"/>`).join(""), { at, anim: "fade" });
        ga.text(a.label, { x: X1 + 10, y: ay - 2, role: "tick", size: 11.5, at, anim: "fade" });
        ay += 14;
      }
      (m.colLabels || []).forEach((l, j) => ch.upText(l, X0 + (j + 0.5) * cw, ay + 4, { size: 11, hang: true }));
      return { rowY: ry, rh, cw, bottom: ay };
    };

    // ---- embeddings (20) ----------------------------------------------------------
    // Build with axes: "" and no ticks: an embedding's coordinates mean nothing.
    // Point cloud. pts: [[x, y, k]]; k indexes `colors`, and a k of null or -1 (or a
    // missing colour) is context grey, drawn first so coloured points sit on top.
    // Points carry no ring (they are too many); m.r radius (default 2), m.opacity
    // (default .8). m.ring gives each point a 1px paper ring (sparse clouds and
    // magnified insets). The cloud is clipped to the plot area.
    ch.cloud = (pts, colors = [], m = {}) => {
      const r = m.r || 2, op = m.opacity ?? 0.8;
      const col = (k) => (k === null || k === undefined || k < 0 ? null : colors[k] || null);
      const back = pts.filter((p) => !col(p[2])), front = pts.filter((p) => col(p[2]));
      let s = "";
      for (const p of [...back, ...front]) {
        const c = col(p[2]) || m.context || "var(--context)", X = sx(p[0]).toFixed(1), Y = sy(p[1]).toFixed(1);
        if (m.ring) s += `<circle cx="${X}" cy="${Y}" r="${r + 1}" fill="var(--paper)"/>`;
        s += `<circle cx="${X}" cy="${Y}" r="${r}" fill="${c}" fill-opacity="${m.ring ? 1 : op}"/>`;
      }
      ga.raw(`<svg x="${X0}" y="${Y0}" width="${W}" height="${H}" viewBox="${X0} ${Y0} ${W} ${H}" overflow="hidden">${s}</svg>`, { at: m.at ?? mt, anim: "fade", t: 0.8 });
    };
    // Axis stub: two short 1.5px ink-2 arms with open heads at the plot's
    // bottom-left corner, named in the tick role ("UMAP 1", "UMAP 2"). It says which
    // projection this is without implying a scale.
    ch.stub = (m = {}) => {
      const L = m.len || 34, x = X0, y = Y1, h = 4;
      ga.raw(`<path d="M${x} ${y - L}V${y}H${x + L}M${x + L - h} ${y - h}L${x + L} ${y}L${x + L - h} ${y + h}M${x - h} ${y - L + h}L${x} ${y - L}L${x + h} ${y - L + h}" stroke="var(--ink-2)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, { at, anim: "fade" });
      ga.text(m.x || "UMAP 1", { x: x + L + 6, y: y - 8, role: "tick", size: 12, at, anim: "fade" });
      ga.text(m.y || "UMAP 2", { x, y: y - L - 20, role: "tick", size: 12, at, anim: "fade" });
    };
    // A 1px ink frame around the plot area: the edge of a magnified inset.
    ch.frame = (m = {}) => ga.raw(`<rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="none" stroke="${m.color || "var(--ink)"}" stroke-width="1"/>`, { at: m.at ?? at, anim: "fade" });
    // A region of the data, framed 1px ink: the source of an inset. Returns its
    // canvas box {x0, y0, x1, y1} for GA.leaders.
    ch.region = (xa, xb, ya, yb, m = {}) => {
      const b = { x0: sx(xa), x1: sx(xb), y0: sy(yb), y1: sy(ya) };
      ga.raw(`<rect x="${b.x0}" y="${b.y0}" width="${b.x1 - b.x0}" height="${b.y1 - b.y0}" fill="none" stroke="${m.color || "var(--ink)"}" stroke-width="1"/>`, { at: m.at ?? (mt === undefined ? undefined : mt + 0.8), anim: "fade" });
      return b;
    };
    // Callouts: named points labelled in a column at canvas x = m.x, one row per
    // item (m.pitch px apart, from m.y), ordered by the points' height so leaders
    // do not cross. Each named point gets a 1px ink ring; each leader is a 1px ink-2
    // line from the point to its label. items: [{x, y, label}] in data units.
    ch.callouts = (items, m) => {
      const pitch = m.pitch || 18, t = m.at ?? (mt === undefined ? undefined : mt + 1);
      const rows = [...items].sort((a, b) => sy(a.y) - sy(b.y));
      const y0 = m.y ?? (rows.reduce((a, r) => a + sy(r.y), 0) / rows.length - ((rows.length - 1) * pitch) / 2);
      let s = "";
      rows.forEach((r, i) => {
        const X = sx(r.x), Y = sy(r.y), ly = y0 + i * pitch;
        s += `<path d="M${X} ${Y}L${m.x - 4} ${ly}" stroke="var(--ink-2)" stroke-width="1" fill="none"/><circle cx="${X}" cy="${Y}" r="${m.r || 4}" fill="none" stroke="var(--ink)" stroke-width="1"/>`;
        ga.text(r.label, { x: m.x, y: ly - 8, role: "tick", size: 12, color: r.color || "var(--ink-2)", at: t, anim: "fade" });
      });
      ga.raw(s, { at: t, anim: "fade" });
    };

    ch.id = ++uid;
    return ch;
  };

  // Leaders from a source region to its inset: two straight 1px ink-2 lines
  // joining the facing corners of two canvas boxes {x0, y0, x1, y1}, so the eye
  // reads the inset as a magnified copy of the region.
  GA.leaders = (ga, a, b, m = {}) => {
    const acx = (a.x0 + a.x1) / 2, acy = (a.y0 + a.y1) / 2, bcx = (b.x0 + b.x1) / 2, bcy = (b.y0 + b.y1) / 2;
    const side = Math.abs(bcx - acx) >= Math.abs(bcy - acy);
    const [p1, p2, q1, q2] = side
      ? bcx > acx ? [[a.x1, a.y0], [a.x1, a.y1], [b.x0, b.y0], [b.x0, b.y1]] : [[a.x0, a.y0], [a.x0, a.y1], [b.x1, b.y0], [b.x1, b.y1]]
      : bcy > acy ? [[a.x0, a.y1], [a.x1, a.y1], [b.x0, b.y0], [b.x1, b.y0]] : [[a.x0, a.y0], [a.x1, a.y0], [b.x0, b.y1], [b.x1, b.y1]];
    return ga.raw(`<path d="M${p1}L${q1}M${p2}L${q2}" stroke="${m.color || "var(--ink-2)"}" stroke-width="1" fill="none"/>`, { at: m.at, anim: "fade" });
  };

  // Radial track stack (21): individuals around a circle, grouped into sectors,
  // with one ring per variable.
  //   const R = GA.radial(ga, { cx, cy, r, groups: [{label, n}], at });
  // r is the inner edge of the sector ring. Angles run clockwise from 12 o'clock;
  // an opening of `open` degrees at 12 o'clock holds the bar ring's scale, and
  // `gap` degrees separate sectors. Rings added with R.ring() stack inward from r.
  GA.radial = function (ga, o) {
    const { cx, cy, r } = o, at = o.at, mt = at === undefined ? undefined : at + 0.4;
    const gap = o.gap ?? 1.5, open = o.open ?? 8;
    const N = o.groups.reduce((a, g) => a + g.n, 0);
    const unit = (360 - open - gap * (o.groups.length - 1)) / N;
    const starts = [];
    let acc = 0;
    o.groups.forEach((g, k) => { starts.push(open / 2 + k * gap + acc * unit); acc += g.n; });
    const rad = (d) => (d * Math.PI) / 180;
    const pol = (rr, d) => [(cx + rr * Math.sin(rad(d))).toFixed(2), (cy - rr * Math.cos(rad(d))).toFixed(2)];
    const wedge = (r0, r1, a0, a1) => {
      const lg = a1 - a0 > 180 ? 1 : 0;
      return `M${pol(r1, a0)}A${r1} ${r1} 0 ${lg} 1 ${pol(r1, a1)}L${pol(r0, a1)}A${r0} ${r0} 0 ${lg} 0 ${pol(r0, a0)}Z`;
    };
    // angle span of individual q (0-based, in group order)
    const span = (q) => {
      let k = 0, c = 0;
      while (q >= c + o.groups[k].n) { c += o.groups[k].n; k++; }
      const a0 = starts[k] + (q - c) * unit;
      return [a0, a0 + unit];
    };
    const R = { N, pol, wedge, span, next: r - (o.ringGap ?? 2) };
    // Sector ring: m.depth px outward from r, alternating ink-2 and context so
    // neighbouring sectors part; names outside, at m.labelR.
    R.sectors = (m = {}) => {
      const d = m.depth || 5;
      let s = "";
      o.groups.forEach((g, k) => { s += `<path d="${wedge(r, r + d, starts[k], starts[k] + g.n * unit)}" fill="${k % 2 ? "var(--context)" : "var(--ink-2)"}"/>`; });
      ga.raw(s, { at, anim: "fade" });
      const lr = m.labelR || r + d + 10;
      o.groups.forEach((g, k) => {
        const a = starts[k] + (g.n * unit) / 2, [x, y] = pol(lr, a).map(Number);
        const sin = Math.sin(rad(a)), cos = Math.cos(rad(a));
        const anchor = Math.abs(sin) < 0.2 ? "middle" : sin > 0 ? "start" : "end";
        // hang below the ring at 6 o'clock, stand on it at 12, centre on it at 3 and 9
        ga.text(g.label, { x, y: y - 7.5 - 7.5 * cos, role: "tick", size: 12, anchor, at, anim: "fade" });
      });
    };
    // Bar ring: one bar per individual, outward from r0 = m.r0, m.depth px deep,
    // in context grey. The scale runs to the round number at or above the peak
    // (1, 2, 2.5, 5 × 10^k), labelled once on a short radial axis in the opening.
    R.bars = (values, m = {}) => {
      const r0 = m.r0, d = m.depth || 24, peak = Math.max(...values);
      const e = 10 ** Math.floor(Math.log10(peak)), top = [1, 2, 2.5, 5, 10].map((k) => k * e).find((v) => v >= peak);
      let s = "";
      values.forEach((v, q) => { if (v > 0) { const [a0, a1] = span(q); s += `<path d="${wedge(r0, r0 + (v / top) * d, a0, a1)}" fill="${m.color || "var(--context)"}"/>`; } });
      ga.raw(s, { at: m.at ?? mt, anim: "fade", t: 0.8 });
      const [ax, ay0] = pol(r0, 0).map(Number), ay1 = ay0 - d;
      ga.raw(`<path d="M${ax} ${ay0}V${ay1}M${ax} ${ay1}h5M${ax} ${ay0}h5" stroke="var(--ink-2)" stroke-width="1.5" fill="none"/>`, { at, anim: "fade" });
      ga.text(String(top), { x: ax + 9, y: ay1 - 8, role: "tick", size: 12, at, anim: "fade" });
      return top;
    };
    // Heat ring: one annular cell per individual, m.depth px deep, stacked inward
    // from the last ring with a 2px paper gap. values in m.domain map onto `ramp`;
    // 0 or null stays paper. Returns the ring's radii.
    R.ring = (values, ramp, m = {}) => {
      const d = m.depth || 12, r1 = R.next, r0 = r1 - d, [lo, hi] = m.domain || [0, Math.max(...values)];
      let s = "";
      values.forEach((v, q) => {
        if (!v) return;
        const [a0, a1] = span(q), f = hi > lo ? Math.max(0, Math.min(1, (v - lo) / (hi - lo))) : 1;
        s += `<path d="${wedge(r0, r1, a0, a1 + 0.02)}" fill="${ramp[Math.round(f * (ramp.length - 1))]}"/>`;
      });
      ga.raw(s, { at: m.at ?? mt, anim: "fade", t: 0.8 });
      R.next = r0 - (o.ringGap ?? 2);
      return { r0, r1 };
    };
    // Ring key: one row per ring, outside in: its ramp as a strip and its name,
    // at canvas (m.x, m.y); m.lo / m.hi label the strips' ends under the last row.
    R.key = (rows, m) => {
      const w = m.w || 72, pitch = m.pitch || 20;
      let s = "";
      rows.forEach((row, i) => {
        const y = m.y + i * pitch, n = row.ramp.length;
        row.ramp.forEach((c, j) => { s += `<rect x="${m.x + (j * w) / n}" y="${y + 4}" width="${w / n + 0.5}" height="8" fill="${c}"/>`; });
        ga.text(row.label, { x: m.x + w + 10, y, role: "tick", size: 12, at, anim: "fade" });
      });
      ga.raw(s, { at, anim: "fade" });
      const yb = m.y + rows.length * pitch - 2;
      if (m.lo) ga.text(m.lo, { x: m.x, y: yb, role: "tick", size: 12, at, anim: "fade" });
      if (m.hi) ga.text(m.hi, { x: m.x + w, y: yb, role: "tick", size: 12, anchor: "end", at, anim: "fade" });
    };
    return R;
  };

  // ---- glyphs (core/charts/README.md, *Glyphs*) ---------------------------------
  // One mark for one kind of event or state, the same everywhere in a figure.
  // Shape says the kind, fill the class, a ring the role, and a digit or letter
  // inside a count or a role. GA.glyph returns SVG markup centred on (x, y).
  //   kind: "circle" (a sample or measurement) | "diamond" (a procedure) |
  //         "square" (a swatch in keys and strips) | "tick" (death, an end)
  //   o: size (px, the glyph's side; default 11), fill, ring (colour), ringW,
  //      text (a digit or letter inside), textColor
  const g1 = (v) => +v.toFixed(1);
  GA.glyph = (kind, x, y, o = {}) => {
    const s = o.size || 11, h = s / 2, fill = o.fill || "var(--ink)";
    const edge = o.ring ? ` stroke="${o.ring}" stroke-width="${o.ringW || 1.5}"` : ` stroke="var(--paper)" stroke-width="1"`;
    let m;
    if (kind === "circle") m = `<circle cx="${g1(x)}" cy="${g1(y)}" r="${g1(h)}" fill="${fill}"${edge}/>`;
    else if (kind === "square") m = `<rect x="${g1(x - h)}" y="${g1(y - h)}" width="${s}" height="${s}" fill="${fill}"${edge}/>`;
    else if (kind === "diamond") { const k = h * 1.25; m = `<path d="M${g1(x)} ${g1(y - k)}L${g1(x + k)} ${g1(y)}L${g1(x)} ${g1(y + k)}L${g1(x - k)} ${g1(y)}Z" fill="${fill}"${edge}/>`; }
    else if (kind === "tick") m = `<path d="M${g1(x)} ${g1(y - h)}V${g1(y + h)}" stroke="${o.fill || "var(--ink)"}" stroke-width="1.5"/>`;
    if (o.text !== undefined) m += `<text x="${g1(x)}" y="${g1(y + s * 0.26)}" font-size="${g1(s * 0.72)}" font-weight="500" text-anchor="middle" style="fill:${o.textColor || "var(--paper)"}">${o.text}</text>`;
    return m;
  };
  // Glyph key: one row per glyph (drawn as it is used) and its name, at canvas
  // (x, y), `pitch` px apart, with an optional title above. rows: [{kind, label, ...glyph options}];
  // a row with bar: colour draws a short bar instead (treatment intervals), and one
  // with line: {color, width} a short line (a state of the follow-up line).
  GA.glyphKey = (ga, rows, o) => {
    const pitch = o.pitch || 20, at = o.at;
    let y = o.y, s = "";
    if (o.title) { ga.text(o.title, { x: o.x, y, role: "tick", color: "var(--muted)", at, anim: "fade" }); y += pitch; }
    for (const r of rows) {
      s += r.bar ? `<rect x="${o.x}" y="${y + 4}" width="16" height="8" fill="${r.bar}"/>`
        : r.line ? `<path d="M${o.x} ${y + 8}h16" stroke="${r.line.color}" stroke-width="${r.line.width}"/>`
        : GA.glyph(r.kind, o.x + 8, y + 8, r);
      ga.text(r.label, { x: o.x + 24, y, role: "tick", size: 12, at, anim: "fade" });
      y += pitch;
    }
    ga.raw(s, { at, anim: "fade" });
    return y;
  };

  // Clone tree (form 24): a phylogeny of subclones, root on a short stem at the
  // top, straight 1.5px ink-2 edges, nodes as glyphs. Leaves take equal slots
  // across w; a parent sits over the middle of its children; depth runs down h.
  // node: {id, fill, role: "P" | "M" | undefined, children: [...]}. A "P" node
  // (seeds from the primary) has a 2.5px ink ring and a P; an "M" node (seeds from
  // a metastasis) a 2.5px muted ring and an M. Returns {id: {x, y}}.
  GA.cloneTree = (ga, o) => {
    const r = o.r || 8, pos = {};
    const leaves = [], depthOf = [];
    const walk = (n, d) => { depthOf.push(d); if (!n.children || !n.children.length) leaves.push(n); else n.children.forEach((c) => walk(c, d + 1)); };
    walk(o.root, 0);
    const maxD = Math.max(...depthOf), dx = o.w / Math.max(1, leaves.length - 1), dy = o.h / Math.max(1, maxD);
    let li = 0;
    const place = (n, d) => {
      if (!n.children || !n.children.length) pos[n.id] = { x: o.x + (leaves.length === 1 ? o.w / 2 : li++ * dx), y: o.y + d * dy };
      else { n.children.forEach((c) => place(c, d + 1)); const xs = n.children.map((c) => pos[c.id].x); pos[n.id] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: o.y + d * dy }; }
    };
    place(o.root, 0);
    let edges = `<path d="M${pos[o.root.id].x} ${o.y - 22}V${o.y}" stroke="var(--ink-2)" stroke-width="1.5"/>`, nodes = "";
    const draw = (n) => {
      for (const c of n.children || []) { edges += `<path d="M${g1(pos[n.id].x)} ${g1(pos[n.id].y)}L${g1(pos[c.id].x)} ${g1(pos[c.id].y)}" stroke="var(--ink-2)" stroke-width="1.5"/>`; draw(c); }
      const p = pos[n.id];
      nodes += n.role
        ? GA.glyph("circle", p.x, p.y, { size: 2 * r, fill: n.fill, ring: n.role === "P" ? "var(--ink)" : "var(--muted)", ringW: 2.5, text: n.role, textColor: n.textColor || "var(--paper)" })
        : GA.glyph("circle", p.x, p.y, { size: 2 * r, fill: n.fill });
    };
    draw(o.root);
    ga.raw(edges, { at: o.at, anim: "fade", t: 0.5 });
    ga.raw(nodes, { at: o.at === undefined ? undefined : o.at + 0.2, anim: "fade", t: 0.5 });
    return pos;
  };

  // Routes (form 23): curved arrows between points on a body map, from a source
  // site to the site it seeded, in the seeding clone's colour. Each bows to the
  // left of its direction of travel by `bow` × its length, and stops `gap` px short
  // of the target so the target's dot stays whole. routes: [{from: {x, y}, to: {x, y}, color}]
  GA.routes = (ga, routes, o = {}) => {
    const bow = o.bow ?? 0.25, gap = o.gap ?? 8, L = 7;
    let s = "";
    for (const rt of routes) {
      const { from: a, to: b } = rt, dx = b.x - a.x, dy = b.y - a.y;
      const cx = (a.x + b.x) / 2 + dy * bow, cy = (a.y + b.y) / 2 - dx * bow;
      // stop short along the curve's end tangent (control point -> target)
      const tx = b.x - cx, ty = b.y - cy, tl = Math.hypot(tx, ty), ex = b.x - (tx / tl) * gap, ey = b.y - (ty / tl) * gap;
      const ang = Math.atan2(ey - cy, ex - cx), hx = (d) => ex + L * Math.cos(ang + d), hy = (d) => ey + L * Math.sin(ang + d);
      s += `<path d="M${g1(a.x)} ${g1(a.y)}Q${g1(cx)} ${g1(cy)} ${g1(ex)} ${g1(ey)}" fill="none" stroke="${rt.color || "var(--prussian)"}" stroke-width="2" stroke-linecap="round"/>`;
      s += `<path d="M${g1(hx(Math.PI - 0.5))} ${g1(hy(Math.PI - 0.5))}L${g1(ex)} ${g1(ey)}L${g1(hx(Math.PI + 0.5))} ${g1(hy(Math.PI + 0.5))}" fill="none" stroke="${rt.color || "var(--prussian)"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return ga.raw(s, { at: o.at, anim: "fade", t: 0.6 });
  };

  // Deterministic pseudo-random numbers for schematic data (mulberry32)
  GA.rng = (seed = 1) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();
