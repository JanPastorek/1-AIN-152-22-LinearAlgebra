# Seminar 11 — Affine geometry and a tiny graphics pipeline

[Course index](../README.md) · [Practice solutions](../solutions/practice/11_affine_geometry.md)

**Prerequisites:** Linear maps and basis changes; distinction between a point and a displacement.

**Goal:** Represent translations with homogeneous coordinates and preserve affine combinations.

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

**Interactive companion:** [notebook](../notebooks/05_coordinates_and_affine_maps.ipynb). The same questions can be completed on paper. Use it during the investigation, not as additional homework.

## W11.T1

Apply the quarter-turn $R=\begin{pmatrix}0&-1\\1&0\end{pmatrix}$ and then translate by $c=(2,1)^T$. Find the images of $0,e_1,e_2$. Is the resulting function linear? Find its inverse without multiplying a $3\times3$ inverse formula.

## W11.T2

Represent the same map with a homogeneous $3\times3$ matrix. Compare translating first and rotating first. Apply the matrix to a point $(x,y,1)^T$ and to a displacement $(u,v,0)^T$. Explain why translations affect one but not the other.

## W11.T3

Prove that an affine map $f(x)=Ax+c$ preserves a combination $\sum_i\lambda_i x_i$ when $\sum_i\lambda_i=1$. Must the weights be nonnegative? Use this to find the image of the centroid of the triangle $(0,e_1,e_2)$.

## W11.T4

Describe the line $x+y=3$ as a point plus a direction space. Is it a vector subspace? Compare its directions with the kernel of $\begin{pmatrix}1&1\end{pmatrix}$. Optional replacement: fit $y=\beta_0+\beta_1t$ to $(0,1),(1,2),(2,2)$ by minimizing squared residuals; distinguish exact consistency from best fit.

## W11.T5

**Individual exit:** Why is the set $\{(x,y,1):x,y\in\mathbb R\}$ an affine plane but not a vector subspace of $\mathbb R^3$? Give the homogeneous matrix for translation by $(-1,2)$.
