(() => {
"use strict";
const { $, MINUS, HOOK, goto, el, fmt, gcd, Q, matHTML, lbl, q, qm, ch, fl, cl, vec, mat, num, buildExercises, sm, renderDefinitions, setStore, plane2D, draggable } = LA;
setStore("leon-ch7-solved-v1");
const S_ = n => `<sub>${n}</sub>`;
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;
const toF = v => v instanceof Q ? v.n / v.d : +v;
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const nrm = a => Math.sqrt(dot(a, a));
const scl = (c, a) => a.map(v => c * v);
const fT = A => A[0].map((_, j) => A.map(r => r[j]));
const fmul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
const fapp = (A, p) => A.map(r => dot(r, p));
const kv = rows => rows.map(([k, v, c]) => `<tr${c ? ` class="${c}"` : ""}><th>${k}</th><td>${v}</td></tr>`).join("");
const sci = (v, d = 3) => !isFinite(v) ? String(v) : v === 0 ? "0" : (Math.abs(v) >= 1e-3 && Math.abs(v) < 1e6) ? String(+v.toPrecision(d + 3)).replace("-", MINUS) : v.toExponential(d).replace("e", "×10^").replace(/\^\+?(-?\d+)/, (m, e) => `<sup>${e.replace("-", MINUS)}</sup>`).replace("-", MINUS);

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
const niceM = M => matHTML(M, { render: v => typeof v === "number" ? nice(v) : v });
// round to t significant decimal digits, ties away from zero (as in the book)
const fl10 = (x, t) => (x === 0 || !isFinite(x)) ? x : Number((x + x * 4e-16).toPrecision(t));
const tdig = (x, t) => x === 0 ? "0" : !isFinite(x) ? String(x) : (Math.abs(x) >= 1e-4 && Math.abs(x) < 1e7 ? String(t ? Number(x.toPrecision(t)) : +x.toPrecision(10)) : (t ? x.toExponential(t - 1) : x.toExponential(6))).replace("-", MINUS);
function chipRow(host, items, cur, onPick, fmtf = x => x) {
  host.innerHTML = "";
  items.forEach(v => { const b = document.createElement("button"); b.className = "chip"; b.textContent = fmtf(v); b.setAttribute("aria-pressed", v === cur); b.onclick = () => onPick(v); host.appendChild(b); });
}
function presetRow(host, list, onPick) {
  host.innerHTML = "";
  list.forEach((p, k) => { const b = document.createElement("button"); b.className = "chip"; b.textContent = p.name || p[0]; b.onclick = () => onPick(k); host.appendChild(b); });
  return k => host.querySelectorAll(".chip").forEach((b, i) => b.setAttribute("aria-pressed", i === k));
}
// text grid of decimal strings (mutated in place)
function strGrid(host, vals, o = {}) {
  let h = `<div class="mat gridin"><table>`;
  vals.forEach((row, i) => { h += `<tr>${row.map((v, j) => `<td class="inp${o.split === j ? " split" : ""}"><input class="mi" style="width:${o.w || 74}px" data-i="${i}" data-j="${j}" value="${v}" aria-label="${o.name || "entry"} ${i + 1},${j + 1}" autocomplete="off"></td>`).join("")}</tr>`; });
  host.innerHTML = o.label ? lbl(h + `</table></div>`, o.label) : h + `</table></div>`;
  host.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
    const v = inp.value.trim().replace(/−/g, "-"), ok = v !== "" && isFinite(Number(v)); inp.classList.toggle("wrong", !ok);
    if (ok) { vals[+inp.dataset.i][+inp.dataset.j] = v; if (o.onChange) o.onChange(); }
  }));
}
function gsolve(A, b) {
  const n = A.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    if (Math.abs(M[p][c]) < 1e-300) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let i = c + 1; i < n; i++) { const f = M[i][c] / M[c][c]; for (let k = c; k <= n; k++) M[i][k] -= f * M[c][k]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let k = i + 1; k < n; k++) s -= M[i][k] * x[k]; x[i] = s / M[i][i]; }
  return x;
}
const finv = A => { const n = A.length, cols = []; for (let j = 0; j < n; j++) { const e = Array(n).fill(0); e[j] = 1; const c = gsolve(A, e); if (!c) return null; cols.push(c); } return fT(cols); };
const norm1 = A => Math.max(...A[0].map((_, j) => A.reduce((s, r) => s + Math.abs(r[j]), 0)));
const normI = A => Math.max(...A.map(r => r.reduce((s, v) => s + Math.abs(v), 0)));
const normF = A => Math.sqrt(A.reduce((s, r) => s + dot(r, r), 0));
function svd2s(F) { const AtA = fmul(fT(F), F), p = AtA[0][0], qq = AtA[0][1], r = AtA[1][1], m = (p + r) / 2, d = Math.sqrt(((p - r) / 2) ** 2 + qq * qq); return [Math.sqrt(m + d), Math.sqrt(Math.max(0, m - d))]; }

/* =========================================================
   LAB · Floating-point explorer
   ========================================================= */
function flb(x, b, t, L, U) {
  if (x === 0) return { v: 0, M: 0, e: 0, sign: 1, digits: "0".repeat(t) };
  const sign = Math.sign(x), a = Math.abs(x);
  let e = Math.floor(Math.log(a) / Math.log(b)) + 1;
  while (a >= b ** e) e++;
  while (a < b ** (e - 1)) e--;
  let M = Math.round(a / b ** e * b ** t * (1 + 4e-16));
  if (M >= b ** t) { M = b ** (t - 1); e++; }
  const r = { sign, e, M, digits: M.toString(b).padStart(t, "0") };
  if (e > U) return Object.assign(r, { overflow: true, v: sign * Infinity });
  if (e < L) return Object.assign(r, { underflow: true, v: 0 });
  r.v = sign * Number((M * b ** (e - t)).toPrecision(15));
  return r;
}
(function fpLab() {
  const PRE = [["Example 3: b = 10, t = 1, e ∈ [−1, 1]", 10, 1, -1, 1], ["Ex 8: b = 2, t = 2, e ∈ [−2, 2]", 2, 2, -2, 2], ["b = 2, t = 3, e ∈ [−3, 3]", 2, 3, -3, 3], ["3-digit decimal", 10, 3, -3, 3], ["Example 2: b = 8, t = 3", 8, 3, -2, 4]];
  const S = { b: 10, t: 1, L: -1, U: 1, k: 0, zoom: 2 };
  const svg = $("#fp-svg");
  const mark = presetRow($("#fp-presets"), PRE, k => { S.k = k; [, S.b, S.t, S.L, S.U] = PRE[k]; $("#fp-L").value = S.L; $("#fp-U").value = S.U; S.zoom = k === 0 ? 2 : k === 1 ? "max" : 1; draw(); });
  ["L", "U"].forEach(k => $("#fp-" + k).addEventListener("input", e => { const v = parseInt(e.target.value, 10); if (isFinite(v) && Math.abs(v) <= 12) { S[k] = v; S.k = -1; draw(); } }));
  $("#fp-x").addEventListener("input", draw);
  function draw() {
    mark(S.k);
    chipRow($("#fp-b"), [2, 8, 10, 16], S.b, v => { S.b = v; S.k = -1; draw(); });
    chipRow($("#fp-t"), [1, 2, 3, 4, 5, 6], S.t, v => { S.t = v; S.k = -1; draw(); });
    chipRow($("#fp-zoom"), [0.1, 1, 2, 10, "max"], S.zoom, v => { S.zoom = v; draw(); }, v => v === "max" ? "largest" : String(v));
    const { b, t, L, U } = S, largest = (1 - b ** -t) * b ** U, smallest = b ** (L - 1), count = 2 * (b - 1) * b ** (t - 1) * (U - L + 1) + 1;
    const Z = S.zoom === "max" ? largest * 1.02 : S.zoom;
    const vals = [];
    let tooMany = (b - 1) * b ** (t - 1) * (U - L + 1) > 200000;
    for (let e = L; e <= U && !tooMany; e++) for (let M = b ** (t - 1); M < b ** t; M++) { const v = M * b ** (e - t); if (v <= Z) { vals.push([v, e]); if (vals.length > 6000) { tooMany = true; break; } } }
    svg.innerHTML = "";
    const X = v => 20 + 800 * v / Z;
    el("line", { x1: 20, y1: 100, x2: 820, y2: 100, style: "stroke:var(--ink)" }, svg);
    const cols = ["c1", "c2", "c3", "pivot", "warn"];
    if (!tooMany) vals.forEach(([v, e]) => el("line", { x1: X(v), y1: 82, x2: X(v), y2: 118, style: `stroke:var(--${cols[(e - L) % cols.length]})`, "stroke-width": vals.length > 300 ? 0.8 : 2 }, svg));
    else { const tx = el("text", { x: 420, y: 70, "text-anchor": "middle", "font-size": 14 }, svg); tx.textContent = "too many numbers to draw: zoom in"; }
    el("line", { x1: X(0), y1: 78, x2: X(0), y2: 122, style: "stroke:var(--ink)", "stroke-width": 2.5 }, svg);
    for (let k = 0; k <= 4; k++) { const v = Z * k / 4, tx = el("text", { x: X(v), y: 142, "text-anchor": "middle", "font-size": 13, style: "fill:var(--muted)" }, svg); tx.textContent = +v.toPrecision(3); }
    const xs = $("#fp-x").value.trim().replace(/−/g, "-"), x = Number(xs), st = $("#fp-status");
    if (xs === "" || !isFinite(x)) { $("#fp-tab").innerHTML = ""; st.innerHTML = "Enter a number x."; return; }
    const r = flb(x, b, t, L, U);
    if (Math.abs(x) <= Z) { el("circle", { cx: X(Math.abs(x)), cy: 60, r: 5, style: "fill:var(--warn)" }, svg); const tx = el("text", { x: X(Math.abs(x)), y: 46, "text-anchor": "middle", "font-size": 13, style: "fill:var(--warn)" }, svg); tx.textContent = "|x|"; }
    if (isFinite(r.v) && Math.abs(r.v) <= Z) el("path", { d: `M${X(Math.abs(r.v))},128 l-6,10 h12 z`, style: "fill:var(--c2)" }, svg);
    const eps = 0.5 * b ** (1 - t), rel = x ? (r.v - x) / x : 0;
    $("#fp-tab").innerHTML = kv([
      ["representation", r.overflow ? "overflow (e > U)" : r.underflow ? "underflow (e < L): stored as 0" : `${r.sign < 0 ? MINUS : ""}(0.${r.digits})${S_(b)} × ${b}<sup>${String(r.e).replace("-", MINUS)}</sup>`, "amb"],
      ["fl(x) in decimal", isFinite(r.v) ? String(r.v).replace("-", MINUS) : "±∞"], ["absolute error fl(x) − x", isFinite(r.v) ? sci(r.v - x) : "—"], ["relative error δ", isFinite(r.v) ? sci(rel) : "—"],
      ["machine epsilon ε = ½b^(1−t)", sci(eps)], ["numbers in the system", count.toLocaleString("en")], ["largest, smallest positive", `${sci(largest)}, ${sci(smallest)}`],
    ]);
    st.className = "status " + (r.overflow || r.underflow ? "bad" : "ok");
    st.innerHTML = r.overflow ? `<span class="k">Overflow</span>|x| exceeds the largest number (1 − b<sup>−t</sup>)b<sup>U</sup>.` : r.underflow ? `<span class="k">Underflow</span>|x| is below the smallest normalized number b<sup>L−1</sup>.` :
      `<span class="k math">|δ| = ${sci(Math.abs(rel))} ≤ ε = ${sci(eps)}</span>Between consecutive powers of ${b} the numbers are evenly spaced, but the spacing jumps by a factor ${b} at each power: absolute errors grow with |x|, relative errors stay below ε.`;
  }
  draw();
})();

