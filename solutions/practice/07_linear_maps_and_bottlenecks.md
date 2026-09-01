# Practice solutions — Seminar 07

[Student sheet](../../seminars/07_linear_maps_and_bottlenecks.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W07.T1

$[D]=\begin{pmatrix}0&1&0\\0&0&2\end{pmatrix}$. The kernel is the constant polynomials, span$(1)$; the image is all $P_1$, because $a+bx$ is the derivative of $ax+(b/2)x^2$. Vector-space operations are polynomial addition and scalar multiplication.

## W07.T2

$[E]=\begin{pmatrix}1&0&0\\1&1&1\end{pmatrix}$; the kernel is span$(x^2-x)$, and rank is 2, so $E$ is onto. The map $(x,y,z)\mapsto(y,z)$ has matrix $\begin{pmatrix}0&1&0\\0&0&1\end{pmatrix}$; its output is zero iff $y=z=0$, proving its kernel is exactly the $x$-axis.

## W07.T3

$BA=\begin{pmatrix}1&0&1\\0&1&1\\1&1&2\end{pmatrix}$. The vector $v=(-1,-1,1)^T$ is killed by $A$, hence by every composition $CA$. In particular inputs $x$ and $x+tv$ remain indistinguishable downstream. Biases give affine rather than linear maps; nonlinear activations can change the function class but cannot distinguish two inputs already mapped to an identical intermediate representation.

## W07.T4

$F(0,2)=(0,4)\ne2F(0,1)$. For evaluation, $E(\alpha p+\beta q)=\alpha E(p)+\beta E(q)$ by evaluating each component. Differentiation gives the corresponding identity by the derivative sum and scalar rules.

## W07.T5

For example $p=0$ and $q=x^2-x$. More generally $p$ and $p+c(x^2-x)$ have the same two samples; their difference is in $\ker E$.

## Facilitation

Use quiz 4 as the opening retrieval check. Be precise about the order BA and avoid suggesting that all neural networks are linear.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
