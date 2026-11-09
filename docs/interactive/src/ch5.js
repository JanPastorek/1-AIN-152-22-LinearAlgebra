(() => {
"use strict";
const { $, MINUS, HOOK, goto, el, fmt, gcd, Q, matHTML, lbl, linExpr, q, qm, ch, fl, cl, vec, mat, num, buildExercises, sm, renderDefinitions, setStore, plane2D, draggable } = LA;
setStore("leon-ch5-solved-v1");
const S_ = n => `<sub>${n}</sub>`;
const qf = v => Q.parse(String(+(+v).toFixed(6)));
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;
const colM = v => v.map(x => [x]);
const toF = v => v instanceof Q ? v.n / v.d : +v;
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const nrm = a => Math.sqrt(dot(a, a));
const sub = (a, b) => a.map((v, i) => v - b[i]);
const scl = (c, a) => a.map(v => c * v);

// exact-looking display of a float: integer, fraction, k√m/d, else 4 decimals
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
const niceM = M => matHTML(M.map(r => r.map(x => x)), { render: v => nice(v) });
const toQ = v => { for (let d = 1; d <= 400; d++) { const n = Math.round(v * d); if (Math.abs(v - n / d) < 1e-9) return new Q(n, d); } throw new Error("not rational: " + v); };

// editable grid (vals: array of arrays of Q, mutated in place)
function gridIn(host, vals, o = {}) {
  let h = `<div class="mat gridin"><table>`;
  if (o.head) h += `<tr>${o.head.slice(0, vals[0].length).map(t => `<th>${t}</th>`).join("")}</tr>`;
  vals.forEach((row, i) => { h += `<tr>${row.map((v, j) => `<td class="inp"><input class="mi" style="width:${o.w || 50}px" data-i="${i}" data-j="${j}" value="${v.txt().replace(MINUS, "-")}" aria-label="${o.name || "entry"} ${i + 1},${j + 1}" autocomplete="off"></td>`).join("")}</tr>`; });
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
// float Gaussian elimination with partial pivoting; null if singular
function gsolve(A, b) {
  const n = A.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    if (Math.abs(M[p][c]) < 1e-11) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let i = c + 1; i < n; i++) { const f = M[i][c] / M[c][c]; for (let k = c; k <= n; k++) M[i][k] -= f * M[c][k]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let k = i + 1; k < n; k++) s -= M[i][k] * x[k]; x[i] = s / M[i][i]; }
  return x;
}
const fT = A => A[0].map((_, j) => A.map(r => r[j]));
const fmul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
function rightAngle(P, at, d1, d2, s = 0.3) {
  const u = scl(1 / nrm(d1), d1), w = scl(1 / nrm(d2), d2);
  const pts = [[at[0] + s * u[0], at[1] + s * u[1]], [at[0] + s * (u[0] + w[0]), at[1] + s * (u[1] + w[1])], [at[0] + s * w[0], at[1] + s * w[1]]];
  el("polyline", { points: pts.map(p => `${P.X(p[0])},${P.Y(p[1])}`).join(" "), fill: "none", style: "stroke:var(--ink)", "stroke-width": 1.5 }, P.layers.top);
}
function arc(P, a, b, r) {
  const a1 = Math.atan2(a[1], a[0]), a2 = Math.atan2(b[1], b[0]), cr = a[0] * b[1] - a[1] * b[0];
  const p1 = [r * Math.cos(a1), r * Math.sin(a1)], p2 = [r * Math.cos(a2), r * Math.sin(a2)];
  el("path", { d: `M${P.X(p1[0])},${P.Y(p1[1])} A${r * P.sc},${r * P.sc} 0 0 ${cr > 0 ? 0 : 1} ${P.X(p2[0])},${P.Y(p2[1])}`, fill: "none", style: "stroke:var(--pivot)", "stroke-width": 2 }, P.layers.top);
}
const kv = rows => rows.map(([k, v, c]) => `<tr${c ? ` class="${c}"` : ""}><th>${k}</th><td>${v}</td></tr>`).join("");

/* =========================================================
   LAB · Angle and projection
   ========================================================= */
(function projLab() {
  const PRE = [["Ex 3(a)", [3, 4], [1, 0]], ["Ex 3(b)", [3, 5], [1, 1]], ["Ex 1(b)", [2, -3], [3, 2]], ["Ex 1(c)", [4, 1], [3, 2]], ["Example 2", [3, 4], [-1, 7]], ["obtuse", [-3, 1], [2, 1]]];
  const S = { x: [3, 5], y: [1, 1], k: 1 };
  const P = plane2D($("#pj-svg"), { R: 7.6 });
  const D = draggable(P, () => [S.x, S.y], (i, p) => { if (i) S.y = p; else S.x = p; S.k = -1; draw(); }, { lim: 7.5, snap: 0.5 });
  const mark = presetRow($("#pj-presets"), PRE, k => { S.k = k; S.x = PRE[k][1].slice(); S.y = PRE[k][2].slice(); draw(); });
  function draw() {
    mark(S.k); P.clear();
    const x = S.x, y = S.y, st = $("#pj-status");
    const X = x.map(qf), Y = y.map(qf);
    const xy = X[0].mul(Y[0]).add(X[1].mul(Y[1])), yy = Y[0].mul(Y[0]).add(Y[1].mul(Y[1])), xx = X[0].mul(X[0]).add(X[1].mul(X[1]));
    if (yy.zero) { st.className = "status bad"; st.innerHTML = `<span class="k">y = 0</span>There is no direction to project onto.`; $("#pj-tab").innerHTML = ""; D.draw(["x", "y"], ["f1", "f2"]); return; }
    const c = xy.div(yy), p = Y.map(v => v.mul(c)), r = X.map((v, i) => v.sub(p[i])), pf = p.map(toF), rf = r.map(toF);
    P.lineThrough(P.layers.under, [0, 0], y, { style: "stroke:var(--c2)", "stroke-opacity": .45, "stroke-dasharray": "6 5", "stroke-width": 1.5 });
    P.arrow(P.layers.mid, [0, 0], y, "c2", 3.5); P.arrow(P.layers.mid, [0, 0], x, "c1", 3.5);
    if (!xx.zero) arc(P, y, x, 0.9);
    if (nrm(pf) > 1e-9) P.arrow(P.layers.mid, [0, 0], pf, "amb", 4.5);
    if (nrm(rf) > 1e-9) { P.arrow(P.layers.top, pf, x, "ink", 2, { "stroke-dasharray": "5 4", style: "stroke:var(--warn)" }); if (nrm(pf) > 1e-9) rightAngle(P, pf, scl(-1, pf), rf); else rightAngle(P, [0, 0], y, rf); }
    P.text(P.layers.top, [pf[0] + 0.25, pf[1] - 0.45], "p", { style: "fill:var(--pivot)", "font-weight": 700, "font-size": 15 });
    D.draw(["x", "y"], ["f1", "f2"]);
    const nx = Math.sqrt(toF(xx)), ny = Math.sqrt(toF(yy)), cos = toF(xy) / (nx * ny);
    const th = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
    const d = Math.hypot(x[0] - y[0], x[1] - y[1]);
    $("#pj-tab").innerHTML = kv([
      ["xᵀy", xy.txt(), "amb"], ["‖x‖, ‖y‖", `${nice(nx)}, ${nice(ny)}`], ["cos θ", xx.zero ? "—" : nice(cos)], ["θ", xx.zero ? "—" : `${fmt(th, 2)}°`],
      ["scalar projection α = xᵀy / ‖y‖", nice(toF(xy) / ny)], ["p = (xᵀy / yᵀy) y", `(${p.map(v => v.txt()).join(", ")})`, "amb"],
      ["x − p", `(${r.map(v => v.txt()).join(", ")})`], ["(x − p)ᵀy", r[0].mul(Y[0]).add(r[1].mul(Y[1])).txt()], ["distance ‖x − y‖", nice(d)],
    ]);
    if (xy.zero) { st.className = "status ok"; st.innerHTML = `<span class="k">Orthogonal</span>xᵀy = 0, so θ = 90° and the projection of x onto y is 0.`; }
    else { st.className = "status inf"; st.innerHTML = `<span class="k">x = p + (x − p)</span>p lies along y and x − p is orthogonal to y: (x − p)ᵀy = 0. θ is ${toF(xy) > 0 ? "acute, so p points along y" : "obtuse, so p points against y"}.`; }
  }
  HOOK.proj = (x, y) => { S.k = -1; S.x = x.slice(); S.y = y.slice(); draw(); goto("#lab-proj"); };
  draw();
})();

/* =========================================================
   LAB · Four fundamental subspaces
   ========================================================= */
(function fourLab() {
  const PRE = [["Ex 1(a)", [[3, 4], [6, 8]]], ["Ex 1(b)", [[1, 3, 1], [2, 4, 0]]], ["Ex 1(c)", [[4, -2], [1, 3], [2, 1], [3, 4]]], ["Ex 1(d)", [[1, 0, 0, 0], [0, 1, 1, 1], [0, 0, 1, 1], [1, 1, 2, 2]]], ["animation's A", [[1, 0, -1], [0, 1, 1]]], ["Ex 5 type: 3 × 2", [[1, 0], [0, 1], [1, 1]]], ["invertible", [[2, 1], [1, 1]]]];
  const S = { A: qm.of(PRE[0][1]), k: 0, x: [3, 1], b: [1, 3] };
  const Pd = plane2D($("#fs-dom"), { R: 5.2 }), Pc = plane2D($("#fs-cod"), { R: 5.2 });
  const Dd = draggable(Pd, () => [S.x], (i, p) => { S.x = p; pics(); }, { lim: 5, snap: 0.5 });
  const Dc = draggable(Pc, () => [S.b], (i, p) => { S.b = p; pics(); }, { lim: 5, snap: 0.5 });
  const mark = presetRow($("#fs-presets"), PRE, k => { S.k = k; S.A = qm.of(PRE[k][1]); build(); });
  let info = null;
  function build() {
    const m = S.A.length, n = S.A[0].length; mark(S.k);
    chipRow($("#fs-m"), [1, 2, 3, 4], m, v => { S.A = resize(S.A, v, n); S.k = -1; build(); });
    chipRow($("#fs-n"), [1, 2, 3, 4], n, v => { S.A = resize(S.A, m, v); S.k = -1; build(); });
    gridIn($("#fs-in"), S.A, { label: "A", onChange: () => { S.k = -1; mark(-1); analyse(); } });
    analyse();
  }
  function analyse() {
    const A = S.A, m = A.length, n = A[0].length, { R, piv } = qm.rref(A), r = piv.length;
    const rowB = R.slice(0, r), nul = qm.nullBasis(A), colB = piv.map(j => A.map(row => row[j])), lnul = qm.nullBasis(qm.T(A));
    info = { m, n, r, rowB, nul, colB, lnul };
    const sup = k => "⁰¹²³⁴"[k];
    $("#fs-status").className = "status ok";
    $("#fs-status").innerHTML = `<span class="k math">rank r = ${r}: dim R(Aᵀ) = ${r}, dim N(A) = ${n - r}, dim R(A) = ${r}, dim N(Aᵀ) = ${m - r}</span>In ℝ${sup(n)}: ${r} + ${n - r} = ${n}. In ℝ${sup(m)}: ${r} + ${m - r} = ${m}.`;
    const show = (list, cls, name) => list.length ? list.map((v, j) => lbl(matHTML(colM(v), { cellClass: () => cls }), `${name}${S_(j + 1)}`)).join("") : `<span class="op">{0}</span>`;
    $("#fs-bases").innerHTML = `<span class="op">R(Aᵀ):</span>${show(rowB.map(r0 => r0), "hl1", "r")}<span class="op">N(A):</span>${show(nul, "hl2", "n")}<span class="op">R(A):</span>${show(colB, "hl3", "c")}<span class="op">N(Aᵀ):</span>${show(lnul, "hl2", "ℓ")}`;
    const dq = (a, b) => a.reduce((s, v, i) => s.add(v.mul(b[i])), new Q(0));
    const all0 = (X, Y) => X.every(a => Y.every(b => dq(a, b).zero));
    const c1 = rowB.length * nul.length, c2 = colB.length * lnul.length;
    $("#fs-dots").innerHTML = `<table class="kv"><tr><th>R(Aᵀ) ⟂ N(A)</th><td>${c1 ? `${c1} scalar product${c1 > 1 ? "s" : ""}, ${all0(rowB, nul) ? "all 0 ✓" : "not all 0"}` : "trivially (one of them is {0})"}</td></tr><tr><th>R(A) ⟂ N(Aᵀ)</th><td>${c2 ? `${c2} scalar product${c2 > 1 ? "s" : ""}, ${all0(colB, lnul) ? "all 0 ✓" : "not all 0"}` : "trivially (one of them is {0})"}</td></tr></table>`;
    $("#fs-dom").parentElement.style.display = n === 2 ? "" : "none";
    $("#fs-cod").parentElement.style.display = m === 2 ? "" : "none";
    $("#fs-note").textContent = n === 2 || m === 2 ? "Drag x (domain) or b (codomain): each splits uniquely into a part in one subspace and a part in its orthogonal complement (Exercise 5.2.12)." : "The pictures are drawn when m = 2 or n = 2. Try Ex 1(a), whose four subspaces are all lines in the plane.";
    pics();
  }
  function split(P, Dr, v, basis, dim, cA, cB, nameA, nameB, label) {
    P.clear();
    let pr;
    if (dim === 0) pr = [0, 0];
    else if (dim === 2) pr = v.slice();
    else { const u = basis[0].map(toF); pr = scl(dot(v, u) / dot(u, u), u); P.lineThrough(P.layers.under, [0, 0], u, { style: `stroke:var(--${cA})`, "stroke-width": 3, "stroke-opacity": .55 }); P.lineThrough(P.layers.under, [0, 0], [-u[1], u[0]], { style: `stroke:var(--${cB})`, "stroke-width": 3, "stroke-opacity": .55 }); }
    if (dim === 2) P.poly(P.layers.under, [[-6, -6], [6, -6], [6, 6], [-6, 6]], { style: `fill:var(--${cA})`, "fill-opacity": .08 });
    const rest = sub(v, pr);
    if (nrm(pr) > 1e-9) P.arrow(P.layers.mid, [0, 0], pr, cA === "c1" ? "c1" : "c3", 3.5);
    if (nrm(rest) > 1e-9) P.arrow(P.layers.mid, pr, v, "ink", 2.5, { style: `stroke:var(--${cB})` });
    P.arrow(P.layers.top, [0, 0], v, "ink", 1.6, { "stroke-dasharray": "4 4" });
    Dr.draw([label], ["ink"]);
    return `${label} = ${nv(pr)} + ${nv(rest)}`;
  }
  function pics() {
    if (!info) return;
    const { m, n, r, rowB, colB } = info;
    if (n === 2) $("#fs-domc").innerHTML = `domain ℝ²: <b style="color:var(--c1)">R(Aᵀ)</b> ⟂ <b style="color:var(--c2)">N(A)</b>; ` + split(Pd, Dd, S.x, rowB, r, "c1", "c2", "R(Aᵀ)", "N(A)", "x");
    if (m === 2) $("#fs-codc").innerHTML = `codomain ℝ²: <b style="color:var(--c3)">R(A)</b> ⟂ <b style="color:var(--c2)">N(Aᵀ)</b>; ` + split(Pc, Dc, S.b, colB, r, "c3", "c2", "R(A)", "N(Aᵀ)", "b");
  }
  HOOK.four = A => { S.k = -1; S.A = qm.of(A); build(); goto("#lab-four"); };
  build();
})();

/* =========================================================
   LAB · Least squares fit
   ========================================================= */
(function lsLab() {
  const PRE = [
    { name: "Example 5.3.2", pts: [[0, 1], [3, 4], [6, 5]], deg: 1, view: [-1, 7.5, -1.5, 7] },
    { name: "Example 5.3.3", pts: [[0, 3], [1, 2], [2, 4], [3, 4]], deg: 2, view: [-1, 4.5, -0.5, 6] },
    { name: "Ex 5.3.5", pts: [[-1, 0], [0, 1], [1, 3], [2, 9]], deg: 1, view: [-2.5, 3.5, -2, 10] },
    { name: "Ex 5.3.6", pts: [[-1, 0], [0, 1], [1, 3], [2, 9]], deg: 2, view: [-2.5, 3.5, -2, 10] },
    { name: "Figure 5.3.3", pts: [[-1, -1.02], [0, -0.52], [2.1, 0.55], [2.3, 0.7], [2.4, 0.7], [5.3, 2.13], [6, 2.52], [6.5, 2.82], [8, 3.54]], deg: 1, view: [-2, 9, -3, 6] },
  ];
  const S = { k: 0, pts: [], deg: 1, view: null, res: true };
  const svg = $("#ls-svg");
  let P, D;
  function setView(v) {
    S.view = v;
    const sc = Math.min(420 / (v[1] - v[0]), 420 / (v[3] - v[2]));
    P = plane2D(svg, { sc, cx: -v[0] * sc + (420 - (v[1] - v[0]) * sc) / 2, cy: v[3] * sc + (420 - (v[3] - v[2]) * sc) / 2, R: 20 });
    D = draggable(P, () => S.pts, (i, p) => { S.pts[i] = p; S.k = -1; draw(); }, { lim: 40, snap: 0.1 });
  }
  const mark = presetRow($("#ls-presets"), PRE, k => load(k));
  function load(k) { const p = PRE[k]; S.k = k; S.pts = p.pts.map(a => a.slice()); S.deg = p.deg; setView(p.view); draw(); }
  $("#ls-add").onclick = () => { const v = S.view; S.pts.push([+((v[0] + v[1]) / 2).toFixed(1), +((v[2] + v[3]) / 2).toFixed(1)]); S.k = -1; draw(); };
  $("#ls-del").onclick = () => { if (S.pts.length > 1) S.pts.pop(); S.k = -1; draw(); };
  $("#ls-res").onclick = () => { S.res = !S.res; draw(); };
  function draw() {
    mark(S.k); $("#ls-res").setAttribute("aria-pressed", S.res);
    const N = S.pts.length, deg = Math.min(S.deg, 3);
    chipRow($("#ls-deg"), [0, 1, 2, 3], deg, d => { S.deg = d; draw(); }, d => ["constant", "line", "parabola", "cubic"][d]);
    P.clear();
    const xs = S.pts.map(p => p[0]), ys = S.pts.map(p => p[1]);
    const A = xs.map(x => Array.from({ length: deg + 1 }, (_, j) => x ** j));
    const AtA = fmul(fT(A), A), Aty = fT(A).map(r => dot(r, ys));
    const c = gsolve(AtA, Aty), st = $("#ls-status");
    if (!c) {
      D.draw(S.pts.map(() => ""), S.pts.map(() => "f2")); st.className = "status bad";
      st.innerHTML = `<span class="k">AᵀA is singular</span>A degree-${deg} fit needs at least ${deg + 1} different x-values. A has dependent columns, so the least squares solution is not unique (Exercise 5.3.13).`;
      $("#ls-ne").innerHTML = ""; return;
    }
    const f = x => c.reduce((s, cj, j) => s + cj * x ** j, 0), v = S.view, pts = [];
    for (let t = 0; t <= 200; t++) { const x = v[0] + (v[1] - v[0]) * t / 200; pts.push(`${P.X(x)},${P.Y(f(x))}`); }
    el("polyline", { points: pts.join(" "), fill: "none", style: "stroke:var(--c1)", "stroke-width": 3 }, P.layers.mid);
    const r = ys.map((y, i) => y - f(xs[i]));
    if (S.res) S.pts.forEach((p, i) => el("line", { x1: P.X(p[0]), y1: P.Y(p[1]), x2: P.X(p[0]), y2: P.Y(f(p[0])), style: "stroke:var(--warn)", "stroke-width": 2.5 }, P.layers.mid));
    D.draw(S.pts.map(() => ""), S.pts.map(() => "f2"));
    const rr = dot(r, r), Atr = fT(A).map(row => dot(row, r));
    const poly = c.map((cj, j) => ({ c: cj, s: j === 0 ? "" : j === 1 ? "x" : `x${"⁰¹²³"[j]}` })).filter(t => Math.abs(t.c) > 1e-12)
      .map((t, k) => `${k ? (t.c < 0 ? ` ${MINUS} ` : " + ") : (t.c < 0 ? MINUS : "")}${nice(Math.abs(t.c)) === "1" && t.s ? "" : nice(Math.abs(t.c))}${t.s}`).join("") || "0";
    st.className = rr < 1e-12 ? "status ok" : "status inf";
    st.innerHTML = `<span class="k math">y = ${poly}</span>‖r‖² = ${nice(rr)} with r = y − Aĉ. ${rr < 1e-12 ? "The curve passes through every point." : ""} Aᵀr = (${Atr.map(t => nice(Math.abs(t) < 1e-9 ? 0 : t)).join(", ")}): the residual is orthogonal to the columns of A.`;
    const As = A.length > 6 ? A.slice(0, 5).concat([A[0].map(() => "⋮")]) : A;
    $("#ls-ne").innerHTML = lbl(matHTML(As, { render: v2 => typeof v2 === "string" ? v2 : nice(v2) }), `A (${N} × ${deg + 1})`) + `<span class="op">→</span>` +
      lbl(niceM(AtA), "AᵀA") + lbl(niceM(colM(c)), "ĉ") + `<span class="op">=</span>` + lbl(niceM(colM(Aty)), "Aᵀy");
  }
  HOOK.ls = k => { load(k); goto("#lab-ls"); };
  load(0);
})();

/* =========================================================
   LAB · Norms and unit balls
   ========================================================= */
(function normLab() {
  const PS = [1, 1.5, 2, 3, 4, 10, Infinity];
  const S = { p: 2, x: [1.2, -0.8] };
  const P = plane2D($("#nm-svg"), { R: 2.6 });
  const D = draggable(P, () => [S.x], (i, v) => { S.x = v; draw(); }, { lim: 2.5, snap: 0.1 });
  const pn = (x, p) => p === Infinity ? Math.max(...x.map(Math.abs)) : Math.pow(x.reduce((s, v) => s + Math.abs(v) ** p, 0), 1 / p);
  function ball(p, rad, attrs, layer) {
    const pts = [];
    for (let t = 0; t <= 360; t += 1) {
      const a = t * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      const pt = p === Infinity ? scl(1 / Math.max(Math.abs(c), Math.abs(s)), [c, s]) : [Math.sign(c) * Math.abs(c) ** (2 / p), Math.sign(s) * Math.abs(s) ** (2 / p)];
      pts.push(`${P.X(rad * pt[0])},${P.Y(rad * pt[1])}`);
    }
    el("polygon", Object.assign({ points: pts.join(" "), fill: "none" }, attrs), layer);
  }
  function draw() {
    chipRow($("#nm-p"), PS, S.p, p => { S.p = p; draw(); }, p => p === Infinity ? "∞" : String(p));
    P.clear();
    ball(1, 1, { style: "stroke:var(--c2)", "stroke-opacity": .5, "stroke-width": 1.5 }, P.layers.under);
    ball(2, 1, { style: "stroke:var(--c1)", "stroke-opacity": .5, "stroke-width": 1.5 }, P.layers.under);
    ball(Infinity, 1, { style: "stroke:var(--c3)", "stroke-opacity": .5, "stroke-width": 1.5 }, P.layers.under);
    const r = pn(S.x, S.p);
    if (r > 1e-9) ball(S.p, r, { style: "stroke:var(--pivot)", "stroke-width": 3 }, P.layers.mid);
    P.arrow(P.layers.mid, [0, 0], S.x, "ink", 2.5);
    D.draw(["x"], ["ink"]);
    const n1 = pn(S.x, 1), n2 = pn(S.x, 2), ni = pn(S.x, Infinity);
    $("#nm-tab").innerHTML = kv([["x", nv(S.x)], ["‖x‖₁ = |x₁| + |x₂|", nice(n1)], ["‖x‖₂ = (x₁² + x₂²)^½", nice(n2)], ["‖x‖∞ = max |xᵢ|", nice(ni)], [`‖x‖${S.p === Infinity ? "∞" : "_" + S.p}`, fmt(r, 4), "amb"]]);
    const st = $("#nm-status");
    st.className = "status ok";
    st.innerHTML = `<span class="k math">‖x‖∞ ≤ ‖x‖₂ ≤ ‖x‖₁: ${fmt(ni, 3)} ≤ ${fmt(n2, 3)} ≤ ${fmt(n1, 3)}</span>${n1 > 0 && near(n1, ni, 1e-9) ? "All three agree: x lies on a coordinate axis (Exercise 23)." : "As p grows, the p-ball swells from the diamond toward the square, and ‖x‖ₚ decreases toward ‖x‖∞."}`;
  }
  draw();
})();

/* =========================================================
   LAB · Orthonormal coordinates and orthogonal matrices
   ========================================================= */
(function onLab() {
  const PRE = [["standard basis", 0, false], ["u₁ = (3/5, 4/5)", Math.atan2(4, 3) * 180 / Math.PI, false], ["45°", 45, false], ["30°", 30, false], ["reflection, u₁ = (3/5, 4/5)", Math.atan2(4, 3) * 180 / Math.PI, true]];
  const S = { th: PRE[1][1], refl: false, x: [2, 1], qx: false, k: 1 };
  const P = plane2D($("#on-svg"), { R: 3.6 });
  const D = draggable(P, () => [S.x], (i, v) => { S.x = v; draw(); }, { lim: 3.5, snap: 0.25 });
  const ths = $("#on-th"); ths.oninput = () => { S.th = +ths.value; S.k = -1; draw(); };
  $("#on-refl").onclick = () => { S.refl = !S.refl; S.k = -1; draw(); };
  $("#on-qx").onclick = () => { S.qx = !S.qx; draw(); };
  const mark = presetRow($("#on-presets"), PRE, k => { S.k = k; S.th = PRE[k][1]; S.refl = PRE[k][2]; draw(); });
  function draw() {
    mark(S.k); ths.value = Math.round(S.th); $("#on-tho").textContent = fmt(S.th, 1) + "°";
    $("#on-refl").setAttribute("aria-pressed", S.refl); $("#on-qx").setAttribute("aria-pressed", S.qx);
    P.clear();
    const a = S.th * Math.PI / 180, u1 = [Math.cos(a), Math.sin(a)], u2 = S.refl ? [Math.sin(a), -Math.cos(a)] : [-Math.sin(a), Math.cos(a)];
    const x = S.x, c = [dot(x, u1), dot(x, u2)];
    P.lineThrough(P.layers.under, [0, 0], u1, { style: "stroke:var(--c1)", "stroke-opacity": .4, "stroke-dasharray": "6 5" });
    P.lineThrough(P.layers.under, [0, 0], u2, { style: "stroke:var(--c2)", "stroke-opacity": .4, "stroke-dasharray": "6 5" });
    const p1 = scl(c[0], u1), p2 = scl(c[1], u2);
    [[p1, u1], [p2, u2]].forEach(([pp]) => el("line", { x1: P.X(x[0]), y1: P.Y(x[1]), x2: P.X(pp[0]), y2: P.Y(pp[1]), style: "stroke:var(--ink)", "stroke-dasharray": "3 3", "stroke-opacity": .6 }, P.layers.under));
    if (nrm(p1) > 1e-9) P.arrow(P.layers.mid, [0, 0], p1, "c1", 5, { "stroke-opacity": .55 });
    if (nrm(p2) > 1e-9) P.arrow(P.layers.mid, p1, x, "c2", 5, { "stroke-opacity": .55 });
    P.arrow(P.layers.mid, [0, 0], u1, "c1", 3.5); P.arrow(P.layers.mid, [0, 0], u2, "c2", 3.5);
    P.text(P.layers.top, [u1[0] * 1.15 + 0.05, u1[1] * 1.15], "u₁", { class: "f1", "font-weight": 700 }); P.text(P.layers.top, [u2[0] * 1.2 - 0.1, u2[1] * 1.2], "u₂", { class: "f2", "font-weight": 700 });
    P.arrow(P.layers.top, [0, 0], x, "ink", 3);
    if (S.qx) {
      const Qx = [u1[0] * x[0] + u2[0] * x[1], u1[1] * x[0] + u2[1] * x[1]], rr = nrm(x);
      el("circle", { cx: P.X(0), cy: P.Y(0), r: rr * P.sc, fill: "none", style: "stroke:var(--pivot)", "stroke-dasharray": "4 4", "stroke-opacity": .6 }, P.layers.under);
      P.arrow(P.layers.top, [0, 0], Qx, "amb", 3);
      P.text(P.layers.top, [Qx[0] + 0.12, Qx[1] + 0.15], "Qx", { style: "fill:var(--pivot)", "font-weight": 700 });
    }
    D.draw(["x"], ["ink"]);
    const Qm = [[u1[0], u2[0]], [u1[1], u2[1]]];
    $("#on-expr").innerHTML = lbl(niceM(Qm), "Q = (u₁ u₂)") + `<span class="op">QᵀQ =</span>` + lbl(niceM(fmul(fT(Qm), Qm)), "I") +
      `<span class="op">c = Qᵀx =</span>` + lbl(niceM(colM(c)), "coordinates");
    $("#on-status").className = "status ok";
    $("#on-status").innerHTML = `<span class="k math">x = ${nice(c[0])} u₁ ${c[1] < 0 ? MINUS : "+"} ${nice(Math.abs(c[1]))} u₂;  ‖x‖² = ${nice(dot(x, x))} = c₁² + c₂²</span>` +
      `det Q = ${S.refl ? "−1: Q is a reflection" : "+1: Q is a rotation"}. Either way Qᵀ = Q⁻¹ and ‖Qx‖ = ‖x‖. The blue segment c₁u₁ is the projection of x onto Span(u₁), the closest point of that line.`;
  }
  draw();
})();

/* =========================================================
   LAB · Gram–Schmidt and QR
   ========================================================= */
(function gsLab() {
  const PRE = [
    { name: "Example 5.6.2", A: [[1, -1, 4], [1, 4, -2], [1, 4, 2], [1, -1, 0]] },
    { name: "Example 5.6.3", A: [[1, -2, -1], [2, 0, 1], [2, -4, 2], [4, 0, 0]] },
    { name: "Ex 1(a)", A: [[-1, 3], [1, 5]] }, { name: "Ex 1(b)", A: [[2, 5], [1, 10]] },
    { name: "Ex 3", A: [[1, 4, 1], [2, 3, 2], [-2, 2, 1]] },
    { name: "Ex 5 with b", A: [[2, 1], [1, 1], [2, 1]], b: [12, 6, 18] },
    { name: "Ex 6 with b", A: [[3, -1], [4, 2], [0, 2]], b: [0, 20, 10] },
    { name: "Ex 8", A: [[4, 2, 1], [2, 0, 1], [2, 0, -1], [1, 2, 1]] },
    { name: "Ex 12: dependent", A: [[1, 0, 1], [0, 1, 1], [1, 1, 2]] },
  ];
  const S = { A: null, b: null, useb: false, step: 0, k: 0 };
  const mark = presetRow($("#gs-presets"), PRE, k => load(k));
  $("#gs-useb").onclick = () => { S.useb = !S.useb; S.k = -1; build(); };
  function load(k) { const p = PRE[k]; S.k = k; S.A = qm.of(p.A); S.useb = !!p.b; S.b = (p.b || p.A.map(() => 1)).map(v => [q(v)]); S.step = S.A[0].length; build(); }
  function build() {
    const m = S.A.length, n = S.A[0].length; mark(S.k);
    $("#gs-useb").setAttribute("aria-pressed", S.useb);
    chipRow($("#gs-m"), [2, 3, 4], m, v => { S.A = resize(S.A, v, Math.min(n, v)); S.b = resize(S.b, v, 1); S.k = -1; S.step = S.A[0].length; build(); });
    chipRow($("#gs-n"), [1, 2, 3, 4].filter(v => v <= m), n, v => { S.A = resize(S.A, m, v); S.k = -1; S.step = v; build(); });
    gridIn($("#gs-in"), S.A, { label: "A (columns a₁ … aₙ)", head: ["a₁", "a₂", "a₃", "a₄"], onChange: () => { S.k = -1; mark(-1); calc(); } });
    if (S.useb) gridIn($("#gs-b"), S.b, { label: "b", onChange: () => { S.k = -1; mark(-1); calc(); } }); else $("#gs-b").innerHTML = "";
    calc();
  }
  function calc() {
    const A = S.A.map(r => r.map(toF)), m = A.length, n = A[0].length, cols = fT(A);
    const Qc = [], R = Array.from({ length: n }, () => Array(n).fill(0)), log = [];
    let fail = -1;
    for (let k = 0; k < n; k++) {
      let v = cols[k].slice(); const rs = [];
      for (let i = 0; i < k; i++) { R[i][k] = dot(Qc[i], cols[k]); v = sub(v, scl(R[i][k], Qc[i])); rs.push(i); }
      R[k][k] = nrm(v);
      log.push({ k, rs: rs.map(i => R[i][k]), v: v.slice(), rkk: R[k][k] });
      if (R[k][k] < 1e-10 * Math.max(1, nrm(cols[k]))) { fail = k; break; }
      Qc.push(scl(1 / R[k][k], v));
    }
    const done = fail < 0 ? n : fail;
    S.step = Math.max(0, Math.min(S.step, log.length));
    const stp = $("#gs-step");
    stp.innerHTML = `<button class="btn sm" id="gs-prev">◀</button><span>column ${S.step} of ${n}</span><button class="btn sm" id="gs-next">▶</button><button class="btn sm" id="gs-all">All</button>`;
    $("#gs-prev").disabled = S.step === 0; $("#gs-next").disabled = S.step >= log.length;
    $("#gs-prev").onclick = () => { S.step--; calc(); }; $("#gs-next").onclick = () => { S.step++; calc(); }; $("#gs-all").onclick = () => { S.step = log.length; calc(); };
    const st = $("#gs-status");
    if (S.step === 0) { $("#gs-work").innerHTML = `<span class="op">Press ▶ to orthonormalize the columns one at a time.</span>`; $("#gs-out").innerHTML = ""; st.className = "status inf"; st.innerHTML = `<span class="k">Ready</span>Each step removes from a<sub>k</sub> its components along q₁, …, q<sub>k−1</sub>, then normalizes.`; return; }
    const L = log[S.step - 1], k = L.k, kk = k + 1;
    let w = "";
    if (k === 0) w += `<span class="op">r₁₁ = ‖a₁‖ = ${nice(L.rkk)};</span>`;
    else {
      w += L.rs.map((r, i) => `<span class="op">r${S_(i + 1)}${S_(kk)} = q${S_(i + 1)}ᵀa${S_(kk)} = ${nice(r)};</span>`).join("");
      w += `<span class="op">remainder a${S_(kk)} − ${L.rs.map((_, i) => `r${S_(i + 1)}${S_(kk)}q${S_(i + 1)}`).join(" − ")} =</span>` + lbl(niceM(colM(L.v)), "remainder") + `<span class="op">; r${S_(kk)}${S_(kk)} = ‖remainder‖ = ${nice(L.rkk)};</span>`;
    }
    if (fail === k) w += `<span class="op" style="color:var(--warn)">r${S_(kk)}${S_(kk)} = 0: cannot normalize</span>`;
    else w += `<span class="op">q${S_(kk)} =</span>` + lbl(niceM(colM(Qc[k])), `q${S_(kk)}`);
    $("#gs-work").innerHTML = w;
    const s = Math.min(S.step, done), Qm = Array.from({ length: m }, (_, i) => Qc.slice(0, s).map(q0 => q0[i])), Rm = R.slice(0, s).map(r => r.slice(0, s));
    let out = s ? lbl(niceM(Qm), `Q (${m} × ${s})`) + lbl(niceM(Rm), `R (${s} × ${s})`) : "";
    if (fail >= 0 && S.step > fail) {
      st.className = "status bad";
      st.innerHTML = `<span class="k">The process breaks down at column ${fail + 1}</span>a${S_(fail + 1)} lies in the span of the earlier columns, so nothing is left after subtracting projections (Exercise 5.6.12). The columns of A are linearly dependent.`;
    } else if (S.step === n) {
      const QR = fmul(Qm, Rm), err = Math.max(...QR.map((r, i) => Math.max(...r.map((v, j) => Math.abs(v - A[i][j]))))), QtQ = fmul(fT(Qm), Qm);
      const oerr = Math.max(...QtQ.map((r, i) => Math.max(...r.map((v, j) => Math.abs(v - (i === j ? 1 : 0))))));
      st.className = "status ok";
      st.innerHTML = `<span class="k">A = QR</span>Q has orthonormal columns (largest deviation of QᵀQ from I: ${oerr.toExponential(1)}), R is upper triangular with positive diagonal, and QR reproduces A (largest error ${err.toExponential(1)}).`;
      if (S.useb) {
        const bf = S.b.map(r => toF(r[0])), Qtb = fT(Qm).map(r => dot(r, bf)), x = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) { let t = Qtb[i]; for (let j = i + 1; j < n; j++) t -= Rm[i][j] * x[j]; x[i] = t / Rm[i][i]; }
        const r = bf.map((bi, i) => bi - dot(A[i], x));
        out += `<span class="op">least squares: R x̂ = Qᵀb,</span>` + lbl(niceM(colM(Qtb)), "Qᵀb") + `<span class="op">x̂ =</span>` + lbl(niceM(colM(x)), "x̂") + `<span class="op">‖b − Ax̂‖ = ${nice(nrm(r))}</span>`;
      }
    } else { st.className = "status inf"; st.innerHTML = `<span class="k">Column ${S.step} done</span>Span(q₁, …, q${S_(S.step)}) = Span(a₁, …, a${S_(S.step)}).`; }
    $("#gs-out").innerHTML = out;
  }
  HOOK.gs = k => { load(k); goto("#lab-gs"); };
  load(0);
})();

