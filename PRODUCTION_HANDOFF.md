# Production handoff: ARCHITECTED TO EXIST

## Mission

Bring the existing `architected-to-exist-house` website to portfolio-grade, production-ready quality without replacing its concept. Preserve the dark architectural identity, scroll-controlled construction film, cyan technical language, configurator, and build-brief form. Improve reliability, accessibility, performance, responsive behavior, truthful content, and interaction craft.

This is an implementation brief for the next Codex chat. It must use both installed skills:

- `apple-design` from `C:\проекты\Новая папка\.agents\skills\apple-design\SKILL.md`
- `ui-ux-pro-max` from `C:\Users\Islam\.codex\skills\ui-ux-pro-max\SKILL.md`

Read both `SKILL.md` files completely before editing. For `ui-ux-pro-max`, also read the relevant sections of `references/quick-reference.md`; use `references/pro-rules.md` only as a supplementary touch/mobile checklist because this project is a web site.

## Current project facts

- Working directory: `C:\проекты\Новая папка\architected-to-exist-house`
- Stack: React 19, Next 16-compatible Vinext, TypeScript, Tailwind CSS 4, Framer Motion, GSAP/ScrollTrigger, Lucide React.
- Main implementation: `app/page.tsx`
- Global styles: `app/globals.css`
- Metadata/layout: `app/layout.tsx`
- Scroll state helper: `app/scroll-state.ts`
- Hero media: `public/house-build.mp4`
- Existing project source under `app` passes `pnpm exec eslint app --max-warnings 0`.
- The broad `pnpm lint` currently scans `.site-package-stage/dist` and reports thousands of generated-file findings. Fix the ignore configuration; do not edit generated files.
- The whole parent repository currently appears as untracked files. Do not assume Git can restore mistakes. Before editing, inspect exact files and make narrowly scoped changes.
- Do not edit `.site-package-stage`, `dist`, `.next`, dependencies, lockfiles, installed skills, or unrelated folders unless the task clearly requires it.

## Non-negotiable product direction

1. Keep the project recognizably the same site. This is a refinement, not a redesign.
2. Keep one clear visual language: dark architectural surfaces, restrained cyan accent, technical labels, large editorial typography, Lucide outline icons.
3. Apple-inspired does not mean copying Apple.com. Apply the principles: immediate response, spatial continuity, restraint, legible translucent materials, interruptible motion, and reduced-motion alternatives.
4. Do not add animation merely for decoration. Every motion must explain state, hierarchy, cause, or progress.
5. Do not fake business facts. The current brand, price, architect quote, project claims, and testimonial may be concept content. Either:
   - clearly label the site as a concept/portfolio study; or
   - replace them only with verified content provided by the user.
   Never present invented people, reviews, certifications, addresses, or completed-project claims as real.
6. Do not publish or deploy without explicit user authorization.
7. Do not install new packages unless an existing dependency cannot safely solve the requirement. Explain and request approval before adding a dependency.
8. Do not create a fake successful form submission. A missing production endpoint is an honest release blocker.

## Priority order

Work in this order. Do not start visual polish while critical accessibility or functional defects remain.

### Phase 0 — Baseline and safeguards

1. Read `package.json`, `app/page.tsx`, `app/globals.css`, `app/layout.tsx`, `app/scroll-state.ts`, `eslint.config.mjs`, and all tests.
2. Inspect working-tree state with a one-off safe-directory override if Git ownership blocks read-only status. Do not change global Git configuration.
3. Run and record:
   - `pnpm exec eslint app --max-warnings 0`
   - `pnpm build`
   - existing tests
4. Start the existing dev server and perform a visual baseline at 375×812, 768×1024, 1440×900, and a phone landscape viewport.
5. Check browser console, network failures, video loading, reverse scrolling, menu behavior, configurator state changes, anchor navigation, and form states.
6. Capture baseline screenshots before changing layout or motion.

Acceptance: the implementer can describe the existing behavior and reproduce any defect before changing it.

### Phase 1 — Release blockers and content truthfulness

1. Decide the public positioning with the user if it is not already documented:
   - “Concept project / interaction study” for portfolio use; or
   - a real architecture offering using verified business data.
2. If it remains a concept, add a tasteful, visible disclosure in the page/footer and metadata. It must not look like a legal disclaimer pasted onto the design.
3. Remove or replace unverified testimonial/person claims. Do not leave a fabricated quote presented as a customer or employee statement.
4. Confirm currency, base price, area, energy rating, build duration, image licenses/credits, contact destination, privacy text, and domain. If unavailable, mark them as unresolved blockers rather than inventing values.
5. Keep external Unsplash credits reachable and descriptive.

Acceptance: every public claim is either verified or clearly framed as fictional concept content.

