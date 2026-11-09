# Lab explorations

[Course index](../README.md) · [Linear Algebra Lab](https://janpastorek.com/1-AIN-152-22-LinearAlgebra/interactive/) · [Notebook route](notebook_route.md)

Companion exercises for the interactive chapter pages. Each chapter opens with the same **motivating problem** as its page. Attempt it before the session, keep your attempt, and come back at the end to solve it with a certificate. The other tasks are tagged:

- **Motivation**: the chapter's opening problem.
- **Predict**: commit to an answer on paper, then check it in the studio's Predict mode.
- **Lab**: an investigation in a lab or the algorithm studio. Record what you changed and what you saw.
- **Proof**: an argument that holds for every instance, not only the ones you tried.
- **Model**: build or criticize a model of a real situation.

A screenshot is never a certificate. Submit the vector, matrix or number that someone else can check by hand.

## Chapter 1 — Matrices and systems of equations ([page](https://janpastorek.com/1-AIN-152-22-LinearAlgebra/docs/interactive/chapter1/))

1. **Motivation: the traffic mystery.** Four roads in a loop have the junction balances f₁ − f₄ = 3, f₂ − f₁ = −1, f₃ − f₂ = −2, f₄ − f₃ = 0. Do the counts determine the flows? A second crew reports 4 instead of 3 at the first junction. Prove that no flows fit the second report with a combination of the equations, not with a solver message. Sheet: [W02.T1–T3](../seminars/02_systems_and_traffic.md).
2. **Predict.** In the studio, load “Traffic, miscounted”. Before each pivot search, predict which rows can supply the pivot. Then predict the certificate y before the last step. Which row of E is it, and why that row?
3. **Lab.** Load W04.T1 in the LU studio and solve for b₁ = (4, 10, 7) and b₂ = (4, 10, 8) with the same L and U. Count the operations of the two triangular solves and compare them with a fresh elimination ([W04.T2](../seminars/04_lu_and_numerics.md)).
4. **Proof.** Show that if yᵀA = 0 and yᵀb ≠ 0, then Ax = b has no solution. Then show the converse for the reduced matrix: a row 0 = c with c ≠ 0 always comes from such a y. Why does recording E make this constructive?
5. **Model.** The traffic family f = (3, 2, 0, 0) + t(1, 1, 1, 1) has t ≥ 0 for nonnegative flows. Which extra measurement on one road fixes t? Which measurements can never fix it? Phrase your answer with the null space.

## Chapter 2 — Determinants ([page](https://janpastorek.com/1-AIN-152-22-LinearAlgebra/docs/interactive/chapter2/))

1. **Motivation: the mirrored map.** A mapping app draws the triangle P = (1, 1), Q = (5, 2), S = (2, 6) with x ↦ Mx, M = [[1, 2], [3, 1]]. Without transforming the corners, find the signed area of the image and decide whether the map mirrors shapes. Sheet: [W08.T1](../seminars/08_determinants_and_volume.md).
2. **Predict.** Load Leon Example 2.2.1 in the studio. Predict every sign change before it happens and the final value before the last step.
3. **Lab.** Use the decision guide on the four presets. For the 4 × 4 preset, estimate how many products cofactor expansion would need, and compare that with elimination.
4. **Proof.** Prove that adding a multiple of one row to another leaves det unchanged, using only multilinearity and the fact that a matrix with two equal rows has det 0.
5. **Model.** Construct a matrix with determinant 1 that changes some lengths. What does that say about “det 1 means rotation” ([W08.T3](../seminars/08_determinants_and_volume.md))?

## Chapter 3 — Vector spaces ([page](https://janpastorek.com/1-AIN-152-22-LinearAlgebra/docs/interactive/chapter3/))

1. **Motivation: tiny tomography.** A scanner measures the row and column sums (5, 9, 6, 8) of a 2 × 2 image (p, q, r, s). Is the image determined? Find two images with the same readings, and a fifth sensor that separates every such pair. Sheet: [W05.T2–T3](../seminars/05_basis_and_tomography.md).
2. **Predict.** For each column of the scanner matrix, predict whether it will hold a pivot. Then predict the rank before the last step.
3. **Lab.** Check a dependence relation for e₁, e₂, e₁ + e₂ in Check-a-certificate mode. Explain why independence has no equally short certificate, and what replaces it.
4. **Proof.** Show that a fifth sensor row w removes the ambiguity exactly when w·(1, −1, −1, 1) ≠ 0.
5. **Model.** Does the total brightness p + q + r + s help? Explain using the dependence relation among the four measurement rows.

## Chapter 4 — Linear transformations ([page](https://janpastorek.com/1-AIN-152-22-LinearAlgebra/docs/interactive/chapter4/))

1. **Motivation: one matrix for the whole animation.** A crate is turned a quarter turn about the origin, then moved by (2, 1). Find one matrix for both steps, decide whether the map is linear, and find the matrix that undoes it. Sheet: [W11.T1–T2](../seminars/11_affine_geometry.md).
2. **Predict.** In the pipeline studio, predict where the corner (1, 0) lands after each step, for both orders of the two steps.
3. **Lab.** Load W07.T3 in the RREF studio. Which direction does the first layer lose? Check it in the null space.
4. **Proof.** Show that a map with L(0) ≠ 0 is not linear, and that F(0) = 0 alone does not prove linearity ([W07.T4](../seminars/07_linear_maps_and_bottlenecks.md)).
5. **Model.** Why does a graphics card transform points with (x, y, 1) but surface directions with (u, v, 0)?

## Chapter 5 — Orthogonality ([page](https://janpastorek.com/1-AIN-152-22-LinearAlgebra/docs/interactive/chapter5/))

1. **Motivation: calibrating a cheap thermometer.** Readings 1, 2, 2 at t = 0, 1, 2. Find the best line y = β₀ + β₁t and prove that it is best by showing the residual is orthogonal to both columns of A. Sheet: [W11.T4](../seminars/11_affine_geometry.md).
2. **Predict.** In the Gram–Schmidt studio, predict each coefficient r(j, k) before it is subtracted.
3. **Lab.** Add a fourth reading of your choice. How do x̂ and the residual change? When is the residual zero?
4. **Proof.** Let x̂ satisfy Aᵀ(b − Ax̂) = 0. Show that ‖b − Ax‖² = ‖b − Ax̂‖² + ‖A(x̂ − x)‖² for every x.
5. **Model.** The decision guide recommends QR when cond₂(A) is large. Build a data set where it does, and explain what goes wrong with AᵀA.

## Chapter 6 — Eigenvalues ([page](https://janpastorek.com/1-AIN-152-22-LinearAlgebra/docs/interactive/chapter6/))

1. **Motivation: two apps share a market.** P = [[0.9, 0.2], [0.1, 0.8]], and everyone starts on app A. Find the long-run shares and how fast the market approaches them, with eigenvectors as evidence. Sheet: [W12.T1–T2](../seminars/12_eigenvalues_and_dynamics.md).
2. **Predict.** In the power-method studio, predict the largest entry of Ax for the first iterations of each preset.
3. **Lab.** Compare the observed error ratio of the power method for P and for P′ = [[0.8, 0.3], [0.2, 0.7]] with |λ₂/λ₁| ([W12.T5](../seminars/12_eigenvalues_and_dynamics.md)).
4. **Proof.** For J = [[1, 1], [0, 1]], prove that every eigenvector is a multiple of e₁, so J is not diagonalizable ([W12.T4](../seminars/12_eigenvalues_and_dynamics.md)).
5. **Model.** Where does the swap matrix Q = [[0, 1], [1, 0]] leave the market, and why does the power method's start (1, 1) hide the problem?

## Chapter 7 — Numerical linear algebra ([page](https://janpastorek.com/1-AIN-152-22-LinearAlgebra/docs/interactive/chapter7/))

1. **Motivation: is the solver broken?** In 3-digit arithmetic, 0.0001x₁ + 2x₂ = 4, x₁ + x₂ = 3 comes out as x = (0, 2) (Leon Example 7.3.3). Is the precision, the algorithm or the problem to blame? Sheet: [W04.T4](../seminars/04_lu_and_numerics.md).
2. **Predict.** With partial pivoting on, predict the pivot row of each column, and the first multiplier to t digits.
3. **Lab.** Run the two ill-conditioned presets. A change of 0.001 in b moves x by about 1. Relate that to cond∞(A).
4. **Proof.** Show that with partial pivoting every multiplier satisfies |m| ≤ 1.
5. **Model.** A colleague says “the residual is tiny, so the answer is accurate”. Refute it with an ill-conditioned example, and state what the residual does tell you.
