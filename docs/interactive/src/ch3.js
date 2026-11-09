(() => {
"use strict";
const { $, MINUS, sub, reduce, HOOK, goto, el, fmt, Q, matHTML, lbl, xv, q, qm, MH, sys, ch, fl, cl, vec, mat, num, buildExercises, sm, renderDefinitions, setStore, plane2D, draggable } = LA;
setStore("leon-ch3-solved-v1");
const S_ = n => `<sub>${n}</sub>`;
const qf = v => Q.parse(String(v));
const near = (a, b) => Math.abs(a - b) < 1e-9;
const vn = (j, letter = "v") => `<b>${letter}</b>${S_(j + 1)}`;
const colM = v => v.map(x => [x]);

// editable grid; vals is mutated in place
function gridIn(host, vals, o = {}) {
  const m = vals.length, n = vals[0].length;
  let h = `<div class="mat gridin"><table>`;
  if (o.head) h += `<tr>${o.head.slice(0, n).map((t, j) => `<th${o.split === j ? ' class="split"' : ""}>${t}</th>`).join("")}</tr>`;
  for (let i = 0; i < m; i++) h += `<tr>${vals[i].map((v, j) => `<td class="inp${o.split === j ? " split" : ""}"><input class="mi" style="width:50px" data-i="${i}" data-j="${j}" value="${v.txt().replace(MINUS, "-")}" aria-label="entry ${i + 1},${j + 1}" autocomplete="off"></td>`).join("")}</tr>`;
  h += `</table></div>`;
  host.innerHTML = o.label ? lbl(h, o.label) : h;
  host.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
    const v = Q.parse(inp.value); inp.classList.toggle("wrong", !v);
    if (v) { vals[+inp.dataset.i][+inp.dataset.j] = v; if (o.onChange) o.onChange(); }
  }));
}
const zeros = (m, n) => Array.from({ length: m }, () => Array.from({ length: n }, () => new Q(0)));
const resize = (vals, m, n) => Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => (vals[i] && vals[i][j]) || new Q(0)));
function chipRow(host, items, cur, onPick, fmtf = x => x) {
  host.innerHTML = "";
  items.forEach(v => { const b = document.createElement("button"); b.className = "chip"; b.textContent = fmtf(v); b.setAttribute("aria-pressed", v === cur); b.onclick = () => onPick(v); host.appendChild(b); });
}
const opText = s => s.type === "swap" ? `R${sub(s.i + 1)} ↔ R${sub(s.j + 1)}` : s.type === "scale" ? `R${sub(s.i + 1)} ← ${s.c.html()}·R${sub(s.i + 1)}` : `R${sub(s.i + 1)} ← R${sub(s.i + 1)} ${s.c.neg_ ? MINUS : "+"} ${s.c.abs().one ? "" : s.c.abs().html() + "·"}R${sub(s.j + 1)}`;
function combo(coefs, names) {
  const parts = []; coefs.forEach((c, k) => { if (c.zero) return; const a = c.abs(); parts.push({ neg: c.neg_, body: (a.one ? "" : a.html() + " ") + names[k] }); });
  if (!parts.length) return "<b>0</b>";
  return parts.map((p, k) => (k ? (p.neg ? ` ${MINUS} ` : " + ") : (p.neg ? MINUS : "")) + p.body).join("");
}

/* =========================================================
   LAB · Subspace tester
   ========================================================= */
(function subLab() {
  const SETS = [
    { name: "x₁ + x₂ = 0", inS: p => near(p[0] + p[1], 0), sub: true, lines: [[[0, 0], [1, -1]]], why: "It is the line through the origin with direction (1, −1). Sums and multiples of vectors on it stay on it. In fact it is N(A) for A = (1 1)." },
    { name: "x₁x₂ = 0", inS: p => near(p[0] * p[1], 0), sub: false, lines: [[[0, 0], [1, 0]], [[0, 0], [0, 1]]], cex: { u: [2, 0], v: [0, 1.5], c: 1 }, why: "This is the union of the two axes. (2, 0) and (0, 1.5) are in it, but their sum (2, 1.5) is not: not closed under addition." },
    { name: "x₁ = 3x₂", inS: p => near(p[0], 3 * p[1]), sub: true, lines: [[[0, 0], [3, 1]]], why: "A line through the origin, direction (3, 1). It is the null space of (1 −3)." },
    { name: "|x₁| = |x₂|", inS: p => near(Math.abs(p[0]), Math.abs(p[1])), sub: false, lines: [[[0, 0], [1, 1]], [[0, 0], [1, -1]]], cex: { u: [1, 1], v: [1, -1], c: 1 }, why: "Two diagonal lines. (1, 1) + (1, −1) = (2, 0) is on neither: not closed under addition." },
    { name: "x₁² = x₂²", inS: p => near(p[0] * p[0], p[1] * p[1]), sub: false, lines: [[[0, 0], [1, 1]], [[0, 0], [1, -1]]], cex: { u: [1.5, 1.5], v: [1, -1], c: 1 }, why: "The same set as |x₁| = |x₂| (Exercise 3.2.1(d) and (e) are one question twice): not a subspace." },
    { name: "x₂ = 2x₁ + 1", inS: p => near(p[1], 2 * p[0] + 1), sub: false, lines: [[[0, 1], [1, 2]]], cex: { u: [0, 1], v: [1, 3], c: 2 }, why: "The line misses the origin, so 0 ∉ S. Also (0, 1) + (1, 3) = (1, 4) is not on it." },
    { name: "x₁ ≥ 0 and x₂ ≥ 0", inS: p => p[0] >= -1e-9 && p[1] >= -1e-9, sub: false, region: true, cex: { u: [1.5, 1], v: [0.5, 2], c: -1 }, why: "Closed under addition, but not under negative scalars: −1·(1.5, 1) leaves the quadrant." },
    { name: "{0}", inS: p => near(p[0], 0) && near(p[1], 0), sub: true, point: true, why: "The zero subspace: 0 + 0 = 0 and α0 = 0." },
    { name: "ℝ²", inS: () => true, sub: true, all: true, why: "Every vector space is a subspace of itself." },
  ];
  const S = { k: 0, u: [1, -1], v: [-2, 2], c: 1.5 };
  const svg = $("#sub-svg"), P = plane2D(svg, { R: 5.25 });
  const D = draggable(P, () => [S.u, S.v], (i, p) => { if (i) S.v = p; else S.u = p; draw(); }, { lim: 5 });
  const cs = $("#sub-c"); cs.oninput = () => { S.c = +cs.value; draw(); };
  function pick(k) {
    S.k = k; const set = SETS[k];
    if (set.cex) { S.u = [1, 1]; S.v = [2, 1]; }
    const inits = [[[1, -1], [-2, 2]], [[2, 0], [3, 0]], [[3, 1], [-1.5, -0.5]], [[1, 1], [2, 2]], [[1, 1], [-1, -1]], [[0, 1], [0.5, 2]], [[1, 1], [2, 0.5]], [[0, 0], [0, 0]], [[1, 2], [-2, 1]]];
    [S.u, S.v] = inits[k].map(a => a.slice());
    draw();
  }
  function draw() {
    const set = SETS[S.k];
    chipRow($("#sub-sets"), SETS.map((_, i) => i), S.k, pick, i => SETS[i].name);
    cs.value = S.c; $("#sub-co").textContent = fmt(S.c);
    P.clear();
    const st = "stroke:var(--c3);stroke-width:5;stroke-opacity:.6;stroke-linecap:round";
    if (set.lines) set.lines.forEach(([p0, d]) => P.lineThrough(P.layers.under, p0, d, { style: st }));
    if (set.region) P.poly(P.layers.under, [[0, 0], [6, 0], [6, 6], [0, 6]], { style: "fill:var(--c3);fill-opacity:.16;stroke:var(--c3);stroke-width:3" });
    if (set.all) P.poly(P.layers.under, [[-6, -6], [6, -6], [6, 6], [-6, 6]], { style: "fill:var(--c3);fill-opacity:.12" });
    if (set.point) el("circle", { cx: P.X(0), cy: P.Y(0), r: 7, style: "fill:var(--c3)" }, P.layers.under);
    const sum = [S.u[0] + S.v[0], S.u[1] + S.v[1]], sc = [S.c * S.u[0], S.c * S.u[1]];
    P.arrow(P.layers.mid, [0, 0], S.u, "c1", 3.5); P.arrow(P.layers.mid, [0, 0], S.v, "c2", 3.5);
    P.arrow(P.layers.mid, S.u, sum, "c2", 1.5, { "stroke-dasharray": "5 4", "stroke-opacity": .6 });
    P.arrow(P.layers.top, [0, 0], sum, "amb", 3);
    P.arrow(P.layers.top, [0, 0], sc, "c3", 3, { "stroke-dasharray": "2 0" });
    P.text(P.layers.top, sum, "u+v", { dx: 8, dy: -6, style: "fill:var(--pivot);font-weight:600" });
    P.text(P.layers.top, sc, "αu", { dx: 8, dy: 14, style: "fill:var(--c3);font-weight:600" });
    D.draw(["u", "v"], ["f1", "f2"]);
    const iu = set.inS(S.u), iv = set.inS(S.v), is = set.inS(sum), ic = set.inS(sc), i0 = set.inS([0, 0]);
    const yn = b => `<span class="${b ? "yes" : "no"}">${b ? "✓ in S" : "✗ not in S"}</span>`;
    $("#sub-mem").innerHTML = `<span>u = (${fmt(S.u[0])}, ${fmt(S.u[1])})</span>${yn(iu)}<span>v = (${fmt(S.v[0])}, ${fmt(S.v[1])})</span>${yn(iv)}<span>u + v</span>${yn(is)}<span>αu (α = ${fmt(S.c)})</span>${yn(ic)}<span>0</span>${yn(i0)}`;
    const box = $("#sub-status");
    if (!(iu && iv)) { box.className = "status inf"; box.innerHTML = `<span class="k">Put u and v in S</span>Closure is about vectors that belong to S. Drag both onto the green set.`; }
    else if (!is || !ic) { box.className = "status bad"; box.innerHTML = `<span class="k">Counterexample found</span>u and v are in S, but ${!is ? "u + v" : "αu"} is not. So S is not closed under ${!is ? "addition" : "scalar multiplication"}: S is not a subspace.`; }
    else { box.className = "status ok"; box.innerHTML = `<span class="k">Closure holds for these vectors</span>u + v and αu are in S. One example proves nothing: try other vectors, or ask for the verdict.`; }
  }
  $("#sub-cex").onclick = () => {
    const set = SETS[S.k], box = $("#sub-status");
    if (!set.cex) { draw(); box.className = "status ok"; box.innerHTML = `<span class="k">No counterexample exists</span>${set.why}`; return; }
    S.u = set.cex.u.slice(); S.v = set.cex.v.slice(); S.c = set.cex.c; draw();
  };
  $("#sub-verdict").onclick = () => { const set = SETS[S.k], box = $("#sub-status"); box.className = "status " + (set.sub ? "ok" : "bad"); box.innerHTML = `<span class="k">${set.sub ? "Subspace" : "Not a subspace"}</span>${set.why}`; };
  pick(0);
})();

