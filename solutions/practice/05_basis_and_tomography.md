# Practice solutions — Seminar 05

[Student sheet](../../seminars/05_basis_and_tomography.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W05.T1

$e_1+e_2-(e_1+e_2)=0$ gives coefficients $(1,1,-1)$. The span is $z=0$, with basis $e_1,e_2$. A redundant vector can belong to a spanning set.

## W05.T2

Set $p=t$. Then $q=5-t$, $r=6-t$, $s=3+t$; the fourth equation holds automatically. Successive substitution proves all solutions have this form, not merely that some examples work. Nonnegativity gives $0\le t\le5$.

## W05.T3

$v=(1,-1,-1,1)^T$ spans the kernel. Row 1 + row 2 equals row 3 + row 4, and the first three rows are independent, so rank is 3. The total-sum row has $wv=0$ and adds no information. For $w=(1,0,0,1)$, $wv=2\ne0$; $3+2t=7$ gives $t=2$, hence $(2,3,4,5)$. In general $w(x_0+tv)=wx_0+t(wv)$ is injective in $t$ exactly when $wv\ne0$. A reported value can still violate physical nonnegativity.

## W05.T4

For example $(0,5,6,3)$ and $(5,0,1,8)$ share the data. Measuring $p$ distinguishes every pair because its row has dot product 1 with $v$. Measuring $p+q$ distinguishes none. For any two parameters $t_1,t_2$, the sensor difference is $(t_1-t_2)wv$, establishing the claim for all pairs.

## W05.T5

$2t+(5-t)=9$ gives $t=4$ and $(4,1,2,7)$. The row $(2,1,0,0)$ has dot product 1 with $v$, hence uniqueness within the original family. All pixels are nonnegative. Award one point each for parameter equation, solution, uniqueness argument, and physical check.

## Facilitation

Use quiz 3 in the opening eight minutes. Reserve the final eight minutes for the individual lab check. The one-point group artifact is T4. Provide printed pixel grids if laptops or widgets are unavailable.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
