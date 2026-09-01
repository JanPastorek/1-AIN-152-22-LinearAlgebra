# Practice solutions — Seminar 04

[Student sheet](../../seminars/04_lu_and_numerics.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W04.T1

The multipliers are $m_{21}=2,m_{31}=1,m_{32}=1$. After the first step rows 2 and 3 are $(0,1,1)$ and $(0,1,2)$. Elimination of $A$ is reusable; transformed right sides must still be computed for each $b$.

## W04.T2

$L=\begin{pmatrix}1&0&0\\2&1&0\\1&1&1\end{pmatrix}$, $U=\begin{pmatrix}2&1&1\\0&1&1\\0&0&1\end{pmatrix}$. Forward solutions are $y_1=(4,2,1)^T,y_2=(4,2,2)^T$; back solves give $x_1=(1,1,1)^T,x_2=(1,0,2)^T$. Multiplication verifies both. Triangular solves use the factors directly, avoid forming another matrix, and expose the reusable work.

## W04.T3

Without swapping, $u_{11}=0$ from $B_{11}$, so $(LU)_{21}=l_{21}u_{11}=0$, contradicting $B_{21}=1$. With $P=\begin{pmatrix}0&1\\1&0\end{pmatrix}$, take $L=I$, $U=\begin{pmatrix}1&1\\0&1\end{pmatrix}$. The singular matrix $\operatorname{diag}(1,0)$ has unit-lower $L=I$ and $U=A$.

## W04.T4

The original solution is $(1,1)^T$; the perturbed solution is $(1-\delta/\varepsilon,1+\delta/\varepsilon)^T$. A small measurement change can cause a large solution change when $\varepsilon$ is small. Even exact arithmetic exhibits this sensitivity. Floating-point rounding can introduce an additional perturbation; it is a separate issue.

## W04.T5

Solve $Ly=Pb$, then $Ux=y$. A singular $U$ may be part of a valid factorization, but unique solvability for every right-hand side is then lost.

## Facilitation

Students can share factorization work but must each perform a different triangular solve. The numerical notebook is an alternative to hand tabulation in T4.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
