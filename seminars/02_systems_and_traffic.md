# Seminar 02 — Systems, elimination, and a traffic mystery

[Course index](../README.md) · [Practice solutions](../solutions/practice/02_systems_and_traffic.md)

**Prerequisites:** Week 1; substitution and elementary row operations.

**Goal:** Describe all solutions, impose physical constraints, and certify inconsistency.

**Read and work through:** [Geometric view](../2_Geometric_view_of_linear_algebra_checkpoint.ipynb) — System of linear equations; The row picture; The column picture. Use the equation-by-equation worked example in Elimination for the row operations. Use the relevant worked example during the existing seminar time; this sheet is its companion investigation, not a replacement for the explanation. [Reading map](../docs/notebook_route.md).

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

## W02.T1

Four roads form a directed cycle with flows $f_1,f_2,f_3,f_4$. At successive junctions the balance equations are
$f_1-f_4=3$, $f_2-f_1=-1$, $f_3-f_2=-2$, $f_4-f_3=0$.
Draw arrows and explain each sign. Predict whether the balances determine the circulating traffic uniquely.

## W02.T2

Write $Af=b$ and use $f_3=t$ to find every solution. Which values of $t$ give nonnegative flows? Check your family in all four equations. Explain why a computer returning one solution has not answered the whole question.

## W02.T3

Change only the first right-hand side from 3 to 4. Without repeating elimination, prove that no solution exists. Find a linear combination of the four equations with zero left-hand side and nonzero right-hand side. What modeling assumption might have failed in a real traffic count?

## W02.T4

Classify $x+y=2$, $2x+ay=b$ for every real pair $(a,b)$. A proposed proof divides by $a-2$ and declares a unique solution. Repair it. Explain why multiplying an equation by zero is not an equivalence-preserving row operation.

## W02.T5

**Individual exit:** Certify that $x+y=1$, $2x+2y=3$ is inconsistent using one row combination. State what the certificate means geometrically.
