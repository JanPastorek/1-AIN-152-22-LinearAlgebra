// Dependency-free tests for assets/lab-plus.js and chapterN/plus.js.
//   node docs/interactive/tools/test-plus.js          (add --no-python to skip running the Python exports)
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), { execFileSync } = require("child_process");
const BASE = path.join(__dirname, ".."), ROOT = path.join(BASE, "..", "..");
let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) pass++; else { fail++; console.log("FAIL", name); } };

const ctx = { console, Math, JSON, BigInt, Number, String, Array, Object, Set, Map, Error, isFinite, parseInt, parseFloat };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(BASE, "assets/lab-plus.js"), "utf8"), ctx, { filename: "lab-plus.js" });
for (let n = 1; n <= 7; n++) vm.runInContext(fs.readFileSync(path.join(BASE, `chapter${n}/plus.js`), "utf8"), ctx, { filename: `chapter${n}/plus.js` });
const L = ctx.LabPlus, { R, rm, mmul, mvec, ident, meq, dot, col, tr, isZeroVec, det, detCofactor, solve, nullBasis, rank, inv, charpoly, ALGOS, GUIDES, walk } = L;

// ---- rationals and parsing
ok(R.parse("-5/2").eq(R.of(-5).div(2)) && R.parse("0.125").eq(R.of(1).div(8)) && R.parse("−3").eq(R.of(-3)) && R.parse("1e-3").eq(R.of(1).div(1000)) && R.parse("0.5/3").eq(R.of(1).div(6)), "R.parse forms");
ok(R.parse("abc") === null && R.parse("1/0") === null && R.parse("") === null, "R.parse rejects");
ok(L.parseMatrix("1 2 | 3\n4 5 | 6").aug === 1 && L.parseMatrix("1 2\n3").error && L.parseMatrix("1 | 2 | 3").error, "parseMatrix");

// ---- deterministic random instances
const rnd = L.rng("tests");
const rmat = (m, n, lo = -3, hi = 3) => rm(Array.from({ length: m }, () => Array.from({ length: n }, () => L.rint(rnd, lo, hi))));

// ---- every preset of every algorithm: frames are well formed
for (const [key, a] of Object.entries(ALGOS)) {
  ok(a.pseudo && a.pseudo.length && a.idea && / Idea: /.test(a.idea) && /^How it works: /.test(a.idea), `${key}: pseudocode and IDEAS present`);
  ok(typeof a.python === "function" && a.presets.length >= 2, `${key}: python export and presets`);
  for (const p of a.presets) {
    const inst = L.parseInstance(a, p.text);
    ok(!inst.error, `${key}/${p.name}: parses`);
    if (inst.error) continue;
    const F = a.run(inst, p.params || {});
    ok(F.length >= 2, `${key}/${p.name}: frames`);
    F.forEach((f, i) => {
      ok(Number.isInteger(f.line) && f.line >= 0 && f.line < a.pseudo.length, `${key}/${p.name} frame ${i}: line index valid`);
      ok(Array.isArray(f.M) && f.M.length && typeof f.msg === "string" && f.msg.length, `${key}/${p.name} frame ${i}: matrix and message`);
      if (f.ask) {
        ok(Array.isArray(f.ask.answer) && f.ask.answer.length > 0, `${key}/${p.name} frame ${i}: ask has answers`);
        if (f.ask.type === "choice") ok(f.ask.answer.every(x => f.ask.options.includes(x)), `${key}/${p.name} frame ${i}: answers are options`);
        else ok(f.ask.answer.every(x => R.parse(x)), `${key}/${p.name} frame ${i}: numeric answers parse`);
      }
    });
    ok(!!F[F.length - 1].cert, `${key}/${p.name}: last frame carries a result`);
  }
}

