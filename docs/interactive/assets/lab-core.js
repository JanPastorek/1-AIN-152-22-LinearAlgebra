/* Shared core for the Leon linear algebra companion pages.
   Exact fractions, matrix rendering, a checked-exercise engine and definition cards.
   Pages call LA.setStore(key) once, then use LA.* helpers. */
(function () {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const MINUS = "−";
const SUBS = "₀₁₂₃₄₅₆₇₈₉";
const sub = n => String(n).split("").map(d => SUBS[+d] ?? d).join("");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const HOOK = {};
function goto(sel) { const t = document.querySelector(sel); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
const SVGNS = "http://www.w3.org/2000/svg";
function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function fmt(v, dp = 2) {
  if (Math.abs(v) < 1e-9) v = 0;
  let s = (+v.toFixed(dp)).toString();
  return s.replace("-", MINUS);
}
function svgPoint(svg, evt) {
  const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

/* ---------- exact fractions ---------- */
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
class Q {
  constructor(n, d = 1) {
    if (d === 0) throw new Error("division by zero");
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1;
    this.n = n / g; this.d = d / g;
    if (this.n === 0) { this.n = 0; this.d = 1; }
  }
  static of(x) { return x instanceof Q ? x : new Q(x, 1); }
  add(o) { o = Q.of(o); return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Q.of(o); return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Q.of(o); return new Q(this.n * o.n, this.d * o.d); }
  div(o) { o = Q.of(o); return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  abs() { return new Q(Math.abs(this.n), this.d); }
  get zero() { return this.n === 0; }
  get one() { return this.n === 1 && this.d === 1; }
  eq(o) { o = Q.of(o); return this.n === o.n && this.d === o.d; }
  get neg_() { return this.n < 0; }
  txt() { const s = (this.n < 0 ? MINUS : "") + Math.abs(this.n); return this.d === 1 ? s : s + "/" + this.d; }
  html() {
    if (this.d === 1) return (this.n < 0 ? MINUS : "") + Math.abs(this.n);
    return `${this.n < 0 ? MINUS : ""}<span class="fr"><span>${Math.abs(this.n)}</span><span>${this.d}</span></span>`;
  }
  static parse(str) {
    str = String(str).trim().replace(/−/g, "-");
    if (!str) return null;
    let m = str.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
    if (m) { if (+m[2] === 0) return null; return new Q(+m[1], +m[2]); }
    m = str.match(/^([+-]?)(\d*)(?:\.(\d*))?$/);
    if (m && (m[2] || m[3])) {
      const dec = (m[3] || "").slice(0, 6);
      const n = parseInt((m[2] || "0") + dec, 10) * (m[1] === "-" ? -1 : 1);
      return new Q(n, 10 ** dec.length);
    }
    return null;
  }
}
const QM = A => A.map(r => r.map(v => Q.of(v)));
const cloneM = M => M.map(r => r.slice());

/* ---------- matrix → HTML ---------- */
function matHTML(M, o = {}) {
  const cls = ["mat", o.size || ""].join(" ");
  let h = `<div class="${cls}"${o.id ? ` id="${o.id}"` : ""}><table>`;
  M.forEach((row, i) => {
    const rc = o.rowClass ? o.rowClass(i) : "";
    h += `<tr${rc ? ` class="${rc}"` : ""}>`;
    if (o.rowLabel) h += `<th class="rowlab" scope="row">${o.rowLabel(i)}</th>`;
    row.forEach((v, j) => {
      const c = [];
      if (o.split != null && j === o.split) c.push("split");
      if (o.cellClass) { const x = o.cellClass(i, j, v); if (x) c.push(x); }
      const attr = o.cellAttr ? o.cellAttr(i, j) : "";
      const txt = o.render ? o.render(v, i, j) : (v instanceof Q ? v.html() : fmtNum(v));
      h += `<td${c.length ? ` class="${c.join(" ")}"` : ""}${attr ? " " + attr : ""}>${txt}</td>`;
    });
    h += "</tr>";
  });
  return h + "</table></div>";
}
function fmtNum(v) { return typeof v === "number" ? fmt(v) : String(v); }
function lbl(html, caption) { return `<div class="lbl">${html}<small>${caption}</small></div>`; }

/* ---------- linear expression text ---------- */
// terms: [{c:Q, v:"x₁"}], constant Q (optional). Returns HTML like "330 + x₄"
function linExpr(constant, terms) {
  const parts = [];
  if (constant && !constant.zero) parts.push({ neg: constant.neg_, body: constant.abs().html() });
  for (const t of terms) {
    if (t.c.zero) continue;
    const a = t.c.abs();
    parts.push({ neg: t.c.neg_, body: (a.one ? "" : a.html()) + t.v });
  }
  if (!parts.length) return "0";
  return parts.map((p, k) => k === 0 ? (p.neg ? MINUS : "") + p.body : (p.neg ? ` ${MINUS} ` : " + ") + p.body).join("");
}
const xv = j => `<span class="x">x</span><sub>${j + 1}</sub>`;

const q = s => typeof s === "number" ? new Q(s) : (s instanceof Q ? s : Q.parse(s));
const qm = {
  of: A => A.map(r => r.map(q)),
  I: n => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => new Q(i === j ? 1 : 0))),
  mul: (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s.add(v.mul(B[k][j])), new Q(0)))),
  add: (A, B) => A.map((r, i) => r.map((v, j) => v.add(B[i][j]))),
  scale: (c, A) => A.map(r => r.map(v => v.mul(q(c)))),
  T: A => A[0].map((_, j) => A.map(r => r[j])),
  eq: (A, B) => A.length === B.length && A.every((r, i) => r.length === B[i].length && r.every((v, j) => v.eq(B[i][j]))),
  isZero: A => A.every(r => r.every(v => v.zero)),
  inv(A) {
    const n = A.length, Id = qm.I(n), M = A.map((r, i) => [...r, ...Id[i]]);
    for (let c = 0; c < n; c++) {
      let p = -1; for (let i = c; i < n; i++) if (!M[i][c].zero) { p = i; break; }
      if (p < 0) return null;
      [M[c], M[p]] = [M[p], M[c]];
      const piv = M[c][c]; M[c] = M[c].map(v => v.div(piv));
      for (let i = 0; i < n; i++) if (i !== c && !M[i][c].zero) { const f = M[i][c]; M[i] = M[i].map((v, k) => v.sub(f.mul(M[c][k]))); }
    }
    return M.map(r => r.slice(n));
  },
  lu(A) {
    const n = A.length, U = A.map(r => r.slice()), L = qm.I(n);
    for (let j = 0; j < n; j++) {
      if (U[j][j].zero) return null;
      for (let i = j + 1; i < n; i++) { const l = U[i][j].div(U[j][j]); L[i][j] = l; U[i] = U[i].map((v, k) => v.sub(l.mul(U[j][k]))); }
    }
    return { L, U };
  },
  pow(A, k) { let R = A; for (let t = 1; t < k; t++) R = qm.mul(R, A); return R; },
  col: v => v.map(x => [q(x)]),
};
// HTML helpers
const MH = (A, o = {}) => matHTML(A.map(r => r.map(v => (typeof v === "number" && Number.isInteger(v)) ? new Q(v) : (typeof v === "string" && Q.parse(v) ? Q.parse(v) : v))), o);
function eqLine(coefs, rhs, order) {
  const idx = order || coefs.map((_, j) => j);
  const terms = idx.filter(j => !q(coefs[j]).zero).map(j => ({ c: q(coefs[j]), v: xv(j) }));
  return `${linExpr(null, terms)} = ${q(rhs).html()}`;
}
const sys = (aug, orders) => `<div class="sysx">${aug.map((r, i) => `<div>${eqLine(r.slice(0, -1), r[r.length - 1], orders && orders[i])}</div>`).join("")}</div>`;
const aug = (A, split) => MH(A, { split: split ?? A[0].length - 1 });

let STORE = "leon-solved";
let SOLVED = new Set();
function setStore(key) { STORE = key; try { SOLVED = new Set(JSON.parse(localStorage.getItem(STORE) || "[]")); } catch (e) { SOLVED = new Set(); } }
const saveSolved = () => { try { localStorage.setItem(STORE, JSON.stringify([...SOLVED])); } catch (e) { /* ignore */ } };

// spec builders
const ch = (ref, prompt, options, answer, explain, extra = {}) => Object.assign({ ref, type: "choice", prompt, options, answer, explain }, extra);
const fl = (ref, prompt, fields, explain, extra = {}) => Object.assign({ ref, type: "fields", prompt, fields, explain }, extra);
const cl = (ref, prompt, options, items, extra = {}) => Object.assign({ ref, type: "classify", prompt, options, items }, extra);
const vec = (label, ans) => ({ kind: "vector", label, ans: ans.map(q) });
const mat = (label, ans, o = {}) => Object.assign({ kind: "matrix", label, ans: ans.map(r => r.map(q)) }, o);
const num = (label, ans) => ({ kind: "number", label, ans: q(ans) });

function fieldHTML(f, k) {
  const inp = (r, c, w) => `<input class="mi" data-f="${k}" data-r="${r}" data-c="${c}" autocomplete="off" aria-label="${f.label} entry ${r + 1},${c + 1}"${w ? ` style="width:${w}px"` : ""}>`;
  if (f.kind === "matrix") {
    const rows = f.ans ? f.ans.length : f.rows, cols = f.ans ? f.ans[0].length : f.cols;
    return lbl(`<div class="mat"><table>${Array.from({ length: rows }, (_, r) => `<tr>${Array.from({ length: cols }, (_, c) => `<td class="inp${f.split === c ? " split" : ""}">${inp(r, c)}</td>`).join("")}</tr>`).join("")}</table></div>`, f.label);
  }
  if (f.kind === "vector") return `<span class="vecin"><span>${f.label} = (</span>${f.ans.map((_, c) => inp(0, c)).join("<span>,</span>")}<span>)</span></span>`;
  return `<label class="numin"><span>${f.label} =</span>${inp(0, 0, 70)}</label>`;
}
const normAns = f => f.kind === "matrix" ? f.ans : f.kind === "vector" ? [f.ans] : [[f.ans]];

function exCard(spec, sec, onChange) {
  const card = document.createElement("div");
  card.className = "ex" + (spec.wide ? " wide" : "");
  card.id = "ex-" + spec.id;
  let inst;
  function solve() { if (!SOLVED.has(spec.id)) { SOLVED.add(spec.id); saveSolved(); } card.classList.add("done"); onChange(); }
  function setup() {
    inst = spec.gen ? Object.assign({}, spec, spec.gen()) : spec;
    card.classList.toggle("done", SOLVED.has(spec.id));
    let h = `<div class="ex-top"><span class="ex-ref">${spec.ref}</span>${spec.gen ? `<button class="btn sm" data-a="new">New one</button>` : ""}</div><div class="ex-q">${inst.prompt}</div>`;
    if (inst.type === "choice") h += `<div class="opts">${inst.options.map((o, i) => `<button class="opt" data-i="${i}">${o}</button>`).join("")}</div>`;
    if (inst.type === "classify") h += `<div class="cls-grid">${inst.items.map((it, k) => `<div class="cls-item" data-k="${k}"><div class="cls-q">${it.tag ? `<span class="tag">${it.tag}</span>` : ""}<div class="scroll" style="max-width:100%">${it.html}</div></div><div class="opts">${inst.options.map((o, i) => `<button class="opt" data-k="${k}" data-i="${i}">${o}</button>`).join("")}</div><div class="cls-why"></div>${it.action ? `<button class="linkbtn" data-act="${k}">${it.action.label}</button>` : ""}</div>`).join("")}</div>`;
    if (inst.type === "fields") h += `<div class="scroll"><div class="ex-fields">${inst.fields.map(fieldHTML).join("")}</div></div>`;
    h += `<div class="ex-fb" aria-live="polite"></div><div class="btnrow">`;
    if (inst.type === "fields") h += `<button class="btn primary sm" data-a="check">Check</button>`;
    if (inst.hint) h += `<button class="btn sm" data-a="hint">Hint</button>`;
    if (inst.explain) h += `<button class="btn sm" data-a="sol">Solution</button>`;
    (inst.actions || []).forEach((a, i) => { h += `<button class="btn sm" data-x="${i}">${a.label}</button>`; });
    h += `</div>`;
    if (inst.hint) h += `<div class="ex-sol ex-hint" hidden><span class="k">Hint</span><div>${inst.hint}</div></div>`;
    if (inst.explain) h += `<div class="ex-sol ex-solution" hidden><span class="k">Solution</span><div>${inst.explain}</div></div>`;
    card.innerHTML = h;
    wire();
  }
  const fb = (cls, txt) => { const f = card.querySelector(".ex-fb"); f.className = "ex-fb " + cls; f.innerHTML = txt; };
  const showSol = () => { const s = card.querySelector(".ex-solution"); if (s) s.hidden = false; };
  function check() {
    const inputs = [...card.querySelectorAll("input.mi")];
    const vals = inst.fields.map(f => { const a = f.ans ? normAns(f) : Array.from({ length: f.rows }, () => Array(f.cols).fill(null)); return a.map(r => r.map(() => null)); });
    let missing = 0, bad = 0;
    inputs.forEach(x => { const v = Q.parse(x.value); x.classList.remove("right", "wrong"); if (!v) { missing++; if (x.value.trim()) x.classList.add("wrong"); return; } vals[+x.dataset.f][+x.dataset.r][+x.dataset.c] = v; });
    if (missing) return fb("bad", `Fill every box with a number (fractions like −5/2 are fine).`);
    if (inst.check) {
      const r = inst.check(vals);
      inputs.forEach(x => x.classList.add(r.ok ? "right" : "wrong"));
      if (r.ok) { fb("ok", r.msg || "Correct."); solve(); showSol(); } else fb("bad", r.msg || "Not yet.");
      return;
    }
    inputs.forEach(x => {
      const f = inst.fields[+x.dataset.f], want = normAns(f)[+x.dataset.r][+x.dataset.c];
      const ok = vals[+x.dataset.f][+x.dataset.r][+x.dataset.c].eq(want);
      x.classList.add(ok ? "right" : "wrong"); if (!ok) bad++;
    });
    if (bad) fb("bad", `${bad} ${bad === 1 ? "entry is" : "entries are"} not right yet.${inst.hint ? " Try the hint." : ""}`);
    else { fb("ok", inst.okMsg || "Correct."); solve(); showSol(); }
  }
  function wire() {
    card.querySelectorAll("[data-a]").forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if (a === "new") { setup(); return; }
      if (a === "check") check();
      if (a === "hint") { const e = card.querySelector(".ex-hint"); e.hidden = !e.hidden; }
      if (a === "sol") {
        const e = card.querySelector(".ex-solution"); e.hidden = !e.hidden;
        if (inst.type === "fields" && !e.hidden) card.querySelectorAll("input.mi").forEach(x => { const f = inst.fields[+x.dataset.f]; if (!f.ans) return; x.value = normAns(f)[+x.dataset.r][+x.dataset.c].txt().replace(MINUS, "-"); x.classList.remove("wrong"); });
      }
    });
    card.querySelectorAll("[data-x]").forEach(b => b.onclick = () => inst.actions[+b.dataset.x].run());
    card.querySelectorAll("input.mi").forEach(x => x.addEventListener("keydown", e => { if (e.key === "Enter") check(); }));
    if (inst.type === "choice") card.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if (i === inst.answer) { b.classList.add("right"); fb("ok", "Correct."); solve(); showSol(); }
      else { b.classList.add("wrong"); fb("bad", (inst.wrong && inst.wrong[i]) || "Not this one. Try again."); }
    });
    if (inst.type === "classify") {
      const okSet = new Set();
      card.querySelectorAll(".opt").forEach(b => b.onclick = () => {
        const k = +b.dataset.k, i = +b.dataset.i, it = inst.items[k], box = card.querySelector(`.cls-item[data-k="${k}"]`);
        box.querySelectorAll(".opt").forEach(o => o.classList.remove("right", "wrong"));
        const why = box.querySelector(".cls-why");
        if (i === it.ans) { b.classList.add("right"); box.classList.add("ok"); okSet.add(k); why.innerHTML = it.why || ""; }
        else { b.classList.add("wrong"); box.classList.remove("ok"); okSet.delete(k); why.innerHTML = it.wrongWhy || "Not quite."; }
        if (okSet.size === inst.items.length) { fb("ok", "All correct."); solve(); } else fb("", `${okSet.size} of ${inst.items.length} done.`);
      });
      card.querySelectorAll("[data-act]").forEach(b => b.onclick = () => inst.items[+b.dataset.act].action.run());
    }
  }
  setup();
  return card;
}
function buildExercises(sec, title, blurb, list) {
  const host = $("#ex-" + sec); if (!host) return;
  list.forEach((s, i) => { s.id = sec + "-" + (s.key || i); });
  host.innerHTML = `<div class="ex-head"><h3>${title}</h3><span class="ex-count"></span><p>${blurb}</p></div><div class="ex-list"></div>`;
  const count = () => { host.querySelector(".ex-count").textContent = `${list.filter(s => SOLVED.has(s.id)).length} / ${list.length} solved`; };
  list.forEach(s => host.querySelector(".ex-list").appendChild(exCard(s, sec, count)));
  count();
}
const sm = (A, split) => MH(A, { size: "sm", split });
const X_ = j => xv(j - 1);

