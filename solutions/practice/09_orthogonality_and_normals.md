# Practice solutions — Seminar 09

[Student sheet](../../seminars/09_orthogonality_and_normals.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W09.T1

$P\times Q=(1,-1,1)$, unit normal $(1,-1,1)/\sqrt3$, area $\sqrt3/2$. Reversing order reverses the normal but not the area. Orientation determines which side is treated as the front face; a zero cross product would mean a degenerate triangle.

## W09.T2

$\alpha=(u^Tb)/(u^Tu)=5/5=1$, so the projection is $(1,2)$ and residual $(2,-1)$. The matrix is $\frac15\begin{pmatrix}1&2\\2&4\end{pmatrix}$. For any $tu$, $b-tu=r+(1-t)u$ with $r\perp u$. Hence $\|b-tu\|^2=\|r\|^2+(1-t)^2\|u\|^2$, uniquely minimized at $t=1$.

## W09.T3

$H^2=H$, but $H(0,1)^T=(1,0)^T$; the closest point on the $x$-axis is $(0,0)$. Residual $(-1,1)$ is not perpendicular to the axis. In Euclidean coordinates an orthogonal projector is both idempotent and symmetric; here $H\ne H^T$.

## W09.T4

For instance $(1,1,0)$ and $(1,-1,2)$ have dot product zero. Replacing the second by $(2,2,0)$ gives cross product zero. The angle with a zero vector is undefined; projection onto span$(0)=\{0\}$ is zero, but the formula dividing by $u^Tu$ is undefined at $u=0$. Optional Gram–Schmidt yields $(1,1)/\sqrt2,(1,-1)/\sqrt2$.

## W09.T5

Projection $(1,-1)$; residual $(1,1)$; their dot product is $1-1=0$.

## Facilitation

Quiz 5 replaces the opening prediction. Insist on the all-points closest-distance argument, not just a picture. Students can use printed triangles without 3D software.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
