# Process overview

<!-- DRAFT — the facts below are an accurate record of how this week's work
     happened, captured so they aren't lost. The prose still needs to become
     yours, and every CITE-ME must be replaced with a real commit link once the
     repo exists; `pnpm check:evidence` fails while they are placeholders. -->

## What I built

**The Moth Room** — a six-page shrine to night-flying Lepidoptera, dressed as a
1996 GeoCities personal homepage. Tiled starfield background, magenta and cyan
ridge borders, a scrolling marquee, an under-construction barber-pole and a hit
counter that counts nothing. Plain HTML and CSS, no JavaScript anywhere. The
content is sincere and the styling is not ironic about it: the argument of the
site is that this era of the web was warmer and more personal than what replaced
it, so the pages had to be worth reading, not just worth looking at.

## The moments that mattered

### 1. The phone bug that wasn't

The 390×844 screenshot showed the layout overflowing its viewport — text cut off
mid-word, boxes running past the right edge. The obvious move was to start
patching the stylesheet.

Instead of trusting the image, I checked the instrument. I built a probe page
whose only content is four media queries that reveal which width bucket the
viewport is actually in, and screenshotted that: `width <= 34rem` matched but
`width <= 400px` did not, so the layout viewport was somewhere near 500px, not
390. Headless Chrome on macOS clamps window width and crops the screenshot —
the site was fine and the measurement was wrong.

The fix therefore went into how the site gets measured, not into the CSS: an
iframe harness pinned to 390px, which gets its own CSS viewport. Re-shot through
it, the phone layout is clean. Had I trusted the screenshot I would have added
defensive `overflow-x` rules to fix a bug that did not exist.

Cited: CITE-ME (the probe page and the harness), and the `CLAUDE.md` entry that
records the clamp so I don't rediscover it in week 3.

### 2. Making "no JavaScript" a check instead of an intention

The spec's sharpest line is the one a build tool can violate behind your back:
Vite is perfectly capable of emitting a JS bundle from a template that shipped
`main.ts`. Deleting the file is not the same as guaranteeing the deployed bytes
contain no script.

So `spec/crit-1.test.ts` asserts it against `dist/`, three ways: no `<script>`
element on any page, no inline `on*` handler, and no `.js` file anywhere in the
build output. That is the difference between remembering a constraint and
holding one.

Cited: CITE-ME (spec/crit-1.test.ts), and the red-to-green range as the site
went from the empty template to six passing pages.

### 3. Corrections landing in the harness

Three things bit during the build: Vite's `crossorigin` attribute making the
`file://` preview render unstyled, stylelint's `no-descending-specificity`
dictating an odd but correct link-rule order, and the viewport clamp above.
Each one got written into `CLAUDE.md` rather than re-explained in a prompt.

Cited: CITE-ME (the "Facts about this stack that kept biting" section).

## Before you ship

<!-- Replace every CITE-ME above with a real commit or compare link, then run
     `pnpm check:evidence`. It verifies the citations resolve, that
     reflections/crit-1.md exists, and that CLAUDE.md is present. -->