/* =========================================================
   LAB · t-digit arithmetic and IEEE doubles
   ========================================================= */
(function arithLab() {
  const PRE = [["Example 4: a + b", "2630", "+", "4.46", 3], ["Example 4: a × b", "2630", "×", "4.46", 3], ["Example 5: c − d", "3.4215298", "−", "3.4213851", 6], ["Ex 4(a)", "10420", "+", "0.0018", 4], ["Ex 4(b)", "10424", "−", "10416", 4], ["Ex 4(c)", "0.12347", "−", "0.12342", 4], ["Ex 4(d)", "3626.6", "×", "22.656", 4]];
  const S = { t: 3, k: 0 };
  const mark = presetRow($("#ar-presets"), PRE, k => { S.k = k; const p = PRE[k]; $("#ar-a").value = p[1]; $("#ar-op").value = p[2]; $("#ar-b").value = p[3]; S.t = p[4]; draw(); });
  ["ar-a", "ar-b"].forEach(id => $("#" + id).addEventListener("input", () => { S.k = -1; draw(); }));
  $("#ar-op").onchange = () => { S.k = -1; draw(); };
  const OP = { "+": (a, b) => a + b, "−": (a, b) => a - b, "×": (a, b) => a * b, "÷": (a, b) => a / b };
  function draw() {
    mark(S.k);
    chipRow($("#ar-t"), [2, 3, 4, 5, 6, 7, 8], S.t, v => { S.t = v; S.k = -1; draw(); });
    const a = Number($("#ar-a").value.replace(/−/g, "-")), b = Number($("#ar-b").value.replace(/−/g, "-")), op = $("#ar-op").value, t = S.t, st = $("#ar-status");
    if (!isFinite(a) || !isFinite(b)) { st.innerHTML = "Enter two numbers."; return; }
    const fa = fl10(a, t), fb = fl10(b, t), exact = OP[op](a, b), c = fl10(OP[op](fa, fb), t);
    const ra = a ? (fa - a) / a : 0, rb = b ? (fb - b) / b : 0, rc = exact ? (c - exact) / exact : (c === 0 ? 0 : Infinity);
    $("#ar-tab").innerHTML = kv([["fl(a), fl(b)", `${tdig(fa, t)}, ${tdig(fb, t)}`], ["relative errors of the inputs", `${sci(ra)}, ${sci(rb)}`], [`exact a ${op} b`, tdig(exact, 0)],
      [`computed fl(fl(a) ${op} fl(b))`, tdig(c, t), "amb"], ["absolute error", sci(c - exact)], ["relative error", sci(rc)], ["machine epsilon ½·10^(1−t)", sci(0.5 * 10 ** (1 - t))]]);
    const worse = Math.abs(rc) > 50 * Math.max(Math.abs(ra), Math.abs(rb), 0.5 * 10 ** (1 - t));
    st.className = "status " + (worse ? "bad" : "ok");
    st.innerHTML = worse ? `<span class="k">Catastrophic cancellation</span>The inputs agree in their leading digits, so subtracting them leaves only the uncertain trailing digits: the relative error of the result is ${fmt(Math.abs(rc) / Math.max(Math.abs(ra), Math.abs(rb), 1e-300), 0)} times that of the inputs.`
      : `<span class="k math">relative error ${sci(Math.abs(rc))}</span>For a single operation on exact inputs the relative error stays below ε (fl(a ∘ b) = (a ∘ b)(1 + δ), |δ| ≤ ε).`;
  }
  // ---- IEEE doubles ----
  const FN = { "0.1": () => 0.1, "0.1+0.2": () => 0.1 + 0.2, "1+2**-52": () => 1 + 2 ** -52, "1+2**-53": () => 1 + 2 ** -53, "1e308*10": () => 1e308 * 10, "2**-1074": () => 2 ** -1074 };
  document.querySelectorAll("[data-ie]").forEach(bt => bt.onclick = () => { const v = FN[bt.dataset.ie](); $("#ie-x").value = bt.textContent; ieShow(v, bt.textContent); });
  $("#ie-x").addEventListener("input", e => { const v = Number(e.target.value.replace(/−/g, "-")); if (!isNaN(v)) ieShow(v, e.target.value); });
  function exactDec(x) {
    if (!isFinite(x)) return String(x);
    const dv = new DataView(new ArrayBuffer(8)); dv.setFloat64(0, x);
    const hi = dv.getUint32(0), lo = dv.getUint32(4), sgn = hi >>> 31, ex = (hi >>> 20) & 0x7ff;
    let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo), e2;
    if (ex === 0) e2 = -1074; else { mant |= 1n << 52n; e2 = ex - 1075; }
    if (mant === 0n) return "0";
    let s;
    if (e2 >= 0) s = (mant << BigInt(e2)).toString();
    else { const k = -e2, num = mant * 5n ** BigInt(k), str = num.toString().padStart(k + 1, "0"); s = (str.slice(0, -k) + "." + str.slice(-k)).replace(/0+$/, "").replace(/\.$/, ""); }
    if (s.length > 70) s = s.slice(0, 70) + "…";
    return (sgn ? "−" : "") + s;
  }
  function ieShow(x, label) {
    const dv = new DataView(new ArrayBuffer(8)); dv.setFloat64(0, x);
    let bits = ""; for (let i = 0; i < 8; i++) bits += dv.getUint8(i).toString(2).padStart(8, "0");
    $("#ie-bits").innerHTML = `<span class="bs">${bits[0]}</span><span class="be">${bits.slice(1, 12)}</span><span class="bm">${bits.slice(12)}</span><div class="bl"><span>sign</span><span>exponent (11 bits)</span><span>fraction (52 bits)</span></div>`;
    const ex = parseInt(bits.slice(1, 12), 2), st = $("#ie-status");
    const ulp = isFinite(x) && x !== 0 ? 2 ** (Math.max(ex, 1) - 1075) : NaN;
    st.className = "status inf";
    st.innerHTML = `<span class="k math">${label} is stored as ${exactDec(x)}</span>` +
      (!isFinite(x) ? "Overflow: the result is ±Infinity." : x === 0 ? "Zero." : ex === 0 ? `A subnormal number, below 2<sup>−1022</sup>; the gap to the next double is 2<sup>−1074</sup>.` :
        `Exponent ${ex - 1023}; the gap to the next double is 2<sup>${ex - 1075}</sup> ≈ ${ulp.toExponential(3)}. ${x === 0.1 + 0.2 ? "0.1 and 0.2 are both rounded on input, and their rounded sum is not the double nearest 0.3 (which is 0.299999999999999988898…)." : label.includes("2⁻⁵³") ? "1 + 2⁻⁵³ lies exactly halfway between 1 and the next double; it rounds to the even one, 1." : label.includes("2⁻⁵²") ? "1 + 2⁻⁵² is the next double after 1: 2⁻⁵² = Number.EPSILON, the ε of the book." : ""}`);
  }
  mark(0); $("#ar-a").value = "2630"; $("#ar-b").value = "4.46"; draw(); ieShow(0.1, "0.1");
})();

/* =========================================================
   LAB · Operation counts and timing
   ========================================================= */
