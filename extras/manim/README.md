# Optional Manim animation

[Course index](../../README.md) · [Provenance](../../docs/sources.md)

`linear_transform.py` preserves the scene formerly embedded in the historical geometry notebook. It is optional, not part of the core dependency set, and has not been included in the notebook execution tests. The new transformation lab already supplies a lightweight interactive alternative.

If you want to render it, use a separate environment with a compatible Manim Community installation and its documented system dependencies, then run:

```bash
manim -pql extras/manim/linear_transform.py LinearTrans
```

Do not install TeX/system packages automatically in a student notebook or pin an old IPython version to make the optional renderer work. Consult the Manim documentation for your operating system and review the extracted scene before rendering.
