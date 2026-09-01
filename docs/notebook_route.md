# Notebook reading route

[Course index](../README.md) · [Semester plan](semester_plan.md)

The original notebooks teach through connected explanations, worked calculations and pictures. Keep that sequence. The new sheets provide investigations and discussion prompts **alongside** it; they are not a substitute for the exposition.

In a seminar, select one relevant worked passage, pause before its next step, then let students adapt the idea in the associated activity. This happens inside the existing worked-example and investigation time. Do not assign a whole notebook plus a whole sheet as extra compulsory work.

## Original progression worth keeping

The introduction builds confidence with concrete matrices before abstract definitions. The geometric notebook changes viewpoint while keeping one system: equations become row intersections and then column combinations. Elimination deliberately repeats the same operation in equations, augmented matrices and elementary matrices. Multiplication presents four complementary views. LU develops the factors before invoking a library command. The basis notebook changes examples gradually so students can see what adding a redundant vector does. The transformation notebook connects columns to a whole grid.

These are teaching choices, not duplication to remove. The corrected versions retain them. New “Pause and predict” notes are short stops at those transitions; choose the ones that help, and continue the explanation afterward.

## Which passage goes with which week?

| Week | Read and work through | Then investigate |
|---:|---|---|
| 1 | [Introduction to matrices](../1_Introduction_to_matrices_checkpoint.ipynb): Representing matrices; Shape; Accessing values in rows and columns. | [Matrices as models and black boxes](../seminars/01_matrices_and_models.md) |
| 2 | [Geometric view](../2_Geometric_view_of_linear_algebra_checkpoint.ipynb): System of linear equations; The row picture; The column picture. Use the equation-by-equation worked example in Elimination for the row operations. | [Systems, elimination, and a traffic mystery](../seminars/02_systems_and_traffic.md) |
| 3 | [Multiplication and inverses](../3_Matrix_multiplication_Inverses.ipynb): Multiplying matrices, Methods 1–4; Inverses. Continue with the worked square-symmetry explanation in the new lab. | [Composition, inverses, and symmetries](../seminars/03_composition_and_groups.md) |
| 4 | [LU decomposition](../4_LU_decomposition_of_A-checkpoint.ipynb): Turning a matrix into upper-triangular form; Calculating the lower-triangular form; Row exchanges. | [Factor once, solve twice](../seminars/04_lu_and_numerics.md) |
| 5 | [Independence, spanning, basis and dimension](../5_Independence_Spanning_Basis_Dimension.ipynb): Independence; Spanning; Basis. Carry the free-variable example into tomography. | [Basis, hidden directions, and tiny tomography](../seminars/05_basis_and_tomography.md) |
| 6 | [Independence, spanning, basis and dimension](../5_Independence_Spanning_Basis_Dimension.ipynb): Dimension; the final column-space/kernel example. Continue with the guided rank–nullity proof in the seminar. | [Rank, nullity, and spaces that must not be confused](../seminars/06_rank_and_nullity.md) |
| 7 | [Linear transformations](../6_linear_transformations.ipynb): From columns to the whole picture; the grid examples. Extend the idea to polynomials in the seminar. | [Linear maps beyond coordinate vectors](../seminars/07_linear_maps_and_bottlenecks.md) |
| 8 | [Linear transformations](../6_linear_transformations.ipynb): The unit-square explanation and transformation notes. Use the multiplication/inverse parameter example for a determinant calculation. | [Determinants: area, orientation, and hypotheses](../seminars/08_determinants_and_volume.md) |
| 9 | [Geometric view](../2_Geometric_view_of_linear_algebra_checkpoint.ipynb): Vector product, followed by the worked projection and normal derivations in the new lab. | [Orthogonality, projection, and surface normals](../seminars/09_orthogonality_and_normals.md) |
| 10 | [Coordinates and affine maps](../notebooks/05_coordinates_and_affine_maps.ipynb): Worked route: follow one vector through the coordinate changes. The original transformation notebook supplies the column interpretation. | [Same vector, different coordinates](../seminars/10_change_of_basis.md) |
| 11 | [Coordinates and affine maps](../notebooks/05_coordinates_and_affine_maps.ipynb): Why adding one coordinate handles translation. Least squares remains optional. | [Affine geometry and a tiny graphics pipeline](../seminars/11_affine_geometry.md) |
| 12 | [Eigenvalues and dynamics](../notebooks/06_eigenvalues_and_dynamics.ipynb): Worked route: find what stays fixed and what changes; exceptional cases; the repeated-eigenvalue example. | [Eigenvectors explain a changing population](../seminars/12_eigenvalues_and_dynamics.md) |
| 13 | [Linear transformations](../6_linear_transformations.ipynb): Revisit the grid examples and their geometric properties; connect them to the matrix-museum cards. | [The matrix museum: synthesis and explanation](../seminars/13_matrix_museum.md) |

## Later topics and the new notebooks

The original set does not provide a full explanatory chapter for every later topic. The new coordinate/affine and eigenvalue notebooks therefore include worked derivations, not only prompts and sliders. Other labs explicitly bridge back to the original material: column pictures become image measurements, LU becomes reusable elimination, and geometric vectors become projections and surface normals.

Predictions come before the worked route. Code checks and visualizes that route. A changed input or assumption then asks students to use the idea themselves. No part of this requires withholding explanations because AI exists; independence is checked separately by the short individual tasks.

## What is preserved and what is corrected

Original filenames, attribution, main section order and the worked-example progression remain. Corrections fix the mathematics where necessary and explain the missing step. One accidentally lost “Vector product” heading has been restored. The misleading “How many vectors in the nullspace?” heading now asks how many **basis vectors** are needed. A section-order check guards against losing the original route in future edits, but cannot judge teaching quality.

Notebook source outputs are still cleared for reproducibility; running the notebooks regenerates the figures and calculations. Their explanations do not depend on obsolete saved output. The [correction log](corrections.md) distinguishes these execution changes from changes to the mathematics.