(function costLab() {
  $("#ct-tab").innerHTML = `<tr><th>n</th><th>elimination ≈ n³/3 mult.</th><th>one solve ≈ n² mult.</th></tr>` + [10, 100, 1000, 10000].map(n => `<tr><td>${n.toLocaleString("en")}</td><td>${(n ** 3 / 3).toExponential(2)}</td><td>${(n * n).toExponential(2)}</td></tr>`).join("");
  $("#ct-status").innerHTML = `<span class="k">Why factor once?</span>For several right-hand sides, keep L and U: each new b costs only forward and back substitution.`;
  $("#ct-run").onclick = () => {
    const rows = []; let prev = null;
    for (const n of [100, 200, 400, 800]) {
      const A = new Float64Array(n * n); let s = 1; for (let i = 0; i < n * n; i++) { s = (s * 16807) % 2147483647; A[i] = s / 2147483647 - 0.5; }
      const t0 = performance.now();
      for (let c = 0; c < n; c++) {
        let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(A[i * n + c]) > Math.abs(A[p * n + c])) p = i;
        if (p !== c) for (let k = 0; k < n; k++) { const tt = A[c * n + k]; A[c * n + k] = A[p * n + k]; A[p * n + k] = tt; }
        const piv = A[c * n + c];
        for (let i = c + 1; i < n; i++) { const m = A[i * n + c] / piv; if (m === 0) continue; for (let k = c; k < n; k++) A[i * n + k] -= m * A[c * n + k]; }
      }
      const ms = performance.now() - t0;
      rows.push(`<tr><td>${n}</td><td>${ms.toFixed(1)} ms</td><td>${prev ? (ms / prev).toFixed(1) + "×" : "—"}</td><td>${(n ** 3 / 3 / Math.max(ms, 0.01) / 1e3).toFixed(0)} Mflop/s</td></tr>`);
      prev = ms;
    }
    $("#ct-time").innerHTML = `<tr><th>n</th><th>time</th><th>vs. n/2</th><th>speed</th></tr>` + rows.join("");
    $("#ct-status").innerHTML = `<span class="k">Doubling n costs about 8×</span>Elimination is O(n³). (Small sizes are noisy: timer resolution and just-in-time compilation.)`;
  };
})();

/* =========================================================
   LAB · Gaussian elimination in t-digit arithmetic
   ========================================================= */
(function geLab() {
  const H4 = [[1, 1 / 2, 1 / 3, 1 / 4], [1 / 2, 1 / 3, 1 / 4, 1 / 5], [1 / 3, 1 / 4, 1 / 5, 1 / 6], [1 / 4, 1 / 5, 1 / 6, 1 / 7]];
  const PRE = [
    { name: "Example 7.3.3, no pivoting", M: [["0.0001", "2", "4"], ["1", "1", "3"]], t: 3, piv: "none" },
    { name: "Example 7.3.3, partial", M: [["0.0001", "2", "4"], ["1", "1", "3"]], t: 3, piv: "partial" },
    { name: "Example 7.3.2", M: [["6", "-4", "2", "-2"], ["4", "2", "1", "4"], ["2", "-1", "1", "-1"]], t: 0, piv: "partial" },
    { name: "Example 7.4.2 (t = 4)", M: [["2", "2", "6"], ["2", "2.0005", "6.001"]], t: 4, piv: "partial" },
    { name: "Ex 7.3.7, no pivoting", M: [["0.6", "2000", "2003"], ["0.3076", "-0.401", "1.137"]], t: 4, piv: "none" },
    { name: "Ex 7.3.3", M: [["1", "8", "6", "8"], ["-1", "-4", "5", "1"], ["2", "4", "-6", "4"]], t: 0, piv: "partial" },
    { name: "Hilbert 4 (t = 4)", M: H4.map(r => [...r.map(v => String(+v.toPrecision(4))), String(+r.reduce((s, v) => s + v, 0).toPrecision(4))]), t: 4, piv: "partial" },
  ];
  const S = { M: null, t: 3, piv: "none", step: 0, k: 0 };
  const mark = presetRow($("#ge-presets"), PRE, k => load(k));
  function load(k) { const p = PRE[k]; S.k = k; S.M = p.M.map(r => r.slice()); S.t = p.t; S.piv = p.piv; S.step = 0; build(); }
  function build() {
    const n = S.M.length; mark(S.k);
    chipRow($("#ge-n"), [2, 3, 4], n, v => { S.M = Array.from({ length: v }, (_, i) => Array.from({ length: v + 1 }, (_, j) => (S.M[i] && j < v && S.M[i][j] !== undefined && j < n) ? S.M[i][j] : (j === v ? (S.M[i] ? S.M[i][n] : "1") : (i === j ? "1" : "0")))); S.k = -1; S.step = 0; build(); });
    chipRow($("#ge-t"), [2, 3, 4, 5, 6, 0], S.t, v => { S.t = v; S.k = -1; S.step = 0; calc(); }, v => v ? String(v) : "double");
    chipRow($("#ge-piv"), ["none", "partial", "complete"], S.piv, v => { S.piv = v; S.k = -1; S.step = 0; calc(); });
    strGrid($("#ge-in"), S.M, { label: "(A | b), decimals allowed", split: n, onChange: () => { S.k = -1; mark(-1); S.step = 0; calc(); } });
    calc();
  }
  function run() {
    const n = S.M.length, t = S.t, r = v => t ? fl10(v, t) : v;
    const M = S.M.map(row => row.map(v => r(Number(v)))), perm = [...Array(n).keys()], steps = [];
    const snap = (note, hl = {}) => steps.push({ M: M.map(x => x.slice()), note, hl, perm: perm.slice() });
    snap(t ? `entries rounded to ${t} significant digits` : "start (IEEE double arithmetic)");
    let maxm = 0, fail = false;
    for (let i = 0; i < n; i++) {
      if (S.piv === "partial") { let p = i; for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k; if (p !== i) { [M[i], M[p]] = [M[p], M[i]]; snap(`partial pivoting: swap R${i + 1} ↔ R${p + 1} (|${tdig(M[i][i], t)}| is the largest candidate)`, { piv: [i, i] }); } }
      else if (S.piv === "complete") { let p = i, qq = i; for (let k = i; k < n; k++) for (let j = i; j < n; j++) if (Math.abs(M[k][j]) > Math.abs(M[p][qq])) { p = k; qq = j; } if (p !== i) [M[i], M[p]] = [M[p], M[i]]; if (qq !== i) { M.forEach(row => { [row[i], row[qq]] = [row[qq], row[i]]; }); [perm[i], perm[qq]] = [perm[qq], perm[i]]; } if (p !== i || qq !== i) snap(`complete pivoting: swap R${i + 1} ↔ R${p + 1}${qq !== i ? `, columns ${i + 1} ↔ ${qq + 1}` : ""}`, { piv: [i, i] }); }
      else if (M[i][i] === 0) { let p = -1; for (let k = i + 1; k < n; k++) if (M[k][i] !== 0) { p = k; break; } if (p > 0) { [M[i], M[p]] = [M[p], M[i]]; snap(`zero pivot: a swap R${i + 1} ↔ R${p + 1} is forced`, { piv: [i, i] }); } }
      if (M[i][i] === 0) { fail = true; snap(`pivot a${S_(i + 1)}${S_(i + 1)} = 0: the matrix is singular (in this arithmetic)`); break; }
      for (let k = i + 1; k < n; k++) {
        if (M[k][i] === 0) continue;
        const m = r(M[k][i] / M[i][i]); maxm = Math.max(maxm, Math.abs(m));
        for (let j = i + 1; j <= n; j++) M[k][j] = r(M[k][j] - r(m * M[i][j]));
        M[k][i] = 0;
        snap(`R${k + 1} ← R${k + 1} − m·R${i + 1}, m = ${tdig(m, t)}${Math.abs(m) > 1 ? " (|m| > 1: errors in row " + (i + 1) + " are amplified)" : ""}`, { row: k, piv: [i, i], big: Math.abs(m) > 1 });
      }
    }
    let x = null;
    if (!fail) {
      const z = Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let j = i + 1; j < n; j++) s = r(s - r(M[i][j] * z[j])); z[i] = r(s / M[i][i]); }
      x = Array(n).fill(0); perm.forEach((pj, i) => { x[pj] = z[i]; });
    }
    return { steps, x, maxm, fail };
  }
  function calc() {
    const n = S.M.length, t = S.t, R = run(), st = $("#ge-status");
    S.step = Math.max(0, Math.min(S.step, R.steps.length - 1));
    const sp = $("#ge-step");
    sp.innerHTML = `<button class="btn sm" id="ge-prev">◀</button><span>step ${S.step} of ${R.steps.length - 1}</span><button class="btn sm" id="ge-next">▶</button><button class="btn sm" id="ge-end">Result</button>`;
    $("#ge-prev").disabled = S.step === 0; $("#ge-next").disabled = S.step >= R.steps.length - 1;
    $("#ge-prev").onclick = () => { S.step--; calc(); }; $("#ge-next").onclick = () => { S.step++; calc(); }; $("#ge-end").onclick = () => { S.step = R.steps.length - 1; calc(); };
    const s = R.steps[S.step];
    $("#ge-mat").innerHTML = lbl(matHTML(s.M, { split: n, render: v => tdig(v, t), cellClass: (i, j) => (s.hl.piv && s.hl.piv[0] === i && s.hl.piv[1] === j) ? "lead" : (s.hl.row === i ? (s.hl.big ? "hl2" : "hl1") : "") }), s.perm.some((p, i) => p !== i) ? `columns hold x${s.perm.map(p => S_(p + 1)).join(", x")}` : "working matrix") + `<span class="op">${s.note}</span>`;
    let exact = null;
    try { const A = S.M.map(r => r.slice(0, n).map(v => Q.parse(v))), b = S.M.map(r => Q.parse(r[n])); if (A.flat().every(Boolean) && b.every(Boolean) && !qm.det(A).zero) exact = qm.solve(A, b).map(v => v.n / v.d); } catch (e) { exact = null; }
    if (!exact) { const A = S.M.map(r => r.slice(0, n).map(Number)), b = S.M.map(r => Number(r[n])); exact = gsolve(A, b); }
    if (R.fail || !R.x) { st.className = "status bad"; st.innerHTML = `<span class="k">Breakdown</span>A zero pivot appeared and no row interchange is allowed in this mode.`; $("#ge-res").innerHTML = ""; return; }
    const err = exact ? Math.max(...R.x.map((v, i) => Math.abs(v - exact[i]))) / Math.max(...exact.map(Math.abs)) : NaN;
    const A = S.M.map(r => r.slice(0, n).map(Number)), b = S.M.map(r => Number(r[n])), res = b.map((bi, i) => bi - dot(A[i], R.x));
    $("#ge-res").innerHTML = kv([["computed x", `(${R.x.map(v => tdig(v, t)).join(", ")})`, "amb"], ["exact x", exact ? `(${exact.map(v => tdig(v, 0)).join(", ")})` : "—"],
      ["relative error ‖x − x̂‖∞/‖x‖∞", sci(err)], ["largest |multiplier|", tdig(R.maxm, 4)], ["residual ‖b − Ax̂‖∞", sci(Math.max(...res.map(Math.abs)))]]);
    st.className = "status " + (err < 10 ** (1 - (t || 15)) * 50 ? "ok" : err > 0.05 ? "bad" : "inf");
    st.innerHTML = err > 0.05 ? `<span class="k">The computed solution is badly wrong</span>${R.maxm > 1 ? "Large multipliers amplified the rounding errors: try partial pivoting." : "The multipliers are small, so the arithmetic was done carefully; the problem itself is ill conditioned (see Section 7.4)."}`
      : `<span class="k">Accurate to about ${Math.max(0, Math.floor(-Math.log10(err || 1e-17)))} digits</span>${S.piv === "none" ? "No pivoting was needed here." : "With pivoting every multiplier has |m| ≤ 1."}`;
  }
  HOOK.ge = k => { load(k); goto("#lab-ge"); };
  load(0);
})();