function renderDefinitions(D, secName) {
  let SRC = {};
  try { SRC = JSON.parse(document.getElementById("manim-src").textContent); } catch (e) { /* no sources */ }
  const bySec = {};
  D.forEach(d => (bySec[d.sec] = bySec[d.sec] || []).push(d));
  Object.entries(bySec).forEach(([sec, list]) => {
    const host = document.getElementById("defs-" + sec); if (!host) return;
    host.innerHTML = `<div class="defs-head">Definitions</div><div class="defs-grid"></div>`;
    const grid = host.querySelector(".defs-grid");
    list.forEach(d => {
      const card = document.createElement("article");
      card.className = "dcard"; card.id = d.id;
      const media = d.scene
        ? `<video poster="video/${d.scene}.jpg" controls muted playsinline preload="none" aria-label="Manim animation: ${d.term}"><source src="video/${d.scene}.mp4" type='video/mp4; codecs="avc1.64001f"'><source src="video/${d.scene}.webm" type="video/webm"></video>`
        : "";
      const speed = d.scene ? `<div class="dspeed" role="group" aria-label="Playback speed"><span>speed</span>${[0.5, 0.75, 1, 1.5].map(r => `<button class="chip" data-rate="${r}" aria-pressed="${r === 1}">${r}×</button>`).join("")}</div>` : "";
      card.innerHTML = media + speed + `<div class="dbody"><div class="dtop"><h3 class="dterm">${d.term}</h3><span class="dref">${d.ref}</span></div><p class="dtext">${d.html}</p>` +
        (d.note ? `<p class="dnote">${d.note}</p>` : "") +
        (d.lab ? `<button class="linkbtn" data-goto="${d.lab[0]}">${d.lab[1]}</button>` : "") +
        (d.scene && SRC[d.scene] ? `<details><summary>Manim scene <code>${d.scene}</code></summary><pre></pre></details>` : "") + `</div>`;
      const pre = card.querySelector("pre"); if (pre) pre.textContent = SRC[d.scene];
      card.querySelectorAll("[data-rate]").forEach(b => b.onclick = () => {
        const v = card.querySelector("video"); v.playbackRate = v.defaultPlaybackRate = +b.dataset.rate;
        card.querySelectorAll("[data-rate]").forEach(x => x.setAttribute("aria-pressed", x === b));
      });
      const gb = card.querySelector("[data-goto]"); if (gb) gb.onclick = () => goto(gb.dataset.goto);
      grid.appendChild(card);
    });
  });
  // index at the top
  const idx = document.getElementById("def-index");
  D.forEach(d => {
    const a = document.createElement("a");
    a.className = "chip"; a.href = "#" + d.id; a.setAttribute("role", "listitem");
    a.style.textDecoration = "none";
    a.innerHTML = `<b style="font-family:var(--mono);color:var(--c1);margin-right:6px">${secName[d.sec]}</b>${d.term}`;
    idx.appendChild(a);
  });
  // play only one animation at a time
  document.querySelectorAll(".dcard video").forEach(v => v.addEventListener("play", () => {
    document.querySelectorAll(".dcard video").forEach(o => { if (o !== v) o.pause(); });
  }));
}