/* =========================================================
   LAB · Orthogonal polynomial families
   ========================================================= */
(function polyLab() {
  const FAM = [
    { name: "Legendre Pₙ", sym: "P", rec: "(n + 1)Pₙ₊₁ = (2n + 1)x Pₙ − n Pₙ₋₁", gen(N) { const P = [[q(1)], [q(0), q(1)]]; for (let n = 1; n < N; n++) { const a = new Q(2 * n + 1, n + 1), b = new Q(n, n + 1); const nx = Array(n + 2).fill(0).map(() => new Q(0)); P[n].forEach((c, i) => { nx[i + 1] = nx[i + 1].add(c.mul(a)); }); P[n - 1].forEach((c, i) => { nx[i] = nx[i].sub(c.mul(b)); }); P.push(nx); } return P.slice(0, N + 1); },
      ip: (f, g) => simpson(x => f(x) * g(x), -1, 1), norm: n => `2/${2 * n + 1}`, wt: "∫₋₁¹ p(x)q(x) dx" },
    { name: "Chebyshev Tₙ", sym: "T", rec: "Tₙ₊₁ = 2x Tₙ − Tₙ₋₁", gen(N) { const T = [[q(1)], [q(0), q(1)]]; for (let n = 1; n < N; n++) { const nx = Array(n + 2).fill(0).map(() => new Q(0)); T[n].forEach((c, i) => { nx[i + 1] = nx[i + 1].add(c.mul(2)); }); T[n - 1].forEach((c, i) => { nx[i] = nx[i].sub(c); }); T.push(nx); } return T.slice(0, N + 1); },
      ip: (f, g) => simpson(t => f(Math.cos(t)) * g(Math.cos(t)), 0, Math.PI), norm: n => n === 0 ? "π" : "π/2", wt: "∫₋₁¹ p(x)q(x)(1 − x²)^−½ dx" },
  ];
  function simpson(f, a, b, n = 2000) { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return s * h / 3; }
  const S = { f: 0, N: 4 };
  const P = plane2D($("#op-svg"), { R: 1.25 });
  const colors = ["ink", "c1", "c2", "c3", "pivot", "warn"];
  const markF = presetRow($("#op-fam"), FAM, k => { S.f = k; draw(); });
  const polyStr = (c, sym, n) => {
    const parts = []; for (let i = c.length - 1; i >= 0; i--) { const v = c[i]; if (v.zero) continue; const a = v.abs(), mon = i === 0 ? "" : i === 1 ? "x" : `x${"⁰¹²³⁴⁵⁶"[i]}`; parts.push({ neg: v.neg_, body: (a.one && mon ? "" : a.html()) + mon }); }
    return `${sym}${S_(n)}(x) = ` + parts.map((p, k) => (k ? (p.neg ? ` ${MINUS} ` : " + ") : (p.neg ? MINUS : "")) + p.body).join("");
  };
  function draw() {
    markF(S.f);
    chipRow($("#op-n"), [1, 2, 3, 4, 5], S.N, n => { S.N = n; draw(); });
    const F = FAM[S.f], polys = F.gen(S.N), fns = polys.map(c => x => c.reduce((s, v, i) => s + toF(v) * x ** i, 0));
    P.clear();
    [-1, -0.5, 0.5, 1].forEach(t => { el("line", { x1: P.X(t), y1: P.Y(-1.25), x2: P.X(t), y2: P.Y(1.25), class: "gridl" }, P.layers.under); el("line", { x1: P.X(-1.25), y1: P.Y(t), x2: P.X(1.25), y2: P.Y(t), class: "gridl" }, P.layers.under); });
    fns.forEach((f, n) => {
      const pts = []; for (let t = 0; t <= 200; t++) { const x = -1 + 2 * t / 200; pts.push(`${P.X(x)},${P.Y(f(x))}`); }
      el("polyline", { points: pts.join(" "), fill: "none", style: `stroke:var(--${colors[n % colors.length]})`, "stroke-width": 2.5 }, P.layers.mid);
    });
    $("#op-list").innerHTML = polys.map((c, n) => `<div style="color:var(--${colors[n % colors.length]})">${polyStr(c, F.sym, n)}</div>`).join("");
    const G = fns.map(f => fns.map(g => F.ip(f, g)));
    $("#op-gram").innerHTML = lbl(matHTML(G, { render: v => Math.abs(v) < 1e-8 ? "0" : fmt(v, 4), cellClass: (i, j) => i === j ? "hl3" : "" }), `Gram matrix ⟨${F.sym}ᵢ, ${F.sym}ⱼ⟩, inner product ${F.wt}`);
    $("#op-status").className = "status ok";
    $("#op-status").innerHTML = `<span class="k math">${F.rec}</span>Off-diagonal entries are 0: the polynomials are mutually orthogonal. Diagonal: ‖${F.sym}ₙ‖² = ${polys.map((_, n) => F.norm(n)).join(", ")}.`;
  }
  draw();
})();