/* =========================================================
   LAB · Span explorer
   ========================================================= */
(function spanLab() {
  const S = { k: 2, vs: [[2, 1], [3, 2], [-1, 2]], b: [1, 3] };
  const presets = [["Ex 11(a)", 2, [[2, 1], [3, 2]]], ["Ex 11(b)", 2, [[2, 3], [4, 6]]], ["Ex 11(c)", 3, [[-2, 1], [1, 3], [2, 4]]], ["Ex 11(d)", 3, [[-1, 2], [1, -2], [2, -4]]], ["Ex 11(e)", 2, [[1, 2], [-1, 1]]]];
  const pb = $("#span-presets");
  presets.forEach(([nm, k, vs]) => { const b = document.createElement("button"); b.className = "chip"; b.textContent = nm; b.onclick = () => { S.k = k; vs.forEach((v, i) => { S.vs[i] = v.slice(); }); draw(); }; pb.appendChild(b); });
  const svg = $("#span-svg"), P = plane2D(svg, { R: 5.25 });
  const D = draggable(P, () => [...S.vs.slice(0, S.k), S.b], (i, p) => { if (i === S.k) S.b = p; else S.vs[i] = p; draw(); }, { lim: 5 });
  const cls = ["c1", "c2", "c3"];
  function draw() {
    chipRow($("#span-k"), [1, 2, 3], S.k, k => { S.k = k; draw(); });
    P.clear();
    const V = S.vs.slice(0, S.k), X = V[0].map((_, i) => V.map(v => qf(v[i]))), r = qm.rank(X);
    if (r === 2) P.poly(P.layers.under, [[-6, -6], [6, -6], [6, 6], [-6, 6]], { style: "fill:var(--c3);fill-opacity:.12" });
    else if (r === 1) { const d = V.find(v => Math.hypot(...v) > 1e-9); P.lineThrough(P.layers.under, [0, 0], d, { style: "stroke:var(--c3);stroke-width:7;stroke-opacity:.35" }); }
    else el("circle", { cx: P.X(0), cy: P.Y(0), r: 7, style: "fill:var(--c3)" }, P.layers.under);
    V.forEach((v, i) => P.arrow(P.layers.mid, [0, 0], v, cls[i], 3.5));
    el("circle", { cx: P.X(S.b[0]), cy: P.Y(S.b[1]), r: 12, style: "fill:none;stroke:var(--ink);stroke-width:2;stroke-dasharray:3 3" }, P.layers.mid);
    const c = qm.solve(X, [qf(S.b[0]), qf(S.b[1])]);
    if (c) { let at = [0, 0]; c.forEach((ci, i) => { const nx = [at[0] + ci.n / ci.d * V[i][0], at[1] + ci.n / ci.d * V[i][1]]; P.arrow(P.layers.top, at, nx, cls[i], 2, { "stroke-dasharray": "5 4" }); at = nx; }); }
    D.draw([...V.map((_, i) => "v" + "₁₂₃"[i]), "b"], [...cls.slice(0, S.k).map(s => s.replace("c", "f")), "ink"]);
    const names = V.map((_, i) => vn(i));
    $("#span-expr").innerHTML = lbl(matHTML(X), `X = (${V.map((_, i) => "v" + "₁₂₃"[i]).join(" ")})`) + `<span class="op">rank ${r};</span>` + (c ? `<span class="op">b =</span><span>${combo(c, names)}</span>` : "");
    const st = $("#span-status");
    const what = r === 2 ? "all of ℝ²: a spanning set for ℝ²" : r === 1 ? "a line through the origin, not ℝ²" : "only {0}";
    st.className = "status " + (r === 2 ? "ok" : "inf");
    st.innerHTML = `<span class="k">Span = ${what}</span>` + (S.k > r ? `${S.k - r} of the vectors ${S.k - r === 1 ? "is" : "are"} redundant: the set is linearly dependent. ` : "The vectors are linearly independent. ") +
      (c ? `b is in the span${S.k > r ? " (one of infinitely many choices of coefficients is shown)" : ""}.` : "b is not in the span: no coefficients work.");
  }
  draw();
})();

/* =========================================================
   LAB · Linear dependence decider
   ========================================================= */
