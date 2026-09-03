# MoneyKaki — Frontend (React Native / Expo)

Working React Native implementation of the MoneyKaki wireframe, matching the
architecture proposed in Section 4 ("Cross-platform mobile client (React
Native) for iOS and Android from a single codebase"). All data on screen is
placeholder content — wire it up to the Goal & Streak, Commitment Ledger and
Social & Accountability services described in the proposal.

## Screens

| Screen | File | Notes |
|---|---|---|
| Home | `src/screens/HomeScreen.js` | Streak badge, goal card, ledger summary, friends preview |
| Goal Detail | `src/screens/GoalDetailScreen.js` | Pushed from the Home goal card. Contribution input, streak/gems/freeze, checkpoints |
| Commitment Ledger | `src/screens/LedgerScreen.js` | 12-month headline, 30-day cash-flow strip, recurring charges |
| Kakis (Accountability) | `src/screens/FriendsScreen.js` | Friend streak list, nudge action, public commitment pot |

Navigation: a bottom tab bar (`Home`, `Ledger`, `Kakis`) with a native stack
nested inside the `Home` tab so Goal Detail pushes/pops the way it would on
iOS/Android.

## Project structure

```
App.js                        # navigation root
src/
  theme/tokens.js              # colors, radius, spacing tokens
  components/
    Common.js                  # Card, SectionLabel, StreakPill, buttons
    GoalCard.js                # jade gradient goal card + progress ring
    ProgressRing.js            # SVG circular progress
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

All colors, radii and spacing live in `src/theme/tokens.js` so the palette
stays consistent as more screens are built:

- `colors.jade` / `colors.jadeDark` — savings & primary actions
- `colors.coral` — streaks, deductions, urgency
- `colors.gold` — gems, rewards, pledged pots
- `colors.ink` — dark surfaces, primary text
- `colors.sage` — screen background

## Next steps

- Replace the hardcoded `GOAL`, `CHARGES`, `CASHFLOW` and `FRIENDS` arrays
  with data from the Goal & Streak, Commitment Ledger and Social services.
- Add auth + the notification flow for the 23:59 contribution reminder.
- Wire the AI Nudge Service into the "Suggested today" copy on the goal card.