/* =========================================================
   Definitions
   ========================================================= */
renderDefinitions([
  { sec: "s51", id: "def-dot", term: "Scalar product, angle, projection", ref: "§5.1 · Definitions, Theorem 5.1.1", scene: "ScalarProjection", lab: ["#lab-proj", "Open the projection lab"],
    html: `The <b>scalar product</b> of <b>x</b>, <b>y</b> ∈ ℝ<sup><i>n</i></sup> is <b>x</b><sup>T</sup><b>y</b> = Σ<i>x</i>${S_("i")}<i>y</i>${S_("i")}; the length is ‖<b>x</b>‖ = (<b>x</b><sup>T</sup><b>x</b>)<sup>1/2</sup> and the distance is ‖<b>x</b> − <b>y</b>‖. For nonzero vectors <b>x</b><sup>T</sup><b>y</b> = ‖<b>x</b>‖‖<b>y</b>‖ cos θ. <b>x</b> and <b>y</b> are <b>orthogonal</b> if <b>x</b><sup>T</sup><b>y</b> = 0. The <b>scalar projection</b> of <b>x</b> onto <b>y</b> is α = <b>x</b><sup>T</sup><b>y</b>/‖<b>y</b>‖ and the <b>vector projection</b> is <b>p</b> = (<b>x</b><sup>T</sup><b>y</b>/<b>y</b><sup>T</sup><b>y</b>)<b>y</b>.`,
    note: "Exercise 5.1.3(b): x = (3, 5)ᵀ, y = (1, 1)ᵀ, p = (4, 4)ᵀ, x − p = (−1, 1)ᵀ." },
  { sec: "s52", id: "def-perp", term: "Orthogonal complement; fundamental subspaces", ref: "§5.2 · Definitions, Theorems 5.2.1–5.2.4", scene: "OrthogonalComplement", lab: ["#lab-four", "Open the four subspaces"],
    html: `Subspaces <i>X</i>, <i>Y</i> of ℝ<sup><i>n</i></sup> are <b>orthogonal</b> if <b>x</b><sup>T</sup><b>y</b> = 0 for all <b>x</b> ∈ <i>X</i>, <b>y</b> ∈ <i>Y</i>. The <b>orthogonal complement</b> of <i>Y</i> is <i>Y</i><sup>⊥</sup> = {<b>x</b> ∈ ℝ<sup><i>n</i></sup> : <b>x</b><sup>T</sup><b>y</b> = 0 for every <b>y</b> ∈ <i>Y</i>}. <b>Fundamental Subspaces Theorem:</b> <i>N</i>(<i>A</i>) = <i>R</i>(<i>A</i><sup>T</sup>)<sup>⊥</sup> and <i>N</i>(<i>A</i><sup>T</sup>) = <i>R</i>(<i>A</i>)<sup>⊥</sup>. Also dim <i>S</i> + dim <i>S</i><sup>⊥</sup> = <i>n</i>, ℝ<sup><i>n</i></sup> = <i>S</i> ⊕ <i>S</i><sup>⊥</sup> and (<i>S</i><sup>⊥</sup>)<sup>⊥</sup> = <i>S</i>.` },
  { sec: "s53", id: "def-ls", term: "Least squares solution; normal equations", ref: "§5.3 · Theorems 5.3.1, 5.3.2", scene: "LeastSquares", lab: ["#lab-ls", "Fit data in the lab"],
    html: `A <b>least squares solution</b> of <i>A</i><b>x</b> = <b>b</b> is an <b>x̂</b> minimizing ‖<b>b</b> − <i>A</i><b>x</b>‖. Then <b>p</b> = <i>A</i><b>x̂</b> is the vector of <i>R</i>(<i>A</i>) closest to <b>b</b>, and <b>b</b> − <b>p</b> ∈ <i>R</i>(<i>A</i>)<sup>⊥</sup> = <i>N</i>(<i>A</i><sup>T</sup>). So <b>x̂</b> solves the <b>normal equations</b> <i>A</i><sup>T</sup><i>A</i><b>x</b> = <i>A</i><sup>T</sup><b>b</b>; if <i>A</i> has rank <i>n</i>, the solution is unique: <b>x̂</b> = (<i>A</i><sup>T</sup><i>A</i>)<sup>−1</sup><i>A</i><sup>T</sup><b>b</b>.` },
  { sec: "s54", id: "def-ip", term: "Inner product; norm", ref: "§5.4 · Definitions, Theorems 5.4.1–5.4.3", scene: "Norms", lab: ["#lab-norm", "Compare norms in the lab"],
    html: `An <b>inner product</b> on <i>V</i> assigns a real number ⟨<b>x</b>, <b>y</b>⟩ to each pair so that (I) ⟨<b>x</b>, <b>x</b>⟩ ≥ 0 with equality iff <b>x</b> = <b>0</b>; (II) ⟨<b>x</b>, <b>y</b>⟩ = ⟨<b>y</b>, <b>x</b>⟩; (III) ⟨α<b>x</b> + β<b>y</b>, <b>z</b>⟩ = α⟨<b>x</b>, <b>z</b>⟩ + β⟨<b>y</b>, <b>z</b>⟩. A <b>norm</b> ‖·‖ satisfies ‖<b>v</b>‖ ≥ 0 (= 0 iff <b>v</b> = <b>0</b>), ‖α<b>v</b>‖ = |α|‖<b>v</b>‖, ‖<b>v</b> + <b>w</b>‖ ≤ ‖<b>v</b>‖ + ‖<b>w</b>‖. Every inner product gives the norm ‖<b>v</b>‖ = ⟨<b>v</b>, <b>v</b>⟩<sup>1/2</sup>, the <b>Pythagorean law</b> and the <b>Cauchy–Schwarz inequality</b> |⟨<b>u</b>, <b>v</b>⟩| ≤ ‖<b>u</b>‖‖<b>v</b>‖.` },
  { sec: "s55", id: "def-on", term: "Orthonormal set; orthogonal matrix", ref: "§5.5 · Definitions, Theorems 5.5.2, 5.5.5, 5.5.7", scene: "OrthonormalCoordinates", lab: ["#lab-on", "Open the orthonormal lab"],
    html: `Nonzero <b>v</b>${S_(1)}, …, <b>v</b>${S_("n")} with ⟨<b>v</b>${S_("i")}, <b>v</b>${S_("j")}⟩ = 0 for <i>i</i> ≠ <i>j</i> form an <b>orthogonal set</b>; it is <b>orthonormal</b> if moreover each has length 1. In an orthonormal basis, <b>v</b> = Σ<i>c</i>${S_("i")}<b>u</b>${S_("i")} with <i>c</i>${S_("i")} = ⟨<b>v</b>, <b>u</b>${S_("i")}⟩, and ‖<b>v</b>‖<sup>2</sup> = Σ<i>c</i>${S_("i")}<sup>2</sup>. An <i>n</i> × <i>n</i> matrix <i>Q</i> is <b>orthogonal</b> if its columns form an orthonormal set, i.e. <i>Q</i><sup>T</sup><i>Q</i> = <i>I</i>.` },
  { sec: "s56", id: "def-gs", term: "Gram–Schmidt process; QR factorization", ref: "§5.6 · Theorems 5.6.1–5.6.3", scene: "GramSchmidt", lab: ["#lab-gs", "Step through it in the lab"],
    html: `Let {<b>x</b>${S_(1)}, …, <b>x</b>${S_("n")}} be a basis. Set <b>u</b>${S_(1)} = <b>x</b>${S_(1)}/‖<b>x</b>${S_(1)}‖ and, for <i>k</i> = 1, …, <i>n</i> − 1, <b>p</b>${S_("k")} = Σ<sub><i>i</i>≤<i>k</i></sub>⟨<b>x</b>${S_("k+1")}, <b>u</b>${S_("i")}⟩<b>u</b>${S_("i")}, <b>u</b>${S_("k+1")} = (<b>x</b>${S_("k+1")} − <b>p</b>${S_("k")})/‖<b>x</b>${S_("k+1")} − <b>p</b>${S_("k")}‖. Then {<b>u</b>${S_(1)}, …, <b>u</b>${S_("n")}} is an orthonormal basis with the same partial spans. For an <i>m</i> × <i>n</i> <i>A</i> of rank <i>n</i>: <i>A</i> = <i>QR</i>, <i>Q</i> with orthonormal columns and <i>R</i> upper triangular with positive diagonal; the least squares solution solves <i>R</i><b>x̂</b> = <i>Q</i><sup>T</sup><b>b</b>.` },
  { sec: "s57", id: "def-op", term: "Orthogonal polynomials", ref: "§5.7 · Definition, Theorems 5.7.1, 5.7.2", scene: "LegendrePolynomials", lab: ["#lab-poly", "Plot the families"],
    html: `A sequence <i>p</i>${S_(0)}, <i>p</i>${S_(1)}, … of polynomials with deg <i>p</i>${S_("i")} = <i>i</i> is a sequence of <b>orthogonal polynomials</b> if ⟨<i>p</i>${S_("i")}, <i>p</i>${S_("j")}⟩ = 0 whenever <i>i</i> ≠ <i>j</i>. It is orthonormal if also ⟨<i>p</i>${S_("i")}, <i>p</i>${S_("i")}⟩ = 1. Any such sequence satisfies a three-term recursion <i>p</i>${S_("n+1")} = (<i>a</i>${S_("n")}<i>x</i> − <i>b</i>${S_("n")})<i>p</i>${S_("n")} − <i>c</i>${S_("n")}<i>p</i>${S_("n−1")}.` },
], { s51: "5.1", s52: "5.2", s53: "5.3", s54: "5.4", s55: "5.5", s56: "5.6", s57: "5.7" });

