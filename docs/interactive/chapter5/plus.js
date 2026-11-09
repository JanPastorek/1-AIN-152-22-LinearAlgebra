/* Chapter 5: motivating problem, why-strips, studio, guide, sheets, certificates and exit tickets. */
(function () {
const L = window.LabPlus, { R, rm, mmul, mvec, tr, dot, col, isZeroVec, solve, fr, vstr, mhtml, rng, rint, ALGOS } = L;
const A = rm([[1, 0], [1, 1], [1, 2]]), B = rm([1, 2, 2]);
const resid = (A, b, x) => b.map((bi, i) => bi.sub(dot(A[i], x)));
const Atr = (A, r) => A[0].map((_, j) => dot(col(A, j), r));

L.chapter({
  chapter: 5,
  why: {
    "def-dot": "To split a force or a signal into a part along a direction and a part across it, we need angles and projections (W09.T2).",
    "def-perp": "The residual of a best fit must be perpendicular to everything the model can produce. The four fundamental subspaces say where that is.",
    "def-ls": "Measurements disagree, so Ax = b has no solution. We still need the x that fits best, and a certificate that it is best.",
    "def-ip": "Fitting functions such as polynomials or signals needs lengths and angles between functions, not only between arrows.",
    "def-on": "In an orthonormal basis, coordinates are plain dot products and nothing has to be solved. That is why graphics, signal processing and QR use them.",
    "def-gs": "Real data comes in skewed directions. Gram–Schmidt straightens them into perpendicular ones, which makes least squares stable (QR).",
    "def-op": "Approximating a function by polynomials is easiest when the polynomials are orthogonal: each coefficient is computed on its own.",
  },
  practice: { "def-dot": ["W09.T2", "W09.T5"], "def-perp": ["W09.T4"], "def-ls": ["W11.T4"], "def-on": ["W09.T3"], "def-gs": ["W09.T4"] },
  motivation: {
    title: "Calibrating a cheap thermometer",
    story: `<p>A cheap thermometer is calibrated against a lab reference. After 0, 1 and 2 minutes in a warming bath it reads</p>
      <div class="lp-data">t (min)    0   1   2
y (°C)     1   2   2</div>
      <p>The lab expects a linear drift y = β₀ + β₁t. No line passes through all three points, so every choice of (β₀, β₁) leaves some error.</p>`,
    question: "Which line is best, in the sense of the smallest sum of squared errors? And how can you prove that it is best, without trying every other line?",
    recap: "Data (0, 1), (1, 2), (2, 2); model y = β₀ + β₁t, so A = [[1, 0], [1, 1], [1, 2]] and b = (1, 2, 2).",
    needs: [["def-dot", "projection"], ["def-perp", "orthogonal complement"], ["def-ls", "normal equations"], ["def-gs", "Gram–Schmidt and QR"]],
    sheet: "W11.T4",
    load: { algo: "gs", text: "1 0 | 1\n1 1 | 2\n1 2 | 2", label: "Load the calibration data into the studio" },
    final: {
      prompt: `<p>Give the best coefficients x̂ = (β₀, β₁) and the residual r = b − Ax̂. The certificate that x̂ is best is that r is orthogonal to both columns of A.</p>`,
      fields: [{ key: "x", label: "x̂ = (β₀, β₁)", kind: "vec", ph: "β₀, β₁" }, { key: "r", label: "Residual r", kind: "vec", ph: "r₁, r₂, r₃" }],
      check(v) {
        const msgs = []; let ok = true;
        if (v.x.length !== 2 || v.r.length !== 3) return { ok: false, msg: "x̂ has 2 entries and r has 3." };
        const r = resid(A, B, v.x);
        if (!r.every((x, i) => x.eq(v.r[i]))) { ok = false; msgs.push(`For your x̂, the residual is b − Ax̂ = ${vstr(r)}, not ${vstr(v.r)}.`); }
        const t = Atr(A, r);
        if (isZeroVec(t)) msgs.push(`Aᵀr = 0: the residual is orthogonal to the column space, so x̂ is the least squares solution.`);
        else { ok = false; msgs.push(`Aᵀr = ${vstr(t)} ≠ 0: the residual still has a part that the model could explain, so this line can be improved.`); }
        return { ok, msg: msgs.join(" ") };
      },
      after: `<p>x̂ = (7/6, 1/2): the best line is y = 7/6 + t/2, with residual r = (−1/6, 1/3, −1/6). Check: r·(1, 1, 1) = 0 and r·(0, 1, 2) = 0. The proof that nothing beats it is Pythagoras. Any other x gives residual r + A(x̂ − x), and A(x̂ − x) is orthogonal to r, so ‖b − Ax‖² = ‖r‖² + ‖A(x̂ − x)‖² ≥ ‖r‖² (Theorem 5.3.1).</p>
        <p>The studio finds the same x̂ via Gram–Schmidt: q₁ = (1, 1, 1), q₂ = (−1, 0, 1), then back substitution. With orthogonal columns each coefficient is a dot product. That is how QR avoids forming AᵀA.</p>`,
    },
  },
  studio: { algos: ["gs"], sub: "Gram–Schmidt with exact fractions: orthogonalize the columns, read off A = QR, and, with a | b column, the least squares solution and its certificate Aᵀr = 0." },
  guide: "lsq",
  sheets: [
    { week: 9, title: "Orthogonality, projection, and surface normals", tasks: [
      { id: "W09.T1", note: "normal, unit normal and area of a triangular face" },
      { id: "W09.T2", note: "project (3, 1) onto the line through (1, 2)", load: { algo: "gs", text: "1 | 3\n2 | 1" } },
      { id: "W09.T3", note: "an idempotent matrix that is not an orthogonal projection" },
      { id: "W09.T4", note: "orthonormalize (1, 1) and (1, 0)", load: { algo: "gs", text: "1 1\n1 0" } },
      { id: "W09.T5", note: "exit: project (2, 0) onto the line through (1, −1)", load: { algo: "gs", text: "1 | 2\n-1 | 0" } }] },
    { week: 11, title: "Affine geometry", tasks: [{ id: "W11.T4", note: "optional: fit y = β₀ + β₁t to (0, 1), (1, 2), (2, 2)", load: { algo: "gs", text: "1 0 | 1\n1 1 | 2\n1 2 | 2" } }] },
  ],
  cert: {
    algos: ["gs"], title: "Check a least squares solution",
    help: "For the [A | b] in the studio, type your x̂. The check computes the residual r = b − Ax̂ and tests the certificate Aᵀr = 0. It does not compare with a stored answer.",
    fields: inst => [{ key: "x", label: `x̂ (${inst.M[0].length - inst.aug} entries)`, kind: "vec", ph: "x₁, x₂, …" }],
    check(inst, v) {
      if (!inst.aug) return { ok: false, msg: "Add a | b column to the instance first." };
      const n = inst.M[0].length - 1, A = inst.M.map(r => r.slice(0, n)), b = inst.M.map(r => r[n]);
      if (v.x.length !== n) return { ok: false, msg: `Give ${n} entries.` };
      const r = resid(A, b, v.x), t = Atr(A, r);
      return isZeroVec(t) ? { ok: true, msg: `r = ${vstr(r)} and Aᵀr = 0: x̂ is a least squares solution.` } : { ok: false, msg: `r = ${vstr(r)} but Aᵀr = ${vstr(t)} ≠ 0.` };
    },
  },
  tickets: {
    intro: "Fit a line to four data points by least squares.",
    make(seed) {
      const rnd = rng("ch5:" + seed);
      const pool = [-2, -1, 0, 1, 2, 3]; for (let i = pool.length - 1; i > 0; i--) { const j = rint(rnd, 0, i); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const ts = pool.slice(0, 4).sort((a, b) => a - b);
      let ys; do ys = ts.map(() => rint(rnd, -2, 6)); while (new Set(ys).size < 3);
      const Am = rm(ts.map(t => [1, t])), b = rm(ys);
      const x = solve(mmul(tr(Am), Am), mvec(tr(Am), b));
      return {
        html: `<ol><li>Write the normal equations for fitting y = β₀ + β₁t to the data<table class="lp-kv"><tr><th>t</th>${ts.map(t => `<td>${fr(R.of(t))}</td>`).join("")}</tr><tr><th>y</th>${ys.map(y => `<td>${fr(R.of(y))}</td>`).join("")}</tr></table></li><li>Solve them for (β₀, β₁).</li><li>Compute the residual r and check that it is orthogonal to both columns of A.</li></ol>`,
        key: `1. AᵀA = ${mhtml(mmul(tr(Am), Am), { small: true })} Aᵀb = ${vstr(mvec(tr(Am), b))}. 2. (β₀, β₁) = ${vstr(x)}. 3. r = ${vstr(resid(Am, b, x))}.`,
        data: { Am, b, x },
        selfCheck() {
          const F = ALGOS.gs.run({ M: Am.map((r, i) => r.concat([b[i]])), aug: 1 }), c = F[F.length - 1].cert;
          return isZeroVec(Atr(Am, resid(Am, b, x))) && c.kind === "lsq" && c.x.every((v, i) => v.eq(x[i]));
        },
      };
    },
  },
});
})();
