"""Build the Linear Algebra Lab pages.

    python3 docs/interactive/tools/build.py            # all chapters 2-7, chapter 1 patch, index, redirects
    python3 docs/interactive/tools/build.py 3 5        # only these chapter pages (index and navs are always rebuilt)
    python3 docs/interactive/tools/build.py --teacher DIR   # also write a teacher copy (exit-ticket keys shown) to DIR

The teacher copy must stay outside this public repository (see assessment/README.md).

Chapter 1 is a hand-written page (docs/interactive/chapter1/index.html); the build only refreshes its
chapter navigation and the shared "plus" layer includes. Chapters 2-7 are assembled from
docs/interactive/src/chN.json (meta), chN_body.html, chN.js and the Manim scenes in
extras/manim/chapterN_definitions.py (their source is shown on each definition card).
"""
import ast
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
BASE = os.path.join(ROOT, "docs", "interactive")
SRC = os.path.join(BASE, "src")
INFO = {
    1: ("Matrices and systems of equations", "Matrices &amp; systems", "Systems of linear equations, row echelon form, matrix arithmetic and algebra, elementary matrices and LU, partitioned matrices, Strassen's algorithm, and a linear neural network."),
    2: ("Determinants", "Determinants", "Cofactor expansion, the determinant as signed area, row operations and the product rule, Cramer's rule, the adjoint, and coded messages."),
    3: ("Vector spaces", "Vector spaces", "Subspaces, span, deciding linear dependence by row reduction, bases and dimension, coordinates and change of basis, row and column spaces, rank–nullity."),
    4: ("Linear transformations", "Linear transformations", "What makes a map linear, kernel and image, standard matrices and matrix representations, computer graphics with homogeneous coordinates, similarity."),
    5: ("Orthogonality", "Orthogonality", "Scalar products and projections, orthogonal subspaces, least squares fitting, inner products and norms, orthonormal sets, Gram–Schmidt and QR."),
    6: ("Eigenvalues", "Eigenvalues", "Eigenvectors as invariant directions, linear differential equations, diagonalization and Markov chains, the SVD and image compression, quadratic forms."),
    7: ("Numerical linear algebra", "Numerical linear algebra", "Floating-point numbers, Gaussian elimination and its cost, pivoting strategies, matrix norms and condition numbers, Householder transformations, the power method."),
}
# exercise totals measured with tools/check.js where exercises are generated in loops
EX_OVERRIDE = {1: 71, 6: 39}
PLUS_HEAD = '<link rel="stylesheet" href="../assets/lab-plus.css">'
PLUS_TAIL = '<script src="../assets/lab-plus.js"></script>\n<script src="plus.js"></script>'
COMMON_CSS = """body{margin:0}
.chapnav{display:flex; flex-wrap:wrap; gap:6px}
.chapnav a{font-family:var(--display); font-size:13px; text-decoration:none; color:var(--ink); padding:4px 10px; border:1px solid var(--rule); border-radius:999px; background:var(--panel)}
.chapnav a b{font-family:var(--mono); color:var(--c1); margin-right:6px}
.chapnav a[aria-current="page"]{background:var(--c1); border-color:var(--c1); color:var(--panel)}
.chapnav a[aria-current="page"] b{color:var(--panel)}
.eyebrow a{color:inherit}
"""


def built():
    return [k for k in sorted(INFO) if os.path.exists(f"{BASE}/chapter{k}/index.html")]


def chapnav(cur):
    items = []
    for k in built():
        a = ' aria-current="page"' if k == cur else ""
        items.append(f'<a href="../chapter{k}/"{a}><b>{k}</b>{INFO[k][1]}</a>')
    return '<nav class="chapnav" aria-label="Chapters">' + "".join(items) + "</nav>"


def scene_sources(n):
    path = f"{ROOT}/extras/manim/chapter{n}_definitions.py"
    if not os.path.exists(path):
        return {}
    src = open(path).read()
    lines = src.splitlines()
    return {node.name: "\n".join(lines[node.lineno - 1:node.end_lineno]) for node in ast.parse(src).body if isinstance(node, ast.ClassDef)}


def build_page(n):
    meta = json.load(open(f"{SRC}/ch{n}.json"))
    body = open(f"{SRC}/ch{n}_body.html").read()
    js = open(f"{SRC}/ch{n}.js").read()
    toc = "".join(f'<a href="#{sid}"><b>{num}</b>{name}</a>' for sid, num, name in meta["toc"])
    blob = json.dumps(scene_sources(n)).replace("</", "<\\/")
    css = COMMON_CSS + (meta.get("css", "") + "\n" if meta.get("css") else "")
    page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{meta["description"]}">
<title>{meta["title"]}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=JetBrains+Mono:wght@400;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap">
<link rel="stylesheet" href="../assets/lab.css">
{PLUS_HEAD}
<style>
{css}</style>
</head>
<body>
<header class="top">
  <div class="eyebrow"><a href="../">Course index</a> · Chapter {n} · Leon, <i>Linear Algebra with Applications</i>, 8th ed.</div>
  <h1>{meta["h1"]}</h1>
  <p class="lede">{meta["lede"]}</p>
  {chapnav(n)}
