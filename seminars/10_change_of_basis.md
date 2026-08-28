# Seminar 10 — Same vector, different coordinates

[Course index](../README.md) · [Practice solutions](../solutions/practice/10_change_of_basis.md)

**Prerequisites:** Bases, invertible matrices, linear maps.

**Goal:** Derive change-of-basis formulas from a commuting calculation instead of memorizing order.

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

**Interactive companion:** [notebook](../notebooks/05_coordinates_and_affine_maps.ipynb). The same questions can be completed on paper. Use it during the investigation, not as additional homework.

## W10.T1

Let $S=\begin{pmatrix}1&1\\1&-1\end{pmatrix}$ have the new basis vectors as columns. Find the new coordinates of $x=(3,1)^T$. Explain separately what $Sc$ and $S^{-1}x$ mean. Draw the vector and both coordinate descriptions.

## W10.T2

For $A=\operatorname{diag}(2,1)$, derive the matrix $C$ acting on the new coordinates. Compute $C(2,1)^T$, convert back with $S$, and compare with $Ax$. Prove $AS=SC$ and explain how it determines $C$.

## W10.T3

A draft uses $SAS^{-1}$ instead of $S^{-1}AS$. Test it with $S'=\begin{pmatrix}1&1\\0&1\end{pmatrix}$ and the same $A$. Give a numerical input that exposes the error. Why is using only the first $S$ an ineffective test of this particular mistake?

## W10.T4

Construct a nonstandard basis in which the matrix of the identity is still the identity, and prove this works for every basis. For a general map between two spaces, with domain basis matrix $S$ and codomain basis matrix $T$, derive the formula. Explain which coordinates the input and output use.

## W10.T5

**Individual exit:** With $S'$ above, a coordinate vector is $c=(0,1)^T$. Find the physical vector, its image under $A$, and the new coordinates of that image.