/* =========================================================
   LAB · Condition numbers
   ========================================================= */
(function condLab() {
  const PRE = [["Example 7.4.2", [["2", "2"], ["2", "2.0005"]], ["6", "6.001"]], ["Example 7.4.3", [["3", "3"], ["4", "5"]], ["6", "9"]], ["Ex 7.3.7", [["0.6", "2000"], ["0.3076", "-0.401"]], ["2003", "1.137"]], ["well conditioned", [["2", "-1"], ["1", "2"]], ["3", "4"]], ["rotation", [["0", "-1"], ["1", "0"]], ["1", "2"]]];
  const S = { A: null, b: null, d: 0, k: 0 };
  const svg = $("#cd-svg"), ds = $("#cd-d");
  ds.oninput = () => { S.d = +ds.value; draw(); };
  const mark = presetRow($("#cd-presets"), PRE, k => { S.k = k; S.A = PRE[k][1].map(r => r.slice()); S.b = PRE[k][2].map(v => [v]); S.d = k === 0 ? 0.17 : 0.3; build(); });
  function build() { mark(S.k); strGrid($("#cd-A"), S.A, { label: "A", onChange: () => { S.k = -1; mark(-1); draw(); } }); strGrid($("#cd-b"), S.b, { label: "b", onChange: () => { S.k = -1; mark(-1); draw(); } }); draw(); }
  function draw() {
    ds.value = S.d;
    const A = S.A.map(r => r.map(Number)), b = S.b.map(r => Number(r[0])), st = $("#cd-status"), bI = Math.max(...b.map(Math.abs)) || 1, delta = S.d * 0.002 * bI;
    $("#cd-do").textContent = sci(delta, 2);
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    if (Math.abs(det) < 1e-14) { st.className = "status bad"; st.innerHTML = `<span class="k">Singular</span>The lines are parallel: cond(A) = ∞.`; $("#cd-tab").innerHTML = ""; svg.innerHTML = ""; return; }
    const Ai = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]], x = fapp(Ai, b), bt = [b[0], b[1] + delta], xt = fapp(Ai, bt);
    const cI = normI(A) * normI(Ai), [s1, s2] = svd2s(A), c2 = s1 / s2, relb = Math.abs(delta) / bI, relx = Math.max(...x.map((v, i) => Math.abs(v - xt[i]))) / (Math.max(...x.map(Math.abs)) || 1);
    const R = Math.max(2.5, 1.4 * Math.max(...x.map((v, i) => Math.abs(v - xt[i]))) + 1), sc = 420 / (2 * R);
    const P = plane2D(svg, { sc, cx: 210 - x[0] * sc, cy: 210 + x[1] * sc, R });
    const line = (a1, a2, c, cls, dash) => { const nn = a1 * a1 + a2 * a2; P.lineThrough(P.layers.under, [a1 * c / nn, a2 * c / nn], [-a2, a1], { style: `stroke:var(--${cls})`, "stroke-width": 2.5, "stroke-dasharray": dash || "" }); };
    line(A[0][0], A[0][1], b[0], "c1"); line(A[1][0], A[1][1], b[1], "c2"); if (delta) line(A[1][0], A[1][1], bt[1], "c2", "6 5");
    el("circle", { cx: P.X(x[0]), cy: P.Y(x[1]), r: 6, style: "fill:var(--ink)" }, P.layers.top);
    el("circle", { cx: P.X(xt[0]), cy: P.Y(xt[1]), r: 6, style: "fill:var(--pivot)" }, P.layers.top);
    P.text(P.layers.top, [xt[0] + 0.1 * R / 3, xt[1] + 0.15 * R / 3], "x̃", { style: "fill:var(--pivot)", "font-weight": 700, "font-size": 15 });
    $("#cd-tab").innerHTML = kv([["‖A‖₁, ‖A‖∞, ‖A‖₂, ‖A‖_F", `${sci(norm1(A))}, ${sci(normI(A))}, ${sci(s1)}, ${sci(normF(A))}`], ["cond∞(A) = ‖A‖∞‖A⁻¹‖∞", sci(cI), "amb"], ["cond₂(A) = σ₁/σ₂", sci(c2)],
      ["x, x̃ (b₂ changed by δ)", `(${x.map(v => sci(v)).join(", ")}), (${xt.map(v => sci(v)).join(", ")})`], ["relative change in b (∞)", sci(relb)], ["relative change in x (∞)", sci(relx)], ["bound cond∞ · ‖Δb‖/‖b‖", sci(cI * relb)]]);
    st.className = "status " + (cI > 1e3 ? "bad" : "ok");
    st.innerHTML = `<span class="k math">‖Δx‖/‖x‖ = ${sci(relx)} ≤ ${sci(cI * relb)} = cond · ‖Δb‖/‖b‖</span>${cI > 1e3 ? "Ill conditioned: the lines are nearly parallel, so a tiny shift of one line moves the intersection far." : "Well conditioned: the lines cross at a healthy angle."} About log₁₀ cond ≈ ${fmt(Math.log10(cI), 1)} digits can be lost.`;
  }
  // Hilbert table
  const rows = [];
  for (let n = 2; n <= 12; n++) {
    const H = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => 1 / (i + j + 1))), Hi = finv(H), b = H.map(r => r.reduce((s, v) => s + v, 0)), x = gsolve(H, b);
    const c = normI(H) * normI(Hi), e = Math.max(...x.map(v => Math.abs(v - 1)));
    rows.push(`<tr><td>${n}</td><td>${c.toExponential(2)}</td><td>${fmt(Math.log10(c), 1)}</td><td>${e.toExponential(2)}</td></tr>`);
  }
  $("#cd-hilb").innerHTML = `<tr><th>n</th><th>cond∞(Hₙ) (computed)</th><th>digits at risk</th><th>error in x (exact x = 1)</th></tr>` + rows.join("");
  HOOK.cond = k => { mark(k); S.k = k; S.A = PRE[k][1].map(r => r.slice()); S.b = PRE[k][2].map(v => [v]); S.d = 0.17; build(); goto("#lab-cond"); };
  S.A = PRE[0][1].map(r => r.slice()); S.b = PRE[0][2].map(v => [v]); S.d = 0.17; build();
})();

/* =========================================================
   LAB · Householder and Givens
   ========================================================= */