/* =========================================================
   Exercises
   ========================================================= */
const TF = ["True", "False"];
const qv = a => a.map(q);
const dq = (a, b) => a.reduce((s, v, i) => s.add(q(v).mul(q(b[i]))), new Q(0));
const projQ = (x, y) => { const c = dq(x, y).div(dq(y, y)); return y.map(v => q(v).mul(c)); };
const colsToX = cols => qm.of(cols[0].map((_, i) => cols.map(c => c[i])));
const lsQ = (A, b) => { const At = qm.T(qm.of(A)); return qm.solve(qm.mul(At, qm.of(A)), qm.mul(At, qm.col(b)).map(r => r[0])); };
const vand = (xs, d) => xs.map(x => Array.from({ length: d + 1 }, (_, j) => x ** j));
const prop = (v, w) => { // v proportional to w (both nonzero)
  const k = w.findIndex(t => !q(t).zero); if (v[k].zero) return false; const c = v[k].div(q(w[k])); return v.every((t, i) => t.eq(q(w[i]).mul(c)));
};
const orthoBasisCheck = (vecs, against, need) => {
  const nz = vecs.filter(v => v.some(t => !t.zero));
  if (nz.length < need) return { ok: false, msg: "Give nonzero vectors." };
  if (!vecs.every(v => against.every(a => dq(v, a).zero))) return { ok: false, msg: "Each vector must be orthogonal to every given spanning vector." };
  if (qm.rank(vecs.map(v => v.slice())) < need) return { ok: false, msg: "The vectors you gave are dependent: not a basis." };
  return { ok: true, msg: "Correct: independent and orthogonal to the subspace, with the right dimension." };
};
// exact Gram–Schmidt when all the norms happen to be rational
function gsExact(A) {
  const cols = fT(A), Qc = [], n = cols.length, R = Array.from({ length: n }, () => Array(n).fill(0));
  for (let k = 0; k < n; k++) { let v = cols[k].slice(); for (let i = 0; i < k; i++) { R[i][k] = dot(Qc[i], cols[k]); v = sub(v, scl(R[i][k], Qc[i])); } R[k][k] = nrm(v); Qc.push(scl(1 / R[k][k], v)); }
  return { Q: fT(Qc).map(r => r.map(toQ)), R: R.map(r => r.map(toQ)) };
}

