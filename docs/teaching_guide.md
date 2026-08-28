# Teaching guide

[Course index](../README.md) · [AI rules](../assessment/ai_policy.md)

## What the redesign is trying to improve

Students should leave able to explain why a method works, identify its hypotheses, construct a counterexample, interpret a model and check an output. Routine fluency still matters: every week retains a small calculation that students can perform independently. An application provides a reason to care about the algebra, not an excuse to omit it.

The weekly sheet is the main classroom object. Historical notebooks are optional references. Worked solutions are public practice resources, so use initial predictions and unfamiliar individual transfer to observe learning. The repository cannot make take-home work immune to AI assistance.

## A practical group routine

Use pairs or groups of three. Rotate **explainer**, **skeptic**, and **recorder** at each task; in pairs, combine recorder with explainer and swap. The skeptic asks for an assumption or checks a boundary case, not merely whether the answer matches. Do not attach permanent ability labels to students. Invite quiet written responses before public discussion and let a group nominate a different speaker each time.

At a board, ask a team to show a **certificate**: a nonzero kernel vector, a row combination giving a contradiction, an equality verifying a factorization, or a counterexample. Compare two certificates and discuss which claim each actually proves. Reward revising a conjecture after a counterexample; avoid speed-based leaderboards.

## Hints before answers

| If students are stuck on… | First hint | Second hint |
|---|---|---|
| An inconsistent system | Add or subtract equations strategically. | Look for a left-side combination that vanishes. |
| A complete solution set | Choose one free coordinate. | Compare two solutions and subtract them. |
| A basis | Separate “independent” from “spans.” | State the ambient space and count pivots. |
| A sensor design | How do measurements change along the hidden direction? | Compute the sensor row times a kernel vector. |
| A basis-change formula | Label input and output coordinates. | Start with c, then Sc, then ASc. |
| Long-term dynamics | Split into a stationary part and a difference. | The difference has coordinate sum zero. |

Do not immediately substitute the hint for the student's thinking. Allow 60–90 seconds for an attempt, then ask for a smaller subclaim.

## Accessibility and equipment

The core route needs paper and a board. One laptop per group is enough for optional exploration. Every new notebook prints numbers as well as drawing figures; color is not the only cue, and plot labels/line styles identify objects. Provide the Markdown sheet in the institution's accessible format if required, allow keyboard-controlled sliders, and use an equivalent oral or typed individual response where an accommodation calls for it. A full screen-reader/frontend accessibility audit has not been performed; test the local platform with affected students rather than claiming compliance.

English matches the existing repository; review the Slovak glossary locally before publishing bilingual instructions. A full Slovak translation is not included. Do not assess English fluency instead of mathematics.

## Before the first meeting

1. Confirm the lecture order, actual number of meetings, class size, room setup and grading rules with the lecturer.
2. Approve or revise the assessment proposal; publish task-level tool rules and absence/accommodation procedures.
3. Run the dependency setup on the machines students will use. Restart and run each needed notebook; move sliders at least once after all cells execute.
4. Prepare private live assessment variants, independently check the keys, and keep them outside this public repository.
5. Print the first sheet and establish the “prediction, check, explain” routine. Do not make account creation the first learning obstacle.

## Pilot and evaluate

Pilot weeks 2, 5 and 12 first if a full transition is too much at once; the materials for every week are available. After each pilot, record actual time per stage, the most common misconception, the fraction of incomplete exit responses, and one change for next time. Use the optional pre/post diagnostic descriptively. It is not a validated concept inventory, and changes cannot establish causal impact without a suitable study design.

Ask students anonymously whether the workload, group roles, tool rules and feedback were clear. Sample mathematical explanations across groups using a common rubric. A small set of useful signals is better than collecting full AI chat logs. Keep personal work and grades in approved institutional systems, not in GitHub.

## Instructor review still required

This package is AI-assisted authoring with automated mathematical and execution checks. Those checks do not establish classroom pacing, equal test difficulty, complete pedagogical quality, or institutional approval. Review every assessed task, especially its wording and prerequisites, before live use. Keep a short correction log after teaching and add a regression test when a correction concerns executable mathematics.