(function hhLab() {
  const MODES = ["Householder, α = ‖x‖ (Leon)", "Householder, α = −sign(x₁)‖x‖", "Givens rotation"];
  const S = { x: [3, 4], mode: 0, xn: [4, 4, 2].map(String), k: 1, pk: 0 };
  const P = plane2D($("#hh-svg"), { R: 6.2 });
  const D = draggable(P, () => [S.x], (i, p) => { S.x = p; draw(); }, { lim: 6, snap: 0.25 });
  const markM = presetRow($("#hh-mode"), MODES.map(m => [m]), k => { S.mode = k; draw(); });
  function draw() {
    markM(S.mode); P.clear();
    const x = S.x, r = nrm(x), st = $("#hh-status");
    P.arrow(P.layers.mid, [0, 0], x, "c1", 3.5); D.draw(["x"], ["f1"]);
    if (r < 1e-12) { $("#hh-expr").innerHTML = ""; st.innerHTML = "x = 0: nothing to do."; return; }
    if (S.mode < 2) {
      const a = S.mode === 0 ? r : -(x[0] >= 0 ? 1 : -1) * r, v = [x[0] - a, x[1]], beta = a * (a - x[0]);
      if (nrm(v) < 1e-12) { $("#hh-expr").innerHTML = `<span class="op">x is already a multiple of e₁: H = I</span>`; st.className = "status ok"; st.innerHTML = "Nothing to zero."; return; }
      const H = [[1 - v[0] * v[0] / beta, -v[0] * v[1] / beta], [-v[1] * v[0] / beta, 1 - v[1] * v[1] / beta]];
      P.lineThrough(P.layers.under, [0, 0], [-v[1], v[0]], { style: "stroke:var(--c3)", "stroke-dasharray": "7 5", "stroke-width": 2 });
      P.arrow(P.layers.mid, [a, 0], x, "amb", 2.5);
      P.arrow(P.layers.top, [0, 0], [a, 0], "c2", 4);
      el("line", { x1: P.X(x[0]), y1: P.Y(x[1]), x2: P.X(a), y2: P.Y(0), style: "stroke:var(--muted)", "stroke-dasharray": "3 3" }, P.layers.under);
      P.text(P.layers.top, [a + 0.15, -0.45], "Hx", { class: "f2", "font-weight": 700 });
      $("#hh-expr").innerHTML = `<span class="op">α = ${nice(a)}, v = x − αe₁ = (${v.map(nice).join(", ")}), β = α(α − x₁) = ${nice(beta)}</span>` + `<span class="op">H = I − vvᵀ/β =</span>` + lbl(niceM(H), "H = Hᵀ = H⁻¹") + `<span class="op">Hx = (${nice(a)}, 0)</span>`;
      st.className = "status ok";
      st.innerHTML = `<span class="k">Reflection across the dashed mirror ⟂ v</span>${S.mode === 0 ? `Leon's choice α = ‖x‖. When x is close to the positive x₁-axis, v = x − ‖x‖e₁ is tiny and computing it loses digits; ` : "Choosing α with the sign opposite to x₁ makes v = x − αe₁ long, avoiding cancellation; this is what libraries do. "}det H = −1.`;
    } else {
      const c = x[0] / r, s = x[1] / r, G = [[c, s], [-s, c]];
      const a0 = Math.atan2(x[1], x[0]), pts = []; for (let k = 0; k <= 30; k++) { const a = a0 * (1 - k / 30); pts.push(`${P.X(r * 0.6 * Math.cos(a))},${P.Y(r * 0.6 * Math.sin(a))}`); }
      el("polyline", { points: pts.join(" "), fill: "none", style: "stroke:var(--pivot)", "stroke-width": 2 }, P.layers.under);
      P.arrow(P.layers.top, [0, 0], [r, 0], "c2", 4); P.text(P.layers.top, [r + 0.15, -0.45], "Gx", { class: "f2", "font-weight": 700 });
      $("#hh-expr").innerHTML = `<span class="op">cos θ = x₁/‖x‖ = ${nice(c)}, sin θ = x₂/‖x‖ = ${nice(s)}</span>` + lbl(niceM(G), "G (rotation by −θ)") + `<span class="op">Gx = (${nice(r)}, 0)</span>`;
      st.className = "status ok"; st.innerHTML = `<span class="k">Rotation, det G = +1</span>A Givens rotation acts on two coordinates at a time; in ℝⁿ it zeroes one chosen entry (Examples 7.5.3, 7.5.4).`;
    }
  }
  // n-dimensional Householder
  const PRE = [["Example 1: (4, 4, 2), k = 1", [4, 4, 2], 1], ["Example 2: (3, 4, 4, 2), k = 2", [3, 4, 4, 2], 2], ["(1, 2, 2), k = 1", [1, 2, 2], 1], ["(2, 1, 2, 4), k = 1", [2, 1, 2, 4], 1]];
  const markP = presetRow($("#hh-presets"), PRE, k => { S.pk = k; S.xn = PRE[k][1].map(String); S.k = PRE[k][2]; buildN(); });
  function buildN() {
    markP(S.pk);
    const host = $("#hh-xin"); host.innerHTML = S.xn.map((v, i) => `<input class="mi" style="width:52px" data-i="${i}" value="${v}" aria-label="x${i + 1}">`).join("");
    host.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => { if (isFinite(Number(inp.value))) { S.xn[+inp.dataset.i] = inp.value; S.pk = -1; markP(-1); calcN(); } }));
    chipRow($("#hh-k"), [...Array(S.xn.length - 1).keys()].map(i => i + 1), S.k, v => { S.k = v; calcN(); });
    calcN();
  }
  function calcN() {
    const x = S.xn.map(Number), n = x.length, k = S.k - 1, sub = x.slice(k), a = nrm(sub), v = sub.map((t, i) => i ? t : t - a), beta = a * (a - sub[0]);
    const H = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0) - (i >= k && j >= k && beta > 1e-14 ? v[i - k] * v[j - k] / beta : 0)));
    $("#hh-n").innerHTML = lbl(niceM(H), `H (acts on entries ${k + 1}…${n})`) + `<span class="op">Hx =</span>` + lbl(niceM(fapp(H, x).map(t => [t])), "Hx");
  }
  draw(); buildN();
})();

/* =========================================================
   LAB · Power method and QR algorithm
   ========================================================= */
(function powLab() {
  const PRE = [["Example 7.6.1", [[2, 1], [1, 2]], [2, 1]], ["slow: |λ₂/λ₁| = 0.93", [[3, 1], [0, 2.8]], [0, 1]], ["3 × 3 symmetric", [[2, -1, 0], [-1, 2, -1], [0, -1, 2]], [1, 0, 0]], ["Markov", [[0.7, 0.2], [0.3, 0.8]], [1, 0]], ["complex λ: fails", [[0, -1], [1, 0]], [1, 0]]];
  const S = { A: null, u0: null, hist: [], k: 0, qk: 1, timer: null };
  const P = plane2D($("#pw-svg"), { R: 1.6 });
  const mark = presetRow($("#pw-presets"), PRE, k => load(k));
  $("#pw-step").onclick = () => { step(); draw(); };
  $("#pw-run").onclick = () => { if (S.timer) clearInterval(S.timer); let c = 0; S.timer = setInterval(() => { step(); draw(); if (++c >= 10) { clearInterval(S.timer); S.timer = null; } }, 180); };
  $("#pw-reset").onclick = () => { reset(); draw(); };
  const ks = $("#pw-k"); ks.oninput = () => { S.qk = +ks.value; qr(); };
  function load(k) { S.k = k; S.A = PRE[k][1].map(r => r.map(String)); S.u0 = PRE[k][2].map(v => [String(v)]); build(); }
  function build() {
    mark(S.k);
    const ch = () => { S.k = -1; mark(-1); reset(); draw(); qr(); };
    strGridLocal($("#pw-A"), S.A, "A", ch); strGridLocal($("#pw-u"), S.u0, "u₀", ch);
    reset(); draw(); qr();
  }
  function strGridLocal(host, vals, label, onChange) {
    let h = `<div class="mat gridin"><table>`; vals.forEach((row, i) => { h += `<tr>${row.map((v, j) => `<td class="inp"><input class="mi" style="width:58px" data-i="${i}" data-j="${j}" value="${v}" aria-label="${label} ${i + 1},${j + 1}"></td>`).join("")}</tr>`; });
    host.innerHTML = lbl(h + `</table></div>`, label);
    host.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => { if (inp.value.trim() !== "" && isFinite(Number(inp.value))) { vals[+inp.dataset.i][+inp.dataset.j] = inp.value; onChange(); } }));
  }
  const Af = () => S.A.map(r => r.map(Number));
  function reset() { if (S.timer) { clearInterval(S.timer); S.timer = null; } S.hist = [{ u: S.u0.map(r => Number(r[0])), s: NaN }]; }
  function step() { const u = S.hist[S.hist.length - 1].u, v = fapp(Af(), u); let m = 0; v.forEach(t => { if (Math.abs(t) > Math.abs(m)) m = t; }); if (m === 0) return; S.hist.push({ u: v.map(t => t / m), s: m }); }
  function qrStep(A) { // modified Gram–Schmidt
    const n = A.length, V = fT(A), Qc = [], R = Array.from({ length: n }, () => Array(n).fill(0));
    for (let j = 0; j < n; j++) { let v = V[j].slice(); for (let i = 0; i < j; i++) { R[i][j] = dot(Qc[i], v); v = v.map((t, l) => t - R[i][j] * Qc[i][l]); } R[j][j] = nrm(v); Qc.push(R[j][j] > 1e-300 ? v.map(t => t / R[j][j]) : v); }
    return fmul(R, fT(Qc));
  }
  function qr() {
    $("#pw-ko").textContent = S.qk;
    let A = Af(); for (let k = 1; k < S.qk; k++) A = qrStep(A);
    const sub = Math.max(...A.flatMap((r, i) => r.filter((_, j) => j < i).map(Math.abs)), 0);
    $("#pw-qr").innerHTML = lbl(matHTML(A, { render: v => Math.abs(v) < 5e-5 ? "0.0000" : fmt(v, 4), cellClass: (i, j) => i === j ? "hl3" : (j < i ? "hl2" : "") }), `A${S_(S.qk)}`) + `<span class="op">largest entry below the diagonal: ${sub.toExponential(2)}</span>`;
  }
  function draw() {
    const A = Af(), n = A.length, h = S.hist, last = h[h.length - 1];
    let lam1 = NaN, ratio = NaN, vec1 = null;
    if (n === 2) { const tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] * A[1][0], D = tr * tr / 4 - det; if (D >= 0) { const ls = [tr / 2 + Math.sqrt(D), tr / 2 - Math.sqrt(D)].sort((a, b) => Math.abs(b) - Math.abs(a)); lam1 = ls[0]; ratio = Math.abs(ls[1] / ls[0]); const a = A[0][0] - lam1, b = A[0][1]; vec1 = Math.hypot(a, b) > 1e-12 ? [-b, a] : [A[1][1] - lam1, -A[1][0]]; if (nrm(vec1) < 1e-12) vec1 = [1, 0]; } }
    else { let B = A; for (let k = 0; k < 200; k++) B = qrStep(B); const ev = B.map((r, i) => r[i]).sort((a, b) => Math.abs(b) - Math.abs(a)); lam1 = ev[0]; ratio = Math.abs(ev[1] / ev[0]); }
    $("#pw-svg").style.display = n === 2 ? "" : "none";
    if (n === 2) {
      P.clear();
      if (vec1) P.lineThrough(P.layers.under, [0, 0], vec1, { style: "stroke:var(--pivot)", "stroke-dasharray": "6 5", "stroke-width": 2 });
      h.forEach((it, i) => { const u = it.u, L = nrm(u); if (L < 1e-12) return; P.arrow(P.layers.mid, [0, 0], scl(1.3 / L, u), i === h.length - 1 ? "c1" : "ink", i === h.length - 1 ? 3.5 : 1.5, { "stroke-opacity": i === h.length - 1 ? 1 : 0.15 + 0.6 * i / h.length }); });
    }
    $("#pw-tab").innerHTML = `<tr><th>k</th><th>u_k</th><th>scale</th></tr>` + h.slice(-8).map((it, i) => `<tr><td>${h.length - Math.min(8, h.length) + i}</td><td>(${it.u.map(t => fmt(t, 5)).join(", ")})</td><td>${isNaN(it.s) ? "—" : fmt(it.s, 6)}</td></tr>`).join("");
    const st = $("#pw-status");
    if (isNaN(lam1)) { st.className = "status bad"; st.innerHTML = `<span class="k">No dominant real eigenvalue</span>The eigenvalues are complex with equal modulus: the iterates keep rotating and never settle.`; return; }
    const errs = isNaN(last.s) ? NaN : Math.abs(last.s - lam1);
    st.className = "status " + (errs < 1e-6 ? "ok" : "inf");
    st.innerHTML = `<span class="k math">λ₁ = ${fmt(lam1, 6)}, |λ₂/λ₁| = ${fmt(ratio, 4)}</span>After ${h.length - 1} step${h.length === 2 ? "" : "s"} the scale is ${isNaN(last.s) ? "—" : fmt(last.s, 6)} (error ${isNaN(errs) ? "—" : errs.toExponential(1)}). Each step multiplies the error by about ${fmt(ratio, 3)}${ratio > 0.9 ? ": slow" : ""}.`;
  }
  load(0);
})();

