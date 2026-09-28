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
    const axes = o.axes || "xy";
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
    // Bars are <= 22px, rounded at the data end only, and grow from the baseline.
    ch.hbars = (rows, m = {}) => {
      const band = H / rows.length, th = Math.min(m.thickness || 18, band - 6);
      rows.forEach((r, i) => {
        const cy = Y0 + band * (i + 0.5), x = sx(0), w = sx(r.v) - x;
        const t = m.at ?? (mt === undefined ? undefined : mt + i * 0.08);
        const rr = Math.min(4, w);
        ga.raw(`<path d="M${x} ${cy - th / 2}h${w - rr}a${rr} ${rr} 0 0 1 ${rr} ${rr}v${th - 2 * rr}a${rr} ${rr} 0 0 1 ${-rr} ${rr}h${-(w - rr)}Z" fill="${r.color || m.color || "var(--context)"}"/>`, { at: t, anim: "grow", t: 0.7 });
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
    // Cells separated by a 2px paper gap; labels optional.
    ch.heat = (matrix, ramp, m = {}) => {
      const [lo, hi] = m.domain || [-1, 1];
      const nr = matrix.length, nc = matrix[0].length, cw = W / nc, rh = H / nr;
      const pick = (v) => ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(((v - lo) / (hi - lo)) * (ramp.length - 1))))];
      let s = "";
      matrix.forEach((row, i) => row.forEach((v, j) => (s += `<rect x="${X0 + j * cw + 1}" y="${Y0 + i * rh + 1}" width="${cw - 2}" height="${rh - 2}" rx="2" fill="${pick(v)}"/>`)));
      ga.raw(s, { at: m.at ?? mt, anim: "fade", t: 0.8 });
      (m.rowLabels || []).forEach((l, i) => ga.text(l, { x: X0 - 10, y: Y0 + (i + 0.5) * rh - 8, role: "label", size: 14, anchor: "end", at, anim: "fade" }));
      (m.colLabels || []).forEach((l, j) => ga.text(l, { x: X0 + (j + 0.5) * cw, y: Y1 + 8, role: "tick", anchor: "middle", at, anim: "fade" }));
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