// ---- ask answer sets are right (checked against an independent computation)
function asksOf(a, inst, prm) { const F = a.run(inst, prm || {}); return { F, asks: F.map((f, i) => [f, i]).filter(([f]) => f.ask) }; }
for (let t = 0; t < 40; t++) {
  // Gauss–Jordan: the accepted pivot rows are exactly the rows with a nonzero entry
  const m = L.rint(rnd, 2, 4), n = L.rint(rnd, 2, 4), M = rmat(m, n + 1, -2, 2);
  const { F } = asksOf(ALGOS.gj, { M, aug: 1 });
  const last = F[F.length - 1];
  const x = solve(M.map(r => r.slice(0, n)), M.map(r => r[n]));
  ok((last.cert.kind === "inconsistent") === (x === null), `gj #${t}: consistency agrees with solve()`);
  if (last.cert.kind === "inconsistent") {
    const y = last.cert.y, yA = M[0].slice(0, n).map((_, j) => y.reduce((s, c, k) => s.add(c.mul(M[k][j])), R.of(0)));
    ok(isZeroVec(yA) && !y.reduce((s, c, k) => s.add(c.mul(M[k][n])), R.of(0)).isZero(), `gj #${t}: certificate y valid`);
  } else {
    const A = M.map(r => r.slice(0, n)), b = M.map(r => r[n]);
    ok(mvec(A, last.cert.xp).every((v, i) => v.eq(b[i])) && last.cert.N.every(v => isZeroVec(mvec(A, v))), `gj #${t}: particular solution and null space`);
    ok(last.cert.N.length === n - rank(A), `gj #${t}: number of free variables`);
  }
  const howAsk = F.filter(f => f.ask && /How many solutions/.test(f.ask.prompt))[0];
  const how = last.cert.kind === "inconsistent" ? "none" : last.cert.N.length ? "infinitely many" : "exactly one";
  ok(howAsk && howAsk.ask.answer[0] === how, `gj #${t}: "how many" answer`);
  // rref: rank ask
  const A2 = rmat(L.rint(rnd, 2, 4), L.rint(rnd, 2, 5), -2, 2), F2 = ALGOS.rref.run({ M: A2, aug: 0 });
  ok(F2.filter(f => f.ask && /rank/.test(f.ask.prompt))[0].ask.answer[0] === String(rank(A2)), `rref #${t}: rank answer`);
  ok(F2[F2.length - 1].cert.N.every(v => isZeroVec(mvec(A2, v))), `rref #${t}: null space`);
  F2.filter(f => f.ask && /pivot\?/.test(f.ask.prompt)).forEach(f => { const j = +/column (\d+)/.exec(f.ask.prompt)[1] - 1; ok(f.ask.answer[0] === (F2[F2.length - 1].cert.piv.includes(j) ? "yes" : "no"), `rref #${t}: pivot-column answer col ${j + 1}`); });
  // determinant
  const k = L.rint(rnd, 2, 4), D = rmat(k, k), FD = ALGOS.det.run({ M: D, aug: 0 }), d = detCofactor(D);
  ok(FD[FD.length - 1].cert.value.eq(d), `det #${t}: elimination = cofactor`);
  const fin = FD.filter(f => f.ask && /what is det/.test(f.ask.prompt))[0];
  ok(d.isZero() || (fin && R.parse(fin.ask.answer[0]).eq(d)), `det #${t}: final numeric ask equals det`);
  // LU: multiplier asks equal the entries of L
  const U0 = rmat(3, 3), FL = ALGOS.lu.run({ M: U0, aug: 0 }), cl = FL[FL.length - 1].cert;
  if (cl.kind === "lu") {
    ok(meq(mmul(cl.L, cl.U), U0), `lu #${t}: LU = A`);
    FL.filter(f => f.ask).forEach(f => { const [, i, j] = /l\((\d+),(\d+)\)/.exec(f.ask.prompt); ok(R.parse(f.ask.answer[0]).eq(cl.L[i - 1][j - 1]), `lu #${t}: ask l(${i},${j})`); });
  }
  // Gram–Schmidt: orthogonality, coefficients and least squares
  const G = rmat(4, 3), b = rmat(4, 1).map(r => r[0]), FG = ALGOS.gs.run({ M: G.map((r, i) => r.concat([b[i]])), aug: 1 }), cg = FG[FG.length - 1].cert;
  if (cg.kind === "lsq") {
    for (let i = 0; i < cg.q.length; i++) for (let j = 0; j < i; j++) ok(dot(cg.q[i], cg.q[j]).isZero(), `gs #${t}: q${i} ⟂ q${j}`);
    const r = b.map((bi, i) => bi.sub(dot(G[i], cg.x)));
    ok(isZeroVec(G[0].map((_, j) => dot(col(G, j), r))), `gs #${t}: Aᵀ(b − Ax̂) = 0`);
    FG.filter(f => f.ask).forEach(f => { const [, j, kk] = /r\((\d+),(\d+)\)/.exec(f.ask.prompt); ok(R.parse(f.ask.answer[0]).eq(cg.Rt[j - 1][kk - 1]), `gs #${t}: ask r(${j},${kk})`); });
  } else ok(rank(G) < 3, `gs #${t}: stops only on dependent columns`);
  // power method: the "largest entry" answer set
  const P = rmat(3, 3, 0, 4), FP = ALGOS.power.run({ M: P, aug: 0 });
  FP.forEach((f, i) => {
    if (!f.ask) return;
    const x = f.M.map(r => +r[r.length - 1].replace("−", "-")), Pf = P.map(r => r.map(v => v.num()));
    const y = Pf.map(r => r.reduce((s, a, j) => s + a * x[j], 0)), big = Math.max(...y.map(Math.abs));
    const want = y.map((v, j) => j).filter(j => Math.abs(Math.abs(y[j]) - big) <= 1e-4 * big).map(j => `entry ${j + 1}`);
    ok(f.ask.answer.every(a => want.includes(a)), `power #${t} frame ${i}: largest-entry answers`);
  });
  // t-digit: pivot-row answers are all rows of maximal |a|, ties included
  const T = rmat(3, 4, -4, 4);
  if (!det(T.map(r => r.slice(0, 3))).isZero()) {
    const FT = ALGOS.tdigit.run({ M: T, aug: 1 }, { t: 4, pivot: true });
    const firstAsk = FT.find(f => f.ask && /pivot row/.test(f.ask.prompt));
    const c0 = T.map(r => Math.abs(r[0].num())), mx = Math.max(...c0);
    ok(firstAsk && JSON.stringify(firstAsk.ask.answer) === JSON.stringify(c0.map((v, i) => i).filter(i => c0[i] === mx).map(i => `row ${i + 1}`)), `tdigit #${t}: pivot ties`);
  }
}
// compose: the "where does (1, 0) go" answer is the next frame's corner
for (const p of ALGOS.compose.presets) {
  const inst = L.parsePipeline(p.text), F = ALGOS.compose.run(inst);
  let M = ident(3);
  inst.ops.forEach((op, k) => {
    M = mmul(op.T, M);
    const f = F.find(x => x.ask && x.ask.prompt.startsWith(`After step ${k + 1},`));
    const v = mvec(M, [R.of(1), R.of(0), R.of(1)]);
    ok(f && f.ask.answer[0] === `(${L.fr(v[0])}, ${L.fr(v[1])})`, `compose/${p.name}: step ${k + 1} corner`);
  });
}
// Leon Example 7.3.3 is reproduced exactly
{
  const inst = L.parseMatrix("0.0001 2 | 4\n1 1 | 3");
  const no = ALGOS.tdigit.run(inst, { t: 3, pivot: false }), yes = ALGOS.tdigit.run(inst, { t: 3, pivot: true });
  ok(JSON.stringify(no[no.length - 1].cert.x) === "[0,2]" && JSON.stringify(yes[yes.length - 1].cert.x) === "[1,2]", "Leon Example 7.3.3: (0, 2) without and (1, 2) with pivoting");
}

