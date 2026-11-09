(() => {
"use strict";
const { $, MINUS, HOOK, goto, el, fmt, gcd, Q, matHTML, lbl, q, qm, ch, fl, cl, vec, mat, num, buildExercises, sm, renderDefinitions, setStore, plane2D, draggable } = LA;
setStore("leon-ch6-solved-v1");
const S_ = n => `<sub>${n}</sub>`;
const qf = v => Q.parse(String(+(+v).toFixed(6)));
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;
const colM = v => v.map(x => [x]);
const toF = v => v instanceof Q ? v.n / v.d : +v;
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const nrm = a => Math.sqrt(dot(a, a));
const scl = (c, a) => a.map(v => c * v);
const fT = A => A[0].map((_, j) => A.map(r => r[j]));
const fmul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
const fapp = (A, p) => A.map(r => dot(r, p));
const kv = rows => rows.map(([k, v, c]) => `<tr${c ? ` class="${c}"` : ""}><th>${k}</th><td>${v}</td></tr>`).join("");

function nice(v) {
  if (!isFinite(v)) return "—";
  if (Math.abs(v) < 1e-10) return "0";
  const sg = v < 0 ? MINUS : "", a = Math.abs(v);
  for (let d = 1; d <= 64; d++) { const n = Math.round(a * d); if (Math.abs(a - n / d) < 1e-9 * Math.max(1, a)) return sg + (d === 1 ? n : `${n}/${d}`); }
  const s2 = a * a;
  for (let d = 1; d <= 64; d++) {
    const n = Math.round(s2 * d);
    if (n > 0 && n < 20000 && Math.abs(s2 - n / d) < 1e-9 * Math.max(1, s2)) {
      let m = n * d, k = 1;
      for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; }
      const g = gcd(k, d), kk = k / g, dd = d / g;
      return sg + (kk === 1 ? "" : kk) + "√" + m + (dd === 1 ? "" : "/" + dd);
    }
  }
  return sg + (+a.toFixed(4)).toString();
}
const nv = v => `(${v.map(nice).join(", ")})`;
const niceM = M => matHTML(M, { render: v => typeof v === "number" ? nice(v) : (v instanceof Q ? v.html() : v) });

function gridIn(host, vals, o = {}) {
  let h = `<div class="mat gridin"><table>`;
  vals.forEach((row, i) => { h += `<tr>${row.map((v, j) => `<td class="inp"><input class="mi" style="width:${o.w || 54}px" data-i="${i}" data-j="${j}" value="${v.txt().replace(MINUS, "-")}" aria-label="${o.name || "entry"} ${i + 1},${j + 1}" autocomplete="off"></td>`).join("")}</tr>`; });
  host.innerHTML = o.label ? lbl(h + `</table></div>`, o.label) : h + `</table></div>`;
  host.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
    const v = Q.parse(inp.value); inp.classList.toggle("wrong", !v);
    if (v) { vals[+inp.dataset.i][+inp.dataset.j] = v; if (o.onChange) o.onChange(); }
  }));
}
const resize = (vals, m, n) => Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => (vals[i] && vals[i][j]) || new Q(i === j ? 1 : 0)));
function chipRow(host, items, cur, onPick, fmtf = x => x) {
  host.innerHTML = "";
  items.forEach(v => { const b = document.createElement("button"); b.className = "chip"; b.textContent = fmtf(v); b.setAttribute("aria-pressed", v === cur); b.onclick = () => onPick(v); host.appendChild(b); });
}
function presetRow(host, list, onPick) {
  host.innerHTML = "";
  list.forEach((p, k) => { const b = document.createElement("button"); b.className = "chip"; b.textContent = p.name || p[0]; b.onclick = () => onPick(k); host.appendChild(b); });
  return k => host.querySelectorAll(".chip").forEach((b, i) => b.setAttribute("aria-pressed", i === k));
}
function gsolve(A, b) {
  const n = A.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let i = c + 1; i < n; i++) { const f = M[i][c] / M[c][c]; for (let k = c; k <= n; k++) M[i][k] -= f * M[c][k]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let k = i + 1; k < n; k++) s -= M[i][k] * x[k]; x[i] = s / M[i][i]; }
  return x;
}

/* ---------- exact eigenvalues: characteristic polynomial + rational roots ---------- */
function charPoly(A) { // coefficients of det(λI − A) = λⁿ + a₁λⁿ⁻¹ + … + aₙ
  const n = A.length; let M = qm.I(n); const a = [new Q(1)];
  for (let k = 1; k <= n; k++) {
    const AM = qm.mul(A, M); let tr = new Q(0); for (let i = 0; i < n; i++) tr = tr.add(AM[i][i]);
    const ck = tr.neg().div(k); a.push(ck);
    M = AM.map((r, i) => r.map((v, j) => i === j ? v.add(ck) : v));
  }
  return a;
}
const evalQ = (p, r) => p.reduce((s, c) => s.mul(r).add(c), new Q(0));
const deflate = (p, r) => { const out = []; let acc = new Q(0); for (let i = 0; i < p.length - 1; i++) { acc = acc.mul(r).add(p[i]); out.push(acc); } return out; };
function ratRoots(c) {
  let p = c.slice(); const roots = [];
  for (let guard = 0; p.length > 1 && guard < 12; guard++) {
    if (p[p.length - 1].zero) { roots.push(new Q(0)); p = p.slice(0, -1); continue; }
    const L = p.reduce((l, v) => l / gcd(l, v.d) * v.d, 1), ints = p.map(v => v.n * (L / v.d));
    const a0 = Math.abs(ints[ints.length - 1]), an = Math.abs(ints[0]);
    const divs = m => { const d = []; for (let i = 1; i <= Math.min(m, 20000); i++) if (m % i === 0) d.push(i); return d; };
    let found = null;
    outer: for (const pp of divs(a0)) for (const qq of divs(an)) for (const s of [1, -1]) { const r = new Q(s * pp, qq); if (evalQ(p, r).zero) { found = r; break outer; } }
    if (!found) break;
    roots.push(found); p = deflate(p, found);
  }
  return { roots, rest: p };
}
// all eigen information for a small Q matrix
function eigen(A) {
  const n = A.length, cp = charPoly(A), { roots, rest } = ratRoots(cp);
  const groups = [];
  roots.forEach(r => { const g = groups.find(x => x.l.eq(r)); if (g) g.alg++; else groups.push({ l: r, alg: 1 }); });
  groups.sort((x, y) => toF(y.l) - toF(x.l));
  groups.forEach(g => { g.basis = qm.nullBasis(A.map((row, i) => row.map((v, j) => i === j ? v.sub(g.l) : v))); g.geo = g.basis.length; });
  const other = [];
  if (rest.length === 3) {
    const a = toF(rest[0]), b = toF(rest[1]), c = toF(rest[2]), D = b * b - 4 * a * c;
    if (D >= 0) other.push({ re: (-b + Math.sqrt(D)) / (2 * a), im: 0 }, { re: (-b - Math.sqrt(D)) / (2 * a), im: 0 });
    else other.push({ re: -b / (2 * a), im: Math.sqrt(-D) / (2 * a) }, { re: -b / (2 * a), im: -Math.sqrt(-D) / (2 * a) });
  } else if (rest.length > 3) other.push({ re: NaN, im: 0, unknown: rest.length - 1 });
  return { n, cp, groups, other, diag: !other.length && groups.reduce((s, g) => s + g.geo, 0) === n };
}
const cplx = z => z.im === 0 ? nice(z.re) : `${nice(z.re) === "0" ? "" : nice(z.re) + " "}${z.im < 0 ? MINUS : (nice(z.re) === "0" ? "" : "+")} ${nice(Math.abs(z.im))}i`.trim();
function polyHTML(c, v = "λ", sign = 1) { // c high→low (Q)
  const deg = c.length - 1, parts = [];
  c.forEach((x0, i) => { const x = sign < 0 ? x0.neg() : x0; if (x.zero) return; const pw = deg - i, a = x.abs(); const mon = pw === 0 ? "" : pw === 1 ? v : `${v}${"⁰¹²³⁴⁵"[pw]}`; parts.push({ neg: x.neg_, body: (a.one && mon ? "" : a.html()) + mon }); });
  return parts.map((p, k) => (k ? (p.neg ? ` ${MINUS} ` : " + ") : (p.neg ? MINUS : "")) + p.body).join("") || "0";
}
function fEig2(F) { // float eigen of 2x2: [{re,im,vec?}]
  const tr = F[0][0] + F[1][1], det = F[0][0] * F[1][1] - F[0][1] * F[1][0], D = tr * tr / 4 - det;
  if (D < -1e-12) return { real: false, re: tr / 2, im: Math.sqrt(-D), tr, det };
  const s = Math.sqrt(Math.max(0, D)), ls = [tr / 2 + s, tr / 2 - s];
  const vecs = ls.map(l => { const a = F[0][0] - l, b = F[0][1], c = F[1][0], d = F[1][1] - l; let v = Math.hypot(a, b) > Math.hypot(c, d) ? [-b, a] : [-d, c]; if (nrm(v) < 1e-12) v = ls[0] === ls[1] ? [1, 0] : [1, 0]; return scl(1 / nrm(v), v); });
  return { real: true, ls, vecs, tr, det };
}

/* =========================================================
   LAB · Eigenvector hunter
   ========================================================= */
