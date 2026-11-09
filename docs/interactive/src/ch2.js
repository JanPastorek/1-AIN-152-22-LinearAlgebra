(() => {
"use strict";
const { $, MINUS, sub, reduce, HOOK, goto, el, fmt, Q, matHTML, lbl, xv, q, qm, MH, sys, ch, fl, cl, vec, mat, num, buildExercises, sm, renderDefinitions, setStore, plane2D, draggable } = LA;
setStore("leon-ch2-solved-v1");
const S_ = n => `<sub>${n}</sub>`;
const signTxt = (i, j) => ((i + j) % 2 ? MINUS : "+");

/* =========================================================
   LAB · Cofactor expansion explorer
   ========================================================= */
(function cofLab() {
  const presets = [
    ["2.1 Ex 1", [[3, 2, 4], [1, -2, 3], [2, 3, 2]]],
    ["4 × 4 with zeros (p. 89)", [[0, 2, 3, 0], [0, 4, 5, 0], [0, 1, 0, 3], [2, 0, 1, 3]]],
    ["Ex 3(g)", [[2, 0, 0, 1], [0, 1, 0, 0], [1, 6, 2, 0], [1, 1, -2, 3]]],
    ["Ex 3(h)", [[2, 1, 2, 1], [3, 0, 1, 1], [-1, 2, -2, 1], [-3, 2, 3, 1]]],
    ["two equal rows", [[1, 2, 3], [4, 5, 6], [1, 2, 3]]],
    ["triangular", [[2, 5, -1], [0, 3, 4], [0, 0, -2]]],
  ];
  const S = { A: qm.of(presets[0][1]), line: { t: "r", k: 0 } };
  const pbox = $("#cof-presets");
  presets.forEach(([name, M], k) => {
    const b = document.createElement("button"); b.className = "chip"; b.textContent = name;
    b.onclick = () => { S.A = qm.of(M); S.line = bestLine(); build(); };
    pbox.appendChild(b);
  });
  const n = () => S.A.length;
  const zerosIn = (t, k) => S.A.map((r, i) => t === "r" ? S.A[k][i] : S.A[i][k]).filter(v => v.zero).length;
  function bestLine() {
    let best = { t: "r", k: 0, z: -1 };
    for (const t of ["r", "c"]) for (let k = 0; k < n(); k++) { const z = zerosIn(t, k); if (z > best.z) best = { t, k, z }; }
    return { t: best.t, k: best.k };
  }
  function build() {
    const box = $("#cof-in");
    box.innerHTML = lbl(`<div class="mat"><table>${S.A.map((r, i) => `<tr>${r.map((v, j) => `<td class="inp" data-i="${i}" data-j="${j}"><input class="mi" style="width:52px" id="cof-a${i}${j}" value="${v.txt().replace(MINUS, "-")}" aria-label="a${i + 1}${j + 1}" autocomplete="off"></td>`).join("")}</tr>`).join("")}</table></div>`, "A (edit any entry)");
    box.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
      const v = Q.parse(inp.value); inp.classList.toggle("wrong", !v); if (!v) return;
      S.A[+inp.id[5]][+inp.id[6]] = v; render();
    }));
    render();
  }
  function render() {
    const N = n(), best = bestLine();
    const lb = $("#cof-lines"); lb.innerHTML = "";
    for (const t of ["r", "c"]) for (let k = 0; k < N; k++) {
      const b = document.createElement("button"); b.className = "chip";
      b.textContent = (t === "r" ? "row " : "col ") + (k + 1) + (best.t === t && best.k === k ? " ★" : "");
      b.setAttribute("aria-pressed", S.line.t === t && S.line.k === k);
      b.onclick = () => { S.line = { t, k }; render(); };
      lb.appendChild(b);
    }
    $("#cof-in").querySelectorAll("td.inp").forEach(td => {
      const i = +td.dataset.i, j = +td.dataset.j;
      td.classList.toggle("hl", S.line.t === "r" ? i === S.line.k : j === S.line.k);
    });
    let total = new Q(0), h = "", nz = 0;
    for (let k = 0; k < N; k++) {
      const i = S.line.t === "r" ? S.line.k : k, j = S.line.t === "r" ? k : S.line.k;
      const a = S.A[i][j], sg = (i + j) % 2 ? -1 : 1;
      if (a.zero) { h += `<div class="cof-row skip"><span class="cof-sign">${signTxt(i, j)}</span><span>a${S_(`${i + 1}${j + 1}`)} = 0</span><span class="cof-note">term is 0, minor not needed</span></div>`; continue; }
      nz++;
      const M = qm.minor(S.A, i, j), dm = qm.det(M), term = a.mul(dm).mul(sg);
      total = total.add(term);
      h += `<div class="cof-row"><span class="cof-sign">${signTxt(i, j)}</span><span>${a.html()} ·</span>${matHTML(M, { size: "sm" }).replace('class="mat sm"', 'class="mat sm detbar"')}<span>= ${signTxt(i, j)} ${a.html()} · (${dm.html()}) = <b>${term.html()}</b></span></div>`;
    }
    h += `<div class="cof-row total"><span>det A =</span><b>${total.html()}</b></div>`;
    $("#cof-terms").innerHTML = h;
    const lineName = (S.line.t === "r" ? "row " : "column ") + (S.line.k + 1);
    const st = $("#cof-status");
    st.className = "status " + (total.zero ? "bad" : "ok");
    st.innerHTML = `<span class="k">det A = ${total.txt()} · expanded along ${lineName}</span>${nz} nonzero ${nz === 1 ? "term needs" : "terms need"} a ${N - 1} × ${N - 1} minor. ` +
      (best.t !== S.line.t || best.k !== S.line.k ? `The line marked ★ has the most zeros (${zerosIn(best.t, best.k)}) and would need fewer minors. ` : `This is the line with the most zeros. `) +
      (total.zero ? "Since det A = 0, A is singular." : "Since det A ≠ 0, A is nonsingular.");
  }
  const T = [[2, 1, 2, 1, 3], [3, 5, 9, 5, 10], [4, 23, 40, 14, 23], [5, 119, 205, 30, 44], [10, "3,628,799", "6,235,300", 285, 339]];
  $("#cof-table").innerHTML = `<tr><th>n</th><th>cofactors: additions</th><th>cofactors: multiplications</th><th>elimination: additions</th><th>elimination: mult. & div.</th></tr>` + T.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join("")}</tr>`).join("");
  S.line = bestLine(); build();
  HOOK.cof = (M, line) => { S.A = qm.of(M); S.line = line || bestLine(); build(); goto("#lab-cof"); };
})();

/* =========================================================
   LAB · signed area
   ========================================================= */
(function areaLab() {
  const S = { a1: [2, 0.5], a2: [0.5, 1.5] };
  const presets = [["Identity", [1, 0], [0, 1]], ["Shear", [1, 0], [1, 1]], ["Rotate 90°", [0, 1], [-1, 0]], ["Columns swapped", [0.5, 1.5], [2, 0.5]], ["Singular", [1, 2], [2, 4]], ["Book 2.1 Ex 2(a)", [3, 2], [5, 4]]];
  const pbox = $("#area-presets");
  presets.forEach(([name, a, b]) => { const bt = document.createElement("button"); bt.className = "chip"; bt.textContent = name; bt.onclick = () => { S.a1 = a.slice(); S.a2 = b.slice(); draw(); }; pbox.appendChild(bt); });
  const svg = $("#area-svg");
  const P = plane2D(svg, { R: 5.25 });
  const F = [[0, 0], [0.45, 0], [0.45, 0.95], [1.05, 0.95], [1.05, 1.35], [0.45, 1.35], [0.45, 1.85], [1.3, 1.85], [1.3, 2.25], [0, 2.25]].map(([x, y]) => [x * 0.42 + 0.12, y * 0.42 + 0.06]);
  const D = draggable(P, () => [S.a1, S.a2], (i, p) => { if (i === 0) S.a1 = p; else S.a2 = p; draw(); });
  const ap = v => [S.a1[0] * v[0] + S.a2[0] * v[1], S.a1[1] * v[0] + S.a2[1] * v[1]];
  function draw() {
    P.clear();
    const d = S.a1[0] * S.a2[1] - S.a2[0] * S.a1[1];
    const col = Math.abs(d) < 1e-9 ? "var(--muted)" : d > 0 ? "var(--c3)" : "var(--warn)";
    P.poly(P.layers.under, [[0, 0], S.a1, [S.a1[0] + S.a2[0], S.a1[1] + S.a2[1]], S.a2], { style: `fill:${col};fill-opacity:.22;stroke:${col};stroke-width:2` });
    P.poly(P.layers.under, [[0, 0], [1, 0], [1, 1], [0, 1]], { style: "fill:none;stroke:var(--muted);stroke-dasharray:4 3" });
    P.poly(P.layers.mid, F, { style: "fill:none;stroke:var(--muted);stroke-width:1" });
    P.poly(P.layers.mid, F.map(ap), { style: "fill:var(--ink);fill-opacity:.18;stroke:var(--ink);stroke-width:1.4" });
    P.arrow(P.layers.top, [0, 0], S.a1, "c1", 3.5);
    P.arrow(P.layers.top, [0, 0], S.a2, "c2", 3.5);
    D.draw(["a₁", "a₂"], ["f1", "f2"]);
    const f = v => fmt(v);
    $("#area-expr").innerHTML = lbl(matHTML([[S.a1[0], S.a2[0]], [S.a1[1], S.a2[1]]], { cellClass: (i, j) => j ? "hl2" : "hl1" }), "A = [a₁ a₂]") +
      `<span class="op">det A =</span><span>${f(S.a1[0])}·${f(S.a2[1])} − ${f(S.a2[0])}·${f(S.a1[1])} = <b>${f(d)}</b></span>`;
    const bd = (on, t) => `<span class="badge${on ? " on" : ""}">${t}</span>`;
    $("#area-badges").innerHTML = bd(d > 1e-9, "orientation kept") + bd(d < -1e-9, "orientation reversed") + bd(Math.abs(d) < 1e-9, "singular") + bd(Math.abs(Math.abs(d) - 1) < 1e-9, "area preserved");
    const st = $("#area-status");
    st.className = "status " + (Math.abs(d) < 1e-9 ? "bad" : "inf");
    st.innerHTML = Math.abs(d) < 1e-9 ? `<span class="k">det A = 0</span>The columns are parallel, so the unit square collapses onto a line. A is singular.`
      : `<span class="k">Area ${f(Math.abs(d))} · ${d > 0 ? "positive" : "negative"} orientation</span>The unit square (dashed) becomes the shaded parallelogram, with area |det A| = ${f(Math.abs(d))}. ${d < 0 ? "The F is mirrored because the columns are in clockwise order." : "The F is not mirrored: a₁ to a₂ turns counterclockwise."}`;
  }
  draw();
})();

/* =========================================================
   LAB · determinant by elimination with a ledger
   ========================================================= */
(function elimLab() {
  const presets = [
    ["2.2 Ex 2", [[0, 1, 2, 3], [1, 1, 1, 1], [-2, -2, 3, 3], [1, 2, -2, -3]]],
    ["2.1 Ex 1", [[3, 2, 4], [1, -2, 3], [2, 3, 2]]],
    ["2.2 Ex 3(c)", [[3, 3, 1], [0, 1, 2], [0, 2, 3]]],
    ["2.2 Ex 3(f)", [[1, 1, 1, 1], [2, -1, 3, 2], [0, 1, 2, 1], [0, 0, 7, 3]]],
    ["singular 2.2 Ex 3(a)", [[3, 1], [6, 2]]],
  ];
  const S = { A0: null, M: null, f: new Q(1), hist: [], log: [], last: null, op: "add", preset: 0 };
  let running = null;
  const pbox = $("#el-presets");
  presets.forEach(([name, M], k) => { const b = document.createElement("button"); b.className = "chip"; b.textContent = name; b.onclick = () => load(k); pbox.appendChild(b); });
  function load(k, M) {
    stop(); S.preset = k; S.A0 = qm.of(M || presets[k][1]); S.M = S.A0.map(r => r.slice()); S.f = new Q(1); S.hist = []; S.log = []; S.last = null;
    [...pbox.children].forEach((b, i) => b.setAttribute("aria-pressed", i === k));
    buildForm(); render();
  }
  const N = () => S.M.length;
  const R = i => `R${sub(i + 1)}`;
  function apply(op, why) {
    const M = S.M.map(r => r.slice()); let fac;
    if (op.type === "swap") { [M[op.i], M[op.j]] = [M[op.j], M[op.i]]; fac = new Q(-1); }
    else if (op.type === "scale") { M[op.i] = M[op.i].map(v => v.mul(op.c)); fac = op.c; }
    else { M[op.i] = M[op.i].map((v, k) => v.add(op.c.mul(M[op.j][k]))); fac = new Q(1); }
    S.hist.push({ M: S.M, f: S.f, last: S.last }); S.M = M; S.f = S.f.mul(fac); S.last = op;
    const t = op.type === "swap" ? `${R(op.i)} ↔ ${R(op.j)}` : op.type === "scale" ? `${R(op.i)} ← ${op.c.html()}·${R(op.i)}` : `${R(op.i)} ← ${R(op.i)} ${op.c.neg_ ? MINUS : "+"} ${op.c.abs().one ? "" : op.c.abs().html() + "·"}${R(op.j)}`;
    const effect = op.type === "swap" ? "det × (−1)" : op.type === "scale" ? `det × ${op.c.html()}` : "det unchanged";
    S.log.push({ t, effect, why }); render();
  }
  function suggest() {
    const M = S.M, n = N();
    for (let c = 0; c < n; c++) {
      if (M[c][c].zero) {
        let p = -1; for (let i = c + 1; i < n; i++) if (!M[i][c].zero) { p = i; break; }
        if (p >= 0) return { op: { type: "swap", i: c, j: p }, why: `Pivot position (${c + 1}, ${c + 1}) is 0, swap with row ${p + 1}.` };
        continue;
      }
      for (let i = c + 1; i < n; i++) if (!M[i][c].zero) { const l = M[i][c].div(M[c][c]); return { op: { type: "add", i, j: c, c: l.neg() }, why: `Clear entry (${i + 1}, ${c + 1}) below the pivot ${M[c][c].txt()}.` }; }
    }
    return null;
  }
  const isUpper = M => M.every((r, i) => r.every((v, j) => j >= i || v.zero));
  function render() {
    const M = S.M, last = S.last;
    const rc = i => !last ? "" : last.type === "swap" ? (i === last.i || i === last.j ? "changed" : "") : last.type === "scale" ? (i === last.i ? "changed" : "") : (i === last.i ? "changed" : i === last.j ? "pivotal" : "");
    $("#el-mat").innerHTML = matHTML(M, { size: "big haslab", rowLabel: i => R(i), rowClass: rc, cellClass: (i, j) => i === j ? "lead" : (j < i && !M[i][j].zero ? "hl2" : "") });
    const up = isUpper(M), prod = M.reduce((p, r, i) => p.mul(r[i]), new Q(1));
    const st = $("#el-status");
    const exact = qm.det(S.A0);
    if (up) {
      const detA = S.f.zero ? null : prod.div(S.f);
      st.className = "status ok";
      st.innerHTML = `<span class="k">Triangular · det A = ${detA ? detA.txt() : "?"}</span>det(current) = product of the diagonal = ${prod.html()}. The ledger says det(current) = ${S.f.html()} · det A, so det A = ${prod.html()} / ${S.f.html()} = <b>${detA ? detA.html() : "?"}</b>.` +
        (detA && detA.eq(exact) ? " This matches the cofactor expansion." : "") + (prod.zero ? " A zero on the diagonal means A is singular." : "");
    } else {
      st.className = "status inf";
      st.innerHTML = `<span class="k">Ledger: det(current) = ${S.f.txt()} · det A</span>Entries still to be cleared below the diagonal are highlighted. Each operation multiplies the ledger by its effect.`;
    }
    $("#el-log").innerHTML = S.log.map(e => `<li>${e.t} <span style="color:var(--c1)">· ${e.effect}</span>${e.why ? `<span class="why">${e.why}</span>` : ""}</li>`).join("") || `<li style="list-style:none;margin-left:-26px;color:var(--muted);font-family:var(--body)">No operations yet.</li>`;
    const lg = $("#el-log"); lg.scrollTop = lg.scrollHeight;
    const done = !suggest();
    $("#el-next").disabled = done || !!running; $("#el-run").disabled = done || !!running; $("#el-undo").disabled = !S.hist.length || !!running;
  }
  document.querySelectorAll("#lab-elim .tabs .chip").forEach(b => b.onclick = () => { S.op = b.dataset.op; document.querySelectorAll("#lab-elim .tabs .chip").forEach(x => x.setAttribute("aria-pressed", x === b)); buildForm(); });
  const rowSel = (id, d) => `<select id="${id}" aria-label="row">${S.M.map((_, i) => `<option value="${i}"${i === d ? " selected" : ""}>${R(i)}</option>`).join("")}</select>`;
  function buildForm() {
    const f = $("#el-form");
    if (S.op === "swap") f.innerHTML = `${rowSel("el-i", 0)} <span>↔</span> ${rowSel("el-j", 1)}`;
    else if (S.op === "scale") f.innerHTML = `${rowSel("el-i", 0)} <span>←</span> <input id="el-c" value="2" aria-label="multiplier"> <span>× same row</span>`;
    else f.innerHTML = `${rowSel("el-i", 1)} <span>← itself +</span> <input id="el-c" value="-1" aria-label="multiplier"> <span>×</span> ${rowSel("el-j", 0)}`;
    $("#el-err").textContent = "";
  }
  $("#el-apply").onclick = () => {
    const err = $("#el-err"); err.textContent = "";
    const i = +$("#el-i").value, j = $("#el-j") ? +$("#el-j").value : null;
    if (S.op === "swap") { if (i === j) return err.textContent = "Pick two different rows."; return apply({ type: "swap", i, j }, ""); }
    const c = Q.parse($("#el-c").value); if (!c) return err.textContent = "Enter a number such as 3 or −1/2.";
    if (S.op === "scale") { if (c.zero) return err.textContent = "Scaling by 0 is not a row operation."; return apply({ type: "scale", i, c }, ""); }
    if (i === j) return err.textContent = "Use two different rows."; apply({ type: "add", i, j, c }, "");
  };
  $("#el-next").onclick = () => { const s = suggest(); if (s) apply(s.op, s.why); };
  $("#el-undo").onclick = () => { const h = S.hist.pop(); if (!h) return; S.M = h.M; S.f = h.f; S.last = h.last; S.log.pop(); render(); };
  $("#el-reset").onclick = () => load(S.preset, S.A0);
  function stop() { if (running) { clearInterval(running); running = null; } }
  $("#el-run").onclick = () => {
    if (reduce) { let s, g = 0; while ((s = suggest()) && g++ < 100) apply(s.op, s.why); return; }
    running = setInterval(() => { const s = suggest(); if (!s) { stop(); render(); return; } apply(s.op, s.why); }, 650); render();
  };
  load(0);
  HOOK.elim = M => { load(-1, M); goto("#lab-elim"); };
})();

/* =========================================================
   LAB · Cramer's rule and the adjoint
   ========================================================= */
(function crLab() {
  const presets = [
    ["2.3 Ex 2(a)", [[1, 2, 3], [3, -1, 1]]],
    ["Ex 2(b)", [[2, 3, 2], [3, 2, 5]]],
    ["Ex 2(c)", [[2, 1, -3, 0], [4, 5, 1, 8], [-2, -1, 4, 2]]],
    ["Ex 2(d)", [[1, 3, 1, 1], [2, 1, 1, 5], [-2, 2, -1, -8]]],
    ["Ex 1(c) matrix", [[1, 3, 1, 1], [2, 1, 1, 0], [-2, 2, -1, 0]]],
  ];
  const S = { M: qm.of(presets[0][1]), mode: "cramer", k: 0 };
  const pbox = $("#cr-presets");
  presets.forEach(([name, M], k) => { const b = document.createElement("button"); b.className = "chip"; b.textContent = name; b.onclick = () => { S.M = qm.of(M); S.k = k; render(); }; pbox.appendChild(b); });
  $("#cr-mode1").onclick = () => { S.mode = "cramer"; render(); };
  $("#cr-mode2").onclick = () => { S.mode = "adj"; render(); };
  function render() {
    [...pbox.children].forEach((b, i) => b.setAttribute("aria-pressed", i === S.k));
    $("#cr-mode1").setAttribute("aria-pressed", S.mode === "cramer"); $("#cr-mode2").setAttribute("aria-pressed", S.mode === "adj");
    const n = S.M.length, A = S.M.map(r => r.slice(0, n)), b = S.M.map(r => r[n]), d = qm.det(A);
    $("#cr-sys").innerHTML = (S.mode === "cramer" ? sys(S.M) : "") + lbl(matHTML(A), "A") + (S.mode === "cramer" ? lbl(matHTML(b.map(v => [v])), "b") : "") + `<span class="op">det A = <b>${d.html()}</b></span>`;
    const st = $("#cr-status");
    if (S.mode === "cramer") {
      if (d.zero) { $("#cr-out").innerHTML = ""; st.className = "status bad"; st.innerHTML = `<span class="k">det A = 0</span>Cramer's rule needs a nonsingular A.`; return; }
      let h = `<div class="cr-grid">`; const xs = [];
      for (let i = 0; i < n; i++) {
        const Ai = A.map((r, rI) => r.map((v, j) => j === i ? b[rI] : v)), di = qm.det(Ai), xi = di.div(d); xs.push(xi);
        h += `<div class="cr-item">${lbl(matHTML(Ai, { cellClass: (r, j) => j === i ? "hl2" : "" }), `A${sub(i + 1)}: column ${i + 1} replaced by b`)}<div class="cr-eq">det A${sub(i + 1)} = ${di.html()}<br>${xv(i)} = ${di.html()} / ${d.html()} = <b>${xi.html()}</b></div></div>`;
      }
      $("#cr-out").innerHTML = h + `</div>`;
      const chk = A.every((r, i) => r.reduce((s, v, j) => s.add(v.mul(xs[j])), new Q(0)).eq(b[i]));
      st.className = "status ok"; st.innerHTML = `<span class="k">x = (${xs.map(v => v.txt()).join(", ")})</span>${chk ? "Substituting back, A x = b holds exactly." : ""}`;
    } else {
      const C = A.map((r, i) => r.map((_, j) => qm.cof(A, i, j))), adj = qm.adj(A), prod = qm.mul(A, adj);
      let h = `<div class="mexpr">` + lbl(matHTML(C), "cofactors A" + sub("ij")) + `<span class="op">→ transpose →</span>` + lbl(matHTML(adj, { cellClass: () => "hl1" }), "adj A") + `</div>`;
      h += `<div class="mexpr" style="margin-top:12px">` + lbl(matHTML(A), "A") + `<span class="op">×</span>` + lbl(matHTML(adj), "adj A") + `<span class="op">=</span>` + lbl(matHTML(prod, { cellClass: (i, j) => i === j ? "hl3" : "" }), `det(A) · I`) + `</div>`;
      if (!d.zero) h += `<div class="mexpr" style="margin-top:12px"><span class="op">A⁻¹ = adj A / det A =</span>` + lbl(matHTML(qm.scale(new Q(1).div(d), adj)), "A⁻¹") + `</div>`;
      $("#cr-out").innerHTML = h;
      st.className = "status " + (d.zero ? "bad" : "ok");
      st.innerHTML = d.zero ? `<span class="k">Singular</span>A(adj A) = 0 · I = O, and A has no inverse.` : `<span class="k">A(adj A) = ${d.txt()} · I</span>Entry (i, j) of adj A is the cofactor of entry (j, i) of A, note the transpose.`;
    }
  }
  render();
  HOOK.cr = (M, mode) => { S.M = qm.of(M); S.k = -1; S.mode = mode || "cramer"; render(); goto("#lab-cr"); };
})();

