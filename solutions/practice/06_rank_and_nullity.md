# Practice solutions — Seminar 06

[Student sheet](../../seminars/06_rank_and_nullity.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W06.T1

The separate practice test and marking guide supply a 30-minute rehearsal; do not reuse their published answers as a secure live assessment.

## W06.T2

RREF is $\begin{pmatrix}1&0&1&1\\0&1&1&0\\0&0&0&0\end{pmatrix}$. Rank 2. A kernel basis in $\mathbb R^4$ is $(-1,-1,1,0)^T,(-1,0,0,1)^T$. A column-space basis in $\mathbb R^3$ is the first two **original** columns $(1,1,1)^T,(2,1,2)^T$. All solutions are $e_2+s(-1,-1,1,0)^T+t(-1,0,0,1)^T$.

## W06.T3

Every domain vector is a combination of the chosen basis; applying $T$ kills the $k_i$, so the remaining images span. If $\sum c_iT(u_i)=0$, then $\sum c_i u_i$ belongs to the kernel and can be written using the $k_j$. Independence of the full domain basis forces all $c_i=0$. Thus rank is $n-d$. The finite basis and its extension allow this finite dimension count.

## W06.T4

Rank plus nullity would be 5, contradicting domain dimension 4. Row reduction changes the example column space from span$(1,1)^T$ to span$(1,0)^T$. Invertible row operations preserve the kernel (same homogeneous equations), row space, and rank, but generally not the column space as a subset of its ambient space.

## W06.T5

Nullity 3; neither injective (nonzero kernel) nor onto $\mathbb R^3$ (rank 2). The kernel is three-dimensional and has infinitely many vectors over $\mathbb R$.

## Facilitation

After the test use 15 minutes for T2, 25 for T3, 12 for T4, and 8 for exit/feedback. The basis-extension argument should be a guided proof, not a speed exercise.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