// exact determinant (fraction-free bookkeeping via elimination), minors, adjoint
qm.minor = (A, i, j) => A.filter((_, r) => r !== i).map(row => row.filter((_, c) => c !== j));
qm.det = A => {
  const n = A.length; if (n === 0) return new Q(1);
  const M = A.map(r => r.map(q)); let d = new Q(1);
  for (let c = 0; c < n; c++) {
    let p = -1; for (let i = c; i < n; i++) if (!M[i][c].zero) { p = i; break; }
    if (p < 0) return new Q(0);
    if (p !== c) { [M[p], M[c]] = [M[c], M[p]]; d = d.neg(); }
    d = d.mul(M[c][c]);
    for (let i = c + 1; i < n; i++) if (!M[i][c].zero) { const f = M[i][c].div(M[c][c]); M[i] = M[i].map((v, k) => v.sub(f.mul(M[c][k]))); }
  }
  return d;
};
qm.cof = (A, i, j) => { const m = qm.det(qm.minor(A, i, j)); return (i + j) % 2 ? m.neg() : m; };
qm.adj = A => A[0].map((_, j) => A.map((__, i) => qm.cof(A, i, j)));

// 2D plane in an SVG: grid, axes, world<->screen maps, layered groups
function plane2D(svg, o = {}) {
  const W = o.W || 420, H = o.H || W, R = o.R || 5, sc = o.sc || W / (2 * R);
  const cx = o.cx != null ? o.cx : W / 2, cy = o.cy != null ? o.cy : H / 2;
  const X = x => cx + x * sc, Y = y => cy - y * sc;
  const inv = (px, py) => [(px - cx) / sc, (cy - py) / sc];
  svg.innerHTML = "";
  const defs = el("defs", {}, svg);
  [["c1", "f1"], ["c2", "f2"], ["c3", "f3"], ["ink", "ink"], ["amb", "famb"]].forEach(([k, cls]) => {
    const mk = el("marker", { id: `${svg.id}-ah-${k}`, viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", class: cls, style: k === "amb" ? "fill:var(--pivot)" : "" }, mk);
  });
  const grid = el("g", {}, svg);
  const xmin = Math.floor(-cx / sc), xmax = Math.ceil((W - cx) / sc), ymin = Math.floor((cy - H) / sc), ymax = Math.ceil(cy / sc);
  if (o.grid !== false) {
    for (let k = xmin; k <= xmax; k++) el("line", { x1: X(k), y1: 0, x2: X(k), y2: H, class: k === 0 ? "axis" : "gridl" }, grid);
    for (let k = ymin; k <= ymax; k++) el("line", { x1: 0, y1: Y(k), x2: W, y2: Y(k), class: k === 0 ? "axis" : "gridl" }, grid);
  }
  const layers = {};
  ["under", "mid", "top", "handles"].forEach(n => { layers[n] = el("g", {}, svg); });
  const arrow = (g, p, q2, cls, w = 3, extra = {}) => {
    if (Math.hypot(q2[0] - p[0], q2[1] - p[1]) < 1e-9) return null;
    const key = cls === "c1" ? "c1" : cls === "c2" ? "c2" : cls === "c3" ? "c3" : cls === "amb" ? "amb" : "ink";
    const style = cls === "ink" ? "stroke:var(--ink)" : cls === "amb" ? "stroke:var(--pivot)" : "";
    return el("line", Object.assign({ x1: X(p[0]), y1: Y(p[1]), x2: X(q2[0]), y2: Y(q2[1]), class: cls === "ink" || cls === "amb" ? "" : cls, style, "stroke-width": w, "stroke-linecap": "round", "marker-end": `url(#${svg.id}-ah-${key})` }, extra), g);
  };
  const lineThrough = (g, p, d, attrs) => { const L = 4 * (W + H) / sc; return el("line", Object.assign({ x1: X(p[0] - L * d[0]), y1: Y(p[1] - L * d[1]), x2: X(p[0] + L * d[0]), y2: Y(p[1] + L * d[1]) }, attrs), g); };
  const poly = (g, pts, attrs) => el("polygon", Object.assign({ points: pts.map(v => `${X(v[0])},${Y(v[1])}`).join(" ") }, attrs), g);
  const text = (g, p, s, attrs = {}) => { const t = el("text", Object.assign({ x: X(p[0]), y: Y(p[1]), "font-size": 13 }, attrs), g); t.textContent = s; return t; };
  return { svg, W, H, R, sc, X, Y, inv, layers, arrow, lineThrough, poly, text, clear() { Object.values(layers).forEach(g => { g.innerHTML = ""; }); } };
}

// draggable points: getPts() -> [[x,y],...] ; onMove(i,[x,y])
function draggable(P, getPts, onMove, o = {}) {
  const snap = o.snap == null ? 0.5 : o.snap, lim = o.lim || P.R;
  let drag = -1;
  const svg = P.svg;
  function draw(labels = [], classes = []) {
    const g = P.layers.handles; g.innerHTML = "";
    getPts().forEach((p, i) => {
      const h = el("g", { class: "handle" }, g);
      el("circle", { cx: P.X(p[0]), cy: P.Y(p[1]), r: 20, style: "fill:transparent" }, h);
      el("circle", { cx: P.X(p[0]), cy: P.Y(p[1]), r: 7, class: classes[i] || "ink", style: "stroke:var(--panel)", "stroke-width": 2 }, h);
      if (labels[i]) { const t = el("text", { x: P.X(p[0]) - 10, y: P.Y(p[1]) - 11, "text-anchor": "end", "font-size": 13, "font-weight": 600, style: `fill:var(--${(classes[i] || "ink").replace("f", "c")})` }, h); t.textContent = labels[i]; }
      h.addEventListener("pointerdown", e => { e.preventDefault(); drag = i; svg.setPointerCapture(e.pointerId); });
    });
  }
  svg.addEventListener("pointermove", e => {
    if (drag < 0) return;
    const pt = svgPoint(svg, e); let [x, y] = P.inv(pt.x, pt.y);
    if (snap) { x = Math.round(x / snap) * snap; y = Math.round(y / snap) * snap; }
    x = Math.max(-lim, Math.min(lim, x)); y = Math.max(-lim, Math.min(lim, y));
    const cur = getPts()[drag];
    if (cur[0] !== x || cur[1] !== y) onMove(drag, [x, y]);
  });
  ["pointerup", "pointercancel"].forEach(ev => svg.addEventListener(ev, () => { drag = -1; }));
  return { draw };
}

// numeric (floating) helpers shared by later chapters
const num2 = (v, dp = 3) => fmt(v, dp);
const S_ = n => `<sub>${n}</sub>`;
window.LA = { $, MINUS, SUBS, sub, reduce, HOOK, goto, SVGNS, el, fmt, num2, svgPoint, gcd, Q, QM, cloneM, matHTML, fmtNum, lbl, linExpr, xv,
  q, qm, MH, eqLine, sys, aug, setStore, plane2D, draggable, ch, fl, cl, vec, mat, num, fieldHTML, exCard, buildExercises, sm, X_, renderDefinitions, S_ };
})();