/* =========================================================
   LAB · coded messages
   ========================================================= */
(function codeLab() {
  const KEYS = [["Book 3 × 3 (Application 1)", [[1, 2, 1], [2, 5, 3], [2, 3, 2]]], ["Book 4 × 4 (Exercise 14)", [[-1, -1, 2, 0], [1, 1, -1, 0], [0, 0, -1, 1], [1, 0, 0, -1]]]];
  const BOOK = [-19, 19, 25, -21, 0, 18, -18, 15, 3, 10, -8, 3, -2, 20, -7, 12];
  const S = { key: 0, decodeOnly: null };
  const kb = $("#code-key");
  KEYS.forEach(([name], k) => { const b = document.createElement("button"); b.className = "chip"; b.textContent = name; b.onclick = () => { S.key = k; S.decodeOnly = null; render(); }; kb.appendChild(b); });
  const toNums = s => s.toUpperCase().replace(/[^A-Z ]/g, "").split("").map(c => c === " " ? 0 : c.charCodeAt(0) - 64);
  const toText = a => a.map(n => n === 0 ? " " : (n >= 1 && n <= 26 ? String.fromCharCode(64 + n) : "?")).join("");
  const chips = (arr, cls) => arr.map(v => `<span class="${cls || ""}">${String(v).replace("-", MINUS)}</span>`).join("");
  function render() {
    [...kb.children].forEach((b, i) => b.setAttribute("aria-pressed", i === S.key));
    const A = qm.of(KEYS[S.key][1]), n = A.length, d = qm.det(A), Ai = qm.inv(A);
    $("#code-A").innerHTML = lbl(matHTML(A), "A") + `<span class="op">det A = ${d.html()}</span>` + lbl(matHTML(Ai, { cellClass: () => "hl1" }), "A⁻¹ (integers)");
    let sent;
    if (S.decodeOnly) { sent = S.decodeOnly; $("#code-nums").innerHTML = `<span class="muted">unknown: this is what we want to find</span>`; }
    else {
      const nums = toNums($("#code-text").value); while (nums.length % n) nums.push(0);
      $("#code-nums").innerHTML = chips(nums);
      sent = [];
      for (let k = 0; k < nums.length; k += n) { const col = qm.mul(A, qm.col(nums.slice(k, k + n))); sent.push(...col.map(r => r[0].n)); }
    }
    $("#code-sent").innerHTML = chips(sent, "sent");
    const back = [];
    for (let k = 0; k + n <= sent.length; k += n) { const col = qm.mul(Ai, qm.col(sent.slice(k, k + n))); back.push(...col.map(r => r[0].n)); }
    $("#code-back").innerHTML = chips(back) + `<div class="code-text">“${toText(back)}”</div>`;
    const st = $("#code-status");
    st.innerHTML = S.decodeOnly ? `<span class="k">Decoding Exercise 14</span>The 16 numbers are split into columns of length 4 and multiplied by A⁻¹.` :
      `<span class="k">${sent.length / n} column${sent.length / n === 1 ? "" : "s"} of length ${n}</span>Letters become numbers, numbers are grouped into columns, and each column is multiplied by A. Spaces are padded at the end.`;
  }
  $("#code-text").addEventListener("input", () => { S.decodeOnly = null; render(); });
  $("#code-book").onclick = () => { S.key = 1; S.decodeOnly = BOOK.slice(); render(); };
  render();
  HOOK.code = () => { $("#code-book").click(); goto("#lab-code"); };
})();