buildExercises("s51", "Exercises · §5.1", "From the Section 5.1 exercises (p. 212–214).", [
  cl("5.1 · Ex 1", "Classify the angle between v and w.", ["θ = 0", "θ = 90°", "acute (0 < θ < 90°)", "obtuse"], [
    { tag: "(a)", html: "v = (2, 1, 3)ᵀ, w = (6, 3, 9)ᵀ", ans: 0, why: "w = 3v: same direction." },
    { tag: "(b)", html: "v = (2, −3)ᵀ, w = (3, 2)ᵀ", ans: 1, why: "vᵀw = 6 − 6 = 0.", action: { label: "Show in the lab", run: () => HOOK.proj([2, -3], [3, 2]) } },
    { tag: "(c)", html: "v = (4, 1)ᵀ, w = (3, 2)ᵀ", ans: 2, why: "vᵀw = 14 > 0 and they are not parallel." },
    { tag: "(d)", html: "v = (−2, 3, 1)ᵀ, w = (1, 2, 4)ᵀ", ans: 2, why: "vᵀw = −2 + 6 + 4 = 8 > 0." },
  ], { wide: true }),
  fl("5.1 · Ex 3", "Find the vector projection p of x onto y: (a) x = (3, 4)ᵀ, y = (1, 0)ᵀ; (b) x = (3, 5)ᵀ, y = (1, 1)ᵀ; (c) x = (2, 4, 3)ᵀ, y = (1, 1, 1)ᵀ; (d) x = (2, −5, 4)ᵀ, y = (1, 2, −1)ᵀ.",
    [[[3, 4], [1, 0]], [[3, 5], [1, 1]], [[2, 4, 3], [1, 1, 1]], [[2, -5, 4], [1, 2, -1]]].map(([x, y], k) => vec(`(${"abcd"[k]}) p`, projQ(x, y))),
    "p = (xᵀy / yᵀy) y. (d): xᵀy = 2 − 10 − 4 = −12 and yᵀy = 6, so p = −2y. In each case x − p is orthogonal to y.",
    { wide: true, actions: [{ label: "Check (b) in the lab", run: () => HOOK.proj([3, 5], [1, 1]) }] }),
  fl("5.1 · Ex 5, 6", "(5) The point on the line y = 2x closest to (5, 2). (6) The point on the line y = 2x + 1 closest to (5, 2).",
    [vec("(5)", projQ([5, 2], [1, 2])), vec("(6)", projQ([5, 1], [1, 2]).map((v, i) => v.add(q([0, 1][i]))))],
    "(5) Project (5, 2) onto the direction (1, 2): (9/5)(1, 2). (6) Shift down by 1 so the line passes through 0, project (5, 1), and shift back: (7/5, 14/5) + (0, 1).", { wide: true }),
  fl("5.1 · Ex 7, 10, 11", "Distances: (7) from (1, 2) to the line 4x − 3y = 0; (10) from (1, 1, 1) to the plane 2x + 2y + z = 0; (11) from (2, 1, −2) to the plane 6(x − 1) + 2(y − 3) + 3(z + 4) = 0.",
    [num("(7)", "2/5"), num("(10)", "5/3"), num("(11)", "8/7")],
    "Distance = |Nᵀ(P − P₀)| / ‖N‖, the scalar projection onto the normal N. (7) |4 − 6|/5. (10) |2 + 2 + 1|/3. (11) |6·1 + 2·(−2) + 3·2|/7 = 8/7.", { wide: true }),
  fl("5.1 · Ex 8(b)", "Equation ax + by + cz + d = 0 of the plane through P₀ = (4, 2, −5) normal to N = (−3, 6, 2)ᵀ. Enter (a, b, c, d); any nonzero multiple is accepted.",
    [vec("(a, b, c, d)", [-3, 6, 2, 10])], "−3(x − 4) + 6(y − 2) + 2(z + 5) = 0, i.e. −3x + 6y + 2z + 10 = 0.",
    { check: ([v]) => prop(v[0], [-3, 6, 2, 10]) ? { ok: true, msg: "Correct." } : { ok: false, msg: "The normal must be a multiple of (−3, 6, 2), and P₀ must satisfy the equation." } }),
  fl("5.1 · Ex 9", "Equation ax + by + cz + d = 0 of the plane through P₁ = (2, 3, 1), P₂ = (5, 4, 3), P₃ = (3, 4, 4). Any nonzero multiple is accepted.",
    [vec("(a, b, c, d)", [1, -7, 2, 17])], "N = (P₂ − P₁) × (P₃ − P₁) = (3, 1, 2) × (1, 1, 3) = (1, −7, 2). Then d = −Nᵀ P₁ = 17.",
    { check: ([v]) => prop(v[0], [1, -7, 2, 17]) ? { ok: true, msg: "Correct: all three points satisfy it." } : { ok: false, msg: "Check that P₁, P₂ and P₃ all satisfy your equation." } }),
  fl("5.1 · Ex 17", "x = (4, 4, −4, 4)ᵀ and y = (4, 2, 2, 1)ᵀ. Find xᵀy, ‖x‖, ‖y‖, the angle θ in degrees, and the distance ‖x − y‖.",
    [num("xᵀy", 20), num("‖x‖", 8), num("‖y‖", 5), num("θ (°)", 60), num("‖x − y‖", 7)], "cos θ = 20/(8·5) = 1/2, so θ = 60°. x − y = (0, 2, −6, 3) has length 7.", { wide: true }),
  ch("5.1 · Ex 4", "x and y are linearly independent in ℝ² with ‖x‖ = 2 and ‖y‖ = 3. What can |xᵀy| be?", ["any value with 0 ≤ |xᵀy| < 6", "exactly 6", "any value with 0 ≤ |xᵀy| ≤ 6", "only 0"], 0,
    "|xᵀy| = 6|cos θ| ≤ 6, with equality only when x and y are parallel, which independence rules out."),
  ch("5.1 · Ex 14", "If x₁ ⊥ x₂ and x₂ ⊥ x₃ in ℝ³, must x₁ ⊥ x₃?", ["No", "Yes"], 0, "x₁ = x₃ = e₁ and x₂ = e₂ is a counterexample."),
]);

