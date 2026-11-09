/* Linear Algebra Lab, "plus" layer.
   Motivating problems, "why we need it" strips, the algorithm studio (watch / predict / check a certificate /
   exit ticket), decision guides, problem-sheet links and study controls.
   It does not depend on lab-core.js, so it also runs on the hand-built chapter 1 page.
   Everything above the "UI" marker is pure and runs in Node for docs/interactive/tools/test-plus.js. */
(function (root) {
"use strict";
const MINUS = "−";
const REPO = "https://github.com/JanPastorek/1-AIN-152-22-LinearAlgebra/blob/main/";
const WEEKS = {
  1: "01_matrices_and_models", 2: "02_systems_and_traffic", 3: "03_composition_and_groups", 4: "04_lu_and_numerics",
  5: "05_basis_and_tomography", 6: "06_rank_and_nullity", 7: "07_linear_maps_and_bottlenecks", 8: "08_determinants_and_volume",
  9: "09_orthogonality_and_normals", 10: "10_change_of_basis", 11: "11_affine_geometry", 12: "12_eigenvalues_and_dynamics", 13: "13_matrix_museum",
};
function sheetURL(task) {             // "W02.T3" -> link to that heading of the seminar sheet; "W02" -> the sheet
  const m = /^W(\d\d)(?:\.T(\d))?$/.exec(task); if (!m) return null;
  const f = WEEKS[+m[1]]; if (!f) return null;
  return REPO + "seminars/" + f + ".md" + (m[2] ? "#w" + m[1] + "t" + m[2] : "");
}
function solutionsURL(week) { const f = WEEKS[week]; return f ? REPO + "solutions/practice/" + f + ".md" : null; }

// ---------------------------------------------------------------- exact rationals (BigInt)
function bgcd(a, b) { if (a < 0n) a = -a; if (b < 0n) b = -b; while (b) { const t = a % b; a = b; b = t; } return a; }
class R {
  constructor(n, d = 1n) {
    if (d === 0n) throw new Error("division by zero");
    if (d < 0n) { n = -n; d = -d; }
    const g = bgcd(n, d) || 1n; this.n = n / g; this.d = d / g;
  }
  static of(x) {
    if (x instanceof R) return x;
    if (typeof x === "bigint") return new R(x);
    if (typeof x === "number" && Number.isInteger(x)) return new R(BigInt(x));
    const r = R.parse(String(x)); if (!r) throw new Error("not a number: " + x); return r;
  }
  static parse(s) {
    s = String(s).trim().replace(/[−–—]/g, "-").replace(/\s+/g, "");
    if (!s) return null;
    const dec = t => {
      const m = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(t);
      if (!m || !(m[2] || m[3])) return null;
      const frac = m[3] || "";
      let n = BigInt((m[1] === "-" ? "-" : "") + (m[2] || "0") + frac), d = 10n ** BigInt(frac.length);
      const e = m[4] ? parseInt(m[4], 10) : 0;
      if (Math.abs(e) > 300) return null;
      if (e > 0) n *= 10n ** BigInt(e); else if (e < 0) d *= 10n ** BigInt(-e);
      return new R(n, d);
    };
    const parts = s.split("/");
    if (parts.length === 1) return dec(parts[0]);
    if (parts.length === 2) { const a = dec(parts[0]), b = dec(parts[1]); if (!a || !b || b.isZero()) return null; return a.div(b); }
    return null;
  }
  add(o) { o = R.of(o); return new R(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = R.of(o); return new R(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = R.of(o); return new R(this.n * o.n, this.d * o.d); }
  div(o) { o = R.of(o); if (o.n === 0n) throw new Error("division by zero"); return new R(this.n * o.d, this.d * o.n); }
  neg() { return new R(-this.n, this.d); }
  abs() { return this.n < 0n ? this.neg() : this; }
  isZero() { return this.n === 0n; }
  sign() { return this.n > 0n ? 1 : this.n < 0n ? -1 : 0; }
  cmp(o) { o = R.of(o); const x = this.n * o.d - o.n * this.d; return x > 0n ? 1 : x < 0n ? -1 : 0; }
  eq(o) { return this.cmp(o) === 0; }
  isInt() { return this.d === 1n; }
  num() { return Number(this.n) / Number(this.d); }
  toString() { return (this.d === 1n ? `${this.n}` : `${this.n}/${this.d}`).replace("-", MINUS); }
  py() { return this.d === 1n ? `${this.n}` : `Rational(${this.n}, ${this.d})`; }
}
const Z = () => new R(0n), ONE = () => new R(1n);

// ---------------------------------------------------------------- matrices over R
const rm = A => A.map(r => (Array.isArray(r) ? r.map(x => R.of(x)) : R.of(r)));   // matrix or vector
const clone = A => A.map(r => r.slice());
const ident = n => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => new R(i === j ? 1n : 0n)));
const zeros = n => Array.from({ length: n }, Z);
const tr = A => A[0].map((_, j) => A.map(r => r[j]));
const mmul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, a, k) => s.add(a.mul(B[k][j])), Z())));
const mvec = (A, x) => A.map(r => r.reduce((s, a, k) => s.add(a.mul(x[k])), Z()));
const dot = (u, v) => u.reduce((s, a, k) => s.add(a.mul(v[k])), Z());
const isZeroVec = v => v.every(x => x.isZero());
const meq = (A, B) => A.length === B.length && A.every((r, i) => r.length === B[i].length && r.every((x, j) => x.eq(B[i][j])));
const col = (A, j) => A.map(r => r[j]);
function rref(A, ncols) {
  const M = clone(A), m = M.length, piv = []; let r = 0;
  ncols = ncols == null ? M[0].length : ncols;
  for (let j = 0; j < ncols && r < m; j++) {
    let i = r; while (i < m && M[i][j].isZero()) i++;
    if (i === m) continue;
    [M[i], M[r]] = [M[r], M[i]];
    const p = M[r][j]; M[r] = M[r].map(x => x.div(p));
    for (let k = 0; k < m; k++) if (k !== r && !M[k][j].isZero()) { const c = M[k][j]; M[k] = M[k].map((x, q) => x.sub(c.mul(M[r][q]))); }
    piv.push(j); r++;
  }
  return { R: M, piv };
}
const rank = A => rref(A).piv.length;
function nullBasis(A) {
  const n = A[0].length, { R: M, piv } = rref(A, n), free = [];
  for (let j = 0; j < n; j++) if (!piv.includes(j)) free.push(j);
  return free.map(f => { const x = zeros(n); x[f] = ONE(); piv.forEach((p, i) => { x[p] = M[i][f].neg(); }); return x; });
}
function det(A) {
  const M = clone(A), n = M.length; let d = ONE();
  for (let k = 0; k < n; k++) {
    let i = k; while (i < n && M[i][k].isZero()) i++;
    if (i === n) return Z();
    if (i !== k) { [M[i], M[k]] = [M[k], M[i]]; d = d.neg(); }
    d = d.mul(M[k][k]);
    for (let r = k + 1; r < n; r++) if (!M[r][k].isZero()) { const c = M[r][k].div(M[k][k]); M[r] = M[r].map((x, q) => x.sub(c.mul(M[k][q]))); }
  }
  return d;
}
function detCofactor(A) {                                  // independent check used by tests
  const n = A.length; if (n === 1) return A[0][0];
  let s = Z();
  for (let j = 0; j < n; j++) {
    const minor = A.slice(1).map(r => r.filter((_, q) => q !== j));
    const t = A[0][j].mul(detCofactor(minor));
    s = j % 2 ? s.sub(t) : s.add(t);
  }
  return s;
}
function inv(A) {
  const n = A.length, I = ident(n), { R: M, piv } = rref(A.map((r, i) => r.concat(I[i])), n);
  return piv.length < n ? null : M.map(r => r.slice(n));
}
function solve(A, b) {                                     // a particular solution, or null if inconsistent
  const n = A[0].length, { R: M, piv } = rref(A.map((r, i) => r.concat([b[i]])), n + 1);
  if (piv.includes(n)) return null;
  const x = zeros(n); piv.forEach((p, i) => { x[p] = M[i][n]; }); return x;
}

// ---------------------------------------------------------------- polynomials over R (coefficients low -> high)
const ptrim = p => { p = p.slice(); while (p.length > 1 && p[p.length - 1].isZero()) p.pop(); return p; };
const pdeg = p => { p = ptrim(p); return p.length === 1 && p[0].isZero() ? -Infinity : p.length - 1; };
const pderiv = p => ptrim(p.slice(1).map((c, i) => c.mul(i + 1)).concat(p.length > 1 ? [] : [Z()]));
function pdivmod(a, b) {
  a = ptrim(a); b = ptrim(b); const db = pdeg(b); if (db === -Infinity) throw new Error("division by zero polynomial");
  let r = a.slice(); const q = zeros(Math.max(1, a.length - b.length + 1));
  while (pdeg(r) >= db) {
    const dr = pdeg(r), c = r[dr].div(b[db]); q[dr - db] = c;
    for (let i = 0; i <= db; i++) r[i + dr - db] = r[i + dr - db].sub(c.mul(b[i]));
    r = ptrim(r);
  }
  return [ptrim(q), r];
}
function pgcd(a, b) {
  a = ptrim(a); b = ptrim(b);
  while (pdeg(b) !== -Infinity) { const r = pdivmod(a, b)[1]; a = b; b = r; }
  const lc = a[a.length - 1]; return a.map(c => c.div(lc));
}
const peval = (p, x) => p.reduceRight((s, c) => s.mul(x).add(c), Z());
function charpoly(A) {                                     // det(λI − A), Faddeev–LeVerrier, exact
  const n = A.length, c = zeros(n + 1); c[n] = ONE();
  let M = A.map(r => r.map(() => Z()));
  for (let k = 1; k <= n; k++) {
    M = mmul(A, M).map((r, i) => r.map((x, j) => (i === j ? x.add(c[n - k + 1]) : x)));
    const AM = mmul(A, M); let t = Z(); for (let i = 0; i < n; i++) t = t.add(AM[i][i]);
    c[n - k] = t.div(-k);
  }
  return c;
}
function divisors(N) { N = N < 0n ? -N : N; const out = []; if (N > 10n ** 7n) return null; for (let d = 1n; d * d <= N; d++) if (N % d === 0n) { out.push(d); if (d * d !== N) out.push(N / d); } return out; }
function rationalRoots(p) {                               // distinct rational roots
  p = ptrim(p); const roots = [];
  let L = 1n; p.forEach(c => { L = L / bgcd(L, c.d) * c.d; });
  let z = p.map(c => c.mul(new R(L)).n);
  if (z.every(c => c === 0n)) return roots;
  while (z.length > 1 && z[0] === 0n) { z = z.slice(1); if (!roots.some(r => r.isZero())) roots.push(Z()); }
  if (z.length === 1) return roots;
  const P = divisors(z[0]), Q = divisors(z[z.length - 1]); if (!P || !Q) return roots;
  const pz = z.map(c => new R(c));
  for (const a of P) for (const b of Q) for (const s of [1n, -1n]) {
    const x = new R(s * a, b);
    if (peval(pz, x).isZero() && !roots.some(r => r.eq(x))) roots.push(x);
  }
  return roots.sort((a, b) => a.cmp(b));
}
function multiplicity(p, x) { let k = 0; const lin = [x.neg(), ONE()]; p = ptrim(p); while (pdeg(p) > 0) { const [q, r] = pdivmod(p, lin); if (pdeg(r) !== -Infinity) break; k++; p = q; } return k; }
function sturmRealCount(p) {                              // number of distinct real roots
  const seq = [ptrim(p), pderiv(p)];
  while (pdeg(seq[seq.length - 1]) > 0) { const r = pdivmod(seq[seq.length - 2], seq[seq.length - 1])[1]; if (pdeg(r) === -Infinity) break; seq.push(r.map(c => c.neg())); }
  const changes = signs => { let v = 0, last = 0; signs.forEach(s => { if (s) { if (last && s !== last) v++; last = s; } }); return v; };
  const at = inf => seq.map(q => { const d = pdeg(q); if (d === -Infinity) return 0; const s = q[d].sign(); return inf > 0 ? s : (d % 2 ? -s : s); });
  return changes(at(-1)) - changes(at(1));
}

// ---------------------------------------------------------------- formatting
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function ff(x, sig = 6) {
  if (typeof x !== "number") return String(x);
  if (!isFinite(x)) return String(x);
  if (Math.abs(x) < 1e-13) return "0";
  let s = String(+x.toPrecision(sig));
  if (/e/.test(s)) s = x.toExponential(Math.max(0, sig - 3)).replace("e+", "·10^").replace("e-", "·10^-");
  return s.replace(/-/g, MINUS);
}
const fr = x => (x instanceof R ? x.toString() : typeof x === "number" ? ff(x) : String(x));
const vstr = v => "(" + v.map(fr).join(", ") + ")";
const sub = k => `<sub>${k}</sub>`;
const xs = j => `x${sub(j)}`;
function mhtml(M, o = {}) {
  const aug = o.aug || 0, n = M[0].length, hl = o.hl || {};
  const body = M.map((r, i) => `<tr${hl.rows && hl.rows.includes(i) ? ' class="chg"' : ""}>` + r.map((x, j) => {
    const c = [];
    if (aug && j === n - aug) c.push("bar");
    if (hl.piv && hl.piv[0] === i && hl.piv[1] === j) c.push("pv");
    if (hl.col === j && (hl.from == null || i >= hl.from)) c.push("pc");
    if (o.dim && o.dim(i, j)) c.push("dim");
    return `<td${c.length ? ` class="${c.join(" ")}"` : ""}>${esc(fr(x))}</td>`;
  }).join("") + "</tr>").join("");
  return `<table class="lp-m${o.small ? " sm" : ""}"${o.label ? ` aria-label="${esc(o.label)}"` : ""}><tbody>${body}</tbody></table>`;
}
function parseMatrix(text) {
  const rows = String(text).split(/\n|;/).map(s => s.trim()).filter(Boolean);
  if (!rows.length) return { error: "Type a matrix: one row per line, entries separated by spaces or commas." };
  let aug = null; const M = [];
  for (const row of rows) {
    const parts = row.split("|");
    if (parts.length > 2) return { error: "Use at most one | per row." };
    const cells = parts.map(p => p.trim().split(/[\s,]+/).filter(Boolean));
    const a = parts.length === 2 ? cells[1].length : 0;
    if (aug == null) aug = a; else if (a !== aug) return { error: "Put the | in the same place in every row." };
    const vals = cells.flat().map(R.parse);
    if (vals.some(v => !v)) return { error: `Could not read “${row}”. Use integers, fractions like −5/2, or decimals.` };
    M.push(vals);
  }
  if (M.some(r => r.length !== M[0].length)) return { error: "Every row needs the same number of entries." };
  if (M.length > 8 || M[0].length > 9) return { error: "Keep it small: at most 8 rows and 9 columns." };
  return { M, aug };
}
const matText = (M, aug = 0) => M.map(r => { const n = r.length; return r.map((x, j) => (aug && j === n - aug ? "| " : "") + fr(x).replace(MINUS, "-")).join(" "); }).join("\n");
function parseVec(text) {
  const parts = String(text).replace(/[()[\]ᵀT]/g, " ").split(/[\s,;]+/).filter(Boolean);
  if (!parts.length) return null;
  const v = parts.map(R.parse); return v.some(x => !x) ? null : v;
}