/* =========================================================
   Definitions
   ========================================================= */
renderDefinitions([
  { sec: "s21", id: "def-minor", term: "Minor and cofactor", ref: "§2.1 · Definition", scene: "CofactorExpansion",
    html: `Let <i>A</i> = (a${S_("ij")}) be <i>n</i> × <i>n</i> and let <i>M</i>${S_("ij")} be the (<i>n</i> − 1) × (<i>n</i> − 1) matrix obtained by deleting the row and column containing a${S_("ij")}. The determinant of <i>M</i>${S_("ij")} is the <b>minor</b> of a${S_("ij")}, and the <b>cofactor</b> of a${S_("ij")} is <i>A</i>${S_("ij")} = (−1)<sup><i>i</i>+<i>j</i></sup> det(<i>M</i>${S_("ij")}).`,
    note: "The matrix of Exercise 2.1.1, expanded along its first row." },
  { sec: "s21", id: "def-det", term: "The determinant", ref: "§2.1 · Definition, Theorems 2.1.1–2.1.4", scene: "DeterminantArea",
    html: `det(<i>A</i>) = a${S_(11)} if <i>n</i> = 1, and det(<i>A</i>) = a${S_(11)}<i>A</i>${S_(11)} + a${S_(12)}<i>A</i>${S_(12)} + ⋯ + a${S_("1n")}<i>A</i>${S_("1n")} if <i>n</i> &gt; 1. The expansion works along <b>any</b> row or column (2.1.1). Also det(<i>A</i><sup>T</sup>) = det(<i>A</i>) (2.1.2); a triangular matrix has determinant equal to the product of its diagonal entries (2.1.3); a zero row or two identical rows give det(<i>A</i>) = 0 (2.1.4).`,
    note: "The animation shows the geometric meaning: |det A| is the area spanned by the columns, and the sign is the orientation." },
  { sec: "s22", id: "def-rowops", term: "Row operations and the determinant", ref: "§2.2 · Lemma 2.2.1 and its consequences", scene: "RowOpsDeterminant",
    html: `<b>I.</b> Interchanging two rows (or columns) changes the sign of the determinant. <b>II.</b> Multiplying a single row (or column) by a scalar α multiplies the determinant by α. <b>III.</b> Adding a multiple of one row (or column) to another does not change the determinant. Equivalently, det(<i>EA</i>) = det(<i>E</i>) det(<i>A</i>) for every elementary matrix <i>E</i>.` },
  { sec: "s22", id: "def-singular", term: "Singularity test; product rule", ref: "§2.2 · Theorems 2.2.2, 2.2.3", scene: "ProductRule",
    html: `An <i>n</i> × <i>n</i> matrix <i>A</i> is <b>singular if and only if det(<i>A</i>) = 0</b>. For <i>n</i> × <i>n</i> matrices, <b>det(<i>AB</i>) = det(<i>A</i>) det(<i>B</i>)</b>. Consequences: det(<i>A</i><sup>−1</sup>) = 1/det(<i>A</i>) and det(α<i>A</i>) = α<sup><i>n</i></sup> det(<i>A</i>).` },
  { sec: "s23", id: "def-adj", term: "The adjoint", ref: "§2.3", scene: null, lab: ["#lab-cr", "Compute adjoints in the Cramer lab"],
    html: `The <b>adjoint</b> of <i>A</i> is the transpose of its matrix of cofactors: the (<i>i</i>, <i>j</i>) entry of adj <i>A</i> is <i>A</i>${S_("ji")}. By Lemma 2.2.1, <i>A</i>(adj <i>A</i>) = det(<i>A</i>)<i>I</i>, so if det(<i>A</i>) ≠ 0 then <i>A</i><sup>−1</sup> = adj <i>A</i> / det(<i>A</i>).` },
  { sec: "s23", id: "def-cramer", term: "Cramer's rule", ref: "§2.3 · Theorem 2.3.1", scene: "CramersRule",
    html: `If <i>A</i> is nonsingular and <i>A</i><sub><i>i</i></sub> is <i>A</i> with its <i>i</i>th column replaced by <b>b</b>, then the unique solution of <i>A</i><b>x</b> = <b>b</b> has x${S_("i")} = det(<i>A</i>${S_("i")}) / det(<i>A</i>).`,
    note: "Why it works, in pictures: b = x₁a₁ + x₂a₂, and a shear along a₂ turns the parallelogram (b, a₂) into x₁ copies of (a₁, a₂)." },
], { s21: "2.1", s22: "2.2", s23: "2.3" });