// ---- characteristic polynomial and polynomial helpers
for (let t = 0; t < 20; t++) {
  const A = rmat(3, 3), p = charpoly(A), lam = R.of(L.rint(rnd, -4, 4));
  const val = p.reduceRight((s, c) => s.mul(lam).add(c), R.of(0));
  ok(val.eq(det(A.map((r, i) => r.map((x, j) => (i === j ? lam.sub(x) : x.neg()))))), `charpoly #${t}: p(λ) = det(λI − A)`);
}

// ---- decision guides: pure walk, and leaves on known instances
const leafFor = (gkey, algo, text, prm) => { const G = GUIDES[gkey], f = G.facts(L.parseInstance(ALGOS[algo], text), prm || {}), ans = {}; Object.entries(f).forEach(([k, v]) => { if (v.ans != null) ans[k] = v.ans; }); const w = walk(G, ans); return w.leafKey || "pending:" + w.pending; };
const expectLeaf = [
  ["solve", "gj", "1 0 0 -1 | 4\n-1 1 0 0 | -1\n0 -1 1 0 | -2\n0 0 -1 1 | 0", "none"],
  ["solve", "gj", "1 0 0 -1 | 3\n-1 1 0 0 | -1\n0 -1 1 0 | -2\n0 0 -1 1 | 0", "family"],
  ["solve", "gj", "2 1 1 | 4\n0 3 3 | 10\n0 0 3 | 7", "subst"],
  ["solve", "gj", "2 1 1 | 4\n4 3 3 | 10\n2 2 3 | 7", "pending:many"],
  ["det", "det", "2 1 3\n0 3 4\n0 0 5", "diag"],
  ["det", "det", "1 2 3\n2 4 6\n1 0 1", "zero"],
  ["det", "det", "2 1 3\n0 -1 4\n5 2 0", "cof"],
  ["det", "det", "1 2 0 1\n2 1 1 0\n0 1 3 1\n1 0 1 2", "elim"],
  ["basis", "rref", "1 2 3 1\n1 1 2 1\n1 2 3 1", "dep"],
  ["basis", "rref", "1 0 1\n0 1 1\n0 0 0", "dep2"],
  ["basis", "rref", "1 2\n2 4\n0 0", "depobv"],
  ["basis", "rref", "1 0\n0 1\n1 1", "nospan"],
  ["basis", "rref", "1 1 1\n1 2 3\n1 4 9", "basis"],
  ["pipeline", "compose", "rotate 90\ntranslate 2 1", "affine"],
  ["pipeline", "compose", "rotate 90\nreflect x", "rigid"],
  ["pipeline", "compose", "shear 1\nscale 2 1/2", "inv"],
  ["pipeline", "compose", "matrix 1 2 2 4", "sing"],
  ["lsq", "gs", "1 0 | 1\n1 1 | 2\n1 2 | 2", "normal"],
  ["lsq", "gs", "1 0 | 1\n1 1 | 2\n1 2 | 3", "exact"],
  ["lsq", "gs", "1 2 | 1\n1 2 | 2\n1 2 | 4", "pinv"],
  ["lsq", "gs", "1 1 | 1\n1 1.00001 | 2\n1 1 | 3", "qr"],
  ["diag", "power", "2 1\n1 3", "spectral"],
  ["diag", "power", "0.9 0.2\n0.1 0.8", "distinct"],
  ["diag", "power", "0 -1\n1 0", "complex"],
  ["diag", "power", "1 1\n0 1", "defective"],
  ["diag", "power", "2 1 0\n0 3 0\n0 0 2", "enough"],
  ["diag", "power", "2 1 0\n0 2 0\n0 0 3", "defective"],
  ["trust", "tdigit", "0.0001 2 | 4\n1 1 | 3", "pivot", { t: 3 }],
  ["trust", "tdigit", "1 1 | 2\n1 1.001 | 2.001", "ill", { t: 4 }],
  ["trust", "tdigit", "4 1 | 5\n1 3 | 4", "fine", { t: 4 }],
];
expectLeaf.forEach(([g, a, text, want, prm]) => { const got = leafFor(g, a, text, prm); ok(got === want, `guide ${g} on ${JSON.stringify(text)}: ${got} (want ${want})`); });
for (const [k, G] of Object.entries(GUIDES)) {
  ok(G.chain.every(q => (q.yes ? G.leaves[q.yes] : true) && (q.no ? G.leaves[q.no] : true)), `guide ${k}: leaves exist`);
  const lastQ = G.chain[G.chain.length - 1]; ok(lastQ.yes && lastQ.no, `guide ${k}: the last question ends in leaves`);
  Object.values(G.leaves).forEach(l => ok(!l.run || ALGOS[l.run], `guide ${k}: leaf ${l.name} runs a known algorithm`));
  ok(G.algo.every(a => ALGOS[a]), `guide ${k}: algorithms exist`);
}

