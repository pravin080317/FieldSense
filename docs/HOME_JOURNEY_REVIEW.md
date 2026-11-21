# Home page: farmer journey review and implementation

21 November 2026. User asked to start with Home because the app still felt unfamiliar, explain its purpose, guide navigation, and use two reviewers to challenge/refine the approach.

## Two-reviewer findings

The journey reviewer proposed a clear purpose, a state-aware main action and three connected steps. The skeptical reviewer challenged the temptation to add those explanations above the existing dashboard: that would keep the overload. Both agreed to replace the Home content, not stack more cards onto it.

Specific issues found: introductory content came after date/sample controls; duplicated Record actions; map, rain, numbers, suggested causes and missing-report messages competed for attention. Simply sending Add my field to the old My field page was inadequate because advanced imagery appeared before field setup.

Refinement: show the three-step introduction primarily to first-time/sample users; returning farmers get their field, actual next job and last visit, with the introduction collapsed. Sample selection is not proof of being new: an existing farmer may be viewing the sample, so offer Open my field when real fields exist. Never reset sample or farmer evidence merely to navigate.

## Implemented Home

- One purpose: **A simple diary for your rice field.** Save what you see, plan your next job and look back at what changed.
- No own field: **Add my field** opens the actual new-field form. **Try a sample visit** is clearly labelled. Sample explanation stays separate from real records.
- Own fields exist while sample is active: **Open my field** selects a saved real field/season. It does not create a duplicate or erase the sample.
- Real selected field: **Record my first visit** or **Record a visit**, compact field/season context, earliest pending job and latest saved non-sample observation. Empty states describe a useful action.
- Two described secondary destinations: soil/water reports and help. Tasks/History are reached from their own context cards. Returning-user introduction is collapsible.
- Three-step first-use flow: Add your field → Record what you see → Return and compare. Storage note explains that records stay in this browser/device and links to backup help.
- Removed duplicate Home page heading/action, sample review-date strip, top-level selectors, statistics, map, weather and repeated learning panels. Maps/records remain available on their dedicated screens.
- Added a responsive visual layer with rice illustration, readable type, distinct action hierarchy and theme variants. Illustration remains explicitly labelled.
- My field setup now precedes advanced imagery. Add my field opens a fresh draft directly; no workspace save occurs until the user saves it.

## Validation

Post-implementation skeptical review found no blocking wiring issue. Applied two copy corrections: the task link says See planned work because it opens the task board, and the visit card says Your latest field check because it sorts by observation date. Reduced the returning-user hero height; phone layout remains to be observed.

63 tests pass, production build and lint pass. Added a server-rendered regression test for first-use sample, sample with own fields, and empty real-field Home states. This confirms rendered copy/actions and the absence of the old dashboard panels; it does not simulate browser clicks.

Native Chrome inspection was attempted but blocked by a minimised window and failed target-state recovery; browser access host is also unavailable. No visual acceptance or mobile screenshot verification is claimed for this redesign. The earlier input-help Chrome check remains valid for that earlier increment only.

## Acceptance still required

### Benefit-led refinement after user feedback

User remained unconvinced: a diary headline and three process steps explained how to enter data but not what useful output a farmer receives. Inspected the actual existing Home in Chrome (Earth theme, desktop): the illustration occupied almost half the introductory card, and the benefits were not explicit.

Changed the headline to See crop changes. Keep work on track. Expanded plain copy to describe field photos/checks/work/costs, listed supported record crops, reduced the illustration and added a clearly labelled example connecting a wet-patch note to a job and return comparison. The example is illustrative, not calculated user data.

Added four outcome-led routes: compare dated visits, track planned work and results, review entered spending/missing costs, and keep soil/water papers with their field/date. Each explains the input, the usable output and where to open it. These describe existing tools without promising diagnosis, automatic notifications, profit or expert delivery. Returning farmers can expand the overview of benefits rather than being forced past it before their work.

Validation: 65 tests/build/lint pass, including updated Home content regression. Successfully inspected the previous Home visually and used it to guide this revision. Post-change visual inspection was blocked by native input/window geometry and foreground-window mismatches; no new screenshot acceptance is claimed. Phone and interactive navigation checks remain open. Local/unpushed.

- First-time farmer can explain what the app does after reading Home and identify the primary action.
- Add my field opens the form; Cancel does not save; Save creates/selects the real field and returns to useful work.
- Try sample keeps context explicit; Open my field chooses an actual saved field without resetting records.
- Returning farmer can record a visit, open the next actual task, read earlier visits and switch field/season.
- At phone widths the purpose and main action are readable without horizontal scrolling; no illustration or helper panel blocks the action.
- Check keyboard/focus, 200% text, all themes, empty/long values and offline states. Confirm backup guidance is understandable.
- Farmer/Tamil wording review and observed task-completion feedback are needed before calling the journey easy or field-ready.

Scope: Home and its field-setup entry point. No new diagnosis, prediction, data migration, external service or published deployment. Changes remain local until a requested check-in.
