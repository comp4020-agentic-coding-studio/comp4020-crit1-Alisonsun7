# C1 — Forgotten web

## What was the breakthrough that moved the work forward?

The 390×844 screenshot showed the layout overflowing its viewport — text cut
off mid-word, boxes running past the right edge. The obvious move was to
start patching the stylesheet. Instead I checked the instrument first: a
probe page whose only content was four media queries revealing which width
bucket the viewport actually landed in. It showed `width <= 34rem` matching
but `width <= 400px` not — the layout viewport was near 500px, not 390.
Headless Chrome on macOS clamps window width and crops the screenshot; the
site was fine and the measurement was lying. The fix went into how the site
gets measured — an iframe harness pinned to 390px, which gets its own CSS
viewport — not into the CSS. Had I trusted the screenshot, I would have added
defensive `overflow-x` rules to fix a bug that did not exist, and every page
after that would have inherited a wrong assumption about the tool.

## What did this work change about who I want to be as a software developer?

I directed this build without writing a line of the HTML myself, and the
skill that mattered was not prompting harder, it was building better sensors:
tests that fail for the right reason, a probe page that tells the truth about
a viewport a screenshot can't be trusted on. The corrections that stuck this
week didn't go into another prompt, they went into `CLAUDE.md` — which means
the thing I'm actually building isn't the site, it's the harness that keeps
the agent honest about the site. That's a different job than writing code by
hand, and it's the one I want to get good at: knowing which claim to check,
not which line to type.
