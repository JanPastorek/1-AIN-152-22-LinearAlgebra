# Practice solutions — Seminar 12

[Student sheet](../../seminars/12_eigenvalues_and_dynamics.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W12.T1

Columns sum to 1 and entries are nonnegative, preserving probability vectors. Column 1 describes users currently at app 1. The first update from $(1,0)$ is $(0.9,0.1)$. The model assumes fixed transition fractions and no other states; a real population need not satisfy that assumption.

## W12.T2

Eigenvalues 1 and 0.7; $\pi=(2/3,1/3)^T$. Every probability vector differs from $\pi$ by a multiple of $(1,-1)^T$, an eigenvector for 0.7. Applying $P^t$ proves the formula. The difference has sum zero, so total mass remains 1; $0.7^t\to0$ proves convergence.

## W12.T3

$Q$ has stationary $(1/2,1/2)$ but starting at $(1,0)$ alternates forever. Let $s=a+b$. If $s>0$, stationary vector is $(b/s,a/s)$ and the other eigenvalue is $1-s$. For $0<s<2$, all probability starts converge to this unique stationary vector. If $s=0$, $P=I$ and every distribution is stationary. If $s=2$, $P=Q$ and nonstationary starts oscillate. A negative eigenvalue inside $(-1,0)$ gives decaying alternation, not divergence.

## W12.T4

The only eigenspace is span$(e_1)$ for eigenvalue 1, so $J$ is not diagonalizable. Writing $J=I+N$ with $N^2=0$ gives $J^t=I+tN=\begin{pmatrix}1&t\\0&1\end{pmatrix}$. A repeated root counts algebraic multiplicity, which can exceed eigenspace dimension.

## W12.T5

$\pi'=(3/5,2/5)$ and other eigenvalue 0.5. The error is multiplied by 0.5 each step, versus 0.7 for the original model. For any norm on the zero-sum error line, this is a faster relative contraction. Award one point each for stationarity equations, normalized vector, second eigenvalue, and the convergence comparison.

## Facilitation

Use quiz 6 at the start. Lab 2 uses T4 as the one-point group artifact and the final eight minutes for the four-point individual check. Boundary cases are required, not bonus work.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
