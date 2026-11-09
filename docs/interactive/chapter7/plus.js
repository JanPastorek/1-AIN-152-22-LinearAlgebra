/* Chapter 7: motivating problem, why-strips, studio, guide, sheets, certificates and exit tickets. */
(function () {
const L = window.LabPlus, { R, rm, inv, solve, fr, ff, fxs, sysHTML, tdigitSolve, fl, rng, rint, pick } = L;
const A = rm([["0.0001", 2], [1, 1]]), B = rm([4, 3]);
const normInf = M => Math.max(...M.map(r => r.reduce((s, x) => s + Math.abs(x.num()), 0)));
const condInf = M => normInf(M) * normInf(inv(M));
const run3 = (Mt, b, t, piv) => tdigitSolve(Mt.map(r => r.map(v => fl(v.num(), t))), b.map(v => fl(v.num(), t)), t, piv, null);

L.chapter({
  chapter: 7,
  why: {
    "def-fp": "Computers store about 16 significant digits, so every operation rounds. We need to know how much error that can cause.",
    "def-lu": "Engineering codes solve systems with millions of unknowns. Operation counts tell us which algorithms can finish at all (W04).",
    "def-piv": "One tiny pivot can wipe out every digit of the answer, even for an easy problem. Pivoting is the cheap cure (Leon Example 7.3.3).",
    "def-cond": "Some problems amplify errors in the data whatever the algorithm. The condition number measures this before we trust any answer (W04.T4).",
    "def-hh": "Orthogonal transformations do not amplify rounding errors. They are the stable tool for least squares and eigenvalues.",
    "def-pow": "Eigenvalues of large matrices, such as PageRank or vibration modes, cannot come from the characteristic polynomial. Iterations can find them.",
  },
  practice: { "def-lu": ["W04.T1", "W04.T2"], "def-piv": ["W04.T3", "W04.T5"], "def-cond": ["W04.T4"] },
  motivation: {
    title: "Is the solver broken?",
    story: `<p>A controller with 3-digit decimal arithmetic solves</p>
      ${sysHTML(A, B)}
      <p>and reports x = (0, 2). The exact solution is close to (1.0001, 1.9999), so the first coordinate is 100% wrong. The vendor blames the hardware: three digits are not enough. The customer blames the problem: the coefficient 0.0001 is tiny, so the system must be nearly singular.</p>`,
    question: "Who is right? Is the error caused by the precision, by the algorithm, or by the problem itself? Can a better algorithm in the same 3-digit arithmetic fix it?",
    recap: "0.0001x₁ + 2x₂ = 4, x₁ + x₂ = 3, solved in 3-digit arithmetic (Leon Example 7.3.3).",
    needs: [["def-fp", "floating point"], ["def-piv", "partial pivoting"], ["def-cond", "condition number"]],
    sheet: "W04.T4",
    load: { algo: "tdigit", text: "0.0001 2 | 4\n1 1 | 3", params: { t: 3, pivot: false }, label: "Load the controller's system into the studio" },
    final: {
      prompt: `<p>(1) Solve the system in 3-digit arithmetic with partial pivoting and give the computed x. (2) Give cond∞(A) = ‖A‖∞·‖A⁻¹‖∞, to at least 3 significant digits.</p>`,
      fields: [{ key: "x", label: "x with pivoting (3 digits)", kind: "vec", ph: "x₁, x₂" }, { key: "c", label: "cond∞(A)", kind: "num", ph: "e.g. 12.3" }],
      check(v) {
        const msgs = []; let ok = true;
        const xp = run3(A, B, 3, true), xn = run3(A, B, 3, false);
        if (v.x.length !== 2) { ok = false; msgs.push("x has 2 entries."); }
        else if (v.x.every((t, i) => Math.abs(t.num() - xp[i]) < 1e-9)) msgs.push(`With pivoting, 3-digit arithmetic gives (${xp.map(t => fxs(t, 3)).join(", ")}), which is correct to 3 digits.`);
        else if (v.x.every((t, i) => Math.abs(t.num() - xn[i]) < 1e-9)) { ok = false; msgs.push("That is the result without pivoting. Swap the rows so that the pivot is the larger entry, 1."); }
        else { ok = false; msgs.push("That is not what 3-digit arithmetic with pivoting gives. Round after every single operation."); }
        const c = condInf(A);
        if (Math.abs(v.c.num() - c) <= 0.005 * c) msgs.push(`cond∞(A) ≈ ${ff(c, 5)}: a well-conditioned problem.`);
        else { ok = false; msgs.push("The condition number is off. ‖M‖∞ is the largest absolute row sum; compute A⁻¹ exactly first."); }
        return { ok, msg: msgs.join(" ") };
      },
      after: `<p>Neither the vendor nor the customer is right. cond∞(A) ≈ 3.0003, so the problem is perfectly well conditioned, and 3 digits are plenty. The culprit is the algorithm. The pivot 0.0001 creates the multiplier 10 000, and rounding 1 − 10 000·2 to three digits erases the second equation's information. Partial pivoting swaps the rows, keeps |m| ≤ 1, and gives (1.00, 2.00).</p>
        <p>Compare W04.T4: for A_ε = [[1, 1], [1, 1 + ε]] the condition number is about 4/ε. There a change of δ in the data moves x by about δ/ε, whatever the algorithm. That is conditioning, and no pivoting can fix it. The studio's “Ill-conditioned” presets show both cases.</p>`,
    },
  },
  studio: { algos: ["tdigit"], sub: "Gaussian elimination in t-digit decimal arithmetic, with or without partial pivoting, compared with the exact solution. Change t, toggle pivoting, predict the pivot rows." },
  guide: "trust",
  sheets: [
    { week: 4, title: "Factor once, solve twice", tasks: [
      { id: "W04.T1", note: "record the multipliers (the L in LU)" },
      { id: "W04.T3", note: "PB = LU when a zero pivot forces a swap", load: { algo: "tdigit", text: "0 1 | 1\n1 1 | 2", params: { t: 4, pivot: true } } },
      { id: "W04.T4", note: "a sensitive problem: change the data by δ", load: { algo: "tdigit", text: "1 1 | 2\n1 1.001 | 2.002", params: { t: 4, pivot: true } } },
      { id: "W04.T5", note: "exit: which right-hand side enters the forward solve under PA = LU?" }] },
  ],
  cert: {
    algos: ["tdigit"], title: "Check your hand computation",
    help: "Solve the studio's system on paper in the studio's t-digit arithmetic, rounding after every operation, then type your x. The check tells you whether it matches the computation with pivoting, without pivoting, or neither, and how far it is from the exact solution.",
    fields: inst => [{ key: "x", label: `x (${inst.M.length} entries)`, kind: "vec", ph: "x₁, x₂, …" }],
    check(inst, v, prm) {
      const n = inst.M.length, t = prm.t || 3;
      if (inst.aug !== 1 || inst.M[0].length !== n + 1) return { ok: false, msg: "The studio needs a square system with one | column." };
      if (v.x.length !== n) return { ok: false, msg: `Give ${n} entries.` };
      const Am = inst.M.map(r => r.slice(0, n)), b = inst.M.map(r => r[n]);
      const xp = run3(Am, b, t, true), xn = run3(Am, b, t, false), ex = solve(Am, b);
      const same = y => y && v.x.every((q, i) => Math.abs(q.num() - y[i]) <= 1e-9 * (1 + Math.abs(y[i])));
      const err = ex ? Math.max(...v.x.map((q, i) => Math.abs(q.num() - ex[i].num()))) : NaN;
      const tail = ex ? ` Its error against the exact solution is ${ff(err, 3)}.` : "";
      if (same(prm.pivot ? xp : xn)) return { ok: true, msg: `Matches ${t}-digit elimination ${prm.pivot ? "with" : "without"} pivoting.${tail}` };
      if (same(prm.pivot ? xn : xp)) return { ok: false, msg: `That is the result ${prm.pivot ? "without" : "with"} pivoting. The studio is set ${prm.pivot ? "with" : "without"} it.${tail}` };
      return { ok: false, msg: `Not the ${t}-digit result. Check the rounding after each multiplication and subtraction.${tail}` };
    },
  },
  tickets: {
    intro: "Solve a 2 × 2 system with a small pivot in 3-digit arithmetic, with and without pivoting.",
    make(seed) {
      const rnd = rng("ch7:" + seed);
      const eps = `0.000${rint(rnd, 1, 9)}`, c = pick(rnd, [1, 2, 3]), e = rint(rnd, 2, 9), f = rint(rnd, 2, 9) * pick(rnd, [1, -1]);
      const Am = rm([[eps, c], [1, 1]]), b = rm([e, f]);
      const xn = run3(Am, b, 3, false), xp = run3(Am, b, 3, true), ex = solve(Am, b);
      const fmt = y => `(${y.map(t => fxs(t, 3)).join(", ")})`;
      return {
        html: `<ol><li>Solve in 3-digit decimal arithmetic without row interchanges:${sysHTML(Am, b)}</li><li>Solve it again with partial pivoting.</li><li>Compute cond∞(A) roughly. Which answer should you trust, and why?</li></ol>`,
        key: `1. ${fmt(xn)}. 2. ${fmt(xp)}. 3. cond∞(A) ≈ ${ff(condInf(Am), 3)}: well conditioned, so the pivoted answer is right to about 3 digits; exact x ≈ (${ex.map(t => ff(t.num(), 5)).join(", ")}).`,
        data: { Am, b, xn, xp, ex },
        selfCheck() {
          const exf = ex.map(t => t.num());
          const eP = Math.max(...xp.map((t, i) => Math.abs(t - exf[i]))), eN = Math.max(...xn.map((t, i) => Math.abs(t - exf[i])));
          return eP <= 0.01 * Math.max(1, ...exf.map(Math.abs)) && eP <= eN + 1e-12;
        },
      };
    },
  },
});
})();