(function depLab() {
  const P = [
    ["3.3 Ex 1(c)", [[-2, 1], [1, 3], [2, 4]]],
    ["3.3 Ex 2(b)", [[1, 0, 0], [0, 1, 1], [1, 0, 1], [1, 2, 3]]],
    ["3.3 Ex 2(c)", [[2, 1, -2], [3, 2, -2], [2, 2, 0]]],
    ["3.3 Ex 2(d)", [[2, 1, -2], [-2, -1, 2], [4, 2, -4]]],
    ["3.3 Ex 2(e)", [[1, 1, 3], [0, 2, 1]]],
    ["3.6 Example 5", [[1, 2, -1, 0], [2, 5, -3, 2], [2, 4, -2, 0], [3, 8, -5, 4]]],
    ["P₃: 2, x², x, 2x+3", [[2, 0, 0], [0, 0, 1], [0, 1, 0], [3, 2, 0]]],
    ["3.4 Ex 10", [[1, 2, 2], [2, 5, 4], [1, 3, 2], [2, 7, 4], [1, 1, 0]]],
  ];
  const S = { vals: null, m: 3, k: 3, res: null, step: 0, name: "" };
  const pb = $("#dep-presets");
  P.forEach(([nm, cols]) => { const b = document.createElement("button"); b.className = "chip"; b.textContent = nm; b.onclick = () => load(cols, nm); pb.appendChild(b); });
  function load(cols, nm) { S.k = cols.length; S.m = cols[0].length; S.vals = Array.from({ length: S.m }, (_, i) => cols.map(c => q(c[i]))); S.name = nm || ""; S.res = null; build(); decide(); }
  function build() {
    chipRow($("#dep-m"), [2, 3, 4, 5], S.m, m => { S.m = m; S.vals = resize(S.vals, S.m, S.k); S.res = null; build(); });
    chipRow($("#dep-k"), [1, 2, 3, 4, 5, 6], S.k, k => { S.k = k; S.vals = resize(S.vals, S.m, S.k); S.res = null; build(); });
    gridIn($("#dep-in"), S.vals, { head: Array.from({ length: S.k }, (_, j) => "v" + "₁₂₃₄₅₆"[j]), label: "X (vectors as columns)", onChange: () => { S.res = null; renderRes(); } });
    renderRes();
  }
  function decide() { S.res = qm.rref(S.vals); S.step = S.res.steps.length; renderRes(); }
  function renderRes() {
    const badges = $("#dep-badges"), stp = $("#dep-stepper"), mt = $("#dep-mat"), st = $("#dep-status"), rel = $("#dep-rel");
    const bd = (on, t) => `<span class="badge${on ? " on" : ""}">${t}</span>`;
    const m = S.m, k = S.k;
    let b = bd(k > m, `${k} vectors in ℝ${"⁰¹²³⁴⁵"[m]}: k > m ⇒ dependent`);
    if (k === m) { const d = qm.det(S.vals); b += bd(!d.zero, `square: det X = ${d.txt()}`); }
    b += bd(S.vals[0].some((_, j) => S.vals.every(r => r[j].zero)), "contains the zero vector ⇒ dependent");
    badges.innerHTML = b;
    if (!S.res) { stp.innerHTML = ""; mt.innerHTML = ""; st.className = "status inf"; st.innerHTML = `<span class="k">Ready</span>Press Decide to row reduce X and solve Xc = 0.`; rel.innerHTML = ""; return; }
    const { steps, R, piv } = S.res, n = steps.length;
    S.step = Math.max(0, Math.min(n, S.step));
    const cur = S.step === 0 ? S.vals : steps[S.step - 1].M;
    stp.innerHTML = `<button class="btn sm" id="dep-prev">◀</button><span>step ${S.step} of ${n}${S.step ? ": " + opText(steps[S.step - 1]) : ": X"}</span><button class="btn sm" id="dep-nextb">▶</button><button class="btn sm" id="dep-end">RREF</button>`;
    $("#dep-prev").disabled = S.step === 0; $("#dep-nextb").disabled = S.step === n;
    $("#dep-prev").onclick = () => { S.step--; renderRes(); }; $("#dep-nextb").onclick = () => { S.step++; renderRes(); }; $("#dep-end").onclick = () => { S.step = n; renderRes(); };
    const final = S.step === n;
    mt.innerHTML = lbl(matHTML(cur, { size: "big", cellClass: (i, j) => final && piv[i] === j ? "lead" : (final && !piv.includes(j) ? "hl" : "") }), final ? "reduced row echelon form" : "after this step");
    const free = []; for (let j = 0; j < k; j++) if (!piv.includes(j)) free.push(j);
    const names = Array.from({ length: k }, (_, j) => vn(j));
    if (free.length === 0) {
      st.className = "status ok"; st.innerHTML = `<span class="k">Linearly independent</span>Every column has a pivot, so Xc = 0 only for c = 0. The ${k} vectors form a basis of their span, which has dimension ${k}.`; rel.innerHTML = "";
    } else {
      st.className = "status bad"; st.innerHTML = `<span class="k">Linearly dependent · rank ${piv.length}</span>Column${free.length > 1 ? "s" : ""} ${free.map(j => j + 1).join(", ")} ${free.length > 1 ? "have" : "has"} no pivot. Basis of the span: ${piv.map(j => names[j]).join(", ")} (dimension ${piv.length}).`;
      rel.innerHTML = free.map(f => {
        const coefs = Array.from({ length: k }, () => new Q(0)); piv.forEach((p, r) => { coefs[p] = R[r][f]; });
        const relc = coefs.map((c, j) => j === f ? new Q(-1) : c);
        const chk = S.vals.every(row => row.reduce((s, v, j) => s.add(v.mul(relc[j])), new Q(0)).zero);
        return `<div class="dep-rel">${names[f]} = ${combo(coefs.filter((_, j) => j !== f), names.filter((_, j) => j !== f))} &nbsp;⇔&nbsp; <b>${combo(relc, names)} = 0</b> ${chk ? "✓" : ""}</div>`;
      }).join("");
    }
  }
  $("#dep-go").onclick = decide;
  load(P[2][1], P[2][0]);
  HOOK.dep = (cols) => { load(cols); goto("#lab-dep"); };
})();

/* =========================================================
   LAB · Coordinates in any basis
   ========================================================= */
