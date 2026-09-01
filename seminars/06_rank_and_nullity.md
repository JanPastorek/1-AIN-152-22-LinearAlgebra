# Seminar 06 — Rank, nullity, and spaces that must not be confused

[Course index](../README.md) · [Practice solutions](../solutions/practice/06_rank_and_nullity.md)

**Prerequisites:** Weeks 1–5; a basis can be extended to a basis of a finite-dimensional space.

**Goal:** Locate kernel and image in the correct ambient spaces and explain rank–nullity.

**Read and work through:** [Independence, spanning, basis and dimension](../5_Independence_Spanning_Basis_Dimension.ipynb) — Dimension; the final column-space/kernel example. Continue with the guided rank–nullity proof in the seminar. Use the relevant worked example during the existing seminar time; this sheet is its companion investigation, not a replacement for the explanation. [Reading map](../docs/notebook_route.md).

**90-minute route:** 0–30 test/rehearsal; 30–45 T2; 45–70 T3; 70–82 T4; 82–90 exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

## W06.T1

**First 30 minutes:** supervised test 1 if the proposal is adopted, or use the public practice test as rehearsal. No new teaching is scheduled in this slot.

## W06.T2

For $A=\begin{pmatrix}1&2&3&1\\1&1&2&1\\1&2&3&1\end{pmatrix}$, find rank, a kernel basis, and a column-space basis. Label the ambient space of every vector. Solve $Ax=(2,1,2)^T$ using a particular solution plus the kernel.

## W06.T3

Let $T:V\to W$, with $\dim V=n$. Extend a kernel basis $k_1,\ldots,k_d$ to a domain basis $k_1,\ldots,k_d,u_1,\ldots,u_{n-d}$. Prove that $T(u_1),\ldots,T(u_{n-d})$ span the image and are independent. Conclude rank–nullity. Which part uses finite dimension?

## W06.T4

A report says a map from $\mathbb R^4$ has rank 2 and nullity 3. Diagnose it. Then test the claim “row reduction preserves column space” on $B=\begin{pmatrix}1&0\\1&0\end{pmatrix}$. What does row reduction preserve instead?

## W06.T5

**Individual exit:** For a map $\mathbb R^5\to\mathbb R^3$ of rank 2, state nullity, whether it is injective, and whether it is onto. Explain why a nullity of 3 does not mean the kernel contains three vectors.
