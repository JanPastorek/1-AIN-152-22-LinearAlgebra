# Seminar 08 — Determinants: area, orientation, and hypotheses

[Course index](../README.md) · [Practice solutions](../solutions/practice/08_determinants_and_volume.md)

**Prerequisites:** Determinant definition and row-operation rules from lecture.

**Goal:** Interpret determinant without confusing area preservation with length preservation.

**Read and work through:** [Linear transformations](../6_linear_transformations.ipynb) — The unit-square explanation and transformation notes. Use the multiplication/inverse parameter example for a determinant calculation. Use the relevant worked example during the existing seminar time; this sheet is its companion investigation, not a replacement for the explanation. [Reading map](../docs/notebook_route.md).

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

**Interactive companion:** [notebook](../notebooks/01_transformations_and_groups.ipynb). The same questions can be completed on paper. Use it during the investigation, not as additional homework.

## W08.T1

Compare $I$, $H=\begin{pmatrix}1&1\\0&1\end{pmatrix}$, $D=\operatorname{diag}(2,1/2)$, $F=\operatorname{diag}(1,-1)$ and $P=\operatorname{diag}(1,0)$. Sketch their images of a unit square. Predict determinant, area factor, and whether lengths are preserved.

## W08.T2

Compute $\det\begin{pmatrix}2&1&3\\0&-1&4\\5&2&0\end{pmatrix}$ by expansion or determinant-aware elimination. Keep track of swaps and scalings. Use an exact symbolic result and a floating-point result to check your arithmetic; explain why these are different kinds of evidence.

## W08.T3

Construct a matrix with determinant 1 that is not a rotation. Refute “positive determinant means every vector gets longer.” Then prove $\det(AB)=\det(A)\det(B)$ in dimension 2 by algebra, or use the alternating multilinear characterization if already established in lecture. Connect the identity to composed area factors.

## W08.T4

A student divides by a parameter while finding $\det C$ for $C=\begin{pmatrix}a&b&b\\a&a&b\\a&a&a\end{pmatrix}$. Find a formula valid at **all** real $(a,b)$, then classify invertibility. Why must an inverse formula carry restrictions even when the determinant formula does not?

## W08.T5

**Individual exit:** A square real matrix has determinant $-2$. State what follows about invertibility, volume scaling and orientation. State one thing this does not tell you about lengths.