(function eigLab() {
  const PRE = [["Example 2", [[4, -2], [1, 1]]], ["Example 3", [[3, 2], [3, -2]]], ["Ex 1(a)", [[3, 2], [4, 1]]], ["Ex 1(b)", [[6, -4], [3, -1]]], ["Ex 1(c): defective", [[3, -1], [1, 1]]], ["Ex 1(d): complex", [[3, -8], [2, 3]]], ["rotation 90°", [[0, -1], [1, 0]]], ["symmetric", [[2, 1], [1, 2]]], ["Markov (Ex 6.1.1)", [["0.7", "0.2"], ["0.3", "0.8"]]]];
  const S = { A: qm.of(PRE[0][1]), th: 0.6, k: 0, anim: null };
  const P = plane2D($("#eg-svg"), { R: 5.2 });
  let dirs = [];
  const D = draggable(P, () => [[Math.cos(S.th), Math.sin(S.th)]], (i, p) => {
    let th = Math.atan2(p[1], p[0]);
    for (const d of dirs) for (const s of [1, -1]) { const a = Math.atan2(s * d[1], s * d[0]); let df = Math.abs(th - a); df = Math.min(df, 2 * Math.PI - df); if (df < 0.05) th = a; }
    S.th = th; draw();
  }, { snap: 0, lim: 5 });
  const mark = presetRow($("#eg-presets"), PRE, k => { S.k = k; S.A = qm.of(PRE[k][1]); build(); });
  $("#eg-sweep").onclick = () => {
    if (S.anim) cancelAnimationFrame(S.anim);
    const t0 = performance.now(), th0 = S.th;
    const step = now => { const t = Math.min(1, (now - t0) / 7000); S.th = th0 + 2 * Math.PI * t; draw(); if (t < 1) S.anim = requestAnimationFrame(step); else S.anim = null; };
    S.anim = requestAnimationFrame(step);
  };
  function build() { mark(S.k); gridIn($("#eg-in"), S.A, { label: "A", onChange: () => { S.k = -1; mark(-1); draw(); } }); draw(); }
  function draw() {
    const F = S.A.map(r => r.map(toF)), E = eigen(S.A), fe = fEig2(F);
    dirs = fe.real ? fe.vecs : [];
    P.clear();
    el("circle", { cx: P.X(0), cy: P.Y(0), r: P.sc, fill: "none", style: "stroke:var(--muted)", "stroke-width": 1.5 }, P.layers.under);
    const pts = []; for (let t = 0; t <= 360; t += 3) { const a = t * Math.PI / 180; const w = fapp(F, [Math.cos(a), Math.sin(a)]); pts.push(`${P.X(w[0])},${P.Y(w[1])}`); }
    el("polyline", { points: pts.join(" "), fill: "none", style: "stroke:var(--c2)", "stroke-opacity": .45, "stroke-width": 1.5 }, P.layers.under);
    if (fe.real) fe.vecs.forEach((v, i) => P.lineThrough(P.layers.under, [0, 0], v, { style: `stroke:var(--${i ? "c3" : "pivot"})`, "stroke-dasharray": "6 5", "stroke-width": 1.8 }));
    const x = [Math.cos(S.th), Math.sin(S.th)], Ax = fapp(F, x);
    P.arrow(P.layers.mid, [0, 0], Ax, "c2", 3.5); P.arrow(P.layers.mid, [0, 0], x, "c1", 3.5);
    P.text(P.layers.top, [Ax[0] + 0.12, Ax[1] + 0.2], "Ax", { class: "f2", "font-weight": 700 });
    D.draw(["x"], ["f1"]);
    const cr = x[0] * Ax[1] - x[1] * Ax[0], par = Math.abs(cr) < 1e-9, lam = dot(x, Ax);
    const evs = E.groups.map(g => `${g.l.txt()}${g.alg > 1 ? ` (×${g.alg})` : ""}`).concat(E.other.map(cplx));
    const vecs = E.groups.map(g => `λ = ${g.l.txt()}: ${g.basis.map(b => `(${b.map(t => t.txt()).join(", ")})`).join(", ")}`);
    $("#eg-tab").innerHTML = kv([["tr A, det A", `${E.cp[1].neg().txt()}, ${E.cp[2].txt()}`], ["det(A − λI)", polyHTML(E.cp)], ["eigenvalues", evs.join(", "), "amb"], ["eigenvectors", vecs.join("; ") || "none real"], ["x, Ax", `(${x.map(v => fmt(v, 3)).join(", ")}), (${Ax.map(v => fmt(v, 3)).join(", ")})`]]);
    const st = $("#eg-status");
    if (par) { st.className = "status ok"; st.innerHTML = `<span class="k math">Ax = ${nice(+lam.toFixed(9))} x</span>x is an eigenvector: A only stretches it${lam < 0 ? " and flips it" : ""}.`; }
    else if (!fe.real) { st.className = "status bad"; st.innerHTML = `<span class="k math">eigenvalues ${evs.join(", ")}</span>No real eigenvector: Ax is never parallel to x. The matrix rotates every direction (Exercise 6.1.13).`; }
    else if (E.groups.length === 1 && E.groups[0].alg === 2 && E.groups[0].geo === 1) { st.className = "status inf"; st.innerHTML = `<span class="k">Defective</span>A double eigenvalue with only one line of eigenvectors: there is no basis of eigenvectors.`; }
    else { st.className = "status inf"; st.innerHTML = `<span class="k">Keep turning x</span>Ax is not parallel to x. Eigenvectors lie on the dashed lines; the handle snaps when you get close.`; }
  }
  HOOK.eig = A => { S.k = -1; S.A = qm.of(A); build(); goto("#lab-eig"); };
  build();
})();

/* =========================================================
   LAB · Phase portrait
   ========================================================= */
(function odeLab() {
  const PRE = [
    { name: "Example 1", A: [[3, 4], [3, 2]], y: [0.5, 0.25] }, { name: "Ex 2(a): saddle", A: [[-1, 2], [2, -1]], y: [3, 1] }, { name: "Ex 2(b): spiral", A: [[1, -2], [2, 1]], y: [1, -2] },
    { name: "Ex 1(a): source", A: [[1, 1], [-2, 4]], y: [0.5, 0.2] }, { name: "Ex 1(b)", A: [[2, 4], [-1, -3]], y: [2, 1] }, { name: "center", A: [[0, 1], [-1, 0]], y: [2, 0] },
    { name: "spiral sink", A: [["-1/2", 1], [-1, "-1/2"]], y: [3, 2] }, { name: "node sink", A: [[-2, 0], [0, -1]], y: [3, 3] },
  ];
  const S = { A: qm.of(PRE[1].A), y: PRE[1].y.slice(), k: 1, field: true, dot: null, anim: null };
  const P = plane2D($("#od-svg"), { R: 4.6 });
  const D = draggable(P, () => [S.y], (i, p) => { S.y = p; S.k = -1; draw(); }, { lim: 4.5, snap: 0.25 });
  const mark = presetRow($("#od-presets"), PRE, k => { S.k = k; S.A = qm.of(PRE[k].A); S.y = PRE[k].y.slice(); build(); });
  $("#od-field").onclick = () => { S.field = !S.field; draw(); };
  function traj(F, y0, T, dt = 0.01) {
    const f = y => fapp(F, y), pts = [y0.slice()]; let y = y0.slice();
    for (let t = 0; Math.abs(t) < Math.abs(T); t += dt) {
      const h = Math.sign(T) * dt, k1 = f(y), k2 = f(y.map((v, i) => v + h / 2 * k1[i])), k3 = f(y.map((v, i) => v + h / 2 * k2[i])), k4 = f(y.map((v, i) => v + h * k3[i]));
      y = y.map((v, i) => v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); pts.push(y.slice());
      if (nrm(y) > 30) break;
    }
    return pts;
  }
  const line = (pts, attrs, g) => el("polyline", Object.assign({ points: pts.map(p => `${P.X(p[0])},${P.Y(p[1])}`).join(" "), fill: "none" }, attrs), g);
  $("#od-play").onclick = () => {
    if (S.anim) cancelAnimationFrame(S.anim);
    const F = S.A.map(r => r.map(toF)), pts = traj(F, S.y, 2.5), t0 = performance.now();
    const step = now => { const i = Math.min(pts.length - 1, Math.floor((now - t0) / 4000 * pts.length)); S.dot = pts[i]; draw(true); if (i < pts.length - 1 && nrm(pts[i]) < 6) S.anim = requestAnimationFrame(step); else { S.anim = null; } };
    S.anim = requestAnimationFrame(step);
  };
  function build() { mark(S.k); gridIn($("#od-in"), S.A, { label: "A", onChange: () => { S.k = -1; mark(-1); draw(); } }); S.dot = null; draw(); }
  function draw(anim) {
    const F = S.A.map(r => r.map(toF)), fe = fEig2(F);
    $("#od-field").setAttribute("aria-pressed", S.field);
    P.clear();
    if (S.field) for (let a = -4; a <= 4; a += 0.5) for (let b = -4; b <= 4; b += 0.5) {
      const v = fapp(F, [a, b]), L = nrm(v); if (L < 1e-9) continue; const d = scl(0.22 / L, v);
      el("line", { x1: P.X(a - d[0] / 2), y1: P.Y(b - d[1] / 2), x2: P.X(a + d[0] / 2), y2: P.Y(b + d[1] / 2), style: "stroke:var(--muted)", "stroke-opacity": .55, "stroke-width": 1.2 }, P.layers.under);
      el("circle", { cx: P.X(a + d[0] / 2), cy: P.Y(b + d[1] / 2), r: 1.6, style: "fill:var(--muted)", "fill-opacity": .7 }, P.layers.under);
    }
    if (fe.real) fe.vecs.forEach((v, i) => P.lineThrough(P.layers.under, [0, 0], v, { style: `stroke:var(--${i ? "c3" : "pivot"})`, "stroke-dasharray": "6 5", "stroke-width": 2 }));
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6 + 0.2, y0 = [3.8 * Math.cos(a), 3.8 * Math.sin(a)]; line(traj(F, y0, 3, 0.02), { style: "stroke:var(--c1)", "stroke-opacity": .3, "stroke-width": 1.3 }, P.layers.under); line(traj(F, y0, -3, 0.02), { style: "stroke:var(--c1)", "stroke-opacity": .3, "stroke-width": 1.3 }, P.layers.under); }
    const fw = traj(F, S.y, 2), bw = traj(F, S.y, -2);
    line(bw.slice().reverse().concat(fw), { style: "stroke:var(--warn)", "stroke-width": 3 }, P.layers.mid);
    if (S.dot) el("circle", { cx: P.X(S.dot[0]), cy: P.Y(S.dot[1]), r: 6, style: "fill:var(--warn)" }, P.layers.top);
    D.draw(["Y(0)"], ["ink"]);
    if (anim) return;
    const E = eigen(S.A), st = $("#od-status");
    let kind;
    if (!fe.real) kind = near(fe.re, 0, 1e-12) ? "center: closed orbits" : fe.re < 0 ? "spiral sink: rotates into 0" : "spiral source: rotates outward";
    else { const [l1, l2] = fe.ls; kind = l1 * l2 < -1e-12 ? "saddle: one direction grows, one decays" : (Math.abs(l1) < 1e-12 || Math.abs(l2) < 1e-12) ? "a line of equilibria (λ = 0)" : l1 < 0 ? "stable node: everything tends to 0" : l2 > 0 ? "unstable node: everything leaves 0" : ""; }
    st.className = "status inf";
    st.innerHTML = `<span class="k math">eigenvalues ${E.groups.map(g => g.l.txt()).concat(E.other.map(cplx)).join(", ")}</span>${kind}.`;
    let h = "";
    if (E.groups.length === 2 && E.groups.every(g => g.geo === 1)) {
      const X = qm.T(E.groups.map(g => g.basis[0])), c = qm.mul(qm.inv(X), colM(S.y.map(qf))).map(r => r[0]);
      const term = (ci, g) => `${ci.neg_ ? MINUS + " " : ""}${ci.abs().one ? "" : ci.abs().txt()}e<sup>${g.l.one ? "" : g.l.eq(-1) ? MINUS : g.l.txt()}t</sup>(${g.basis[0].map(t => t.txt()).join(", ")})ᵀ`;
      h = `<span class="op">Y(t) = ${c[0].zero ? "" : term(c[0], E.groups[0])}${!c[0].zero && !c[1].zero ? (c[1].neg_ ? " " : " + ") : ""}${c[1].zero ? "" : term(c[1], E.groups[1])}</span><span class="op">with c = X⁻¹Y(0) = (${c.map(t => t.txt()).join(", ")})</span>`;
    } else if (!fe.real) h = `<span class="op">λ = ${nice(fe.re)} ± ${nice(fe.im)}i: solutions are e<sup>${nice(fe.re)}t</sup> times rotations with angular speed ${nice(fe.im)}</span>`;
    else h = `<span class="op">The eigenvalues are not two distinct rationals; the trajectory is computed numerically.</span>`;
    $("#od-sol").innerHTML = h;
  }
  HOOK.ode = k => { S.k = k; S.A = qm.of(PRE[k].A); S.y = PRE[k].y.slice(); build(); goto("#lab-ode"); };
  build();
})();

