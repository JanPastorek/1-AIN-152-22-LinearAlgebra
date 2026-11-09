/* Chapter 6: motivating problem, why-strips, studio, guide, sheets, certificates and exit tickets. */
(function () {
const L = window.LabPlus, { R, rm, mmul, mvec, inv, isZeroVec, fr, vstr, mhtml, polyStr, charpoly, rng, rint, rnz, pick } = L;
const P = rm([["9/10", "2/10"], ["1/10", "8/10"]]);
const isEig = (A, lam, v) => !isZeroVec(v) && mvec(A, v).every((x, i) => x.eq(lam.mul(v[i])));

L.chapter({
  chapter: 6,
  why: {
    "def-eig": "Some directions are only stretched by a map, never turned. Along them, a thousand steps of a process are a single power λ¹⁰⁰⁰.",
    "def-ode": "Coupled rates such as predators and prey, or currents in a circuit, decouple into independent exponentials along eigenvectors.",
    "def-diag": "Aᵏ for large k, as in long-run populations or Markov chains, is easy when A = XDX⁻¹: only the diagonal entries get powered.",
    "def-markov": "Customers switching between apps, or a web surfer clicking links: the long-run shares form an eigenvector for λ = 1 (W12).",
    "def-herm": "Symmetric matrices such as covariances and stiffness matrices always have real eigenvalues and perpendicular eigenvectors. Statistics and mechanics rely on that.",
    "def-svd": "Compressing an image or finding the main trends in data means keeping the few largest singular values.",
    "def-qf": "Energy, variance and the curvature of a cost function are quadratic forms. Their sign decides stability or a minimum.",
    "def-pd": "To know that a critical point is a minimum, or that a covariance matrix is valid, we need quick tests for positive definiteness.",
    "def-perron": "Growth models with nonnegative rates, such as populations or rankings, have a dominant positive eigenvector. That is where PageRank comes from.",
  },
  practice: { "def-eig": ["W12.T2", "W13.T3"], "def-diag": ["W12.T4", "W13.T3"], "def-markov": ["W12.T1", "W12.T3", "W12.T5"], "def-herm": ["W13.T3"] },
  motivation: {
    title: "Two apps share a market",
    story: `<p>Two messaging apps, A and B, share a market. Each month 10% of A's users switch to B and 20% of B's users switch to A; everyone else stays. All users start on A. With p_t the vector of shares after t months,</p>
      <div class="lp-data">p_{t+1} = P p_t,    P = [ 0.9  0.2 ]
                         [ 0.1  0.8 ]</div>
      <p>Investors ask two questions: will the shares settle down, and where? And how fast will A lose its head start?</p>`,
    question: "Find the long-run shares, and the factor by which the distance to them shrinks each month. Prove both with eigenvectors, without simulating a thousand months.",
    recap: "P = [[0.9, 0.2], [0.1, 0.8]], p₀ = (1, 0).",
    needs: [["def-eig", "eigenvectors"], ["def-diag", "diagonalization"], ["def-markov", "steady state"]],
    sheet: "W12.T1",
    load: { algo: "power", text: "0.9 0.2\n0.1 0.8", label: "Load the market into the studio" },
    final: {
      prompt: `<p>(1) The steady state π: shares that add up to 1 and satisfy Pπ = π. (2) The other eigenvalue λ₂ and an eigenvector v for it.</p>`,
      fields: [{ key: "pi", label: "π", kind: "vec", ph: "π₁, π₂" }, { key: "l", label: "λ₂", kind: "num", ph: "e.g. 0.5" }, { key: "v", label: "eigenvector for λ₂", kind: "vec", ph: "v₁, v₂" }],
      check(x) {
        const msgs = []; let ok = true;
        if (x.pi.length !== 2 || x.v.length !== 2) return { ok: false, msg: "π and v each have 2 entries." };
        if (!isEig(P, R.of(1), x.pi)) { ok = false; msgs.push(`Pπ = ${vstr(mvec(P, x.pi))} ≠ π.`); }
        else if (!x.pi[0].add(x.pi[1]).eq(1)) { ok = false; msgs.push("π is an eigenvector for 1, but shares must add up to 1: rescale it."); }
        else msgs.push("Pπ = π and the shares add up to 1.");
        if (x.l.eq(1)) { ok = false; msgs.push("λ₂ should be the other eigenvalue, not 1."); }
        else if (!isEig(P, x.l, x.v)) { ok = false; msgs.push(isZeroVec(x.v) ? "An eigenvector must be nonzero." : `Pv = ${vstr(mvec(P, x.v))}, but λ₂v = ${vstr(x.v.map(t => t.mul(x.l)))}.`); }
        else msgs.push(`Pv = ${fr(x.l)}·v: the gap to the steady state shrinks by this factor every month.`);
        return { ok, msg: msgs.join(" ") };
      },
      after: `<p>π = (2/3, 1/3), and the other eigenvalue is λ₂ = 7/10 with eigenvector (1, −1). Write p₀ = π + (1/3)·(1, −1). Then p_t = π + (1/3)·0.7ᵗ·(1, −1): A's share falls toward 2/3, and the gap shrinks by 30% a month (W12.T2). After 12 months the gap is below 1%.</p>
        <p>The power method in the studio converges at exactly this rate: its error ratio approaches |λ₂/λ₁| = 0.7. With P′ = [[0.8, 0.3], [0.2, 0.7]] the ratio is 0.5, so that market settles faster (W12.T5).</p>`,
    },
  },
  studio: { algos: ["power"], sub: "The power method in floating point: watch the dominant eigenvector emerge, predict the largest entry, and check an eigenpair exactly." },
  guide: "diag",
  sheets: [
    { week: 12, title: "Eigenvectors explain a changing population", tasks: [
      { id: "W12.T1", note: "two apps exchange users", load: { algo: "power", text: "0.9 0.2\n0.1 0.8" } },
      { id: "W12.T2", note: "eigenvalues, the stationary vector, and p_t = π + 0.7ᵗ(p₀ − π)" },
      { id: "W12.T3", note: "the swap matrix Q: the studio starts at (1, 1), which is already stationary; from (1, 0) it oscillates forever", load: { algo: "power", text: "0 1\n1 0" } },
      { id: "W12.T4", note: "J = [[1, 1], [0, 1]] has too few eigenvectors", load: { algo: "power", text: "1 1\n0 1" } },
      { id: "W12.T5", note: "exit: P′ converges faster", load: { algo: "power", text: "0.8 0.3\n0.2 0.7" } }] },
    { week: 13, title: "The matrix museum", tasks: [
      { id: "W13.T3", note: "eigenspaces and diagonalizability of the exhibits", load: { algo: "power", text: "2 0\n0 1/2" } },
      { id: "W13.T4", note: "repair “two equal eigenvalues imply diagonalizability”" }] },
  ],
  cert: {
    algos: ["power"], title: "Check an eigenpair",
    help: "Type λ and a nonzero v for the matrix in the studio. The check computes Av − λv. It is exact for fractions and decimals you type. For irrational eigenvalues, give at least 7 significant digits.",
    fields: () => [{ key: "l", label: "λ", kind: "num", ph: "e.g. 3/2" }, { key: "v", label: "v", kind: "vec", ph: "v₁, v₂, …" }],
    check(inst, x) {
      const A = inst.M.map(r => r.slice(0, r.length - inst.aug)), n = A.length;
      if (x.v.length !== n) return { ok: false, msg: `v needs ${n} entries.` };
      if (isZeroVec(x.v)) return { ok: false, msg: "v = 0 satisfies Av = λv for every λ, so eigenvectors must be nonzero." };
      const d = mvec(A, x.v).map((t, i) => t.sub(x.l.mul(x.v[i])));
      if (isZeroVec(d)) return { ok: true, msg: "Av = λv exactly: an eigenpair." };
      const err = Math.max(...d.map(t => Math.abs(t.num()))), scale = Math.max(...x.v.map(t => Math.abs(t.num()))) * (1 + Math.abs(x.l.num()));
      return err <= 1e-6 * scale ? { ok: true, msg: `‖Av − λv‖ ≈ ${err.toExponential(1)}: an eigenpair to the accuracy you typed.` } : { ok: false, msg: `Av − λv = ${vstr(d.map(t => t.num()))}, not 0.` };
    },
  },
  tickets: {
    intro: "Find the eigenvalues and eigenvectors of a 2 × 2 matrix and decide whether it can be diagonalized.",
    make(seed) {
      const rnd = rng("ch6:" + seed);
      const a = rint(rnd, -2, 2), b = rnz(rnd, -2, 2);
      const X = mmul(rm([[1, a], [0, 1]]), rm([[1, 0], [b, 1]]));
      const l1 = rint(rnd, -3, 4); let l2; do l2 = rint(rnd, -3, 4); while (l2 === l1);
      const A = mmul(mmul(X, rm([[l1, 0], [0, l2]])), inv(X));
      const v1 = [X[0][0], X[1][0]], v2 = [X[0][1], X[1][1]];
      return {
        html: `<ol><li>Find the characteristic polynomial and the eigenvalues of${mhtml(A)}</li><li>Find an eigenvector for each eigenvalue.</li><li>Is A diagonalizable? If so, give X and D with A = XDX⁻¹.</li></ol>`,
        key: `1. p(λ) = ${polyStr(charpoly(A))}, eigenvalues ${l1} and ${l2}. 2. λ = ${l1}: ${vstr(v1)}; λ = ${l2}: ${vstr(v2)} (any nonzero multiples). 3. Yes, because the eigenvalues are distinct: X = ${mhtml(X, { small: true })}, D = diag(${l1}, ${l2}).`,
        data: { A, X, l1, l2 },
        selfCheck: () => isEig(A, R.of(l1), v1) && isEig(A, R.of(l2), v2) && A.every(r => r.every(c => c.isInt())),
      };
    },
  },
});
})();
