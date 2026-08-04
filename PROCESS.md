# Process overview

## What I built

**The Sable Den** — The website is designed to resemble a personal GeoCities homepage from 1996. It features a tiled starfield background, magenta and cyan ridge borders, a scrolling marquee, and an under-construction sign with a barber-pole effect. The entire site is built with plain HTML and CSS, with no JavaScript used anywhere.

The project does more than imitate the visual style of the early web. Its content and presentation are intentionally sincere rather than ironic. The site is imagined as being created by an enthusiast who will probably never see a living sable in person. Instead, the creator builds the website from other people's fieldwork, the history of the sable fur trade, and an ongoing correspondence. As a result, the site is not only a recreation of an old-fashioned web aesthetic, but also a believable and personal expression of genuine interest in the subject.


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

Cited: [`3b6c63d`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit1-Alisonsun7/commit/3b6c63d3cec8776c1dc2d895302266967b8f0654)
— the `CLAUDE.md` entry that records the clamp so I don't rediscover it in
week 3. The probe page itself was a throwaway local file used to verify the
harness, not committed; this is the artefact that survives.

### 2. Making "no JavaScript" a check instead of an intention

The spec's sharpest line is the one a build tool can violate behind your back:
Vite is perfectly capable of emitting a JS bundle from a template that shipped
`main.ts`. Deleting the file is not the same as guaranteeing the deployed bytes
contain no script.

So `spec/crit-1.test.ts` asserts it against `dist/`, three ways: no `<script>`
element on any page, no inline `on*` handler, and no `.js` file anywhere in the
build output. That is the difference between remembering a constraint and
holding one.

Cited: [`8a11e99...c4f87ad`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit1-Alisonsun7/compare/8a11e995a8ceb2aeba321e26ead889ed5e156437...c4f87ad45713404e88c79e49bd06d6ca24bceb39)
— the red-to-green range: `spec/crit-1.test.ts` landing, then the site going
from the empty template to six passing pages.

### 3. Corrections landing in the harness

Three things bit during the build: Vite's `crossorigin` attribute making the
`file://` preview render unstyled, stylelint's `no-descending-specificity`
dictating an odd but correct link-rule order, and the viewport clamp above.
Each one got written into `CLAUDE.md` rather than re-explained in a prompt.

Cited: [`3b6c63d`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit1-Alisonsun7/commit/3b6c63d3cec8776c1dc2d895302266967b8f0654)
— the "Facts about this stack that kept biting" section.