/* =========================================================
   Definitions
   ========================================================= */
renderDefinitions([
  { sec: "s71", id: "def-fp", term: "Floating-point number; machine epsilon", ref: "§7.1 · Definitions", scene: "FloatingPointLine", lab: ["#lab-fp", "Open the floating-point explorer"],
    html: `A <b>floating-point number</b> in base <i>b</i> is ±(<i>d</i>${S_(1)}/<i>b</i> + <i>d</i>${S_(2)}/<i>b</i><sup>2</sup> + ⋯ + <i>d</i>${S_("t")}/<i>b</i><sup><i>t</i></sup>) × <i>b</i><sup><i>e</i></sup> with integers 0 ≤ <i>d</i>${S_("i")} ≤ <i>b</i> − 1 and <i>L</i> ≤ <i>e</i> ≤ <i>U</i>; it is <b>normalized</b> if <i>d</i>${S_(1)} ≠ 0. If <i>x</i>′ = <i>fl</i>(<i>x</i>) approximates <i>x</i>, then <i>x</i>′ − <i>x</i> is the <b>absolute error</b> and (<i>x</i>′ − <i>x</i>)/<i>x</i> = δ the <b>relative error</b>. The <b>machine epsilon</b> ε is the smallest floating-point number with <i>fl</i>(1 + ε) &gt; 1; |δ| ≤ ε, and for <i>t</i>-digit rounding ε = ½<i>b</i><sup>1−<i>t</i></sup>. Arithmetic satisfies <i>fl</i>(<i>a</i> ∘ <i>b</i>) = (<i>a</i> ∘ <i>b</i>)(1 + δ).` },
  { sec: "s72", id: "def-lu", term: "Gaussian elimination; LU factorization; cost", ref: "§7.2 · Algorithms 7.2.1, 7.2.2", lab: ["#lab-cost", "Time it"],
    html: `Elimination without interchanges computes multipliers <i>m</i>${S_("ki")} = <i>a</i>${S_("ki")}/<i>a</i>${S_("ii")} and yields <i>A</i> = <i>LU</i>, <i>L</i> unit lower triangular (entries <i>m</i>${S_("ki")}), <i>U</i> upper triangular. Solving <i>A</i><b>x</b> = <b>b</b>: forward substitution <i>L</i><b>y</b> = <b>b</b>, back substitution <i>U</i><b>x</b> = <b>y</b>. The factorization requires (<i>n</i><sup>3</sup> − <i>n</i>)/3 multiplications/divisions and about <i>n</i><sup>3</sup>/3 additions; each triangular solve pair about <i>n</i><sup>2</sup>.` },
  { sec: "s73", id: "def-piv", term: "Partial pivoting; PA = LU", ref: "§7.3 · Algorithm 7.3.1", scene: "PartialPivoting", lab: ["#lab-ge", "Eliminate with t digits"],
    html: `<b>Partial pivoting:</b> at step <i>i</i>, choose as pivot the candidate <i>a</i>${S_("ki")}, <i>k</i> ≥ <i>i</i>, of largest absolute value and interchange rows; then every multiplier satisfies |<i>m</i>${S_("ki")}| ≤ 1. Recording the interchanges in a permutation matrix <i>P</i> gives <i>PA</i> = <i>LU</i>. <b>Complete pivoting</b> chooses the largest entry of the whole remaining submatrix, interchanging rows and columns: <i>PAQ</i> = <i>LU</i>.` },
  { sec: "s74", id: "def-cond", term: "Matrix norm; condition number", ref: "§7.4 · Definitions, Theorems 7.4.1–7.4.3", scene: "ConditionNumber", lab: ["#lab-cond", "Perturb a system"],
    html: `The matrix norm subordinate to a vector norm is ‖<i>A</i>‖ = max<sub><b>x</b>≠<b>0</b></sub> ‖<i>A</i><b>x</b>‖/‖<b>x</b>‖: ‖<i>A</i>‖${S_(1)} = largest column sum and ‖<i>A</i>‖<sub>∞</sub> = largest row sum of |<i>a</i>${S_("ij")}|, ‖<i>A</i>‖${S_(2)} = σ${S_(1)}; the Frobenius norm is (Σ<i>a</i>${S_("ij")}<sup>2</sup>)<sup>1/2</sup>. <i>A</i> is <b>ill conditioned</b> if small relative changes in its entries can cause large relative changes in the solution of <i>A</i><b>x</b> = <b>b</b>. The <b>condition number</b> cond(<i>A</i>) = ‖<i>A</i>‖‖<i>A</i><sup>−1</sup>‖ ≥ 1 measures this; cond${S_(2)}(<i>A</i>) = σ${S_(1)}/σ${S_("n")}.` },
  { sec: "s75", id: "def-hh", term: "Householder transformation; Givens rotation", ref: "§7.5", scene: "Householder", lab: ["#lab-hh", "Reflect or rotate"],
    html: `A <b>Householder transformation</b> is <i>H</i> = <i>I</i> − (1/β)<b>v</b><b>v</b><sup>T</sup> with β = ½‖<b>v</b>‖<sup>2</sup>; it is symmetric and orthogonal (<i>H</i><sup>−1</sup> = <i>H</i>). With α = ‖<b>x</b>‖, <b>v</b> = <b>x</b> − α<b>e</b>${S_(1)} and β = α(α − <i>x</i>${S_(1)}), <i>H</i><b>x</b> = α<b>e</b>${S_(1)}. A <b>Givens rotation</b> is the identity except for a 2 × 2 block (cos θ, sin θ; −sin θ, cos θ) in rows and columns <i>i</i>, <i>j</i>, chosen to zero one entry. Both are orthogonal, so they do not amplify rounding errors.` },
  { sec: "s76", id: "def-pow", term: "Power method; QR algorithm", ref: "§7.6 · Theorem 7.6.1", scene: "PowerMethod", lab: ["#lab-pow", "Iterate in the lab"],
    html: `<b>Power method:</b> start with <b>u</b>${S_(0)} and set <b>v</b>${S_("k+1")} = <i>A</i><b>u</b>${S_("k")}, <b>u</b>${S_("k+1")} = <b>v</b>${S_("k+1")}/β${S_("k+1")} with β the entry of largest absolute value. If <i>A</i> has a dominant eigenvalue λ${S_(1)} (|λ${S_(1)}| &gt; |λ${S_("i")}| for <i>i</i> &gt; 1), then <b>u</b>${S_("k")} converges to an eigenvector and β${S_("k")} → λ${S_(1)}. <b>QR algorithm:</b> <i>A</i>${S_(1)} = <i>A</i>; factor <i>A</i>${S_("k")} = <i>Q</i>${S_("k")}<i>R</i>${S_("k")}, set <i>A</i>${S_("k+1")} = <i>R</i>${S_("k")}<i>Q</i>${S_("k")} = <i>Q</i>${S_("k")}<sup>T</sup><i>A</i>${S_("k")}<i>Q</i>${S_("k")}; all <i>A</i>${S_("k")} are similar to <i>A</i>, and under mild conditions they converge to upper triangular form with the eigenvalues on the diagonal.` },
], { s71: "7.1", s72: "7.2", s73: "7.3", s74: "7.4", s75: "7.5", s76: "7.6" });