/* =========================================================
   LAB · Diagonalize and take powers
   ========================================================= */
(function diagLab() {
  const PRE = [["Example 1", [[2, -3], [2, -5]]], ["Ex 1(a)", [[0, 1], [1, 0]]], ["Ex 1(b)", [[5, 6], [-2, -2]]], ["Ex 1(c)", [[2, -8], [1, -4]]], ["Ex 1(d)", [[2, 2, 1], [0, 1, 2], [0, 0, -1]]], ["Ex 1(e)", [[1, 0, 0], [-2, 1, 3], [1, 1, -1]]], ["Ex 1(f)", [[1, 2, -1], [2, 4, -2], [3, 6, -3]]], ["defective", [[3, -1], [1, 1]]], ["Markov", [["0.7", "0.2"], ["0.3", "0.8"]]]];
  const S = { A: qm.of(PRE[0][1]), k: 0, p: 6 };
  const mark = presetRow($("#dg-presets"), PRE, k => { S.k = k; S.A = qm.of(PRE[k][1]); build(); });
  const ks = $("#dg-k"); ks.oninput = () => { S.p = +ks.value; powers(); };
  let last = null;
  function build() {
    mark(S.k);
    chipRow($("#dg-n"), [2, 3], S.A.length, n => { S.A = resize(S.A, n, n); S.k = -1; build(); }, n => `${n} × ${n}`);
    gridIn($("#dg-in"), S.A, { label: "A", onChange: () => { S.k = -1; mark(-1); calc(); } });
    calc();
  }
  function calc() {
    const A = S.A, n = A.length, E = eigen(A), st = $("#dg-status");
    $("#dg-poly").innerHTML = `<span class="op">det(A − λI) = ${polyHTML(E.cp, "λ", n % 2 ? -1 : 1)}</span>`;
    const ml = E.groups.map(g => `λ = ${g.l.txt()}: algebraic ${g.alg}, geometric ${g.geo}`).concat(E.other.map(z => `λ = ${cplx(z)} (not rational)`));
    last = null;
    if (E.other.length) {
      st.className = "status inf"; st.innerHTML = `<span class="k">Some eigenvalues are irrational or complex</span>${ml.join("; ")}. The factorization exists over ℂ when they are distinct, but it cannot be shown in exact fractions here.`;
      $("#dg-out").innerHTML = "";
    } else if (!E.diag) {
      st.className = "status bad"; st.innerHTML = `<span class="k">Defective: not diagonalizable</span>${ml.join("; ")}. Some eigenvalue has fewer independent eigenvectors than its multiplicity (Theorem 6.3.2).`;
      $("#dg-out").innerHTML = "";
    } else {
      const cols = [], lams = [];
      E.groups.forEach(g => g.basis.forEach(b => { cols.push(b); lams.push(g.l); }));
      const X = qm.T(cols), Dm = lams.map((l, i) => lams.map((_, j) => i === j ? l : new Q(0))), Xi = qm.inv(X);
      const ok = qm.eq(qm.mul(qm.mul(X, Dm), Xi), A);
      last = { X, Xi, lams };
      st.className = "status ok"; st.innerHTML = `<span class="k">Diagonalizable${ok ? ": XDX⁻¹ = A ✓" : ""}</span>${ml.join("; ")}. The columns of X are eigenvectors, D holds the eigenvalues in the same order.`;
      $("#dg-out").innerHTML = `<span class="op">A =</span>` + lbl(matHTML(X, { cellClass: () => "hl1" }), "X (eigenvectors)") + lbl(matHTML(Dm, { cellClass: (i, j) => i === j ? "hl3" : "" }), "D") + lbl(matHTML(Xi), "X⁻¹");
    }
    powers();
  }
  function powers() {
    $("#dg-ko").textContent = S.p;
    const A = S.A, k = S.p;
    let h;
    if (last) {
      const Dk = last.lams.map((l, i) => last.lams.map((_, j) => { if (i !== j) return new Q(0); let r = new Q(1); for (let t = 0; t < k; t++) r = r.mul(l); return r; }));
      const Ak = qm.mul(qm.mul(last.X, Dk), last.Xi);
      h = `<span class="op">A<sup>${k}</sup> = X D<sup>${k}</sup> X⁻¹:</span>` + lbl(matHTML(Dk, { cellClass: (i, j) => i === j ? "hl3" : "" }), `D^${k}`) + `<span class="op">→</span>` + lbl(matHTML(Ak, { render: v => v.d > 9999 ? fmt(v.n / v.d, 5) : v.html() }), `A^${k}`);
    } else h = `<span class="op">A<sup>${k}</sup> by repeated multiplication:</span>` + lbl(matHTML(qm.pow(A, k), { render: v => v.d > 9999 ? fmt(v.n / v.d, 5) : v.html() }), `A^${k}`);
    $("#dg-pow").innerHTML = h;
  }
  HOOK.diag = A => { S.k = -1; S.A = qm.of(A); build(); goto("#lab-diag"); };
  build();
})();

/* =========================================================
   LAB · Markov chains and PageRank
   ========================================================= */
(function markovLab() {
  const PRE = [
    { name: "Example 6.1.1: marriage", A: [[0.7, 0.2], [0.3, 0.8]], x0: [8000, 2000], labels: ["married", "single"] },
    { name: "Example 6.3.5: leasing", A: [[0.8, 0.1, 0.05, 0.05], [0.1, 0.8, 0.05, 0.05], [0.05, 0.05, 0.8, 0.1], [0.05, 0.05, 0.1, 0.8]], x0: [200, 100, 100, 100], labels: ["sedan", "sports", "minivan", "SUV"] },
    { name: "PageRank: 5 pages", web: true, links: [[2, 3], [3, 4], [1], [], [1, 4]], labels: ["1", "2", "3", "4", "5"] },
  ];
  const S = { k: 0, x: [], step: 0, p: 0.85, L: null, timer: null };
  const svg = $("#mk-svg"), ds = $("#mk-d");
  ds.oninput = () => { S.p = +ds.value; reset(); };
  const mark = presetRow($("#mk-presets"), PRE, k => load(k));
  function matrix() {
    const pr = PRE[S.k];
    if (!pr.web) return pr.A;
    const n = S.L.length;
    const M = Array.from({ length: n }, () => Array(n).fill(0));
    for (let j = 0; j < n; j++) { const out = S.L.map((row, i) => row[j] ? i : -1).filter(i => i >= 0); for (let i = 0; i < n; i++) M[i][j] = out.length ? S.p * (out.includes(i) ? 1 / out.length : 0) + (1 - S.p) / n : 1 / n; }
    return M;
  }
  function load(k) {
    S.k = k; const pr = PRE[k];
    if (pr.web) { const n = pr.labels.length; S.L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => pr.links[j].includes(i + 1) ? 1 : 0)); }
    $("#mk-dwrap").style.display = pr.web ? "" : "none";
    reset();
  }
  function reset() { const pr = PRE[S.k]; S.x = pr.web ? pr.labels.map(() => 1 / pr.labels.length) : pr.x0.slice(); S.step = 0; draw(); }
  $("#mk-step").onclick = () => { S.x = fapp(matrix(), S.x); S.step++; draw(); };
  $("#mk-reset").onclick = () => { if (S.timer) clearInterval(S.timer); reset(); };
  $("#mk-run").onclick = () => { if (S.timer) clearInterval(S.timer); let c = 0; S.timer = setInterval(() => { S.x = fapp(matrix(), S.x); S.step++; draw(); if (++c >= 20) { clearInterval(S.timer); S.timer = null; } }, 130); };
  function steady(A, total) { const n = A.length, M = A.map((r, i) => r.map((v, j) => v - (i === j ? 1 : 0))); M[n - 1] = Array(n).fill(1); const b = Array(n).fill(0); b[n - 1] = total; return gsolve(M, b); }
  function links() {
    const pr = PRE[S.k], host = $("#mk-links");
    if (!pr.web) { host.innerHTML = ""; return; }
    const n = S.L.length;
    let h = `<table class="lnk"><tr><th>to \\ from</th>${pr.labels.map(l => `<th>${l}</th>`).join("")}</tr>`;
    for (let i = 0; i < n; i++) h += `<tr><th>${pr.labels[i]}</th>${S.L[i].map((v, j) => i === j ? `<td>·</td>` : `<td><button class="lk" data-i="${i}" data-j="${j}" aria-pressed="${!!v}" aria-label="link from ${j + 1} to ${i + 1}">${v ? "1" : "0"}</button></td>`).join("")}</tr>`;
    host.innerHTML = lbl(h + `</table>`, "link matrix: click to toggle a link");
    host.querySelectorAll(".lk").forEach(b => b.onclick = () => { S.L[+b.dataset.i][+b.dataset.j] ^= 1; reset(); });
  }
  function draw() {
    mark(S.k); $("#mk-do").textContent = fmt(S.p, 2); links();
    const pr = PRE[S.k], A = matrix(), n = A.length, total = S.x.reduce((s, v) => s + v, 0), ss = steady(A, total);
    svg.innerHTML = "";
    const top = pr.web ? 210 : 30, H = 420 - top - 40, W = 420, bw = Math.min(70, (W - 40) / n - 12), maxv = Math.max(...S.x, ...(ss || [0])) * 1.15;
    if (pr.web) {
      const pos = i => [210 + 140 * Math.cos(-Math.PI / 2 + 2 * Math.PI * i / n), 105 + 85 * Math.sin(-Math.PI / 2 + 2 * Math.PI * i / n)];
      const defs = el("defs", {}, svg), mk = el("marker", { id: "mk-ah", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" }, defs); el("path", { d: "M0,0 L10,5 L0,10 z", style: "fill:var(--muted)" }, mk);
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (S.L[i][j]) {
        const a = pos(j), b = pos(i), d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(...d), ra = 10 + 40 * S.x[j], rb = 10 + 40 * S.x[i];
        el("line", { x1: a[0] + d[0] / L * ra, y1: a[1] + d[1] / L * ra, x2: b[0] - d[0] / L * (rb + 2), y2: b[1] - d[1] / L * (rb + 2), style: "stroke:var(--muted)", "stroke-width": 1.5, "marker-end": "url(#mk-ah)" }, svg);
      }
      for (let i = 0; i < n; i++) { const p = pos(i); el("circle", { cx: p[0], cy: p[1], r: 10 + 40 * S.x[i], style: "fill:var(--c1)", "fill-opacity": .35, stroke: "var(--c1)" }, svg); const t = el("text", { x: p[0], y: p[1] + 5, "text-anchor": "middle", "font-size": 15, "font-weight": 700 }, svg); t.textContent = pr.labels[i]; }
    }
    for (let i = 0; i < n; i++) {
      const x0 = 30 + i * ((W - 40) / n), h = S.x[i] / maxv * H, y = top + H - h;
      el("rect", { x: x0, y, width: bw, height: Math.max(0, h), style: "fill:var(--c1)", "fill-opacity": .75 }, svg);
      if (ss) { const yy = top + H - ss[i] / maxv * H; el("line", { x1: x0 - 4, y1: yy, x2: x0 + bw + 4, y2: yy, style: "stroke:var(--pivot)", "stroke-width": 3, "stroke-dasharray": "5 3" }, svg); }
      const t = el("text", { x: x0 + bw / 2, y: top + H + 16, "text-anchor": "middle", "font-size": 12 }, svg); t.textContent = pr.labels[i];
      const v = el("text", { x: x0 + bw / 2, y: y - 5, "text-anchor": "middle", "font-size": 11, style: "fill:var(--muted)" }, svg); v.textContent = pr.web ? fmt(S.x[i], 3) : fmt(S.x[i], 0);
    }
    el("line", { x1: 20, y1: top + H, x2: 410, y2: top + H, style: "stroke:var(--ink)" }, svg);
    $("#mk-mat").innerHTML = lbl(matHTML(A, { render: v => fmt(v, 3) }), "transition matrix A (columns sum to 1)");
    const dist = ss ? Math.max(...S.x.map((v, i) => Math.abs(v - ss[i]))) : NaN;
    const st = $("#mk-status");
    st.className = "status " + (dist < (pr.web ? 1e-3 : 1) ? "ok" : "inf");
    st.innerHTML = `<span class="k math">k = ${S.step}: x_k = (${S.x.map(v => fmt(v, pr.web ? 3 : 1)).join(", ")})</span>Dashed marks: the steady state, the eigenvector of A for λ = 1 with the same total: (${(ss || []).map(v => fmt(v, pr.web ? 4 : 1)).join(", ")}). ${pr.web ? "With probability p the surfer follows a link, otherwise jumps to a random page; page 4 has no links (a dangling page), so its column is uniform." : ""}`;
  }
  load(0);
})();

