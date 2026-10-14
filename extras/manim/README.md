# Optional Manim animation

[Course index](../../README.md) · [Provenance](../../docs/sources.md)

`linear_transform.py` preserves the scene formerly embedded in the historical geometry notebook. It is optional, not part of the core dependency set, and has not been included in the notebook execution tests. The new transformation lab already supplies a lightweight interactive alternative.

If you want to render it, use a separate environment with a compatible Manim Community installation and its documented system dependencies, then run:

```bash
manim -pql extras/manim/linear_transform.py LinearTrans
```

Do not install TeX/system packages automatically in a student notebook or pin an old IPython version to make the optional renderer work. Consult the Manim documentation for your operating system and review the extracted scene before rendering.

## Chapter definition animations

`chapterN_definitions.py` contains the scenes shown on chapter N of the [Linear Algebra Lab](../../docs/interactive/index.html). [`chapter1_definitions.py`](chapter1_definitions.py) is self-contained; the later chapters import the shared palette, pacing and helpers from [`la_style.py`](la_style.py). The rendered videos are committed in `docs/interactive/chapterN/video/`, so rendering is only needed after editing a scene:

```bash
manim -qm extras/manim/chapter2_definitions.py CramersRule   # one scene
manim -qm -a extras/manim/chapter2_definitions.py            # all scenes of a chapter
```

The pacing constants `SLOW`, `MIN_RT`, `HOLD`, `WAIT_SLOW` (top of `chapter1_definitions.py`, and in `la_style.py` for the other chapters) retime every scene at once. The page expects H.264 MP4 and VP9 WebM copies plus a JPEG poster per scene, converted with `ffmpeg` from Manim's 720p output.
