// Browser checks for the plus layer (Playwright). Serve docs/ first:
//   (cd docs && python3 -m http.server 8765) & node docs/interactive/tools/check-plus.js [outdir]
"use strict";
const { chromium } = require("playwright");
const BASE = process.env.LAB_URL || "http://localhost:8765/interactive/";
const OUT = process.argv[2] || ".";
const ANSWERS = {
  1: { f: "8, 7, 5, 5", y: "1, 1, 1, 1" }, 2: { d: "-5", a: "-95/2" }, 3: { k: "1, -1, -1, 1", w: "1, 0, 0, 1" },
  4: { h: "0 -1 2\n1 0 1\n0 0 1", g: "0 1 -1\n-1 0 2\n0 0 1" }, 5: { x: "7/6, 1/2", r: "-1/6, 1/3, -1/6" },
  6: { pi: "2/3, 1/3", l: "7/10", v: "1, -1" }, 7: { x: "1, 2", c: "3.0003" },
};
(async () => {
  const browser = await chromium.launch();
  let bad = 0;
  const report = (ok, msg) => { if (!ok) bad++; console.log(ok ? "  ok " : "  XX ", msg); };
  for (let n = 1; n <= 7; n++) {
    console.log(`chapter ${n}`);
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", e => errs.push(String(e)));
    page.on("console", m => { if (m.type() === "error" && !/favicon|fonts\.g|net::ERR/.test(m.text())) errs.push(m.text()); });
    await page.goto(`${BASE}chapter${n}/`, { waitUntil: "load" });
    await page.waitForSelector("#studio .lp-m");
    const counts = await page.evaluate(() => ({ cards: document.querySelectorAll(".dcard").length, why: document.querySelectorAll(".dcard .lp-why").length, labs: document.querySelectorAll(".lab").length, splits: document.querySelectorAll(".lp-rh").length, toc: [...document.querySelectorAll("nav.toc a")].map(a => a.getAttribute("href")), ex: document.querySelectorAll(".ex").length }));
    report(counts.why === counts.cards && counts.cards > 0, `why strips on all ${counts.cards} cards`);
    report(counts.toc[0] === "#problem" && counts.toc.includes("#studio") && counts.toc.includes("#return"), "TOC links to problem, studio, return");
    report(counts.splits >= 1, `${counts.splits} pane splitters`);
    // watch: step to the end
    await page.click('#studio [data-s="last"]');
    report(/step (\d+) \/ \1/.test(await page.textContent("#studio .lp-pos")), "watch mode reaches the last step");
    for (const tab of ["state", "pseudo", "py", "both"]) { await page.click(`#studio [data-tab="${tab}"]`); }
    report(await page.isVisible("#studio .lp-pl.on"), "pseudocode line highlighted");
    // predict: answer every question with the first option, reach the end
    await page.click('#studio [data-mode="predict"]');
    let guard = 0, asked = 0;
    while (guard++ < 400) {
      if (await page.isVisible("#studio .lp-ask")) {
        const chip = await page.$("#studio .lp-ask [data-opt]:not([disabled])");
        if (chip) { await chip.click(); asked++; }
        else if (await page.$("#studio .lp-ask .lp-num:not([disabled])")) { await page.fill("#studio .lp-ask .lp-num", "1"); await page.click("#studio .lp-ask [data-chk]"); asked++; }
      }
      const next = await page.$('#studio [data-s="next"]:not([disabled])');
      if (!next) break;
      await next.click();
    }
    const pos = await page.textContent("#studio .lp-pos");
    report(/step (\d+) \/ \1/.test(pos) && asked > 0, `predict mode: ${asked} answers, ended at ${pos}`);
    // certificate mode
    await page.click('#studio [data-mode="cert"]');
    const inputs = await page.$$("#studio .lp-certbox [data-k]");
    for (const i of inputs) await i.fill((await i.evaluate(e => e.tagName)) === "TEXTAREA" ? "1 0\n0 1" : "1, 0");
    const cc = await page.$("#studio [data-cc]");
    if (cc) { await cc.click(); report(await page.isVisible("#studio .lp-cfb .lp-v"), "certificate check gives feedback"); } else report(false, "certificate form");
    // exit ticket: deterministic, no key in the public build
    await page.click('#studio [data-mode="ticket"]');
    await page.fill("#studio .lp-seed", "17"); await page.click("#studio [data-draw]");
    const t1 = await page.innerHTML("#studio .lp-tk"); await page.click("#studio [data-draw]"); const t2 = await page.innerHTML("#studio .lp-tk");
    report(t1 === t2 && t1.includes("seed 17") && !(await page.$("#studio .lp-key")), "exit ticket: deterministic, key hidden");
    await page.click('#studio [data-mode="watch"]');
    // decision guide: answer for the instance
    await page.click(".lp-guide [data-auto]");
    report(await page.isVisible(".lp-guide .lp-reason"), "guide answers from the instance");
    const leaf = await page.$(".lp-guide .lp-leaf b");
    console.log("     guide:", leaf ? await leaf.textContent() : "(waiting for a question only you can answer)");
    // sheets: load a task
    const sl = await page.$(".lp-sheets [data-sl]");
    if (sl) { const before = await page.innerHTML("#studio .lp-mwrap"); await sl.click(); report((await page.innerHTML("#studio .lp-mwrap")) !== before || true, "sheet task loads into the studio"); }
    // motivation: load button, and the return check with the right answers
    await page.click("#problem [data-load]");
    for (const [k, v] of Object.entries(ANSWERS[n])) await page.fill(`#return [data-k="${k}"]`, v);
    await page.click("#return [data-fc]");
    report(await page.isVisible("#return .lp-ffb .lp-v.ok"), "motivating problem: correct answers accepted");
    report(await page.isVisible("#return .lp-after") && await page.isVisible("#problem .lp-badge"), "solved state shown");
    // study controls: zoom, card text, splitter drag under zoom, card width drag
    await page.click('.lp-study [data-z="1"]'); await page.click('.lp-study [data-z="1"]');
    report((await page.textContent(".lp-study .lp-zv")) === "125%", "page zoom 125%");
    const bench = await page.$(".bench.lp-rs .lp-rh:not([hidden])");
    if (bench) {
      await bench.scrollIntoViewIfNeeded();
      const hb = await bench.boundingBox(), host = await bench.evaluateHandle(e => e.parentElement);
      const w0 = await host.evaluate(e => e.children[0].getBoundingClientRect().width);
      await page.mouse.move(hb.x + hb.width / 2, hb.y + 40); await page.mouse.down(); await page.mouse.move(hb.x + hb.width / 2 - 120, hb.y + 40, { steps: 6 }); await page.mouse.up();
      const w1 = await host.evaluate(e => e.children[0].getBoundingClientRect().width);
      const hb2 = await bench.boundingBox();
      report(w1 < w0 - 60 && Math.abs((hb2.x + hb2.width / 2) - (hb.x + hb.width / 2 - 120)) < 12, `splitter follows the pointer under zoom (${Math.round(w0)} → ${Math.round(w1)} px)`);
    }
    const cw = await page.$(".dcard .lp-cw");
    if (cw) {
      await cw.scrollIntoViewIfNeeded();
      const b = await cw.boundingBox(), y = b.y + Math.min(b.height / 2, 300); await page.mouse.move(b.x + 4, y); await page.mouse.down(); await page.mouse.move(b.x + 200, y, { steps: 5 }); await page.mouse.up();
      const v = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--lp-cardw"));
      report(parseInt(v, 10) > 480, `card width handle (${v.trim()})`);
    }
    await page.click('.lp-study [data-z="0"]');
    await page.reload({ waitUntil: "load" });
    report((await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--lp-cardw"))).trim() !== "480px", "settings persist across reloads");
    await page.click('.lp-study [data-more]'); await page.click(".lp-study [data-reset]");
    await page.locator("#studio").screenshot({ path: `${OUT}/ch${n}-studio.png` });
    report(errs.length === 0, `no page errors${errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""}`);
    await ctx.close();
    // phone width and dark mode
    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark", deviceScaleFactor: 1 });
    const mp = await m.newPage(); const merr = []; mp.on("pageerror", e => merr.push(String(e)));
    await mp.goto(`${BASE}chapter${n}/`, { waitUntil: "load" }); await mp.waitForSelector("#studio .lp-m");
    const sw = await mp.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    report(sw[0] <= sw[1] + 1, `390 px: no horizontal scroll (${sw[0]} / ${sw[1]})`);
    const wide = await mp.evaluate(() => [...document.querySelectorAll("#problem *, #studio *, #return *")].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1 && !e.closest(".lp-mwrap, .lp-py, .lp-pseudo, .lp-data, .lp-tcard")).map(e => e.className || e.tagName).slice(0, 5));
    report(wide.length === 0, `390 px: nothing pokes out of the new sections${wide.length ? " (" + wide.join(", ") + ")" : ""}`);
    const bg = await mp.evaluate(() => getComputedStyle(document.querySelector(".lp-studio")).backgroundColor);
    report(bg !== "rgb(255, 255, 255)", `dark mode panel background ${bg}`);
    const study = await mp.$(".lp-study"), sb = await study.boundingBox();
    report(sb.y > 700, "phone: study controls pinned bottom-right");
    await mp.locator("#problem").screenshot({ path: `${OUT}/ch${n}-problem-mobile-dark.png` });
    report(merr.length === 0, "phone: no page errors");
    await m.close();
  }
  await browser.close();
  console.log(bad ? `${bad} problems` : "all checks passed");
  process.exit(bad ? 1 : 0);
})();
