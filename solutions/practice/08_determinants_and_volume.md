# Practice solutions — Seminar 08

[Student sheet](../../seminars/08_determinants_and_volume.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W08.T1

Determinants are $1,1,1,-1,0$. The absolute value scales area. $I,F$ preserve all lengths; $H,D,P$ do not. For example $He_2=(1,1)$ has length $\sqrt2$; $De_1$ has length 2; $Pe_2=0$.

## W08.T2

Expansion along row 1 gives $2(-8)-1(-20)+3(5)=19$. SymPy uses exact integers here; floating-point determinant may round near 19. Agreement checks this example but is not a proof of a general determinant theorem.

## W08.T3

$H$ has determinant 1 but does not preserve length, so it is not a rotation. $D$ shrinks $e_2$ despite positive determinant. For $A=\begin{pmatrix}a&b\\c&d\end{pmatrix}$ and $B=\begin{pmatrix}e&f\\g&h\end{pmatrix}$, expand $(ae+bg)(cf+dh)-(af+bh)(ce+dg)$ and cancel to obtain $(ad-bc)(eh-fg)$. This proves the two-dimensional product rule, including singular cases.

## W08.T4

Subtract row 2 from row 3 and then row 1 from row 2, keeping the operations on the appropriate current rows (equivalently use the original differences). Expansion gives $a(a-b)^2$, a polynomial identity valid even at zero parameters. Invertibility holds iff $a\ne0$ and $a\ne b$. An inverse uses division by the determinant and is not defined at its zeros.

## W08.T5

Invertible; volume scales by 2; orientation reverses. It need not scale all vector lengths by 2, nor preserve any particular length.

## Facilitation

For T3 require the full expansion from one pair; others identify the geometric interpretation. Do not turn the session into a long cofactor drill.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
