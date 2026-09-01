# Practice solutions — Seminar 02

[Student sheet](../../seminars/02_systems_and_traffic.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W02.T1

An internal flow is counted once entering and once leaving. A common amount can be added to all four flows without changing any balance, suggesting nonuniqueness.

## W02.T2

$A=\begin{pmatrix}1&0&0&-1\\-1&1&0&0\\0&-1&1&0\\0&0&-1&1\end{pmatrix}$ and $b=(3,-1,-2,0)^T$. The family is $(t+3,t+2,t,t)^T$, with $t\ge0$ physically. Substitution verifies every equation; solving successively from $f_3=t$ proves completeness. Nonnegativity is an extra physical condition, not a row operation.

## W02.T3

Summing the four left sides gives zero, but the changed right sides sum to 1. Hence $0=1$, impossible. A missing road, accumulation, or measurement error could invalidate the steady-state balance model; the algebra alone does not identify which.

## W02.T4

Subtract twice the first equation: $(a-2)y=b-4$. If $a\ne2$, $y=(b-4)/(a-2)$ and $x=2-y$. If $a=2,b=4$, all $(2-t,t)$ work. If $a=2,b\ne4$, none work. Multiplication by zero discards an equation and need not preserve its solution set.

## W02.T5

Equation 2 minus twice equation 1 gives $0=1$. The two lines are parallel and distinct.

## Facilitation

Use quiz 1 in the opening eight minutes if adopted. Ask teams to display a certificate of inconsistency, not merely the word “inconsistent.”

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
