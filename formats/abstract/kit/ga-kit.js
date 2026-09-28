// Graphical abstract kit.
//
// A small builder over SVG that owns the fiddly parts of a figure:
//   - a layout grid (margins, columns, dividers) shared by every abstract
//   - text blocks placed by their TOP edge and wrapped to a width, with
//     inline markup: *italic*  {accent colour}
//   - icons from kit/icons.js, sized and coloured by role
//   - connect(a, b): arrows attached to the edges of two items, with the head
//     drawn separately so it appears when the line finishes drawing
//   - lint(): after layout, every text, icon and arrow is checked for overlap,
//     divider crossings and margin overflow. render.cjs refuses to render a
//     figure that fails, and ?debug outlines every measured box.
//
// Usage:  GA.build({ duration: 16, poster: 15 }, (ga) => { ga.text(...); ... });
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const W = 1600, H = 900, MARGIN = 64;

  // Type roles: size (px in the 1600x900 canvas) and line height.
  const ROLE = {
    kicker: { size: 13, lh: 1.3 },
    title: { size: 38, lh: 1.16 },
    step: { size: 13, lh: 1.3 },
    head: { size: 28, lh: 1.2 },
    label: { size: 17, lh: 1.4 },
    body: { size: 17, lh: 1.42 },
    cap: { size: 15, lh: 1.35 },
    tag: { size: 13, lh: 1.3 },
    take: { size: 28, lh: 1.3 },
    axis: { size: 14, lh: 1.3 }, // chart axis titles
    tick: { size: 13, lh: 1.2 }, //  chart tick labels
    note: { size: 14, lh: 1.3 }, //  callouts that explain a mark (GA.bio note)
    math: { size: 17, lh: 1.3 }, //  variables: italic letters, upright digits (GA.bio math)
  };
  const ASCENT = 0.78; // first baseline sits this fraction of the size below the top

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  const box = (x0, y0, x1, y1) => ({ x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
  const hit = (a, b, pad = 0) => a.x0 < b.x1 - pad && b.x0 < a.x1 - pad && a.y0 < b.y1 - pad && b.y0 < a.y1 - pad;
  const inside = (a, b) => a.x0 >= b.x0 - 0.5 && a.x1 <= b.x1 + 0.5 && a.y0 >= b.y0 - 0.5 && a.y1 <= b.y1 + 0.5;

  // "*em* and {accent} text" -> [{text, em, acc}]
  function parse(str) {
    const runs = [];
    const re = /(\*[^*]+\*|\{[^}]+\})/g;
    let last = 0, m;
    while ((m = re.exec(str))) {
      if (m.index > last) runs.push({ text: str.slice(last, m.index) });
      const t = m[0];
      const inner = t.slice(1, -1);
      if (t[0] === "*") runs.push({ text: inner, em: true });
      else if (/^\*.*\*$/.test(inner)) runs.push({ text: inner.slice(1, -1), acc: true, em: true }); // {*accent italic*}
      else runs.push({ text: inner, acc: true });
      last = re.lastIndex;
    }
    if (last < str.length) runs.push({ text: str.slice(last) });
    // explode into words, keeping style; "\n" becomes a hard break
    const words = [];
    for (const r of runs)
      for (const part of r.text.split(/(\s+)/)) {
        if (!part) continue;
        if (/\n/.test(part)) words.push({ br: true });
        else if (!/^\s+$/.test(part)) words.push({ ...r, text: part });
      }
    return words;
  }

  class Kit {
    constructor(opts) {
      this.opts = opts;
      this.items = [];
      this.dividers = [];
      this.duration = opts.duration || 16;
      this.poster = opts.poster ?? this.duration - 1;
      this.svg = el("svg", { class: "ga", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-labelledby": "ga-t ga-d", style: `--dur:${this.duration}s` });
      el("title", { id: "ga-t" }, this.svg).textContent = opts.title || "";
      el("desc", { id: "ga-d" }, this.svg).textContent = opts.desc || "";
      this.stage = el("g", { class: "ga-stage" }, this.svg);
      document.body.appendChild(this.svg);
      this.W = W; this.H = H; this.M = MARGIN;
    }

    // ---- structure -------------------------------------------------------
    // n equal columns between the margins; returns [{x0, x1, w, cx}]
    columns(n, { gutter = 80, top = 200, bottom = 760, dividers = true } = {}) {
      const w = (W - 2 * MARGIN - gutter * (n - 1)) / n;
      const cols = [];
      for (let i = 0; i < n; i++) {
        const x0 = MARGIN + i * (w + gutter);
        cols.push({ x0, x1: x0 + w, w, cx: x0 + w / 2, top, bottom });
        if (dividers && i > 0) this.vrule(x0 - gutter / 2, top, bottom);
      }
      return cols;
    }
    hrule(y, x0 = MARGIN, x1 = W - MARGIN) { el("line", { x1: x0, y1: y, x2: x1, y2: y, class: "hair" }, this.stage); }
    vrule(x, y0, y1) { el("line", { x1: x, y1: y0, x2: x, y2: y1, class: "hair" }, this.stage); this.dividers.push({ x, y0, y1 }); }

    wrap(at, anim, t) {
      if (at === undefined || at === null) return el("g", {}, this.stage);
      return el("g", { class: `a-${anim}`, style: `--d:${at}s` + (t ? `;--t:${t}s` : "") }, this.stage);
    }
    add(kind, node, b, extra = {}) {
      const it = { kind, node, box: b, ...extra };
      // anchors, for connect() and for placing things relative to each other
      Object.assign(it, { l: b.x0, r: b.x1, t: b.y0, b: b.y1, cx: b.cx, cy: b.cy, w: b.w, h: b.h });
      this.items.push(it);
      return it;
    }

    // ---- text --------------------------------------------------------------
    // Top-left placed text block. opts: x, y (top), w (wrap width), role,
    // size, anchor ('start'|'middle'|'end'), color, weight, at, anim, lint
    text(str, o = {}) {
      const role = ROLE[o.role || "body"];
      const size = o.size || role.size, lh = (o.lh || role.lh) * size;
      const g = this.wrap(o.at, o.anim || "in", o.t);
      const anchor = o.anchor || "start";
      const lines = [];
      let cur = null;
      const newLine = () => {
        const t = el("text", { x: o.x, y: o.y + ASCENT * size + lines.length * lh, "font-size": size, "text-anchor": anchor, class: `t-${o.role || "body"}` }, g);
        if (o.weight) t.setAttribute("font-weight", o.weight);
        if (o.color) t.style.setProperty("fill", o.color, "important");
        lines.push(t);
        return t;
      };
      cur = newLine();
      for (const w of parse(str)) {
        if (w.br) { cur = newLine(); continue; }
        const span = el("tspan", { class: [w.em && "em", w.acc && "acc"].filter(Boolean).join(" ") || null }, cur);
        // no space before closing punctuation that follows a styled run ("{*…*}.")
        span.textContent = (cur.childNodes.length > 1 && !/^[.,;:!?)]/.test(w.text) ? " " : "") + w.text;
        if (o.w && cur.childNodes.length > 1 && cur.getComputedTextLength() > o.w) {
          span.remove();
          cur = newLine();
          const s2 = el("tspan", { class: span.getAttribute("class") }, cur);
          s2.textContent = w.text;
        }
      }
      const widths = lines.map((l) => l.getComputedTextLength());
      const wmax = Math.max(...widths);
      const x0 = anchor === "start" ? o.x : anchor === "middle" ? o.x - wmax / 2 : o.x - wmax;
      const b = box(x0, o.y, x0 + wmax, o.y + (lines.length - 1) * lh + size * 1.05);
      if (o.w && wmax > o.w + 0.5) console.warn("word wider than wrap width:", str);
      return this.add("text", g, b, { lint: o.lint !== false, lines: lines.length, str });
    }

    // Vertical flow: each call places below the previous item.
    stack(x, y, { gap = 10, w } = {}) {
      const kit = this;
      const s = {
        y,
        text(str, o = {}) { const it = kit.text(str, { x, y: s.y, w, ...o }); s.y = it.b + (o.gap ?? gap); return it; },
        space(dy) { s.y += dy; return s; },
      };
      return s;
    }

    // ---- shapes & icons -------------------------------------------------------
    icon(name, o = {}) {
      const size = o.size || 48;
      const g = this.wrap(o.at, o.anim || "pop", o.t);
      const inner = el("g", { transform: `translate(${o.cx - size / 2} ${o.cy - size / 2}) scale(${size / 48})` }, g);
      inner.style.color = o.color || "var(--ink)";
      inner.innerHTML = window.GA_ICONS[name];
      const bb = inner.getBBox(), k = size / 48;
      const b = box(o.cx - size / 2 + bb.x * k, o.cy - size / 2 + bb.y * k, o.cx - size / 2 + (bb.x + bb.width) * k, o.cy - size / 2 + (bb.y + bb.height) * k);
      return this.add("icon", g, b, { lint: o.lint !== false, name });
    }

    rect(o) {
      const g = this.wrap(o.at, o.anim || "pop", o.t);
      el("rect", { x: o.x, y: o.y, width: o.w, height: o.h, rx: o.r ?? 12, fill: o.fill || "var(--wash)", stroke: o.stroke, "stroke-width": o.strokeWidth }, g);
      return this.add("rect", g, box(o.x, o.y, o.x + o.w, o.y + o.h), { lint: o.lint !== false });
    }

    // Horizontal bar growing from the left (for small quantitative marks)
    bar(o) {
      const g = this.wrap(o.at, "grow", o.t);
      el("rect", { x: o.x, y: o.y, width: Math.max(o.w, 2), height: o.h || 14, rx: 3, fill: o.fill }, g);
      return this.add("bar", g, box(o.x, o.y, o.x + o.w, o.y + (o.h || 14)), { lint: false });
    }

    // Rounded label whose width follows its text. cx/cy centre, or x/y top-left.
    pill(str, o = {}) {
      const role = ROLE[o.role || "cap"], size = o.size || role.size;
      const padX = o.padX ?? 16, h = o.h ?? Math.round(size * 2);
      const g = this.wrap(o.at, o.anim || "pop", o.t);
      const probe = el("text", { "font-size": size, class: `t-${o.role || "cap"}` }, g);
      probe.textContent = str;
      const tw = probe.getComputedTextLength();
      const w = o.w || tw + 2 * padX;
      const x = o.cx !== undefined ? o.cx - w / 2 : o.x;
      const y = o.cy !== undefined ? o.cy - h / 2 : o.y;
      g.insertBefore(el("rect", { x, y, width: w, height: h, rx: h / 2, fill: o.fill || "var(--wash)" }), probe);
      Object.entries({ x: x + w / 2, y: y + h / 2 + size * 0.35, "text-anchor": "middle" }).forEach(([k, v]) => probe.setAttribute(k, v));
      if (o.color) probe.style.setProperty("fill", o.color, "important");
      if (o.weight) probe.setAttribute("font-weight", o.weight);
      return this.add("rect", g, box(x, y, x + w, y + h), { lint: o.lint !== false, str });
    }

    // Raw SVG markup in a wrapper (for one-off marks); give it a box to lint.
    raw(markup, o = {}) {
      const g = this.wrap(o.at, o.anim || "fade", o.t);
      g.innerHTML = markup;
      const bb = g.getBBox();
      return this.add(o.kind || "raw", g, o.box || box(bb.x, bb.y, bb.x + bb.width, bb.y + bb.height), { lint: o.lint ?? false });
    }

    // A box around several items (not drawn, not linted): for connect() targets.
    union(...its) {
      const b = box(Math.min(...its.map((i) => i.box.x0)), Math.min(...its.map((i) => i.box.y0)), Math.max(...its.map((i) => i.box.x1)), Math.max(...its.map((i) => i.box.y1)));
      return { kind: "group", box: b, l: b.x0, r: b.x1, t: b.y0, b: b.y1, cx: b.cx, cy: b.cy, w: b.w, h: b.h, members: its };
    }

    // ---- arrows -------------------------------------------------------------
    // Attach an arrow from a side of item a to a side of item b.
    //   from/to: 'r' | 'l' | 't' | 'b'; fromAt/toAt: 0..1 along that side (default .5)
    //   a or b may also be a point {x, y}.
    connect(a, b, o = {}) {
      const gap = o.gap ?? 10;
      const pt = (it, side, f = 0.5) => {
        if (!it.box) return { x: it.x, y: it.y, dir: side === "l" ? [-1, 0] : side === "r" ? [1, 0] : side === "t" ? [0, -1] : [0, 1] };
        const B = it.box;
        if (side === "r") return { x: B.x1 + gap, y: B.y0 + f * B.h, dir: [1, 0] };
        if (side === "l") return { x: B.x0 - gap, y: B.y0 + f * B.h, dir: [-1, 0] };
        if (side === "t") return { x: B.x0 + f * B.w, y: B.y0 - gap, dir: [0, -1] };
        return { x: B.x0 + f * B.w, y: B.y1 + gap, dir: [0, 1] };
      };
      const s = pt(a, o.from || "r", o.fromAt), e = pt(b, o.to || "l", o.toAt);
      // Side-by-side items get a straight arrow: when the two boxes overlap across
      // the arrow's direction and no attachment points were given, run it along
      // the middle of the overlap instead of curving between the two centres.
      const horiz = /[lr]/.test(o.from || "r") && /[lr]/.test(o.to || "l");
      if (a.box && b.box && o.fromAt === undefined && o.toAt === undefined && !o.bend) {
        const [lo, hi] = horiz ? [Math.max(a.box.y0, b.box.y0), Math.min(a.box.y1, b.box.y1)] : [Math.max(a.box.x0, b.box.x0), Math.min(a.box.x1, b.box.x1)];
        if (hi - lo > 8) {
          const m = (lo + hi) / 2;
          if (horiz) s.y = e.y = m; else s.x = e.x = m;
          o = { ...o, straight: true };
        }
      }
      const dist = Math.hypot(e.x - s.x, e.y - s.y);
      const k = o.straight ? 0 : Math.max(16, dist * (o.bend ?? 0.45));
      const c1 = { x: s.x + s.dir[0] * k, y: s.y + s.dir[1] * k };
      const c2 = { x: e.x + e.dir[0] * k, y: e.y + e.dir[1] * k };
      const d = `M${s.x} ${s.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${e.x} ${e.y}`;
      const color = o.color || "var(--prussian)", sw = o.width || 2.5, t = o.t || 0.6;
      const g = el("g", {}, this.stage);
      const path = el("path", { d, fill: "none", stroke: color, "stroke-width": sw, "stroke-linecap": "round", pathLength: 1 }, g);
      if (o.at !== undefined) { path.setAttribute("class", "a-draw"); path.style.cssText = `--d:${o.at}s;--t:${t}s`; }
      if (o.head !== false) {
        // chevron pointing along the end tangent (c2 -> e)
        const ang = Math.atan2(e.y - c2.y, e.x - c2.x) || Math.atan2(-e.dir[1], -e.dir[0]);
        const L = o.headSize || 9;
        const hx = (a2) => e.x + L * Math.cos(ang + a2), hy = (a2) => e.y + L * Math.sin(ang + a2);
        const hg = el("g", o.at !== undefined ? { class: "a-fade", style: `--d:${o.at + t * 0.8}s;--t:.2s` } : {}, g);
        el("path", { d: `M${hx(Math.PI * 0.78)} ${hy(Math.PI * 0.78)} L${e.x} ${e.y} L${hx(-Math.PI * 0.78)} ${hy(-Math.PI * 0.78)}`, fill: "none", stroke: color, "stroke-width": sw, "stroke-linecap": "round", "stroke-linejoin": "round" }, hg);
      }
      return this.add("arrow", g, box(Math.min(s.x, e.x), Math.min(s.y, e.y), Math.max(s.x, e.x), Math.max(s.y, e.y)), { path, ends: [a, b], lint: o.lint !== false });
    }

    // ---- checks -------------------------------------------------------------
    lint() {
      const bad = [];
      const flag = (msg, ...its) => bad.push({ msg, its });
      const L = this.items.filter((i) => i.lint);
      const texts = L.filter((i) => i.kind === "text");
      const solids = L.filter((i) => i.kind === "icon" || i.kind === "rect");
      const name = (i) => `${i.kind}${i.str ? ` "${i.str.slice(0, 32)}"` : i.name ? ` ${i.name}` : ""}`;
      const safe = box(MARGIN - 1, 24, W - MARGIN + 1, H - 24);

      for (const t of texts) {
        if (!inside(t.box, safe)) flag(`outside margins: ${name(t)}`, t);
        for (const d of this.dividers)
          if (t.box.x0 < d.x && t.box.x1 > d.x && t.box.y1 > d.y0 && t.box.y0 < d.y1) flag(`crosses divider x=${d.x.toFixed(0)}: ${name(t)}`, t);
      }
      for (let i = 0; i < texts.length; i++)
        for (let j = i + 1; j < texts.length; j++)
          if (hit(texts[i].box, texts[j].box, 1)) flag(`text overlap: ${name(texts[i])} × ${name(texts[j])}`, texts[i], texts[j]);
      for (const t of texts)
        for (const s of solids) {
          if (!hit(t.box, s.box, 1)) continue;
          if (s.kind === "rect" && inside(t.box, s.box)) continue; // label inside its box
          flag(`text overlaps ${name(s)}: ${name(t)}`, t, s);
        }
      for (let i = 0; i < solids.length; i++)
        for (let j = i + 1; j < solids.length; j++) {
          const a = solids[i], b = solids[j];
          if (hit(a.box, b.box, 1) && !(inside(a.box, b.box) || inside(b.box, a.box))) flag(`${name(a)} overlaps ${name(b)}`, a, b);
        }
      // arrows: sample the drawn path against every other box
      for (const ar of L.filter((i) => i.kind === "arrow")) {
        const n = ar.path.getTotalLength();
        const own = new Set(ar.ends.filter((e) => e.box));
        // anything contained in an endpoint (e.g. the label inside a box) is also "own"
        for (const it of L) for (const e of [...own]) if (it.box && e.box && inside(it.box, e.box)) own.add(it);
        const others = [...texts, ...solids].filter((i) => !own.has(i));
        for (let s = 6; s < n - 6; s += 4) {
          const p = ar.path.getPointAtLength(s);
          const o = others.find((i) => p.x > i.box.x0 && p.x < i.box.x1 && p.y > i.box.y0 && p.y < i.box.y1);
          if (o) { flag(`arrow crosses ${name(o)}`, ar, o); break; }
        }
      }
      // chart curves (GA.chart line/fn): sample the path against every text box
      for (const cv of this.items.filter((i) => i.kind === "curve")) {
        const n = cv.path.getTotalLength();
        for (const t of texts) {
          for (let s = 0; s < n; s += 3) {
            const p = cv.path.getPointAtLength(s);
            if (p.x > t.box.x0 && p.x < t.box.x1 && p.y > t.box.y0 && p.y < t.box.y1) { flag(`curve crosses ${name(t)}`, cv, t); break; }
          }
        }
      }
      return bad;
    }

    debug(bad) {
      const g = el("g", {}, this.svg);
      for (const i of this.items) el("rect", { x: i.box.x0, y: i.box.y0, width: i.box.w, height: i.box.h, class: "ga-debug-box" }, g);
      for (const b of bad) for (const i of b.its) el("rect", { x: i.box.x0, y: i.box.y0, width: i.box.w, height: i.box.h, class: "ga-debug-bad" }, g);
    }
  }

  window.GA = {
    ROLE,
    async build(opts, fn) {
      window.GA_KIT = true;
      await Promise.all(
        ['15px "IBM Plex Sans"', '300 15px "IBM Plex Sans"', '500 15px "IBM Plex Sans"', 'italic 15px "IBM Plex Sans"', 'italic 500 15px "IBM Plex Sans"', '500 15px "IBM Plex Mono"'].map((f) => document.fonts.load(f).catch(() => null)),
      );
      const ga = new Kit(opts);
      fn(ga);
      const bad = ga.lint();
      window.GA_LINT = bad.map((b) => b.msg);
      if (bad.length) console.warn("GA lint:\n" + window.GA_LINT.join("\n"));
      if (location.search.includes("debug")) ga.debug(bad);
      window.GA_DURATION = ga.duration;
      window.GA_POSTER = ga.poster;
      if (!location.search.includes("render"))
        setInterval(() => document.getAnimations().forEach((a) => { a.currentTime = 0; a.play(); }), ga.duration * 1000);
      window.GA_READY = true;
      return ga;
    },
  };
})();
