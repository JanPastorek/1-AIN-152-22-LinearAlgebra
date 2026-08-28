# Seminar 07 — Linear maps beyond coordinate vectors

[Course index](../README.md) · [Practice solutions](../solutions/practice/07_linear_maps_and_bottlenecks.md)

**Prerequisites:** Rank–nullity; polynomial coefficient representation; basic differentiation.

**Goal:** Construct and analyze linear maps, including a simple network bottleneck.

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

## W07.T1

For $D:P_2\to P_1$, $D(p)=p'$, use bases $(1,x,x^2)$ and $(1,x)$. Find the matrix, kernel and image. Explain why a polynomial is a vector even though it is not written as an arrow.

## W07.T2

For $E:P_2\to\mathbb R^2$, $E(p)=(p(0),p(1))$, find the matrix and a kernel basis. Is $E$ onto? Construct a map $\mathbb R^3\to\mathbb R^2$ whose kernel is exactly the $x$-axis and prove that “exactly.”

## W07.T3

A network without activations or biases has layers $A=\begin{pmatrix}1&0&1\\0&1&1\end{pmatrix}$ and $B=\begin{pmatrix}1&0\\0&1\\1&1\end{pmatrix}$. Compute the effective map $BA$. Find a direction the first layer loses. Prove that adding more linear layers after $A$ cannot recover that information. What changes if biases or nonlinear activations are introduced?

## W07.T4

A purported test of linearity checks only $F(0)=0$. Refute it using $F(x,y)=(x,y^2)$. Then prove linearity of either $D$ or $E$ for arbitrary inputs and scalars, not by testing examples.

## W07.T5

**Individual exit:** Give two distinct polynomials with equal values at 0 and 1. Explain their difference using the kernel of $E$.
