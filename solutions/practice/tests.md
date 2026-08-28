# Worked test marking guides

[Practice forms](../../assessment/tests.md)

Use method credit and accept equivalent arguments. Do not penalize a carried arithmetic error again if later reasoning is consistent. These are public practice keys, not secure exam material.

## Test 1A

1. Subtraction gives $(a-2)y=b-6$. If $a\ne2$, $y=(b-6)/(a-2)$ and $x=3-y$ **[1]**. If $a=2,b=6$, all $(3-t,t)$ work **[1]**. If $a=2,b\ne6$, $0=b-6$ is a contradiction **[1]**.
2. $RF e_1=e_2$ and $FR e_1=-e_2$ **[1 total]**. $(RF)^{-1}=FR^{-1}=RF$, with $(RF)(FR^{-1})=I$ and the reverse product also $I$ **[1]**.
3. $0\le t\le5$ **[1]**. Total brightness is 14 for every $t$, so it is redundant **[1]**. $3+2t=7$ gives $t=2$ and $(2,3,4,5)$; coefficient 2 is nonzero, so exactly one member fits **[1]**.
4. Take $A=\operatorname{diag}(1,0)$, $L=I$, $U=A$; product and singularity are explicit **[1]**. For $b=(1,0)$ all $(1,t)$ solve the system, while $b=(0,1)$ is inconsistent, so no unique solution for every $b$ **[1]**.

## Test 1B

1. Subtraction gives $(a-2)y=b-8$. For $a\ne2$, $y=(b-8)/(a-2)$ and $x=(4-y)/2$ **[1]**. At $a=2,b=8$, family $((4-t)/2,t)$ **[1]**; at $a=2,b\ne8$, none **[1]**.
2. $MD e_2=(1,1)$ and $DM e_2=(2,1)$ **[1 total]**. $(MD)^{-1}=D^{-1}M^{-1}=\begin{pmatrix}1/2&-1/2\\0&1\end{pmatrix}$, verified by multiplication **[1]**.
3. $1\le t\le7$ **[1]**. Total is always 14, so redundant **[1]**. $2t-1=7$ gives $t=4$ and $(4,3,4,3)$, uniquely because coefficient 2 is nonzero **[1]**.
4. $A=\operatorname{diag}(0,2)$, $L=I$, $U=A$, determinant zero **[1]**. With $b=(0,2)$, every $(t,1)$ solves the system **[1]**.

## Test 2A

1. Kernel span$((-1,-1,1)^T)$ by solving $x+z=y+z=0$ **[1]**. Rank 2, since the first two columns are independent **[1]**. Not injective because kernel is nonzero; onto $\mathbb R^2$ because rank is 2 **[1 total]**.
2. From $AS=SC$, $C=S^{-1}AS=\begin{pmatrix}2&1\\0&1\end{pmatrix}$ **[1]**. At $e_2$, $Ce_2=(1,1)$ and $S(1,1)=(2,1)=AS e_2$ **[1]**.
3. Projection coefficient is $5/5=1$, so projection $(1,2)$, residual $(2,-1)$ **[1]**. Dot product with $(1,2)$ is zero; for any displacement along the line, the squared distance is residual norm squared plus a nonnegative perpendicular component squared **[1]**.
4. Stationarity gives $0.2p_1=0.3p_2$, so $\pi=(3/5,2/5)$ **[1]**. Eigenvalues 1 and 0.5; the zero-sum difference from $\pi$ is multiplied by $0.5^t\to0$ **[1]**. The swap matrix $\begin{pmatrix}0&1\\1&0\end{pmatrix}$ alternates from $(1,0)$ and is a verified counterexample **[1]**.

## Test 2B

1. Kernel span$((-1,1,-1)^T)$ **[1]**. Rank 2 (first two columns independent) **[1]**. Not injective, onto, with the corresponding kernel/rank reasons **[1]**.
2. $C=S^{-1}AS=\begin{pmatrix}1&0\\2&3\end{pmatrix}$ **[1]**. $Ce_1=(1,2)$, and $S(1,2)=(1,3)=AS e_1$ **[1]**.
3. Coefficient $2/2=1$, projection $(1,-1)$, residual $(1,1)$ **[1]**. Perpendicularity and the squared-distance decomposition prove minimality **[1]**.
4. $0.3p_1=0.1p_2$, giving $\pi=(1/4,3/4)$ **[1]**. Eigenvalues 1 and 0.6, with every zero-sum error multiplied by $0.6^t\to0$ **[1]**. $I_2$ is stochastic and every probability vector is stationary **[1]**.