### Phase 2 — Accessibility and keyboard behavior

Implement WCAG-oriented improvements before aesthetic tuning:

1. Add a visible-on-focus “Skip to main content” link and a stable target on the main content.
2. Add consistent `:focus-visible` styling with sufficient contrast. Never remove focus outlines without an equivalent.
3. Ensure all interactive targets are at least 44×44 CSS pixels for touch comfort. The current 36×36 mobile menu button must be enlarged or have an expanded hit area.
4. Mobile menu:
   - close on Escape;
   - return focus to the trigger after close;
   - move focus into the menu after open;
   - prevent focus from disappearing behind the overlay;
   - close after navigation;
   - use an origin and animation spatially tied to the trigger;
   - avoid trapping the user or breaking browser back/anchor behavior.
5. Hide decorative Lucide icons from the accessibility tree when visible adjacent text already names the action. Keep meaningful standalone controls named.
6. Preserve heading hierarchy and landmark semantics.
7. Form:
   - add stable `id`/`htmlFor` pairs;
   - use `autocomplete` values (`name`, `email`);
   - mark required fields visibly and semantically;
   - keep mobile input text at 16px or larger;
   - add field-level validation and `aria-describedby`;
   - announce sending/success/error through an appropriate `aria-live` or `role="status"`/`role="alert"` region;
   - focus the first invalid field after failed validation;
   - preserve entered values after network errors;
   - provide a recovery action/message, not only a color change.
8. Configurator:
   - prefer real radio-group semantics within each `fieldset`, or reproduce complete radio keyboard behavior if buttons remain;
   - state must not be communicated by cyan color/dot alone;
   - selected label and price change must be understandable to screen readers without stealing focus.
9. Test text zoom at 200%, keyboard-only navigation, reduced motion, and high contrast. No clipping or hidden focused controls.

Acceptance: all functions are usable without a mouse; focus is always visible; labels and state changes are announced meaningfully; normal text contrast is at least 4.5:1 and non-text boundaries/state indicators at least 3:1 where required.

### Phase 3 — Motion and interaction system (`apple-design`)

Create a small set of shared motion tokens before tuning individual components:

- press feedback: immediate, approximately 80–120ms;
- small state change: responsive and critically damped, no decorative bounce;
- menu/sheet: spring-like response around 0.3s, no bounce unless momentum caused it;
- content crossfade: short and spatially stable;
- exits faster than entrances when it improves responsiveness.

Then apply these rules:

1. Preserve direct 1:1 mapping between scroll position and hero progress. Remove the progress bar's `height` transition if it causes lag behind the pointer/scroll.
2. Audit forward and reverse video scrubbing frame by frame. Rapidly reverse the wheel/touchpad direction and ensure there are no jumps, stale frames, input lockout, or long catch-up motion.
3. Keep scroll animation writes inside a coordinated animation frame. Avoid alternating layout reads and writes. Animate only `transform` and `opacity` for overlays/cards.
4. Add `will-change` only to elements that are imminently animated; do not leave it on the whole page.
5. Make hero cards and final state emerge from the current presentation value. Rapid scroll reversals must replace the target safely rather than waiting for an animation to finish.
6. Configurator image replacement should remain a stable crossfade in one reserved container. Rapid option clicks must cancel/replace the previous transition and end at the latest selected state.
7. Add immediate press feedback to primary buttons and configurator controls without changing layout bounds. Do not rely on hover.
8. Mobile menu should open from the menu trigger's origin and close along the same path. It must remain interruptible.
9. `prefers-reduced-motion: reduce` must not leave a 300vh empty/trapping hero. Provide a shorter, readable static/crossfade version with the final house image or poster and all essential copy/actions available.
10. Add `prefers-reduced-transparency: reduce` and `prefers-contrast: more` fallbacks where supported. Translucent UI must become more solid and legible.
11. Avoid sound or haptics for this site unless the user explicitly asks; they do not currently earn their complexity.

Acceptance: scrolling feels directly controlled in both directions, rapid state changes never produce a jump, no animation blocks input, and reduced-motion users receive an equivalent understandable experience.

### Phase 4 — Visual system and typography

1. Move repeated raw colors, surface opacities, border colors, radii, shadows, content widths, z-index levels, and motion values into semantic CSS tokens. Suggested roles:
   - canvas, surface, surface-raised, glass-heavy, glass-light;
   - text-primary, text-secondary, text-muted;
   - accent, accent-strong, success, warning, error;
   - border-subtle, border-strong, focus-ring;
   - radius-sm/md/lg, shadow-1/2, motion-fast/base/slow.
