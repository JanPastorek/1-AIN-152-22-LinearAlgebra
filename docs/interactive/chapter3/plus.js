/* Chapter 3: motivating problem, why-strips, studio, guide, sheets, certificates and exit tickets. */
(function () {
const L = window.LabPlus, { R, rm, mvec, dot, isZeroVec, det, rank, tr, fr, vstr, mhtml, rng, rint, rnz } = L;
const TOMO = rm([[1, 1, 0, 0], [0, 0, 1, 1], [1, 0, 1, 0], [0, 1, 0, 1]]);
const K = rm([1, -1, -1, 1]);

L.chapter({
  chapter: 3,
  why: {
    "def-vs": "The same ideas of combination, span and basis apply to arrows, images, polynomials and signals, so we define them once for every vector space.",
    "def-sub": "The images a scanner cannot tell apart, and every flow pattern a set of counts allows, are subspaces. A subspace is described by a few vectors instead of infinitely many.",
    "def-span": "“Which images can these measurements produce?” is a question about a span.",
    "def-indep": "Redundant measurements cost money and add nothing. Independence is the exact test for redundancy (W05.T1).",
    "def-basis": "A basis is the smallest set of directions that describes everything, and its size, the dimension, counts the degrees of freedom.",
    "def-coord": "The same vector has different coordinates in different bases, for example pixels or sums and differences. We need the dictionary between them (W10.T1).",
    "def-rank": "Rank counts the independent measurements, and nullity counts what they cannot see. The two always add up to the number of unknowns (W06).",
  },
  practice: { "def-span": ["W05.T1"], "def-indep": ["W05.T1"], "def-sub": ["W05.T2"], "def-basis": ["W05.T1", "W05.T3"], "def-coord": ["W10.T1", "W10.T2"], "def-rank": ["W06.T2", "W06.T4", "W06.T5"] },
  motivation: {
    title: "Tiny tomography",
    story: `<p>A scanner looks at a 2 × 2 image with unknown pixel brightnesses</p>
      <div class="lp-data">[ p  q ]
[ r  s ]</div>
      <p>It measures four sums: the two rows and the two columns. For one patient it reports p + q = 5, r + s = 9, p + r = 6, q + s = 8. Four equations, four unknowns, so the manufacturer claims that the image is determined.</p>`,
    question: "Is it? If two different images give the same four readings, find a pair. And which fifth measurement would make every reconstruction unique?",
    recap: "Measurements p + q = 5, r + s = 9, p + r = 6, q + s = 8 of the image (p, q, r, s).",
    needs: [["def-sub", "null space"], ["def-indep", "linear dependence"], ["def-basis", "basis and dimension"], ["def-rank", "rank and nullity"]],
    sheet: "W05.T2",
    load: { algo: "rref", text: "1 1 0 0\n0 0 1 1\n1 0 1 0\n0 1 0 1", label: "Load the scanner matrix into the studio" },
    final: {
      prompt: `<p>(1) Give a nonzero change k = (Δp, Δq, Δr, Δs) that the scanner cannot see, so that A·k = 0. Two images that differ by k give identical readings. (2) Give a fifth sensor as a row w = (w₁, w₂, w₃, w₄), measuring w₁p + w₂q + w₃r + w₄s, that tells every such pair apart.</p>`,
      fields: [{ key: "k", label: "Invisible change k", kind: "vec", ph: "Δp, Δq, Δr, Δs" }, { key: "w", label: "Fifth sensor w", kind: "vec", ph: "w₁, w₂, w₃, w₄" }],
      check(v) {
        const msgs = []; let ok = true;
        if (v.k.length !== 4) { ok = false; msgs.push("k needs 4 entries."); }
        else if (isZeroVec(v.k)) { ok = false; msgs.push("k = 0 changes nothing; the point is a nonzero change."); }
        else { const Ak = mvec(TOMO, v.k); if (!isZeroVec(Ak)) { ok = false; msgs.push(`The scanner does see this change: A·k = ${vstr(Ak)}.`); } else msgs.push("A·k = 0 with k ≠ 0: the scanner cannot tell an image from the same image plus k, so the four readings do not determine it."); }
        if (v.w.length !== 4) { ok = false; msgs.push("w needs 4 entries."); }
        else if (dot(v.w, K).isZero()) { ok = false; msgs.push("This sensor gives the same reading on some pairs of images that the other four already confuse. Test it on an invisible change."); }
        else msgs.push("w·k ≠ 0 for the invisible direction, so the five readings together determine the image.");
        return { ok, msg: msgs.join(" ") };
      },
      after: `<p>Row reduction gives rank A = 3, not 4: the measurements are dependent, because (row sum 1) + (row sum 2) = (column sum 1) + (column sum 2) is the total brightness counted twice. The null space is one-dimensional, spanned by k = (1, −1, −1, 1), a checkerboard that adds to every row and column sum 0. All images with these readings are (1, 4, 5, 4) + t·(1, −1, −1, 1), and nonnegative pixels need −1 ≤ t ≤ 4.</p>
        <p>A fifth sensor w works exactly when w·k ≠ 0. The diagonal p + s gives w·k = 2, so it works. The total p + q + r + s gives w·k = 0, so it adds nothing new: it is already a combination of the other rows (W05.T3).</p>`,
    },
  },
  studio: { algos: ["rref"], sub: "Row reduction decides dependence: the pivot columns are a basis, the free columns give the dependence relations, and the null space comes out with them." },
  guide: "basis",
  sheets: [
    { week: 5, title: "Basis, hidden directions, and tiny tomography", tasks: [
      { id: "W05.T1", note: "e₁, e₂, e₁ + e₂: spanning but not independent", load: { algo: "rref", text: "1 0 1\n0 1 1\n0 0 0" } },
      { id: "W05.T2", note: "all images with the same four readings: the kernel of the scanner matrix", load: { algo: "rref", text: "1 1 0 0\n0 0 1 1\n1 0 1 0\n0 1 0 1" } },
      { id: "W05.T3", note: "kernel basis, rank, and which fifth sensor helps" },
      { id: "W05.T5", note: "exit: the sensor 2p + q = 9" }] },
    { week: 6, title: "Rank, nullity, and spaces that must not be confused", tasks: [
      { id: "W06.T2", note: "rank, kernel basis and column-space basis", load: { algo: "rref", text: "1 2 3 1\n1 1 2 1\n1 2 3 1" } },
      { id: "W06.T4", note: "row reduction changes the column space", load: { algo: "rref", text: "1 0\n1 0" } },
      { id: "W06.T5", note: "exit: rank 2 from ℝ⁵ to ℝ³" }] },
    { week: 10, title: "Same vector, different coordinates", tasks: [
      { id: "W10.T1", note: "coordinates of (3, 1) in the basis (1, 1), (1, −1)" },
      { id: "W10.T3", note: "S⁻¹AS, not SAS⁻¹" }] },
  ],
  cert: {
    algos: ["rref"], title: "Check a dependence relation",
    help: "To show the columns a₁, …, aₙ in the studio are dependent, give coefficients c = (c₁, …, cₙ), not all zero, with c₁a₁ + … + cₙaₙ = 0. Independence has no such short certificate. The proof is a pivot in every column.",
    fields: inst => [{ key: "c", label: `c (${inst.M[0].length} entries)`, kind: "vec", ph: "c₁, c₂, …" }],
    check(inst, v) {
      const A = inst.M, n = A[0].length;
      if (v.c.length !== n) return { ok: false, msg: `Give one coefficient per column: ${n}.` };
      if (isZeroVec(v.c)) return { ok: false, msg: "All-zero coefficients always give 0, so they prove nothing." };
      const s = mvec(A, v.c);
      return isZeroVec(s) ? { ok: true, msg: `Σ cⱼaⱼ = 0 with c ≠ 0: the columns are linearly dependent, and every column with cⱼ ≠ 0 is a combination of the others.` } : { ok: false, msg: `Σ cⱼaⱼ = ${vstr(s)}, not 0.` };
    },
  },
  tickets: {
    intro: "Decide linear dependence by row reduction and read off a basis.",
    make(seed) {
      const rnd = rng("ch3:" + seed);
      let V; do V = Array.from({ length: 3 }, () => rm([rint(rnd, -2, 3), rint(rnd, -2, 3), rint(rnd, -2, 3)])); while (det(tr(V)).isZero());
      const a = rnz(rnd, -2, 2), b = rnz(rnd, -2, 2), v4 = V[0].map((x, i) => x.mul(a).add(V[1][i].mul(b)));
      const order = [[0, 1, 2, 3], [0, 3, 1, 2], [3, 0, 1, 2], [0, 1, 3, 2]][rint(rnd, 0, 3)];
      const all = [V[0], V[1], V[2], v4], vecs = order.map(i => all[i]);
      const c = [R.of(0), R.of(0), R.of(0), R.of(0)]; c[order.indexOf(0)] = R.of(a); c[order.indexOf(1)] = R.of(b); c[order.indexOf(3)] = R.of(-1);
      const A = tr(vecs);
      return {
        html: `<ol><li>Are v₁, v₂, v₃, v₄ linearly independent? If not, give a nontrivial dependence relation.<p>${vecs.map((v, i) => `v${"₁₂₃₄"[i]} = ${vstr(v)}`).join(", &nbsp;")}</p></li><li>Give a basis of Span(v₁, v₂, v₃, v₄) chosen from the vᵢ, and its dimension.</li><li>Without computing, explain why four vectors in ℝ³ can never be independent.</li></ol>`,
        key: `1. Dependent: ${c.map((x, i) => [x, i]).filter(([x]) => !x.isZero()).map(([x, i]) => `${fr(x)}·v${"₁₂₃₄"[i]}`).join(" + ")} = 0. 2. The pivot columns of the row-reduced matrix, dimension 3 (the span is ℝ³). 3. Theorem 3.4.1: ℝ³ is spanned by 3 vectors, so any 4 vectors in it are dependent.`,
        data: { A, c },
        selfCheck: () => isZeroVec(mvec(A, c)) && !isZeroVec(c) && rank(A) === 3,
      };
    },
  },
});
})();