// ---------------------------------------------------------------- seeded randomness for exit tickets
function seedOf(s) {
  s = String(s).trim(); if (/^\d+$/.test(s)) return (parseInt(s.slice(-9), 10) >>> 0) || 1;
  let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) || 1;
}
function rng(seed) {
  let a = (seedOf(seed) ^ 0x9e3779b9) >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rint = (rnd, lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const rnz = (rnd, lo, hi) => { let x; do x = rint(rnd, lo, hi); while (x === 0); return x; };
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

// ---------------------------------------------------------------- algorithms as frames
// A frame: { msg (html), line (index into pseudo), M (strings), aug, hl, panel (html), ask?, cert? }.
// An ask is posed on the frame where the student can see everything needed; the next frames reveal the answer.
// ask.answer is a SET of accepted answers (every tie counts).
const MAXF = 160;
const ALGOS = {};
function recorder(getPanel) {
  const F = [];
  F.snap = (msg, line, M, aug, hl = {}, extra = {}) => { if (F.length < MAXF) F.push(Object.assign({ msg, line, M: M.map(r => r.map(fr)), aug, hl, panel: getPanel() }, extra)); };
  return F;
}
const verdict = (ok, txt) => `<p class="lp-v ${ok ? "ok" : "bad"}">${ok ? "✓" : "✗"} ${txt}</p>`;

function gjCore(inst, mode) {
  const A0 = inst.M, aug = mode === "solve" ? inst.aug : 0;
  const M = clone(A0), m = M.length, n = M[0].length - aug, E = ident(m), piv = [];
  const F = recorder(() => mode === "solve"
    ? `<h4>Recorded combinations E</h4><p class="lp-small">Row i of the current matrix = (row i of E) × the original rows. Every row operation is applied to E too.</p>${mhtml(E, { small: true })}`
    : `<h4>Pivot columns so far</h4><p>${piv.length ? piv.map(j => "a" + sub(j + 1)).join(", ") : "none yet"}</p>`);
  const snap = (msg, line, hl, extra) => F.snap(msg, line, M, aug, hl, extra);
  snap(mode === "solve" ? `Start with the augmented matrix [A | b]: ${m} equations in ${n} unknowns.` : `Start with A. Its columns a${sub(1)}, …, a${sub(n)} are the vectors we study.`, 0);
  let r = 0;
  for (let j = 0; j < n && r < m; j++) {
    const cand = []; for (let i = r; i < m; i++) if (!M[i][j].isZero()) cand.push(i);
    let ask;
    if (mode === "solve") {
      const opts = []; for (let i = r; i < m; i++) opts.push(`row ${i + 1}`); opts.push("none: free column");
      ask = { type: "choice", prompt: `Column ${j + 1}: which rows could supply the pivot? (Any correct row counts; the lab then takes the first.)`, options: opts, answer: cand.length ? cand.map(i => `row ${i + 1}`) : ["none: free column"] };
    } else ask = { type: "choice", prompt: `Will column ${j + 1} contain a pivot?`, options: ["yes", "no"], answer: [cand.length ? "yes" : "no"] };
    snap(`Column ${j + 1}: look for a nonzero entry in rows ${r + 1}–${m}.`, 1, { col: j, from: r }, { ask });
    if (!cand.length) { snap(`Column ${j + 1} is zero from row ${r + 1} down: no pivot here, so ${mode === "solve" ? xs(j + 1) + " is a free variable" : "a" + sub(j + 1) + " is a combination of the pivot columns before it"}.`, 3, { col: j, from: r }); continue; }
    const i = cand[0];
    if (i !== r) { [M[i], M[r]] = [M[r], M[i]]; [E[i], E[r]] = [E[r], E[i]]; snap(`Swap rows ${r + 1} and ${i + 1} to bring a nonzero entry into the pivot position.`, 4, { rows: [r, i], piv: [r, j] }); }
    const p = M[r][j];
    if (!p.eq(1)) { M[r] = M[r].map(x => x.div(p)); E[r] = E[r].map(x => x.div(p)); snap(`Divide row ${r + 1} by ${fr(p)} so the pivot becomes 1.`, 5, { rows: [r], piv: [r, j] }); }
    for (let k = 0; k < m; k++) {
      if (k === r || M[k][j].isZero()) continue;
      const c = M[k][j];
      M[k] = M[k].map((x, q) => x.sub(c.mul(M[r][q]))); E[k] = E[k].map((x, q) => x.sub(c.mul(E[r][q])));
      snap(`Row ${k + 1} ← row ${k + 1} − (${fr(c)})·row ${r + 1}: this clears the entry ${k < r ? "above" : "below"} the pivot.`, 7, { rows: [k], piv: [r, j] });
    }
    piv.push(j); r++;
  }
  const free = []; for (let j = 0; j < n; j++) if (!piv.includes(j)) free.push(j);
  if (mode === "space") {
    snap(`Elimination is finished: this is the reduced row echelon form.`, 9, {}, { ask: { type: "number", prompt: "What is the rank of A?", answer: [String(piv.length)] } });
    const N = nullBasis(A0);
    const rel = free.map(f => `a${sub(f + 1)} = ` + (piv.map((p, i) => [M[i][f], p]).filter(([c]) => !c.isZero()).map(([c, p]) => `${fr(c)}·a${sub(p + 1)}`).join(" + ") || "0"));
    const okN = N.every(v => isZeroVec(mvec(A0, v)));
    const panel = `<h4>Read off</h4><p>rank A = <b>${piv.length}</b>, nullity = <b>${free.length}</b> (rank + nullity = ${n} columns).</p>` +
      `<p>Basis of the column space: the <i>original</i> pivot columns ${piv.map(p => "a" + sub(p + 1)).join(", ") || "(none)"}.</p>` +
      (free.length ? `<p>Dependence relations read from the free columns:<br>${rel.join("<br>")}</p><p>Null space basis: ${N.map(vstr).join(", ")}</p>${verdict(okN, "A·n = 0 for every basis vector n.")}` : `<p>No free columns: the columns are linearly independent and N(A) = {0}.</p>`);
    F.push({ msg: free.length ? `The columns are <b>dependent</b>: each free column is a combination of the pivot columns before it.` : `Every column has a pivot: the columns are <b>linearly independent</b>.`, line: 9, M: M.map(r => r.map(fr)), aug, hl: {}, panel, cert: { kind: "space", rank: piv.length, piv, N } });
    return F;
  }
  // solve mode
  const bad = []; for (let i = 0; i < m; i++) if (aug && M[i].slice(0, n).every(x => x.isZero()) && M[i].slice(n).some(x => !x.isZero())) bad.push(i);
  const how = bad.length ? "none" : free.length ? "infinitely many" : "exactly one";
  snap(`Elimination is finished: read off the answer.`, 9, {}, { ask: { type: "choice", prompt: "How many solutions does the system have?", options: ["none", "exactly one", "infinitely many"], answer: [how] } });
  if (bad.length) {
    const i = bad[0], y = E[i];
    const yA = A0[0].slice(0, n).map((_, j) => y.reduce((s, c, k) => s.add(c.mul(A0[k][j])), Z()));
    const yb = y.reduce((s, c, k) => s.add(c.mul(A0[k][n])), Z());
    const panel = `<h4>Certificate of inconsistency</h4><p>y = ${vstr(y)} (row ${i + 1} of E)</p><p>yᵀA = ${vstr(yA)}</p><p>yᵀb = ${fr(yb)}</p>` +
      verdict(isZeroVec(yA) && !yb.isZero(), "Weighting the original equations by y gives 0 = " + fr(yb) + ", which is impossible. Anyone can check this with one multiplication; no elimination needed.");
    F.push({ msg: `Row ${i + 1} reads 0 = ${fr(M[i][n])}: the system is <b>inconsistent</b>. The certificate is y = ${vstr(y)}.`, line: 9, M: M.map(r => r.map(fr)), aug, hl: { rows: [i] }, panel, cert: { kind: "inconsistent", y, yb } });
    return F;
  }
  const xp = zeros(n); if (aug) piv.forEach((p, i) => { xp[p] = M[i][n]; });
  const N = nullBasis(A0.map(r => r.slice(0, n)));
  const b = aug ? A0.map(r => r[n]) : zeros(m);
  const ok = mvec(A0.map(r => r.slice(0, n)), xp).every((v, i) => v.eq(b[i]));
  const fam = "x = " + vstr(xp) + N.map((v, k) => ` + t${sub(k + 1)}·${vstr(v)}`).join("");
  const panel = `<h4>Solution</h4><p>${free.length ? "Free variables " + free.map(j => xs(j + 1)).join(", ") + " become parameters." : "Every column has a pivot: no free variables."}</p><p>${fam}</p>` +
    verdict(ok, "A·x_p = b for the particular solution x_p = " + vstr(xp) + (N.length ? ", and A·n = 0 for each direction n." : "."));
  F.push({ msg: free.length ? `Consistent with ${free.length} free variable${free.length > 1 ? "s" : ""}: infinitely many solutions, ${fam}.` : `Consistent with a pivot in every column: the unique solution is x = ${vstr(xp)}.`, line: 9, M: M.map(r => r.map(fr)), aug, hl: {}, panel, cert: { kind: "solution", xp, N } });
  return F;
}
const GJ_PSEUDO = [
  "for each column j = 1, …, n (left to right), while rows remain:",
  "  find a row i ≥ r with a(i,j) ≠ 0",
  "  if there is none:",
  "    column j has no pivot; go on to the next column",
  "  swap rows r and i",
  "  divide row r by a(r,j), so the pivot is 1",
  "  for every other row k:",
  "    row k ← row k − a(k,j) · row r",
  "  r ← r + 1   (the next pivot goes one row lower)",
  "read off the answer from the reduced matrix",
];
ALGOS.gj = {
  key: "gj", short: "Gauss–Jordan + certificate", title: "Gauss–Jordan elimination that keeps its receipts", ref: "Leon §1.2",
  input: "matrix", pseudo: GJ_PSEUDO,
  idea: "How it works: clear each column above and below its pivot until the matrix is in reduced row echelon form, then read the solutions off directly. Idea: row operations replace equations by combinations of equations, so the solution set never changes. Recording each combination (the matrix E) turns a contradictory row 0 = c into a certificate y that anyone can check with one multiplication.",
  presets: [
    { name: "Traffic loop (W02.T1)", text: "1 0 0 -1 | 3\n-1 1 0 0 | -1\n0 -1 1 0 | -2\n0 0 -1 1 | 0" },
    { name: "Traffic, miscounted (W02.T3)", text: "1 0 0 -1 | 4\n-1 1 0 0 | -1\n0 -1 1 0 | -2\n0 0 -1 1 | 0" },
    { name: "3 × 3, one solution", text: "1 1 1 | 6\n-1 -1 1 | 0\n-2 1 1 | 1" },
    { name: "x + y = 1, 2x + 2y = 3 (W02.T5)", text: "1 1 | 1\n2 2 | 3" },
  ],
  help: "One equation per line; put | before the right-hand side.",
  run: inst => gjCore(inst, "solve"),
  python(inst) {
    const n = inst.M[0].length - inst.aug;
    return `from sympy import Matrix, Rational
M = Matrix(${pyMat(inst.M)})
A, b = M[:, :${n}], M[:, ${n}:]
R, pivots = M.rref()
print(R, pivots)
if ${n} in pivots:                        # a pivot in the b column: inconsistent
    # certificate: y with y^T A = 0 and y^T b != 0
    y = next(v for v in A.T.nullspace() if (v.T * b)[0] != 0)
    print("certificate y =", list(y), " y^T b =", (y.T * b)[0])
else:
    x, params = A.gauss_jordan_solve(b)
    print("x =", x.T, " free parameters:", params.T)`;
  },
};
ALGOS.rref = {
  key: "rref", short: "RREF → basis, rank, null space", title: "Row reduction decides dependence", ref: "Leon §3.3, §3.6",
  input: "matrix", pseudo: GJ_PSEUDO,
  idea: "How it works: row-reduce the matrix whose columns are the vectors. The pivot columns of the original matrix form a basis of the span. Each free column is a combination of the pivot columns before it, and its coefficients sit in its column of the reduced matrix. Idea: row operations do not change which combinations of the columns give zero (Ax = 0 has the same solutions), so dependence relations can be read in the reduced matrix and carried back to the original vectors.",
  presets: [
    { name: "Tomography A (W05.T2)", text: "1 1 0 0\n0 0 1 1\n1 0 1 0\n0 1 0 1" },
    { name: "W06.T2", text: "1 2 3 1\n1 1 2 1\n1 2 3 1" },
    { name: "e₁, e₂, e₁+e₂ (W05.T1)", text: "1 0 1\n0 1 1\n0 0 0" },
    { name: "Independent (Vandermonde)", text: "1 1 1\n1 2 3\n1 4 9" },
  ],
  help: "The vectors are the columns. One row per line.",
  run: inst => gjCore({ M: inst.M, aug: 0 }, "space"),
  python(inst) {
    return `from sympy import Matrix, Rational
A = Matrix(${pyMat(inst.M)})
R, pivots = A.rref()
print("rank =", A.rank(), " pivot columns:", [j + 1 for j in pivots])
print("column space basis:", [list(v) for v in A.columnspace()])
print("null space basis:  ", [list(v) for v in A.nullspace()])   # each gives a dependence relation A n = 0`;
  },
};
ALGOS.lu = {
  key: "lu", short: "LU factorization", title: "Factor once, solve twice: A = LU", ref: "Leon §1.5, §7.2",
  input: "matrix",
  pseudo: [
    "U ← A,   L ← I",
    "for k = 1, …, n−1:",
    "  if u(k,k) = 0: stop; a row swap is needed (PA = LU)",
    "  for i = k+1, …, n:",
    "    l(i,k) ← u(i,k) / u(k,k)",
    "    row i of U ← row i of U − l(i,k) · row k of U",
    "check L·U = A; then solve Ly = b (forward), Ux = y (back)",
  ],
  idea: "How it works: ordinary elimination below the diagonal, except that each multiplier is stored in L instead of being thrown away. Idea: the multipliers are exactly what is needed to redo the elimination on any new right-hand side, so a second system with the same A costs two triangular solves (about 2n² operations) instead of a fresh ⅔n³ elimination.",
  presets: [
    { name: "W04.T1", text: "2 1 1\n4 3 3\n2 2 3" },
    { name: "Leon Example 1.5.6", text: "2 4 2\n1 5 2\n4 -1 9" },
    { name: "Needs a swap (W04.T3)", text: "0 1\n1 1" },
  ],
  help: "A square matrix; a | column is ignored.",
  run(inst) {
    const A0 = inst.M.map(r => r.slice(0, r.length - inst.aug)), n = A0.length;
    const U = clone(A0), L = ident(n);
    const F = recorder(() => `<h4>L (multipliers so far)</h4>${mhtml(L, { small: true, dim: (i, j) => i > j && L[i][j].isZero() })}`);
    const snap = (msg, line, hl, extra) => F.snap(msg, line, U, 0, hl, extra);
    if (A0[0].length !== n) { snap("LU needs a square matrix.", 0); return F; }
    snap("Start: U is a copy of A and L is the identity. The main panel shows U.", 0);
    for (let k = 0; k < n - 1; k++) {
      if (U[k][k].isZero()) {
        if (U.slice(k + 1).some(r => !r[k].isZero())) {
          snap(`u(${k + 1},${k + 1}) = 0 but an entry below it is not: elimination without row swaps is impossible here. Swap rows first (PA = LU, Leon §7.3).`, 2, { piv: [k, k] }, { cert: { kind: "needs-swap" } });
          return F;
        }
        snap(`Column ${k + 1} is already zero below u(${k + 1},${k + 1}) = 0; nothing to eliminate (U will have a zero on its diagonal).`, 2, { piv: [k, k] });
        continue;
      }
      for (let i = k + 1; i < n; i++) {
        if (U[i][k].isZero()) { snap(`u(${i + 1},${k + 1}) is already 0, so l(${i + 1},${k + 1}) = 0.`, 4, { rows: [i], piv: [k, k] }); continue; }
        const l = U[i][k].div(U[k][k]);
        snap(`Next: eliminate u(${i + 1},${k + 1}) = ${fr(U[i][k])} using the pivot u(${k + 1},${k + 1}) = ${fr(U[k][k])}.`, 3, { piv: [k, k], col: k, from: i }, { ask: { type: "number", prompt: `What is the multiplier l(${i + 1},${k + 1})?`, answer: [String(l)] } });
        L[i][k] = l; U[i] = U[i].map((x, q) => x.sub(l.mul(U[k][q])));
        snap(`l(${i + 1},${k + 1}) = ${fr(l)} goes into L; row ${i + 1} of U ← row ${i + 1} − (${fr(l)})·row ${k + 1}.`, 5, { rows: [i], piv: [k, k] });
      }
    }
    const ok = meq(mmul(L, U), A0);
    F.push({ msg: `Done: A = LU with L unit lower triangular (the multipliers) and U upper triangular.`, line: 6, M: U.map(r => r.map(fr)), aug: 0, hl: {},
      panel: `<h4>The factorization</h4><div class="lp-mrow"><span>L =</span>${mhtml(L, { small: true })}<span>U =</span>${mhtml(U, { small: true })}</div>${verdict(ok, "L·U = A, checked entry by entry.")}` +
        (inst.aug ? (() => { const b = inst.M.map(r => r[r.length - 1]); const x = solve(A0, b); return x ? `<p>For the given b: x = ${vstr(x)}.</p>` : ""; })() : ""),
      cert: { kind: "lu", L, U } });
    return F;
  },
  python(inst) {
    const A = inst.M.map(r => r.slice(0, r.length - inst.aug));
    return `from sympy import Matrix, Rational
A = Matrix(${pyMat(A)})
L, U, swaps = A.LUdecomposition()     # swaps lists row exchanges (empty if none were needed)
print(L, U, swaps)
assert L * U == A or swaps
# reuse the factorization for several right-hand sides:
# y = L.lower_triangular_solve(b); x = U.upper_triangular_solve(y)`;
  },
};
ALGOS.det = {
  key: "det", short: "Determinant by elimination", title: "The determinant by elimination", ref: "Leon §2.2",
  input: "matrix",
  pseudo: [
    "d ← 1",
    "for k = 1, …, n:",
    "  find a row i ≥ k with a(i,k) ≠ 0",
    "  if there is none: return det A = 0",
    "  if i ≠ k: swap rows i and k;   d ← −d",
    "  for each row i below k:",
    "    row i ← row i − (a(i,k)/a(k,k)) · row k     (det unchanged)",
    "  d ← d · a(k,k)",
    "return d   (the product of the pivots, with one sign change per swap)",
  ],
  idea: "How it works: reduce to triangular form, then multiply the diagonal. Track what each row operation does: a swap flips the sign; adding a multiple of one row to another changes nothing. Idea: the determinant is the signed volume of the box spanned by the rows. Shearing a box does not change its volume, and the volume of a triangular box is the product of its diagonal. This takes about n³/3 operations, while cofactor expansion takes about n! products.",
  presets: [
    { name: "W08.T2", text: "2 1 3\n0 -1 4\n5 2 0" },
    { name: "Leon Example 2.2.1", text: "2 1 3\n4 2 1\n6 -3 4" },
    { name: "Singular", text: "1 2 3\n4 5 6\n7 8 9" },
    { name: "4 × 4", text: "1 2 0 1\n2 1 1 0\n0 1 3 1\n1 0 1 2" },
  ],
  help: "A square matrix.",
  run(inst) {
    const A0 = inst.M.map(r => r.slice(0, r.length - inst.aug)), n = A0.length, M = clone(A0);
    let d = ONE(); const notes = [];
    const F = recorder(() => `<h4>Running value</h4><p>d = <b>${fr(d)}</b></p>${notes.length ? `<ul class="lp-notes">${notes.map(s => `<li>${s}</li>`).join("")}</ul>` : ""}`);
    const snap = (msg, line, hl, extra) => F.snap(msg, line, M, 0, hl, extra);
    if (A0[0].length !== n) { snap("The determinant needs a square matrix.", 0); return F; }
    snap("Start with d = 1.", 0);
    let askedRep = false;
    for (let k = 0; k < n; k++) {
      let i = k; while (i < n && M[i][k].isZero()) i++;
      const ask = i < n && i !== k ? { type: "choice", prompt: "A row swap is coming. What does it do to the determinant?", options: ["nothing", "changes its sign", "multiplies it by the pivot", "makes it 0"], answer: ["changes its sign"] } : undefined;
      snap(`Column ${k + 1}: look for a nonzero entry in rows ${k + 1}–${n}.`, 2, { col: k, from: k }, ask ? { ask } : {});
      if (i === n) {
        d = Z(); notes.push(`column ${k + 1} has no pivot ⇒ det = 0`);
        F.push({ msg: `No pivot in column ${k + 1}: the rows are dependent and det A = 0 (A is singular).`, line: 3, M: M.map(r => r.map(fr)), aug: 0, hl: { col: k, from: k }, panel: `<h4>Result</h4><p>det A = <b>0</b></p>` + verdict(detCofactor(A0).isZero(), "Cofactor expansion agrees: det A = 0."), cert: { kind: "det", value: Z() } });
        return F;
      }
      if (i !== k) { [M[i], M[k]] = [M[k], M[i]]; d = d.neg(); notes.push(`swap rows ${k + 1}, ${i + 1}: sign flips`); snap(`Swap rows ${k + 1} and ${i + 1}: the determinant changes sign, so d ← −d = ${fr(d)}.`, 4, { rows: [k, i], piv: [k, k] }); }
      let first = true;
      for (let r = k + 1; r < n; r++) {
        if (M[r][k].isZero()) continue;
        const c = M[r][k].div(M[k][k]);
        if (first && !askedRep) {
          snap(`Next: subtract (${fr(c)})·row ${k + 1} from row ${r + 1}.`, 5, { piv: [k, k], rows: [r] }, { ask: { type: "choice", prompt: `Does “row ${r + 1} ← row ${r + 1} − (${fr(c)})·row ${k + 1}” change the determinant?`, options: ["no", "yes, it multiplies it by " + fr(c), "yes, it changes the sign"], answer: ["no"] } });
          askedRep = true;
        }
        first = false;
        M[r] = M[r].map((x, q) => x.sub(c.mul(M[k][q])));
        snap(`Row ${r + 1} ← row ${r + 1} − (${fr(c)})·row ${k + 1}. The determinant is unchanged.`, 6, { rows: [r], piv: [k, k] });
      }
      if (k === n - 1) snap(`The matrix is triangular now. Multiply in the last pivot, ${fr(M[k][k])}.`, 7, { piv: [k, k] }, { ask: { type: "number", prompt: "So what is det A?", answer: [String(d.mul(M[k][k]))] } });
      d = d.mul(M[k][k]); notes.push(`pivot ${k + 1}: × ${fr(M[k][k])}`);
      if (k < n - 1) snap(`Multiply in the pivot ${fr(M[k][k])}: d = ${fr(d)}.`, 7, { piv: [k, k] });
    }
    const ok = detCofactor(A0).eq(d);
    F.push({ msg: `det A = ${fr(d)}: the product of the pivots${notes.some(s => /swap/.test(s)) ? ", with one sign change per swap" : ""}.`, line: 8, M: M.map(r => r.map(fr)), aug: 0, hl: {},
      panel: `<h4>Result</h4><p>det A = <b>${fr(d)}</b></p>${verdict(ok, "Cofactor expansion along the first row gives the same value.")}<p class="lp-small">${d.isZero() ? "A is singular." : `A is nonsingular; area/volume scale by |det A| = ${fr(d.abs())}${d.sign() < 0 ? ", and orientation is reversed" : ""}.`}</p>`,
      cert: { kind: "det", value: d } });
    return F;
  },
  python(inst) {
    const A = inst.M.map(r => r.slice(0, r.length - inst.aug));
    return `from sympy import Matrix, Rational
import numpy as np
A = Matrix(${pyMat(A)})
print("exact:", A.det())                           # exact rational arithmetic
print("float:", np.linalg.det(np.array(A.tolist(), dtype=float)))   # LU in floating point: tiny rounding errors`;
  },
};

// ---- pipelines of plane transformations (homogeneous coordinates)
function parsePipeline(text) {
  const ops = [];
  for (const raw of String(text).split(/\n|;/).map(s => s.trim()).filter(Boolean)) {
    const [w, ...a] = raw.toLowerCase().split(/[\s,()]+/).filter(Boolean);
    const nums = a.map(R.parse);
    const bad = () => ({ error: `Could not read “${raw}”.` });
    let T;
    if (/^rot/.test(w)) {
      const deg = a[0] != null ? parseInt(a[0], 10) : NaN;
      if (!Number.isFinite(deg) || deg % 90) return { error: "Rotations are exact here, so use a multiple of 90 degrees (rotate 90, rotate -90, rotate 180)." };
      const q = ((deg / 90) % 4 + 4) % 4, c = [1, 0, -1, 0][q], s = [0, 1, 0, -1][q];
      T = [[c, -s, 0], [s, c, 0], [0, 0, 1]];
    } else if (/^trans/.test(w)) { if (nums.length !== 2 || nums.some(x => !x)) return bad(); T = [[1, 0, nums[0]], [0, 1, nums[1]], [0, 0, 1]]; }
    else if (/^scale/.test(w)) { if (!nums.length || nums.length > 2 || nums.some(x => !x)) return bad(); T = [[nums[0], 0, 0], [0, nums[1] || nums[0], 0], [0, 0, 1]]; }
    else if (/^shear/.test(w)) { if (nums.length !== 1 || !nums[0]) return bad(); T = [[1, nums[0], 0], [0, 1, 0], [0, 0, 1]]; }
    else if (/^refl/.test(w)) {
      const ax = a[0] || "x";
      T = ax === "x" ? [[1, 0, 0], [0, -1, 0], [0, 0, 1]] : ax === "y" ? [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] : /^(diag|y=x)$/.test(ax) ? [[0, 1, 0], [1, 0, 0], [0, 0, 1]] : null;
      if (!T) return { error: "reflect x, reflect y or reflect diag." };
    } else if (/^mat/.test(w)) { if (nums.length !== 4 || nums.some(x => !x)) return bad(); T = [[nums[0], nums[1], 0], [nums[2], nums[3], 0], [0, 0, 1]]; }
    else return { error: `Unknown step “${raw}”. Use rotate, translate, scale, shear, reflect or matrix.` };
    ops.push({ label: raw.replace(/\s+/g, " "), T: rm(T) });
  }
  if (!ops.length) return { error: "Type one step per line, e.g. rotate 90 / translate 2 1." };
  if (ops.length > 8) return { error: "At most 8 steps." };
  return { ops };
}
const SHAPE = [[0, 0], [1, 0], [1, 1], [0, 1]];
const happly = (M, p) => { const v = mvec(M, [R.of(p[0]), R.of(p[1]), ONE()]); return [v[0], v[1]]; };
const pstr = p => `(${fr(p[0])}, ${fr(p[1])})`;
function figSVG(layers) {
  const pts = layers.flatMap(l => l.pts).map(p => p.map(x => x.num()));
  let lo = Math.min(-1, ...pts.map(p => Math.min(p[0], p[1]))), hi = Math.max(2, ...pts.map(p => Math.max(p[0], p[1])));
  lo = Math.floor(lo) - 0.5; hi = Math.ceil(hi) + 0.5;
  const S = 240, k = S / (hi - lo), X = x => (x - lo) * k, Y = y => S - (y - lo) * k;
  let g = "";
  for (let t = Math.ceil(lo); t <= hi; t++) g += `<line x1="${X(t)}" y1="0" x2="${X(t)}" y2="${S}" class="${t === 0 ? "ax" : "gr"}"/><line x1="0" y1="${Y(t)}" x2="${S}" y2="${Y(t)}" class="${t === 0 ? "ax" : "gr"}"/>`;
  layers.forEach(l => {
    const P = l.pts.map(p => [X(p[0].num()), Y(p[1].num())]);
    g += `<polygon points="${P.map(p => p.join(",")).join(" ")}" class="${l.cls}"/>`;
    if (l.mark) g += `<circle cx="${P[1][0]}" cy="${P[1][1]}" r="4.5" class="${l.cls}-dot"/>`;
  });
  return `<svg class="lp-fig" viewBox="0 0 ${S} ${S}" role="img" aria-label="${esc(layers.map(l => l.label).join("; "))}">${g}</svg>`;
}
ALGOS.compose = {
  key: "compose", short: "Compose a graphics pipeline", title: "Composing transformations in homogeneous coordinates", ref: "Leon §4.2 (application), §4.1",
  input: "pipeline",
  pseudo: [
    "M ← I   (3×3 homogeneous identity)",
    "for each step T of the pipeline, in order:",
    "  write T as a 3×3 matrix (a translation goes in the last column)",
    "  M ← T · M     (the new step acts last, so it multiplies on the left)",
    "  the shape's corners are now M·(x, y, 1)ᵀ",
    "M is the whole pipeline: apply it to any point (x, y, 1)ᵀ",
  ],
  idea: "How it works: every step becomes a 3×3 matrix acting on (x, y, 1). The product of the step matrices, taken right to left, is one matrix for the whole pipeline. Idea: a translation is not linear in the plane, because it moves the origin. One dimension higher it is a shear, which is linear. So rotations, scalings and translations all compose by matrix multiplication, and the order of the factors is the order of the steps read from right to left.",
  presets: [
    { name: "Quarter-turn, then translate (W11.T1)", text: "rotate 90\ntranslate 2 1" },
    { name: "Translate, then quarter-turn", text: "translate 2 1\nrotate 90" },
    { name: "Shear, then scale", text: "shear 1\nscale 2 1/2" },
    { name: "Reflect, rotate, translate", text: "reflect x\nrotate 90\ntranslate -1 2" },
  ],
  help: "One step per line: rotate 90 · translate a b · scale s [t] · shear k · reflect x|y|diag · matrix a b c d.",
  run(inst) {
    let M = ident(3); const ops = inst.ops;
    let T = null, label = "";
    const F = recorder(() => `<h4>Picture</h4>${figSVG([{ pts: SHAPE.map(p => [R.of(p[0]), R.of(p[1])]), cls: "orig", label: "unit square" }, { pts: SHAPE.map(p => happly(M, p)), cls: "cur", mark: true, label: "image under M" }])}<p class="lp-small">Grey: the unit square. Blue: its image under the current M. The dot marks the corner (1, 0).</p>` + (T ? `<h4>Step matrix for “${esc(label)}”</h4>${mhtml(T, { small: true })}` : ""));
    const snap = (msg, line, hl, extra) => F.snap(msg, line, M, 0, hl, extra);
    snap("Start with M = I: nothing has happened yet. The main panel shows M.", 0);
    ops.forEach((op, k) => {
      const correct = pstr(happly(mmul(op.T, M), [1, 0]));
      const opts = [...new Set([correct, pstr(happly(mmul(M, op.T), [1, 0])), pstr(happly(op.T, [1, 0])), pstr(happly(M, [1, 0]))])].sort();
      T = op.T; label = op.label;
      snap(`Step ${k + 1}: “${esc(op.label)}” as a 3×3 matrix (see the state panel).`, 2, {}, { ask: { type: "choice", prompt: `After step ${k + 1}, where is the corner that started at (1, 0)?`, options: opts, answer: [correct] } });
      M = mmul(op.T, M);
      snap(`M ← T·M. The corner (1, 0) is now at ${correct}.`, 3, { rows: [0, 1] });
    });
    T = null;
    const lin = M[0][2].isZero() && M[1][2].isZero();
    const d2 = M[0][0].mul(M[1][1]).sub(M[0][1].mul(M[1][0]));
    F.push({ msg: `The whole pipeline is the single matrix M. ${lin ? "Its last column is (0, 0, 1): the origin stays put, so the pipeline is linear." : "Its last column moves the origin: the pipeline is affine, not linear."}`, line: 5, M: M.map(r => r.map(fr)), aug: 0, hl: {},
      panel: `<h4>Picture</h4>${figSVG([{ pts: SHAPE.map(p => [R.of(p[0]), R.of(p[1])]), cls: "orig", label: "unit square" }, { pts: SHAPE.map(p => happly(M, p)), cls: "cur", mark: true, label: "image under M" }])}` +
        `<p>Images of 0, e${sub(1)}, e${sub(2)}: ${[[0, 0], [1, 0], [0, 1]].map(p => pstr(happly(M, p))).join(", ")}.</p><p>det of the 2×2 part = ${fr(d2)}: areas scale by ${fr(d2.abs())}${d2.sign() < 0 ? " and orientation flips" : ""}.</p>`,
      cert: { kind: "pipeline", M } });
    return F;
  },
  python(inst) {
    const steps = inst.ops.map((op, k) => `T${k + 1} = np.array(${pyMat(op.T, true)})   # ${op.label}`).join("\n");
    const prod = inst.ops.map((_, k) => `T${inst.ops.length - k}`).join(" @ ");
    return `import numpy as np
${steps}
M = ${prod}                 # the last step is the leftmost factor
print(M)
corners = np.array([[0, 1, 1, 0], [0, 0, 1, 1], [1, 1, 1, 1]])   # the unit square, homogeneous
print(M @ corners)`;
  },
};

ALGOS.gs = {
  key: "gs", short: "Gram–Schmidt → QR, least squares", title: "Gram–Schmidt, exactly", ref: "Leon §5.6",
  input: "matrix",
  pseudo: [
    "for k = 1, …, n:",
    "  q_k ← a_k",
    "  for j = 1, …, k−1:",
    "    r(j,k) ← ⟨a_k, q_j⟩ / ⟨q_j, q_j⟩",
    "    q_k ← q_k − r(j,k) · q_j",
    "  if q_k = 0: a_k depends on a_1, …, a_{k−1}; stop",
    "normalize u_k = q_k / ‖q_k‖ to get A = QR",
    "least squares: c_j ← ⟨b, q_j⟩/⟨q_j, q_j⟩, then solve R x̂ = c by back substitution",
  ],
  idea: "How it works: take the columns one at a time. From each, subtract its projections onto the directions already built; what is left is perpendicular to all of them. Idea: projections onto mutually orthogonal vectors can be computed one at a time, so after orthogonalizing, the projection of b onto the column space is a plain sum. That turns least squares into back substitution. The lab skips normalization, so it works with exact fractions: A = Q̃R̃ with R̃ unit upper triangular, and ‖q_k‖² is shown instead of a square root.",
  presets: [
    { name: "Line fit (W11.T4): columns 1, t | y", text: "1 0 | 1\n1 1 | 2\n1 2 | 2" },
    { name: "Leon Example 5.6.2", text: "1 -1 4\n1 4 -2\n1 4 2\n1 -1 0" },
    { name: "(1,1), (1,0) (W09.T4)", text: "1 1\n1 0" },
    { name: "Dependent columns", text: "1 2 1\n1 2 0\n0 0 1" },
  ],
  help: "Columns are the vectors a₁, …, aₙ; an optional | column is b for least squares.",
  run(inst) {
    const m = inst.M.length, n = inst.M[0].length - inst.aug;
    const A = inst.M.map(r => r.slice(0, n)), b = inst.aug ? inst.M.map(r => r[n]) : null;
    const W = clone(A), Rt = ident(n), q = [];
    const F = recorder(() => `<h4>Built so far</h4>${q.length ? `<table class="lp-kv">${q.map((v, j) => `<tr><td>q${sub(j + 1)}</td><td>${vstr(v)}</td><td>‖q${sub(j + 1)}‖² = ${fr(dot(v, v))}</td></tr>`).join("")}</table>` : "<p>nothing yet</p>"}<h4>R̃ (coefficients)</h4>${mhtml(Rt, { small: true })}`);
    const show = () => W.map((r, i) => (b ? r.concat([b[i]]) : r));
    const snap = (msg, line, hl, extra) => F.snap(msg, line, show(), inst.aug ? 1 : 0, hl, extra);
    snap("Start: the main panel shows the working columns; finished columns become the orthogonal q's.", 0);
    for (let k = 0; k < n; k++) {
      let v = col(A, k);
      snap(`q${sub(k + 1)} starts as a${sub(k + 1)} = ${vstr(v)}.`, 1, { col: k });
      for (let j = 0; j < k; j++) {
        const c = dot(col(A, k), q[j]).div(dot(q[j], q[j]));
        snap(`Project a${sub(k + 1)} onto q${sub(j + 1)}.`, 3, { col: k }, { ask: { type: "number", prompt: `r(${j + 1},${k + 1}) = ⟨a${k + 1}, q${j + 1}⟩ / ⟨q${j + 1}, q${j + 1}⟩ = ?`, answer: [String(c)] } });
        Rt[j][k] = c; v = v.map((x, i) => x.sub(c.mul(q[j][i])));
        W.forEach((r, i) => { r[k] = v[i]; });
        snap(`r(${j + 1},${k + 1}) = ${fr(c)}; subtract ${fr(c)}·q${sub(j + 1)}: now q${sub(k + 1)} = ${vstr(v)}.`, 4, { col: k });
      }
      if (isZeroVec(v)) {
        F.push({ msg: `q${sub(k + 1)} = 0: a${sub(k + 1)} = ${Rt.slice(0, k).map((r, j) => `${fr(r[k])}·q${sub(j + 1)}`).join(" + ")} lies in the span of the earlier columns. Gram–Schmidt needs independent columns.`, line: 5, M: show().map(r => r.map(fr)), aug: inst.aug ? 1 : 0, hl: { col: k }, panel: F[F.length - 1].panel, cert: { kind: "dependent", k } });
        return F;
      }
      q.push(v);
      snap(`q${sub(k + 1)} is finished and orthogonal to ${k ? "all earlier q's" : "nothing yet (it is the first)"}.`, 1, { col: k });
    }
    let orth = true; for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) if (!dot(q[i], q[j]).isZero()) orth = false;
    const QR = A.map((_, i) => Rt[0].map((__, k) => q.reduce((s, v, j) => s.add(v[i].mul(Rt[j][k])), Z())));
    let panel = `<h4>Orthogonal basis</h4><table class="lp-kv">${q.map((v, j) => `<tr><td>q${sub(j + 1)}</td><td>${vstr(v)}</td><td>‖q${sub(j + 1)}‖² = ${fr(dot(v, v))}</td></tr>`).join("")}</table>${verdict(orth, "⟨q_i, q_j⟩ = 0 for every pair i ≠ j.")}${verdict(meq(QR, A), "Q̃·R̃ = A.")}<p class="lp-small">For A = QR with orthonormal columns, divide each q_k by ‖q_k‖ and multiply row k of R̃ by ‖q_k‖.</p>`;
    let cert = { kind: "gs", q, Rt };
    if (b) {
      const c = q.map(v => dot(b, v).div(dot(v, v))), x = zeros(n);
      for (let i = n - 1; i >= 0; i--) { let s = c[i]; for (let j = i + 1; j < n; j++) s = s.sub(Rt[i][j].mul(x[j])); x[i] = s; }
      const res = b.map((bi, i) => bi.sub(dot(A[i], x)));
      const ATr = A[0].map((_, j) => dot(col(A, j), res));
      panel += `<h4>Least squares</h4><p>c = ${vstr(c)}, x̂ = <b>${vstr(x)}</b></p><p>residual r = b − Ax̂ = ${vstr(res)}</p>${verdict(isZeroVec(ATr), "Aᵀr = 0: the residual is orthogonal to every column, which is the certificate that x̂ is a least squares solution (Theorem 5.3.2).")}`;
      cert = { kind: "lsq", q, Rt, x, res };
    }
    F.push({ msg: b ? `Done. The orthogonal basis gives the least squares solution x̂ = ${vstr(cert.x)} by back substitution.` : "Done: the columns q₁, …, qₙ are mutually orthogonal and span the same space as the a's.", line: b ? 7 : 6, M: show().map(r => r.map(fr)), aug: inst.aug ? 1 : 0, hl: {}, panel, cert });
    return F;
  },
  python(inst) {
    const n = inst.M[0].length - inst.aug;
    return `from sympy import Matrix, Rational, GramSchmidt
M = Matrix(${pyMat(inst.M)})
A = M[:, :${n}]
if A.rank() < A.cols:                                        # Gram–Schmidt needs independent columns
    print("dependent columns; relations A c = 0 for c in", [list(v) for v in A.nullspace()])
    raise SystemExit(0)
Q = GramSchmidt([A.col(j) for j in range(A.cols)])          # orthogonal (pass True to normalize)
print([list(q) for q in Q])
Qn, Rn = A.QRdecomposition()                                 # orthonormal Q, upper triangular R
print(Qn, Rn)` + (inst.aug ? `
b = M[:, ${n}]
xhat = (A.T * A).solve(A.T * b)                              # normal equations, exact
print("least squares x =", list(xhat), "  A^T r =", list(A.T * (b - A * xhat)))
import numpy as np
print(np.linalg.lstsq(np.array(A.tolist(), float), np.array(b.tolist(), float), rcond=None)[0])` : "");
  },
};

ALGOS.power = {
  key: "power", short: "Power method", title: "The power method", ref: "Leon §6.3 (Markov chains), §7.6",
  input: "matrix",
  pseudo: [
    "x ← x₀ = (1, 1, …, 1)",
    "repeat for k = 1, 2, …:",
    "  y ← A x",
    "  μ ← the entry of y that is largest in absolute value",
    "  x ← y / μ        (scale so that the largest entry is 1)",
    "  stop when x no longer changes",
    "μ ≈ λ₁ (the dominant eigenvalue) and x ≈ an eigenvector for it",
  ],
  idea: "How it works: multiply by A again and again, rescaling so the numbers stay readable. Idea: write x₀ in an eigenvector basis. Each multiplication multiplies the i-th component by λ_i, so after k steps the dominant eigenvalue's component wins by the factor |λ₁/λ₂|^k. That ratio is also how fast the method converges, the same rate at which a Markov chain forgets where it started.",
  presets: [
    { name: "Two apps (W12.T1)", text: "0.9 0.2\n0.1 0.8" },
    { name: "Faster mixing (W12.T5)", text: "0.8 0.3\n0.2 0.7" },
    { name: "Symmetric 2 × 2", text: "2 1\n1 3" },
    { name: "Population (Leslie)", text: "0 4 3\n1/2 0 0\n0 1/4 0" },
  ],
  help: "A square matrix. Arithmetic here is floating point.",
  run(inst) {
    const A = inst.M.map(r => r.slice(0, r.length - inst.aug).map(v => v.num())), n = A.length;
    let x = Array(n).fill(1), mu = NaN; const hist = [];
    const F = recorder(() => `<h4>History</h4><table class="lp-kv"><tr><th>k</th><th>μ_k</th><th>change in x</th></tr>${hist.slice(-8).map(h => `<tr><td>${h.k}</td><td>${ff(h.mu, 8)}</td><td>${ff(h.dx, 3)}</td></tr>`).join("")}</table>`);
    const show = () => A.map((r, i) => r.concat([x[i]]));
    const snap = (msg, line, hl, extra) => F.snap(msg, line, show(), 1, hl, extra);
    if (A[0].length !== n) { snap("The power method needs a square matrix.", 0); return F; }
    snap("Start with x₀ = (1, …, 1), shown after the bar.", 0);
    const KMAX = 300;
    for (let k = 1; k <= KMAX; k++) {
      const y = A.map(r => r.reduce((s, a, j) => s + a * x[j], 0));
      const big = Math.max(...y.map(Math.abs));
      if (big < 1e-300) { snap("A x = 0: x₀ has no component along a nonzero eigenvalue's eigenvector. Try another start.", 2); return F; }
      const top = y.map((v, i) => i).filter(i => Math.abs(Math.abs(y[i]) - big) <= 1e-9 * big);
      if (k <= 4) snap(`Iteration ${k}: multiply y = A x.`, 2, {}, { ask: { type: "choice", prompt: "Which entry of y = Ax will be largest in absolute value?", options: y.map((_, i) => `entry ${i + 1}`), answer: top.map(i => `entry ${i + 1}`) } });
      mu = y[top[0]];
      const nx = y.map(v => v / mu), dx = Math.max(...nx.map((v, i) => Math.abs(v - x[i])));
      x = nx; hist.push({ k, mu, dx });
      if (k <= 6 || dx < 1e-10 || k % 20 === 0) snap(`y = (${y.map(v => ff(v)).join(", ")}); μ${sub(k)} = ${ff(mu, 8)}; x ← y/μ.`, 4, { col: n });
      if (dx < 1e-10) break;
    }
    const res = Math.max(...A.map((r, i) => Math.abs(r.reduce((s, a, j) => s + a * x[j], 0) - mu * x[i])));
    let rate = "";
    if (hist.length > 4) { const h = hist.slice(-4).filter(h => h.dx > 1e-14); if (h.length >= 2) rate = ff(h[h.length - 1].dx / h[h.length - 2].dx, 4); }
    const conv = hist[hist.length - 1].dx < 1e-10;
    F.push({ msg: `${conv ? "Converged after" : "Stopped after"} ${hist.length} iteration${hist.length > 1 ? "s" : ""}: λ₁ ≈ ${ff(mu, 10)} with eigenvector x ≈ (${x.map(v => ff(v, 6)).join(", ")}).`, line: 6, M: show().map(r => r.map(fr)), aug: 1, hl: {},
      panel: `<h4>Result</h4><p>λ₁ ≈ <b>${ff(mu, 10)}</b></p><p>x ≈ (${x.map(v => ff(v, 8)).join(", ")})</p><p>‖Ax − μx‖∞ = ${ff(res, 3)}</p>${verdict(res < 1e-7, "x is an eigenvector to working accuracy.")}${rate ? `<p class="lp-small">Observed error ratio per step ≈ ${rate}, an estimate of |λ₂/λ₁|.</p>` : ""}${conv ? "" : `<p class="lp-small">Not converged after ${KMAX} iterations. If |λ₂| = |λ₁| the method need not converge at all.</p>`}`,
      cert: { kind: "eig", mu, x, res } });
    return F;
  },
  python(inst) {
    const A = inst.M.map(r => r.slice(0, r.length - inst.aug));
    return `import numpy as np
A = np.array(${pyMat(A, true)}, dtype=float)
x = np.ones(A.shape[0])
for k in range(100):
    y = A @ x
    mu = y[np.argmax(np.abs(y))]
    x_new = y / mu
    if np.max(np.abs(x_new - x)) < 1e-12:
        break
    x = x_new
print("lambda_1 ~", mu, " eigenvector ~", x_new)
print(np.linalg.eig(A))           # all eigenvalues, for comparison`;
  },
};

// ---- t-digit Gaussian elimination
function fl(x, t) { if (x === 0 || !isFinite(x)) return x; return Number((x * (1 + 1e-13)).toPrecision(t)); }
function fxs(x, t) { if (x === 0) return "0"; let s = x.toPrecision(t); if (/e/.test(s)) s = s.replace("e+", "·10^").replace("e-", "·10^-"); return s.replace(/-/g, MINUS); }
function tdigitSolve(Ain, bin, t, pivot, rec) {
  const n = Ain.length, A = Ain.map(r => r.slice()), b = bin.slice(), x = Array(n).fill(0);
  const show = () => A.map((r, i) => r.map(v => fxs(v, t)).concat([fxs(b[i], t)]));
  for (let k = 0; k < n - 1; k++) {
    let p = k;
    const col = A.slice(k).map(r => Math.abs(r[k])), big = Math.max(...col);
    const ties = []; col.forEach((v, i) => { if (v === big) ties.push(k + i); });
    if (pivot) {
      p = ties[0];
      rec && rec(`Column ${k + 1}: partial pivoting looks for the largest |a(i,${k + 1})| among rows ${k + 1}–${n}.`, 1, show(), { col: k, from: k }, { ask: { type: "choice", prompt: "Which row becomes the pivot row?", options: A.slice(k).map((_, i) => `row ${k + i + 1}`), answer: ties.map(i => `row ${i + 1}`) } });
      if (p !== k) { [A[p], A[k]] = [A[k], A[p]]; [b[p], b[k]] = [b[k], b[p]]; rec && rec(`Swap rows ${k + 1} and ${p + 1}: the pivot is now ${fxs(A[k][k], t)}.`, 1, show(), { rows: [k, p], piv: [k, k] }); }
    } else rec && rec(`Column ${k + 1}: no pivoting, so the pivot is a(${k + 1},${k + 1}) = ${fxs(A[k][k], t)}${big > 0 && Math.abs(A[k][k]) < big / 10 ? ", which is small compared with the entries below it" : ""}.`, 1, show(), { piv: [k, k] });
    if (A[k][k] === 0) { rec && rec("Zero pivot: elimination breaks down. Turn on partial pivoting.", 1, show(), { piv: [k, k] }, { cert: { kind: "breakdown" } }); return null; }
    for (let i = k + 1; i < n; i++) {
      const m = fl(A[i][k] / A[k][k], t);
      if (k === 0 && i === 1 && rec) rec(`Multiplier for row ${i + 1}: m = fl(a(${i + 1},${k + 1}) / a(${k + 1},${k + 1})).`, 3, show(), { piv: [k, k], rows: [i] }, { ask: { type: "number", prompt: `m = ? (to ${t} significant digits)`, answer: [String(m)], tol: Math.abs(m) * 0.5 * Math.pow(10, 1 - t) + 1e-300 } });
      A[i][k] = 0;
      for (let j = k + 1; j < n; j++) A[i][j] = fl(A[i][j] - fl(m * A[k][j], t), t);
      b[i] = fl(b[i] - fl(m * b[k], t), t);
      rec && rec(`m = ${fxs(m, t)}; row ${i + 1} ← row ${i + 1} − m·row ${k + 1}, every result rounded to ${t} digits.`, 4, show(), { rows: [i], piv: [k, k] });
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    if (A[i][i] === 0) { rec && rec("Zero pivot on the diagonal: the computed U is singular.", 5, show(), {}); return null; }
    let s = b[i];
    for (let j = i + 1; j < n; j++) s = fl(s - fl(A[i][j] * x[j], t), t);
    x[i] = fl(s / A[i][i], t);
    rec && rec(`Back substitution: x${sub(i + 1)} = ${fxs(x[i], t)}.`, 5, show(), { rows: [i] });
  }
  return x;
}
ALGOS.tdigit = {
  key: "tdigit", short: "Elimination in t digits", title: "Gaussian elimination in t-digit arithmetic", ref: "Leon §7.1–7.3",
  input: "matrix",
  params: [{ key: "t", label: "digits t", type: "number", min: 2, max: 10, def: 3 }, { key: "pivot", label: "partial pivoting", type: "bool", def: false }],
  pseudo: [
    "for k = 1, …, n−1:",
    "  [partial pivoting] choose i ≥ k with the largest |a(i,k)|; swap rows i and k",
    "  for i = k+1, …, n:",
    "    m ← fl(a(i,k) / a(k,k))",
    "    row i ← fl(row i − m · row k)   (every entry rounded to t digits)",
    "back substitution, rounding every operation to t digits",
    "compare with the exact solution: error and residual",
  ],
  idea: "How it works: ordinary elimination, except that every result is rounded to t significant digits, as a floating-point machine does. Idea: a tiny pivot makes a huge multiplier, and the huge multiplier swamps the other rows' information when the results are rounded. Choosing the largest available pivot keeps every |m| ≤ 1. That is partial pivoting, and it makes the algorithm stable. It cannot help with an ill-conditioned problem: that is a property of A, not of the algorithm.",
  presets: [
    { name: "Tiny pivot (Leon Example 7.3.3)", text: "0.0001 2 | 4\n1 1 | 3", params: { t: 3, pivot: false } },
    { name: "Same, with pivoting", text: "0.0001 2 | 4\n1 1 | 3", params: { t: 3, pivot: true } },
    { name: "Ill-conditioned (W04.T4, ε = 0.001)", text: "1 1 | 2\n1 1.001 | 2.001", params: { t: 4, pivot: true } },
    { name: "…same, b₂ changed by 0.001", text: "1 1 | 2\n1 1.001 | 2.002", params: { t: 4, pivot: true } },
    { name: "Burden–Faires (t = 4)", text: "0.003 59.14 | 59.17\n5.291 -6.13 | 46.78", params: { t: 4, pivot: false } },
  ],
  help: "A square system with | before b. Choose t and pivoting below.",
  run(inst, prm = {}) {
    const t = prm.t || 3, pivot = !!prm.pivot, n = inst.M.length;
    const F = recorder(() => panelNote);
    let panelNote = `<p class="lp-small">Working precision: ${t} significant digits; ${pivot ? "partial pivoting on" : "no pivoting"}.</p>`;
    if (inst.aug !== 1 || inst.M[0].length !== n + 1) { F.snap("Type a square system with one | column.", 0, inst.M, inst.aug); return F; }
    const A = inst.M.map(r => r.slice(0, n).map(v => fl(v.num(), t))), b = inst.M.map(r => fl(r[n].num(), t));
    F.snap(`Start: the system stored with ${t} significant digits.`, 0, A.map((r, i) => r.map(v => fxs(v, t)).concat([fxs(b[i], t)])), 1);
    const x = tdigitSolve(A, b, t, pivot, (msg, line, M, hl, extra) => F.snap(msg, line, M, 1, hl, extra));
    if (!x) return F;
    const ex = solve(inst.M.map(r => r.slice(0, n)), inst.M.map(r => r[n]));
    const exf = ex ? ex.map(v => v.num()) : null;
    const err = exf ? Math.max(...x.map((v, i) => Math.abs(v - exf[i]))) : NaN;
    const res = Math.max(...inst.M.map(r => Math.abs(r.slice(0, n).reduce((s, a, j) => s + a.num() * x[j], 0) - r[n].num())));
    const other = tdigitSolve(A, b, t, !pivot, null);
    const errO = other && exf ? Math.max(...other.map((v, i) => Math.abs(v - exf[i]))) : NaN;
    panelNote = `<h4>Result</h4><p>computed x = (${x.map(v => fxs(v, t)).join(", ")})</p><p>exact x = ${ex ? vstr(ex) + ` ≈ (${exf.map(v => ff(v, 8)).join(", ")})` : "(no unique solution)"}</p><p>error ‖x − x_exact‖∞ = ${ff(err, 3)}; residual ‖b − Ax‖∞ = ${ff(res, 3)}</p>` +
      (other ? `<p class="lp-small">${pivot ? "Without" : "With"} pivoting the same arithmetic gives (${other.map(v => fxs(v, t)).join(", ")}), error ${ff(errO, 3)}.</p>` : "");
    F.snap(`Done: x = (${x.map(v => fxs(v, t)).join(", ")}) in ${t}-digit arithmetic${pivot ? " with partial pivoting" : " without pivoting"}.`, 6, A.map((r, i) => r.map(v => fxs(v, t)).concat([fxs(b[i], t)])), 1, {}, { cert: { kind: "tdigit", x, ex, err, res, other } });
    return F;
  },
  python(inst, prm = {}) {
    const t = prm.t || 3, n = inst.M.length;
    return `from decimal import Decimal, getcontext, ROUND_HALF_UP
getcontext().prec = ${t}                      # every operation rounds to ${t} significant digits
getcontext().rounding = ROUND_HALF_UP
D = lambda s: +Decimal(s)                  # unary + rounds to the context precision
A = [[D("${inst.M.map(r => r.slice(0, n).map(v => String(v.num())).join('"), D("')).join('")], [D("')}")]]
b = [D("${inst.M.map(r => String(r[n].num())).join('"), D("')}")]
n, pivot = ${n}, ${prm.pivot ? "True" : "False"}
for k in range(n - 1):
    if pivot:
        p = max(range(k, n), key=lambda i: abs(A[i][k]))
        A[k], A[p], b[k], b[p] = A[p], A[k], b[p], b[k]
    for i in range(k + 1, n):
        m = A[i][k] / A[k][k]
        A[i] = [A[i][j] - m * A[k][j] for j in range(n)]
        b[i] = b[i] - m * b[k]
x = [Decimal(0)] * n
for i in reversed(range(n)):
    s = b[i]
    for j in range(i + 1, n):
        s = s - A[i][j] * x[j]
    x[i] = s / A[i][i]
print(x)`;
  },
};
function pyMat(M, plain) { return "[" + M.map(r => "[" + r.map(x => (x instanceof R ? (plain ? (x.isInt() ? x.py() : `${x.n}/${x.d}`) : x.py()) : String(x))).join(", ") + "]").join(", ") + "]"; }

// ---------------------------------------------------------------- decision guides
// A guide is a chain of yes/no questions; a Yes (or No) may end in a leaf. facts(inst) answers what the
// instance can decide, with a reason; null means "not decided by the matrix, answer it yourself".
function walk(guide, answers) {
  const path = [];
  for (const q of guide.chain) {
    const a = answers[q.key];
    if (a == null) return { path, pending: q.key };
    path.push({ key: q.key, ans: a });
    const leaf = a ? q.yes : q.no;
    if (leaf) return { path, leaf: guide.leaves[leaf], leafKey: leaf };
  }
  return { path };
}
const yes = (reason) => ({ ans: true, reason }), no = (reason) => ({ ans: false, reason }), ask = (reason) => ({ ans: null, reason });
const sq = inst => inst.M.map(r => r.slice(0, r.length - inst.aug));
function isTri(A) { const n = A.length; if (A[0].length !== n) return false; let up = true, lo = true; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if (i > j && !A[i][j].isZero()) up = false; if (i < j && !A[i][j].isZero()) lo = false; } return up || lo; }
function proportional(u, v) { const i = u.findIndex(x => !x.isZero()); if (i < 0 || v[i].isZero()) return isZeroVec(u) || isZeroVec(v) ? true : false; const c = v[i].div(u[i]); return u.every((x, k) => x.mul(c).eq(v[k])); }
function jacobiEig(S) {                                   // symmetric float matrix -> eigenvalues
  const n = S.length, A = S.map(r => r.slice());
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] * A[i][j];
    if (off < 1e-30) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-300) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const a = A[k][p], b = A[k][q]; A[k][p] = c * a - s * b; A[k][q] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = A[p][k], b = A[q][k]; A[p][k] = c * a - s * b; A[q][k] = s * a + c * b; }
    }
  }
  return A.map((r, i) => r[i]);
}
function cond2(A) { const Af = A.map(r => r.map(v => v.num())), AtA = Af[0].map((_, i) => Af[0].map((__, j) => Af.reduce((s, r) => s + r[i] * r[j], 0))); const e = jacobiEig(AtA).map(Math.abs); const lo = Math.min(...e), hi = Math.max(...e); return lo <= hi * 1e-28 ? Infinity : Math.sqrt(hi / lo); }
const normInf = A => Math.max(...A.map(r => r.reduce((s, x) => s + Math.abs(x.num()), 0)));
const GUIDES = {
  solve: {
    title: "How should I solve Ax = b?", algo: ["gj", "lu"],
    assumptions: "Exact arithmetic, small to medium n. For floating point the same chain applies, with partial pivoting (Chapter 7).",
    chain: [
      { key: "incons", q: "Does elimination produce a row 0 = c with c ≠ 0 (rank [A | b] > rank A)?", yes: "none" },
      { key: "free", q: "Is there a column of A without a pivot (rank A < number of unknowns)?", yes: "family" },
      { key: "tri", q: "Is A already triangular, with nonzero diagonal?", yes: "subst" },
      { key: "many", q: "Will you solve with this same A for several right-hand sides?", yes: "lu", no: "gauss" },
    ],
    leaves: {
      none: { name: "No solution: certify it", cost: "one elimination, about ⅔n³ operations", why: "Report a certificate y with yᵀA = 0 and yᵀb ≠ 0: whoever doubts it checks one product. If a best approximate answer is wanted, that is least squares (Chapter 5).", run: "gj" },
      family: { name: "Infinitely many solutions: parametrize", cost: "Gauss–Jordan to reduced row echelon form", why: "Free variables become parameters: x = x_p + t₁n₁ + … with A x_p = b and A n_i = 0 (W02.T2). Returning one solution does not answer the question.", run: "gj" },
      subst: { name: "Back (or forward) substitution", cost: "about n² operations", why: "No elimination is needed; solve from the last equation upward (Leon §1.1, strict triangular form)." },
      lu: { name: "Factor once: A = LU (or PA = LU)", cost: "⅔n³ once, then 2n² per right-hand side", why: "Store the multipliers; each new b costs a forward and a back substitution (W04.T2). Never form A⁻¹ for this: it costs more and is less accurate.", run: "lu" },
      gauss: { name: "Gaussian elimination with back substitution", cost: "about ⅔n³ operations", why: "Reduce [A | b] to row echelon form and back-substitute. Gauss–Jordan's extra upward sweep costs more than back substitution for large n.", run: "gj" },
    },
    why: "<p>The order matters. Consistency first, because a solver that silently returns “a” solution to an inconsistent system is answering a different question. Uniqueness second, because a family of solutions is a different answer from one vector. Only then does cost decide the method. A common wrong idea is “compute A⁻¹ and multiply”. That needs about three times the work of elimination and amplifies rounding errors, and when A is singular it fails without telling you whether the system is inconsistent or has a family of solutions.</p>",
    facts(inst) {
      const n = inst.M[0].length - inst.aug, A = sq(inst), rA = rank(A), rAb = rank(inst.M);
      const f = {};
      f.incons = rAb > rA ? yes(`rank A = ${rA} but rank [A | b] = ${rAb}`) : no(`rank A = rank [A | b] = ${rA}`);
      f.free = rA < n ? yes(`rank A = ${rA} < ${n} unknowns`) : no(`rank A = ${n}: a pivot in every column`);
      f.tri = A.length === n && isTri(A) && A.every((r, i) => !r[i].isZero()) ? yes("A is triangular with nonzero diagonal") : no(A.length !== n ? "A is not square" : "A has nonzero entries on both sides of the diagonal");
      f.many = ask("Not decided by the matrix: it depends on how many right-hand sides you have.");
      return f;
    },
  },
  det: {
    title: "How should I compute this determinant?", algo: ["det"],
    assumptions: "A square matrix with exact entries.",
    chain: [
      { key: "tri", q: "Is A triangular?", yes: "diag" },
      { key: "zero", q: "Does A have a zero row or column, or two proportional rows or columns?", yes: "zero" },
      { key: "small", q: "Is n ≤ 3, or is there a row or column with at most two nonzero entries?", yes: "cof", no: "elim" },
    ],
    leaves: {
      diag: { name: "Multiply the diagonal", cost: "n − 1 multiplications", why: "Theorem 2.1.3: the determinant of a triangular matrix is the product of its diagonal entries." },
      zero: { name: "det A = 0, no computation needed", cost: "inspection", why: "A zero row, or two proportional rows, makes the rows dependent (Leon §2.2). The same holds for columns because det Aᵀ = det A." },
      cof: { name: "Cofactor expansion along the sparsest row or column", cost: "a handful of 2×2 determinants", why: "Expanding along a row with many zeros skips most of the terms (Theorem 2.1.1)." },
      elim: { name: "Eliminate to triangular form, tracking swaps", cost: "about n³/3 operations", why: "Cofactor expansion needs about n! products, already 3.6 million for n = 10. Elimination gives det A as the product of the pivots, times (−1) per swap.", run: "det" },
    },
    why: "<p>Every rule here comes from one of three facts: the determinant of a triangular matrix is the product of its diagonal, row replacement does not change det, and a dependent set of rows gives det = 0. A common wrong idea is that scaling a row to make the pivot 1 is free. It multiplies the determinant by that factor, so keep track of it, or avoid scaling as the lab does.</p>",
    facts(inst) {
      const A = sq(inst), n = A.length, f = {};
      if (A[0].length !== n) return { tri: ask("A is not square, so it has no determinant.") };
      f.tri = isTri(A) ? yes("all entries on one side of the diagonal are 0") : no("nonzero entries on both sides of the diagonal");
      const rows = A, cols = tr(A); let why = "";
      rows.forEach((r, i) => { if (!why && isZeroVec(r)) why = `row ${i + 1} is zero`; });
      cols.forEach((c, j) => { if (!why && isZeroVec(c)) why = `column ${j + 1} is zero`; });
      for (let i = 0; i < n && !why; i++) for (let k = i + 1; k < n && !why; k++) { if (proportional(rows[i], rows[k])) why = `rows ${i + 1} and ${k + 1} are proportional`; else if (proportional(cols[i], cols[k])) why = `columns ${i + 1} and ${k + 1} are proportional`; }
      f.zero = why ? yes(why) : no("no zero or proportional rows or columns");
      const sparse = rows.concat(cols).some(v => v.filter(x => !x.isZero()).length <= 2);
      f.small = n <= 3 ? yes(`n = ${n}`) : sparse ? yes("a row or column has at most two nonzero entries") : no(`n = ${n} and every row and column has at least three nonzero entries`);
      return f;
    },
  },
  basis: {
    title: "Are these vectors a basis of ℝᵐ?", algo: ["rref"],
    assumptions: "The vectors are the columns of the matrix in the lab, so m is the number of rows.",
    chain: [
      { key: "more", q: "Are there more vectors than m?", yes: "dep" },
      { key: "obvious", q: "Is one of the vectors zero, or a multiple of another?", yes: "depobv" },
      { key: "fewer", q: "Are there fewer vectors than m?", yes: "nospan" },
      { key: "det", q: "Is the determinant of the square matrix nonzero?", yes: "basis", no: "dep2" },
    ],
    leaves: {
      dep: { name: "Dependent, so not a basis", cost: "a relation from row reduction", why: "In ℝᵐ any set of more than m vectors is linearly dependent (Theorem 3.4.1). Row reduction finds an explicit relation.", run: "rref" },
      depobv: { name: "Dependent, by inspection", cost: "none", why: "A zero vector or a pair of multiples gives a nontrivial relation at once, e.g. 2v − w = 0." },
      nospan: { name: "Cannot span ℝᵐ, so not a basis", cost: "row reduction for independence", why: "Fewer than m vectors span at most a subspace of dimension < m. They may still be independent: check for a pivot in every column.", run: "rref" },
      basis: { name: "A basis of ℝᵐ", cost: "one determinant", why: "m vectors in ℝᵐ are independent ⇔ they span ⇔ the matrix they form is nonsingular (Theorem 3.3.1, Theorem 3.4.3)." },
      dep2: { name: "Dependent, so not a basis", cost: "a relation from row reduction", why: "det = 0 means a nontrivial solution of Ax = 0 exists. Its entries are the coefficients of a dependence relation.", run: "rref" },
    },
    why: "<p>Counting first. Fewer than m vectors cannot span ℝᵐ and more than m cannot be independent, so only exactly m vectors can be a basis. Then a single determinant decides. A common wrong idea is that if no vector is a multiple of another, the set is independent. That fails for three or more vectors: e₁, e₂ and e₁ + e₂ are pairwise non-proportional but dependent (W05.T1).</p>",
    facts(inst) {
      const A = inst.M, m = A.length, n = A[0].length, cols = tr(A), f = {};
      f.more = n > m ? yes(`${n} vectors in ℝ${sup(m)}`) : no(`${n} vectors, m = ${m}`);
      let why = ""; cols.forEach((c, j) => { if (!why && isZeroVec(c)) why = `a${j + 1} = 0`; });
      for (let i = 0; i < n && !why; i++) for (let k = i + 1; k < n && !why; k++) if (proportional(cols[i], cols[k])) why = `a${i + 1} and a${k + 1} are multiples`;
      f.obvious = why ? yes(why) : no("no zero vector, no proportional pair");
      f.fewer = n < m ? yes(`${n} < ${m}`) : no(`${n} = ${m}`);
      if (n === m) { const d = det(A); f.det = d.isZero() ? no("det = 0") : yes(`det = ${fr(d)}`); }
      return f;
    },
  },
  pipeline: {
    title: "What kind of map is this pipeline?", algo: ["compose"],
    assumptions: "A pipeline of plane transformations, written as one 3×3 homogeneous matrix M.",
    chain: [
      { key: "moves", q: "Does M move the origin (is its last column different from (0, 0, 1))?", yes: "affine" },
      { key: "ortho", q: "Is the 2×2 part orthogonal (QᵀQ = I)?", yes: "rigid" },
      { key: "sing", q: "Is the determinant of the 2×2 part zero?", yes: "sing", no: "inv" },
    ],
    leaves: {
      affine: { name: "Affine, not linear: keep the 3×3 matrix", cost: "", why: "L(0) = 0 fails, so no 2×2 matrix can represent it. In homogeneous coordinates it is linear, and composition is multiplication (Leon §4.2). Points (x, y, 1) move; displacements (u, v, 0) ignore the translation (W11.T2)." },
      rigid: { name: "A rigid motion: rotation or reflection", cost: "", why: "Orthogonal matrices preserve lengths and angles. det = 1 means a rotation and det = −1 a reflection. The inverse is the transpose." },
      sing: { name: "Singular: the plane collapses onto a line or a point", cost: "", why: "det = 0, so the kernel is nonzero. Information is lost and no inverse exists, just like a bottleneck layer (W07.T3)." },
      inv: { name: "An invertible linear map", cost: "", why: "Undo the steps in reverse order: (T_k⋯T₁)⁻¹ = T₁⁻¹⋯T_k⁻¹. Areas scale by |det|, and orientation flips if det < 0." },
    },
    why: "<p>Linearity is decided by one point: a linear map must send 0 to 0. Then determinant and orthogonality sort out the rest. A common wrong idea is “det = 1, so it is a rotation”. The shear [[1, 1], [0, 1]] has det 1 but changes lengths (W08.T3).</p>",
    facts(inst) {
      const M = inst.ops ? inst.ops.reduce((P, op) => mmul(op.T, P), ident(3)) : inst.M, f = {};
      f.moves = M[0][2].isZero() && M[1][2].isZero() ? no("the last column is (0, 0, 1)") : yes(`the origin goes to (${fr(M[0][2])}, ${fr(M[1][2])})`);
      const B = [[M[0][0], M[0][1]], [M[1][0], M[1][1]]], BtB = mmul(tr(B), B);
      f.ortho = meq(BtB, ident(2)) ? yes("BᵀB = I") : no(`BᵀB = [[${BtB[0].map(fr)}], [${BtB[1].map(fr)}]] ≠ I`);
      const d = det(B); f.sing = d.isZero() ? yes("det = 0") : no(`det = ${fr(d)}`);
      return f;
    },
  },
  lsq: {
    title: "Least squares: which method?", algo: ["gs"],
    assumptions: "The matrix in the lab is [A | b], with more equations than unknowns.",
    chain: [
      { key: "cons", q: "Is Ax = b consistent (is b in the column space of A)?", yes: "exact" },
      { key: "rank", q: "Are the columns of A dependent (rank A < n)?", yes: "pinv" },
      { key: "cond", q: "Is A badly conditioned (cond₂(A) > 10⁴)?", yes: "qr", no: "normal" },
    ],
    leaves: {
      exact: { name: "Solve exactly: the residual is zero", cost: "elimination", why: "Least squares would return the same x with r = 0. Report the exact solution." },
      pinv: { name: "Not unique: use the minimum-norm solution", cost: "an SVD", why: "When AᵀA is singular, every x̂ + n with n ∈ N(A) fits equally well. The pseudoinverse picks the shortest one (Leon §6.5)." },
      qr: { name: "QR (Gram–Schmidt or Householder): R x̂ = Qᵀb", cost: "about 2mn² operations", why: "Forming AᵀA squares the condition number and loses about twice as many digits. QR works with A itself (Leon §5.6, §7.7).", run: "gs" },
      normal: { name: "The normal equations AᵀA x̂ = Aᵀb", cost: "about mn² + n³/3 operations", why: "With a well-conditioned A, the n×n system is cheap and accurate enough (Theorem 5.3.2).", run: "gs" },
    },
    why: "<p>Least squares replaces “solve Ax = b” by “make the residual orthogonal to the columns”: Aᵀ(b − Ax̂) = 0. The method is about how to solve that system safely. A common wrong idea is to delete equations until the system is square and solve that. You get an exact fit to some of the data and ignore the rest, and different deletions give different answers.</p>",
    facts(inst) {
      const n = inst.M[0].length - inst.aug, A = sq(inst), f = {};
      if (!inst.aug) return { cons: ask("Add a | column with b to use this guide.") };
      const rA = rank(A), rAb = rank(inst.M);
      f.cons = rAb === rA ? yes(`rank [A | b] = rank A = ${rA}`) : no(`rank [A | b] = ${rAb} > rank A = ${rA}`);
      f.rank = rA < n ? yes(`rank A = ${rA} < ${n}`) : no(`rank A = ${n}`);
      if (rA === n) { const c = cond2(A); f.cond = c > 1e4 ? yes(`cond₂(A) ≈ ${ff(c, 3)}`) : no(`cond₂(A) ≈ ${ff(c, 3)}`); }
      return f;
    },
  },
  diag: {
    title: "Is A diagonalizable?", algo: ["power"],
    assumptions: "A square matrix of size n ≤ 4 with exact entries, over the real numbers.",
    chain: [
      { key: "sym", q: "Is A symmetric?", yes: "spectral" },
      { key: "real", q: "Are all eigenvalues real?", no: "complex" },
      { key: "dist", q: "Are the n eigenvalues distinct?", yes: "distinct" },
      { key: "geo", q: "For every repeated eigenvalue λ, is dim N(A − λI) equal to its multiplicity?", yes: "enough", no: "defective" },
    ],
    leaves: {
      spectral: { name: "Yes, orthogonally: A = QDQᵀ", cost: "", why: "Spectral Theorem (Leon Theorem 6.4.4): real symmetric matrices have real eigenvalues and an orthonormal basis of eigenvectors." },
      complex: { name: "Not over ℝ (complex eigenvalues)", cost: "", why: "A real diagonalization needs real eigenvalues. Over ℂ, A is diagonalizable if its eigenvalues are distinct, e.g. a rotation." },
      distinct: { name: "Yes: distinct eigenvalues", cost: "", why: "Eigenvectors for distinct eigenvalues are independent (Theorem 6.3.1), and n of them form a basis." },
      enough: { name: "Yes: enough eigenvectors", cost: "", why: "Each eigenspace is as large as its eigenvalue's multiplicity, so the eigenvectors fill ℝⁿ." },
      defective: { name: "No: A is defective", cost: "", why: "Some eigenvalue has too few eigenvectors, like J = [[1, 1], [0, 1]] (W12.T4). A has no eigenvector basis; Jordan form (beyond Leon §6.3) takes over." },
    },
    why: "<p>Diagonalizable means ℝⁿ has a basis of eigenvectors. Symmetry guarantees one, distinct eigenvalues guarantee one, and otherwise the dimensions of the eigenspaces must be counted. A common wrong idea is “two equal eigenvalues means not diagonalizable” (and its converse). The identity has equal eigenvalues and is diagonal. J has equal eigenvalues and is not diagonalizable (W13.T4).</p>",
    facts(inst) {
      const A = sq(inst), n = A.length, f = {};
      if (A[0].length !== n) return { sym: ask("A is not square.") };
      if (n > 4) return { sym: ask("The exact test here handles n ≤ 4.") };
      f.sym = meq(A, tr(A)) ? yes("A = Aᵀ") : no("A ≠ Aᵀ");
      const p = charpoly(A), g = pgcd(p, pderiv(p)), nd = n - pdeg(g), nreal = sturmRealCount(p);
      f.real = nreal === nd ? yes(`p(λ) = ${polyStr(p)} has only real roots`) : no(`p(λ) = ${polyStr(p)} has ${nd - nreal} non-real root${nd - nreal > 1 ? "s" : ""}`);
      f.dist = nd === n ? yes(`${n} distinct eigenvalues`) : no(`only ${nd} distinct eigenvalue${nd > 1 ? "s" : ""} (a repeated root)`);
      if (nd < n) {
        const rep = rationalRoots(g), gd = pdeg(g) - Math.max(0, pdeg(pgcd(g, pderiv(g))));
        if (rep.length === gd) {
          const bad = rep.find(l => n - rank(A.map((r, i) => r.map((x, j) => (i === j ? x.sub(l) : x)))) < multiplicity(p, l));
          f.geo = bad ? no(`λ = ${fr(bad)} has multiplicity ${multiplicity(p, bad)} but only ${n - rank(A.map((r, i) => r.map((x, j) => (i === j ? x.sub(bad) : x))))} independent eigenvector(s)`) : yes(rep.map(l => `λ = ${fr(l)}: dim N(A − λI) = ${multiplicity(p, l)}`).join("; "));
        } else f.geo = ask("The repeated eigenvalue is irrational; compare dim N(A − λI) with its multiplicity by hand.");
      }
      return f;
    },
  },
  trust: {
    title: "Can I trust the computed solution?", algo: ["tdigit"],
    assumptions: "A square, nonsingular system [A | b] solved in t-digit floating-point arithmetic.",
    chain: [
      { key: "cond", q: "Is cond∞(A) at least 10^(t−1), so that all t digits may be lost?", yes: "ill" },
      { key: "tiny", q: "Without pivoting, would elimination meet a pivot less than a tenth of an entry below it?", yes: "pivot", no: "fine" },
    ],
    leaves: {
      ill: { name: "Ill-conditioned: no algorithm can fix this", cost: "", why: "Expect to lose about log₁₀ cond(A) digits whatever the method (Leon §7.4). Use more precision, or reformulate. W04.T4 shows the problem itself amplifying a change in the data." },
      pivot: { name: "Use partial pivoting (PA = LU)", cost: "comparisons only", params: { pivot: true }, why: "A tiny pivot makes a huge multiplier, and rounding then destroys the other rows. With the largest pivot, |m| ≤ 1 and elimination is stable in practice.", run: "tdigit" },
      fine: { name: "Gaussian elimination is fine here", cost: "", why: "The problem is well conditioned and the pivots are healthy. Expect about t − log₁₀ cond(A) correct digits. Partial pivoting is still the default in every library." },
    },
    why: "<p>Two different questions hide in “is the answer right?”. Conditioning asks whether the problem is sensitive to small changes in the data, and that is a property of A. Stability asks whether the algorithm adds more error than the data's own rounding, and that is a property of the method. Pivoting fixes stability, never conditioning. A common wrong idea is “the residual is small, so x is accurate”. For ill-conditioned A a tiny residual can come with a large error.</p>",
    facts(inst, prm = {}) {
      const t = prm.t || 3, n = inst.M.length, f = {};
      if (inst.aug !== 1 || inst.M[0].length !== n + 1) return { cond: ask("Type a square system with one | column.") };
      const A = sq(inst), Ai = inv(A);
      if (!Ai) return { cond: yes("A is singular: cond(A) = ∞") };
      const c = normInf(A) * normInf(Ai);
      f.cond = c >= Math.pow(10, t - 1) ? yes(`cond∞(A) ≈ ${ff(c, 4)} ≥ 10^${t - 1}`) : no(`cond∞(A) ≈ ${ff(c, 4)} < 10^${t - 1}`);
      const M = A.map(r => r.map(v => v.num())); let tiny = "";
      for (let k = 0; k < n - 1 && !tiny; k++) {
        const big = Math.max(...M.slice(k + 1).map(r => Math.abs(r[k])));
        if (Math.abs(M[k][k]) < big / 10) tiny = `pivot ${k + 1} is ${ff(M[k][k], 3)} but an entry below it is ${ff(big, 3)}`;
        if (M[k][k] === 0) break;
        for (let i = k + 1; i < n; i++) { const m = M[i][k] / M[k][k]; M[i] = M[i].map((x, j) => x - m * M[k][j]); }
      }
      f.tiny = tiny ? yes(tiny) : no("every pivot is at least a tenth of the entries below it");
      return f;
    },
  },
};
// a system of equations as text: 2x₁ − x₂ = 5
function sysHTML(A, b, names) {
  const n = A[0].length, nm = names || Array.from({ length: n }, (_, j) => `x${sub(j + 1)}`);
  return `<div class="lp-sys">${A.map((r, i) => {
    let s = "";
    r.forEach((c, j) => {
      c = R.of(c); if (c.isZero()) return;
      const a = c.abs(), coef = a.eq(1) ? "" : fr(a);
      s += s ? (c.sign() < 0 ? " − " : " + ") + coef + nm[j] : (c.sign() < 0 ? MINUS : "") + coef + nm[j];
    });
    return `<span>${s || "0"} = ${fr(R.of(b[i]))}</span>`;
  }).join("")}</div>`;
}
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = k => String(k).split("").map(c => SUP[+c] || c).join("");
function polyStr(p) {
  const out = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i]; if (c.isZero()) continue;
    const a = c.abs(), s = c.sign() < 0 ? " − " : " + ";
    const coef = i && a.eq(1) ? "" : fr(a);
    out.push(s + coef + (i ? "λ" + (i > 1 ? sup(i) : "") : ""));
  }
  const s = out.join("").replace(/^ \+ /, "").replace(/^ − /, MINUS);
  return s || "0";
}