buildExercises("s52", "Exercises · §5.2", "From the Section 5.2 exercises (p. 221–222).", [
  fl("5.2 · Ex 1(a), (b)", `Dimensions of the four fundamental subspaces of (a) A = ${sm([[3, 4], [6, 8]])}, (b) A = ${sm([[1, 3, 1], [2, 4, 0]])}.`,
    [[[3, 4], [6, 8]], [[1, 3, 1], [2, 4, 0]]].flatMap((A, k) => { const r = qm.rank(qm.of(A)), m = A.length, n = A[0].length; return [num(`(${"ab"[k]}) R(Aᵀ)`, r), num(`(${"ab"[k]}) N(A)`, n - r), num(`(${"ab"[k]}) R(A)`, r), num(`(${"ab"[k]}) N(Aᵀ)`, m - r)]; }),
    "(a) rank 1: lines R(Aᵀ) = Span(3, 4), N(A) = Span(−4, 3), R(A) = Span(1, 2), N(Aᵀ) = Span(−2, 1). (b) rank 2: R(Aᵀ) is a plane in ℝ³, N(A) = Span((−2, 1, −1)ᵀ), R(A) = ℝ², N(Aᵀ) = {0}.",
    { wide: true, actions: [{ label: "Open (a) in the lab", run: () => HOOK.four([[3, 4], [6, 8]]) }, { label: "Open (b) in the lab", run: () => HOOK.four([[1, 3, 1], [2, 4, 0]]) }] }),
  fl("5.2 · Ex 2(a)", "S is spanned by x = (1, −1, 1)ᵀ. Give a basis for S⊥ (two vectors).",
    [vec("v₁", [1, 1, 0]), vec("v₂", [0, 1, 1])], "S⊥ = N((1 −1 1)): x₁ − x₂ + x₃ = 0. For example (1, 1, 0)ᵀ and (0, 1, 1)ᵀ, a plane through the origin with normal x.",
    { check: ([a, b]) => orthoBasisCheck([a[0], b[0]], [[1, -1, 1]], 2) }),
  fl("5.2 · Ex 3(b)", "Find a nonzero vector spanning the orthogonal complement of Span((1, 2, 1)ᵀ, (1, −1, 2)ᵀ) in ℝ³.",
    [vec("n", [5, -1, -3])], "S⊥ = N(A) with the two vectors as rows of A. One choice is the cross product (1, 2, 1) × (1, −1, 2) = (5, −1, −3).",
    { check: ([v]) => orthoBasisCheck([v[0]], [[1, 2, 1], [1, -1, 2]], 1) }),
  fl("5.2 · Ex 4", "S ⊂ ℝ⁴ is spanned by x₁ = (1, 0, −2, 1)ᵀ and x₂ = (0, 1, 3, −2)ᵀ. Give a basis for S⊥.",
    [vec("v₁", [2, -3, 1, 0]), vec("v₂", [-1, 2, 0, 1])], "S⊥ = N(A) with rows x₁ᵀ, x₂ᵀ. A is already in reduced form; the free variables x₃, x₄ give (2, −3, 1, 0)ᵀ and (−1, 2, 0, 1)ᵀ.",
    { wide: true, check: ([a, b]) => orthoBasisCheck([a[0], b[0]], [[1, 0, -2, 1], [0, 1, 3, -2]], 2) }),
  ch("5.2 · Ex 6", "Can a matrix have (3, 1, 2) in its row space and (2, 1, 1)ᵀ in its null space?", ["No", "Yes"], 0,
    "The null space is the orthogonal complement of the row space, but (3, 1, 2)·(2, 1, 1) = 9 ≠ 0."),
  fl("5.2 · Ex 9", "A is 5 × 7 with rank 3. Find dim N(A) and dim N(Aᵀ).", [num("dim N(A)", 4), num("dim N(Aᵀ)", 2)], "dim N(A) = n − r = 7 − 3; dim N(Aᵀ) = m − r = 5 − 3."),
  cl("5.2 · Theorems, Ex 13", "True or false? (A is m × n.)", TF, [
    { tag: "5.2.4", html: "(S⊥)⊥ = S for every subspace S of ℝⁿ.", ans: 0, why: "Theorem 5.2.4." },
    { tag: "5.2.1", html: "If Ax = 0 and y = Aᵀz, then xᵀy = 0.", ans: 0, why: "xᵀAᵀz = (Ax)ᵀz = 0." },
    { tag: "Ex 13", html: "N(AᵀA) = N(A).", ans: 0, why: "If AᵀAx = 0 then ‖Ax‖² = xᵀAᵀAx = 0." },
    { tag: "+", html: "For a square A, R(A) ⟂ N(A).", ans: 1, why: "A = (0 1; 0 0): R(A) = N(A) = Span(e₁). The orthogonal pairs are R(Aᵀ), N(A) and R(A), N(Aᵀ)." },
  ], { wide: true }),
]);