/* =========================================================
   LAB · SVD geometry (2 × 2)
   ========================================================= */
function svd2(F) {
  const AtA = fmul(fT(F), F), p = AtA[0][0], qq = AtA[0][1], r = AtA[1][1];
  const m = (p + r) / 2, d = Math.sqrt(((p - r) / 2) ** 2 + qq * qq), l1 = m + d, l2 = Math.max(0, m - d);
  let v1 = Math.abs(qq) > 1e-12 ? [qq, l1 - p] : (p >= r ? [1, 0] : [0, 1]); v1 = scl(1 / nrm(v1), v1);
  const v2 = [-v1[1], v1[0]], s1 = Math.sqrt(l1), s2 = Math.sqrt(l2);
  let u1 = s1 > 1e-12 ? scl(1 / s1, fapp(F, v1)) : [1, 0];
  let u2 = s2 > 1e-9 ? scl(1 / s2, fapp(F, v2)) : [-u1[1], u1[0]];
  return { s: [s1, s2], V: [v1, v2], U: [u1, u2] };
}
(function svdLab() {
  const PRE = [["A = (3 0; 4 5)", [[3, 0], [4, 5]]], ["symmetric", [[2, 1], [1, 2]]], ["shear", [[1, 1], [0, 1]]], ["rank 1", [[1, 1], [1, 1]]], ["rotation", [[0, -1], [1, 0]]], ["nearly singular", [[1, 1], [1, 1.25]]]];
  const S = { c1: [3, 4], c2: [0, 5], k: 0 };
  const P = plane2D($("#sv-svg"), { R: 7.2 });
  const D = draggable(P, () => [S.c1, S.c2], (i, p) => { if (i) S.c2 = p; else S.c1 = p; S.k = -1; draw(); }, { lim: 7, snap: 0.25 });
  const mark = presetRow($("#sv-presets"), PRE, k => { S.k = k; const M = PRE[k][1]; S.c1 = [M[0][0], M[1][0]]; S.c2 = [M[0][1], M[1][1]]; draw(); });
  function draw() {
    mark(S.k); P.clear();
    const F = [[S.c1[0], S.c2[0]], [S.c1[1], S.c2[1]]], { s, V, U } = svd2(F);
    el("circle", { cx: P.X(0), cy: P.Y(0), r: P.sc, fill: "none", style: "stroke:var(--ink)", "stroke-width": 1.5 }, P.layers.under);
    const pts = []; for (let t = 0; t <= 360; t += 3) { const a = t * Math.PI / 180, w = fapp(F, [Math.cos(a), Math.sin(a)]); pts.push(`${P.X(w[0])},${P.Y(w[1])}`); }
    el("polygon", { points: pts.join(" "), style: "fill:var(--c1);stroke:var(--c1)", "fill-opacity": .1, "stroke-width": 2 }, P.layers.under);
    V.forEach((v, i) => P.arrow(P.layers.mid, [0, 0], v, i ? "c3" : "amb", 2.5, { "stroke-dasharray": "4 3" }));
    U.forEach((u, i) => { if (s[i] > 1e-9) P.arrow(P.layers.mid, [0, 0], scl(s[i], u), i ? "c3" : "amb", 4); });
    P.text(P.layers.top, [s[0] * U[0][0] + 0.2, s[0] * U[0][1] + 0.2], "σ₁u₁", { style: "fill:var(--pivot)", "font-weight": 700 });
    if (s[1] > 0.3) P.text(P.layers.top, [s[1] * U[1][0] + 0.2, s[1] * U[1][1] - 0.3], "σ₂u₂", { class: "f3", "font-weight": 700 });
    P.arrow(P.layers.top, [0, 0], S.c1, "c1", 2); P.arrow(P.layers.top, [0, 0], S.c2, "c2", 2);
    D.draw(["a₁", "a₂"], ["f1", "f2"]);
    const Um = fT(U), Vt = V, Sg = [[s[0], 0], [0, s[1]]];
    $("#sv-expr").innerHTML = lbl(niceM(F), "A") + `<span class="op">=</span>` + lbl(niceM(Um), "U") + lbl(niceM(Sg), "Σ") + lbl(niceM(Vt), "Vᵀ");
    const rank = s[0] < 1e-9 ? 0 : s[1] < 1e-9 ? 1 : 2, st = $("#sv-status");
    st.className = "status " + (rank === 2 ? "ok" : "bad");
    st.innerHTML = `<span class="k math">σ₁ = ${nice(s[0])}, σ₂ = ${nice(s[1])}, rank ${rank}</span>‖A‖₂ = σ₁ is the longest semi-axis; |det A| = σ₁σ₂ = ${nice(s[0] * s[1])}; ${rank === 2 ? `condition number σ₁/σ₂ = ${fmt(s[0] / s[1], 3)}.` : "the ellipse has collapsed to a segment: A is singular."} The best rank-1 approximation σ₁u₁v₁ᵀ is off by σ₂ in the 2-norm.`;
  }
  draw();
})();

/* =========================================================
   LAB · Image compression
   ========================================================= */
(function imgLab() {
  const N = 64;
  const IMGS = [
    ["letters LA", ctx => { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, N, N); ctx.fillStyle = "#000"; ctx.font = "bold 34px sans-serif"; ctx.textBaseline = "middle"; ctx.fillText("LA", 5, 30); ctx.beginPath(); ctx.arc(46, 52, 9, 0, 2 * Math.PI); ctx.lineWidth = 4; ctx.stroke(); }],
    ["smooth blobs", ctx => { const im = ctx.createImageData(N, N); for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const v = 255 * (0.5 + 0.35 * Math.exp(-((i - 20) ** 2 + (j - 22) ** 2) / 120) - 0.3 * Math.exp(-((i - 44) ** 2 + (j - 40) ** 2) / 200) + 0.15 * Math.sin(j / 7)); const k = 4 * (i * N + j); im.data[k] = im.data[k + 1] = im.data[k + 2] = Math.max(0, Math.min(255, v)); im.data[k + 3] = 255; } ctx.putImageData(im, 0, 0); }],
    ["checkerboard", ctx => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { ctx.fillStyle = (i + j) % 2 ? "#222" : "#ddd"; ctx.fillRect(8 * j, 8 * i, 8, 8); } }],
    ["random noise", ctx => { const im = ctx.createImageData(N, N); let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let k = 0; k < N * N; k++) { const v = 255 * rnd(); im.data[4 * k] = im.data[4 * k + 1] = im.data[4 * k + 2] = v; im.data[4 * k + 3] = 255; } ctx.putImageData(im, 0, 0); }],
  ];
  const S = { i: 0, k: 5, M: null, sv: null };
  const ks = $("#im-k"); ks.oninput = () => { S.k = +ks.value; show(); };
  const mark = presetRow($("#im-presets"), IMGS, i => { S.i = i; compute(); });
  function jacobi(A) {
    const n = A.length, Sx = A.map(r => r.slice()), V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
    for (let sweep = 0; sweep < 40; sweep++) {
      let off = 0; for (let p = 0; p < n; p++) for (let q2 = p + 1; q2 < n; q2++) off += Sx[p][q2] ** 2;
      if (off < 1e-20) break;
      for (let p = 0; p < n - 1; p++) for (let q2 = p + 1; q2 < n; q2++) {
        const apq = Sx[p][q2]; if (Math.abs(apq) < 1e-15) continue;
        const app = Sx[p][p], aqq = Sx[q2][q2], th = (aqq - app) / (2 * apq), t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { if (k === p || k === q2) continue; const akp = Sx[k][p], akq = Sx[k][q2]; Sx[k][p] = Sx[p][k] = c * akp - s * akq; Sx[k][q2] = Sx[q2][k] = s * akp + c * akq; }
        Sx[p][p] = app - t * apq; Sx[q2][q2] = aqq + t * apq; Sx[p][q2] = Sx[q2][p] = 0;
        for (let k = 0; k < n; k++) { const vkp = V[k][p], vkq = V[k][q2]; V[k][p] = c * vkp - s * vkq; V[k][q2] = s * vkp + c * vkq; }
      }
    }
    return { vals: Sx.map((r, i) => r[i]), V };
  }
  function compute() {
    mark(S.i);
    const cv = $("#im-orig"), ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, N, N); IMGS[S.i][1](ctx);
    const d = ctx.getImageData(0, 0, N, N).data, M = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => d[4 * (i * N + j)] / 255));
    const { vals, V } = jacobi(fmul(fT(M), M)), order = vals.map((v, i) => i).sort((a, b) => vals[b] - vals[a]);
    const sv = order.map(i => { const s = Math.sqrt(Math.max(0, vals[i])), v = V.map(r => r[i]); return { s, v, u: s > 1e-9 ? scl(1 / s, fapp(M, v)) : null }; });
    S.M = M; S.sv = sv; show();
  }
  function show() {
    const k = S.k, sv = S.sv; $("#im-ko").textContent = k;
    const R = Array.from({ length: N }, () => Array(N).fill(0));
    for (let t = 0; t < k; t++) { const { s, u, v } = sv[t]; if (!u) break; for (let i = 0; i < N; i++) { const a = s * u[i]; for (let j = 0; j < N; j++) R[i][j] += a * v[j]; } }
    const ctx = $("#im-appr").getContext("2d"), im = ctx.createImageData(N, N);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const p = 4 * (i * N + j), g = Math.max(0, Math.min(255, 255 * R[i][j])); im.data[p] = im.data[p + 1] = im.data[p + 2] = g; im.data[p + 3] = 255; }
    ctx.putImageData(im, 0, 0);
    const tot = sv.reduce((s, x) => s + x.s * x.s, 0), rest = sv.slice(k).reduce((s, x) => s + x.s * x.s, 0), rank = sv.filter(x => x.s > 1e-8 * sv[0].s).length;
    $("#im-r").textContent = rank;
    const g = $("#im-sig"); g.innerHTML = "";
    const lo = -8, hi = Math.log10(sv[0].s) + 0.2, y = v => 10 + 170 * (hi - Math.max(lo, Math.log10(Math.max(v, 1e-8)))) / (hi - lo);
    sv.forEach((x, i) => el("rect", { x: 6 + i * 3.9, y: y(x.s), width: 3, height: 180 - y(x.s), style: `fill:var(--${i < k ? "c1" : "muted"})`, "fill-opacity": i < k ? 1 : .5 }, g));
    el("line", { x1: 4, y1: 180, x2: 258, y2: 180, style: "stroke:var(--ink)" }, g);
    const st = $("#im-status");
    st.className = "status inf";
    st.innerHTML = `<span class="k math">k = ${k}: store k(m + n + 1) = ${k * (2 * N + 1)} numbers instead of mn = ${N * N}</span>Relative error ‖A − A<sub>k</sub>‖<sub>F</sub>/‖A‖<sub>F</sub> = (σ²<sub>k+1</sub> + ⋯)<sup>½</sup>/(σ₁² + ⋯)<sup>½</sup> = ${fmt(Math.sqrt(rest / tot), 4)}. Smooth pictures have quickly decaying σ's; noise has none to spare. This image has numerical rank ${rank} (σ's below 10⁻⁸·σ₁ count as 0).`;
  }
  compute();
})();

