# Practice solutions — Seminar 10

[Student sheet](../../seminars/10_change_of_basis.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W10.T1

$S^{-1}=\frac12\begin{pmatrix}1&1\\1&-1\end{pmatrix}$, so $c=(2,1)^T$. $Sc$ synthesizes a vector from basis coordinates; $S^{-1}x$ analyzes an ordinary coordinate vector in the new basis.

## W10.T2

$C=S^{-1}AS=\begin{pmatrix}3/2&1/2\\1/2&3/2\end{pmatrix}$. It sends $(2,1)$ to $(7/2,5/2)$, which $S$ sends to $(6,1)=Ax$. Since the same result must hold for all $c$, $ASc=SCc$ implies $AS=SC$, hence the formula.

## W10.T3

Correct $C'=\begin{pmatrix}2&1\\0&1\end{pmatrix}$; wrong-order matrix $\begin{pmatrix}2&-1\\0&1\end{pmatrix}$. At $c=e_2$ they give $(1,1)$ versus $(-1,1)$. For the original $S$, $S^{-1}=S/2$, so the two expressions accidentally agree. A test that passes can conceal an error when its data are too symmetric.

## W10.T4

Any invertible $S$, for example $S'$, gives $S^{-1}IS=I$. For different domain/codomain bases, physical output is $ASc$ and output coordinates are $T^{-1}ASc$, so the matrix is $T^{-1}AS$. The same-basis conjugation is a special case, not a formula for every change of coordinates.

## W10.T5

Physical vector $S'e_2=(1,1)$; image $(2,1)$; new coordinates $(1,1)$.

## Facilitation

Have students label arrows with their input and output coordinate systems. The nonsymmetric basis in T3 is deliberate: the first example alone cannot reveal reversed conjugation.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