/* =========================================================
   Exercises
   ========================================================= */
const D = M => qm.det(qm.of(M));
const cofAct = M => ({ label: "Open in the cofactor lab", run: () => HOOK.cof(M) });
const elAct = M => ({ label: "Open in the elimination lab", run: () => HOOK.elim(M) });
const crAct = (M, mode) => ({ label: mode === "adj" ? "Open in the adjoint view" : "Open in the Cramer lab", run: () => HOOK.cr(M, mode) });
const setCheck = (want, label) => vals => {
  const got = vals.map(v => v[0][0]); const w = want.map(q);
  const ok = got.length === w.length && w.every(x => got.some(g => g.eq(x))) && got.every(g => w.some(x => x.eq(g)));
  return ok ? { ok: true, msg: "Correct (in any order)." } : { ok: false, msg: `Not yet. ${label || ""}` };
};
const A211 = [[3, 2, 4], [1, -2, 3], [2, 3, 2]], A211q = qm.of(A211);
const ex3 = [[[3, 5], [-2, -3]], [[5, -2], [-8, 4]], [[3, 1, 2], [2, 4, 5], [2, 4, 5]], [[4, 3, 0], [3, 1, 2], [5, -1, -4]],
  [[1, 3, 2], [4, 1, -2], [2, 1, 3]], [[2, -1, 2], [1, 3, 2], [5, 1, 6]], [[2, 0, 0, 1], [0, 1, 0, 0], [1, 6, 2, 0], [1, 1, -2, 3]], [[2, 1, 2, 1], [3, 0, 1, 1], [-1, 2, -2, 1], [-3, 2, 3, 1]]];