/* =========================================================
   LAB · Quadratic forms
   ========================================================= */
(function quadLab() {
  const PRE = [["Example 2: 3x² + 2xy + 3y²", 3, 1, 3], ["Example 4", 2, -2, 5], ["Ex 3(a)", 1, 0.5, 1], ["Ex 3(b)", 3, 4, 3], ["Ex 3(c)", -3, 3, 5], ["Ex 6(a)", 3, 2, 2], ["Ex 6(b)", 3, 4, 1], ["negative definite", -2, 1, -3], ["semidefinite", 1, 1, 1]];
  const S = { a: 3, b: 1, c: 3, x: [1, 1], k: 0 };
  const P = plane2D($("#qf-svg"), { R: 3.3 });
  const D = draggable(P, () => [S.x], (i, p) => { S.x = p; draw(); }, { lim: 3.2, snap: 0.1 });
  const sl = ["a", "b", "c"].map(k => { const e = $("#qf-" + k); e.oninput = () => { S[k] = +e.value; S.k = -1; draw(); }; return e; });
  const mark = presetRow($("#qf-presets"), PRE, k => { S.k = k; [S.a, S.b, S.c] = PRE[k].slice(1); draw(); });
  const f = (x, y) => S.a * x * x + 2 * S.b * x * y + S.c * y * y;
  function contour(level, cls, g) {
    const n = 70, L = 3.3, h = 2 * L / n, segs = [];
    const val = (i, j) => f(-L + i * h, -L + j * h) - level;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], v = c.map(([a, b]) => val(a, b)), pts = [];
      for (let e = 0; e < 4; e++) { const a = v[e], b = v[(e + 1) % 4]; if ((a < 0) !== (b < 0)) { const t = a / (a - b), p0 = c[e], p1 = c[(e + 1) % 4]; pts.push([-L + (p0[0] + t * (p1[0] - p0[0])) * h, -L + (p0[1] + t * (p1[1] - p0[1])) * h]); } }
      if (pts.length >= 2) segs.push([pts[0], pts[1]]); if (pts.length === 4) segs.push([pts[2], pts[3]]);
    }
    el("path", { d: segs.map(([p, q2]) => `M${P.X(p[0]).toFixed(1)},${P.Y(p[1]).toFixed(1)}L${P.X(q2[0]).toFixed(1)},${P.Y(q2[1]).toFixed(1)}`).join(""), fill: "none", style: `stroke:var(--${cls})`, "stroke-width": level === 1 || level === -1 ? 2.6 : 1.2, "stroke-opacity": level === 1 || level === -1 ? 1 : .55 }, g);
  }
  function draw() {
    mark(S.k);
    sl.forEach((e, i) => { const k = "abc"[i]; e.value = S[k]; $("#qf-" + k + "o").textContent = fmt(S[k], 1); });
    P.clear();
    [1, 2, 4, 8].forEach(l => contour(l, "c1", P.layers.under)); [-1, -2, -4, -8].forEach(l => contour(l, "c2", P.layers.under));
    const fe = fEig2([[S.a, S.b], [S.b, S.c]]);
    fe.vecs.forEach((v, i) => { P.lineThrough(P.layers.mid, [0, 0], v, { style: `stroke:var(--${i ? "c3" : "pivot"})`, "stroke-dasharray": "6 5", "stroke-width": 2 }); P.text(P.layers.top, [2.1 * v[0] + 0.12, 2.1 * v[1] + 0.18], `λ${i ? "₂" : "₁"} = ${nice(fe.ls[i])}`, { style: `fill:var(--${i ? "c3" : "pivot"})`, "font-weight": 700 }); });
    D.draw([`f = ${fmt(f(...S.x), 2)}`], ["ink"]);
    const [l1, l2] = fe.ls, a = S.a, b = S.b, c = S.c, m2 = a * c - b * b;
    const cls = l2 > 1e-12 ? "positive definite" : l1 < -1e-12 ? "negative definite" : l1 * l2 < -1e-12 ? "indefinite" : l2 > -1e-12 ? "positive semidefinite" : "negative semidefinite";
    const conic = l2 > 1e-12 ? "an ellipse" : l1 * l2 < -1e-12 ? "a hyperbola" : l1 > 1e-12 ? "two parallel lines" : "empty";
    const fx = [[a, "x²"], [2 * b, "xy"], [c, "y²"]].filter(([k]) => Math.abs(k) > 1e-12).map(([k, m], i) => `${i ? (k < 0 ? ` ${MINUS} ` : " + ") : (k < 0 ? MINUS : "")}${nice(Math.abs(k)) === "1" ? "" : nice(Math.abs(k))}${m}`).join("") || "0";
    $("#qf-expr").innerHTML = `<span class="op">f(x, y) = ${fx} = xᵀAx,</span>` + lbl(niceM([[a, b], [b, c]]), "A");
    const pd = l2 > 1e-12;
    $("#qf-tests").innerHTML = kv([["eigenvalues", `${nice(l1)}, ${nice(l2)}`, "amb"], ["leading minors a, ac − b²", `${nice(a)}, ${nice(m2)}`], ["pivots a, c − b²/a", Math.abs(a) > 1e-12 ? `${nice(a)}, ${nice(c - b * b / a)}` : "a = 0: elimination needs a row swap"],
      ["Cholesky L (A = LLᵀ)", pd ? `(${nice(Math.sqrt(a))} 0; ${nice(b / Math.sqrt(a))} ${nice(Math.sqrt(c - b * b / a))})` : "does not exist"]]);
    const st = $("#qf-status");
    st.className = "status " + (pd ? "ok" : l1 * l2 < -1e-12 ? "bad" : "inf");
    st.innerHTML = `<span class="k">${cls}</span>The level curve f = 1 (bold blue) is ${conic}${l1 < -1e-12 && l2 < -1e-12 ? "; f = −1 (bold pink) is an ellipse" : ""}. ${pd ? "All tests agree: positive eigenvalues, positive leading minors, positive pivots, and the Cholesky factor exists (Theorem 6.7.1). (0, 0) is a strict minimum." : l1 * l2 < -1e-12 ? "Eigenvalues of opposite sign: (0, 0) is a saddle point." : ""} Axes of the curves lie along the eigenvectors.`;
  }
  draw();
})();

/* =========================================================
   Definitions
   ========================================================= */
