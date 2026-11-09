# Linear Algebra Lab: sources and tools

[Course index](../../README.md) · [Open the lab](https://janpastorek.com/1-AIN-152-22-LinearAlgebra/interactive/) · [Lab explorations](../lab_explorations.md)

Static pages, one per chapter of Leon, *Linear Algebra with Applications*, 8th ed. GitHub Pages serves them as they are. They also open from a downloaded folder through any local web server.

## Layout

- `assets/lab.css`, `assets/lab-core.js`: shared styles and the exact-arithmetic core used by the labs and exercises (`window.LA`).
- `assets/lab-plus.css`, `assets/lab-plus.js`: the layer on every chapter. It provides the motivating problem and the return to it, “why we need it” strips on the definition cards, the algorithm studio (watch, predict, check a certificate, exit ticket, Python export), decision guides, problem-sheet links and the study controls (text size, card width, resizable panes). It does not depend on `lab-core.js`.
- `chapterN/plus.js`: each chapter's data for that layer (motivation, why-strips, sheet tasks, certificate check, exit tickets).
- `src/chN.json`, `src/chN_body.html`, `src/chN.js`: sources of chapters 2–7. Chapter 1 is hand-written in `chapter1/index.html`.
- `tools/build.py`: assembles chapters 2–7, refreshes the chapter navigation, the course index and the redirect stubs in `/interactive/`.

## Commands

```
python3 docs/interactive/tools/build.py                    # rebuild pages, index and redirects
node docs/interactive/tools/test-plus.js                   # engine, algorithms, guides, tickets, Python exports
(cd docs && python3 -m http.server 8765) &
node docs/interactive/tools/check-plus.js /tmp/shots       # browser checks with Playwright, incl. 390 px and dark mode
```

## Teacher material stays out of this repository

The public pages never show exit-ticket keys. A teacher copy that shows them, and a page of keys for seeds 1–30, are generated on demand and must be kept elsewhere ([assessment rules](../../assessment/README.md)):

```
python3 docs/interactive/tools/build.py --teacher ~/lab-teacher
node docs/interactive/tools/ticket-keys.js ~/exit-ticket-keys.html
```

Both commands refuse to write inside the repository.
