# Linear Algebra — 1-AIN-152 seminars

Thirteen seminars connecting calculation, geometry, proof and applications. Each week starts with a prediction, develops an investigation, and ends with an individual explanation. AI can assist practice; students still need to model, check, justify and transfer what they learn.

**2026 redesign — review edition.** This branch proposes teaching materials and an assessment pattern; it does not change the official syllabus or grading. The lecturer should confirm the calendar, prerequisite order and assessment policy before adoption. English follows the existing notebooks; a [Slovak–English glossary](docs/glossary_sk_en.md) supports terminology review.

## Start here

- **Students:** open this week's sheet below. Attempt it before consulting its worked solution. Code is optional for the mathematical tasks.
- **Seminar leaders:** use the [semester plan](docs/semester_plan.md), [teaching guide](docs/teaching_guide.md), and facilitation notes in each solution sheet.
- **Assessment:** [proposal and practice bank](assessment/README.md), [AI rules](assessment/ai_policy.md). All repository answers are public practice, never secure live keys.
- **Maintainers:** [correction log](docs/corrections.md), [sources and attribution](docs/sources.md), [validation status](docs/validation.md).

## The 13-week route

| Week | Student sheet | Worked practice | Interactive companion |
|---:|---|---|---|
| 1 | [Matrices as models and black boxes](seminars/01_matrices_and_models.md) | [Solutions](solutions/practice/01_matrices_and_models.md) | Paper investigation |
| 2 | [Systems, elimination, and a traffic mystery](seminars/02_systems_and_traffic.md) | [Solutions](solutions/practice/02_systems_and_traffic.md) | Paper investigation |
| 3 | [Composition, inverses, and symmetries](seminars/03_composition_and_groups.md) | [Solutions](solutions/practice/03_composition_and_groups.md) | [Notebook](notebooks/01_transformations_and_groups.ipynb) |
| 4 | [Factor once, solve twice](seminars/04_lu_and_numerics.md) | [Solutions](solutions/practice/04_lu_and_numerics.md) | [Notebook](notebooks/03_numerics_and_factorizations.ipynb) |
| 5 | [Basis, hidden directions, and tiny tomography](seminars/05_basis_and_tomography.md) | [Solutions](solutions/practice/05_basis_and_tomography.md) | [Notebook](notebooks/02_tiny_tomography.ipynb) |
| 6 | [Rank, nullity, and spaces that must not be confused](seminars/06_rank_and_nullity.md) | [Solutions](solutions/practice/06_rank_and_nullity.md) | Paper investigation |
| 7 | [Linear maps beyond coordinate vectors](seminars/07_linear_maps_and_bottlenecks.md) | [Solutions](solutions/practice/07_linear_maps_and_bottlenecks.md) | Paper investigation |
| 8 | [Determinants: area, orientation, and hypotheses](seminars/08_determinants_and_volume.md) | [Solutions](solutions/practice/08_determinants_and_volume.md) | [Notebook](notebooks/01_transformations_and_groups.ipynb) |
| 9 | [Orthogonality, projection, and surface normals](seminars/09_orthogonality_and_normals.md) | [Solutions](solutions/practice/09_orthogonality_and_normals.md) | [Notebook](notebooks/04_orthogonality_and_normals.ipynb) |
| 10 | [Same vector, different coordinates](seminars/10_change_of_basis.md) | [Solutions](solutions/practice/10_change_of_basis.md) | [Notebook](notebooks/05_coordinates_and_affine_maps.ipynb) |
| 11 | [Affine geometry and a tiny graphics pipeline](seminars/11_affine_geometry.md) | [Solutions](solutions/practice/11_affine_geometry.md) | [Notebook](notebooks/05_coordinates_and_affine_maps.ipynb) |
| 12 | [Eigenvectors explain a changing population](seminars/12_eigenvalues_and_dynamics.md) | [Solutions](solutions/practice/12_eigenvalues_and_dynamics.md) | [Notebook](notebooks/06_eigenvalues_and_dynamics.ipynb) |
| 13 | [The matrix museum: synthesis and explanation](seminars/13_matrix_museum.md) | [Solutions](solutions/practice/13_matrix_museum.md) | Paper investigation |

The course retains matrices, systems, determinants, groups, vector spaces, linear and affine maps, basis changes, 3D dot/cross products, and eigenvalues. Least squares is an explicitly optional later application; PCA/SVD and machine learning theory are not silently added prerequisites.

## Run the notebooks

Use Python **3.12** and a virtual environment. From a downloaded or cloned copy of this branch:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m notebook
```

On Windows, activate with `.venv\Scripts\activate` instead. Open a notebook in `notebooks/` and choose **Restart Kernel and Run All**. Start Jupyter from this repository root. Keep `la_labs.py` beside the `notebooks/` directory: the new notebooks use this local helper module.

GitHub displays notebook source but does not run sliders. In Jupyter, change a slider and read the printed numerical result as well as the plot. If widgets are unavailable, change the arguments of `explore(...)` (or `draw_image(t=...)` in tomography). All new investigations have a static default rendering and a paper route. The historical geometry widget requires the included `ipywidgets` dependency.

No teaching notebook installs software, downloads data, calls an AI service, or requires a paid account. An internet connection is needed for the initial package installation; the core activities then run locally. External attribution badges in historical notebooks may require a connection to display, but they are not needed for any computation.

## Original companion notebooks

The original filenames remain available, with corrections and cleared outputs:

- [Introduction to matrices](1_Introduction_to_matrices_checkpoint.ipynb)
- [Geometric view](2_Geometric_view_of_linear_algebra_checkpoint.ipynb)
- [Elimination](3_Elimination.ipynb)
- [Multiplication and inverses](3_Matrix_multiplication_Inverses.ipynb)
- [LU decomposition](4_LU_decomposition_of_A-checkpoint.ipynb)
- [Independence, spanning, basis and dimension](5_Independence_Spanning_Basis_Dimension.ipynb)
- [Linear transformations](6_linear_transformations.ipynb)

They are reference material, not an additional required workload. [Optional Manim](extras/manim/README.md) is separated from the core setup. The existing [OCR notebook](OCRusingTesseract.ipynb) is an authoring utility, not a student prerequisite; it is intentionally excluded from course execution checks.

## Validate changes

```bash
python -m pip install -r requirements-dev.txt
python scripts/check_materials.py
python -m pytest -q
python scripts/check_notebooks.py
```

The last command executes all 13 core notebooks in separate Jupyter kernels. In environments that cannot open local kernel sockets, `python scripts/check_notebooks.py --engine source` instead executes every code cell in isolated IPython processes; it does **not** certify Jupyter frontend behavior. CI requests full kernel execution. See the validation record for what has actually been checked.

## Attribution

The repository's existing MIT license is retained. Several historical notebooks carry **Dr Juan H Klopper's CC BY-NC 4.0 notices**; those notices remain in place and are not overridden by the root license. See the [file-level provenance notes](docs/sources.md) before reusing or distributing material. New exercises are original course material; linked university sources informed teaching patterns, not copied problem sheets.
