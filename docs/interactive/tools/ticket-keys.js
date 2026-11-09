// Exit-ticket keys for seeds 1–30 of every chapter, as one HTML page for the teacher.
//   node docs/interactive/tools/ticket-keys.js OUT.html      (keep OUT.html outside this public repository)
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const BASE = path.join(__dirname, ".."), out = process.argv[2];
if (!out) { console.error("usage: node ticket-keys.js OUT.html"); process.exit(2); }
if (path.resolve(out).startsWith(path.resolve(BASE, "..", "..") + path.sep)) { console.error("refusing to write keys inside the public repository"); process.exit(2); }
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(BASE, "assets/lab-plus.js"), "utf8"), ctx);
for (let n = 1; n <= 7; n++) vm.runInContext(fs.readFileSync(path.join(BASE, `chapter${n}/plus.js`), "utf8"), ctx);
const seeds = Array.from({ length: 30 }, (_, i) => String(i + 1));
let html = `<!doctype html><meta charset="utf-8"><title>Exit-ticket keys</title><link rel="stylesheet" href="https://janpastorek.com/1-AIN-152-22-LinearAlgebra/docs/interactive/assets/lab.css"><link rel="stylesheet" href="https://janpastorek.com/1-AIN-152-22-LinearAlgebra/docs/interactive/assets/lab-plus.css"><body><main class="wrap"><h1>Exit-ticket keys, seeds 1–30</h1><p>Teacher material: do not publish.</p>`;
for (let n = 1; n <= 7; n++) {
  html += `<h2>Chapter ${n}</h2>`;
  for (const s of seeds) { const t = ctx.LabPlus.chapters[n].tickets.make(s); html += `<div class="lp-tcard" style="margin:10px 0"><div class="lp-tref">Chapter ${n} · seed ${s}</div>${t.html}<div class="lp-key"><b>Key</b> ${t.key}</div></div>`; }
}
fs.writeFileSync(out, html + "</main></body>");
console.log("wrote", out);
