# MoneyKaki — Frontend (React Native / Expo)

Working React Native implementation of the MoneyKaki wireframe, matching the
architecture proposed in Section 4 ("Cross-platform mobile client (React
Native) for iOS and Android from a single codebase"). The UI is now backed
by local, in-memory state (`src/state/AppState.js`) instead of static
placeholder constants — every action on screen actually does something, but
it's still frontend-only: wire it up to the Goal & Streak, Commitment Ledger
and Social & Accountability services described in the proposal for a real
backend.

## Screens

| Screen | File | Notes |
|---|---|---|
| Home | `src/screens/HomeScreen.js` | Streak badge, goal card (switchable if you have >1 goal), "+ New goal", ledger summary, friends preview |
| Goal Detail | `src/screens/GoalDetailScreen.js` | Contribution input that actually updates the goal, streak/gems/freeze (usable), pace-aware nudge line, dynamic checkpoints |
| Commitment Ledger | `src/screens/LedgerScreen.js` | 12-month headline (computed live from charges), 30-day cash-flow strip, "Cancel → pot" that removes the charge and redirects the freed amount into your active goal |
| Kakis (Accountability) | `src/screens/FriendsScreen.js` | Friend streak list, working "Nudge" + "+ Add a Kaki", public commitment pot now pulled from the same active goal shown on Home |

Navigation: a bottom tab bar (`Home`, `Ledger`, `Kakis`) with a native stack
nested inside the `Home` tab so Goal Detail pushes/pops the way it would on
iOS/Android.

## What changed in this pass

- **Shared state** (`src/state/AppState.js`): a single Context + reducer
  replaces the old per-screen hardcoded arrays. Contributing to a goal,
  cancelling a ledger charge, nudging a friend, adding a Kaki, and creating
  a new goal all dispatch real actions and update every screen that reads
  that data.
- **Every button now does something**: "Confirm by 23:59" deducts into the
  goal and bumps streak/gems; "Cancel → pot" removes the charge and
  redirects the freed monthly amount into your active goal (the proposal's
  core "cancel a subscription, watch it land in a goal" loop); "Nudge",
  "+ Add a Kaki" and "+ New goal" all have working flows now (a lightweight
  bottom-sheet form component, `FormSheet` in `Common.js`, backs the latter
  two).
- **A stand-in for the AI Nudge Service** (`src/state/nudges.js`): pace-aware
  copy ("Pace check: Bali Trip needs about $15/day...") computed from the
  goal's numbers, shown on the Home goal card and Goal Detail. Swap the
  body of `getPaceMessage()` for a real Claude API call later — everything
  that calls it only cares about the `{ state, message }` it returns.
- **Type scale** (`src/theme/tokens.js`): added a proper `type` scale
  (display/h1/h2/subheading/body/bodyStrong/caption/micro) and refactored
  every screen to use it instead of inline magic-number font sizes. Body
  text moved from ~10–13px up to a 13–15px floor; buttons and tap targets
  respect a 44pt minimum.
- **Small animations**: the progress ring fills and the percentage counts up
  instead of snapping; streak/gems/ledger totals do a quick scale-pulse when
  they change (`Pulse`/`usePulse` in `Common.js`) so the gamification loop
  reads as "alive" rather than static numbers.
- **Toasts**: a global toast (`ToastHost`, mounted once in `App.js`) gives
  feedback for every action instead of taps doing nothing visible.

## Demo personas

Home now has a small "Demo — viewing as" switcher at the top that flips the
entire app between two accounts, both taken from the proposal's own
Appendix personas:

- **Wei Jie** — salaried, on track, saving for a trip while a few
  subscriptions and a BNPL plan quietly add up. This is the original
  default data.
- **Aisyah** — a private-hire driver with variable daily income, behind
  pace on an Emergency Fund with a tight deadline, both streak freezes
  already used, and a streak that recently reset. This is the "falling
  through the cracks" view — pace messaging switches to the "behind"
  template, the streak pill shows a softened "restart" state instead of a
  broken number, and Goal Detail shows a reassurance banner instead of
  treating the reset as a failure (directly the proposal's "punitive streak
  mechanics" / "motivation drops after setbacks" pain points).

Each profile has its own goals, streak, gems, freezes and ledger; friends
and the accountability partner are shared demo data across both.

Each profile also carries its own status color (`gradient` + `statusLabel`
in `src/state/AppState.js`, applied by `GoalCard`): Wei Jie's card is the
original green (jade) gradient with an "On track" badge; Aisyah's is an
amber gradient with a "Getting by" badge — same underlying goal-card
component, just a different palette per profile, plus a small color dot on
the persona switcher chip itself so you can tell them apart before even
tapping in.

## Persona color scheme, applied app-wide

Each profile's green/amber theme (`gradient` + `accent` in
`src/state/AppState.js`) now shows up everywhere that screen has a strong
visual anchor, not just the Home goal card: the Ledger headline card is now
a gradient in the active profile's colors, the Goal Detail progress bar and
"Confirm by 23:59" button use the profile's accent, and on Home the streak
pill and the persona-switcher dots do too. Deliberately left untouched:
`ResourceTip` and `CpfSnapshot` (the official-source cards) keep their own
constant gold/neutral styling regardless of persona — official-source
content should look distinct from MoneyKaki's own app chrome, not blend
into whichever persona you're viewing, so it's always clear which parts of
the screen are us and which are a citation.

