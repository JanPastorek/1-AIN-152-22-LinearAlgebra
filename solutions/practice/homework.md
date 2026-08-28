# Example homework responses

[Tasks](../../assessment/homework.md)

These are examples, not the only acceptable constructions. A student's independent check may differ.

1. Choose balances $(2,-1,-1)$ and equations $f_1-f_3=2$, $f_2-f_1=-1$, $f_3-f_2=-1$. All flows are $(t+2,t+1,t)$; nonnegativity gives $t\ge0$. Substitution verifies all equations. Change the first balance to 3: summing all equations gives $0=1$, so no solution. The old argument relied on net external flow zero in a steady state.
2. $B=\begin{pmatrix}0&1\\1&1\end{pmatrix}$ has determinant −1 but cannot have unit-lower LU without swapping: $u_{11}=0$ would force $(LU)_{21}=0$. With the swap $P$, $PB=\begin{pmatrix}1&1\\0&1\end{pmatrix}$, so $L=I$ works. Meanwhile $A=\operatorname{diag}(1,0)$ is singular yet $A=I A$ is LU. A zero candidate pivot signals a need to inspect/pivot, not an automatic conclusion about all factorizations.
3. Take $p=x$ and $q=x+(x^2-x)=x^2$. The difference lies in span$(x^2-x)$, the one-dimensional kernel of evaluation at 0 and 1. Evaluation at $c$ distinguishes every member of the family iff $c^2-c\ne0$, hence iff $c\notin\{0,1\}$. Choosing $c=2$ adds a nonredundant measurement. This is the same kernel-direction argument as tomography.
4. Choose $A=\operatorname{diag}(2,1)$, $S=\begin{pmatrix}1&1\\0&1\end{pmatrix}$. Then $C=\begin{pmatrix}2&1\\0&1\end{pmatrix}$ and $AS=SC$ by direct multiplication. This matrix identity proves the claim for all $c$; checking a single vector only proves that instance. The wrong-order matrix has upper-right entry −1 and fails at $c=e_2$. Other choices may make the wrong formula accidentally agree; identifying this is a useful limitation, not an error in the student's work.
5. For $0<a+b<2$, the unique stationary vector is $(b,a)/(a+b)$ and the other mode is multiplied by $1-a-b$, whose absolute value is below 1. At $a=b=0$, every vector is stationary; at $a=b=1$, nonstationary vectors oscillate. For $a=b=0.8$, the other eigenvalue is −0.6 and stationarity is $(0.5,0.5)$. From $(1,0)$ the next states are $(0.2,0.8)$ and $(0.68,0.32)$: the error alternates and shrinks. A negative eigenvalue need not mean divergence.
