# Seminar 04 — Factor once, solve twice

[Course index](../README.md) · [Practice solutions](../solutions/practice/04_lu_and_numerics.md)

**Prerequisites:** Elimination and matrix products; triangular matrices.

**Goal:** Use LU with an explicit permutation convention and separate singularity from factorization failure.

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

**Interactive companion:** [notebook](../notebooks/03_numerics_and_factorizations.ipynb). The same questions can be completed on paper. Use it during the investigation, not as additional homework.

## W04.T1

For $A=\begin{pmatrix}2&1&1\\4&3&3\\2&2&3\end{pmatrix}$, eliminate below the first pivot and then the second. Record every multiplier. Predict which part of this work is reusable when the right-hand side changes.

## W04.T2

Construct unit-lower $L$ and upper $U$ and verify $LU=A$. Solve for both $b_1=(4,10,7)^T$ and $b_2=(4,10,8)^T$ by forward and back substitution. Explain why explicitly forming $A^{-1}$ adds unnecessary work here.

## W04.T3

For $B=\begin{pmatrix}0&1\\1&1\end{pmatrix}$, prove that unit-lower LU without row swaps is impossible. Find $P,L,U$ with $PB=LU$. A claim says “a singular matrix never has LU.” Refute it with a nonzero singular diagonal matrix and state your convention.

## W04.T4

For $A_\varepsilon=\begin{pmatrix}1&1\\1&1+\varepsilon\end{pmatrix}$ with $\varepsilon\ne0$, solve $A_\varepsilon x=(2,2+\varepsilon)^T$. Change the second measurement by $\delta$ and derive the change in $x$. What happens when $|\delta/\varepsilon|$ is large? Distinguish sensitivity of the problem from a bug in the solver.

## W04.T5

**Individual exit:** Under $PA=LU$, which right-hand side enters the forward solve? Can $U$ have a zero diagonal entry in a valid LU factorization? Can you then always solve uniquely?