## Financial-literacy visuals + official resources, surfaced contextually

Chart-based additions, all built on `react-native-svg` primitives (no new
dependency):

- **"Where it goes" Sankey** (Ledger screen, `src/components/SankeyFlow.js`):
  a dynamic, data-driven flow diagram — every recurring charge on the active
  profile is grouped by category (Essentials / Subscriptions / Debt-BNPL,
  picked when you add a charge) and rendered as curved ribbons from a single
  "Committed" root into proportionally-sized category nodes, in the same
  multi-column style as the Plotly Sankey reference. It's 100% our own data —
  no sourcing concern, this is exactly what MoneyKaki itself is for — and it
  redraws itself the moment a charge is added or cancelled, since it reads
  straight off `profile.ledger.charges`. (`DonutChart.js` is kept around and
  still powers the CPF snapshot below, in the same reusable ring-chart style
  as `ProgressRing`.)
- **CPF snapshot** (Goal Detail, `src/components/CpfSnapshot.js`, shown
  only for a platform-worker profile): two small donuts — contribution
  split (you vs. the platform operator) and account allocation split
  (Ordinary/MediSave/Special) — for platform workers aged 35 & under who've
  opted in. **This is deliberately not a calculator.** As a third-party
  app, MoneyKaki has no business computing or reporting someone's actual
  CPF contribution — what's shown is CPF Board's own published rate
  tables for one age band, with an explicit disclaimer, two source
  citations, and a prominent link to CPF Board's real calculator for an
  actual personalised number. "Apply the public rates, but the reference
  is the most important part" — the numbers are cited facts, not something
  we calculated.