(function basisLab() {
  const S = { u: [[2, 1], [1, 4]], v: [[3, 2], [4, 3]], x: [7, 7], two: false };
  const presets = [["Example 3.5.1", [[2, 1], [1, 4]], [7, 7], null], ["standard basis", [[1, 0], [0, 1]], [3, 2], null], ["Ex 3.5.3", [[1, 1], [-1, 1]], [3, 2], [[3, 2], [4, 3]]], ["Ex 3.5.4: E", [[5, 3], [3, 2]], [1, 1], null]];
  const pb = $("#bas-presets");
  presets.forEach(([nm, u, x, v]) => { const b = document.createElement("button"); b.className = "chip"; b.textContent = nm; b.onclick = () => { S.u = u.map(a => a.slice()); S.x = x.slice(); if (v) { S.v = v.map(a => a.slice()); S.two = true; } else S.two = false; draw(); }; pb.appendChild(b); });
  $("#bas-two").onclick = () => { S.two = !S.two; draw(); };
  const svg = $("#bas-svg"), P = plane2D(svg, { R: 8.4 });
  const D = draggable(P, () => S.two ? [S.u[0], S.u[1], S.v[0], S.v[1], S.x] : [S.u[0], S.u[1], S.x], (i, p) => {
    if (i < 2) S.u[i] = p; else if (S.two && i < 4) S.v[i - 2] = p; else S.x = p; draw(); }, { lim: 8, snap: 0.5 });
  function grid(b1, b2, cls, op) {
    for (let k = -12; k <= 12; k++) {
      P.lineThrough(P.layers.under, [k * b1[0], k * b1[1]], b2, { class: cls, "stroke-opacity": op, "stroke-width": 1 });
      P.lineThrough(P.layers.under, [k * b2[0], k * b2[1]], b1, { class: cls, "stroke-opacity": op, "stroke-width": 1 });
    }
  }
  function draw() {
    $("#bas-two").setAttribute("aria-pressed", S.two);
    P.clear();
    const U = [[qf(S.u[0][0]), qf(S.u[1][0])], [qf(S.u[0][1]), qf(S.u[1][1])]], dU = qm.det(U);
    const V = [[qf(S.v[0][0]), qf(S.v[1][0])], [qf(S.v[0][1]), qf(S.v[1][1])]], dV = qm.det(V);
    const X = [qf(S.x[0]), qf(S.x[1])];
    if (!dU.zero) grid(S.u[0], S.u[1], "c1", .28);
    if (S.two && !dV.zero) grid(S.v[0], S.v[1], "c2", .22);
    P.arrow(P.layers.mid, [0, 0], S.u[0], "c1", 3.5); P.arrow(P.layers.mid, [0, 0], S.u[1], "c1", 3.5, { "stroke-opacity": .7 });
    if (S.two) { P.arrow(P.layers.mid, [0, 0], S.v[0], "c2", 3.5); P.arrow(P.layers.mid, [0, 0], S.v[1], "c2", 3.5, { "stroke-opacity": .7 }); }
    let cU = null;
    if (!dU.zero) {
      cU = qm.mul(qm.inv(U), colM(X)).map(r => r[0]);
      const a = cU[0].n / cU[0].d, b = cU[1].n / cU[1].d, mid = [a * S.u[0][0], a * S.u[0][1]];
      P.arrow(P.layers.top, [0, 0], mid, "c1", 2.5, { "stroke-dasharray": "6 4" }); P.arrow(P.layers.top, mid, S.x, "c1", 2.5, { "stroke-dasharray": "6 4" });
    }
    D.draw(S.two ? ["u₁", "u₂", "v₁", "v₂", "x"] : ["u₁", "u₂", "x"], S.two ? ["f1", "f1", "f2", "f2", "ink"] : ["f1", "f1", "ink"]);
    let h = lbl(matHTML(U, { cellClass: () => "hl1" }), "U = (u₁ u₂)") + lbl(matHTML(colM(X)), "x");
    const st = $("#bas-status");
    if (dU.zero) { $("#bas-expr").innerHTML = h; st.className = "status bad"; st.innerHTML = `<span class="k">Not a basis</span>u₁ and u₂ are parallel (det U = 0), so they do not span ℝ² and coordinates are not defined.`; return; }
    h += `<span class="op">[x]<sub>U</sub> = U⁻¹x =</span>` + lbl(matHTML(qm.inv(U)), "U⁻¹") + lbl(matHTML(colM(X)), "x") + `<span class="op">=</span>` + lbl(matHTML(colM(cU), { cellClass: () => "hl1" }), "[x]_U");
    if (S.two && !dV.zero) {
      const T = qm.mul(qm.inv(V), U), cV = qm.mul(T, colM(cU)).map(r => r[0]);
      h += `<div style="flex-basis:100%;height:6px"></div>` + lbl(matHTML(V, { cellClass: () => "hl2" }), "V = (v₁ v₂)") + `<span class="op">transition U → V: V⁻¹U =</span>` + lbl(matHTML(T), "S") + `<span class="op">S [x]<sub>U</sub> =</span>` + lbl(matHTML(colM(cV), { cellClass: () => "hl2" }), "[x]_V");
    }
    $("#bas-expr").innerHTML = h;
    st.className = "status ok";
    st.innerHTML = `<span class="k math">x = ${cU[0].txt()} u₁ + ${cU[1].txt()} u₂</span>The coordinates are unique because u₁, u₂ form a basis. ` + (S.two ? (dV.zero ? "The second pair is not a basis." : "The transition matrix converts U-coordinates into V-coordinates without going through x.") : "");
  }
  draw();
})();

/* =========================================================
   LAB · Rank–nullity explorer
   ========================================================= */
(function rankLab() {
  const P = [
    ["3.6 Ex 1(a)", [[1, 3, 2], [2, 1, 4], [4, 7, 8]]],
    ["Ex 1(b)", [[-3, 1, 3, 4], [1, 2, -1, -2], [-3, 8, 4, 2]]],
    ["Ex 1(c)", [[1, 3, -2, 1], [2, 1, 3, 2], [3, 4, 5, 6]]],
    ["Ex 3", [[1, 2, 2, 3, 1, 4], [2, 4, 5, 5, 4, 9], [3, 6, 7, 8, 5, 9]]],
    ["Example 5", [[1, 2, 2, 3], [2, 5, 4, 8], [-1, -3, -2, -5], [0, 2, 0, 4]]],
    ["3.2 Ex 4(b)", [[1, 2, -3, -1], [-2, -4, 6, 3]]],
  ];
  const S = { A: null, b: null };
  const pb = $("#rk-presets");
  P.forEach(([nm, A]) => { const b = document.createElement("button"); b.className = "chip"; b.textContent = nm; b.onclick = () => load(A); pb.appendChild(b); });
  function load(A) { S.A = qm.of(A); S.b = zeros(A.length, 1); build(); }
  function build() {
    const m = S.A.length, n = S.A[0].length;
    chipRow($("#rk-m"), [1, 2, 3, 4, 5], m, mm => { S.A = resize(S.A, mm, n); S.b = resize(S.b, mm, 1); build(); });
    chipRow($("#rk-n"), [1, 2, 3, 4, 5, 6], n, nn => { S.A = resize(S.A, m, nn); build(); });
    gridIn($("#rk-in"), S.A, { label: "A", onChange: render });
    gridIn($("#rk-b"), S.b, { label: "b (is it in the column space?)", onChange: render });
    render();
  }
  function render() {
    const m = S.A.length, n = S.A[0].length, { R, piv } = qm.rref(S.A), r = piv.length, N = qm.nullBasis(S.A);
    $("#rk-in").querySelectorAll("td.inp").forEach(td => { const j = +td.querySelector("input").dataset.j; td.classList.toggle("hl1", piv.includes(j)); });
    $("#rk-rref").innerHTML = lbl(matHTML(R, { size: "big", cellClass: (i, j) => piv[i] === j ? "lead" : "" }), "reduced row echelon form U");
    const st = $("#rk-status");
    const x = qm.solve(S.A, S.b.map(rw => rw[0]));
    st.className = "status ok";
    st.innerHTML = `<span class="k math">rank ${r} + nullity ${n - r} = ${n} = n</span>Pivot columns ${piv.map(j => j + 1).join(", ") || "none"} (highlighted in A). ` +
      (x ? `b is in the column space: Ax = b is consistent, e.g. x = (${x.map(v => v.txt()).join(", ")})${N.length ? " plus anything in N(A)" : ""}.` : `b is not in the column space: Ax = b is inconsistent.`);
    const rowB = R.slice(0, r).map((row, i) => lbl(matHTML([row], { size: "sm" }), `row ${i + 1}`)).join("");
    const colB = piv.map(j => lbl(matHTML(S.A.map(rw => [rw[j]]), { size: "sm", cellClass: () => "hl1" }), `a${S_(j + 1)}`)).join("");
    const nulB = N.map((v, i) => lbl(matHTML(colM(v), { size: "sm", cellClass: () => "hl2" }), `x${S_(i + 1)}`)).join("") || `<span class="op">{0}</span>`;
    $("#rk-bases").innerHTML = `<div class="mexpr"><span class="op" style="font-size:14px">row space basis:</span>${rowB || "{0}"}</div><div class="mexpr"><span class="op" style="font-size:14px">column space basis:</span>${colB || "{0}"}</div><div class="mexpr"><span class="op" style="font-size:14px">null space basis:</span>${nulB}</div>`;
  }
  load(P[0][1]);
  HOOK.rank = A => { load(A); goto("#lab-rank"); };
})();

/* =========================================================
   Definitions
   ========================================================= */
