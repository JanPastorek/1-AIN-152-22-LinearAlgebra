# Practice solutions — Seminar 11

[Student sheet](../../seminars/11_affine_geometry.md) · [Course index](../../README.md)

**Public practice material.** These are worked examples and facilitation notes, not secure live assessment keys. Read after an honest attempt. Equivalent valid arguments are welcome.

## W11.T1

Images are $(2,1),(2,2),(1,1)$. It is not linear because $f(0)=c\ne0$. Its inverse is $f^{-1}(y)=R^{-1}(y-c)$: first undo translation, then rotation.

## W11.T2

$H=\begin{pmatrix}0&-1&2\\1&0&1\\0&0&1\end{pmatrix}$. Translating first gives $Rx+Rc$ with $Rc=(-1,2)$, a different map. A point becomes $(Ax+c,1)$; a displacement becomes $(Av,0)$. Homogeneous matrix multiplication encodes affine composition while distinguishing these two kinds of input.

## W11.T3

$\sum_i\lambda_i f(x_i)=A\sum_i\lambda_i x_i+c\sum_i\lambda_i=A\sum_i\lambda_i x_i+c=f(\sum_i\lambda_i x_i)$. Nonnegativity is needed for convex combinations, not general affine combinations. The centroid image is the average of the three images, $(5/3,4/3)$.

## W11.T4

The line is $(3,0)+t(-1,1)$; it excludes the origin, so it is not a subspace. Its direction space is the kernel span$((-1,1))$. Optional fit: $X=\begin{pmatrix}1&0\\1&1\\1&2\end{pmatrix}$, $X^TX=\begin{pmatrix}3&3\\3&5\end{pmatrix}$, $X^Ty=(5,6)^T$, giving $(\beta_0,\beta_1)=(7/6,1/2)$. Residual is $(-1/6,1/3,-1/6)$ and is perpendicular to both columns. In numerical work use a least-squares solver rather than explicitly inverting $X^TX$.

## W11.T5

The plane does not contain the zero vector and is not closed under addition. Translation matrix is $\begin{pmatrix}1&0&-1\\0&1&2\\0&0&1\end{pmatrix}$.

## Facilitation

Make students physically move a paper triangle. The optional least-squares problem replaces T4; it is not extra required syllabus content.

Ask “which assumption makes that step valid?” before revealing a correction. In the final debrief, connect at least one calculation to the definition or theorem it illustrates. Use the exit response to choose next week’s short recap, not to rank students publicly.
