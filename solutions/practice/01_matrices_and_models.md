# Practice solutions — Seminar 01

[Student sheet](../../seminars/01_matrices_and_models.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W01.T1

$Ax=(7,8,2)^T$. Entry $A_{12}=1$ is units of resource 1 per kit 2; column 2 is $(1,2,0)^T$. With column-vector convention $x$ is $2\times1$, so $xA$ is not even dimensionally defined.

## W01.T2

$2x_1+x_2=7$ and $x_1+2x_2=8$ give $(2,3)$. Their coefficient determinant is 3, so no other pair satisfies them. The third equation then forces resource use 2, contradicting 3. This proves inconsistency without solving a new three-equation system.

## W01.T3

$B=\begin{pmatrix}2&-1\\1&1\end{pmatrix}$ and $B(3,-2)^T=(8,1)^T$. Every vector equals $x_1e_1+x_2e_2$; linearity forces $T(x)=x_1T(e_1)+x_2T(e_2)$. This proves uniqueness for all inputs.

## W01.T4

One choice is $\widetilde T(x)=Bx+(x_1x_2,0)^T$. It agrees at the three probes, but at $(1,1)$ the added term is $(1,0)$. It is not additive. For finitely many probes $p_i$, a nonzero polynomial such as $\prod_i\|x-p_i\|^2$ can be added to one component and vanishes at every probe. Finite tests can falsify linearity, not certify an arbitrary function.

## W01.T5

Domain $\mathbb R^3$, codomain $\mathbb R^2$, output $(-1,1)^T$. Column $j$ is the output of the $j$th standard basis vector.

## Facilitation

Have students attach units before calculating. Do not introduce rank terminology yet. Ask whether the linearity promise is an assumption or a conclusion.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
