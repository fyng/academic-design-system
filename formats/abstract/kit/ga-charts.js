// Chart layer for the graphical abstract kit (see core/charts.md).
//
//   const ch = GA.chart(ga, { x, y, w, h, xd: [0, 1], yd: [0, 1], xTitle, yTitle, at });
//   ch.line([[0, 0], [1, 1]], { color: "var(--accent)" });
//
// x, y, w, h place the PLOT AREA on the canvas; tick labels and titles sit
// outside it. Every piece of text goes through ga.text(), so the kit's lint
// sees chart labels like any other label. Data marks are drawn with ga.raw().
//
// House conventions baked in (charts.md explains each):
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
    // Direct label at a data point. dx/dy offset in px; anchor as ga.text
    ch.label = (str, x, y, m = {}) => ga.text(str, { x: sx(x) + (m.dx || 0), y: sy(y) + (m.dy ?? -9), role: m.role || "cap", anchor: m.anchor || "start", color: m.color, w: m.w, at: m.at ?? (mt === undefined ? undefined : mt + 1.2), anim: "fade" });

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
    ch.dotKey = (rows, m) => rows.reduce((kx, r) => {
      ga.raw(`<circle cx="${kx + 6}" cy="${m.y + 8}" r="5.5" fill="${r.color}"/>`, { at: m.at ?? at, anim: "fade" });
      return ga.text(r.label, { x: kx + 18, y: m.y, role: "tick", at: m.at ?? at, anim: "fade" }).r + 18;
    }, m.x);
    ch.id = ++uid;
    return ch;
  };

  // Deterministic pseudo-random numbers for schematic data (mulberry32)
  GA.rng = (seed = 1) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();