Sources used (checked live before hardcoding, not from memory):
- [CPF contribution rates for platform workers](https://www.cpf.gov.sg/employer/platform-operators/obligations/how-much-cpf-contributions-to-pay-platform-workers) — CPF Board, last updated 25 May 2026
- [CPF allocation rates from 1 January 2026](https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFAllocationRatesfromJanuary2026.pdf) — CPF Board (PDF)
- [Platform Worker CPF Contribution Calculator](https://www.cpf.gov.sg/member/tools-and-services/calculators/platform-worker-cpf-contribution-calculator) — CPF Board, linked as the real source of truth
- [3 traps to avoid when you go shopping](https://www.moneysense.gov.sg/3-traps-to-avoid-when-you-go-shopping/) — MoneySense (MAS), the existing BNPL tip on the Ledger screen

If these get reused for a different age band or the rates change, update
the constants at the top of `CpfSnapshot.js` and re-verify against the
CPF Board pages above rather than guessing — they do change (the whole
point of the Platform Workers Act rates is a 5-year phase-in).

## Pace-risk warning screen

Goal Detail (`src/screens/GoalDetailScreen.js`) now opens a one-time modal
whenever the active goal's pace state is `'behind'` (the same pace engine
that drives the "Pace check" copy — see `getPaceMessage()` in
`src/state/nudges.js`). Aisyah's Emergency Fund is deliberately seeded
behind pace, so switching to her demo profile and opening her goal shows it.

- **The numbers are computed, not scripted**: `projectedSaved = goal.saved +
  goal.suggested * goal.daysLeft` and the shortfall is `goal.target -
  projectedSaved`, so the modal always reflects whatever the current saved
  amount, days left and target actually are — contribute a few times and
  the next "behind" trigger (a new goal, a different persona) will show a
  different projected shortfall, not a hardcoded one.
- **Framed as information, not a penalty**: "Heads up" / "here's today's
  honest projection", not "you failed" — consistent with the non-punitive
  streak-reset framing already used elsewhere. There's no dead end: the
  primary action pre-fills today's contribution box with the exact
  `$/day` figure that *would* keep the goal on pace (pulled from
  `pace.required`), and a plain secondary action just dismisses it
  ("I understand — let's keep going") for anyone who wants to keep their
  own pace instead.
- Shown once per screen visit (on mount), not on every re-render, so it
  doesn't reappear after you've already acknowledged it and are just typing
  in the contribution box.

## Official resources, surfaced contextually

Two real external resources are wired in via `Linking.openURL` — deliberately
not as a Resources/FAQ screen, but as a single small card that only appears
when it's actually relevant to what's on screen, and disappears when it
isn't:

- **CPF Platform Worker Contribution Calculator** (cpf.gov.sg) — shown on
  Goal Detail only when the active profile is a platform/gig worker
  (Aisyah). Ties to the proposal's "CPF-aware guidance for gig workers
  newly covered under the Platform Workers Act."
- **MoneySense's BNPL guidance** (moneysense.gov.sg, run by MAS) — shown on
  the Ledger screen only when a charge with "BNPL" in its name exists.
  Cancel that charge and the tip disappears on its own.

Both were pulled from real, currently-live government pages (checked before
wiring them in, not guessed) — see `ResourceTip` in
`src/components/Common.js` for the pattern if you want to add a third
somewhere.

## Proposal alignment (as of this pass)

Roughly mapped to the proposal's feature sections:

- **Flexible goals & streaks** (Section 2): goal creation, variable daily
  contributions, streaks, gems, streak freeze, sub-goal checkpoints, and
  pace-aware nudge copy are all wired to live state. Missing: the actual
  23:59 push notification and the streak-breaking-on-miss logic (there's no
  concept of a "day" passing in this demo yet, so a streak can only go up).
- **Commitment Ledger** (Section 2): 12-month headline, cancel→redirect
  loop, and manual "+ Add a recurring charge" are all live now (manual entry
  was explicitly called out in the proposal as the Phase 2 fallback before
  bank-feed integration). The 30-day cash-flow strip now reacts to how many
  charges you have, but it's still an illustrative pattern, not real dated
  transactions.
- **Social & accountability** (Section 2): friends, nudge, and public
  commitment pots are live and now consistent (the pot always reflects your
  active goal). The accountability-partner/parent notification is now
  present as a settable threshold on the Kakis screen — adding a charge that
  crosses it fires a simulated notification toast.
- **Gamification / AI layer** (Section 2, Section 4): gems, streak freeze,
  and a stand-in AI Nudge Service (`src/state/nudges.js`) are wired. Still a
  local template generator, not a real Claude API call.

## Known gaps / deliberately deferred

- **No persistence yet.** State is in-memory only and resets on reload.
  `@react-native-async-storage/async-storage` is the natural fix (a few
  lines in `AppState.js` to load/save the reducer state), but installing it
  in this environment hit a file-lock error (`EACCES` renaming inside
  `node_modules/expo/node_modules`) — likely OneDrive syncing/locking files
  mid-install. Try `npx expo install @react-native-async-storage/async-storage`
  locally (ideally with OneDrive sync paused, or the project moved outside
  a synced folder) and it should install cleanly.
- Screenshot "proof" is a visual toggle only — no real camera/file picker
  wired up (`expo-image-picker` would be the natural addition).
- No real 23:59 push notification, and no streak-breaking-on-miss simulation.
- No auth, no backend — matches the "Next steps" below, unchanged from the
  original scope of this frontend-only demo.

## Project structure

```
App.js                        # navigation root + AppProvider + toast host
src/
  theme/tokens.js              # colors, radius, spacing, type scale
  state/
    AppState.js                 # shared Context + reducer (goals, streak, gems, ledger, friends)
    nudges.js                   # pace-aware nudge copy generator
  components/
    Common.js                  # Card, SectionLabel, StreakPill, buttons, Toast, FormSheet, Pulse
    GoalCard.js                # jade gradient goal card + progress ring + pace line
    ProgressRing.js             # animated SVG circular progress
  screens/
    HomeScreen.js
    GoalDetailScreen.js
    LedgerScreen.js
    FriendsScreen.js
```

## Run it

Requires Node 18+ and the Expo Go app on your phone (or an iOS/Android
simulator).

```bash
npm install
npm start
```

Then scan the QR code with Expo Go, or press `i` / `a` in the terminal to
open an iOS/Android simulator.

## Design tokens

All colors, radii, spacing and type live in `src/theme/tokens.js` so the
look stays consistent as more screens are built:

- `colors.jade` / `colors.jadeDark` — savings & primary actions
- `colors.coral` — streaks, deductions, urgency
- `colors.gold` — gems, rewards, pledged pots
- `colors.ink` — dark surfaces, primary text
- `colors.sage` — screen background
- `type.*` — the font scale every screen should use instead of inline sizes

## Next steps

- Replace `src/state/AppState.js`'s in-memory reducer with real calls to
  the Goal & Streak, Commitment Ledger and Social services once the
  backend exists — the action names (`contribute`, `cancelCharge`,
  `nudgeFriend`, `addFriend`, `addGoal`) are already shaped like the API
  calls they'll eventually become.
- Add AsyncStorage persistence (see "Known gaps" above).
- Add auth + the notification flow for the 23:59 contribution reminder.
- Swap `getPaceMessage()` in `src/state/nudges.js` for a real AI Nudge
  Service call (Claude API) once that service exists.