renderDefinitions([
  { sec: "s61", id: "def-eig", term: "Eigenvalue, eigenvector, characteristic polynomial", ref: "§6.1 · Definition, Theorem 6.1.1", scene: "Eigenvectors", lab: ["#lab-eig", "Hunt for eigenvectors"],
    html: `Let <i>A</i> be <i>n</i> × <i>n</i>. A scalar λ is an <b>eigenvalue</b> of <i>A</i> if there is a nonzero <b>x</b> with <i>A</i><b>x</b> = λ<b>x</b>; such <b>x</b> is an <b>eigenvector</b> belonging to λ. Equivalently, det(<i>A</i> − λ<i>I</i>) = 0: λ is a root of the <b>characteristic polynomial</b> <i>p</i>(λ) = det(<i>A</i> − λ<i>I</i>). <i>N</i>(<i>A</i> − λ<i>I</i>) is the <b>eigenspace</b> of λ. The eigenvalues satisfy λ${S_(1)} + ⋯ + λ${S_("n")} = tr <i>A</i> and λ${S_(1)}⋯λ${S_("n")} = det <i>A</i>; similar matrices have the same characteristic polynomial.` },
  { sec: "s62", id: "def-ode", term: "Linear systems Y′ = AY", ref: "§6.2", scene: "PhasePortrait", lab: ["#lab-ode", "Open the phase portrait"],
    html: `If λ is an eigenvalue of <i>A</i> with eigenvector <b>x</b>, then <b>Y</b>(<i>t</i>) = <i>e</i><sup>λ<i>t</i></sup><b>x</b> solves <b>Y</b>′ = <i>A</i><b>Y</b>. If <b>x</b>${S_(1)}, …, <b>x</b>${S_("n")} are independent eigenvectors, the general solution is <b>Y</b> = Σ<i>c</i>${S_("i")}<i>e</i><sup>λ<sub><i>i</i></sub><i>t</i></sup><b>x</b>${S_("i")}, and the initial value problem <b>Y</b>(0) = <b>Y</b>${S_(0)} is solved by <b>c</b> = <i>X</i><sup>−1</sup><b>Y</b>${S_(0)}. For complex λ = <i>a</i> + <i>bi</i>, the real and imaginary parts of <i>e</i><sup>λ<i>t</i></sup><b>z</b> are real solutions.` },
  { sec: "s63", id: "def-diag", term: "Diagonalizable matrix; defective matrix", ref: "§6.3 · Definition, Theorems 6.3.1, 6.3.2", scene: "Diagonalization", lab: ["#lab-diag", "Diagonalize a matrix"],
    html: `<i>A</i> is <b>diagonalizable</b> if there is a nonsingular <i>X</i> and diagonal <i>D</i> with <i>X</i><sup>−1</sup><i>AX</i> = <i>D</i>; we say <i>X</i> <b>diagonalizes</b> <i>A</i>. This happens iff <i>A</i> has <i>n</i> linearly independent eigenvectors, the columns of <i>X</i>, with the eigenvalues on the diagonal of <i>D</i>. Eigenvectors of distinct eigenvalues are independent, so <i>n</i> distinct eigenvalues suffice. Then <i>A</i><sup><i>k</i></sup> = <i>XD</i><sup><i>k</i></sup><i>X</i><sup>−1</sup> and <i>e</i><sup><i>A</i></sup> = <i>Xe</i><sup><i>D</i></sup><i>X</i><sup>−1</sup>. A matrix with fewer than <i>n</i> independent eigenvectors is <b>defective</b>.` },
  { sec: "s63", id: "def-markov", term: "Markov chain; steady-state vector", ref: "§6.3 · Application 1, Theorems 6.3.3, 6.3.4", scene: "MarkovSteadyState", lab: ["#lab-markov", "Run a Markov chain"],
    html: `A <b>Markov process</b> has a <b>transition matrix</b> <i>A</i> with nonnegative entries and column sums 1 (a <b>stochastic</b> matrix); the state evolves by <b>x</b>${S_("k+1")} = <i>A</i><b>x</b>${S_("k")}. Every stochastic matrix has λ = 1 as an eigenvalue. If the chain converges to <b>x</b>, then <i>A</i><b>x</b> = <b>x</b>: a <b>steady-state vector</b>. If λ = 1 is a dominant eigenvalue, the chain converges to it from any starting probability vector.` },
  { sec: "s64", id: "def-herm", term: "Hermitian and unitary matrices; Spectral Theorem", ref: "§6.4 · Definitions, Theorems 6.4.1, 6.4.4",
    html: `<i>M</i> is <b>Hermitian</b> if <i>M</i><sup>H</sup> = <i>M</i> (conjugate transpose). <i>U</i> is <b>unitary</b> if its columns are orthonormal, i.e. <i>U</i><sup>H</sup><i>U</i> = <i>I</i> (real case: orthogonal). The eigenvalues of a Hermitian matrix are real and eigenvectors of distinct eigenvalues are orthogonal. <b>Spectral Theorem:</b> a Hermitian <i>A</i> has a unitary <i>U</i> with <i>U</i><sup>H</sup><i>AU</i> diagonal; a real symmetric <i>A</i> = <i>QDQ</i><sup>T</sup> with <i>Q</i> orthogonal. <b>Schur:</b> every <i>A</i> = <i>UTU</i><sup>H</sup> with <i>T</i> upper triangular.` },
  { sec: "s65", id: "def-svd", term: "Singular value decomposition", ref: "§6.5 · Theorem 6.5.1, Theorem 6.5.3", scene: "SVDGeometry", lab: ["#lab-svd", "Drag a 2 × 2 SVD"],
    html: `An <i>m</i> × <i>n</i> matrix <i>A</i> has a factorization <i>A</i> = <i>U</i>Σ<i>V</i><sup>T</sup> with <i>U</i> (<i>m</i> × <i>m</i>) and <i>V</i> (<i>n</i> × <i>n</i>) orthogonal and Σ diagonal with entries σ${S_(1)} ≥ σ${S_(2)} ≥ ⋯ ≥ σ${S_("n")} ≥ 0, the <b>singular values</b>. σ${S_("i")}<sup>2</sup> are the eigenvalues of <i>A</i><sup>T</sup><i>A</i>, the columns of <i>V</i> (right singular vectors) its orthonormal eigenvectors, and <b>u</b>${S_("i")} = <i>A</i><b>v</b>${S_("i")}/σ${S_("i")}. rank <i>A</i> = number of nonzero σ's; ‖<i>A</i>‖${S_(2)} = σ${S_(1)}; <i>A</i>${S_("k")} = Σ<sub><i>i</i>≤<i>k</i></sub> σ${S_("i")}<b>u</b>${S_("i")}<b>v</b>${S_("i")}<sup>T</sup> is the nearest matrix of rank <i>k</i> in the Frobenius norm.` },
  { sec: "s66", id: "def-qf", term: "Quadratic form; definiteness", ref: "§6.6 · Definitions, Theorems 6.6.1, 6.6.2", scene: "QuadraticForm", lab: ["#lab-quad", "Explore level curves"],
    html: `A <b>quadratic form</b> on ℝ<sup><i>n</i></sup> is <i>f</i>(<b>x</b>) = <b>x</b><sup>T</sup><i>A</i><b>x</b> with <i>A</i> symmetric. <b>Principal Axes Theorem:</b> with <b>x</b> = <i>Q</i><b>y</b>, <i>Q</i> orthogonal diagonalizing <i>A</i>, <i>f</i> = λ${S_(1)}<i>y</i>${S_(1)}<sup>2</sup> + ⋯ + λ${S_("n")}<i>y</i>${S_("n")}<sup>2</sup>. <i>f</i> (and <i>A</i>) is <b>positive definite</b> if <b>x</b><sup>T</sup><i>A</i><b>x</b> &gt; 0 for all <b>x</b> ≠ <b>0</b>, negative definite if &lt; 0, <b>indefinite</b> if it takes both signs; positive definite ⇔ all eigenvalues positive (6.6.2).` },
  { sec: "s67", id: "def-pd", term: "Positive definite: equivalent tests", ref: "§6.7 · Theorem 6.7.1",
    html: `For a symmetric <i>n</i> × <i>n</i> matrix <i>A</i> the following are equivalent: (a) <i>A</i> is positive definite; (b) the leading principal submatrices <i>A</i>${S_(1)}, …, <i>A</i>${S_("n")} all have positive determinants; (c) <i>A</i> can be reduced to upper triangular form using only row operation III, with all pivots positive; (d) <i>A</i> = <i>LL</i><sup>T</sup> with <i>L</i> lower triangular with positive diagonal (the <b>Cholesky decomposition</b>); (e) <i>A</i> = <i>B</i><sup>T</sup><i>B</i> for some nonsingular <i>B</i>.`, lab: ["#lab-quad", "See all tests side by side"] },
  { sec: "s68", id: "def-perron", term: "Nonnegative matrices; Perron's Theorem", ref: "§6.8 · Definitions, Theorems 6.8.1, 6.8.2",
    html: `<i>A</i> is <b>nonnegative</b> (<i>A</i> ≥ <i>O</i>) if all <i>a</i>${S_("ij")} ≥ 0, <b>positive</b> if all <i>a</i>${S_("ij")} &gt; 0. <b>Perron:</b> a positive matrix has a positive real eigenvalue <i>r</i> with a positive eigenvector, and |λ| &lt; <i>r</i> for every other eigenvalue; <i>r</i> is a simple root. <i>A</i> is <b>reducible</b> if, after reordering, it is block upper triangular; for irreducible nonnegative <i>A</i> (<b>Frobenius</b>) the same holds with |λ| ≤ <i>r</i>.` },
], { s61: "6.1", s62: "6.2", s63: "6.3", s64: "6.4", s65: "6.5", s66: "6.6", s67: "6.7", s68: "6.8" });

/* =========================================================
   Exercises
   ========================================================= */
const TF = ["True", "False"];
const msetCheck = target => ([v]) => { const a = v[0].map(t => t.txt()).sort(), b = target.map(t => q(t).txt()).sort(); return a.length === b.length && a.every((x, i) => x === b[i]) ? { ok: true, msg: "Correct." } : { ok: false, msg: "Not the right eigenvalues. Solve det(A − λI) = 0; the sum must equal the trace." }; };
const eigsOf = A => { const E = eigen(qm.of(A)); return E.groups.flatMap(g => Array(g.alg).fill(g.l)); };
const evecCheck = (A, lam) => ([v]) => { const x = v[0]; if (x.every(t => t.zero)) return { ok: false, msg: "Eigenvectors are nonzero." }; const Ax = qm.mul(qm.of(A), colM(x)).map(r => r[0]); return Ax.every((t, i) => t.eq(x[i].mul(q(lam)))) ? { ok: true, msg: `Correct: Ax = ${q(lam).txt()}x.` } : { ok: false, msg: `Ax = (${Ax.map(t => t.txt()).join(", ")}), not ${q(lam).txt()}x.` }; };
const eigAct = A => ({ label: "Open in the eigenvector lab", run: () => HOOK.eig(A) });
const diagAct = A => ({ label: "Diagonalize in the lab", run: () => HOOK.diag(A) });