/* =========================================================
   Exercises
   ========================================================= */
const TF = ["True", "False"];
buildExercises("s71", "Exercises · §7.1", "From the Section 7.1 exercises (p. 390–391).", [
  fl("7.1 · Ex 1", "Three-digit decimal floating-point values fl(x) of (a) 2312, (b) 32.56, (c) 0.01277, (d) 82,431.", [num("(a)", 2310), num("(b)", "32.6"), num("(c)", "0.0128"), num("(d)", 82400)],
    "(a) 0.231 × 10⁴, (b) 0.326 × 10², (c) 0.128 × 10⁻¹, (d) 0.824 × 10⁵. Absolute errors (Ex 2): −2, 0.04, 0.00003, −31.", { wide: true }),
  fl("7.1 · Ex 3", "Five-digit base-2 floating-point values of (a) 21, (b) 38, (c) 9.872, (d) −0.1. Fractions are fine.", [num("(a)", 21), num("(b)", 38), num("(c)", 10), num("(d)", "-13/128")],
    "(a) (0.10101)₂ × 2⁵ exactly. (b) 38 = (100110)₂ = (0.10011)₂ × 2⁶ exactly. (c) 9.872 = (1001.1101…)₂ rounds to (0.10100)₂ × 2⁴ = 10. (d) 0.1 = (0.000110011…)₂ rounds to (0.11010)₂ × 2⁻³ = 13/128.", { wide: true }),
  fl("7.1 · Ex 4", "Four-digit decimal arithmetic: (a) 10,420 + 0.0018, (b) 10,424 − 10,416, (c) 0.12347 − 0.12342, (d) 3626.6 × 22.656. Enter the computed results.", [num("(a)", 10420), num("(b)", 0), num("(c)", "0.0001"), num("(d)", 82190)],
    "(a) The small term vanishes. (b) Both round to 10,420: computed 0 instead of 8 (relative error 1). (c) 0.1235 − 0.1234 = 0.0001 instead of 0.00005 (relative error 1). (d) 3627 × 22.66 = 82,187.82 → 82,190; exact 82,164.24…", { wide: true, actions: [{ label: "Try them in the arithmetic lab", run: () => goto("#lab-arith") }] }),
  fl("7.1 · Ex 5", "x₁ = 94,210, x₂ = 8631, x₃ = 1440, x₄ = 133, x₅ = 34 in four-digit arithmetic: (a) (((x₁ + x₂) + x₃) + x₄) + x₅, (b) x₁ + ((x₂ + x₃) + (x₄ + x₅)), (c) (((x₅ + x₄) + x₃) + x₂) + x₁. (Ties round up.)",
    [num("(a)", 104300), num("(b)", 104500), num("(c)", 104500)], "The exact sum is 104,448. Adding the large number first loses the small ones one at a time; adding the small numbers first lets them accumulate.",
    { wide: true, check: vals => { const v = vals.map(m => toF(m[0][0])), ok = v[0] === 104300 && [104400, 104500].includes(v[1]) && [104400, 104500].includes(v[2]); return ok ? { ok: true, msg: "Correct. Order matters in floating-point addition." } : { ok: false, msg: "Round after every addition to 4 significant digits." }; } }),
  fl("7.1 · Example 5", "c = 3.4215298, d = 3.4213851 in six-digit arithmetic: compute fl(c − d) and fl(1/(c − d)).", [num("fl(c − d)", "0.00014"), num("fl(1/(c − d))", "7142.86")],
    "fl(c) = 3.42153, fl(d) = 3.42139, difference 0.000140 (true 0.0001447: relative error 3 × 10⁻²), and 1/0.00014 = 7142.857… → 7142.86 (true 6910.85)."),
  fl("7.1 · Ex 8, Example 3", "How many floating-point numbers (including 0) are there with (Example 3) b = 10, t = 1, L = −1, U = 1 and (Ex 8) b = 2, t = 2, L = −2, U = 2?", [num("Example 3", 55), num("Ex 8", 21)],
    "Count = 2(b − 1)b^(t−1)(U − L + 1) + 1: sign × first digit × other digits × exponents, plus zero.", { actions: [{ label: "Draw them", run: () => goto("#lab-fp") }] }),
  ch("7.1 · Ex 6", "Machine epsilon of 16-digit base-10 floating-point arithmetic (with rounding):", ["5 × 10⁻¹⁶", "10⁻¹⁶", "10⁻¹⁵", "2⁻⁵²"], 0, "ε = ½ b^(1−t) = ½ × 10⁻¹⁵."),
  ch("7.1 · Ex 7", "Machine epsilon of 36-digit base-2 arithmetic (with rounding):", ["2⁻³⁶", "2⁻³⁵", "2⁻³⁷", "10⁻³⁶"], 0, "ε = ½ × 2^(1−36) = 2⁻³⁶."),
]);

buildExercises("s72", "Exercises · §7.2", "From the Section 7.2 exercises (p. 397).", [
  fl("7.2 · Ex 1", `Factor A = ${sm([[1, 1, 1], [2, 4, 1], [-3, 1, -2]])} into LU with L unit lower triangular.`, (() => { const r = qm.lu(qm.of([[1, 1, 1], [2, 4, 1], [-3, 1, -2]])); return [mat("L", r.L), mat("U", r.U)]; })(),
    "m₂₁ = 2, m₃₁ = −3, then m₃₂ = 2: U = (1 1 1; 0 2 −1; 0 0 3).", { wide: true }),
  ch("7.2 · Cost", "Solving one n × n system by elimination takes about T seconds. About how long for 2n × 2n?", ["8T", "4T", "2T", "16T"], 0, "The work grows like n³/3."),
  ch("7.2 · Several right-hand sides", "You must solve Ax = bᵢ for 100 vectors bᵢ with n = 1000. The best plan:", ["factor A = LU once, then 100 pairs of triangular solves", "eliminate on (A | bᵢ) 100 times", "compute A⁻¹ and multiply 100 times"], 0,
    "Factoring costs about n³/3; each triangular solve pair about n². Computing A⁻¹ costs about n³ and is less accurate."),
]);

const plu = A => { // partial-pivoting PA = LU check helper
  return ([P, L, U]) => {
    const n = A.length, isPerm = P.every(r => r.filter(v => v.one).length === 1 && r.every(v => v.zero || v.one)) && qm.T(P).every(r => r.filter(v => v.one).length === 1);
    if (!isPerm) return { ok: false, msg: "P must be a permutation matrix." };
    if (!L.every((r, i) => r.every((v, j) => (j > i ? v.zero : j === i ? v.one : true)))) return { ok: false, msg: "L must be unit lower triangular." };
    if (!U.every((r, i) => r.every((v, j) => j >= i || v.zero))) return { ok: false, msg: "U must be upper triangular." };
    if (!qm.eq(qm.mul(P, qm.of(A)), qm.mul(L, U))) return { ok: false, msg: "PA ≠ LU." };
    return L.every(r => r.every(v => Math.abs(v.n / v.d) <= 1)) ? { ok: true, msg: "Correct, and every multiplier has |m| ≤ 1." } : { ok: false, msg: "PA = LU holds, but some multiplier exceeds 1: that is not partial pivoting." };
  };
};
function pluAns(A0) {
  const A = qm.of(A0), n = A.length, M = A.map(r => r.slice()), perm = [...Array(n).keys()], L = qm.I(n).map(r => r.slice());
  for (let i = 0; i < n; i++) {
    let p = i; for (let k = i + 1; k < n; k++) if (Math.abs(toF(M[k][i])) > Math.abs(toF(M[p][i]))) p = k;
    [M[i], M[p]] = [M[p], M[i]]; [perm[i], perm[p]] = [perm[p], perm[i]]; for (let j = 0; j < i; j++) [L[i][j], L[p][j]] = [L[p][j], L[i][j]];
    for (let k = i + 1; k < n; k++) { const m = M[k][i].div(M[i][i]); L[k][i] = m; M[k] = M[k].map((v, j) => v.sub(m.mul(M[i][j]))); }
  }
  return [perm.map(pi => Array.from({ length: n }, (_, j) => new Q(j === pi ? 1 : 0))), L, M];
}
const A73 = [[1, 8, 6], [-1, -4, 5], [2, 4, -6]];
buildExercises("s73", "Exercises · §7.3", "From the Section 7.3 examples and exercises (p. 402–403).", [
  fl("7.3 · Example 7.3.3", "0.0001x₁ + 2x₂ = 4, x₁ + x₂ = 3 in three-digit arithmetic. What x₁ does elimination compute (a) without interchanges, (b) with partial pivoting?", [num("(a) x₁", 0), num("(b) x₁", 1)],
    "(a) m = 10⁴ and 1 − 2·10⁴ rounds to −0.200 × 10⁵, losing the 1: x₂ = 2, x₁ = (4 − 4)/0.0001 = 0. (b) Swap rows: m = 0.0001, x = (1, 2).", { actions: [{ label: "Step through (a)", run: () => HOOK.ge(0) }, { label: "Step through (b)", run: () => HOOK.ge(1) }] }),
  fl("7.3 · Example 2", "6x₁ − 4x₂ + 2x₃ = −2, 4x₁ + 2x₂ + x₃ = 4, 2x₁ − x₂ + x₃ = −1.", [vec("x", qm.solve(qm.of([[6, -4, 2], [4, 2, 1], [2, -1, 1]]), [-2, 4, -1]))], "With the pivoting of Example 1, PA = LU and the solution is (1, 1, −2)ᵀ.", { actions: [{ label: "Step through it", run: () => HOOK.ge(2) }] }),
  fl("7.3 · Ex 3", `Solve Ax = b with partial pivoting, A = ${sm(A73)}, b = (8, 1, 4)ᵀ, and factor PA = LU.`, [vec("x", qm.solve(qm.of(A73), [8, 1, 4])), ...["P", "L", "U"].map((nm, i) => mat(nm, pluAns(A73)[i]))],
    "First pivot 2 (row 3), then the largest remaining entry in column 2. All multipliers have |m| ≤ 1.",
    { wide: true, check: vals => { const xs = qm.solve(qm.of(A73), [8, 1, 4]); if (!vals[0][0].every((v, i) => v.eq(xs[i]))) return { ok: false, msg: "x is not right." }; return plu(A73)(vals.slice(1)); }, actions: [{ label: "Step through it", run: () => HOOK.ge(5) }] }),
  fl("7.3 · Ex 1", `A = ${sm([[0, 3, 1], [1, 2, -2], [2, 5, 4]])}, b = (1, 7, −1)ᵀ. Solve Ax = b.`, [vec("x", qm.solve(qm.of([[0, 3, 1], [1, 2, -2], [2, 5, 4]]), [1, 7, -1]))], "a₁₁ = 0 forces an interchange; reorder rows as (2, 3, 1) or use partial pivoting."),
  ch("7.3 · Ex 7", "0.6000x₁ + 2000x₂ = 2003, 0.3076x₁ − 0.4010x₂ = 1.137 has solution (5, 1). If the computed x₂ = 1 + ε and x₁ is found from the first equation, the error in x₁ is", ["−(2000/0.6)ε ≈ −3333ε", "−ε", "ε/2000", "0"], 0,
    "x₁ = (2003 − 2000(1 + ε))/0.6 = 5 − 3333ε: the tiny pivot 0.6 magnifies the error in x₂.", { actions: [{ label: "See it in 4-digit arithmetic", run: () => HOOK.ge(4) }] }),
]);

