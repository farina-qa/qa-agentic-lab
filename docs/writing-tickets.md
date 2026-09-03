# Writing tickets

Requirements, stories and test cases are GitHub issues here, so they are read by
teammates and by agents. These are the conventions that keep them consistent.

## Requirements

**Context** states how the product should behave and what the client wants, in
the shopper's terms. Two sentences: what the capability is, then what this
requirement covers and what is covered elsewhere.

Two things stay out of it:

- **The test harness.** Playwright, the agents and the saucedemo accounts are
  described in `docs/test-strategy.md` and in the known-defect specs.
- **Risk framing.** Describe the behaviour the client asked for. Sentences like
  "a defect here blocks the whole product" belong to the test strategy.

**Acceptance criteria** are one checkbox per verifiable statement, written so a
reader can tell pass from fail without asking a question.

Example: [#9](../../issues/9).

## User stories

The story block is `As a` / `I want` / `So that`, and the "so that" carries a
real motive beyond a restatement of the want.

Acceptance criteria are written in the first person, from the shopper's seat:
"I can sort by price, low to high". One story covers one slice; as soon as the
criteria reach a second flow, that flow becomes its own story under the same
requirement.

Every story names its parent requirement.

Example: [#10](../../issues/10).

## Test cases

Record the case ID as `TC-<AREA>-<NNN>` on the issue, and carry the same ID in
the spec's tag, which is how a red run names its own issue. Record the spec path
on the issue and add the row to `docs/traceability.md`.

## Labels, board and phase

Labels cover three orthogonal dimensions plus flags: `type:`, `area:`,
`priority:`. Status is set on the Project board only. Phase is a milestone, so
a ticket belongs to exactly one phase.

## Order of creation

Requirement, then story, then test case, then spec. File the test case issue
before writing the spec.
