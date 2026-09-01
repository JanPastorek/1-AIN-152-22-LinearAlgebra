# Seminar 05 — Basis, hidden directions, and tiny tomography

[Course index](../README.md) · [Practice solutions](../solutions/practice/05_basis_and_tomography.md)

**Prerequisites:** Elimination; definitions of span, independence, basis, and kernel introduced in lecture or a short recap.

**Goal:** Find an entire inverse-problem solution set and design a measurement that removes ambiguity.

**Read and work through:** [Independence, spanning, basis and dimension](../5_Independence_Spanning_Basis_Dimension.ipynb) — Independence; Spanning; Basis. Carry the free-variable example into tomography. Use the relevant worked example during the existing seminar time; this sheet is its companion investigation, not a replacement for the explanation. [Reading map](../docs/notebook_route.md).

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

**Interactive companion:** [notebook](../notebooks/02_tiny_tomography.ipynb). The same questions can be completed on paper. Use it during the investigation, not as additional homework.

## W05.T1

In $\mathbb R^3$, consider $e_1,e_2,e_1+e_2$. Find a nontrivial zero combination. Do these vectors span a plane? Select a basis. Explain why “spanning” alone does not mean “independent.”

## W05.T2

A $2\times2$ image has pixel values $(p,q,r,s)$, listed row by row. Row and column sums are $(5,9,6,8)$, so
$A=\begin{pmatrix}1&1&0&0\\0&0&1&1\\1&0&1&0\\0&1&0&1\end{pmatrix}$.
Find all images producing these measurements. Prove that your family is complete, and determine which images have nonnegative pixels.

## W05.T3

Find a basis of $\ker A$ and the rank. A proposed fifth measurement is the sum of all pixels; another is $p+s$. Which can distinguish the images? If $p+s=7$, reconstruct the image. In general, what condition on a new measurement row $w$ removes the one-parameter ambiguity?

## W05.T4

Choose two different physically valid images with the same four measurements, then design a sensor that separates them. Exchange with another team. They must check whether your sensor separates **every** pair in the family. Submit the two images, sensor row, and an algebraic justification; a screenshot alone is insufficient.

## W05.T5

**Individual transfer / exit:** A new fifth sensor reports $2p+q=9$. Reconstruct the image and explain uniqueness using the kernel direction. If this is graded lab 1, use the published four-point individual rubric.
