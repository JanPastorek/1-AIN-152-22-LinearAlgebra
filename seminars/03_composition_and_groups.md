# Seminar 03 — Composition, inverses, and symmetries

[Course index](../README.md) · [Practice solutions](../solutions/practice/03_composition_and_groups.md)

**Prerequisites:** Matrix multiplication; identity; inverse; definition of a group from lecture.

**Goal:** Connect composition order to noncommutativity and verify a concrete matrix group.

**Read and work through:** [Multiplication and inverses](../3_Matrix_multiplication_Inverses.ipynb) — Multiplying matrices, Methods 1–4; Inverses. Continue with the worked square-symmetry explanation in the new lab. Use the relevant worked example during the existing seminar time; this sheet is its companion investigation, not a replacement for the explanation. [Reading map](../docs/notebook_route.md).

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

**Interactive companion:** [notebook](../notebooks/01_transformations_and_groups.ipynb). The same questions can be completed on paper. Use it during the investigation, not as additional homework.

## W03.T1

Let $R=\begin{pmatrix}0&-1\\1&0\end{pmatrix}$ and $F=\operatorname{diag}(1,-1)$. On paper, predict $RF e_1$ and $FR e_1$. Then multiply. Which operation acts first? Describe the two transformations geometrically.

## W03.T2

Find the eight distinct matrices $I,R,R^2,R^3,F,RF,R^2F,R^3F$. Use $R^4=I$, $F^2=I$, and $FR=R^{-1}F$ to show their set is closed under multiplication and inverses. Where does associativity come from? Identify identity and inverse for each of the two forms $R^k$ and $R^kF$.

## W03.T3

An AI draft claims $(AB)^{-1}=A^{-1}B^{-1}$. Find a counterexample using $R,F$, then give the correct formula and prove it by multiplying on both sides. Explain why the projection $\operatorname{diag}(1,0)$ cannot be added to a group of invertible $2\times2$ matrices.

## W03.T4

Let $A=\begin{pmatrix}1&0\end{pmatrix}$ and $B=\begin{pmatrix}1\\0\end{pmatrix}$. Compute $AB$ and $BA$. Which identity holds, in which dimension? Explain which step in “a left inverse is also a right inverse” needs a square-matrix hypothesis. Optional: prove $(AB)^T=B^TA^T$ by entries.

## W03.T5

**Individual exit:** Compute $(RF)^{-1}$ and justify the order. State one group axiom that would fail if arbitrary singular matrices were included with identity $I_2$.
