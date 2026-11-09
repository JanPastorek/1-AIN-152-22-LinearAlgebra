/* Chapter 4: motivating problem, why-strips, studio, guide, sheets, certificates and exit tickets. */
(function () {
const L = window.LabPlus, { R, rm, mmul, mvec, ident, meq, fr, vstr, mhtml, parsePipeline, rng, rint, pick } = L;
const H = rm([[0, -1, 2], [1, 0, 1], [0, 0, 1]]);
const img = (M, p) => mvec(M, [R.of(p[0]), R.of(p[1]), R.of(1)]);
const ptxt = v => `(${fr(v[0])}, ${fr(v[1])})`;
const pipeM = ops => ops.reduce((P, op) => mmul(op.T, P), ident(3));

L.chapter({
  chapter: 4,
  why: {
    "def-lin": "If a map is linear, two measurements, the images of e₁ and e₂, determine it everywhere. Without linearity, no finite set of tests can (W01.T3, W01.T4).",
    "def-ker": "The kernel is exactly what a map destroys, like the information a bottleneck layer loses for good (W07.T3).",
    "def-std": "A computer can only apply a map it can store. For a linear map on ℝⁿ, n columns are enough.",
    "def-rep": "Differentiation, evaluation and other maps between polynomials become matrices once bases are fixed, and then all of Chapters 1–3 applies (W07.T1).",
    "def-hom": "A translation moves the origin, so it is not a matrix product in the plane. Graphics hardware only multiplies matrices; one extra coordinate fixes that (W11).",
    "def-sim": "A change of basis can make a map's matrix diagonal or simple. Similar matrices are the same map seen in different coordinates (W10.T2).",
  },
  practice: { "def-lin": ["W01.T3", "W07.T4"], "def-ker": ["W07.T1", "W07.T2", "W07.T5"], "def-std": ["W01.T3"], "def-rep": ["W07.T1", "W10.T4"], "def-hom": ["W11.T1", "W11.T2", "W11.T5"], "def-sim": ["W10.T2", "W10.T3"] },
  motivation: {
    title: "One matrix for the whole animation",
    story: `<p>A game draws a crate as the unit square. Its animation script says: first turn the crate a quarter turn counterclockwise about the origin, then move it by (2, 1). The graphics card can do exactly one thing to every corner of every crate: multiply by a single matrix that is loaded once per frame.</p>
      <div class="lp-data">step 1: rotate 90° counterclockwise
step 2: translate by (2, 1)</div>`,
    question: "Which single matrix does both steps? Is “rotate, then move” a linear map at all? And which matrix undoes it, when the crate has to return?",
    recap: "Rotate a quarter turn counterclockwise about the origin, then translate by (2, 1).",
    needs: [["def-lin", "linearity"], ["def-std", "standard matrix"], ["def-hom", "homogeneous coordinates"]],
    sheet: "W11.T1",
    load: { algo: "compose", text: "rotate 90\ntranslate 2 1", label: "Load the animation into the studio" },
    final: {
      prompt: `<p>Give the 3 × 3 homogeneous matrix H of the whole animation, one row per line, and the matrix of the map that undoes it.</p>`,
      fields: [{ key: "h", label: "H", kind: "mat", rows: 3, ph: "a b c\nd e f\n0 0 1" }, { key: "g", label: "H⁻¹ (undo)", kind: "mat", rows: 3, ph: "…" }],
      check(v) {
        const msgs = []; let ok = true;
        const shape = M => M.length === 3 && M.every(r => r.length === 3);
        if (!shape(v.h)) { ok = false; msgs.push("H must be 3 × 3."); }
        else if (meq(v.h, H)) msgs.push(`H is right: the corners 0, e₁, e₂ go to ${[[0, 0], [1, 0], [0, 1]].map(p => ptxt(img(H, p))).join(", ")}.`);
        else {
          ok = false;
          const wrong = [[0, 0], [1, 0], [0, 1]].filter(p => img(v.h, p).some((x, i) => !x.eq(img(H, p)[i]))).map(p => `(${p})`);
          msgs.push(`Your H sends ${wrong.join(", ")} to the wrong place.${meq(v.h, rm([[0, -1, -1], [1, 0, 2], [0, 0, 1]])) ? " This is translate-then-rotate. Which step acts first?" : ""}`);
        }
        if (!shape(v.g)) { ok = false; msgs.push("H⁻¹ must be 3 × 3."); }
        else if (meq(mmul(H, v.g), ident(3))) msgs.push("H·H⁻¹ = I, so this undoes the animation.");
        else { ok = false; msgs.push("H times your matrix is not I. Undo the steps in reverse order: move back first, then turn back."); }
        return { ok, msg: msgs.join(" ") };
      },
      after: `<p>H = T·R = [[0, −1, 2], [1, 0, 1], [0, 0, 1]]: the step that acts last stands on the left. The map is affine, not linear, because it sends 0 to (2, 1). In homogeneous coordinates it is a matrix product all the same, which is the whole point of the extra coordinate. Translating first and then rotating gives R·T = [[0, −1, −1], [1, 0, 2], [0, 0, 1]], a different matrix (W11.T2).</p>
        <p>The inverse undoes the steps in reverse order: H⁻¹ = R⁻¹T⁻¹ = [[0, 1, −1], [−1, 0, 2], [0, 0, 1]]. A displacement (u, v, 0) ignores the translation column, which is why direction vectors and points behave differently.</p>`,
    },
  },
  studio: { algos: ["compose", "rref"], sub: "Compose plane transformations as 3 × 3 homogeneous matrices and watch the unit square move, or row-reduce a standard matrix to find its kernel and image." },
  guide: "pipeline",
  sheets: [
    { week: 7, title: "Linear maps beyond coordinate vectors", tasks: [
      { id: "W07.T1", note: "D(p) = p′ from P₂ to P₁: its matrix, kernel and image", load: { algo: "rref", text: "0 1 0\n0 0 2" } },
      { id: "W07.T2", note: "E(p) = (p(0), p(1)): matrix and kernel", load: { algo: "rref", text: "1 0 0\n1 1 1" } },
      { id: "W07.T3", note: "a linear network loses a direction", load: { algo: "rref", text: "1 0 1\n0 1 1" } },
      { id: "W07.T4", note: "F(0) = 0 does not prove linearity" }] },
    { week: 10, title: "Same vector, different coordinates", tasks: [
      { id: "W10.T2", note: "the matrix of diag(2, 1) in a new basis" },
      { id: "W10.T4", note: "the general change-of-basis formula" }] },
    { week: 11, title: "Affine geometry and a tiny graphics pipeline", tasks: [
      { id: "W11.T1", note: "quarter-turn, then translate by (2, 1)", load: { algo: "compose", text: "rotate 90\ntranslate 2 1" } },
      { id: "W11.T2", note: "the other order", load: { algo: "compose", text: "translate 2 1\nrotate 90" } },
      { id: "W11.T5", note: "exit: translation by (−1, 2)", load: { algo: "compose", text: "translate -1 2" } }] },
  ],
  cert: {
    algos: ["compose"], title: "Check your matrix for the pipeline",
    help: "Work out the 3 × 3 homogeneous matrix of the pipeline in the studio on paper, then type it here, one row per line. The check tells you which corners land in the wrong place, never the matrix itself.",
    fields: () => [{ key: "m", label: "M", kind: "mat", rows: 3, ph: "a b c\nd e f\n0 0 1" }],
    check(inst, v) {
      const M = pipeM(inst.ops), X = v.m;
      if (X.length !== 3 || X.some(r => r.length !== 3)) return { ok: false, msg: "Type three rows of three entries." };
      if (meq(X, M)) return { ok: true, msg: "Right: every point (x, y, 1) lands where the pipeline sends it." };
      const rev = inst.ops.slice().reverse().reduce((P, op) => mmul(op.T, P), ident(3));
      const bad = [[0, 0], [1, 0], [0, 1]].filter(p => img(X, p).some((x, i) => !x.eq(img(M, p)[i]))).map(p => `(${p})`);
      return { ok: false, msg: (bad.length ? `It sends ${bad.join(", ")} to the wrong place.` : "The corners are right but the last row is not (0, 0, 1).") + (meq(X, rev) && inst.ops.length > 1 ? " This is the product in the wrong order: the first step must be the rightmost factor." : "") };
    },
  },
  tickets: {
    intro: "Write a two-step pipeline as one homogeneous matrix.",
    make(seed) {
      const rnd = rng("ch4:" + seed);
      const lin = () => pick(rnd, ["rotate 90", "rotate -90", "rotate 180", "reflect x", "reflect y", "reflect diag", `scale ${pick(rnd, [2, 3, -1])} ${pick(rnd, [1, 2, "1/2"])}`, `shear ${pick(rnd, [1, -1, 2])}`]);
      const tr = () => `translate ${rint(rnd, -3, 3) || 1} ${rint(rnd, -3, 3) || -1}`;
      const steps = rnd() < 0.5 ? [lin(), tr()] : [tr(), lin()];
      const ops = parsePipeline(steps.join("\n")).ops, M = pipeM(ops);
      const p = [rint(rnd, -3, 3), rint(rnd, -3, 3)];
      const moves = !(M[0][2].isZero() && M[1][2].isZero());
      return {
        html: `<ol><li>A sprite is transformed by: first <b>${steps[0]}</b>, then <b>${steps[1]}</b>. Give the 3 × 3 homogeneous matrix of the whole pipeline.</li><li>Where does the point (${p[0]}, ${p[1]}) go?</li><li>Is the pipeline a linear map of the plane? Justify in one sentence.</li></ol>`,
        key: `1. ${mhtml(M, { small: true })} 2. ${ptxt(img(M, p))}. 3. ${moves ? `No: it sends 0 to ${ptxt(img(M, [0, 0]))} ≠ 0.` : "Yes: the translation is undone, and 0 stays at 0."}`,
        data: { steps, M },
        selfCheck() {
          const q = ops.reduce((v, op) => mvec(op.T, v), [R.of(p[0]), R.of(p[1]), R.of(1)]);
          return q.every((x, i) => x.eq(img(M, p)[i]));
        },
      };
    },
  },
});
})();
