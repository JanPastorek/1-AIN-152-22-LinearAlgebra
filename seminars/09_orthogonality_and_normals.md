# Seminar 09 — Orthogonality, projection, and surface normals

[Course index](../README.md) · [Practice solutions](../solutions/practice/09_orthogonality_and_normals.md)

**Prerequisites:** Dot product, cross product and Euclidean norm; basic geometry.

**Goal:** Derive a closest-point projection and distinguish it from an oblique projection.

**Read and work through:** [Geometric view](../2_Geometric_view_of_linear_algebra_checkpoint.ipynb) — Vector product, followed by the worked projection and normal derivations in the new lab. Use the relevant worked example during the existing seminar time; this sheet is its companion investigation, not a replacement for the explanation. [Reading map](../docs/notebook_route.md).

**90-minute route:** 0–8 prediction or scheduled quiz; 8–18 pair discussion; 18–30 T2 worked start; 30–55 investigation (finish T2, begin T3); 55–70 T4; 70–82 T3/T4 proof debrief; 82–90 individual exit.

**Working rules:** Commit to an individual prediction first. Work in pairs or groups of three, rotating explainer, skeptic and recorder. AI is allowed only in the investigation portions when the instructor permits it; record one claim you independently checked. Quizzes, tests and individual exits are tool-free unless an accommodation is agreed. No paid account is required. Optional tasks replace, rather than extend, the main activity.

**Interactive companion:** [notebook](../notebooks/04_orthogonality_and_normals.ipynb). The same questions can be completed on paper. Use it during the investigation, not as additional homework.

## W09.T1

A triangular face has vertices $O=(0,0,0)$, $P=(1,1,0)$, $Q=(0,1,1)$. Find a normal, a unit normal and its area. What changes when the vertex order is reversed? Why should a graphics program care about the order?

## W09.T2

Project $b=(3,1)^T$ onto span$(u)$ for $u=(1,2)^T$. Derive the coefficient by requiring an orthogonal residual. Find the projection matrix. Prove that your projected point is the closest point on the line, for every point on the line.

## W09.T3

Let $H=\begin{pmatrix}1&1\\0&0\end{pmatrix}$. Verify $H^2=H$. Is $Hb$ always the closest point to $b$ on the image of $H$? Test $b=(0,1)^T$ and identify the missing hypothesis in “every idempotent matrix is an orthogonal projection.”

## W09.T4

Design two nonzero perpendicular vectors in $\mathbb R^3$ and verify them. Change one vector so they become parallel and explain what happens to their cross product. Discuss what is undefined if either vector is zero. Optional substitution: orthonormalize $(1,1)$ and $(1,0)$ by subtracting a projection.

## W09.T5

**Individual exit:** For $u=(1,-1)^T$ and $b=(2,0)^T$, give the orthogonal projection and residual. Verify perpendicularity with one scalar calculation.