renderDefinitions([
  { sec: "s31", id: "def-vs", term: "Vector space", ref: "§3.1 · Definition", scene: "VectorSpaceExamples",
    html: `A set <i>V</i> with addition and scalar multiplication is a <b>vector space</b> if <b>x</b> + <b>y</b> and α<b>x</b> are in <i>V</i> for all <b>x</b>, <b>y</b> ∈ <i>V</i> and scalars α, and: A1 <b>x</b> + <b>y</b> = <b>y</b> + <b>x</b>; A2 (<b>x</b> + <b>y</b>) + <b>z</b> = <b>x</b> + (<b>y</b> + <b>z</b>); A3 there is <b>0</b> with <b>x</b> + <b>0</b> = <b>x</b>; A4 each <b>x</b> has −<b>x</b> with <b>x</b> + (−<b>x</b>) = <b>0</b>; A5 α(<b>x</b> + <b>y</b>) = α<b>x</b> + α<b>y</b>; A6 (α + β)<b>x</b> = α<b>x</b> + β<b>x</b>; A7 (αβ)<b>x</b> = α(β<b>x</b>); A8 1·<b>x</b> = <b>x</b>.`,
    note: "Polynomials in P₃ add exactly like their coefficient vectors in ℝ³." },
  { sec: "s32", id: "def-sub", term: "Subspace; null space", ref: "§3.2 · Definitions", scene: "Subspace",
    html: `A nonempty subset <i>S</i> of <i>V</i> is a <b>subspace</b> if (i) α<b>x</b> ∈ <i>S</i> whenever <b>x</b> ∈ <i>S</i> and α is a scalar, and (ii) <b>x</b> + <b>y</b> ∈ <i>S</i> whenever <b>x</b>, <b>y</b> ∈ <i>S</i>. The <b>null space</b> of an <i>m</i> × <i>n</i> matrix <i>A</i>, <i>N</i>(<i>A</i>) = {<b>x</b> ∈ ℝ<sup><i>n</i></sup> : <i>A</i><b>x</b> = <b>0</b>}, is always a subspace.` },
  { sec: "s32", id: "def-span", term: "Span; spanning set", ref: "§3.2 · Definitions, Theorem 3.2.1", scene: "Span3D",
    html: `A sum α${S_(1)}<b>v</b>${S_(1)} + ⋯ + α${S_("n")}<b>v</b>${S_("n")} is a <b>linear combination</b>; the set of all of them is the <b>span</b>, Span(<b>v</b>${S_(1)}, …, <b>v</b>${S_("n")}), which is always a subspace (3.2.1). The set {<b>v</b>${S_(1)}, …, <b>v</b>${S_("n")}} is a <b>spanning set</b> for <i>V</i> if every vector of <i>V</i> is such a combination.` },
  { sec: "s33", id: "def-indep", term: "Linear independence and dependence", ref: "§3.3 · Definitions, Theorems 3.3.1, 3.3.2", scene: "LinearDependence",
    html: `<b>v</b>${S_(1)}, …, <b>v</b>${S_("n")} are <b>linearly independent</b> if c${S_(1)}<b>v</b>${S_(1)} + ⋯ + c${S_("n")}<b>v</b>${S_("n")} = <b>0</b> implies c${S_(1)} = ⋯ = c${S_("n")} = 0, and <b>linearly dependent</b> if there are scalars, not all zero, with that sum equal to <b>0</b>. For <i>n</i> vectors in ℝ<sup><i>n</i></sup>: independent ⇔ det(<b>x</b>${S_(1)} … <b>x</b>${S_("n")}) ≠ 0 (3.3.1). A vector in the span of independent vectors has a <b>unique</b> representation (3.3.2).`,
    note: "The animation shows both views: a closed polygon of arrows, and a free column in the reduced row echelon form." },
  { sec: "s34", id: "def-basis", term: "Basis and dimension", ref: "§3.4 · Definitions, Theorems 3.4.1–3.4.4", scene: "BasisCoordinates",
    html: `<b>v</b>${S_(1)}, …, <b>v</b>${S_("n")} form a <b>basis</b> for <i>V</i> if they are linearly independent and span <i>V</i>. If <i>V</i> has a basis of <i>n</i> vectors, every basis has <i>n</i> vectors, and <i>V</i> has <b>dimension</b> <i>n</i>. In an <i>n</i>-dimensional space, any set of more than <i>n</i> vectors is dependent (3.4.1); any <i>n</i> independent vectors span; any <i>n</i> spanning vectors are independent (3.4.3).` },
  { sec: "s35", id: "def-coord", term: "Coordinates; transition matrix", ref: "§3.5 · Definition", scene: "ChangeOfBasis",
    html: `If <i>E</i> = [<b>v</b>${S_(1)}, …, <b>v</b>${S_("n")}] is an ordered basis and <b>v</b> = c${S_(1)}<b>v</b>${S_(1)} + ⋯ + c${S_("n")}<b>v</b>${S_("n")}, then [<b>v</b>]${S_("E")} = (c${S_(1)}, …, c${S_("n")})<sup>T</sup> is the <b>coordinate vector</b> of <b>v</b> with respect to <i>E</i>. A <b>transition matrix</b> <i>S</i> converts coordinates: [<b>v</b>]${S_("F")} = <i>S</i>[<b>v</b>]${S_("E")}. For bases of ℝ<sup><i>n</i></sup> stored as columns of <i>U</i> and <i>V</i>, <i>S</i> = <i>V</i><sup>−1</sup><i>U</i>.`,
    note: "Example 3.5.1: x = (7, 7) = 3y + 1z with y = (2, 1), z = (1, 4)." },
  { sec: "s36", id: "def-rank", term: "Row space, column space, rank, nullity", ref: "§3.6 · Definitions, Theorems 3.6.1–3.6.6", scene: "RankNullity",
    html: `The <b>row space</b> of <i>A</i> is spanned by its rows, the <b>column space</b> by its columns. The <b>rank</b> of <i>A</i> is the dimension of the row space; it equals the dimension of the column space (3.6.6). Row-equivalent matrices have the same row space (3.6.1). <i>A</i><b>x</b> = <b>b</b> is consistent iff <b>b</b> is in the column space (3.6.2). <b>Rank–nullity:</b> rank(<i>A</i>) + dim <i>N</i>(<i>A</i>) = <i>n</i> (3.6.5).` },
], { s31: "3.1", s32: "3.2", s33: "3.3", s34: "3.4", s35: "3.5", s36: "3.6" });

/* =========================================================
   Exercises
   ========================================================= */
const depAct = cols => ({ label: "Decide in the lab", run: () => HOOK.dep(cols) });
const rankAct = A => ({ label: "Open in the rank lab", run: () => HOOK.rank(A) });
const colsToX = cols => qm.of(cols[0].map((_, i) => cols.map(c => c[i])));
const isIndep = cols => qm.rank(colsToX(cols)) === cols.length;
const spans = (cols, n) => qm.rank(colsToX(cols)) === n;
const inSpan = (cols, b) => !!qm.solve(colsToX(cols), b);
const vtxt = v => `(${v.map(x => String(x).replace("-", "−")).join(", ")})`;
const vlist = cols => cols.map(vtxt).join(", ");

buildExercises("s31", "Exercises · §3.1", "Conceptual checks on the definition (Section 3.1).", [
  cl("3.1 · Examples", "Is each set, with the usual addition and scalar multiplication, a vector space?", ["Vector space", "Not a vector space"], [
    { tag: "(a)", html: "P₃, polynomials of degree less than 3", ans: 0, why: "Sums and multiples of such polynomials are again such polynomials; the axioms hold." },
    { tag: "(b)", html: "all nonsingular 2 × 2 matrices", ans: 1, why: "The zero matrix is singular, and I + (−I) = O is singular: no zero vector, not closed." },
    { tag: "(c)", html: "C[a, b], continuous functions on [a, b]", ans: 0, why: "Sums and multiples of continuous functions are continuous." },
    { tag: "(d)", html: "vectors (x₁, x₂) with x₁ > 0", ans: 1, why: "−1·(1, 0) = (−1, 0) leaves the set." },
    { tag: "(e)", html: "ℝ^(m×n), all m × n matrices", ans: 0, why: "Matrix addition and scalar multiplication satisfy A1–A8 (Theorem 1.4.1)." },
  ], { wide: true }),
  ch("3.1 · Theorem 3.1.1", "Which of these follows from the axioms in every vector space?", ["0·x = 0, and (−1)x = −x", "x·y = y·x", "every x has an inverse x⁻¹", "x + x = x"], 0,
    "Theorem 3.1.1: β0 = 0, 0x = 0, if x + y = 0 then y = −x, and (−1)x = −x. Vector spaces have no multiplication of vectors."),
]);