buildExercises("s61", "Exercises · §6.1", "From the Section 6.1 exercises (p. 294–296). Enter eigenvalues in any order, repeated ones as often as they occur.", [
  ...[["(a)", [[3, 2], [4, 1]]], ["(b)", [[6, -4], [3, -1]]], ["(g)", [[1, 1, 1], [0, 2, 1], [0, 0, 1]]], ["(h)", [[1, 2, 1], [0, 3, 1], [0, 5, -1]]], ["(l)", [[3, 0, 0, 0], [4, 1, 0, 0], [0, 0, 2, 1], [0, 0, 0, 2]]]].map(([t, A]) =>
    fl(`6.1 · Ex 1${t}`, `Eigenvalues of A = ${sm(A)}.`, [vec("λ's", eigsOf(A))], `Characteristic polynomial ${A.length < 4 ? polyHTML(eigen(qm.of(A)).cp) : "(block triangular: the diagonal blocks give the eigenvalues)"}; roots ${eigsOf(A).map(x => x.txt()).join(", ")}.`,
      { check: msetCheck(eigsOf(A)), actions: A.length === 2 ? [eigAct(A)] : [diagAct(A)].filter(() => A.length === 3) })),
  fl("6.1 · Ex 1(a)", "For A = (3 2; 4 1), give an eigenvector for λ = 5 and one for λ = −1.", [vec("λ = 5", [1, 1]), vec("λ = −1", [1, -2])],
    "A − 5I = (−2 2; 4 −4) gives (1, 1)ᵀ; A + I = (4 2; 4 2) gives (1, −2)ᵀ.", { check: ([a, b]) => { const r1 = evecCheck([[3, 2], [4, 1]], 5)([a]), r2 = evecCheck([[3, 2], [4, 1]], -1)([b]); return r1.ok && r2.ok ? { ok: true, msg: "Both are eigenvectors." } : (r1.ok ? r2 : r1); } }),
  cl("6.1 · Ex 1(d), (e), 13", "Real or complex eigenvalues?", ["real", "complex (nonreal)"], [
    { tag: "(d)", html: sm([[3, -8], [2, 3]]), ans: 1, why: "λ² − 6λ + 25 = 0: λ = 3 ± 4i.", action: eigAct([[3, -8], [2, 3]]) },
    { tag: "(e)", html: sm([[1, 1], [-2, 3]]), ans: 1, why: "λ² − 4λ + 5 = 0: λ = 2 ± i." },
    { tag: "(c)", html: sm([[3, -1], [1, 1]]), ans: 0, why: "(λ − 2)² = 0: λ = 2 twice (but only one eigenvector line).", action: eigAct([[3, -1], [1, 1]]) },
    { tag: "13", html: "rotation by θ = 60°", ans: 1, why: "λ = cos θ ± i sin θ: no direction is left fixed unless θ is a multiple of π." },
  ], { wide: true }),
  fl("6.1 · Ex 14", "A is 2 × 2 with tr(A) = 8 and det(A) = 12. Find its eigenvalues.", [vec("λ's", [2, 6])], "λ² − 8λ + 12 = (λ − 2)(λ − 6).", { check: msetCheck([2, 6]) }),
  cl("6.1 · Ex 3–12", "True or false? (A is n × n.)", TF, [
    { tag: "Ex 3", html: "A is singular if and only if 0 is an eigenvalue.", ans: 0, why: "det(A − 0I) = det A." },
    { tag: "Ex 4", html: "If λ is an eigenvalue of nonsingular A, then 1/λ is an eigenvalue of A⁻¹.", ans: 0, why: "Ax = λx gives A⁻¹x = (1/λ)x." },
    { tag: "Ex 8", html: "An idempotent matrix (A² = A) can only have eigenvalues 0 and 1.", ans: 0, why: "λ²x = λx forces λ² = λ." },
    { tag: "Ex 10", html: "The eigenvalues of A − αI are those of A shifted by −α.", ans: 0, why: "(A − αI)x = (λ − α)x." },
    { tag: "Ex 12", html: "A and Aᵀ have the same eigenvectors.", ans: 1, why: "Same eigenvalues (same characteristic polynomial), but e.g. A = (1 1; 0 2) and Aᵀ have different eigenvectors for λ = 2." },
    { tag: "Thm 6.1.1", html: "Similar matrices have the same eigenvalues.", ans: 0, why: "det(S⁻¹AS − λI) = det(S⁻¹(A − λI)S) = det(A − λI)." },
  ], { wide: true }),
]);

buildExercises("s62", "Exercises · §6.2", "From the Section 6.2 examples and exercises (p. 305–306).", [
  fl("6.2 · Example 1", "Y′ = AY with A = (3 4; 3 2): eigenpairs λ₁ = 6, x₁ = (4, 3)ᵀ and λ₂ = −1, x₂ = (1, −1)ᵀ. Find c₁, c₂ so that Y = c₁e⁶ᵗx₁ + c₂e⁻ᵗx₂ satisfies Y(0) = (6, 1)ᵀ.", [num("c₁", 1), num("c₂", 2)],
    "4c₁ + c₂ = 6 and 3c₁ − c₂ = 1, so c = X⁻¹Y(0) = (1, 2)ᵀ.", { actions: [{ label: "See the system", run: () => HOOK.ode(0) }] }),
  fl("6.2 · Ex 2(a)", "y₁′ = −y₁ + 2y₂, y₂′ = 2y₁ − y₂, y₁(0) = 3, y₂(0) = 1. With x₁ = (1, 1)ᵀ, x₂ = (1, −1)ᵀ: find λ₁, λ₂ and c₁, c₂ in Y = c₁e^{λ₁t}x₁ + c₂e^{λ₂t}x₂.", [num("λ₁", 1), num("λ₂", -3), num("c₁", 2), num("c₂", 1)],
    "A(1, 1) = (1, 1), A(1, −1) = (−3, 3). (3, 1) = 2(1, 1) + 1(1, −1). So Y = (2eᵗ + e⁻³ᵗ, 2eᵗ − e⁻³ᵗ)ᵀ.", { wide: true, actions: [{ label: "Animate it", run: () => HOOK.ode(1) }] }),
  fl("6.2 · Ex 1(a), 5(a)", "Eigenvalues of the coefficient matrices: (1a) y₁′ = y₁ + y₂, y₂′ = −2y₁ + 4y₂; (5a) y₁′ = −2y₂, y₂′ = y₁ + 3y₂.", [vec("(1a) λ's", [2, 3]), vec("(5a) λ's", [1, 2])],
    "(1a) λ² − 5λ + 6. (5a) λ² − 3λ + 2. Both: two positive eigenvalues, so every nonzero solution grows (unstable node).",
    { wide: true, check: ([a, b]) => { const r = msetCheck([2, 3])([a]); return r.ok ? msetCheck([1, 2])([b]) : r; } }),
  cl("6.2 · Phase portraits", "What does the origin look like for Y′ = AY?", ["saddle", "unstable node", "spiral source", "stable (node or spiral)", "center"], [
    { tag: "Ex 1(b)", html: sm([[2, 4], [-1, -3]]), ans: 0, why: "λ = 1, −2: opposite signs.", action: { label: "Show", run: () => HOOK.ode(4) } },
    { tag: "Ex 1(a)", html: sm([[1, 1], [-2, 4]]), ans: 1, why: "λ = 2, 3 > 0.", action: { label: "Show", run: () => HOOK.ode(3) } },
    { tag: "Ex 2(b)", html: sm([[1, -2], [2, 1]]), ans: 2, why: "λ = 1 ± 2i, positive real part.", action: { label: "Show", run: () => HOOK.ode(2) } },
    { tag: "+", html: sm([[-2, 0], [0, -1]]), ans: 3, why: "λ = −2, −1 < 0.", action: { label: "Show", run: () => HOOK.ode(7) } },
    { tag: "+", html: sm([[0, 1], [-1, 0]]), ans: 4, why: "λ = ±i: pure rotation, y₁² + y₂² is constant.", action: { label: "Show", run: () => HOOK.ode(5) } },
  ], { wide: true }),
  fl("6.2 · Ex 11", "y″ = a₀y + a₁y′ becomes Y′ = AY with y₁ = y, y₂ = y′. Find A for y″ = −2y + 3y′, and its eigenvalues.", [mat("A", [[0, 1], [-2, 3]]), vec("λ's", [1, 2])],
    "y₁′ = y₂ and y₂′ = −2y₁ + 3y₂. Characteristic polynomial λ² − 3λ + 2: the same as the auxiliary equation of the ODE.",
    { check: ([A, v]) => { const okA = qm.eq(A, qm.of([[0, 1], [-2, 3]])); return okA ? msetCheck([1, 2])([v]) : { ok: false, msg: "Row 1 says y₁′ = y₂; row 2 says y₂′ = y″." }; } }),
]);

const factorCheck = A => ([X, Dm]) => {
  const n = A.length, diagOK = Dm.every((r, i) => r.every((v, j) => i === j || v.zero));
  if (!diagOK) return { ok: false, msg: "D must be diagonal." };
  if (qm.det(X).zero) return { ok: false, msg: "X must be nonsingular (independent eigenvectors)." };
  return qm.eq(qm.mul(qm.mul(X, Dm), qm.inv(X)), qm.of(A)) ? { ok: true, msg: "Correct: XDX⁻¹ = A." } : { ok: false, msg: "XDX⁻¹ ≠ A: column j of X must be an eigenvector for the j-th diagonal entry of D." };
};
const diagAns = A => { const E = eigen(qm.of(A)), cols = [], ls = []; E.groups.forEach(g => g.basis.forEach(b => { cols.push(b); ls.push(g.l); })); return [qm.T(cols), ls.map((l, i) => ls.map((_, j) => i === j ? l : new Q(0)))]; };
buildExercises("s63", "Exercises · §6.3", "From the Section 6.3 exercises (p. 330–334) and the applications.", [
  ...[["(a)", [[0, 1], [1, 0]]], ["(b)", [[5, 6], [-2, -2]]], ["(c)", [[2, -8], [1, -4]]], ["(e)", [[1, 0, 0], [-2, 1, 3], [1, 1, -1]]]].map(([t, A]) => {
    const [X, Dm] = diagAns(A);
    return fl(`6.3 · Ex 1${t}`, `Factor A = ${sm(A)} as XDX⁻¹ with D diagonal. Any valid X, D is accepted.`, [mat("X", X), mat("D", Dm)], `Eigenvalues ${Dm.map((r, i) => r[i].txt()).join(", ")}; the columns of X are corresponding eigenvectors (any nonzero multiples, in the same order as D).`,
      { wide: true, check: factorCheck(A), actions: [diagAct(A)] });
  }),
  fl("6.3 · Ex 2(a), (b)", "Use A = XDX⁻¹ to compute A⁶ for (a) A = (0 1; 1 0) and (b) A = (5 6; −2 −2).", [mat("(a)", qm.pow(qm.of([[0, 1], [1, 0]]), 6)), mat("(b)", qm.pow(qm.of([[5, 6], [-2, -2]]), 6))],
    "(a) D⁶ = diag(1, (−1)⁶) = I, so A⁶ = I. (b) Eigenvalues 2 and 1: A⁶ = X diag(64, 1) X⁻¹.", { wide: true }),
  fl("6.3 · Ex 4(a)", "Find B with B² = A for A = (2 1; −2 −1).", [mat("B", [[2, 1], [-2, -1]])], "A has eigenvalues 1 and 0, so B = X diag(1, 0)^½ X⁻¹ = A itself: A² = A.",
    { check: ([B]) => qm.eq(qm.mul(B, B), qm.of([[2, 1], [-2, -1]])) ? { ok: true, msg: "Correct: B² = A." } : { ok: false, msg: "B² ≠ A." } }),
  fl("6.3 · Matrix exponential", "e^A = I + A + A²/2! + ⋯. Compute e^A for the nilpotent A = (0 1; 0 0), and for D = diag(0, 0) the trivial e^D.", [mat("e^A", [[1, 1], [0, 1]]), mat("e^D", [[1, 0], [0, 1]])],
    "A² = O, so the series stops: e^A = I + A. (A is defective, so XDX⁻¹ is not available; the series is.)", { wide: true }),
  ch("6.3 · Ex 9", "A is 4 × 4 and λ has multiplicity 3. If A − λI has rank 1, is A defective?", ["No: the eigenspace of λ has dimension 3", "Yes", "Cannot tell"], 0, "dim N(A − λI) = 4 − 1 = 3 equals the multiplicity; the fourth eigenvalue contributes one more eigenvector."),
  fl("6.3 · Markov", "(Example 6.1.1) With A = (0.7 0.2; 0.3 0.8), what fraction of women are married in the long run? (Example 6.3.5) In the steady state of the leasing chain with 500 vehicles, how many sedans are leased?", [num("fraction married", "2/5"), num("sedans", 125)],
    "Solve (A − I)x = 0: 0.3x₁ = 0.2x₂, so x ∝ (2, 3). The leasing matrix is symmetric with column sums 1, so its row sums are 1 too and the uniform vector (125, 125, 125, 125) is steady.", { wide: true }),
]);

