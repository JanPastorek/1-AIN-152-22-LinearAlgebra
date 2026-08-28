# Corrections to the historical notebooks

[Course index](../README.md) · [Provenance](sources.md)

The review branch revises the notebooks present at baseline commit `fe95af1086e1336e1e0d975bb55c5512c7c7c9e6`. Filenames are retained to preserve existing links. The following are substantive corrections, not a claim that every sentence of the historical notes has undergone a complete editorial rewrite.

| Notebook | Correction |
|---|---|
| Introduction | Corrected 4×3 dimensions; `.shape` is a property; `row_insert` returns a new matrix, while `row_del` mutates and returns `None`. |
| Geometry | Corrected dependence/span language and possible intersections of three planes; restored `plt.show()`; removed missing CSS/logos and automatic package installation; separated optional Manim; seeded random examples; renamed sliders to avoid collision with a later 3D axes variable; expanded 3D limits so the cross product is visible. |
| Elimination | Corrected the back-substitution sign and the missing matrix A in the inverse-elimination identity; required nonzero row scaling and a nonzero pivot. |
| Multiplication/inverses | Corrected the column-multiple direction and required a nonzero kernel witness; stated exact invertibility conditions via $a(a-b)^2$. |
| LU | Distinguished the pivot 8 from the entry 11 being eliminated; labeled the scaled combination as two row operations; retained the distinction between scaled and unit-lower factors; recorded row swaps with convention $PA=LU$; classified all parameter cases, including valid singular factorizations; replaced an incorrect generic elementary-inverse rule with the three correct inverse operations. |
| Basis/dimension | Distinguished the kernel from its basis and its ambient space; spanning does not imply independence; a trivial kernel has empty basis but contains the zero vector; a zero row need not mean a free variable in a rectangular matrix; column-space bases use original pivot columns. |
| Transformations | Distinguished floating-point determinant output from an exact integer determinant and verified the example value 19. |

All revised core notebooks have cleared outputs/execution counts, stable cell IDs and a standard Python kernelspec. Missing decorative local assets no longer prevent execution. Original attribution and notebook-specific license notices remain. The OCR utility is unchanged and excluded from core checks.

## LU convention and exceptional cases

For $A=\begin{pmatrix}1&0&1\\a&a&a\\b&b&a\end{pmatrix}$, require unit-lower $L$ and upper $U$, without row permutation. For $a\ne0$:

$$L=\begin{pmatrix}1&0&0\\a&1&0\\b&b/a&1\end{pmatrix},\qquad U=\begin{pmatrix}1&0&1\\0&a&0\\0&0&a-b\end{pmatrix}.$$

These remain valid at $a=b\ne0$, when U is singular. At $a=b=0$, use $L=I,U=A$. At $a=0,b\ne0$, unit-lower LU without permutation is impossible: $u_{12}=0$ and row 2 forces $u_{22}=0$, so $(LU)_{32}=0$, contradicting $A_{32}=b$. A permutation can resolve this obstruction. Stating the convention is essential; an unrestricted product of lower and upper triangular matrices is a different existence question.

## Follow-up: preserve the original teaching voice

Following feedback, the original notebooks again lead the course navigation instead of being described as optional references. Compressed correction paragraphs were expanded into connected explanations, while keeping the corrected mathematics. The four multiplication views, repeated elimination example, hand-built LU derivation and progression from independence to dimension remain in order. The geometry notebook's vector-product heading has been restored, and its right-hand-side vector is now consistently distinguished from the solution.

The [reading map](notebook_route.md) connects each week to a passage in the original notebooks or a worked explanation for a later topic. New labs now include derivations between predictions and code, rather than requiring students to reconstruct the explanation from task lists. Short discussion pauses are additions, not replacements for the original exposition.

The original section sequence is recorded in [the structure manifest](../data/original_notebook_sections.json) and checked by `scripts/check_materials.py`. The two documented heading edits clarify “basis vectors in the nullspace” and correct “triangular from” to “triangular form.” This check protects the route against accidental deletion; mathematical and classroom review remain separate.
