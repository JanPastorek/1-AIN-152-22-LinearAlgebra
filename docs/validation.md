# Validation record

Local verification performed on 28 August 2026 with Python 3.12 and the pinned direct dependencies in the requirements files. This is not a claim of classroom validation or institutional approval.

| Check | Result |
|---|---|
| Exact mathematical examples and numerical boundary cases | 54 pytest cases passed |
| Seminar/solution pairing | All 13 weeks have matching task IDs and worked answers |
| Local navigation | 185 relative links resolved |
| Notebook format and syntax | All 13 core notebooks valid; no stored execution outputs or shell/magic installs |
| Isolated source execution | All 13 notebooks executed top to bottom in separate IPython processes; new sliders exercised at both range ends; historical geometry callbacks exercised after the final 3D plot |
| Static visual inspection | Six representative new figures inspected, including identity/oscillating dynamics and extreme-case tests; tomography pilot figures had also been inspected during pilot development |
| Full Jupyter kernel execution locally | Blocked by the runtime's local networking/socket restriction before the first kernel became ready; not reported as passed |
| GitHub Actions | Workflow configured to repeat checks and execute all core notebooks in fresh kernels; consult the pull request checks for the observed remote result |
| Browser widget rendering / accessibility | Not comprehensively audited; kernel/source callback tests are not a frontend audit |
| Optional Manim / OCR utility | Excluded explicitly; not student prerequisites and not certified by the core checks |

The [course index](../README.md) gives reproducible commands. Source execution uses actual IPython cell evaluation and the installed NumPy, SymPy, Matplotlib and widget packages; it is not a mocked substitute. It avoids kernel sockets and therefore has narrower coverage than a full Jupyter run.

Before teaching, run **Restart Kernel and Run All** in the actual student environment, move the sliders after all cells finish, and check keyboard/screen-reader behavior where required. Review assessment wording and timing with students. A/B practice forms have not been calibrated for equal difficulty. Policy and syllabus adoption still require lecturer review.