buildExercises("s74", "Exercises · §7.4", "From the Section 7.4 examples and exercises.", [
  fl("7.4 · Example 1", `A = ${sm([[-3, 2, 4, -3], [5, -2, -3, 5], [2, 1, -6, 4], [1, 1, 1, 1]])}. Find ‖A‖₁ and ‖A‖∞.`, [num("‖A‖₁", 14), num("‖A‖∞", 15)], "‖A‖₁: largest column sum of absolute values (column 3: 4 + 3 + 6 + 1). ‖A‖∞: largest row sum (row 2: 5 + 2 + 3 + 5)."),
  fl("7.4 · Example 3, 4", "A = (3 3; 4 5), b = (6, 9)ᵀ, computed x′ = (2.0, 0.1)ᵀ. Find cond∞(A), the residual r = b − Ax′, the relative residual ‖r‖∞/‖b‖∞, and the resulting upper bound for ‖x − x′‖∞/‖x‖∞.",
    [num("cond∞(A)", 24), vec("r", ["-0.3", "0.5"]), num("‖r‖∞/‖b‖∞", "1/18"), num("bound", "4/3")],
    "A⁻¹ = ⅓(5 −3; −4 3): ‖A‖∞ = 9, ‖A⁻¹‖∞ = 8/3. The bound is 24 · 1/18 = 4/3: the computed solution could be entirely wrong (indeed x = (1, 1)ᵀ).", { wide: true, actions: [{ label: "Open in the lab", run: () => HOOK.cond(1) }] }),
  fl("7.4 · Hilbert H₃", "H₃ = (1 ½ ⅓; ½ ⅓ ¼; ⅓ ¼ ⅕) has H₃⁻¹ = (9 −36 30; −36 192 −180; 30 −180 180). Find ‖H₃‖∞, ‖H₃⁻¹‖∞ and cond∞(H₃).", [num("‖H₃‖∞", "11/6"), num("‖H₃⁻¹‖∞", 408), num("cond∞", 748)], "Row sums: 1 + ½ + ⅓ = 11/6; 36 + 192 + 180 = 408; product 748."),
  cl("7.4 · Facts", "True or false?", TF, [
    { tag: "+", html: "cond(A) ≥ 1 for every nonsingular A.", ans: 0, why: "1 = ‖I‖ = ‖AA⁻¹‖ ≤ ‖A‖‖A⁻¹‖." },
    { tag: "+", html: "A small residual guarantees an accurate solution.", ans: 1, why: "Only if cond(A) is small: the relative error can be cond(A) times the relative residual (Example 7.4.4)." },
    { tag: "+", html: "A matrix with a tiny determinant must be ill conditioned.", ans: 1, why: "10⁻³I (n = 10) has det 10⁻³⁰ but cond = 1." },
    { tag: "7.4.3", html: "cond₂(A) = σ₁/σₙ.", ans: 0, why: "‖A‖₂ = σ₁ and ‖A⁻¹‖₂ = 1/σₙ." },
    { tag: "7.7", html: "Solving least squares by the normal equations squares the condition number.", ans: 0, why: "cond₂(AᵀA) = cond₂(A)²; QR avoids this." },
  ], { wide: true }),
]);

buildExercises("s75", "Exercises · §7.5", "From the Section 7.5 examples.", [
  fl("7.5 · Example 1", "Householder matrix H that zeroes the last two entries of x = (4, 4, 2)ᵀ (α = ‖x‖ = 6), and Hx.", [mat("H", [["2/3", "2/3", "1/3"], ["2/3", "-1/3", "-2/3"], ["1/3", "-2/3", "2/3"]]), vec("Hx", [6, 0, 0])],
    "v = x − 6e₁ = (−2, 4, 2)ᵀ, β = α(α − x₁) = 12, H = I − vvᵀ/12 = ⅓(2 2 1; 2 −1 −2; 1 −2 2).", { wide: true }),
  fl("7.5 · Example 2", "y = (3, 4, 4, 2)ᵀ. A Householder matrix H = diag(1, H̃) leaves y₁ alone and zeroes the last two entries. Find Hy.", [vec("Hy", [3, 6, 0, 0])], "H̃ acts on (4, 4, 2): it is the matrix of Example 1, so Hy = (3, 6, 0, 0)ᵀ."),
  fl("7.5 · Example 3", "Find the rotation G = (c s; −s c) with Gx = (‖x‖, 0)ᵀ for x = (−3, 4)ᵀ.", [mat("G", [["-3/5", "4/5"], ["-4/5", "-3/5"]])], "c = x₁/‖x‖ = −3/5, s = x₂/‖x‖ = 4/5. Check: Gx = (9/5 + 16/5, 12/5 − 12/5) = (5, 0)."),
  cl("7.5 · Properties", "True or false? (H = I − vvᵀ/β with β = ½‖v‖².)", TF, [
    { tag: "+", html: "H is symmetric and H² = I.", ans: 0, why: "H reflects; reflecting twice is the identity." },
    { tag: "+", html: "det H = −1.", ans: 0, why: "A reflection reverses orientation." },
    { tag: "+", html: "Multiplying by H can magnify rounding errors by cond(H) ≫ 1.", ans: 1, why: "H is orthogonal: cond₂(H) = 1." },
  ], { wide: true }),
]);

buildExercises("s76", "Exercises · §7.6", "From Section 7.6.", [
  fl("7.6 · Example 1", "Power method for A = (2 1; 1 2) from u₀ = (2, 1)ᵀ, scaling by the largest entry. Find u₁, u₂ and the second scale factor β₂.", [vec("u₁", [1, "4/5"]), vec("u₂", [1, "13/14"]), num("β₂", "14/5")],
    "v₁ = (5, 4)ᵀ, u₁ = (1, 0.8)ᵀ; v₂ = (2.8, 2.6)ᵀ, u₂ = (1, 13/14)ᵀ. The scales 5, 2.8, … approach λ₁ = 3 and u_k → (1, 1)ᵀ.", { wide: true }),
  ch("7.6 · Convergence", "For eigenvalues 3, 2.8, 1, roughly how many power-method steps reduce the error by a factor 10?", ["about 33", "about 3", "about 10", "it does not converge"], 0, "The error shrinks like (2.8/3)^k; (14/15)^k = 0.1 gives k ≈ 33."),
  cl("7.6 · Facts", "True or false?", TF, [
    { tag: "+", html: "The power method converges for A = (0 −1; 1 0).", ans: 1, why: "Eigenvalues ±i have equal modulus: there is no dominant eigenvalue." },
    { tag: "QR", html: "Every Aₖ in the QR algorithm is similar to A.", ans: 0, why: "Aₖ₊₁ = RₖQₖ = QₖᵀAₖQₖ." },
    { tag: "+", html: "Computing eigenvalues as roots of the characteristic polynomial is numerically recommended.", ans: 1, why: "Polynomial roots are extremely sensitive to the coefficients; QR iterations work on the matrix directly." },
  ], { wide: true }),
]);
})();