const ex531 = [[[[1, 1], [2, -3], [0, 0]], [3, 1, 2]], [[[-1, 1], [2, 1], [1, -2]], [10, 5, 20]], [[[1, 1, 1], [-1, 1, 1], [0, -1, 1], [1, 0, 1]], [4, 0, 1, 2]]];
buildExercises("s53", "Exercises · §5.3", "From the Section 5.3 exercises (p. 231–232) and the examples.", [
  fl("5.3 · Example 1", "Least squares solution of x₁ + x₂ = 3, −2x₁ + 3x₂ = 1, 2x₁ − x₂ = 2.", [vec("x̂", lsQ([[1, 1], [-2, 3], [2, -1]], [3, 1, 2]))],
    "Normal equations: (9 −7; −7 11) x = (5, 4)ᵀ, so x̂ = (83/50, 71/50)ᵀ."),
  fl("5.3 · Ex 1", "Least squares solutions of (a) x₁ + x₂ = 3, 2x₁ − 3x₂ = 1, 0x₁ + 0x₂ = 2; (b) −x₁ + x₂ = 10, 2x₁ + x₂ = 5, x₁ − 2x₂ = 20; (c) x₁ + x₂ + x₃ = 4, −x₁ + x₂ + x₃ = 0, −x₂ + x₃ = 1, x₁ + x₃ = 2.",
    ex531.map(([A, b], k) => vec(`(${"abc"[k]}) x̂`, lsQ(A, b))), "Form AᵀA and Aᵀb, then solve. In (a) the third equation cannot be helped: the first two are solved exactly.", { wide: true }),
  fl("5.3 · Ex 3(a), 4", `A = ${sm([[1, 2], [2, 4], [-1, -2]])}, b = (3, 2, 1)ᵀ. A has rank 1, so there are infinitely many least squares solutions, but the projection p = Ax̂ of b onto R(A) is unique. Find p.`,
    [vec("p", projQ([3, 2, 1], [1, 2, -1]))], "R(A) = Span((1, 2, −1)ᵀ). p = (bᵀa/aᵀa) a = (6/6) a = (1, 2, −1)ᵀ, and b − p = (2, 0, 2)ᵀ is orthogonal to both columns."),
  fl("5.3 · Example 2", "Best least squares line y = c₀ + c₁x for the data (0, 1), (3, 4), (6, 5).", [num("c₀", "4/3"), num("c₁", "2/3")],
    "Normal equations (3 9; 9 45)(c₀, c₁)ᵀ = (10, 42)ᵀ.", { actions: [{ label: "See it in the lab", run: () => HOOK.ls(0) }] }),
  fl("5.3 · Ex 5", "Best least squares line for (−1, 0), (0, 1), (1, 3), (2, 9).", (() => { const c = lsQ(vand([-1, 0, 1, 2], 1), [0, 1, 3, 9]); return [num("c₀", c[0]), num("c₁", c[1])]; })(),
    "AᵀA = (4 2; 2 6), Aᵀy = (13, 21)ᵀ, so ĉ = (9/5, 29/10)ᵀ.", { actions: [{ label: "See it in the lab", run: () => HOOK.ls(2) }] }),
  fl("5.3 · Ex 6, Example 3", "Best least squares parabola y = c₀ + c₁x + c₂x² for (Ex 6) the data of Ex 5 and (Example 3) the data (0, 3), (1, 2), (2, 4), (3, 4).",
    (() => { const a = lsQ(vand([-1, 0, 1, 2], 2), [0, 1, 3, 9]), b = lsQ(vand([0, 1, 2, 3], 2), [3, 2, 4, 4]); return [vec("Ex 6: (c₀, c₁, c₂)", a), vec("Example 3: (c₀, c₁, c₂)", b)]; })(),
    "Columns of A are 1, xᵢ, xᵢ². Solve the 3 × 3 normal equations.", { wide: true, actions: [{ label: "Ex 6 in the lab", run: () => HOOK.ls(3) }, { label: "Example 3 in the lab", run: () => HOOK.ls(1) }] }),
  ch("5.3 · Ex 10", "A is 8 × 5 with rank 3 and b ≠ 0 lies in N(Aᵀ). How many least squares solutions does Ax = b have?", ["infinitely many", "exactly one", "none"], 0,
    "b ⟂ R(A), so p = 0 and every x ∈ N(A) is a least squares solution; N(A) has dimension 2. (Ax = b itself is inconsistent.)"),
]);

buildExercises("s54", "Exercises · §5.4", "From the Section 5.4 exercises (p. 239–241) and Example 5.", [
  fl("5.4 · Ex 1", "x = (−1, −1, 1, 1)ᵀ and y = (1, 1, 5, −3)ᵀ are orthogonal. Find ‖x‖², ‖y‖², ‖x + y‖².", [num("‖x‖²", 4), num("‖y‖²", 36), num("‖x + y‖²", 40)], "Pythagorean law: 4 + 36 = 40."),
  fl("5.4 · Ex 2", "x = (1, 1, 1, 1)ᵀ, y = (8, 2, 2, 0)ᵀ. Find xᵀy, the angle θ in degrees, and the projection p of x onto y.", [num("xᵀy", 12), num("θ (°)", 45), vec("p", projQ([1, 1, 1, 1], [8, 2, 2, 0]))],
    "cos θ = 12/(2·6√2) = 1/√2. p = (12/72)y = (4/3, 1/3, 1/3, 0)ᵀ.", { wide: true }),
  fl("5.4 · Ex 3", "Weighted inner product ⟨x, y⟩ = Σ wᵢxᵢyᵢ with w = (1/4, 1/2, 1/4), x = (1, 1, 1)ᵀ, y = (−5, 1, 3)ᵀ. Find ⟨x, y⟩, ‖x‖, ‖y‖.", [num("⟨x, y⟩", 0), num("‖x‖", 1), num("‖y‖", 3)],
    "⟨x, y⟩ = −5/4 + 1/2 + 3/4 = 0. ‖y‖² = 25/4 + 1/2 + 9/4 = 9."),
  fl("5.4 · Ex 4", `With ⟨A, B⟩ = Σ aᵢⱼbᵢⱼ, A = ${sm([[1, 2, 2], [1, 0, 2], [3, 1, 1]])}, B = ${sm([[-4, 1, 1], [-3, 3, 2], [1, -2, -2]])}: find ⟨A, B⟩, ‖A‖_F, ‖B‖_F, ‖A + B‖_F².`,
    [num("⟨A, B⟩", 0), num("‖A‖_F", 5), num("‖B‖_F", 7), num("‖A + B‖_F²", 74)], "A and B are orthogonal, so ‖A + B‖² = 25 + 49.", { wide: true }),
  fl("5.4 · Example 5", "x = (4, −5, 3)ᵀ. Find ‖x‖₁, ‖x‖₂², ‖x‖∞.", [num("‖x‖₁", 12), num("‖x‖₂²", 50), num("‖x‖∞", 5)], "‖x‖₂ = √50 = 5√2."),
  fl("5.4 · Ex 7, 8", "In C[0, 1] with ⟨f, g⟩ = ∫₀¹ f g dx: (7a) ⟨eˣ, e⁻ˣ⟩; (7c) ⟨x², x³⟩; (8) the angle between 1 and x in degrees, and the projection of 1 onto x, written p = c·x.",
    [num("(7a)", 1), num("(7c)", "1/6"), num("(8) θ (°)", 30), num("(8) c", "3/2")], "⟨1, x⟩ = 1/2, ‖1‖ = 1, ‖x‖ = 1/√3, so cos θ = √3/2. p = (⟨1, x⟩/⟨x, x⟩) x = (3/2) x.", { wide: true }),
  ch("5.4 · Ex 23", "A nonzero x ∈ ℝ² with ‖x‖₁ = ‖x‖₂ = ‖x‖∞:", ["(0, 3)ᵀ", "(1, 1)ᵀ", "(3, 4)ᵀ", "none exists"], 0, "Any vector on a coordinate axis: only one nonzero entry."),
  ch("5.4 · Ex 27", "The parallelogram law ‖u + v‖² + ‖u − v‖² = 2‖u‖² + 2‖v‖² for the 1-norm, with u = e₁, v = e₂:", ["fails: 8 ≠ 4", "holds", "fails: 2 ≠ 4"], 0,
    "‖e₁ + e₂‖₁ = ‖e₁ − e₂‖₁ = 2, so the left side is 8, the right side 4. The 1-norm does not come from an inner product."),
]);

