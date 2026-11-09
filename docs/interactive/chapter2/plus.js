/* Chapter 2: motivating problem, why-strips, studio, guide, sheets, certificates and exit tickets. */
(function () {
const L = window.LabPlus, { R, rm, mmul, mvec, ident, meq, isZeroVec, det, detCofactor, fr, vstr, mhtml, rng, rint } = L;
const M = rm([[1, 2], [3, 1]]);

L.chapter({
  chapter: 2,
  why: {
    "def-minor": "Expanding a determinant needs smaller determinants, and the cofactor signs keep the bookkeeping right. A row full of zeros then saves most of the work.",
    "def-det": "One number has to answer whether a square system has exactly one solution, and by how much a map stretches area.",
    "def-rowops": "Expanding a 10 × 10 determinant by cofactors needs about 3.6 million products. Elimination needs a few hundred, if we know what each row operation does to det.",
    "def-singular": "A graphics or physics engine must know whether a transformation can be undone, and what composing two maps does to area (W08.T3).",
    "def-adj": "An exact formula for A⁻¹ shows where the inverse breaks down, which is wherever det A = 0 (W08.T4).",
    "def-cramer": "A single unknown, such as one price or one current, can be found without solving for all the others.",
  },
  practice: { "def-det": ["W08.T1", "W08.T2"], "def-rowops": ["W08.T2"], "def-singular": ["W08.T3", "W08.T5"], "def-adj": ["W08.T4"] },
  motivation: {
    title: "The mirrored map",
    story: `<p>A mapping app draws a surveyed field, the triangle with corners P = (1, 1), Q = (5, 2), S = (2, 6), on screen with the linear map</p>
      <div class="lp-data">x ↦ Mx,   M = [ 1  2 ]
            [ 3  1 ]</div>
      <p>The app needs the field's area on screen, to label it. It also needs to know whether the map mirrors shapes, because a mirrored triangle has its corners in clockwise order and the app's “did the user tap inside?” test then gives wrong answers. Transforming every corner and recomputing works for one triangle. The app draws millions.</p>`,
    question: "Without transforming the corners, what is the signed area of the image triangle P′Q′S′? Is the map mirroring, and can it be undone?",
    recap: "Triangle P = (1, 1), Q = (5, 2), S = (2, 6), map M = [[1, 2], [3, 1]].",
    needs: [["def-det", "the determinant"], ["def-rowops", "row operations"], ["def-singular", "product rule"]],
    sheet: "W08.T1",
    load: { algo: "det", text: "1 1 1\n5 2 1\n2 6 1", label: "Load the triangle's determinant into the studio" },
    final: {
      prompt: `<p>The signed area of a triangle is ½·det[[x₁, y₁, 1], [x₂, y₂, 1], [x₃, y₃, 1]], positive when the corners run counterclockwise. Give det M and the signed area of P′Q′S′.</p>`,
      fields: [{ key: "d", label: "det M", kind: "num", ph: "e.g. 7" }, { key: "a", label: "Signed area of P′Q′S′", kind: "num", ph: "e.g. 35/2" }],
      check(v) {
        const dM = det(M), area = det(rm([[1, 1, 1], [5, 2, 1], [2, 6, 1]])).div(2), img = dM.mul(area);
        const msgs = []; let ok = true;
        if (!v.d.eq(dM)) { ok = false; msgs.push("det M is not right yet: ad − bc for M."); } else msgs.push(`det M = ${fr(dM)}.`);
        if (v.a.eq(img)) msgs.push(`Signed area ${fr(img)}: by the product rule, the image's signed area is det M times the original's.`);
        else if (v.a.eq(img.neg())) { ok = false; msgs.push("The size is right but the sign is not. Does the map keep the counterclockwise order?"); }
        else { ok = false; msgs.push("The area is off. Find the original triangle's signed area first, then use what det M does to areas."); }
        return { ok, msg: msgs.join(" ") };
      },
      after: `<p>The original triangle has signed area ½·det[[1, 1, 1], [5, 2, 1], [2, 6, 1]] = 19/2, counterclockwise. det M = −5, so every area is multiplied by 5 and the orientation flips: P′Q′S′ has signed area −95/2, clockwise. The app reverses the corner order once, for the whole map, instead of per triangle.</p>
        <p>Why it works: the area of P′Q′S′ is ½·|det[MQ − MP, MS − MP]| = ½·|det(M·[Q − P, S − P])|, and the product rule det(AB) = det A·det B (Theorem 2.2.3) splits it into det M times the original. Since det M ≠ 0, the map can be undone.</p>`,
    },
  },
  studio: { algos: ["det"], sub: "The determinant by elimination: watch each row operation's effect, predict the sign changes, check a singularity certificate, or draw an exit ticket." },
  guide: "det",
  sheets: [
    { week: 8, title: "Determinants: area, orientation, and hypotheses", tasks: [
      { id: "W08.T1", note: "I, H, D, F, P on the unit square: area factor and orientation" },
      { id: "W08.T2", note: "a 3 × 3 determinant, keeping track of swaps", load: { algo: "det", text: "2 1 3\n0 -1 4\n5 2 0" } },
      { id: "W08.T3", note: "det 1 is not the same as a rotation; the product rule" },
      { id: "W08.T4", note: "det of [[a, b, b], [a, a, b], [a, a, a]] for all (a, b)", load: { algo: "det", text: "2 1 1\n2 2 1\n2 2 2" } },
      { id: "W08.T5", note: "exit: what det A = −2 does and does not tell you" }] },
    { week: 13, title: "The matrix museum", tasks: [{ id: "W13.T2", note: "rank, determinant, kernel and image of six exhibit matrices", load: { algo: "det", text: "1 1\n0 1" } }] },
  ],
  cert: {
    algos: ["det"], title: "Certify singular or nonsingular",
    help: "A determinant claim can be checked without recomputing it. To show det A = 0, give a nonzero x with Ax = 0, typed as one row. To show det A ≠ 0, give a matrix B with AB = I: then det A·det B = 1.",
    fields: inst => [{ key: "m", label: "x (one row) or B (n rows)", kind: "mat", rows: Math.min(4, inst.M.length), ph: "1 -2 1" }],
    check(inst, v) {
      const A = inst.M.map(r => r.slice(0, r.length - inst.aug)), n = A.length, X = v.m;
      if (A[0].length !== n) return { ok: false, msg: "The studio's matrix is not square." };
      if (X.length === n && X[0].length === n && n > 1) {
        const P = mmul(A, X);
        return meq(P, ident(n)) ? { ok: true, msg: "AB = I, so det A·det B = det I = 1 and det A ≠ 0: A is nonsingular." } : { ok: false, msg: `AB is not I:${mhtml(P, { small: true })}` };
      }
      const x = X.flat();
      if (x.length !== n) return { ok: false, msg: `Give x with ${n} entries, or an ${n} × ${n} matrix B.` };
      if (isZeroVec(x)) return { ok: false, msg: "x = 0 always gives Ax = 0, so it proves nothing. The certificate must be nonzero." };
      const Ax = mvec(A, x);
      return isZeroVec(Ax) ? { ok: true, msg: "Ax = 0 with x ≠ 0: the columns are dependent, so det A = 0." } : { ok: false, msg: `Ax = ${vstr(Ax)}, not 0.` };
    },
  },
  tickets: {
    intro: "Compute a 3 × 3 determinant by elimination and use the properties of det.",
    make(seed) {
      const rnd = rng("ch2:" + seed);
      let A; do A = rm(Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => rint(rnd, -3, 3)))); while (det(A).isZero() || A[0][0].isZero());
      const d = det(A);
      return {
        html: `<ol><li>Compute det A by row operations, saying for each operation what it does to the determinant:${mhtml(A)}</li><li>Give det(2A), det(Aᵀ) and det(A⁻¹).</li><li>Does x ↦ Ax preserve orientation? By what factor does it scale volume?</li></ol>`,
        key: `1. det A = ${fr(d)}. 2. det(2A) = 8·det A = ${fr(d.mul(8))}; det(Aᵀ) = ${fr(d)}; det(A⁻¹) = ${fr(R.of(1).div(d))}. 3. ${d.sign() > 0 ? "Yes" : "No, it reverses orientation"}; volumes scale by ${fr(d.abs())}.`,
        data: { A, d },
        selfCheck: () => detCofactor(A).eq(d) && !d.isZero(),
      };
    },
  },
});
})();