buildExercises("s21", "Exercises · §2.1", "From the Section 2.1 exercises (p. 90–91). Answers are checked exactly; fractions like −5/2 are accepted.", [
  fl("2.1 · Ex 1(a), (b)", `For A = ${sm(A211)}, find the minors det(M${S_(21)}), det(M${S_(22)}), det(M${S_(23)}) and the cofactors A${S_(21)}, A${S_(22)}, A${S_(23)}.`,
    [num("det M₂₁", qm.det(qm.minor(A211q, 1, 0))), num("det M₂₂", qm.det(qm.minor(A211q, 1, 1))), num("det M₂₃", qm.det(qm.minor(A211q, 1, 2))),
     num("A₂₁", qm.cof(A211q, 1, 0)), num("A₂₂", qm.cof(A211q, 1, 1)), num("A₂₃", qm.cof(A211q, 1, 2))],
    "M₂₁ deletes row 2 and column 1: (2 4; 3 2), det −8, so A₂₁ = (−1)³(−8) = 8. Similarly det M₂₂ = −2, A₂₂ = −2, det M₂₃ = 5, A₂₃ = −5.",
    { wide: true, hint: "The sign of cofactor A_ij is (−1)^(i+j): + − + in row 1, − + − in row 2.", actions: [cofAct(A211)] }),
  fl("2.1 · Ex 1(c)", `Use the cofactors from part (b) to compute det(A) = a${S_(21)}A${S_(21)} + a${S_(22)}A${S_(22)} + a${S_(23)}A${S_(23)}.`, [num("det A", qm.det(A211q))],
    "1·8 + (−2)(−2) + 3(−5) = 8 + 4 − 15 = −3, the same value as expanding along row 1.", { actions: [cofAct(A211)] }),
  cl("2.1 · Ex 2", "Use determinants to decide whether each 2 × 2 matrix is nonsingular.", ["Nonsingular", "Singular"], [
    { tag: "(a)", html: sm([[3, 5], [2, 4]]), ans: 0, why: "det = 12 − 10 = 2 ≠ 0." },
    { tag: "(b)", html: sm([[3, 6], [2, 4]]), ans: 1, why: "det = 12 − 12 = 0: the second column is twice the first." },
    { tag: "(c)", html: sm([[3, -6], [2, 4]]), ans: 0, why: "det = 12 + 12 = 24." },
  ], { wide: true }),
  fl("2.1 · Ex 3(a)–(d)", `Evaluate: (a) ${sm(ex3[0])} (b) ${sm(ex3[1])} (c) ${sm(ex3[2])} (d) ${sm(ex3[3])}`,
    ex3.slice(0, 4).map((M, k) => num(`(${"abcd"[k]})`, D(M))),
    "(a) −9 + 10 = 1. (b) 20 − 16 = 4. (c) 0: rows 2 and 3 are equal. (d) expand along row 1: 4(−4 + 2) − 3(−12 − 10) + 0 = −8 + 66 = 58.",
    { wide: true, actions: [cofAct(ex3[3])] }),
  fl("2.1 · Ex 3(e)–(h)", `Evaluate: (e) ${sm(ex3[4])} (f) ${sm(ex3[5])} (g) ${sm(ex3[6])} (h) ${sm(ex3[7])}`,
    ex3.slice(4).map((M, k) => num(`(${"efgh"[k]})`, D(M))),
    "Expand along the row or column with the most zeros. For (g), row 2 has a single nonzero entry, which reduces the 4 × 4 to one 3 × 3 determinant.",
    { wide: true, hint: "Use the ★ suggestion in the cofactor lab.", actions: [cofAct(ex3[6]), cofAct(ex3[7])] }),
  fl("2.1 · Ex 4", `Evaluate by inspection: (a) ${sm([[3, 5], [2, 4]])} (b) ${sm([[2, 0, 0], [4, 1, 0], [7, 3, -2]])} (c) ${sm([[3, 0, 0], [2, 1, 1], [1, 2, 2]])} (d) ${sm([[4, 0, 2, 1], [5, 0, 4, 2], [2, 0, 3, 4], [1, 0, 2, 3]])}`,
    [num("(a)", 2), num("(b)", -4), num("(c)", 0), num("(d)", 0)],
    "(a) 12 − 10 = 2. (b) lower triangular: 2 · 1 · (−2) = −4. (c) columns 2 and 3 are equal, so 0. (d) column 2 is all zeros, so 0.",
    { wide: true, hint: "Triangular: product of the diagonal. A zero column or two equal columns: 0." }),
  fl("2.1 · Ex 6", `Find all values of λ for which det ${sm([["2−λ", 4], [3, "3−λ"]])} = 0.`, [num("λ₁", 6), num("λ₂", -1)],
    "(2 − λ)(3 − λ) − 12 = λ² − 5λ − 6 = (λ − 6)(λ + 1), so λ = 6 or λ = −1. (These will be the eigenvalues of (2 4; 3 3) in Chapter 6.)",
    { check: setCheck([6, -1], "Expand (2 − λ)(3 − λ) − 12 and factor.") }),
  ch("2.1 · Theorem 2.1.2", "For every n × n matrix A, det(Aᵀ) equals…", ["det(A)", "−det(A)", "1/det(A)", "det(A)ⁿ"], 0,
    "Expanding det(A) along row 1 is the same computation as expanding det(Aᵀ) along column 1. So everything said about rows also holds for columns."),
]);

