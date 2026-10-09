# Optional Manim animation

[Course index](../../README.md) · [Provenance](../../docs/sources.md)

`linear_transform.py` preserves the scene formerly embedded in the historical geometry notebook. It is optional, not part of the core dependency set, and has not been included in the notebook execution tests. The new transformation lab already supplies a lightweight interactive alternative.

If you want to render it, use a separate environment with a compatible Manim Community installation and its documented system dependencies, then run:

```bash
manim -pql extras/manim/linear_transform.py LinearTrans
```

Do not install TeX/system packages automatically in a student notebook or pin an old IPython version to make the optional renderer work. Consult the Manim documentation for your operating system and review the extracted scene before rendering.

## Chapter 1 definition animations

[`chapter1_definitions.py`](chapter1_definitions.py) contains the 16 scenes shown on the [Chapter 1 interactive companion](../../docs/interactive/chapter1/index.html), one per definition of Leon, Chapter 1, plus a linear neural-network layer. The rendered videos are committed in `docs/interactive/chapter1/video/`, so rendering is only needed after editing a scene:

```bash
manim -qm extras/manim/chapter1_definitions.py RowOperations   # one scene
manim -qm -a extras/manim/chapter1_definitions.py              # all scenes
```

The pacing constants at the top of the file (`SLOW`, `MIN_RT`, `HOLD`, `WAIT_SLOW`) retime every scene at once. The page expects H.264 MP4 and VP9 WebM copies plus a JPEG poster per scene, converted with `ffmpeg` from Manim's 720p output.