buildExercises("s32", "Exercises · §3.2", "From the Section 3.2 exercises (p. 125–126).", [
  cl("3.2 · Ex 1", "Which sets are subspaces of ℝ²?", ["Subspace", "Not a subspace"], [
    { tag: "(a)", html: "x₁ + x₂ = 0", ans: 0, why: "Line through the origin." }, { tag: "(b)", html: "x₁x₂ = 0", ans: 1, why: "(1, 0) + (0, 1) = (1, 1) is not in the set." },
    { tag: "(c)", html: "x₁ = 3x₂", ans: 0, why: "Line through the origin." }, { tag: "(d)", html: "|x₁| = |x₂|", ans: 1, why: "(1, 1) + (1, −1) = (2, 0)." },
    { tag: "(e)", html: "x₁² = x₂²", ans: 1, why: "The same set as (d)." },
  ], { wide: true }),
  cl("3.2 · Ex 2", "Which sets are subspaces of ℝ³?", ["Subspace", "Not a subspace"], [
    { tag: "(a)", html: "x₁ + x₃ = 1", ans: 1, why: "0 is not in the set." }, { tag: "(b)", html: "x₁ = x₂ = x₃", ans: 0, why: "The line spanned by (1, 1, 1)." },
    { tag: "(c)", html: "x₃ = x₁ + x₂", ans: 0, why: "The plane N(A) with A = (1 1 −1)." }, { tag: "(d)", html: "x₃ = x₁ or x₃ = x₂", ans: 1, why: "(1, 0, 1) + (0, 1, 1) = (1, 1, 2) satisfies neither." },
  ], { wide: true }),
  cl("3.2 · Ex 3", "Which are subspaces of ℝ^(2×2)?", ["Subspace", "Not a subspace"], [
    { tag: "(a)", html: "diagonal matrices", ans: 0, why: "Sums and multiples of diagonal matrices are diagonal." },
    { tag: "(b)", html: "triangular matrices", ans: 1, why: "An upper plus a lower triangular matrix need not be triangular, e.g. (1 1; 0 0) + (0 0; 1 0)." },
    { tag: "(c)", html: "lower triangular matrices", ans: 0, why: "Closed under both operations." },
    { tag: "(d)", html: "matrices with a₁₂ = 1", ans: 1, why: "O is not in the set." },
    { tag: "(e)", html: "matrices with b₁₁ = 0", ans: 0, why: "A null-space-type condition." },
    { tag: "(f)", html: "symmetric matrices", ans: 0, why: "(A + B)ᵀ = A + B, (αA)ᵀ = αA." },
    { tag: "(g)", html: "singular matrices", ans: 1, why: "(1 0; 0 0) + (0 0; 0 1) = I is nonsingular." },
  ], { wide: true }),
  fl("3.2 · Ex 4(b)", `Find a basis of the null space of A = ${sm([[1, 2, -3, -1], [-2, -4, 6, 3]])}. Enter two vectors that span N(A).`,
    [{ kind: "vector", label: "x₁", ans: qm.nullBasis(qm.of([[1, 2, -3, -1], [-2, -4, 6, 3]]))[0] }, { kind: "vector", label: "x₂", ans: qm.nullBasis(qm.of([[1, 2, -3, -1], [-2, -4, 6, 3]]))[1] }],
    "Row reduce: x₂ and x₃ are free, x₄ = 0, x₁ = −2x₂ + 3x₃. Special solutions: (−2, 1, 0, 0) and (3, 0, 1, 0). Any two independent vectors of N(A) are accepted.",
    { wide: true, check: vals => { const A = qm.of([[1, 2, -3, -1], [-2, -4, 6, 3]]); const vs = vals.map(v => v[0]); const inN = vs.every(x => A.every(r => r.reduce((s, a, j) => s.add(a.mul(x[j])), new Q(0)).zero)); const ind = qm.rank(vs) === 2; return inN && ind ? { ok: true, msg: "Correct: both vectors solve Ax = 0 and they are independent, so they span the 2-dimensional N(A)." } : { ok: false, msg: !inN ? "At least one vector does not satisfy Ax = 0." : "The two vectors are parallel: they span only a line." }; },
      actions: [rankAct([[1, 2, -3, -1], [-2, -4, 6, 3]])] }),
  cl("3.2 · Ex 11", "Which sets span ℝ²?", ["Spans ℝ²", "Does not span"], [
    [[2, 1], [3, 2]], [[2, 3], [4, 6]], [[-2, 1], [1, 3], [2, 4]], [[-1, 2], [1, -2], [2, -4]], [[1, 2], [-1, 1]]].map((cols, k) => ({ tag: `(${"abcde"[k]})`, html: vlist(cols), ans: spans(cols, 2) ? 0 : 1, why: spans(cols, 2) ? "Two of the vectors are independent." : "All the vectors lie on one line." })), { wide: true }),
  cl("3.2 · Ex 12", "Which sets span ℝ³?", ["Spans ℝ³", "Does not span"], [
    [[1, 0, 0], [0, 1, 1], [1, 0, 1]], [[1, 0, 0], [0, 1, 1], [1, 0, 1], [1, 2, 3]], [[2, 1, -2], [3, 2, -2], [2, 2, 0]], [[2, 1, -2], [-2, -1, 2], [4, 2, -4]], [[1, 1, 3], [0, 2, 1]]].map((cols, k) => ({ tag: `(${"abcde"[k]})`, html: vlist(cols), ans: spans(cols, 3) ? 0 : 1, why: `rank ${qm.rank(colsToX(cols))}${spans(cols, 3) ? " = 3" : " < 3"}.`, action: depAct(cols) })), { wide: true }),
  cl("3.2 · Ex 13", "With x₁ = (−1, 2, 3)ᵀ and x₂ = (3, 4, 2)ᵀ:", ["In Span(x₁, x₂)", "Not in the span"], [
    { tag: "(a) x = (2, 6, 6)ᵀ", html: "", ans: inSpan([[-1, 2, 3], [3, 4, 2]], [2, 6, 6]) ? 0 : 1, why: "x = x₁ + x₂." },
    { tag: "(b) y = (−9, −2, 5)ᵀ", html: "", ans: inSpan([[-1, 2, 3], [3, 4, 2]], [-9, -2, 5]) ? 0 : 1, why: "y = 3x₁ − 2x₂." },
  ], { wide: true }),
]);