const LabPlus = {
  R, rm, clone, ident, tr, mmul, mvec, dot, isZeroVec, meq, col, rref, rank, nullBasis, det, detCofactor, inv, solve,
  charpoly, pgcd, pderiv, pdeg, rationalRoots, multiplicity, sturmRealCount, polyStr,
  fr, ff, vstr, mhtml, esc, sub, sysHTML, sup, parseMatrix, parseVec, parsePipeline, matText, seedOf, rng, rint, rnz, pick, fl, fxs, tdigitSolve,
  ALGOS, GUIDES, walk, sheetURL, solutionsURL, WEEKS, chapters: {},
  chapter(cfg) { LabPlus.chapters[cfg.chapter] = cfg; if (typeof document !== "undefined" && LabPlus.mount) LabPlus.mount(cfg); return cfg; },
  parseInstance(algo, text) { return algo.input === "pipeline" ? parsePipeline(text) : parseMatrix(text); },
};
// ================================================================ UI (browser only)
if (typeof document !== "undefined") {
const store = {
  get(k, d) { try { const v = localStorage.getItem("la-plus:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("la-plus:" + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  del(k) { try { localStorage.removeItem("la-plus:" + k); } catch (e) { /* storage unavailable */ } },
  keys(prefix) { try { return Object.keys(localStorage).filter(k => k.startsWith("la-plus:" + prefix)).map(k => k.slice(8)); } catch (e) { return []; } },
};
const TEACHER = root.LAB_TEACHER === true;
const h = html => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const reduceMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const go = sel => { const t = document.querySelector(sel); if (t) t.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" }); };
const zoomK = el => { const r = el.getBoundingClientRect(); return el.offsetWidth ? r.width / el.offsetWidth : 1; };   // CSS zoom factor
const attr = s => esc(s).replace(/"/g, "&quot;");
let STUDIO = null;

// ---- study controls: page text size, card text size, card width, resizable panes
const SPLITS = [];
function studyControls() {
  const ZS = [0.8, 0.9, 1, 1.1, 1.25, 1.4, 1.6], CK = [0.85, 1, 1.15, 1.3, 1.5], html = document.documentElement;
  const num = (v, d) => (typeof v === "number" && isFinite(v) ? v : d);
  let z = num(store.get("zoom", 1), 1), ck = num(store.get("cardk", 1), 1), cw = num(store.get("cardw", 480), 480);
  const box = h(`<div class="lp-study" role="group" aria-label="Study controls">
    <button type="button" data-z="-1" aria-label="Smaller page text">A−</button>
    <button type="button" data-z="0" class="lp-zv" aria-label="Reset page text size">100%</button>
    <button type="button" data-z="1" aria-label="Larger page text">A+</button>
    <button type="button" data-more aria-expanded="false" aria-controls="lp-pop" aria-label="More study settings">⋯</button>
    <div class="lp-pop" id="lp-pop" hidden>
      <div class="lp-pr"><span>Card text</span><button type="button" data-ck="-1" aria-label="Smaller card text">A−</button><span class="lp-ckv"></span><button type="button" data-ck="1" aria-label="Larger card text">A+</button></div>
      <label class="lp-pr"><span>Card width</span><input type="range" min="300" max="1100" step="10" data-cw aria-label="Minimum card width"></label>
      <div class="lp-pr"><button type="button" data-reset>Reset layout</button></div>
      <p>Drag a card's right edge to resize the cards, and the bar between a lab's two panes to resize the panes. These settings are kept in this browser only.</p>
    </div></div>`);
  document.body.appendChild(box);
  const apply = () => {
    html.style.setProperty("--lp-zoom", z); html.style.setProperty("--lp-cardk", ck); html.style.setProperty("--lp-cardw", cw + "px");
    box.querySelector(".lp-zv").textContent = Math.round(z * 100) + "%";
    box.querySelector(".lp-ckv").textContent = Math.round(ck * 100) + "%";
    box.querySelector("[data-cw]").value = cw;
    document.dispatchEvent(new Event("lp-layout"));
  };
  const step = (arr, v, d) => { let i = arr.findIndex(x => Math.abs(x - v) < 1e-6); if (i < 0) i = arr.indexOf(1); return arr[Math.max(0, Math.min(arr.length - 1, i + d))]; };
  const pop = box.querySelector(".lp-pop"), more = box.querySelector("[data-more]");
  box.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.z != null) { z = +b.dataset.z ? step(ZS, z, +b.dataset.z) : 1; store.set("zoom", z); }
    else if (b.dataset.ck != null) { ck = step(CK, ck, +b.dataset.ck); store.set("cardk", ck); }
    else if (b === more) { pop.hidden = !pop.hidden; more.setAttribute("aria-expanded", String(!pop.hidden)); return; }
    else if (b.hasAttribute("data-reset")) { z = 1; ck = 1; cw = 480; ["zoom", "cardk", "cardw"].forEach(store.del); SPLITS.forEach(fn => fn()); store.keys("split:").forEach(store.del); }
    apply();
  });
  box.querySelector("[data-cw]").addEventListener("input", e => { cw = +e.target.value; store.set("cardw", cw); apply(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !pop.hidden) { pop.hidden = true; more.setAttribute("aria-expanded", "false"); more.focus(); } });
  document.addEventListener("click", e => { if (!pop.hidden && !box.contains(e.target)) { pop.hidden = true; more.setAttribute("aria-expanded", "false"); } });
  apply();
  document.querySelectorAll(".dcard").forEach(card => {
    if (card.querySelector(".lp-cw")) return;
    const hd = document.createElement("span"); hd.className = "lp-cw"; hd.title = "Drag to change the card width"; hd.setAttribute("aria-hidden", "true");
    card.appendChild(hd);
    hd.addEventListener("pointerdown", e => {
      e.preventDefault(); try { hd.setPointerCapture(e.pointerId); } catch (er) { /* synthetic event */ }
      const k = zoomK(card), w0 = card.offsetWidth, x0 = e.clientX;
      const move = ev => { cw = Math.round(Math.max(300, Math.min(1100, w0 + (ev.clientX - x0) / k))); html.style.setProperty("--lp-cardw", cw + "px"); box.querySelector("[data-cw]").value = cw; };
      const up = () => { hd.removeEventListener("pointermove", move); hd.removeEventListener("pointerup", up); hd.removeEventListener("pointercancel", up); store.set("cardw", cw); };
      hd.addEventListener("pointermove", move); hd.addEventListener("pointerup", up); hd.addEventListener("pointercancel", up);
    });
  });
}
function splitter(el, key) {
  if (el.classList.contains("lp-rs") || el.children.length < 2) return;
  el.classList.add("lp-rs");
  const hd = document.createElement("div"); hd.className = "lp-rh"; hd.tabIndex = 0;
  hd.setAttribute("role", "separator"); hd.setAttribute("aria-orientation", "vertical"); hd.setAttribute("aria-label", "Resize the two panes");
  hd.setAttribute("aria-valuemin", "20"); hd.setAttribute("aria-valuemax", "80");
  hd.title = "Drag to resize the panes (arrow keys work too); double-click to reset";
  el.appendChild(hd);
  let f = store.get("split:" + key, null);
  const place = () => {
    const cols = getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length;
    if (cols < 2) { hd.hidden = true; return; }
    hd.hidden = false;
    const a = el.children[0], gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    hd.style.left = (a.offsetLeft + a.offsetWidth + gap / 2) + "px";
  };
  const set = v => {
    f = v;
    if (v == null) { el.style.removeProperty("--lp-f"); el.classList.remove("lp-set"); } else { el.style.setProperty("--lp-f", v); el.classList.add("lp-set"); }
    hd.setAttribute("aria-valuenow", String(Math.round((v == null ? 0.5 : v) * 100)));
    requestAnimationFrame(place);
  };
  set(typeof f === "number" ? f : null);
  hd.addEventListener("pointerdown", e => {
    e.preventDefault(); try { hd.setPointerCapture(e.pointerId); } catch (er) { /* synthetic event */ }
    hd.classList.add("drag");
    const cs = getComputedStyle(el), padL = parseFloat(cs.paddingLeft) || 0, padR = parseFloat(cs.paddingRight) || 0, gap = parseFloat(cs.columnGap) || 0;
    const rect = el.getBoundingClientRect(), k = zoomK(el), inner = el.clientWidth - padL - padR - gap;
    const move = ev => { const x = (ev.clientX - rect.left) / k - padL - gap / 2; set(Math.max(0.2, Math.min(0.8, x / inner))); };
    const up = () => { hd.classList.remove("drag"); hd.removeEventListener("pointermove", move); hd.removeEventListener("pointerup", up); hd.removeEventListener("pointercancel", up); store.set("split:" + key, f); };
    hd.addEventListener("pointermove", move); hd.addEventListener("pointerup", up); hd.addEventListener("pointercancel", up);
  });
  hd.addEventListener("dblclick", () => { set(null); store.del("split:" + key); });
  hd.addEventListener("keydown", e => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault(); set(Math.max(0.2, Math.min(0.8, (f == null ? 0.5 : f) + (e.key === "ArrowLeft" ? -0.03 : 0.03)))); store.set("split:" + key, f);
  });
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(() => place()).observe(el);
  document.addEventListener("lp-layout", () => requestAnimationFrame(place));
  SPLITS.push(() => set(null));
}

// ---- definition cards: "why we need it" and practice links
function whyStrips(cfg) {
  Object.entries(cfg.why || {}).forEach(([id, txt]) => {
    const card = document.getElementById(id); if (!card || card.querySelector(".lp-why")) return;
    const t = card.querySelector(".dtext"); if (!t) return;
    t.insertAdjacentHTML("beforebegin", `<div class="lp-why"><b>Why we need it</b><span>${txt}</span></div>`);
  });
  Object.entries(cfg.practice || {}).forEach(([id, tasks]) => {
    const card = document.getElementById(id); if (!card) return;
    const body = card.querySelector(".dbody"); if (!body || body.querySelector(".lp-practice")) return;
    const p = h(`<p class="lp-practice"><b>Practice</b> ${tasks.map(t => `<a href="${sheetURL(t)}" target="_blank" rel="noopener">${t}</a>`).join(" · ")}</p>`);
    const det = body.querySelector("details");
    if (det) body.insertBefore(p, det); else body.appendChild(p);
  });
}

// ---- forms for certificates
function fieldsHTML(fields) {
  return `<div class="lp-fields">${fields.map(f => `<label class="lp-field"><span>${f.label}</span>${f.kind === "mat"
    ? `<textarea rows="${f.rows || 3}" data-k="${f.key}" spellcheck="false" placeholder="${attr(f.ph || "")}"></textarea>`
    : `<input data-k="${f.key}" autocomplete="off" spellcheck="false" placeholder="${attr(f.ph || "")}">`}</label>`).join("")}</div>`;
}
function readFields(box, fields) {
  const vals = {}, bad = [];
  fields.forEach(f => {
    const raw = box.querySelector(`[data-k="${f.key}"]`).value;
    let v = null;
    if (f.kind === "vec") v = parseVec(raw);
    else if (f.kind === "num") v = R.parse(raw);
    else if (f.kind === "mat") { const p = parseMatrix(raw); v = p.error ? null : p.M; }
    else v = raw.trim() || null;
    if (v == null) bad.push(f.label.replace(/<[^>]+>/g, "")); vals[f.key] = v;
  });
  return { vals, bad };
}
function runCheck(box, fields, check, out) {
  const { vals, bad } = readFields(box, fields);
  if (bad.length) { out.innerHTML = `<p class="lp-v bad">Could not read: ${esc(bad.join(", "))}. Use numbers such as 3, −5/2 or 0.25, separated by commas or spaces.</p>`; return null; }
  let r; try { r = check(vals); } catch (e) { r = { ok: false, msg: "That does not fit: " + esc(e.message) }; }
  out.innerHTML = `<p class="lp-v ${r.ok ? "ok" : "bad"}">${r.ok ? "✓" : "✗"} ${r.msg}</p>`;
  return r;
}

// ---- the motivating problem and the return to it
function motivation(cfg) {
  const mo = cfg.motivation, defs = document.getElementById("defs"); if (!defs) return;
  const solved = store.get(`ret:${cfg.chapter}`, false) === true;
  const sec = h(`<section class="sec" id="problem">
    <div class="sec-head"><span class="sec-num">?</span><h2>${mo.title}</h2><span class="sub">The motivating problem. Try it before reading on. At the end of the chapter you will come back to it with the tools to solve it and a certificate that proves your answer.</span></div>
    <div class="lp-motiv">
      <div class="lp-story">${mo.story}</div>
      <p class="lp-q"><b>Question.</b> ${mo.question}</p>
      <div class="lp-needs"><b>You will need</b><div class="chips">${mo.needs.map(([id, label]) => `<a class="chip" href="#${id}">${label}</a>`).join("")}</div></div>
      <div class="btnrow"><button type="button" class="btn primary" data-load>${mo.load.label}</button><a class="btn" href="#return">Solve it at the end ↓</a>${mo.sheet ? `<a class="btn" href="${sheetURL(mo.sheet)}" target="_blank" rel="noopener">Seminar ${mo.sheet} ↗</a>` : ""}<span class="lp-badge"${solved ? "" : " hidden"}>✓ solved with a certificate</span></div>
    </div></section>`);
  defs.parentNode.insertBefore(sec, defs);
  sec.querySelector("[data-load]").onclick = () => { if (STUDIO) { STUDIO.load(mo.load.algo, mo.load.text, mo.load.params, "watch"); go("#studio"); } };
}
function returnSec(cfg, main) {
  const mo = cfg.motivation, fin = mo.final;
  const sec = h(`<section class="sec" id="return">
    <div class="sec-head"><span class="sec-num">✓</span><h2>Back to the motivating problem</h2><span class="sub">${mo.title}: solve it now with the chapter's tools, and submit the evidence.</span></div>
    <div class="lp-motiv">
      <p class="lp-q"><b>Recall.</b> ${mo.recap || mo.question}</p>
      <div class="lp-final">${fin.prompt}</div>
      ${fieldsHTML(fin.fields)}
      <div class="btnrow"><button type="button" class="btn primary" data-fc>Check</button><button type="button" class="btn" data-fl>${mo.load.label}</button><a class="btn" href="#problem">↑ The problem</a></div>
      <div class="lp-ffb" role="status"></div>
      ${fin.after ? `<div class="lp-after" hidden><b>Now that you have solved it</b>${fin.after}</div>` : ""}
    </div></section>`);
  main.appendChild(sec);
  const out = sec.querySelector(".lp-ffb"), after = sec.querySelector(".lp-after");
  const done = () => { if (after) after.hidden = false; const b = document.querySelector("#problem .lp-badge"); if (b) b.hidden = false; };
  if (store.get(`ret:${cfg.chapter}`, false) === true && after) after.hidden = false;
  sec.querySelector("[data-fc]").onclick = () => { const r = runCheck(sec, fin.fields, fin.check, out); if (r && r.ok) { store.set(`ret:${cfg.chapter}`, true); done(); } };
  sec.querySelector("[data-fl]").onclick = () => { if (STUDIO) { STUDIO.load(mo.load.algo, mo.load.text, mo.load.params, "watch"); go("#studio"); } };
}
function tocLinks(cfg) {
  const row = document.querySelector("nav.toc .row"); if (!row) return;
  if (cfg.motivation) row.insertBefore(h(`<a href="#problem"><b>?</b>Problem</a>`), row.querySelector('a[href="#defs"]') || row.firstChild);
  if (cfg.studio) row.insertAdjacentHTML("beforeend", `<a href="#studio"><b>▶</b>Studio</a>`);
  if (cfg.motivation) row.insertAdjacentHTML("beforeend", `<a href="#return"><b>✓</b>Return</a>`);
}

// ---- the algorithm studio
const MODES = [["watch", "Watch"], ["predict", "Predict"], ["cert", "Check a certificate"], ["ticket", "Exit ticket"]];
const TABS = [["both", "State + pseudocode"], ["state", "State"], ["pseudo", "Pseudocode"], ["py", "Python"]];
function checkAnswer(a, given) {
  if (a.type === "choice") return a.answer.includes(given);
  const x = R.parse(given); if (!x) return null;
  if (a.tol != null) return a.answer.some(s => { const y = R.parse(s); return y && Math.abs(x.num() - y.num()) <= a.tol; });
  return a.answer.some(s => { const y = R.parse(s); return y && y.eq(x); });
}
function studio(cfg, main) {
  const S = cfg.studio, keys = S.algos.filter(k => ALGOS[k]);
  const sec = h(`<section class="sec" id="studio">
    <div class="sec-head"><span class="sec-num">▶</span><h2>Algorithm studio</h2><span class="sub">${S.sub || "Step through the chapter's algorithms on any matrix, predict each decisive step, check a certificate, or draw an exit ticket."}</span></div>
    <div class="lp-studio">
      <div class="lp-top">
        <div class="chips lp-algos" role="group" aria-label="Algorithm"${keys.length < 2 ? " hidden" : ""}>${keys.map(k => `<button type="button" class="chip" data-algo="${k}">${ALGOS[k].short}</button>`).join("")}</div>
        <div class="lp-modes" role="tablist" aria-label="Mode">${MODES.map(([k, l]) => `<button type="button" role="tab" data-mode="${k}" aria-selected="false">${l}</button>`).join("")}</div>
      </div>
      <div class="lp-algohead"><h3></h3><span class="src"></span></div>
      <div class="lp-inst">
        <div class="chips lp-presets" role="group" aria-label="Instances"></div>
        <div class="lp-params"></div>
        <details class="lp-edit"><summary>Edit the instance</summary><textarea rows="4" spellcheck="false" aria-label="Instance"></textarea>
          <div class="btnrow"><button type="button" class="btn sm primary" data-loadtxt>Load</button><span class="lp-err" role="alert"></span></div><p class="lp-small lp-help"></p></details>
      </div>
      <div class="lp-work">
        <div class="lp-split">
          <div class="lp-board">
            <div class="lp-mwrap"></div>
            <p class="lp-msg" aria-live="polite"></p>
            <div class="lp-ask" hidden></div>
            <div class="lp-ctl">
              <button type="button" class="btn sm" data-s="first" aria-label="First step">⏮</button>
              <button type="button" class="btn sm" data-s="prev" aria-label="Previous step">◀</button>
              <button type="button" class="btn sm primary" data-s="next" aria-label="Next step">Step ▶</button>
              <button type="button" class="btn sm" data-s="last" aria-label="Last step">⏭</button>
              <button type="button" class="btn sm" data-s="play">Play</button>
              <input type="range" class="lp-scrub" min="0" value="0" aria-label="Step">
              <span class="lp-pos"></span>
            </div>
            <p class="lp-score" hidden></p>
          </div>
          <div class="lp-side">
            <div class="lp-tabs" role="tablist" aria-label="Side panel">${TABS.map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="false">${l}</button>`).join("")}</div>
            <div class="lp-tabbody"></div>
          </div>
        </div>
        <div class="lp-certbox" hidden></div>
      </div>
      <div class="lp-ticket" hidden></div>
    </div>
    <div class="lp-more"></div>
  </section>`);
  main.appendChild(sec);
  const $ = s => sec.querySelector(s);
  const mwrap = $(".lp-mwrap"), msg = $(".lp-msg"), askBox = $(".lp-ask"), pos = $(".lp-pos"), scrub = $(".lp-scrub"), score = $(".lp-score");
  const tabbody = $(".lp-tabbody"), certBox = $(".lp-certbox"), ticketBox = $(".lp-ticket"), work = $(".lp-work"), instBox = $(".lp-inst"), errBox = $(".lp-err"), ta = $(".lp-edit textarea");
  const st = { algo: ALGOS[keys[0]], inst: null, text: "", prm: {}, F: [], i: 0, mode: "watch", tab: store.get("tab", "both"), answered: {}, score: [0, 0], timer: null };
  if (!TABS.some(t => t[0] === st.tab)) st.tab = "both";
  const presetsFor = a => (S.presets && S.presets[a.key] || []).concat(a.presets);

  function stop() { if (st.timer) { clearInterval(st.timer); st.timer = null; $('[data-s="play"]').textContent = "Play"; } }
  function limit() { if (st.mode !== "predict") return st.F.length - 1; for (let j = 0; j < st.F.length; j++) if (st.F[j].ask && !(j in st.answered)) return j; return st.F.length - 1; }
  function load(key, text, prm, mode) {
    const a = keys.includes(key) ? ALGOS[key] : st.algo;
    const inst = LabPlus.parseInstance(a, text);
    if (inst.error) { errBox.textContent = inst.error; return false; }
    errBox.textContent = "";
    st.algo = a; st.inst = inst; st.text = text;
    st.prm = {}; (a.params || []).forEach(q => { st.prm[q.key] = prm && prm[q.key] != null ? prm[q.key] : q.def; });
    head(); run();
    if (mode) setMode(mode);
    return true;
  }
  function run() {
    stop();
    try { st.F = st.algo.run(st.inst, st.prm); } catch (e) { st.F = []; errBox.textContent = "The lab could not run this instance: " + e.message; }
    if (!st.F.length) return;
    st.i = 0; st.answered = {}; st.score = [0, 0];
    if (st.mode === "cert") renderCert();
    render();
    document.dispatchEvent(new CustomEvent("lp-instance"));
  }
  function head() {
    const a = st.algo;
    sec.querySelectorAll("[data-algo]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.algo === a.key)));
    $(".lp-algohead h3").textContent = a.title; $(".lp-algohead .src").textContent = a.ref;
    $(".lp-presets").innerHTML = presetsFor(a).map((p, i) => `<button type="button" class="chip" data-pre="${i}">${esc(p.name)}</button>`).join("");
    $(".lp-params").innerHTML = (a.params || []).map(q => q.type === "bool"
      ? `<label class="lp-prm"><input type="checkbox" data-prm="${q.key}"${st.prm[q.key] ? " checked" : ""}> ${q.label}</label>`
      : `<label class="lp-prm">${q.label} <input type="number" class="mi" data-prm="${q.key}" min="${q.min}" max="${q.max}" value="${st.prm[q.key]}"></label>`).join("");
    ta.value = st.text; $(".lp-help").textContent = a.help || "";
    markPreset();
  }
  function markPreset() { const ps = presetsFor(st.algo); sec.querySelectorAll("[data-pre]").forEach(b => { const p = ps[+b.dataset.pre]; b.setAttribute("aria-pressed", String(p.text === st.text && Object.entries(p.params || {}).every(([k, v]) => st.prm[k] === v))); }); }
  function render() {
    const f = st.F[st.i]; if (!f) return;
    mwrap.innerHTML = mhtml(f.M, { aug: f.aug, hl: f.hl, label: "Current matrix" });
    msg.innerHTML = f.msg;
    if (st.mode === "predict" && f.ask) renderAsk(f); else { askBox.hidden = true; askBox.innerHTML = ""; }
    const lim = limit(), last = st.F.length - 1;
    pos.textContent = `step ${st.i + 1} / ${st.F.length}`;
    scrub.max = String(last); scrub.value = String(st.i);
    $('[data-s="first"]').disabled = $('[data-s="prev"]').disabled = st.i === 0;
    $('[data-s="next"]').disabled = $('[data-s="last"]').disabled = st.i >= Math.min(lim, last) || (st.mode === "predict" && st.i === lim && f.ask && !(st.i in st.answered));
    score.hidden = st.mode !== "predict";
    const asks = st.F.filter(x => x.ask).length;
    score.textContent = `Predictions: ${st.score[0]} of ${st.score[1]} right (${asks} questions in this run).`;
    side();
    markPreset();
  }
  function renderAsk(f) {
    const a = f.ask, done = st.answered[st.i];
    askBox.hidden = false;
    let html = `<p class="lp-askq"><b>Predict.</b> ${a.prompt}</p>`;
    if (a.type === "choice") html += `<div class="chips">${a.options.map(o => `<button type="button" class="chip" data-opt="${attr(o)}"${done ? " disabled" : ""}${done && done.given === o ? ' aria-pressed="true"' : ""}>${esc(o)}</button>`).join("")}</div>`;
    else html += `<div class="btnrow"><input class="mi lp-num" aria-label="Your answer" autocomplete="off"${done ? ` value="${attr(done.given)}" disabled` : ""}><button type="button" class="btn sm" data-chk${done ? " disabled" : ""}>Check</button></div>`;
    if (done) html += `<p class="lp-v ${done.ok ? "ok" : "bad"}">${done.ok ? "✓ Right." : "✗ Not this time."} ${a.answer.length > 1 ? "Accepted answers: " : "The answer: "}${a.answer.map(esc).join(", ")}. Step on to see why.</p>`;
    else html += `<p class="lp-small">Answer to continue.</p>`;
    askBox.innerHTML = html;
  }
  function answer(given) {
    const f = st.F[st.i]; if (!f || !f.ask || st.i in st.answered) return;
    const ok = checkAnswer(f.ask, given);
    if (ok == null) { askBox.querySelector(".lp-small").textContent = "Type a number such as 3, −5/2 or 0.25."; return; }
    st.answered[st.i] = { ok, given }; st.score[1]++; if (ok) st.score[0]++;
    render();
  }
  function side() {
    const f = st.F[st.i], a = st.algo;
    const pseudo = `<div class="lp-pseudo" aria-label="Pseudocode">${a.pseudo.map((ln, k) => { const lv = (ln.match(/^ */)[0].length / 2) | 0; return `<code class="lp-pl${k === f.line ? " on" : ""}" style="--lv:${lv}">${esc(ln.trim())}</code>`; }).join("")}</div>`;
    const parts = a.idea.split(" Idea: ");
    const idea = `<div class="lp-idea"><p><b>How it works.</b> ${esc(parts[0].replace(/^How it works: /, ""))}</p><p><b>Idea.</b> ${esc(parts[1] || "")}</p></div>`;
    const state = `<div class="lp-state">${f.panel || ""}</div>`;
    let body;
    if (st.tab === "both") body = `<div class="lp-sp"><div>${pseudo}${idea}</div>${state}</div>`;
    else if (st.tab === "state") body = state;
    else if (st.tab === "pseudo") body = pseudo + idea;
    else body = `<div class="btnrow"><button type="button" class="btn sm" data-copy>Copy</button><span class="lp-small">${{ power: "NumPy", compose: "NumPy", tdigit: "Python's decimal module" }[a.key] || "SymPy (exact)"} code for the instance in the studio.</span></div><pre class="lp-py"><code>${esc(a.python(st.inst, st.prm))}</code></pre>`;
    tabbody.innerHTML = body;
    sec.querySelectorAll("[data-tab]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === st.tab)));
    const on = tabbody.querySelector(".lp-pl.on"), box = tabbody.querySelector(".lp-pseudo");
    if (on && box && box.scrollHeight > box.clientHeight) box.scrollTop = Math.max(0, on.offsetTop - box.offsetTop - box.clientHeight / 2);
  }
  function setMode(m) {
    st.mode = m; stop();
    sec.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
    work.hidden = m === "ticket"; instBox.hidden = m === "ticket"; ticketBox.hidden = m !== "ticket"; certBox.hidden = m !== "cert";
    $(".lp-algohead").hidden = m === "ticket"; $(".lp-algos").hidden = keys.length < 2 || m === "ticket";
    if (m === "predict") { st.i = 0; st.answered = {}; st.score = [0, 0]; }
    if (m === "cert") renderCert();
    if (m === "ticket") renderTicket();
    if (st.F.length) render();
  }
  function renderCert() {
    const C = cfg.cert;
    if (!C) { certBox.innerHTML = "<p>This chapter has no certificate check yet.</p>"; return; }
    const ok = !C.algos || C.algos.includes(st.algo.key);
    const fields = ok ? C.fields(st.inst, st.prm) : [];
    certBox.innerHTML = `<h3>${C.title}</h3><p>${C.help}</p>` + (ok
      ? fieldsHTML(fields) + `<div class="btnrow"><button type="button" class="btn primary" data-cc>Check my certificate</button></div><div class="lp-cfb" role="status"></div><p class="lp-small">The check looks only at what you submit. It never shows the answer, so you can retry.</p>`
      : `<p class="lp-small">This check works with ${C.algos.map(k => ALGOS[k].short).join(" or ")}: switch algorithm above.</p>`);
    const b = certBox.querySelector("[data-cc]");
    if (b) b.onclick = () => runCheck(certBox, fields, vals => C.check(st.inst, vals, st.prm), certBox.querySelector(".lp-cfb"));
  }
  function renderTicket() {
    const T = cfg.tickets;
    if (!T) { ticketBox.innerHTML = "<p>No exit tickets for this chapter.</p>"; return; }
    ticketBox.innerHTML = `<h3>Exit ticket</h3><p>${T.intro || "A short individual task to do on paper with the lab closed."} Type your student number, or any seed. Everyone gets a different instance of the same task, and the same seed always gives the same ticket.</p>
      <div class="btnrow"><label class="lp-prm">Seed <input class="mi lp-seed" style="width:130px" autocomplete="off" value="${attr(store.get("seed", "") || "")}"></label><button type="button" class="btn primary" data-draw>Draw the ticket</button></div><div class="lp-tk"></div>`;
    const draw = () => {
      const s = ticketBox.querySelector(".lp-seed").value.trim() || "1"; store.set("seed", s);
      const t = T.make(s);
      ticketBox.querySelector(".lp-tk").innerHTML = `<div class="lp-tcard"><div class="lp-tref">Exit ticket · Chapter ${cfg.chapter} · seed ${esc(s)}</div>${t.html}` +
        (TEACHER ? `<div class="lp-key"><b>Key</b> ${t.key}</div>` : `<p class="lp-small">Work on paper and hand it in. Your teacher has the key for every seed.</p>`) + `</div>`;
    };
    ticketBox.querySelector("[data-draw]").onclick = draw;
    ticketBox.querySelector(".lp-seed").addEventListener("keydown", e => { if (e.key === "Enter") draw(); });
  }
  sec.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || !sec.contains(b)) return;
    if (b.dataset.algo) { const a = ALGOS[b.dataset.algo], p = presetsFor(a)[0]; const keep = a.input === st.algo.input && a.input === "matrix" ? st.text : p.text; load(a.key, keep, keep === p.text ? p.params : null); if (st.mode === "cert") renderCert(); }
    else if (b.dataset.mode) setMode(b.dataset.mode);
    else if (b.dataset.pre != null) { const p = presetsFor(st.algo)[+b.dataset.pre]; load(st.algo.key, p.text, p.params); }
    else if (b.hasAttribute("data-loadtxt")) load(st.algo.key, ta.value, st.prm);
    else if (b.dataset.s) {
      const lim = limit(), last = st.F.length - 1;
      if (b.dataset.s === "play") { if (st.timer) stop(); else { b.textContent = "Pause"; st.timer = setInterval(() => { const l2 = limit(); if (st.i >= Math.min(l2, last) || (st.mode === "predict" && st.F[st.i].ask && !(st.i in st.answered))) { stop(); return; } st.i++; render(); }, reduceMotion() ? 1600 : 1100); } return; }
      stop();
      if (b.dataset.s === "first") st.i = 0;
      if (b.dataset.s === "prev") st.i = Math.max(0, st.i - 1);
      if (b.dataset.s === "next") st.i = Math.min(Math.min(lim, last), st.i + 1);
      if (b.dataset.s === "last") st.i = Math.min(lim, last);
      render();
    }
    else if (b.dataset.tab) { st.tab = b.dataset.tab; store.set("tab", st.tab); side(); }
    else if (b.dataset.opt != null) answer(b.dataset.opt);
    else if (b.hasAttribute("data-chk")) answer(askBox.querySelector(".lp-num").value);
    else if (b.hasAttribute("data-copy")) {
      const code = tabbody.querySelector(".lp-py code").textContent;
      const done = () => { b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy"; }, 1400); };
      try { navigator.clipboard.writeText(code).then(done, () => { b.textContent = "Select the code to copy"; }); } catch (er) { b.textContent = "Select the code to copy"; }
    }
  });
  sec.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.classList.contains("lp-num")) answer(e.target.value); });
  sec.addEventListener("change", e => {
    const k = e.target.dataset && e.target.dataset.prm; if (!k) return;
    const q = (st.algo.params || []).find(x => x.key === k);
    st.prm[k] = q.type === "bool" ? e.target.checked : Math.max(q.min, Math.min(q.max, parseInt(e.target.value, 10) || q.def));
    run();
  });
  scrub.addEventListener("input", () => { stop(); st.i = Math.min(+scrub.value, limit()); render(); });
  const api = {
    load,
    current: () => ({ algo: st.algo, inst: st.inst, prm: st.prm, text: st.text }),
    instanceFor(algoKeys) {
      if (algoKeys.includes(st.algo.key)) return { inst: st.inst, prm: st.prm, algo: st.algo };
      const a = ALGOS[algoKeys[0]], p = presetsFor(a)[0]; const prm = {}; (a.params || []).forEach(q => { prm[q.key] = p.params && p.params[q.key] != null ? p.params[q.key] : q.def; });
      return { inst: LabPlus.parseInstance(a, p.text), prm, algo: a, preset: p.name };
    },
  };
  const first = presetsFor(st.algo)[0];
  load(st.algo.key, first.text, first.params);
  setMode("watch");
  const more = $(".lp-more");
  if (cfg.guide) guideUI(more, GUIDES[cfg.guide], api, keys);
  if (cfg.sheets) sheetsUI(more, cfg.sheets, api, keys);
  return api;
}

// ---- decision guide
function guideUI(host, G, api, keys) {
  let answers = {}, reasons = {}, auto = false, note = "";
  const noun = G.algo[0] === "compose" ? "pipeline" : "matrix";
  const box = h(`<div class="lp-guide"><h3>Which method? ${G.title}</h3><p class="lp-small"><b>Assumes:</b> ${G.assumptions}</p>
    <ol class="lp-chain"></ol>
    <div class="btnrow"><button type="button" class="btn" data-auto aria-pressed="false">Answer for the ${noun} in the studio</button><button type="button" class="btn" data-clear>Clear</button><span class="lp-small lp-gnote"></span></div>
    <details class="lp-whyrules"><summary>Why these rules</summary>${G.why}</details></div>`);
  host.appendChild(box);
  const chain = box.querySelector(".lp-chain"), autoBtn = box.querySelector("[data-auto]");
  const leafHTML = l => `<div class="lp-leaf"><b>${l.name}</b>${l.cost ? `<span class="lp-cost">${l.cost}</span>` : ""}<p>${l.why}</p>${l.run && keys.includes(l.run) ? `<button type="button" class="btn sm" data-run="${l.run}">Run ${ALGOS[l.run].short} in the studio</button>` : ""}</div>`;
  function draw() {
    const w = walk(G, answers), n = w.path.length + (w.pending ? 1 : 0);
    chain.innerHTML = G.chain.slice(0, n).map(q => {
      const a = answers[q.key], lk = a == null ? null : a ? q.yes : q.no;
      return `<li><div class="lp-gq"><span>${q.q}</span><span class="lp-yn" role="group" aria-label="Answer"><button type="button" data-k="${q.key}" data-a="1" aria-pressed="${a === true}">Yes</button><button type="button" data-k="${q.key}" data-a="0" aria-pressed="${a === false}">No</button></span></div>${reasons[q.key] ? `<p class="lp-reason">${reasons[q.key]}</p>` : ""}${lk ? leafHTML(G.leaves[lk]) : ""}</li>`;
    }).join("");
    box.querySelector(".lp-gnote").textContent = note;
  }
  function fill() {
    const cur = api.instanceFor(G.algo);
    if (!cur.inst || cur.inst.error) return;
    const facts = G.facts(cur.inst, cur.prm);
    answers = {}; reasons = {};
    Object.entries(facts).forEach(([k, v]) => { if (v.ans != null) answers[k] = v.ans; reasons[k] = (v.ans == null ? "" : "From the instance: ") + v.reason; });
    note = cur.preset ? `Using the preset “${cur.preset}”, because the studio is showing a different algorithm.` : "Stays live while you change the instance.";
    draw();
  }
  box.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.a) { auto = false; autoBtn.setAttribute("aria-pressed", "false"); note = ""; answers[b.dataset.k] = b.dataset.a === "1"; const i = G.chain.findIndex(q => q.key === b.dataset.k); G.chain.slice(i + 1).forEach(q => { delete answers[q.key]; }); reasons = {}; draw(); }
    else if (b.hasAttribute("data-auto")) { auto = !auto; autoBtn.setAttribute("aria-pressed", String(auto)); if (auto) fill(); else { reasons = {}; note = ""; draw(); } }
    else if (b.hasAttribute("data-clear")) { answers = {}; reasons = {}; auto = false; note = ""; autoBtn.setAttribute("aria-pressed", "false"); draw(); }
    else if (b.dataset.run) {
      const cur = api.current(), a = ALGOS[b.dataset.run], leaf = Object.values(G.leaves).find(l => l.run === b.dataset.run && b.closest(".lp-leaf").querySelector("b").textContent === l.name);
      const text = a.input === cur.algo.input ? cur.text : a.presets[0].text;
      api.load(a.key, text, Object.assign({}, cur.prm, leaf && leaf.params || {}), "watch"); go("#studio");
    }
  });
  document.addEventListener("lp-instance", () => { if (auto) fill(); });
  draw();
}

// ---- problem sheets
function sheetsUI(host, sheets, api, keys) {
  const loads = [];
  const pad = w => String(w).padStart(2, "0");
  host.insertAdjacentHTML("beforeend", `<div class="lp-sheets"><h3>Problem sheets for this chapter</h3><p class="lp-small">The course's seminar sheets that practise this chapter. Task links open the sheet on GitHub; “Load” puts the task's data into the studio.</p>${sheets.map(s => `<div class="lp-sheet"><div class="lp-sh"><a href="${sheetURL("W" + pad(s.week))}" target="_blank" rel="noopener"><b>Seminar ${pad(s.week)}</b> ${s.title}</a><a class="lp-small" href="${solutionsURL(s.week)}" target="_blank" rel="noopener">practice solutions ↗</a></div><ul>${s.tasks.map(t => `<li><a href="${sheetURL(t.id)}" target="_blank" rel="noopener"><b>${t.id}</b></a> ${t.note}${t.load && keys.includes(t.load.algo) ? ` <button type="button" class="btn sm" data-sl="${loads.push(t.load) - 1}">Load</button>` : ""}</li>`).join("")}</ul></div>`).join("")}</div>`);
  host.querySelector(".lp-sheets").addEventListener("click", e => { const b = e.target.closest("[data-sl]"); if (!b) return; const l = loads[+b.dataset.sl]; api.load(l.algo, l.text, l.params, "watch"); go("#studio"); });
}

LabPlus.mount = function (cfg) {
  const go1 = () => {
    try {
      const main = document.querySelector("main") || document.body;
      whyStrips(cfg);
      STUDIO = cfg.studio ? studio(cfg, main) : null;
      if (cfg.motivation) { motivation(cfg); returnSec(cfg, main); }
      tocLinks(cfg);
      studyControls();
      document.querySelectorAll(".lab").forEach(lab => lab.querySelectorAll(".bench").forEach((b, i) => splitter(b, `${cfg.chapter}:${lab.id}:${i}`)));
      document.querySelectorAll(".lp-split").forEach((b, i) => splitter(b, `${cfg.chapter}:studio:${i}`));
      if (/^#(problem|studio|return)$/.test(location.hash)) go(location.hash);
    } catch (e) { console.error("LabPlus:", e); }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go1); else go1();
};
}

root.LabPlus = LabPlus;
if (typeof module !== "undefined" && module.exports) module.exports = LabPlus;
})(typeof window !== "undefined" ? window : globalThis);