// ---- chapters: configuration, motivating problems, sheets, tickets
const seminarText = {};
fs.readdirSync(path.join(ROOT, "seminars")).forEach(f => { seminarText[f] = fs.readFileSync(path.join(ROOT, "seminars", f), "utf8"); });
const taskExists = id => { const m = /^W(\d\d)\.T(\d)$/.exec(id); if (!m) return false; const f = Object.keys(seminarText).find(x => x.startsWith(m[1] + "_")); return f && seminarText[f].includes(`## ${id}`); };
const MOTIV_ANSWERS = {
  1: { f: "8, 7, 5, 5", y: "1, 1, 1, 1" },
  2: { d: "-5", a: "-95/2" },
  3: { k: "1, -1, -1, 1", w: "1, 0, 0, 1" },
  4: { h: "0 -1 2\n1 0 1\n0 0 1", g: "0 1 -1\n-1 0 2\n0 0 1" },
  5: { x: "7/6, 1/2", r: "-1/6, 1/3, -1/6" },
  6: { pi: "2/3, 1/3", l: "7/10", v: "1, -1" },
  7: { x: "1, 2", c: "3.0003" },
};
const MOTIV_WRONG = { 1: { f: "8, 7, 5, 6", y: "1, 1, 1, 1" }, 2: { d: "-5", a: "95/2" }, 3: { k: "1, -1, -1, 1", w: "1, 1, 1, 1" }, 4: { h: "0 -1 -1\n1 0 2\n0 0 1", g: "0 1 -1\n-1 0 2\n0 0 1" }, 5: { x: "1, 1/2", r: "0, 1/2, 0" }, 6: { pi: "2, 1", l: "7/10", v: "1, -1" }, 7: { x: "0, 2", c: "3.0003" } };
const parseField = (f, raw) => f.kind === "vec" ? L.parseVec(raw) : f.kind === "num" ? R.parse(raw) : f.kind === "mat" ? L.parseMatrix(raw).M : raw;
for (let n = 1; n <= 7; n++) {
  const C = L.chapters[n];
  ok(!!C, `chapter ${n} registered`);
  const src = n === 1 ? fs.readFileSync(path.join(BASE, "chapter1/index.html"), "utf8") : fs.readFileSync(path.join(BASE, `src/ch${n}.js`), "utf8");
  const ids = new Set([...src.matchAll(/id: "(def-[a-z0-9-]+)"/g)].map(m => m[1]));
  ok(ids.size > 0 && [...ids].every(id => C.why[id]), `chapter ${n}: every definition card has a “why we need it”`);
  Object.keys(C.why).forEach(id => ok(ids.has(id), `chapter ${n}: why key ${id} is a card`));
  Object.entries(C.practice).forEach(([id, ts]) => { ok(ids.has(id), `chapter ${n}: practice key ${id}`); ts.forEach(t => ok(taskExists(t), `chapter ${n}: practice task ${t} exists in the sheets`)); });
  const mo = C.motivation;
  mo.needs.forEach(([id]) => ok(ids.has(id), `chapter ${n}: motivation needs card ${id}`));
  ok(taskExists(mo.sheet), `chapter ${n}: motivation sheet task ${mo.sheet}`);
  ok(C.studio.algos.includes(mo.load.algo) && !L.parseInstance(ALGOS[mo.load.algo], mo.load.text).error, `chapter ${n}: motivation loads into the studio`);
  const vals = k => { const v = {}; mo.final.fields.forEach(f => { v[f.key] = parseField(f, k[f.key]); }); return v; };
  ok(mo.final.check(vals(MOTIV_ANSWERS[n])).ok === true, `chapter ${n}: the motivating problem's answer passes its check`);
  ok(mo.final.check(vals(MOTIV_WRONG[n])).ok === false, `chapter ${n}: a wrong answer fails the check`);
  C.sheets.forEach(s => s.tasks.forEach(t => {
    ok(taskExists(t.id), `chapter ${n}: sheet task ${t.id} exists`);
    if (t.load) ok(C.studio.algos.includes(t.load.algo) && !L.parseInstance(ALGOS[t.load.algo], t.load.text).error, `chapter ${n}: sheet load ${t.id} parses`);
  }));
  ok(GUIDES[C.guide] && GUIDES[C.guide].algo.some(a => C.studio.algos.includes(a)), `chapter ${n}: guide matches the studio`);
  // certificate check on each studio preset runs without throwing
  C.studio.algos.filter(a => !C.cert.algos || C.cert.algos.includes(a)).forEach(a => ALGOS[a].presets.forEach(p => {
    const inst = L.parseInstance(ALGOS[a], p.text), fields = C.cert.fields(inst, p.params || {});
    const v = {}; fields.forEach(f => { v[f.key] = parseField(f, f.kind === "mat" ? "1 0\n0 1" : f.kind === "num" ? "1" : "1, 0"); });
    let r; try { r = C.cert.check(inst, v, Object.assign({ t: 3, pivot: false }, p.params || {})); } catch (e) { r = null; }
    ok(r && typeof r.ok === "boolean" && typeof r.msg === "string", `chapter ${n}: certificate check runs on ${a}/${p.name}`);
  }));
  // exit tickets: deterministic for seeds 1–30, keys pass their own checks, and they vary
  const seen = new Set();
  for (let s = 1; s <= 30; s++) {
    const a = C.tickets.make(String(s)), b = C.tickets.make(String(s));
    ok(a.html === b.html && a.key === b.key, `chapter ${n} ticket ${s}: deterministic`);
    ok(a.selfCheck() === true, `chapter ${n} ticket ${s}: key passes its own check`);
    seen.add(a.html);
  }
  ok(seen.size >= 20, `chapter ${n}: tickets vary across seeds (${seen.size}/30)`);
}
// the certificate positive cases from the motivating problems in the studio
{
  const C1 = L.chapters[1], inst = L.parseMatrix("1 0 0 -1 | 4\n-1 1 0 0 | -1\n0 -1 1 0 | -2\n0 0 -1 1 | 0");
  ok(C1.cert.check(inst, { v: L.parseVec("1,1,1,1") }).ok && !C1.cert.check(inst, { v: L.parseVec("1,1,1,0") }).ok, "chapter 1: studio certificate check");
  const C3 = L.chapters[3]; ok(C3.cert.check({ M: rm([[1, 0, 1], [0, 1, 1]]), aug: 0 }, { c: L.parseVec("1, 1, -1") }).ok, "chapter 3: dependence relation accepted");
  const C2 = L.chapters[2], A = L.parseMatrix("2 1\n1 1"); ok(C2.cert.check(A, { m: L.parseMatrix("1 -1\n-1 2").M }).ok, "chapter 2: inverse certificate accepted");
}

// ---- Python exports run (needs python3 with sympy and numpy)
if (!process.argv.includes("--no-python")) {
  let py = true; try { execFileSync("python3", ["-c", "import sympy, numpy"], { stdio: "ignore" }); } catch (e) { py = false; console.log("skip: python3 with sympy and numpy not available"); }
  if (py) for (const [key, a] of Object.entries(ALGOS)) for (const p of a.presets) {
    const inst = L.parseInstance(a, p.text), code = a.python(inst, p.params || {});
    let good = true; try { execFileSync("python3", ["-c", code], { stdio: "pipe", timeout: 60000 }); } catch (e) { good = false; console.log(String(e.stderr || e).slice(0, 400)); }
    ok(good, `python export ${key}/${p.name} runs`);
  }
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