const ex31 = [[[2, 1], [3, 2]], [[2, 3], [4, 6]], [[-2, 1], [1, 3], [2, 4]], [[-1, 2], [1, -2], [2, -4]], [[1, 2], [-1, 1]]];
const ex32 = [[[1, 0, 0], [0, 1, 1], [1, 0, 1]], [[1, 0, 0], [0, 1, 1], [1, 0, 1], [1, 2, 3]], [[2, 1, -2], [3, 2, -2], [2, 2, 0]], [[2, 1, -2], [-2, -1, 2], [4, 2, -4]], [[1, 1, 3], [0, 2, 1]]];
const X5 = [[1, 2, -1, 0], [2, 5, -3, 2], [2, 4, -2, 0], [3, 8, -5, 4]];
buildExercises("s33", "Exercises · §3.3", "From the Section 3.3 exercises (p. 137–138). Use the decider to check your reasoning.", [
  cl("3.3 · Ex 1", "Are these vectors in ℝ² linearly independent?", ["Independent", "Dependent"],
    ex31.map((cols, k) => ({ tag: `(${"abcde"[k]})`, html: vlist(cols), ans: isIndep(cols) ? 0 : 1, why: cols.length > 2 ? "Three vectors in ℝ² are always dependent." : (isIndep(cols) ? "det ≠ 0." : "One is a multiple of the other."), action: depAct(cols) })), { wide: true }),
  cl("3.3 · Ex 2", "Are these vectors in ℝ³ linearly independent?", ["Independent", "Dependent"],
    ex32.map((cols, k) => ({ tag: `(${"abcde"[k]})`, html: vlist(cols), ans: isIndep(cols) ? 0 : 1, why: `rank ${qm.rank(colsToX(cols))} with ${cols.length} vectors.`, action: depAct(cols) })), { wide: true }),
  fl("3.3 · relation", `The vectors x₁, …, x₄ of Example 3.6.5, ${vlist(X5)}, are dependent. Find a nontrivial c with c₁x₁ + c₂x₂ + c₃x₃ + c₄x₄ = 0.`,
    [{ kind: "vector", label: "c", ans: qm.nullBasis(colsToX(X5))[0] }],
    "Row reduction leaves x₃ and x₄ free: x₃ = 2x₁ and x₄ = −x₁ + 2x₂. So (2, 0, −1, 0) and (−1, 2, 0, −1) both work; any nonzero c with Xc = 0 is accepted.",
    { check: ([c]) => { const v = c[0], X = colsToX(X5); if (v.every(x => x.zero)) return { ok: false, msg: "c = 0 is the trivial combination; find a nonzero one." }; return X.every(r => r.reduce((s, a, j) => s.add(a.mul(v[j])), new Q(0)).zero) ? { ok: true, msg: "Correct: Xc = 0 with c ≠ 0." } : { ok: false, msg: "Xc ≠ 0 for this c." }; }, actions: [depAct(X5)] }),
  ch("3.3 · Ex 6", "x₁, x₂, x₃ are independent and y₁ = x₁ + x₂, y₂ = x₂ + x₃, y₃ = x₃ + x₁. Are y₁, y₂, y₃ independent?", ["Yes", "No"], 0,
    "c₁y₁ + c₂y₂ + c₃y₃ = (c₁ + c₃)x₁ + (c₁ + c₂)x₂ + (c₂ + c₃)x₃ = 0 forces c₁ + c₃ = c₁ + c₂ = c₂ + c₃ = 0, so all cᵢ = 0."),
  ch("3.3 · Ex 7", "x₁, x₂, x₃ are independent and y₁ = x₂ − x₁, y₂ = x₃ − x₂, y₃ = x₃ − x₁. Are y₁, y₂, y₃ independent?", ["Yes", "No"], 1,
    "y₁ + y₂ − y₃ = 0, a nontrivial relation."),
  cl("3.3 · Ex 8", "Are these vectors linearly independent in P₃? (Hint: use coefficient vectors.)", ["Independent", "Dependent"], [
    { tag: "(a) 1, x², x² − 2", html: "", ans: 1, why: "x² − 2 = x² − 2·1." }, { tag: "(b) 2, x², x, 2x + 3", html: "", ans: 1, why: "Four vectors in the 3-dimensional P₃.", action: depAct([[2, 0, 0], [0, 0, 1], [0, 1, 0], [3, 2, 0]]) },
    { tag: "(c) x + 2, x + 1, x² − 1", html: "", ans: 0, why: "Coefficient matrix has determinant ≠ 0.", action: depAct([[2, 1, 0], [1, 1, 0], [-1, 0, 1]]) }, { tag: "(d) x + 2, x² − 1", html: "", ans: 0, why: "Neither is a multiple of the other." },
  ], { wide: true }),
  ch("3.3 · Wronskian", "W[1, x, x², x³] = 12 (Example 9). What does W ≢ 0 tell you?", ["1, x, x², x³ are linearly independent", "they are dependent", "nothing"], 0,
    "Theorem 3.3.3: if the Wronskian is nonzero at some point, the functions are linearly independent. (The converse can fail.)"),
]);

buildExercises("s34", "Exercises · §3.4", "From the Section 3.4 exercises (p. 143–144).", [
  fl("3.4 · Ex 3–5", `Dimensions of spans: (Ex 3) x₁ = (2, 1), x₂ = (4, 3), x₃ = (7, −3); (Ex 4) (3, −2, 4), (−3, 2, −4), (−6, 4, −8); (Ex 5) (2, 1, 3), (3, −1, 4), (2, 6, 4).`,
    [num("Ex 3", qm.rank(colsToX([[2, 1], [4, 3], [7, -3]]))), num("Ex 4", qm.rank(colsToX([[3, -2, 4], [-3, 2, -4], [-6, 4, -8]]))), num("Ex 5", qm.rank(colsToX([[2, 1, 3], [3, -1, 4], [2, 6, 4]])))],
    "dim Span = rank of the matrix with the vectors as columns: 2, 1, 2. In Ex 5, x₃ = 4x₁ − 2x₂.",
    { actions: [depAct([[2, 1, 3], [3, -1, 4], [2, 6, 4]])] }),
  fl("3.4 · Ex 7", "S = {(a + b, a − b + 2c, b, c)ᵀ : a, b, c ∈ ℝ} ⊂ ℝ⁴. What is dim S?", [num("dim S", 3)],
    "(a + b, a − b + 2c, b, c) = a(1, 1, 0, 0) + b(1, −1, 1, 0) + c(0, 2, 0, 1); these three vectors are independent.",
    { actions: [depAct([[1, 1, 0, 0], [1, -1, 1, 0], [0, 2, 0, 1]])] }),
  ch("3.4 · Ex 10", "x₁ = (1, 2, 2), x₂ = (2, 5, 4), x₃ = (1, 3, 2), x₄ = (2, 7, 4), x₅ = (1, 1, 0) span ℝ³. Which subset is a basis obtained by keeping the pivot columns?",
    ["{x₁, x₂, x₅}", "{x₁, x₂, x₃}", "{x₂, x₃, x₄}", "{x₁, x₄, x₅}"], 0,
    "Row reduce X = (x₁ … x₅): pivots in columns 1, 2 and 5. Indeed x₃ = x₂ − x₁ and x₄ = 3x₂ − 4x₁, so they can be dropped.",
    { actions: [depAct([[1, 2, 2], [2, 5, 4], [1, 3, 2], [2, 7, 4], [1, 1, 0]])] }),
  fl("3.4 · Ex 14", "Dimension of the subspace of P₃ spanned by: (a) x, x − 1, x² + 1; (b) x, x − 1, x² + 1, x² − 1; (c) x², x² − x − 1, x + 1; (d) 2x, x − 2.",
    [num("(a)", 3), num("(b)", 3), num("(c)", 2), num("(d)", 2)],
    "Use coefficient vectors (constant, x, x²). (c) x² − x − 1 = x² − (x + 1), so only two are independent. (b) can be at most 3 = dim P₃."),
  fl("3.4 · Ex 8(c)", "x₁ = (1, 1, 1)ᵀ and x₂ = (3, −1, 4)ᵀ. Find a third vector x₃ that extends {x₁, x₂} to a basis of ℝ³.", [vec("x₃", [1, 0, 0])],
    "Any x₃ with det(x₁ x₂ x₃) ≠ 0 works, for example e₁ = (1, 0, 0).",
    { check: ([v]) => { const d = qm.det(colsToX([[1, 1, 1], [3, -1, 4], v[0]])); return d.zero ? { ok: false, msg: "det(x₁ x₂ x₃) = 0: x₃ lies in the plane of x₁ and x₂." } : { ok: true, msg: `det(x₁ x₂ x₃) = ${d.txt()} ≠ 0, so the three vectors form a basis.` }; } }),
]);