2. Keep the cyan accent restrained. One primary CTA per section; secondary actions visibly subordinate.
3. Raise important labels/body copy that currently use 9–10px or very low opacity. Tiny technical labels may remain only when decorative/non-essential and still readable.
4. Body copy should generally be at least 16px on mobile with line-height around 1.5–1.7. Do not apply aggressive letter-spacing to prose.
5. Keep display headings tightly tracked, but use less extreme tracking at smaller breakpoints to prevent collisions and poor text scaling.
6. Use `text-wrap: balance` selectively on short headings, never to force awkward nonbreaking lines.
7. Keep long text measures around 60–75 characters on desktop and 35–60 on mobile.
8. Use tabular figures for progress and prices to avoid width jitter.
9. Preserve material hierarchy:
   - fixed header: structural/heavier material;
   - popover/menu: clearly elevated material with backdrop separation;
   - small badges: lighter material;
   - do not stack translucent light surfaces until text becomes muddy.
10. Replace the hard header divider with a subtle scroll-edge treatment only if it improves separation without harming contrast.
11. Keep Lucide as the single icon family and standardize icon sizes/stroke treatment.

Acceptance: the page still looks like the same project, but text is easier to read, surfaces have a clear hierarchy, and tokens—not scattered magic values—control the system.

### Phase 5 — Responsive layout

1. Replace fragile `h-screen` assumptions with `dvh`-aware behavior where appropriate, especially the sticky hero.
2. Account for mobile browser chrome and safe-area insets for the fixed header and menu.
3. Verify at minimum: 320px, 375px, 430px, 768px, 1024px, 1440px, and phone landscape.
4. No horizontal scrolling, clipped headings, overlapped controls, or content hidden by the fixed header.
5. At mobile sizes, prioritize hero copy, progress, primary CTA, preview, price, and configurator controls. Secondary technical overlays may be simplified rather than squeezed.
6. Preserve readable spacing using a consistent 4/8px rhythm.
7. Ensure the 300vh interaction does not become exhausting or unusable on touch devices. If necessary, use a shorter mobile sequence while preserving the story.
8. Keep the configurator preview aspect ratio stable and avoid a fixed 500px height that overwhelms short screens.

Acceptance: the complete page is readable and operable in portrait and landscape, from 320px upward, with no horizontal overflow.

### Phase 6 — Configurator clarity and conversion UX

1. Preserve all existing facade, roof, and plan choices unless content truthfulness requires renaming.
2. Show the base price and each selected option's delta (`+$…`) so users understand why the estimate changes.
3. Use locale-aware number/currency formatting, but do not choose a locale/currency without user confirmation.
4. Keep the preview, selected summary, and estimate in the same perceptual group.
5. Make selected state redundant: label/checkmark/border plus semantic state, not color alone.
6. Announce price updates politely without moving focus.
7. Add an explicit bridge from the configured result to the build-brief form, carrying a human-readable summary into the form submission.
8. Preserve state while navigating between page anchors. Do not reset choices unexpectedly.

Acceptance: a first-time user understands what changed, how it affected price, what is selected, and what the next action does.

### Phase 7 — Form and real submission path

1. Confirm the intended endpoint and data owner with the user.
2. Prefer a same-origin server route or otherwise documented secure endpoint. Never expose secret keys in client code.
3. Validate and sanitize on the server as well as the client.
4. Add spam/rate-limit protection appropriate to the chosen backend; do not add a third-party service without permission.
5. Include the selected configurator summary in the payload.
6. Add a concise privacy notice explaining what will happen to submitted data. Link a real privacy page only if one exists.
7. Handle timeout, offline, 4xx, 5xx, and success states honestly. Success appears only after a confirmed successful response.
8. If no endpoint is available, keep the disabled/unavailable experience truthful and list the form as a release blocker.

Acceptance: submission works end to end against a real configured endpoint, protects secrets, provides recoverable error feedback, and never reports false success.

### Phase 8 — Media and performance

Measure before optimizing; do not blindly rewrite the hero.

1. Record media size, initial transfer, LCP, CLS, INP, main-thread work during scroll, and dropped frames on desktop and throttled mobile.
2. Add a correctly sized poster/fallback image for the hero. Users should never see an unexplained blank video area.
3. Respect `prefers-reduced-motion`, `Save-Data`, slow connections, video load errors, and autoplay restrictions with a static fallback.
4. Reassess the current full Blob prefetch/assembly path. Prefer native range streaming when supported; keep multipart fallback only if deployment constraints require it and it is verified in production. Avoid holding unnecessary duplicate full-video buffers in memory.
5. Do not preload non-critical media. Lazy-load below-fold imagery.
6. Give images stable dimensions/aspect ratios, responsive `sizes/srcset` where supported, useful alt text, and async decoding. Verify framework image support under Vinext before adopting `next/image`.
7. Avoid importing or hydrating heavy below-fold features in the initial path if measurements show a real cost. Split into client islands only when the benefit justifies refactoring risk.
8. Keep per-frame hero work under the 16ms budget on a representative mid-range device.

