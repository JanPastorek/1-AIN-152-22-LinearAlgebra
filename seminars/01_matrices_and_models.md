# Seminar 01 — Matrices as models and black boxes

[Course index](../README.md) · [Practice solutions](../solutions/practice/01_matrices_and_models.md)

**Prerequisites:** Vectors, coordinates, elementary algebra; no programming assumed.

**Goal:** Read rows and columns as different parts of a model; distinguish evidence for linearity from a proof.

**Read and work through:** [Introduction to matrices](../1_Introduction_to_matrices_checkpoint.ipynb) — Representing matrices; Shape; Accessing values in rows and columns. Use the relevant worked example during the existing seminar time; this sheet is its companion investigation, not a replacement for the explanation. [Reading map](../docs/notebook_route.md).

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

## W01.T1

A workshop makes two kits. Their resource requirements are the columns of
$A=\begin{pmatrix}2&1\\1&2\\1&0\end{pmatrix}$.
For $x=(2,3)^T$, predict the units used of each of the three resources before multiplying. Explain the meaning and units of $A_{12}$ and of column 2. Why is $xA$ not the same model?

## W01.T2

The stock record says $b=(7,8,2)^T$. Recover the two kit counts using the first two resource equations and verify the third. Now the last recorded stock use is changed to 3. Can a different kit count explain all three entries? Give a certificate, not just a solver message.

## W01.T3

A black box is promised to be linear and satisfies $T(e_1)=(2,1)^T$, $T(e_2)=(-1,1)^T$. Find its matrix and $T(3,-2)$. Prove that these two observations determine its value on every input. In pairs, one person chooses an input and the other predicts the output from the columns.

## W01.T4

Remove the promise of linearity. Construct a nonlinear rule that agrees with this black box at $0,e_1,e_2$. Explain why testing these three inputs is insufficient. Create one additional input that distinguishes your rule from $T$. Optional: can any finite set of probes prove linearity of an unrestricted function?

## W01.T5

**Individual exit (no AI):** For $C=\begin{pmatrix}1&2&0\\0&1&1\end{pmatrix}$, state the domain and codomain of $x\mapsto Cx$ and compute $C(1,-1,2)^T$. Explain what one column means.
