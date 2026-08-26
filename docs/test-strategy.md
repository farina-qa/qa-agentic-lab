# Test strategy

## Scope

The system under test is saucedemo.com, a demo storefront published by Sauce
Labs. It is a static single-page application: the product data is bundled into
the JavaScript and there is no backend to call.

## What that means for API testing

saucedemo exposes no API, so there is nothing here to test at the API level.
Rather than invent one, the API track targets **restful-booker**, a free public
practice API, and is clearly separated in `tests/api/`. It exists to practise
API testing, and it is unrelated to the system under test. Saying so plainly is
better than a suite that pretends to cover something it does not.

## Intentional defects

saucedemo ships bugs on purpose, reachable through specific accounts:

| Account                   | Behaviour                                           |
| ------------------------- | --------------------------------------------------- |
| `standard_user`           | Works as designed                                   |
| `locked_out_user`         | Login is refused                                    |
| `problem_user`            | Broken images, wrong sorting, inputs that misbehave |
| `performance_glitch_user` | Deliberately slow                                   |
| `error_user`              | Fails partway through some flows                    |
| `visual_user`             | Layout defects                                      |

Tests that document these are tagged `@known-defect`. They assert that the bug
is present, so they are excluded from self-healing: an agent "fixing" them would
be erasing the thing under test.

`performance_glitch_user` is kept apart and given a longer timeout, so its
slowness is never mistaken for a defect or for instability.

## Shared environment

saucedemo is a public site with no reset and no per-user isolation. Tests
therefore assume nothing about existing state, run in a fresh browser context
each, and keep parallelism modest. No load-style patterns: the site is a
courtesy, not a test rig we own.

## Backlog

Flakiness analysis, accessibility checks and visual regression are deliberately
not built yet. Playwright's JSON reporter already marks a test `flaky` when it
fails and then passes on retry, which is the hook a later phase would build on.