const ex22b = [[1, 1, 1, 3], [0, 3, 1, 1], [0, 0, 2, 2], [-1, -1, -1, 2]];
const ex22c = [[0, 0, 0, 1], [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]];
const ex222 = [[0, 1, 2, 3], [1, 1, 1, 1], [-2, -2, 3, 3], [1, 2, -2, -3]];
const ex223 = [[[3, 1], [6, 2]], [[3, 1], [4, 2]], [[3, 3, 1], [0, 1, 2], [0, 2, 3]], [[2, 1, 1], [4, 3, 5], [2, 1, 2]], [[2, -1, 3], [-1, 2, -2], [1, 4, 0]], [[1, 1, 1, 1], [2, -1, 3, 2], [0, 1, 2, 1], [0, 0, 7, 3]]];
buildExercises("s22", "Exercises · §2.2", "From the Section 2.2 exercises (p. 97).", [
  fl("2.2 · Ex 1", `Evaluate by inspection: (a) ${sm([[0, 0, 3], [0, 4, 1], [2, 3, 1]])} (b) ${sm(ex22b)} (c) ${sm(ex22c)}`,
    [num("(a)", D([[0, 0, 3], [0, 4, 1], [2, 3, 1]])), num("(b)", D(ex22b)), num("(c)", D(ex22c))],
    "(a) Swapping rows 1 and 3 gives a triangular matrix with diagonal 2, 4, 3, so det = −24. (b) Add row 1 to row 4: the matrix becomes upper triangular with diagonal 1, 3, 2, 5, so det = 30. (c) Three row swaps turn it into I, so det = (−1)³ = −1.",
    { wide: true, hint: "Use row operation III to make the matrix triangular, or count the swaps that turn it into I." }),
  fl("2.2 · Ex 2(a)", `Use the elimination method to evaluate det(A) for A = ${sm(ex222)}.`, [num("det A", D(ex222))],
    "Swap rows 1 and 2 (sign change), clear column 1, then column 2… The diagonal of the triangular form multiplies to give the value; undo the single swap's sign.",
    { actions: [elAct(ex222)] }),
  cl("2.2 · Ex 3", "Compute each determinant and decide whether the matrix is singular.", ["Nonsingular", "Singular"],
    ex223.map((M, k) => ({ tag: `(${"abcdef"[k]}) det = ?`, html: sm(M), ans: D(M).zero ? 1 : 0, why: `det = ${D(M).txt()}.` })), { wide: true }),
  fl("2.2 · Ex 4", `Find all values of c that make ${sm([[1, 1, 1], [1, 9, "c"], [1, "c", 3]])} singular.`, [num("c₁", 5), num("c₂", -3)],
    "det = 1(27 − c²) − 1(3 − c) + 1(c − 9) = −c² + 2c + 15 = −(c − 5)(c + 3), so c = 5 or c = −3.",
    { check: setCheck([5, -3], "Expand along row 1 and set the result to 0.") }),
  fl("2.2 · Ex 7", "A and B are 3 × 3 with det(A) = 4 and det(B) = 5. Find det(AB), det(3A), det(2AB), det(A⁻¹B).",
    [num("det(AB)", 20), num("det(3A)", 108), num("det(2AB)", 160), num("det(A⁻¹B)", "5/4")],
    "det(AB) = 4·5 = 20. det(3A) = 3³·4 = 108. det(2AB) = 2³·20 = 160. det(A⁻¹B) = (1/4)·5 = 5/4.",
    { hint: "Multiplying a 3 × 3 matrix by α multiplies all three rows, so the determinant gains α³." }),
  fl("2.2 · Ex 9", "E₁, E₂, E₃ are 3 × 3 elementary matrices of types I, II, III; E₂ multiplies row 2 by 3; det(A) = 6. Find det(E₁A), det(E₂A), det(E₃A), det(AE₁), det(E₁²), det(E₁E₂E₃).",
    [num("E₁A", -6), num("E₂A", 18), num("E₃A", 6), num("AE₁", -6), num("E₁²", 1), num("E₁E₂E₃", -3)],
    "det(E₁) = −1, det(E₂) = 3, det(E₃) = 1, and det of a product is the product of determinants.", { wide: true }),
  ch("2.2 · Ex 5", "For an n × n matrix A and a scalar α, det(αA) equals…", ["α det(A)", "αⁿ det(A)", "nα det(A)", "det(A)"], 1,
    "αA multiplies every one of the n rows by α, and each row contributes one factor α (operation II)."),
  ch("2.2 · Ex 6", "If A is nonsingular, det(A⁻¹) equals…", ["det(A)", "−det(A)", "1/det(A)", "0"], 2,
    "det(A) det(A⁻¹) = det(AA⁻¹) = det(I) = 1."),
  ch("2.2 · Ex 11", "Can an n × n matrix satisfy A² + I = O?", ["Not for odd n; yes for even n", "Yes for every n", "Never"], 0,
    "A² = −I gives det(A)² = det(−I) = (−1)ⁿ. For odd n that is −1, impossible for a real number. For n = 2 the rotation by 90°, (0 −1; 1 0), works."),
  ch("2.2 · Ex 12", "The Vandermonde matrix V = (1 x₁ x₁²; 1 x₂ x₂²; 1 x₃ x₃²) has det(V) = (x₂ − x₁)(x₃ − x₁)(x₃ − x₂). When is V nonsingular?",
    ["when x₁, x₂, x₃ are distinct", "when all xᵢ are nonzero", "always", "when x₁ + x₂ + x₃ ≠ 0"], 0,
    "The product is zero exactly when two of the xᵢ coincide. This is why a quadratic through three points with distinct x-coordinates is unique."),
]);

