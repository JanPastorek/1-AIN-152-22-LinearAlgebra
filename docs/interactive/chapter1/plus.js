/* Chapter 1: motivating problem, why-strips, studio, guide, sheets, certificates and exit tickets. */
(function () {
const L = window.LabPlus, { R, rm, mvec, isZeroVec, det, solve, fr, vstr, sysHTML, rng, rint, rnz, pick } = L;
const TRAFFIC = rm([[1, 0, 0, -1], [-1, 1, 0, 0], [0, -1, 1, 0], [0, 0, -1, 1]]);
const B_OK = rm([3, -1, -2, 0]), B_BAD = rm([4, -1, -2, 0]);
const yA = (y, A) => A[0].map((_, j) => y.reduce((s, c, k) => s.add(c.mul(A[k][j])), R.of(0)));
const yb = (y, b) => y.reduce((s, c, k) => s.add(c.mul(b[k])), R.of(0));

L.chapter({
  chapter: 1,
  why: {
    "def-system": "A traffic engineer has four junction counts and four unknown road flows. A linear system is how the counts constrain the flows (W02.T1).",
    "def-equivalent": "Simplifying equations must not change the answer, so we need to know exactly which operations keep the solution set.",
    "def-matrix": "Writing only the numbers lets one algorithm handle 4 equations or 4 000, and lets a computer store a system as a table.",
    "def-triangular": "A system in staircase form is solved from the bottom up in about n² steps. Elimination is the way to get there.",
    "def-ref": "A solver needs a finite, mechanical procedure that works on every system, including those with no solution or infinitely many.",
    "def-rref": "To describe all solutions, for example every traffic pattern that fits the counts, we must see which unknowns are free and express the others through them.",
    "def-homogeneous": "Ax = 0 describes what the measurements cannot see, such as traffic circulating round a loop. That part can be added to any solution.",
    "def-sum": "Combining data tables, such as this month's stock plus last month's, needs entrywise rules.",
    "def-lincomb": "“Can this resource record be explained by some kit counts?” is the question “is b a combination of the columns of A?” (W01.T2).",
    "def-product": "A pipeline such as kits → resources → cost is two tables applied in turn. Their product is one table for the whole pipeline.",
    "def-transpose": "A certificate weights the equations by y. That is the row combination yᵀA, and transposes are how we write it.",
    "def-inverse": "Recovering a black box's input from its output needs an inverse, and a test for when one exists (W03).",
    "def-elementary": "Recording each row operation as a matrix turns elimination into algebra. That is what makes LU factorization and certificates possible.",
    "def-lu": "Factor once, solve twice: the same A with a new right-hand side should not cost a fresh elimination (W04).",
    "def-blocks": "Large matrices are processed in tiles, on a GPU or in Strassen's algorithm. Block rules say tiles multiply like entries.",
    "def-outer": "A data matrix is often a sum of a few rank-one pieces. The outer-product expansion is where compression starts.",
    "def-layer": "A network layer without an activation is a matrix. Stacking such layers can never do more than one matrix does (W07.T3).",
  },
  practice: {
    "def-system": ["W02.T1"], "def-equivalent": ["W02.T4"], "def-rref": ["W02.T2"], "def-homogeneous": ["W02.T2"],
    "def-lincomb": ["W01.T2", "W02.T3"], "def-product": ["W01.T1", "W03.T1"], "def-transpose": ["W03.T4"],
    "def-inverse": ["W03.T3", "W03.T5"], "def-lu": ["W04.T1", "W04.T2", "W04.T3"], "def-layer": ["W07.T3"],
  },
  motivation: {
    title: "The traffic mystery",
    story: `<p>Four one-way roads form a loop through four junctions. A counting crew stands at each junction for an hour and records how many more cars leave than arrive. With f₁, …, f₄ the hourly flows on the four roads, the counts say</p>
      ${sysHTML(TRAFFIC, B_OK, ["f₁", "f₂", "f₃", "f₄"])}
      <p>The city wants the flow on every road. A week later a second crew reports 4 instead of 3 at the first junction, and the city's solver prints only “no solution”.</p>`,
    question: "Do the counts determine the four flows? If not, what are all the possibilities? And for the second report, can you <i>prove</i> that no flows fit, in a way that someone without a solver could check?",
    recap: "Balances f₁ − f₄ = 3, f₂ − f₁ = −1, f₃ − f₂ = −2, f₄ − f₃ = 0. The second crew's report changes the first right-hand side to 4.",
    needs: [["def-system", "consistency"], ["def-rref", "free variables"], ["def-homogeneous", "homogeneous systems"], ["def-lincomb", "combinations of equations"]],
    sheet: "W02.T1",
    load: { algo: "gj", text: "1 0 0 -1 | 3\n-1 1 0 0 | -1\n0 -1 1 0 | -2\n0 0 -1 1 | 0", label: "Load the traffic counts into the studio" },
    final: {
      prompt: `<p>(1) Give the flows (f₁, f₂, f₃, f₄) when 5 cars per hour use the fourth road. (2) For the second report, give weights y = (y₁, y₂, y₃, y₄) for the four equations whose combination reads 0 = c with c ≠ 0. That is a certificate of inconsistency.</p>`,
      fields: [{ key: "f", label: "Flows with f₄ = 5", kind: "vec", ph: "f₁, f₂, f₃, f₄" }, { key: "y", label: "Certificate y", kind: "vec", ph: "y₁, y₂, y₃, y₄" }],
      check(v) {
        const msgs = []; let ok = true;
        if (v.f.length !== 4) { ok = false; msgs.push("The flows need 4 entries."); }
        else {
          const r = mvec(TRAFFIC, v.f), good = r.every((x, i) => x.eq(B_OK[i]));
          if (!good) { ok = false; msgs.push(`These flows break a balance: the left-hand sides give ${vstr(r)}, not (3, −1, −2, 0).`); }
          else if (!v.f[3].eq(5)) { ok = false; msgs.push("These flows fit the counts, but f₄ is not 5."); }
          else msgs.push("The flows fit all four balances.");
        }
        if (v.y.length !== 4) { ok = false; msgs.push("The certificate needs 4 weights."); }
        else {
          const l = yA(v.y, TRAFFIC), c = yb(v.y, B_BAD);
          if (!isZeroVec(l)) { ok = false; msgs.push(`With these weights the left-hand sides do not cancel: yᵀA = ${vstr(l)}.`); }
          else if (c.isZero()) { ok = false; msgs.push("The left-hand sides cancel, but so do the right-hand sides: 0 = 0 proves nothing."); }
          else msgs.push(`The weighted sum of the four equations reads 0 = ${fr(c)}: no flows can fit the second report.`);
        }
        return { ok, msg: msgs.join(" ") };
      },
      after: `<p>All solutions form the family f = (3, 2, 0, 0) + t·(1, 1, 1, 1) with t ≥ 0 for nonnegative flows. Counting at junctions cannot see traffic that just circulates round the loop. That circulation, (1, 1, 1, 1), spans the null space N(A).</p>
        <p>The certificate y = (1, 1, 1, 1), or any nonzero multiple, says: add up all four balances. Every car that leaves one junction arrives at the next, so the left-hand sides cancel and the right-hand sides must add up to 0. The second report adds up to 1, so some count is wrong (W02.T3). Gauss–Jordan finds this y automatically if it records its row operations: it is row 4 of E in the studio.</p>`,
    },
  },
  studio: { algos: ["gj", "lu"], sub: "Gauss–Jordan elimination that records its row operations, so every “no solution” comes with a certificate, and LU factorization for solving with many right-hand sides. Step through, predict, check a certificate, or draw an exit ticket." },
  guide: "solve",
  sheets: [
    { week: 1, title: "Matrices as models and black boxes", tasks: [
      { id: "W01.T1", note: "a resource matrix: what rows, columns and entries mean" },
      { id: "W01.T2", note: "recover kit counts, then certify that a changed record has no explanation", load: { algo: "gj", text: "2 1 | 7\n1 2 | 8\n1 0 | 3" } },
      { id: "W01.T3", note: "a linear black box from two observations" }] },
    { week: 2, title: "Systems, elimination, and a traffic mystery", tasks: [
      { id: "W02.T1", note: "the traffic loop", load: { algo: "gj", text: "1 0 0 -1 | 3\n-1 1 0 0 | -1\n0 -1 1 0 | -2\n0 0 -1 1 | 0" } },
      { id: "W02.T2", note: "every solution, with f₃ = t" },
      { id: "W02.T3", note: "prove inconsistency with a combination of equations", load: { algo: "gj", text: "1 0 0 -1 | 4\n-1 1 0 0 | -1\n0 -1 1 0 | -2\n0 0 -1 1 | 0" } },
      { id: "W02.T4", note: "classify x + y = 2, 2x + ay = b for all (a, b)" },
      { id: "W02.T5", note: "exit: one row combination", load: { algo: "gj", text: "1 1 | 1\n2 2 | 3" } }] },
    { week: 3, title: "Composition, inverses, and symmetries", tasks: [
      { id: "W03.T1", note: "RF versus FR: which acts first?" },
      { id: "W03.T3", note: "(AB)⁻¹ = B⁻¹A⁻¹, not A⁻¹B⁻¹" },
      { id: "W03.T4", note: "left and right inverses of non-square matrices" }] },
    { week: 4, title: "Factor once, solve twice", tasks: [
      { id: "W04.T1", note: "eliminate and record the multipliers", load: { algo: "lu", text: "2 1 1\n4 3 3\n2 2 3" } },
      { id: "W04.T2", note: "LU, then two right-hand sides", load: { algo: "lu", text: "2 1 1 | 4\n4 3 3 | 10\n2 2 3 | 7" } },
      { id: "W04.T3", note: "when LU needs a row swap", load: { algo: "lu", text: "0 1\n1 1" } }] },
  ],
  cert: {
    algos: ["gj"], title: "Check a solution, or a certificate of inconsistency",
    help: "Type either a solution x (one entry per unknown) or weights y (one per equation) for the system in the studio. A solution must satisfy every equation. A certificate must make every coefficient cancel, yᵀA = 0, while the right-hand sides do not, yᵀb ≠ 0.",
    fields: () => [{ key: "v", label: "x or y", kind: "vec", ph: "e.g. 1, -1, 2" }],
    check(inst, v) {
      const n = inst.M[0].length - inst.aug, m = inst.M.length, A = inst.M.map(r => r.slice(0, n)), b = inst.aug ? inst.M.map(r => r[n]) : A.map(() => R.of(0));
      const out = [];
      if (v.v.length === n) {
        const Ax = mvec(A, v.v);
        if (Ax.every((x, i) => x.eq(b[i]))) return { ok: true, msg: `As a solution: A·x = b, so x solves the system.${n === m ? "" : ""} Whether it is the only one is a different question: look for free columns.` };
        out.push(`As a solution it fails: A·x = ${vstr(Ax)} but b = ${vstr(b)}.`);
      }
      if (v.v.length === m) {
        const l = yA(v.v, A), c = yb(v.v, b);
        if (isZeroVec(l) && !c.isZero()) return { ok: true, msg: `As a certificate: yᵀA = 0 and yᵀb = ${fr(c)} ≠ 0. Weighting the equations by y gives 0 = ${fr(c)}, so the system has no solution.` };
        out.push(!isZeroVec(l) ? `As a certificate it fails: yᵀA = ${vstr(l)} is not zero, so some unknown survives the combination.` : "As a certificate it fails: yᵀA = 0 but also yᵀb = 0, and 0 = 0 proves nothing.");
      }
      if (!out.length) out.push(`Give ${n} entries for a solution or ${m} for a certificate.`);
      return { ok: false, msg: out.join(" ") };
    },
  },
  tickets: {
    intro: "Two short tasks: solve a 3 × 3 system by elimination, and certify that a 2 × 2 system is inconsistent.",
    make(seed) {
      const rnd = rng("ch1:" + seed);
      let A, x, b;
      do {
        const Lm = [[1, 0, 0], [rint(rnd, -2, 2), 1, 0], [rint(rnd, -2, 2), rint(rnd, -2, 2), 1]];
        const U = [[pick(rnd, [1, 2, -1]), rint(rnd, -2, 2), rint(rnd, -2, 2)], [0, pick(rnd, [1, -1, 2]), rint(rnd, -2, 2)], [0, 0, pick(rnd, [1, -1, 2, -2])]];
        A = rm(Lm.map(r => U[0].map((_, j) => r.reduce((s, a, k) => s + a * U[k][j], 0))));
        x = rm([rint(rnd, -3, 3), rint(rnd, -3, 3), rint(rnd, -3, 3)]);
        b = mvec(A, x);
      } while (det(A).isZero() || A.some(r => r.every(c => c.isZero())));
      const p = rnz(rnd, -3, 3), q = rnz(rnd, -3, 3), k = pick(rnd, [2, 3, -2, -3]), c1 = rint(rnd, -4, 4);
      let c2; do c2 = rint(rnd, -9, 9); while (c2 === k * c1);
      const A2 = rm([[p, q], [k * p, k * q]]), b2 = rm([c1, c2]), y = rm([k, -1]);
      return {
        html: `<ol><li>Solve by Gaussian elimination, writing down every row operation:${sysHTML(A, b)}</li>
          <li>Prove with a single combination of the two equations that this system has no solution, and say what the certificate means geometrically:${sysHTML(A2, b2, ["x", "y"])}</li></ol>`,
        key: `1. x = ${vstr(x)}. 2. y = (${k}, −1): ${k}·(eq. 1) − (eq. 2) gives 0 = ${fr(R.of(k * c1 - c2))}. The two lines are parallel and distinct.`,
        data: { A, b, x, A2, b2, y },
        selfCheck() {
          const s = solve(A, b);
          return !det(A).isZero() && s.every((v, i) => v.eq(x[i])) && isZeroVec(yA(y, A2)) && !yb(y, b2).isZero();
        },
      };
    },
  },
});
})();