</header>
<nav class="toc" aria-label="Sections"><div class="row">
  <a href="#defs"><b>≔</b>Definitions</a>{toc}
</div></nav>

<main class="wrap">
<section class="sec" id="defs" style="padding-top:36px">
  <div class="sec-head"><span class="sec-num">≔</span><h2>Definitions, animated</h2><span class="sub">The chapter's definitions and key theorems. Animations are paced for following step by step; use the speed buttons under a video to change the pace. Jump to a card here.</span></div>
  <div class="chips" id="def-index" role="list"></div>
</section>
{body}</main>

<footer>Examples, theorem numbers and notation follow Steven J. Leon, <i>Linear Algebra with Applications</i>, 8th edition, Chapter {n}. {meta.get("footer", "")} Exact arithmetic (fractions) is used wherever a lab says so. Solved exercises are remembered in this browser only. Animations: Manim Community v0.22; each card shows its scene's code.</footer>

<script type="application/json" id="manim-src">{blob}</script>
<script src="../assets/lab-core.js"></script>
<script>
{js}
</script>
{PLUS_TAIL}
</body>
</html>
'''
    open(f"{BASE}/chapter{n}/index.html", "w").write(page)
    print("wrote chapter", n, len(page))


def patch_chapter1():
    p = f"{BASE}/chapter1/index.html"
    s = open(p).read()
    s = re.sub(r'<nav class="chapnav".*?</nav>', chapnav(1), s, count=1, flags=re.S)
    if PLUS_HEAD not in s:
        s = s.replace("</head>", PLUS_HEAD + "\n</head>", 1)
    if PLUS_TAIL not in s:
        s = s.replace("</body>", PLUS_TAIL + "\n</body>", 1)
    open(p, "w").write(s)


def counts(k):
    html = open(f"{BASE}/chapter{k}/index.html").read()
    labs = len(re.findall(r'<div class="lab" id=', html))
    vdir = f"{BASE}/chapter{k}/video"
    vids = len([f for f in os.listdir(vdir) if f.endswith(".webm")]) if os.path.isdir(vdir) else 0
    ex = len(re.findall(r'^\s+(?:fl|ch|cl)\("', html, re.M)) + len(re.findall(r'type: "choice", key:', html))
    return labs, vids, EX_OVERRIDE.get(k, ex)


def redirects():
    def write(path, target, title):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, "w").write(f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="{target}">
<script>location.replace("{target}" + location.hash);</script>
</head>
<body><p><a href="{target}">Open {title}</a></p></body>
</html>
''')
    write(f"{ROOT}/interactive/index.html", "../docs/interactive/", "the Linear Algebra Lab")
    for k in built():
        write(f"{ROOT}/interactive/chapter{k}/index.html", "../../docs/interactive/chapter%d/" % k, f"Chapter {k} of the Linear Algebra Lab")


def index_page():
    plus = json.load(open(f"{SRC}/index_motivation.json"))
    cards = []
    for k in sorted(INFO):
        name, _, desc = INFO[k]
        hook = plus.get(str(k), "")
        hook = f'<span class="chook">Starts from: {hook}</span>' if hook else ""
        if k in built():
            labs, vids, ex = counts(k)
            meta = f'<span>{vids} animated definitions</span><span>{labs} labs</span><span>{ex} checked exercises</span>'
            cards.append(f'<a class="ccard" href="chapter{k}/"><span class="cnum">{k}</span><span class="cbody"><b>{name}</b><span class="cdesc">{desc}</span>{hook}<span class="cmeta">{meta}</span></span></a>')
        else:
            cards.append(f'<div class="ccard soon"><span class="cnum">{k}</span><span class="cbody"><b>{name}</b><span class="cdesc">{desc}</span><span class="cmeta"><span>in preparation</span></span></span></div>')
    html = open(f"{SRC}/index_template.html").read().replace("{{CARDS}}", "".join(cards))
    open(f"{BASE}/index.html", "w").write(html)


def teacher_copy(out):
    import shutil
    out = os.path.abspath(out)
    if out.startswith(ROOT + os.sep):
        sys.exit("refusing to write the teacher copy inside the public repository")
    if os.path.exists(out):
        shutil.rmtree(out)
    shutil.copytree(BASE, out, ignore=shutil.ignore_patterns("src", "tools"))
    for k in built():
        p = f"{out}/chapter{k}/index.html"
        s = open(p).read().replace('<script src="../assets/lab-plus.js">', '<script>window.LAB_TEACHER = true;</script>\n<script src="../assets/lab-plus.js">', 1)
        open(p, "w").write(s)
    print("teacher copy:", out)


if __name__ == "__main__":
    args = sys.argv[1:]
    teacher = None
    if "--teacher" in args:
        i = args.index("--teacher"); teacher = args[i + 1]; del args[i:i + 2]
    which = [int(a) for a in args] or [k for k in range(2, 8) if os.path.exists(f"{SRC}/ch{k}.json")]
    for k in which:
        if k == 1:
            continue
        build_page(k)
    patch_chapter1()
    redirects()
    index_page()
    print("built chapters:", built())
    if teacher:
        teacher_copy(teacher)