const A231a = [[1, 2], [3, -1]], A231c = [[1, 3, 1], [2, 1, 1], [-2, 2, -1]], A233 = [[1, 2, 1], [0, 4, 3], [1, 2, 2]];
const cr = (M, i) => { const n = M.length, A = qm.of(M.map(r => r.slice(0, n))), b = M.map(r => q(r[n])); return qm.det(A.map((r, rI) => r.map((v, j) => j === i ? b[rI] : v))).div(qm.det(A)); };
const S2a = [[1, 2, 3], [3, -1, 1]], S2c = [[2, 1, -3, 0], [4, 5, 1, 8], [-2, -1, 4, 2]];
buildExercises("s23", "Exercises · §2.3", "From the Section 2.3 exercises (p. 105–106).", [
  fl("2.3 · Ex 1(a)", `For A = ${sm(A231a)}, compute det(A), adj A and A⁻¹.`, [num("det A", D(A231a)), mat("adj A", qm.adj(qm.of(A231a))), mat("A⁻¹", qm.inv(qm.of(A231a)))],
    "det A = −1 − 6 = −7. adj A swaps the diagonal and negates the off-diagonal: (−1 −2; −3 1). A⁻¹ = adj A / (−7) = (1/7 2/7; 3/7 −1/7).",
    { wide: true, actions: [crAct([[1, 2, 0], [3, -1, 0]], "adj")] }),
  fl("2.3 · Ex 1(c)", `For A = ${sm(A231c)}, compute det(A) and adj A.`, [num("det A", D(A231c)), mat("adj A", qm.adj(qm.of(A231c)))],
    "Entry (i, j) of adj A is the cofactor A_ji. Check your answer: A · adj A must equal det(A) · I.",
    { wide: true, hint: "Compute all nine cofactors, then transpose.", actions: [crAct(A231c.map(r => [...r, 0]), "adj")] }),
  fl("2.3 · Ex 2(a)", sys(S2a) + "Solve with Cramer's rule.", [vec("(x₁, x₂)", [cr(S2a, 0), cr(S2a, 1)])],
    "det A = −7. det A₁ = det(3 2; 1 −1) = −5, det A₂ = det(1 3; 3 1) = −8. So x₁ = 5/7, x₂ = 8/7.", { actions: [crAct(S2a)] }),
  fl("2.3 · Ex 2(c)", sys(S2c) + "Solve with Cramer's rule.", [vec("(x₁, x₂, x₃)", [0, 1, 2].map(i => cr(S2c, i)))],
    "Compute det A, then the three determinants with column i replaced by b.", { actions: [crAct(S2c)] }),
  fl("2.3 · Ex 3", `For A = ${sm(A233)}, find the (2, 3) entry of A⁻¹ as a quotient of two determinants.`, [num("(A⁻¹)₂₃", qm.inv(qm.of(A233))[1][2])],
    `(A⁻¹)₂₃ = (adj A)₂₃ / det A = A₃₂ / det A. A₃₂ = −det(1 1; 0 3) = ${qm.cof(qm.of(A233), 2, 1).txt()} and det A = ${D(A233).txt()}, so the entry is ${qm.inv(qm.of(A233))[1][2].txt()}.`,
    { hint: "Entry (2, 3) of adj A is the cofactor A₃₂: note the swapped indices.", actions: [crAct(A233.map(r => [...r, 0]), "adj")] }),
  ch("2.3 · Ex 5", `For A = ${sm([[1, 2, 3], [2, 3, 4], [3, 4, 5]])}, which is true?`, ["det A = 0, A is singular and A adj A = O", "det A = 1 and A adj A = I", "det A = −1"], 0,
    "Row 3 − row 2 = row 2 − row 1, so the rows are dependent and det A = 0. Then A(adj A) = det(A) I = O.",
    { actions: [crAct([[1, 2, 3, 0], [2, 3, 4, 0], [3, 4, 5, 0]], "adj")] }),
  ch("2.3 · Ex 14", "The message was coded with the 4 × 4 matrix of Exercise 14 (space = 0, A = 1, …) and sent as −19, 19, 25, −21, 0, 18, −18, 15, 3, 10, −8, 3, −2, 20, −7, 12. What was the message?",
    ["DO YOUR HOMEWORK", "SEND MORE MONEY", "GO TO THE LIBRARY", "DO NOT GIVE UP"], 0,
    "Split into columns of length 4 and multiply by A⁻¹. The first column gives 4, 15, 0, 25 = D, O, space, Y.", { actions: [{ label: "Decode in the lab", run: () => HOOK.code() }] }),
  ch("2.3 · Application 1", "Why should a coding matrix have integer entries and det(A) = ±1?", ["Then A⁻¹ = ±adj A also has integer entries, so decoding returns whole numbers", "Then A is symmetric", "Then the code cannot be broken"], 0,
    "A⁻¹ = adj A / det A, and adj A has integer entries (cofactors of an integer matrix). Dividing by ±1 keeps them integers."),
]);
})();