Suggested targets, treated as goals rather than falsified guarantees:

- CLS < 0.1
- no persistent console errors
- no failed critical media requests
- Lighthouse Accessibility ≥95
- Lighthouse Best Practices ≥95
- Lighthouse SEO ≥90
- performance measured and reported honestly for both desktop and mobile

Acceptance: the experience degrades gracefully and remains understandable when video is unavailable or motion/data-saving preferences are enabled.

### Phase 9 — Metadata, SEO, and trust

1. Expand metadata using existing `public/og.png`: Open Graph, Twitter card, favicon/icons, and a truthful title/description.
2. Add canonical URL, robots policy, sitemap, and structured data only after the real production domain and entity type are known.
3. Do not fabricate organization schema, address, reviews, ratings, architect credentials, or social profiles.
4. Ensure social preview assets have correct dimensions and readable safe-area text.
5. Confirm document language matches content. Keep `lang="en"` while the public page is English.
6. Add an accessible 404/error experience only if this site will expose routes beyond the single landing page.

Acceptance: previews and metadata are accurate, crawlable, and free of invented claims.

### Phase 10 — Tooling cleanup and verification

1. Add `.site-package-stage/**` and other confirmed generated output to ESLint ignores. Do not suppress real source errors.
2. Run:
   - `pnpm exec eslint app --max-warnings 0`
   - `pnpm lint`
   - `pnpm build`
   - all repository tests
3. Test primary flows in the available browser automation:
   - page load and hero fallback;
   - forward/reverse scroll;
   - mobile menu open/close/Escape/focus return;
   - all configurator choices and rapid switching;
   - price calculation;
   - form validation, loading, success, endpoint-missing, network-error states;
   - anchor navigation and Back to top;
   - keyboard-only navigation;
   - reduced motion and high contrast;
   - responsive portrait/landscape.
4. Check console errors and failed network requests.
5. Capture final screenshots at 375×812, 768×1024, and 1440×900 and compare with baseline.
6. Review the final diff. Confirm only intended source/config/documentation files changed.
7. Do not claim completion if the endpoint, truthful content, mobile video, or build remains unverified. List those as blockers.

## Definition of done

The site is ready to present as a real portfolio work only when all of the following are true:

- concept vs real-business status is explicit and truthful;
- all key content is verified or clearly marked as concept content;
- source lint, full lint, build, and tests pass;
- no critical console/network errors exist;
- keyboard navigation and visible focus work throughout;
- text and UI contrast meet stated targets;
- interactive targets are touch-friendly;
- mobile menu has correct focus and Escape behavior;
- configurator communicates selection and price changes accessibly;
- form reaches a real endpoint or is clearly documented as the only release blocker;
- motion is interruptible and responsive in both scroll directions;
- reduced motion/transparency and static media fallback are complete;
- no layout breaks from 320px through desktop and phone landscape;
- performance and Lighthouse results are measured, not guessed;
- metadata/social preview are truthful;
- final report includes changed files, commands/results, screenshots, metrics, and unresolved blockers.

## Required final report from the implementing chat

The next chat must finish with:

1. Outcome first: what is now production-ready and what remains blocked.
2. Exact changed files with concise reasons.
3. Verification commands and their exit results.
4. Browser viewport matrix and observed results.
5. Accessibility and reduced-motion checks performed.
6. Performance measurements before/after where available.
7. Any user-provided data still needed: domain, endpoint, currency, legal/privacy text, verified identity/content.
8. No “done” claim if any release blocker remains.

## Copy-paste prompt for the next chat

Use this prompt verbatim or attach this file:

> Work only in `C:\проекты\Новая папка\architected-to-exist-house`. Read `PRODUCTION_HANDOFF.md` completely and execute it phase by phase. Before editing, read the installed `apple-design` and `ui-ux-pro-max` skill instructions completely, inspect the project and working-tree state, and establish a visual/technical baseline. Preserve the existing dark architectural concept, scroll-controlled build film, configurator, and form; refine rather than redesign. Accessibility, truthful content, functionality, performance, and responsive behavior outrank decorative polish. Do not invent real-world claims, testimonials, business data, prices, certifications, contact endpoints, or successful submissions. Do not edit generated output or unrelated files, do not install dependencies or deploy without explicit permission, and do not assume Git can restore untracked files. Implement the plan, verify lint/build/tests and the full browser matrix, iterate until safe checks pass, then report exact changes, evidence, metrics, and remaining release blockers. If real content or endpoint credentials are required, finish all other safe work and clearly request only the missing user data.

