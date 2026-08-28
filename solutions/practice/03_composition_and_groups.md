# Practice solutions — Seminar 03

[Student sheet](../../seminars/03_composition_and_groups.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W03.T1

$RF=\begin{pmatrix}0&1\\1&0\end{pmatrix}$ sends $e_1$ to $e_2$; $FR=\begin{pmatrix}0&-1\\-1&0\end{pmatrix}$ sends it to $-e_2$. In $RF$, $F$ acts first. They are reflections in the two diagonal lines.

## W03.T2

The eight matrices are the four quarter-turn rotations and their products with $F$. Exponents are modulo 4. The relation $FR^j=R^{-j}F$ reduces every product to $R^k$ or $R^kF$. Rotation inverses are $R^{-k}$; $(R^kF)^2=I$, so each reflection is its own inverse. They are distinct by their action on $e_1,e_2$ (and orientation). Associativity is inherited from matrix multiplication. Identity is $R^0=I$.

## W03.T3

The correct inverse of $RF$ is $FR^{-1}=RF$, whereas $R^{-1}F=FR$ is different. For general invertible matrices, $(AB)(B^{-1}A^{-1})=I=(B^{-1}A^{-1})(AB)$. A projection has a nonzero kernel and cannot have an inverse with identity $I_2$.

## W03.T4

$AB=I_1$, but $BA=\operatorname{diag}(1,0)\ne I_2$. Rectangular maps may be injective without being surjective, or conversely. For square finite-dimensional maps, full rank gives both. For the optional transpose identity, both $(AB)^T_{ij}$ and $(B^TA^T)_{ij}$ equal $\sum_k A_{jk}B_{ki}$.

## W03.T5

$(RF)^{-1}=FR^{-1}=RF$. The inverse axiom fails for a singular matrix; closure of all invertible matrices itself is not the problem.

## Facilitation

Quiz 2 can replace the opening prediction. Make the group proof a shared board argument: each pair supplies one case of the multiplication rule.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
