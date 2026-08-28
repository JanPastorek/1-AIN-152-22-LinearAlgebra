# Sources, design influences and attribution

[Course index](../README.md)

Sources were inspected during preparation in August 2026. Historical course pages are labeled by their actual year; they are examples of teaching design, not evidence that a university currently uses precisely that format. This package does not claim endorsement or demonstrated parity with any university.

## Course and benchmark mapping

| Source | Design lesson used here | Where it appears |
|---|---|---|
| [FMFI course information, 1-AIN-152](https://sluzby.fmph.uniba.sk/infolist/SK/1-AIN-152.html) | Retain local core, two exercise hours, and published assessment constraints; the inspected page was 2026–27. | Semester plan and proposed assessment boundaries |
| [MIT 18.06, Spring 2010 syllabus](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/syllabus/) and [18.06SC, Fall 2011](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/) | Connect geometry, algebra and fundamental spaces; make reasoning central. These are historical offerings. | Multiple representations and explanation tasks |
| [Stanford ENGR108, 2025–26](https://web.stanford.edu/class/engr108/) and [VMLS](https://vmls-book.stanford.edu/) | Applications and computation can motivate first-course linear algebra; homework AI use can coexist with independent assessment. | Tomography, model interpretation, task-level tool rules |
| [Cambridge Part IA example sheet, 2025](https://www.damtp.cam.ac.uk/user/examples/A1c.pdf) | Use construction, proof and parameter cases, not only arithmetic. | Original counterexample and changed-hypothesis tasks |
| [Berkeley Math 54, Spring 2025 syllabus copy](https://tbp.studentorg.berkeley.edu/syllabi/1782/download/) | Structured discussion and regular short checks. This is an archived syllabus copy. | Weekly discussion routine and proposed quizzes |
| [Georgia Tech Interactive Linear Algebra](https://textbooks.math.gatech.edu/ila/overview.html) and [solution sets](https://textbooks.math.gatech.edu/ila/solution-sets.html) | Connect visual exploration to precise mathematical statements. | Interactive labs followed by all-cases arguments |
| [Freeman et al., PNAS 2014](https://www.pnas.org/doi/10.1073/pnas.1319030111) | General STEM evidence supports active learning; it does not guarantee the effectiveness of this particular redesign. | Individual prediction, peer discussion and feedback |
| [Cornell's 2023 generative AI committee report](https://teaching.cornell.edu/generative-artificial-intelligence/cu-committee-report-generative-artificial-intelligence-education) | Make tool permissions explicit, consider access, and rethink evidence of learning. | AI policy and supervised transfer |

The new questions are original; the Cambridge problem sheet and other university assessments were not copied. Follow each external source's own terms if reusing it. Links are reading recommendations, not embedded third-party course packs.

## File-level provenance

- The repository already contains an MIT [LICENSE](../LICENSE), copyright 2025 eauriel. It is retained unchanged.
- Historical notebooks 1, 2, both 3 notebooks and 5 explicitly credit **Dr Juan H Klopper**, his MIT 18.06 study notes, and **CC BY-NC 4.0**. Their notices remain inside the files. They take precedence for the material they cover; the root MIT license should not be read as relicensing that content.
- Historical LU and transformation notebooks are retained and revised from this repository's baseline. No additional upstream authorship or license is invented for material whose history has not been independently reconstructed. Review provenance before broader redistribution, especially commercial reuse.
- The optional Manim scene was extracted from the existing geometry notebook; consult that notebook's provenance and notices. It is not newly commissioned artwork.
- New `seminars/`, practice solutions, assessment drafts, `la_labs.py`, tests and five new lab designs were prepared for this redesign with AI assistance. The tomography lab adapts the original pilot prepared for Ján Pastorek on 27 August 2026. These additions do not remove any inherited restrictions from other files.

For a uniform license across a future published course pack, the maintainer should first resolve the mixed provenance and permissions. This review does not provide legal clearance or claim a new blanket license.

## Software references

- [SymPy matrix tutorial](https://docs.sympy.org/latest/tutorials/intro-tutorial/matrices.html): matrix mutation, bases, exact arithmetic and decomposition conventions.
- [NumPy least-squares documentation](https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html): least-squares output and minimum-norm selection when minimizers are nonunique.

Exact arithmetic is used in mathematical regression checks. Floating-point experiments use tolerances and do not substitute for proofs of universal claims.
