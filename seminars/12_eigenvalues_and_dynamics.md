# Seminar 12 — Eigenvectors explain a changing population

[Course index](../README.md) · [Practice solutions](../solutions/practice/12_eigenvalues_and_dynamics.md)

**Prerequisites:** Eigenvalues, eigenvectors and diagonalizability introduced in lecture; probability vectors.

**Goal:** Use eigenmodes to predict dynamics and test exceptional parameter cases.

**Read and work through:** [Eigenvalues and dynamics](../notebooks/06_eigenvalues_and_dynamics.ipynb) — Worked route: find what stays fixed and what changes; exceptional cases; the repeated-eigenvalue example. Use the relevant worked example during the existing seminar time; this sheet is its companion investigation, not a replacement for the explanation. [Reading map](../docs/notebook_route.md).

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

**Interactive companion:** [notebook](../notebooks/06_eigenvalues_and_dynamics.ipynb). The same questions can be completed on paper. Use it during the investigation, not as additional homework.

## W12.T1

Two apps exchange users with update $p_{t+1}=Pp_t$, where $P=\begin{pmatrix}0.9&0.2\\0.1&0.8\end{pmatrix}$. Explain the column sums and each entry. Starting at $p_0=(1,0)^T$, predict whether the distribution stabilizes. Compute one update before using code.

## W12.T2

Find both eigenvalues and a stationary probability vector $\pi$. Prove the formula $p_t=\pi+0.7^t(p_0-\pi)$ for any initial probability vector. Explain why the coefficients sum to one and why convergence follows.

## W12.T3

Test the claim “a stochastic matrix always converges to its stationary distribution” on $Q=\begin{pmatrix}0&1\\1&0\end{pmatrix}$. Then analyze $P(a,b)=\begin{pmatrix}1-a&b\\a&1-b\end{pmatrix}$ for $a,b\in[0,1]$. Include $(a,b)=(0,0)$ and $(1,1)$; do not divide by $a+b$ before checking it.

## W12.T4

For $J=\begin{pmatrix}1&1\\0&1\end{pmatrix}$, find all eigenvectors and compute $J^t$ for nonnegative integer $t$. Explain why two roots of the characteristic polynomial do not automatically supply two independent eigenvectors. For the group artifact, choose one dynamics example and supply a prediction, plot/table, and proof of its long-term behavior.

## W12.T5

**Individual transfer / exit (lab 2):** Replace $P$ by $P'=\begin{pmatrix}0.8&0.3\\0.2&0.7\end{pmatrix}$. Find its stationary distribution and other eigenvalue. Explain whether it converges faster than $P$ from a nonstationary probability vector, measured by error relative to its own stationary distribution.
