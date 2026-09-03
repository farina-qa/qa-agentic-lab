# Devil's advocate review: issue #9

## Findings

1. **Context contradicts the acceptance criteria** (#9 Context vs Acceptance
   criteria). Context states "the cart and the checkout are covered
   separately," and the `area:inventory` label itself is described as
   "Product listing and sorting," yet three of six criteria test cart
   behaviour: the "Remove" button swap, the badge increment, and the empty
   badge state. A cart requirement will later duplicate or conflict with
   this coverage. Fix: move the three cart-badge criteria to the cart
   requirement, or rewrite Context to admit the cart is in scope here.

2. **Story #10 leaves three parent criteria without a slice** (#10 Story vs
   #9 Acceptance criteria). #10 only covers rendering and sorting; nothing
   slices the add/remove button and badge criteria. Per
   `docs/writing-tickets.md`'s order of creation, a test case follows a
   story, so those three criteria have no story to attach one to and will
   go untested. Fix: file a second story under #9 for the add/remove
   behaviour, or drop those AC if they belong elsewhere.

3. **"Correctly" is not a fixed meaning** (#9 AC: sorting by name, sorting
   by price). "Reorders the list correctly" asks the reader to infer the
   expected order from the parenthetical rather than stating it, which is
   exactly the vagueness `docs/writing-tickets.md` asks acceptance criteria
   to avoid. Fix: state the order directly, e.g. "products display in A-Z
   order," and drop "correctly."

4. **Unresolved pronoun in "Removing an item reverses both"** (#9 AC, 5th
   bullet). Read alone, a grader cannot tell what "both" refers to without
   backtracking to the prior bullet, so the checkbox is not gradable on its
   own. Fix: spell it out, "reverses both the button label and the badge
   count."

## In its favour

The rendering criterion is the model the rest should follow: "All six
products render, each with a name, description, price and image" gives an
exact count and an exact field list, so a grader can check it without
guessing. The parent link is also clean: #10 names #9 as its parent
requirement, and #9's Area and milestone match the labels and Phase 2
roadmap in `docs/plan.md`, so the chain resolves correctly as far as it
goes.

## Verdict

**Objections.** I tried to find harness bleeding, a prescribed
implementation, and a phase mismatch; none held; #9 stays out of Playwright
and saucedemo detail and sits correctly in Phase 2. The scope contradiction
between Context and the cart criteria, and the coverage gap it leaves in
#10, are the real defects.

## Note on docs/writing-tickets.md

I read the prior review (`docs/reviews/2026-09-03-issue-9.md`) only after
forming these findings. `docs/writing-tickets.md` did not change what I
would have reported: my findings and the prior run converge on the same
core defect, the cart criteria stranded in a listing-only requirement, and
both flag "correctly" as unverifiable. The doc mainly sharpened the fix I'd
propose (name the story that's missing) rather than surfacing a new
objection.
