// Explanatory layer for the graphical abstract kit (see core/illustration.md).
//
//   const B = GA.bio(ga);
//   B.body({ cx, y, h });  B.bubbles(body, rows);  B.dial({...})   // needs kit/anatomy.js
//   B.cell({ cx, cy, r: 18, k: 1 });                 // nucleus + cytoplasm glyph, family colour k
//   const t = B.tissue({ cx, cy, w, h });            // tissue silhouette + spot lattice
//   B.spots(t, { at });  B.dials(t, (s) => p, { k, at })
//   B.zoom({ src: spot, cx, cy, R, cells, at });     // dotted leaders + inset that grows from its source
//   B.matrix({ x, y, rows, cols, cell, fill, rowGlyph, at });  B.brace({...})
//   B.math("θ_d", { x, y });  B.node({...});  B.plate({...});  B.note("…", { from, … })
//
// Everything that carries text goes through the kit, so the lint covers it.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const box = (x0, y0, x1, y1) => ({ x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
  const f1 = (v) => +v.toFixed(1);

  GA.bio = function (ga) {
    const B = {};
    const C = (k) => `var(--cell-${k})`, Cw = (k) => `var(--cell-${k}-wash)`;
    B.color = C;
    B.wash = Cw;

    // ---- math: italic Latin letters; Greek, digits and operators upright (Plex's italic
    // theta reads as a script theta); _x or _{xy} subscripts
    B.math = (str, o = {}) => {
      const size = o.size || GA.ROLE.math.size;
      const g = ga.wrap(o.at, o.anim || "in", o.t);
      const t = document.createElementNS(NS, "text");
      t.setAttribute("font-size", size);
      t.setAttribute("class", "t-math");
      t.setAttribute("text-anchor", o.anchor || "start");
      t.setAttribute("x", o.x);
      t.setAttribute("y", o.y + 0.78 * size);
      if (o.color) t.style.fill = o.color;
      g.appendChild(t);
      const span = (txt, sub) => {
        for (const ch of txt.match(/[A-Za-z]+|[^A-Za-z]+/g) || []) {
          const s = document.createElementNS(NS, "tspan");
          if (/[A-Za-z]/.test(ch)) s.setAttribute("class", "v");
          if (sub) s.setAttribute("font-size", f1(size * 0.7));
          s.textContent = ch;
          t.appendChild(s);
        }
      };
      const re = /_(\{[^}]*\}|.)/g;
      let last = 0, m, shifted = false;
      const shift = (on) => {
        // the next tspan carries the baseline move
        const s = document.createElementNS(NS, "tspan");
        s.setAttribute("dy", f1((on ? 0.26 : -0.26) * size));
        s.textContent = "​";
        t.appendChild(s);
        shifted = on;
      };
      while ((m = re.exec(str))) {
        if (m.index > last) { if (shifted) shift(false); span(str.slice(last, m.index)); }
        if (!shifted) shift(true);
        span(m[1].replace(/^\{|\}$/g, ""), true);
        last = re.lastIndex;
      }
      if (last < str.length) { if (shifted) shift(false); span(str.slice(last)); }
      const bb = t.getBBox();
      return ga.add("text", g, box(bb.x, o.y, bb.x + bb.width, Math.max(o.y + size * 1.05, bb.y + bb.height)), { lint: o.lint !== false, str });
    };

    // ---- cell: cytoplasm (family tint, 1.5px mark stroke) + offset nucleus (mark)
    // k: a family member (1-4), or "neutral" for cells whose type is not the point
    const cellMarkup = (cx, cy, r, k) => {
      const [m, w] = k === "neutral" ? ["var(--ink-2)", "var(--wash)"] : [C(k), Cw(k)];
      return `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${r}" fill="${w}" stroke="${m}" stroke-width="1.5"/>` +
        `<circle cx="${f1(cx + r * 0.1)}" cy="${f1(cy + r * 0.08)}" r="${f1(r * 0.5)}" fill="${m}"/>`;
    };
    B.cellMarkup = cellMarkup;
    B.cell = (o) => {
      const it = ga.raw(cellMarkup(o.cx, o.cy, o.r, o.k), { at: o.at, anim: o.anim || "pop", t: o.t });
      return Object.assign(it, { kind: "icon", name: `cell ${o.k}`, lint: o.lint !== false });
    };

    // ---- model systems, drawn neutral: an organoid (cells around a lumen) and a
    // cell-line monolayer (flattened cells on a dish line)
    B.organoid = (o) => {
      const n = o.n || 8, R = o.r, rc = R * Math.sin(Math.PI / n) * 0.88;
      let m = "";
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 2 * Math.PI - Math.PI / 2;
        m += cellMarkup(o.cx + (R - rc) * Math.cos(a), o.cy + (R - rc) * Math.sin(a), f1(rc), o.k || "neutral");
      }
      const it = ga.raw(m, { at: o.at, anim: o.anim || "pop", t: o.t });
      return Object.assign(it, { kind: "icon", name: "organoid", lint: o.lint !== false });
    };
    B.monolayer = (o) => {
      const n = o.n || 4, rx = o.w / (2 * n), ry = rx * 0.5, y = o.cy;
      let m = `<path d="M${f1(o.cx - o.w / 2 - 6)} ${f1(y + ry + 2)}H${f1(o.cx + o.w / 2 + 6)}" stroke="var(--ink-2)" stroke-width="1.5" stroke-linecap="round"/>`;
      for (let i = 0; i < n; i++) {
        const x = o.cx - o.w / 2 + rx * (2 * i + 1);
        m += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx - 0.8)}" ry="${f1(ry)}" fill="var(--wash)" stroke="var(--ink-2)" stroke-width="1.5"/><ellipse cx="${f1(x + rx * 0.08)}" cy="${f1(y + 0.5)}" rx="${f1(rx * 0.38)}" ry="${f1(ry * 0.5)}" fill="var(--ink-2)"/>`;
      }
      const it = ga.raw(m, { at: o.at, anim: o.anim || "pop", t: o.t });
      return Object.assign(it, { kind: "icon", name: "monolayer", lint: o.lint !== false });
    };

    // dissociated patient-derived cells: three loose cells
    B.cells = (o) => {
      const r = o.r || 7, m = [[-r * 1.15, r * 0.55], [r * 1.15, r * 0.55], [0, -r * 1.05]].map(([dx, dy]) => cellMarkup(o.cx + dx, o.cy + dy, r, "neutral")).join("");
      const it = ga.raw(m, { at: o.at, anim: o.anim || "pop", t: o.t });
      return Object.assign(it, { kind: "icon", name: "cells", lint: o.lint !== false });
    };
    // xenograft-derived cells: a cell beside a small mouse silhouette
    B.xenograft = (o) => {
      const k = (o.size || 30) / 30, x = o.cx - 15 * k, y = o.cy - 8 * k;
      const mouse = `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(k)})"><ellipse cx="14" cy="10" rx="9" ry="6" fill="var(--ink-2)"/><circle cx="24" cy="7" r="4.2" fill="var(--ink-2)"/><circle cx="23" cy="2.6" r="2.4" fill="var(--ink-2)"/><path d="M5 11C1 12 0 15 3 16" fill="none" stroke="var(--ink-2)" stroke-width="1.5" stroke-linecap="round"/></g>`;
      const it = ga.raw(mouse + cellMarkup(o.cx + 13 * k, o.cy + 7 * k, 6 * k, "neutral"), { at: o.at, anim: o.anim || "pop", t: o.t });
      return Object.assign(it, { kind: "icon", name: "xenograft", lint: o.lint !== false });
    };

    // ---- move: a group that travels into place from (--mx, --my) away
    // It fades in at its start position at `appear`, then moves at `at`.
    B.moving = (markup, o) => {
      const outer = ga.wrap(o.appear ?? o.at, "fade", 0.4);
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "a-move");
      g.style.cssText = `--d:${o.at}s;--t:${o.t || 0.9}s;--mx:${f1(o.dx)}px;--my:${f1(o.dy)}px`;
      g.innerHTML = markup;
      outer.appendChild(g);
      return outer;
    };

    // ---- tissue: two fused lobes (a coronal section), neutral fill, spot lattice
    // rho(x, y): 0 at a lobe's centre, 1 at its edge; used to lay out cell-type layers.
    B.tissue = (o) => {
      const { cx, cy, w, h } = o;
      const lobes = [-1, 1].map((s) => ({ x: cx + s * w * 0.235, y: cy, rx: w * 0.265, ry: h * 0.5 }));
      const rho = (x, y) => Math.min(...lobes.map((l) => Math.hypot((x - l.x) / l.rx, (y - l.y) / l.ry)));
      const ell = (l, k, attrs) => `<ellipse cx="${f1(l.x)}" cy="${f1(l.y)}" rx="${f1(l.rx * k)}" ry="${f1(l.ry * k)}" ${attrs}/>`;
      let m = lobes.map((l) => ell(l, 1, `fill="none" stroke="var(--context)" stroke-width="3"`)).join("");
      m += lobes.map((l) => ell(l, 1, `fill="var(--wash)"`)).join("");
      // a darker core, as in the section's inner layers: anatomy stays neutral
      if (o.core !== false) m += lobes.map((l) => ell(l, 0.5, `fill="var(--slate-200)" opacity=".7"`)).join("");
      const it = ga.raw(m, { at: o.at, anim: "fade", t: 0.5 });
      Object.assign(it, { kind: "icon", name: "tissue", lint: o.lint !== false });
      const pitch = o.pitch || 17, sr = o.spotR || pitch * 0.33, spots = [];
      const dy = pitch * Math.sqrt(3) / 2;
      for (let j = 0, y = cy - h / 2; y <= cy + h / 2; j++, y += dy)
        for (let x = cx - w / 2 + (j % 2 ? pitch / 2 : 0); x <= cx + w / 2; x += pitch) {
          const r0 = rho(x, y);
          // keep the ring (plus a margin) inside the silhouette
          if (Math.min(...lobes.map((l) => Math.hypot((x - l.x) / (l.rx - sr - 3), (y - l.y) / (l.ry - sr - 3)))) <= 1) spots.push({ x, y, rho: r0, r: sr });
        }
      return Object.assign(it, { spots, rho, lobes, spotR: sr });
    };

    // spot rings, arriving in a left-to-right wave of column bands
    B.spots = (t, o = {}) => {
      const bands = o.bands || 8, x0 = t.box.x0, bw = t.box.w / bands;
      for (let b = 0; b < bands; b++) {
        const ss = t.spots.filter((s) => Math.min(bands - 1, Math.floor((s.x - x0) / bw)) === b);
        if (!ss.length) continue;
        ga.raw(ss.map((s) => `<circle cx="${f1(s.x)}" cy="${f1(s.y)}" r="${f1(s.r)}" fill="var(--paper)" stroke="var(--context)" stroke-width="1.2"/>`).join(""), { at: o.at === undefined ? undefined : o.at + b * (o.stagger ?? 0.05), anim: "fade", t: 0.4 });
      }
    };

    // proportion dial in each spot: one family colour per map, wedge = share of that type
    B.dials = (t, p, o = {}) => {
      const x0 = t.box.x0;
      for (const s of t.spots) {
        const v = p(s);
        if (v < 0.04) continue;
        const r = s.r - 0.6, d = o.at === undefined ? null : o.at + ((s.x - x0) / t.box.w) * (o.spread ?? 0.6);
        const cls = d === null ? "" : ` class="a-sweep" style="--d:${d.toFixed(2)}s;--p:${v.toFixed(3)}"`;
        ga.raw(`<circle cx="${f1(s.x)}" cy="${f1(s.y)}" r="${f1(r / 2)}" fill="none" stroke="${C(o.k)}" stroke-width="${f1(r)}" pathLength="1" stroke-dasharray="${v.toFixed(3)} 1" transform="rotate(-90 ${f1(s.x)} ${f1(s.y)})"${cls}/>`, {});
      }
    };

    // ---- zoom: dotted tangent leaders from a source ring to a circular inset,
    // and the inset (with its contents) growing out of the source.
    B.zoom = (o) => {
      const { src, cx, cy, R } = o;
      const dx = cx - src.x, dy = cy - src.y, d = Math.hypot(dx, dy), v = [dx / d, dy / d];
      const a = Math.acos((src.r - R) / d);
      let lead = "";
      for (const s of [1, -1]) {
        const n = [v[0] * Math.cos(a) - s * v[1] * Math.sin(a), v[1] * Math.cos(a) + s * v[0] * Math.sin(a)];
        lead += `<path d="M${f1(src.x + src.r * n[0])} ${f1(src.y + src.r * n[1])}L${f1(cx + R * n[0])} ${f1(cy + R * n[1])}" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="1 4" stroke-linecap="round"/>`;
      }
      const at = o.at;
      ga.raw(`<circle cx="${f1(src.x)}" cy="${f1(src.y)}" r="${f1(src.r + 1)}" fill="none" stroke="var(--ink)" stroke-width="2"/>`, { at, anim: "pop", t: 0.4 });
      ga.raw(lead, { at: at === undefined ? undefined : at + 0.3, anim: "fade", t: 0.5 });
      const g = ga.wrap(at === undefined ? undefined : at + 0.3, "zoom", o.t || 0.9);
      g.style.setProperty("--zx", `${f1(-dx)}px`);
      g.style.setProperty("--zy", `${f1(-dy)}px`);
      g.innerHTML = `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${R}" fill="var(--wash)" stroke="var(--ink-2)" stroke-width="1.5"/>` +
        (o.cells || []).map(([x, y, r, k]) => cellMarkup(cx + x, cy + y, r, k)).join("");
      return ga.add("rect", g, box(cx - R, cy - R, cx + R, cy + R), { lint: o.lint !== false, name: "inset" });
    };

    // ---- matrix: hairline grid; optional fills, row glyphs; cells fill column by column
    B.matrix = (o) => {
      const { x, y, rows, cols } = o, c = o.cell || 16, W = cols * c, H = rows * c;
      let grid = `<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="var(--paper)"/>`;
      for (let i = 0; i <= rows; i++) grid += `<path d="M${x} ${y + i * c}h${W}" stroke="var(--rule)" stroke-width="1.5"/>`;
      for (let j = 0; j <= cols; j++) grid += `<path d="M${x + j * c} ${y}v${H}" stroke="var(--rule)" stroke-width="1.5"/>`;
      const it = ga.raw(grid, { at: o.at, anim: "fade", t: 0.4 });
      Object.assign(it, { kind: "rect", lint: o.lint !== false, box: box(x, y, x + W, y + H), cell: c });
      Object.assign(it, { l: x, r: x + W, t: y, b: y + H, cx: x + W / 2, cy: y + H / 2, w: W, h: H });
      it.rowY = (i) => y + (i + 0.5) * c;
      if (o.rowGlyph) for (let i = 0; i < rows; i++) ga.raw(o.rowGlyph(i, x - c * 0.5 - 6, it.rowY(i)), { at: o.at === undefined ? undefined : o.at + 0.1 + i * 0.06, anim: "pop" });
      if (o.fill) {
        const fAt = o.fillAt ?? (o.at === undefined ? undefined : o.at + 0.5);
        for (let j = 0; j < cols; j++) {
          let m = "";
          for (let i = 0; i < rows; i++) {
            const f = o.fill(i, j);
            if (f) m += `<rect x="${x + j * c + 1.5}" y="${y + i * c + 1.5}" width="${c - 3}" height="${c - 3}" fill="${f.color}"${f.opacity !== undefined ? ` opacity="${f.opacity}"` : ""}/>`;
          }
          if (m) ga.raw(m, { at: fAt === undefined ? undefined : fAt + j * (o.stagger ?? 0.04), anim: "fade", t: 0.3 });
        }
      }
      return it;
    };

    // ---- brace along a segment; side "left" (opens right) or "bottom" (opens up)
    B.brace = (o) => {
      const h = o.depth || 7, { side = "bottom" } = o;
      let d;
      if (side === "bottom") {
        const { x0, x1, y } = o, xm = (x0 + x1) / 2;
        d = `M${x0} ${y}Q${x0} ${y + h} ${x0 + h} ${y + h}H${xm - h}Q${xm} ${y + h} ${xm} ${y + 2 * h}Q${xm} ${y + h} ${xm + h} ${y + h}H${x1 - h}Q${x1} ${y + h} ${x1} ${y}`;
      } else {
        const { y0, y1, x } = o, ym = (y0 + y1) / 2;
        d = `M${x} ${y0}Q${x - h} ${y0} ${x - h} ${y0 + h}V${ym - h}Q${x - h} ${ym} ${x - 2 * h} ${ym}Q${x - h} ${ym} ${x - h} ${ym + h}V${y1 - h}Q${x - h} ${y1} ${x} ${y1}`;
      }
      ga.raw(`<path d="${d}" fill="none" stroke="var(--ink-2)" stroke-width="1.5" stroke-linejoin="round"/>`, { at: o.at, anim: "fade", t: 0.4 });
      if (!o.label) return null;
      const size = GA.ROLE.math.size;
      return side === "bottom"
        ? B.math(o.label, { x: (o.x0 + o.x1) / 2, y: o.y + 2 * h + 4, anchor: "middle", at: o.at })
        : B.math(o.label, { x: o.x - 2 * h - 6, y: (o.y0 + o.y1) / 2 - size * 0.55, anchor: "end", at: o.at });
    };

    // ---- graphical-model notation: nodes (observed = shaded) and plates
    B.node = (o) => {
      const r = o.r || 26;
      const it = ga.raw(`<circle cx="${o.cx}" cy="${o.cy}" r="${r}" fill="${o.observed ? "var(--rule)" : "var(--paper)"}" stroke="var(--ink-2)" stroke-width="1.5"/>`, { at: o.at, anim: "pop" });
      Object.assign(it, { kind: "rect", lint: true, box: box(o.cx - r, o.cy - r, o.cx + r, o.cy + r) });
      Object.assign(it, { l: o.cx - r, r: o.cx + r, t: o.cy - r, b: o.cy + r, cx: o.cx, cy: o.cy, w: 2 * r, h: 2 * r });
      const size = o.size || 20;
      B.math(o.label, { x: o.cx - (o.dx || 0), y: o.cy - size * 0.62, anchor: "middle", size, at: o.at === undefined ? undefined : o.at + 0.15 });
      return it;
    };
    B.plate = (o) => {
      ga.raw(`<rect x="${o.x0}" y="${o.y0}" width="${o.x1 - o.x0}" height="${o.y1 - o.y0}" rx="4" fill="none" stroke="var(--ink-2)" stroke-width="1.5"/>`, { at: o.at, anim: "fade", t: 0.5 });
      if (o.label) B.math(o.label, { x: o.x0 + 8, y: o.y0 + 6, size: 14, color: "var(--ink-2)", at: o.at });
    };

    // ---- body map: a neutral anterior torso with named sites ------------------------
    // The anatomy is the Expression Atlas anatomogram (kit/anatomy.js, CC BY 4.0),
    // cropped from the head to the upper thighs. Drawn like tissue: wash silhouette,
    // context outline, organs in rule, so colour stays free for the findings placed
    // on it. The patient's right is the viewer's left. { cx, y (top of the crop),
    // h (the crop's height), at }. body.site(name) returns canvas {x, y}; SITES
    // lists the names. Needs kit/anatomy.js loaded before this file.
    const CROP = [22, 0, 62, 104]; // x, y, w, h in anatomogram units
    const SITES = {
      brain: [53, 8], thyroid: [53, 25], "lymph node": [53, 36.5], "lung R": [45.5, 45], "lung L": [60.5, 45],
      pleura: [66.5, 51], cardiac: [53.5, 47.5], bone: [31, 41], breast: [64, 38], liver: [46, 62],
      gastric: [56, 63.5], spleen: [65, 62.5], adrenal: [60.5, 56], kidney: [61.5, 66.5], "small bowel": [53, 80],
      "large bowel": [63.5, 82], peritoneum: [43, 81], bladder: [53, 90.5], "soft tissue": [66, 98], subcutaneous: [37.5, 74],
    };
    B.SITES = Object.keys(SITES);
    B.body = (o) => {
      const A = window.GA_ANATOMY, [cx0, cy0, cw, chh] = CROP, k = o.h / chh;
      const X = (u) => o.cx + (u - (cx0 + cw / 2)) * k, Y = (v) => o.y + (v - cy0) * k;
      const id = `body-${Math.round(o.cx)}-${Math.round(o.y)}`;
      const organs = Object.values(A.organs).join("");
      const m = `<defs><clipPath id="${id}"><rect x="${cx0}" y="${cy0}" width="${cw}" height="${chh}"/></clipPath></defs>` +
        `<g transform="translate(${f1(X(0))} ${f1(Y(0))}) scale(${k.toFixed(4)})" clip-path="url(#${id})">` +
        `<g fill="var(--wash)">${A.silhouette}</g>` +
        `<g fill="var(--rule)" stroke="var(--wash)" stroke-width="${(1.2 / k).toFixed(3)}" stroke-linejoin="round">${organs}</g>` +
        `<g fill="var(--context)">${A.outline}</g></g>`;
      const it = ga.raw(m, { at: o.at, anim: "fade", t: 0.5 });
      Object.assign(it, { kind: "icon", name: "body", lint: o.lint ?? false });
      it.site = (name) => { const s = SITES[name]; if (!s) throw new Error(`unknown site: ${name}`); return { x: X(s[0]), y: Y(s[1]) }; };
      it.left = X(cx0); it.right = X(cx0 + cw); it.bottom = Y(cy0 + chh); it.mid = X(53);
      return it;
    };
    // Site bubbles (form 22): one circle per site, AREA proportional to n, the count
    // inside in paper (beside it when the circle is too small to hold it), and the
    // site's name in a column left or right of the body, joined by a 1px ink-2 leader.
    // rows: [{site, n, color, label, side: "l" | "r"}]; o.rmax is the radius at o.max.
    B.bubbles = (body, rows, o = {}) => {
      const max = o.max || Math.max(...rows.map((r) => r.n)), rmax = o.rmax || 34, gapL = o.labelGap || 22;
      const R = (n) => rmax * Math.sqrt(n / max);
      const placed = rows.map((r) => ({ ...r, ...body.site(r.site), r: R(r.n) })).sort((a, b) => b.r - a.r);
      let s = "";
      for (const p of placed) s += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(p.r + 1)}" fill="var(--paper)"/><circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(p.r)}" fill="${p.color || "var(--ink-2)"}"/>`;
      ga.raw(s, { at: o.at, anim: "pop", t: 0.5 });
      for (const p of placed) if (p.r >= 8) ga.raw(`<text x="${f1(p.x)}" y="${f1(p.y + 4.5)}" font-size="${p.r >= 14 ? 13 : 11}" text-anchor="middle" class="t-tick" style="fill:${p.textColor || "var(--paper)"} !important">${p.n}</text>`, { at: o.at, anim: "fade" });
      // name columns: ordered by height, pushed apart to one line pitch
      const pitch = o.pitch || 20, t = o.at === undefined ? undefined : o.at + 0.3;
      for (const side of ["l", "r"]) {
        const col = placed.filter((p) => (p.side || (p.x < body.mid ? "l" : "r")) === side).sort((a, b) => a.y - b.y);
        let yPrev = -Infinity;
        const lx = side === "l" ? body.left - gapL : body.right + gapL;
        let lead = "";
        for (const p of col) {
          const ly = Math.max(p.y, yPrev + pitch);
          yPrev = ly;
          const str = (p.label || p.site) + (p.r < 8 ? ` (${p.n})` : "");
          ga.text(str, { x: lx, y: ly - 8, role: "tick", size: 13, anchor: side === "l" ? "end" : "start", color: "var(--ink-2)", at: t, anim: "fade" });
          const ang = Math.atan2(ly - p.y, lx - p.x), ex = p.x + (p.r + 1) * Math.cos(ang), ey = p.y + (p.r + 1) * Math.sin(ang);
          lead += `<path d="M${f1(ex)} ${f1(ey)}L${f1(lx + (side === "l" ? 4 : -4))} ${f1(ly)}" stroke="var(--ink-2)" stroke-width="1" fill="none"/>`;
        }
        ga.raw(lead, { at: t, anim: "fade" });
      }
    };
    // Site dial (form 22, regions): a disc on the body for a region of sites, its
    // outer ring (4px) in the region's colour, a wedge for one share filled
    // clockwise from 12 o'clock in the share's colour, and the two counts inside.
    // { x, y, r, share: [k, n], ring, color, at }
    B.dial = (o) => {
      const { x, y, r } = o, [k, n] = o.share, p = k / n, a = 2 * Math.PI * p;
      const ex = x + r * Math.sin(a), ey = y - r * Math.cos(a);
      let s = `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="none" stroke="${o.ring}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="${r}" fill="var(--paper)"/>`;
      s += `<path d="M${x} ${y}V${y - r}A${r} ${r} 0 ${p > 0.5 ? 1 : 0} 1 ${f1(ex)} ${f1(ey)}Z" fill="${o.color}"/>`;
      const mid = (f) => [x + r * 0.55 * Math.sin(2 * Math.PI * f), y - r * 0.55 * Math.cos(2 * Math.PI * f) + 4.5];
      const [ax, ay] = mid(p / 2), [bx, by] = mid(0.5 + p / 2);
      s += `<text x="${f1(ax)}" y="${f1(ay)}" font-size="12" text-anchor="middle" class="t-tick" style="fill:var(--paper) !important">${k}</text><text x="${f1(bx)}" y="${f1(by)}" font-size="12" text-anchor="middle" class="t-tick" style="fill:var(--ink) !important">${n - k}</text>`;
      return ga.raw(s, { at: o.at, anim: "pop", t: 0.5 });
    };

    // ---- note: a muted callout that explains a mark, with a thin leader from the mark
    B.note = (str, o) => {
      const t = ga.text(str, { x: o.x, y: o.y, w: o.w, role: "note", anchor: o.anchor || "middle", at: o.at });
      if (o.from) ga.connect(o.from, t, { from: o.fromSide || "b", to: o.toSide || "t", color: "var(--muted)", width: 1.5, headSize: 6, gap: 6, at: o.at === undefined ? undefined : o.at - 0.25, t: 0.35 });
      return t;
    };

    return B;
  };
})();