buildExercises("s55", "Exercises · §5.5", "From the Section 5.5 exercises (p. 261–263) and Example 1.", [
  cl("5.5 · Ex 1", "Which pairs form an orthonormal basis for ℝ²?", ["Orthonormal basis", "Not orthonormal"], [
    { tag: "(a)", html: "(1, 0)ᵀ, (0, 1)ᵀ", ans: 0, why: "The standard basis." },
    { tag: "(b)", html: "(3/5, 4/5)ᵀ, (5/13, 12/13)ᵀ", ans: 1, why: "Unit vectors, but the scalar product is 63/65 ≠ 0." },
    { tag: "(c)", html: "(1, −1)ᵀ, (1, 1)ᵀ", ans: 1, why: "Orthogonal but each has length √2." },
    { tag: "(d)", html: "(√3/2, 1/2)ᵀ, (−1/2, √3/2)ᵀ", ans: 0, why: "The standard basis rotated by 30°." },
  ], { wide: true }),
  fl("5.5 · Example 1", "v₁ = (1, 1, 1)ᵀ, v₂ = (2, 1, −3)ᵀ, v₃ = (4, −5, 1)ᵀ are orthogonal. Write x = (1, 2, 3)ᵀ = c₁v₁ + c₂v₂ + c₃v₃.",
    (() => { const V = [[1, 1, 1], [2, 1, -3], [4, -5, 1]]; return V.map((v, i) => num(`c${"₁₂₃"[i]}`, dq([1, 2, 3], v).div(dq(v, v)))); })(),
    "For an orthogonal (not normalized) basis, cᵢ = xᵀvᵢ / vᵢᵀvᵢ: 6/3, −5/14, −3/42."),
  fl("5.5 · Ex 6", "{u₁, u₂, u₃} is orthonormal, u = u₁ + 2u₂ + 2u₃, v = u₁ + 7u₃. Find ⟨u, v⟩, ‖u‖, ‖v‖², and the angle θ in degrees.", [num("⟨u, v⟩", 15), num("‖u‖", 3), num("‖v‖²", 50), num("θ (°)", 45)],
    "Use coordinates: ⟨u, v⟩ = 1·1 + 2·0 + 2·7. cos θ = 15/(3·5√2) = 1/√2.", { wide: true }),
  fl("5.5 · Ex 7", "{u₁, u₂, u₃} is orthonormal, x = c₁u₁ + c₂u₂ + c₃u₃ with ‖x‖ = 5, ⟨u₁, x⟩ = 4 and x ⊥ u₂. Find c₁, c₂ and |c₃|.", [num("c₁", 4), num("c₂", 0), num("|c₃|", 3)], "cᵢ = ⟨x, uᵢ⟩ and 25 = c₁² + c₂² + c₃² (Parseval)."),
  fl("5.5 · Theorem 5.5.7", "u₁ = (2/3, 2/3, 1/3)ᵀ and u₂ = (−2/3, 1/3, 2/3)ᵀ are orthonormal. Find the projection p of x = (1, 1, 1)ᵀ onto S = Span(u₁, u₂).",
    [vec("p", (() => { const u = [["2/3", "2/3", "1/3"], ["-2/3", "1/3", "2/3"]]; return [0, 1, 2].map(i => u.reduce((s, ui) => s.add(dq([1, 1, 1], ui).mul(q(ui[i]))), new Q(0))); })())],
    "p = ⟨x, u₁⟩u₁ + ⟨x, u₂⟩u₂ = (5/3)u₁ + (1/3)u₂ = (8/9, 11/9, 7/9)ᵀ. Equivalently p = UUᵀx."),
  cl("5.5 · Orthogonal matrices", "Is the matrix orthogonal (QᵀQ = I)?", ["Orthogonal", "Not orthogonal"], [
    { tag: "(a)", html: `⅓${sm([[1, 2, 2], [2, 1, -2], [2, -2, 1]])}`, ans: 0, why: "Columns have length 3/3 = 1 and are mutually orthogonal." },
    { tag: "(b)", html: sm([[0, 1], [1, 0]]), ans: 0, why: "A permutation matrix: a reflection." },
    { tag: "(c)", html: sm([[1, 1], [-1, 1]]), ans: 1, why: "Orthogonal columns of length √2: QᵀQ = 2I." },
    { tag: "(d)", html: sm([["3/5", "4/5"], ["-4/5", "3/5"]]), ans: 0, why: "A rotation." },
    { tag: "(e)", html: sm([[1, 2], [0, 1]]), ans: 1, why: "A shear does not preserve length." },
  ], { wide: true }),
]);

const G2 = gsExact([[1, -1, 4], [1, 4, -2], [1, 4, 2], [1, -1, 0]]), G3 = gsExact([[1, -2, -1], [2, 0, 1], [2, -4, 2], [4, 0, 0]]), GE3 = gsExact([[1, 4, 1], [2, 3, 2], [-2, 2, 1]]);
buildExercises("s56", "Exercises · §5.6", "From the Section 5.6 examples and exercises (p. 262–270).", [
  fl("5.6 · Example 2", `Gram–Schmidt QR factorization of A = ${sm([[1, -1, 4], [1, 4, -2], [1, 4, 2], [1, -1, 0]])}. Find R and Q.`,
    [mat("R", G2.R), mat("Q", G2.Q)], "r₁₁ = ‖a₁‖ = 2, q₁ = ½(1, 1, 1, 1)ᵀ; r₁₂ = 3, r₂₂ = 5, q₂ = ½(−1, 1, 1, −1)ᵀ; r₁₃ = 2, r₂₃ = −2, r₃₃ = 4, q₃ = ½(1, −1, 1, −1)ᵀ.",
    { wide: true, actions: [{ label: "Step through it", run: () => HOOK.gs(0) }] }),
  fl("5.6 · Example 3", `QR factorization of A = ${sm([[1, -2, -1], [2, 0, 1], [2, -4, 2], [4, 0, 0]])}.`, [mat("R", G3.R), mat("Q", G3.Q)],
    "r₁₁ = 5; r₁₂ = −2, r₂₂ = 4; r₁₃ = 1, r₂₃ = −1, r₃₃ = 2.", { wide: true, actions: [{ label: "Step through it", run: () => HOOK.gs(1) }] }),
  fl("5.6 · Ex 3", "Orthonormalize the basis (1, 2, −2)ᵀ, (4, 3, 2)ᵀ, (1, 2, 1)ᵀ of ℝ³. Enter q₁, q₂, q₃ as the columns of Q.", [mat("Q", GE3.Q)],
    "q₁ = ⅓(1, 2, −2); a₂ − 2q₁ has length 5, q₂ = ⅓(2, 1, 2); a₃ − q₁ − 2q₂ = ⅓(−2, 2, 1) already has length 1.", { actions: [{ label: "Step through it", run: () => HOOK.gs(4) }] }),
  fl("5.6 · Ex 5(c), 6(c)", `Least squares solutions: (5) A = ${sm([[2, 1], [1, 1], [2, 1]])}, b = (12, 6, 18)ᵀ; (6) A = ${sm([[3, -1], [4, 2], [0, 2]])}, b = (0, 20, 10)ᵀ.`,
    [vec("(5) x̂", lsQ([[2, 1], [1, 1], [2, 1]], [12, 6, 18])), vec("(6) x̂", lsQ([[3, -1], [4, 2], [0, 2]], [0, 20, 10]))],
    "Either R x̂ = Qᵀb (Theorem 5.6.3) or the normal equations; both give (9, −3)ᵀ and (21/10, 11/2)ᵀ.",
    { wide: true, actions: [{ label: "(5) with QR", run: () => HOOK.gs(5) }, { label: "(6) with QR", run: () => HOOK.gs(6) }] }),
  fl("5.6 · Ex 8", "Gram–Schmidt on x₁ = (4, 2, 2, 1)ᵀ, x₂ = (2, 0, 0, 2)ᵀ, x₃ = (1, 1, −1, 1)ᵀ. Find q₁, q₂, and r₁₃, r₂₃.",
    [vec("q₁", qv(["4/5", "2/5", "2/5", "1/5"])), vec("q₂", qv(["1/5", "-2/5", "-2/5", "4/5"])), num("r₁₃", 1), num("r₂₃", 1)],
    "‖x₁‖ = 5; r₁₂ = 2 and x₂ − 2q₁ has length 2; then x₃ − q₁ − q₂ = (0, 1, −1, 0)ᵀ and q₃ = (0, 1, −1, 0)ᵀ/√2.", { wide: true, actions: [{ label: "Step through it", run: () => HOOK.gs(7) }] }),
  ch("5.6 · Ex 12", "Gram–Schmidt is applied to v₁, v₂, v₃ with v₁, v₂ independent but v₃ ∈ Span(v₁, v₂). What happens?", ["It breaks down at step 3: v₃ − p₂ = 0 cannot be normalized", "It produces a third orthonormal vector anyway", "It breaks down at step 2"], 0,
    "p₂ is the projection of v₃ onto Span(v₁, v₂) = Span(q₁, q₂), which is v₃ itself.", { actions: [{ label: "Watch it fail", run: () => HOOK.gs(8) }] }),
]);

buildExercises("s57", "Exercises · §5.7", "Checks on Section 5.7.", [
  fl("5.7 · Legendre", "Using the recursion (n + 1)Pₙ₊₁ = (2n + 1)xPₙ − nPₙ₋₁ with P₀ = 1, P₁ = x, find the coefficients of P₃ = a₃x³ + a₂x² + a₁x + a₀, and ‖P₂‖² = ∫₋₁¹ P₂² dx.",
    [vec("(a₃, a₂, a₁, a₀)", qv(["5/2", 0, "-3/2", 0])), num("‖P₂‖²", "2/5")], "P₂ = (3x² − 1)/2, P₃ = (5x³ − 3x)/2, and ‖Pₙ‖² = 2/(2n + 1).", { wide: true }),
  fl("5.7 · Chebyshev", "Tₙ₊₁ = 2xTₙ − Tₙ₋₁ with T₀ = 1, T₁ = x. Find T₄ = b₄x⁴ + b₃x³ + b₂x² + b₁x + b₀.", [vec("(b₄, …, b₀)", [8, 0, -8, 0, 1])], "T₂ = 2x² − 1, T₃ = 4x³ − 3x, T₄ = 8x⁴ − 8x² + 1. Check: T₄(cos θ) = cos 4θ."),
  ch("5.7 · Orthogonality", "Why is ⟨P₁, P₂⟩ = ∫₋₁¹ x·(3x² − 1)/2 dx equal to 0 without computing?", ["the integrand is odd", "P₂ has no roots in [−1, 1]", "both have degree ≤ 2"], 0, "x(3x² − 1) is an odd function, and the interval is symmetric."),
  ch("5.7 · Application 1", "Two-point Gauss–Legendre quadrature ∫₋₁¹ f ≈ f(x₁) + f(x₂) is exact for cubics when the nodes are", ["the roots ±1/√3 of P₂", "±1", "0 and 1", "±1/2"], 0, "Theorem 5.7.3: use the roots of the orthogonal polynomial of degree n as nodes."),
]);
})();