const U3 = [[[1, 1], [-1, 1]], [[1, 2], [2, 5]], [[0, 1], [1, 0]]];
const Umat = cols => colsToX(cols);
buildExercises("s35", "Exercises · §3.5", "From the Section 3.5 exercises (p. 153).", [
  fl("3.5 · Ex 1", "Find the transition matrix from {u₁, u₂} to {e₁, e₂} for (a) u₁ = (1, 1), u₂ = (−1, 1); (b) u₁ = (1, 2), u₂ = (2, 5); (c) u₁ = (0, 1), u₂ = (1, 0).",
    U3.map((c, k) => mat(`(${"abc"[k]})`, Umat(c))), "From {u₁, u₂} to the standard basis, the transition matrix is U = (u₁ u₂): x = U[x]_U.", { wide: true }),
  fl("3.5 · Ex 2", "Now find the transition matrix from {e₁, e₂} to {u₁, u₂} for the same three bases.", U3.map((c, k) => mat(`(${"abc"[k]})`, qm.inv(Umat(c)))),
    "It is the inverse, U⁻¹.", { wide: true }),
  fl("3.5 · Ex 3(a)", "v₁ = (3, 2)ᵀ, v₂ = (4, 3)ᵀ and u₁ = (1, 1)ᵀ, u₂ = (−1, 1)ᵀ. Find the transition matrix from {v₁, v₂} to {u₁, u₂}.",
    [mat("S", qm.mul(qm.inv(Umat(U3[0])), Umat([[3, 2], [4, 3]])))], "S = U⁻¹V: first convert V-coordinates to standard ones (V), then standard to U-coordinates (U⁻¹).",
    { actions: [{ label: "See it in the basis lab", run: () => goto("#lab-basis") }] }),
  fl("3.5 · Ex 4", "E = [(5, 3)ᵀ, (3, 2)ᵀ]. Find [x]_E, [y]_E, [z]_E for x = (1, 1)ᵀ, y = (1, −1)ᵀ, z = (10, 7)ᵀ.",
    [[1, 1], [1, -1], [10, 7]].map((v, k) => vec(`[${"xyz"[k]}]_E`, qm.mul(qm.inv(Umat([[5, 3], [3, 2]])), qm.col(v)).map(r => r[0]))),
    "[v]_E = E⁻¹v with E⁻¹ = (2 −3; −3 5).", { wide: true }),
  fl("3.5 · Ex 5", "u₁ = (1, 1, 1)ᵀ, u₂ = (1, 2, 2)ᵀ, u₃ = (2, 3, 4)ᵀ. (a) Transition matrix from {e₁, e₂, e₃} to {u₁, u₂, u₃}. (b) Coordinates of (3, 2, 5)ᵀ.",
    [mat("U⁻¹", qm.inv(Umat([[1, 1, 1], [1, 2, 2], [2, 3, 4]]))), vec("coordinates", qm.mul(qm.inv(Umat([[1, 1, 1], [1, 2, 2], [2, 3, 4]])), qm.col([3, 2, 5])).map(r => r[0]))],
    "(a) U⁻¹. (b) U⁻¹(3, 2, 5)ᵀ.", { wide: true }),
  fl("3.5 · Ex 7", `v₁ = (1, 2)ᵀ, v₂ = (2, 3)ᵀ, S = ${sm([[3, 5], [1, -2]])}. Find w₁, w₂ so that S is the transition matrix from {w₁, w₂} to {v₁, v₂}.`,
    [mat("W = (w₁ w₂)", qm.mul(Umat([[1, 2], [2, 3]]), qm.of([[3, 5], [1, -2]])))], "S = V⁻¹W, so W = VS.", {}),
]);

const ex361 = [[[1, 3, 2], [2, 1, 4], [4, 7, 8]], [[-3, 1, 3, 4], [1, 2, -1, -2], [-3, 8, 4, 2]], [[1, 3, -2, 1], [2, 1, 3, 2], [3, 4, 5, 6]]];
const cons = [[[[1, 2], [2, 4]], [4, 8]], [[[3, 6], [1, 2]], [1, 1]], [[[2, 1], [3, 4]], [4, 6]], [[[1, 1, 2], [1, 1, 2], [1, 1, 2]], [1, 2, 3]], [[[0, 1], [1, 0], [0, 1]], [2, 5, 2]], [[[1, 2], [2, 4], [1, 2]], [5, 10, 5]]];
buildExercises("s36", "Exercises · §3.6", "From the Section 3.6 exercises (p. 159–160).", [
  fl("3.6 · Ex 1", `Rank and nullity of (a) ${sm(ex361[0])} (b) ${sm(ex361[1])} (c) ${sm(ex361[2])}`,
    ex361.flatMap((A, k) => [num(`(${"abc"[k]}) rank`, qm.rank(qm.of(A))), num(`(${"abc"[k]}) nullity`, A[0].length - qm.rank(qm.of(A)))]),
    "Row reduce each matrix; rank = number of pivots, nullity = number of free variables, and rank + nullity = number of columns.",
    { wide: true, actions: ex361.map((A, k) => ({ label: `Open (${"abc"[k]}) in the lab`, run: () => HOOK.rank(A) })) }),
  fl("3.6 · Ex 2", "Dimension of the subspace of ℝ³ spanned by (a) (1, −2, 2), (2, −2, 4), (−3, 3, 6); (b) (1, 1, 1), (1, 2, 3), (2, 3, 1); (c) (1, −1, 2), (−2, 2, −4), (3, −2, 5), (2, −1, 3).",
    [num("(a)", qm.rank(colsToX([[1, -2, 2], [2, -2, 4], [-3, 3, 6]]))), num("(b)", qm.rank(colsToX([[1, 1, 1], [1, 2, 3], [2, 3, 1]]))), num("(c)", qm.rank(colsToX([[1, -1, 2], [-2, 2, -4], [3, -2, 5], [2, -1, 3]])))],
    "Dimension of a span = rank of the matrix with the vectors as columns."),
  cl("3.6 · Ex 4", "Is b in the column space of A, i.e. is Ax = b consistent?", ["Consistent", "Inconsistent"],
    cons.map(([A, b], k) => ({ tag: `(${"abcdef"[k]})`, html: `${sm(A)} b = ${vtxt(b)}`, ans: qm.solve(qm.of(A), b) ? 0 : 1, why: qm.solve(qm.of(A), b) ? "b is a combination of the columns." : "b is not a combination of the columns." })), { wide: true }),
  fl("3.6 · Ex 9", "A and B are 6 × 5. If dim N(A) = 2, what is rank(A)? If rank(B) = 4, what is dim N(B)?", [num("rank A", 3), num("dim N(B)", 1)],
    "Rank–nullity with n = 5 columns: rank A = 5 − 2 = 3, dim N(B) = 5 − 4 = 1."),
  cl("3.6 · Ex 7", "A is 6 × n with rank r. How many solutions can Ax = b have?", ["0 or infinitely many", "always infinitely many", "0 or exactly 1", "exactly 1"], [
    { tag: "(a) n = 7, r = 5", html: "", ans: 0, why: "r < 6, so some b are not in the column space; n − r = 2 free variables when consistent." },
    { tag: "(b) n = 7, r = 6", html: "", ans: 1, why: "r = 6 = m: always consistent, with 1 free variable." },
    { tag: "(c) n = 5, r = 5", html: "", ans: 2, why: "No free variables; b may or may not be in the 5-dimensional column space of ℝ⁶." },
    { tag: "(d) n = 5, r = 4", html: "", ans: 0, why: "One free variable when consistent." },
  ], { wide: true }),
  fl("3.6 · Ex 14", `A is 4 × 4 with reduced row echelon form U = ${sm([[1, 0, 2, 1], [0, 1, 1, 4], [0, 0, 0, 0], [0, 0, 0, 0]])}, a₁ = (−3, 5, 2, 1)ᵀ and a₂ = (4, −3, 7, −1)ᵀ. Find a₃ and a₄.`,
    [vec("a₃", [2 * -3 + 4, 2 * 5 - 3, 2 * 2 + 7, 2 * 1 - 1]), vec("a₄", [-3 + 16, 5 - 12, 2 + 28, 1 - 4])],
    "Column relations survive row operations. In U, u₃ = 2u₁ + u₂ and u₄ = u₁ + 4u₂, so a₃ = 2a₁ + a₂ and a₄ = a₁ + 4a₂.", { wide: true }),
]);
})();