buildExercises("s64", "Exercises · §6.4", "Conceptual checks on Section 6.4.", [
  cl("6.4 · Theorems", "True or false?", TF, [
    { tag: "6.4.1", html: "Hermitian matrices have real eigenvalues.", ans: 0, why: "λ‖x‖² = xᴴAx is real because (xᴴAx)ᴴ = xᴴAx." },
    { tag: "6.4.1", html: "For a real symmetric matrix, eigenvectors of distinct eigenvalues are orthogonal.", ans: 0, why: "λ₁x₂ᵀx₁ = x₂ᵀAx₁ = (Ax₂)ᵀx₁ = λ₂x₂ᵀx₁." },
    { tag: "+", html: "Every real matrix has real eigenvalues.", ans: 1, why: "A rotation by 90° has eigenvalues ±i." },
    { tag: "6.4.4", html: "Every real symmetric matrix can be diagonalized by an orthogonal matrix.", ans: 0, why: "The Spectral Theorem." },
    { tag: "6.4.8", html: "A matrix with a complete orthonormal set of eigenvectors must be normal (AAᴴ = AᴴA).", ans: 0, why: "A = UDUᴴ gives AAᴴ = UDD̄Uᴴ = AᴴA." },
  ], { wide: true }),
  fl("6.4 · Spectral theorem", "A = (2 1; 1 2). Give an orthogonal Q (entries may be written as decimals) and diagonal D with A = QDQᵀ; enter D only, with the larger eigenvalue first.", [mat("D", [[3, 0], [0, 1]])],
    "Eigenvalues 3 and 1 with eigenvectors (1, 1)/√2 and (−1, 1)/√2, which are orthonormal: Q = (1/√2)(1 −1; 1 1)."),
  ch("6.4 · Example", "Which matrix is Hermitian?", ["(2, 1 − i; 1 + i, 3)", "(2, 1 + i; 1 + i, 3)", "(i, 0; 0, 1)", "(0, 1; −1, 0)"], 0, "Mᴴ = M requires a real diagonal and conjugate off-diagonal entries."),
]);

buildExercises("s65", "Exercises · §6.5", "From Section 6.5 and its examples.", [
  fl("6.5 · Example 1", `Singular values of A = ${sm([[1, 1], [1, 1], [0, 0]])}.`, [num("σ₁", 2), num("σ₂", 0)], "AᵀA = (2 2; 2 2) has eigenvalues 4 and 0, so σ₁ = 2, σ₂ = 0 and A has rank 1."),
  fl("6.5 · Norms and rank", "A = (3 0; 4 5). Find σ₁², σ₂², ‖A‖_F² and the squared Frobenius error ‖A − A₁‖_F² of the best rank-1 approximation.", [num("σ₁²", 45), num("σ₂²", 5), num("‖A‖_F²", 50), num("‖A − A₁‖_F²", 5)],
    "AᵀA = (25 20; 20 25), eigenvalues 45 and 5. ‖A‖_F² = Σσᵢ² = 9 + 16 + 25 = 50, and the error of the best rank-k approximation is σ²_{k+1} + ⋯.", { wide: true }),
  cl("6.5 · Facts", "True or false?", TF, [
    { tag: "+", html: "The number of nonzero singular values equals the rank.", ans: 0, why: "rank A = rank Σ." },
    { tag: "+", html: "The singular values of a symmetric matrix are its eigenvalues.", ans: 1, why: "They are the absolute values of the eigenvalues (try −I)." },
    { tag: "+", html: "‖A‖₂ = σ₁.", ans: 0, why: "The longest semi-axis of the image of the unit sphere." },
    { tag: "App. 1", html: "Numerical rank counts singular values above a tolerance.", ans: 0, why: "Rounding makes exact zeros rare; tiny σ's are treated as 0." },
  ], { wide: true }),
]);

buildExercises("s66", "Exercises · §6.6", "From the Section 6.6 exercises (p. 363–364).", [
  fl("6.6 · Ex 1(a), (b)", "Symmetric matrices of (a) 3x² − 5xy + y², (b) 2x² + 3y² + z² + xy − 2xz + 3yz.", [mat("(a)", [[3, "-5/2"], ["-5/2", 1]]), mat("(b)", [[2, "1/2", -1], ["1/2", 3, "3/2"], [-1, "3/2", 1]])],
    "Squares go on the diagonal; each cross-term coefficient is split equally between the two symmetric positions.", { wide: true }),
  cl("6.6 · Ex 6", "Positive definite, negative definite or indefinite?", ["positive definite", "negative definite", "indefinite"], [
    { tag: "(a)", html: sm([[3, 2], [2, 2]]), ans: 0, why: "a = 3 > 0 and det = 2 > 0." },
    { tag: "(b)", html: sm([[3, 4], [4, 1]]), ans: 2, why: "det = −13 < 0: eigenvalues of opposite sign." },
    { tag: "(e)", html: sm([[1, 2, 1], [2, 1, 1], [1, 1, 2]]), ans: 2, why: "Second leading minor 1 − 4 = −3 < 0." },
    { tag: "(f)", html: sm([[2, 0, 0], [0, 5, 3], [0, 3, 5]]), ans: 0, why: "Leading minors 2, 10, 32 > 0 (eigenvalues 2, 8, 2)." },
    { tag: "+", html: sm([[-2, 1], [1, -3]]), ans: 1, why: "−A is positive definite: −2 < 0 and det = 5 > 0." },
  ], { wide: true }),
  cl("6.6 · Ex 3", "Identify the conic.", ["ellipse", "hyperbola"], [
    { tag: "(a)", html: "x² + xy + y² − 6 = 0", ans: 0, why: "A = (1 ½; ½ 1) has eigenvalues 3/2 and 1/2." },
    { tag: "(b)", html: "3x² + 8xy + 3y² + 28 = 0", ans: 1, why: "Eigenvalues 7 and −1." },
    { tag: "(c)", html: "−3x² + 6xy + 5y² − 24 = 0", ans: 1, why: "Eigenvalues 6 and −4." },
  ], { wide: true }),
  fl("6.6 · Example 2, 4", "Eigenvalues of the matrices of (Example 2) 3x² + 2xy + 3y² and (Example 4) 2x² − 4xy + 5y².", [vec("Example 2", [4, 2]), vec("Example 4", [6, 1])],
    "(3 1; 1 3): 4 and 2, so 3x² + 2xy + 3y² = 8 is the ellipse 4x′² + 2y′² = 8. (2 −2; −2 5): 6 and 1, so the origin is a strict minimum.",
    { wide: true, check: ([a, b]) => { const r = msetCheck([4, 2])([a]); return r.ok ? msetCheck([6, 1])([b]) : r; } }),
  ch("6.6 · Ex 7(a)", "f(x, y) = 3x² − xy + y² at (0, 0) has", ["a local minimum", "a local maximum", "a saddle point"], 0, "Hessian (6 −1; −1 2) has positive leading minors 6 and 11."),
]);

buildExercises("s67", "Exercises · §6.7", "Factorizations of positive definite matrices.", [
  fl("6.7 · Cholesky", `Find the Cholesky factor L (lower triangular, positive diagonal, A = LLᵀ) of (a) A = ${sm([[4, 2], [2, 5]])}, (b) A = ${sm([[4, 2, -2], [2, 10, 2], [-2, 2, 6]])}.`, [mat("(a) L", [[2, 0], [1, 2]]), mat("(b) L", [[2, 0, 0], [1, 3, 0], [-1, 1, 2]])],
    "l₁₁ = √a₁₁, l₂₁ = a₂₁/l₁₁, l₂₂ = √(a₂₂ − l₂₁²), … (b): l₃₁ = −1, l₃₂ = (2 − 1·(−1))/3 = 1, l₃₃ = √(6 − 1 − 1) = 2.", { wide: true }),
  fl("6.7 · LDLᵀ", "Write A = (4 2; 2 5) as LDLᵀ with L unit lower triangular and D diagonal.", [mat("L", [[1, 0], ["1/2", 1]]), mat("D", [[4, 0], [0, 4]])], "Elimination: l₂₁ = 2/4, pivots 4 and 5 − 1 = 4. Then the Cholesky factor is L D^½.", { wide: true }),
  cl("6.7 · Theorem 6.7.1", "For a symmetric A, is each condition equivalent to positive definiteness?", ["equivalent", "not equivalent"], [
    { tag: "(b)", html: "all leading principal minors are positive", ans: 0, why: "Theorem 6.7.1(b)." },
    { tag: "+", html: "all diagonal entries are positive", ans: 1, why: "Necessary, not sufficient: (1 2; 2 1)." },
    { tag: "+", html: "det A > 0", ans: 1, why: "−I (2 × 2) has det 1." },
    { tag: "(e)", html: "A = BᵀB for some nonsingular B", ans: 0, why: "xᵀAx = ‖Bx‖² > 0 for x ≠ 0." },
  ], { wide: true }),
]);

buildExercises("s68", "Exercises · §6.8", "Nonnegative matrices and the open model.", [
  fl("6.8 · Open model", "Leontief open model x = Ax + d with A = (0.2 0.4; 0.3 0.1) and demand d = (10, 20)ᵀ. Find the production vector x = (I − A)⁻¹d.",
    [vec("x", qm.mul(qm.inv(qm.of([["0.8", "-0.4"], ["-0.3", "0.9"]])), qm.col([10, 20])).map(r => r[0]))],
    "I − A = (0.8 −0.4; −0.3 0.9), det = 0.6, so x = (1/0.6)(0.9·10 + 0.4·20, 0.3·10 + 0.8·20) = (85/3, 95/3)ᵀ. Column sums of A are below 1, so (I − A)⁻¹ ≥ O."),
  cl("6.8 · Perron–Frobenius", "True or false?", TF, [
    { tag: "6.8.1", html: "A positive matrix has a positive eigenvalue r with |λ| < r for all other eigenvalues.", ans: 0, why: "Perron's Theorem." },
    { tag: "6.8.1", html: "That eigenvalue has an eigenvector with all entries positive.", ans: 0, why: "Perron's Theorem." },
    { tag: "+", html: "Every nonnegative matrix has a strictly dominant eigenvalue.", ans: 1, why: "(0 1; 1 0) has eigenvalues ±1 of equal size (it is irreducible but periodic)." },
  ], { wide: true }),
]);
})();
