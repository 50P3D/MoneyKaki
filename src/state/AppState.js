import React, { createContext, useContext, useReducer, useMemo, useRef, useEffect } from 'react';
import { colors } from '../theme/tokens';
import { apiCreateGoal, apiAddContribution } from './api';

// Single shared state tree for the whole app.
//
// State is split into two named "profiles" — Wei Jie and Aisyah, the two
// personas from the proposal's own Appendix — so the app can be flipped
// live between someone who's on track and someone who's falling behind,
// without needing two separate builds. Everything goal/streak/ledger
// related lives per-profile; friends and the accountability partner are
// shared demo data (same small friend group, viewed from either account).
//
// This is in-memory only (no AsyncStorage yet) — state resets on app
// reload. That's the one deliberately-deferred piece: wiring persistence is
// a small addition once @react-native-async-storage/async-storage can be
// installed (it hit a file-lock error in this environment when we tried —
// see README).

function makeProfile({
  id,
  name,
  avatar,
  tagline,
  worker,
  statusLabel,
  gradient,
  accent,
  goals,
  activeGoalId,
  streak,
  streakStatus,
  gems,
  freezesLeft,
  charges,
  backendUserId,
}) {
  return {
    id,
    name,
    avatar,
    tagline,
    worker,
    statusLabel,
    gradient,
    accent,
    // Every goal starts with backendGoalId: null — it only gets a real
    // Postgres row (and this flips) once the first contribution to it
    // syncs successfully. See api.js / the CONTRIBUTE background sync below.
    goals: goals.map((g) => ({ backendGoalId: null, ...g })),
    activeGoalId,
    streak,
    streakStatus,
    gems,
    freezesLeft,
    ledger: { charges },
    // Which seeded backend user (apps/api/prisma/seed.ts) this persona's
    // writes go against — keeps Wei Jie's and Aisyah's goals from
    // colliding on the same account now that there's no auth yet.
    backendUserId,
  };
}

const PROFILE_PRESETS = {
  weijie: makeProfile({
    id: 'weijie',
    name: 'Wei Jie',
    avatar: 'WJ',
    tagline: 'Junior analyst · steady monthly pay',
    worker: 'salaried',
    statusLabel: 'On track',
    gradient: [colors.jade, colors.jadeDark],
    accent: colors.jade,
    backendUserId: 'demo-weijie',
    goals: [
      {
        id: 'bali',
        emoji: '🏝️',
        title: 'Bali Trip',
        saved: 696,
        target: 1200,
        daysLeft: 62,
        suggested: 12,
        checkpoints: [
          { label: 'Week 1', amount: 200 },
          { label: 'Week 2', amount: 500 },
          { label: 'Week 3', amount: 800 },
          { label: 'Week 4', amount: 1100 },
        ],
      },
    ],
    activeGoalId: 'bali',
    streak: 14,
    streakStatus: 'active',
    gems: 220,
    freezesLeft: 1,
    charges: [
      { id: 'netflix', name: 'Netflix', monthly: 17.98, category: 'subscription' },
      { id: 'grab-bnpl', name: 'Grab BNPL', monthly: 60.0, category: 'debt' },
      { id: 'insurance', name: 'Insurance', monthly: 210.0, category: 'essential' },
      { id: 'telco', name: 'Telco plan', monthly: 45.0, category: 'essential' },
    ],
  }),
  // Falling-behind persona: variable daily income, a goal running behind
  // pace against a hard deadline, both streak freezes already used, and a
  // streak that recently reset — the exact "punitive streak mechanics" /
  // "motivation drops after setbacks" pain points the proposal names.
  aisyah: makeProfile({
    id: 'aisyah',
    name: 'Aisyah',
    avatar: 'AY',
    tagline: 'Private-hire driver · variable daily income',
    worker: 'platform',
    statusLabel: 'Getting by',
    gradient: [colors.amber, colors.amberDark],
    accent: colors.amber,
    backendUserId: 'demo-user',
    goals: [
      {
        id: 'emergency',
        emoji: '🛟',
        title: 'Emergency Fund',
        saved: 210,
        target: 900,
        daysLeft: 18,
        suggested: 20, // deliberately below what's actually required — she's behind pace
        checkpoints: [
          { label: 'Milestone 1', amount: 225 },
          { label: 'Milestone 2', amount: 450 },
          { label: 'Milestone 3', amount: 675 },
          { label: 'Milestone 4', amount: 900 },
        ],
      },
    ],
    activeGoalId: 'emergency',
    streak: 2,
    streakStatus: 'broken',
    gems: 45,
    freezesLeft: 0,
    charges: [
      { id: 'phone', name: 'Phone plan', monthly: 25.0, category: 'essential' },
      { id: 'vehicle-insurance', name: 'Vehicle insurance', monthly: 180.0, category: 'essential' },
    ],
  }),
};

const initialState = {
  activeProfileId: 'weijie',
  profiles: PROFILE_PRESETS,
  friends: [
    { id: 'mei', initials: 'ME', name: 'Mei', streak: 9 },
    { id: 'aidil', initials: 'AI', name: 'Aidil', streak: 21 },
    { id: 'zach', initials: 'ZC', name: 'Zach', streak: 6 },
  ],
  accountabilityPartner: null, // { name, threshold }
  toast: null,
};

function withToast(state, message) {
  return { ...state, toast: { id: Date.now(), message } };
}

// Applies `updater` to the currently active profile only.
function updateActiveProfile(state, updater) {
  const id = state.activeProfileId;
  return {
    ...state,
    profiles: { ...state.profiles, [id]: updater(state.profiles[id]) },
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'CONTRIBUTE': {
      const { goalId, amount } = action;
      if (!amount || amount <= 0) return withToast(state, 'Enter an amount above $0 first.');
      const profile = state.profiles[state.activeProfileId];
      const wasBroken = profile.streakStatus === 'broken';
      const nextState = updateActiveProfile(state, (p) => {
        const goals = p.goals.map((g) => {
          if (g.id !== goalId) return g;
          const saved = Math.min(g.target, +(g.saved + amount).toFixed(2));
          return { ...g, saved };
        });
        const gemsEarned = 10 + Math.min(20, Math.round(amount));
        return { ...p, goals, streak: p.streak + 1, streakStatus: 'active', gems: p.gems + gemsEarned };
      });
      const newStreak = profile.streak + 1;
      const message = wasBroken
        ? `Nice — back on track. Streak restarted at ${newStreak} days 💪`
        : `+$${amount} saved — streak now ${newStreak} days 🔥`;
      return withToast(nextState, message);
    }
    case 'SET_BACKEND_GOAL_ID': {
      // Patches in the real Postgres id for a goal once it first syncs.
      // Searches every profile (not just the active one) since the app
      // may have switched personas while the background sync was in flight.
      const { goalId, backendGoalId } = action;
      const profiles = { ...state.profiles };
      for (const pid of Object.keys(profiles)) {
        const p = profiles[pid];
        if (p.goals.some((g) => g.id === goalId)) {
          profiles[pid] = {
            ...p,
            goals: p.goals.map((g) => (g.id === goalId ? { ...g, backendGoalId } : g)),
          };
          break;
        }
      }
      return { ...state, profiles };
    }
    case 'USE_FREEZE': {
      const profile = state.profiles[state.activeProfileId];
      if (profile.freezesLeft <= 0) return withToast(state, 'No freezes left this period — they refresh every 2 months.');
      const nextState = updateActiveProfile(state, (p) => ({ ...p, freezesLeft: p.freezesLeft - 1 }));
      return withToast(nextState, "Freeze used — today's streak is protected ❄️");
    }
    case 'CANCEL_CHARGE': {
      const { chargeId, redirectGoalId } = action;
      const profile = state.profiles[state.activeProfileId];
      const charge = profile.ledger.charges.find((c) => c.id === chargeId);
      if (!charge) return state;
      const goalTitle = profile.goals.find((g) => g.id === redirectGoalId)?.title ?? 'your goal';
      const nextState = updateActiveProfile(state, (p) => {
        const charges = p.ledger.charges.filter((c) => c.id !== chargeId);
        const goals = p.goals.map((g) => {
          if (g.id !== redirectGoalId) return g;
          const saved = Math.min(g.target, +(g.saved + charge.monthly).toFixed(2));
          return { ...g, saved };
        });
        return { ...p, ledger: { ...p.ledger, charges }, goals };
      });
      return withToast(
        nextState,
        `Cancelled ${charge.name} — $${charge.monthly.toFixed(0)}/mo redirected to ${goalTitle} 🎉`
      );
    }
    case 'ADD_CHARGE': {
      const name = (action.name || '').trim();
      const monthly = Number(action.monthly);
      const category = action.category || 'subscription';
      if (!name || !monthly || monthly <= 0) {
        return withToast(state, 'Give the charge a name and a monthly amount above $0.');
      }
      const charge = { id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`, name, monthly, category };
      const partner = state.accountabilityPartner;
      const overThreshold = partner && monthly >= partner.threshold;
      const nextState = updateActiveProfile(state, (p) => ({
        ...p,
        ledger: { ...p.ledger, charges: [...p.ledger.charges, charge] },
      }));
      const message = overThreshold
        ? `Added ${name} ($${monthly.toFixed(0)}/mo) — that crossed your alert threshold, so ${partner.name} was notified 🔔`
        : `Added ${name} — $${monthly.toFixed(0)}/mo now in your ledger`;
      return withToast(nextState, message);
    }
    case 'ADD_GOAL': {
      const { title, target, daysLeft, emoji } = action;
      if (!title || !title.trim() || !target || target <= 0) {
        return withToast(state, 'Give the goal a name and a target amount above $0.');
      }
      const id = `${title.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const suggested = Math.max(1, Math.ceil(target / Math.max(daysLeft, 1)));
      const goal = {
        id,
        emoji: emoji || '🎯',
        title: title.trim(),
        saved: 0,
        target,
        daysLeft: daysLeft || 30,
        suggested,
        backendGoalId: null,
        checkpoints: [0.25, 0.5, 0.75, 1].map((f, i) => ({
          label: `Checkpoint ${i + 1}`,
          amount: Math.round(target * f),
        })),
      };
      const nextState = updateActiveProfile(state, (p) => ({
        ...p,
        goals: [...p.goals, goal],
        activeGoalId: id,
      }));
      return withToast(nextState, `New goal created: ${goal.title}`);
    }
    case 'SET_ACTIVE_GOAL': {
      const nextState = updateActiveProfile(state, (p) => ({ ...p, activeGoalId: action.goalId }));
      return nextState;
    }
    case 'SWITCH_PROFILE': {
      const target = state.profiles[action.profileId];
      if (!target || action.profileId === state.activeProfileId) return state;
      return withToast({ ...state, activeProfileId: action.profileId }, `Now viewing ${target.name}'s account`);
    }
    case 'NUDGE_FRIEND': {
      const friend = state.friends.find((f) => f.id === action.friendId);
      if (!friend) return state;
      return withToast(state, `Nudged ${friend.name}!`);
    }
    case 'ADD_FRIEND': {
      const name = action.name.trim();
      if (!name) return state;
      const initials = name
        .split(/\s+/)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const friend = { id: `${name}-${Date.now()}`, initials, name, streak: 0 };
      return withToast({ ...state, friends: [...state.friends, friend] }, `Added ${name} as a Kaki!`);
    }
    case 'SET_ACCOUNTABILITY_PARTNER': {
      const name = (action.name || '').trim();
      const threshold = Number(action.threshold);
      if (!name || !threshold || threshold <= 0) {
        return withToast(state, "Give your partner's name and an alert threshold above $0.");
      }
      return withToast(
        { ...state, accountabilityPartner: { name, threshold } },
        `${name} will now be notified when a new charge crosses $${threshold}/mo`
      );
    }
    case 'REMOVE_ACCOUNTABILITY_PARTNER':
      return withToast({ ...state, accountabilityPartner: null }, 'Accountability partner removed.');
    case 'SHOW_TOAST':
      return withToast(state, action.message);
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

// Best-effort background sync for a single contribution: lazily creates
// the goal on the real backend the first time it's ever contributed to
// (nothing needs to exist there beforehand — the demo personas' preset
// goals are entirely local until this fires), then logs the contribution
// against it. Never throws — a backend that isn't running just means the
// goal stays local-only (`backendGoalId` stays null); see api.js.
async function syncContributionInBackground({ getState, dispatch, goalId, amount }) {
  const state = getState();
  const profile = Object.values(state.profiles).find((p) => p.goals.some((g) => g.id === goalId));
  const goal = profile?.goals.find((g) => g.id === goalId);
  if (!profile || !goal) return;

  let backendGoalId = goal.backendGoalId;
  if (!backendGoalId) {
    const deadline = new Date(Date.now() + Math.max(goal.daysLeft, 1) * 86400000).toISOString();
    const created = await apiCreateGoal({
      userId: profile.backendUserId,
      name: goal.title,
      targetAmount: goal.target,
      deadline,
    });
    if (!created.ok) return;
    backendGoalId = created.data.id;
    dispatch({ type: 'SET_BACKEND_GOAL_ID', goalId, backendGoalId });
  }

  await apiAddContribution(backendGoalId, { userId: profile.backendUserId, amount });
}

const AppStateContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const actions = useMemo(
    () => ({
      contribute: (goalId, amount) => {
        dispatch({ type: 'CONTRIBUTE', goalId, amount });
        syncContributionInBackground({ getState: () => stateRef.current, dispatch, goalId, amount });
      },
      applyFreeze: () => dispatch({ type: 'USE_FREEZE' }),
      cancelCharge: (chargeId, redirectGoalId) =>
        dispatch({ type: 'CANCEL_CHARGE', chargeId, redirectGoalId }),
      addCharge: (name, monthly, category) => dispatch({ type: 'ADD_CHARGE', name, monthly, category }),
      addGoal: (payload) => dispatch({ type: 'ADD_GOAL', ...payload }),
      setActiveGoal: (goalId) => dispatch({ type: 'SET_ACTIVE_GOAL', goalId }),
      switchProfile: (profileId) => dispatch({ type: 'SWITCH_PROFILE', profileId }),
      nudgeFriend: (friendId) => dispatch({ type: 'NUDGE_FRIEND', friendId }),
      addFriend: (name) => dispatch({ type: 'ADD_FRIEND', name }),
      setAccountabilityPartner: (name, threshold) =>
        dispatch({ type: 'SET_ACCOUNTABILITY_PARTNER', name, threshold }),
      removeAccountabilityPartner: () => dispatch({ type: 'REMOVE_ACCOUNTABILITY_PARTNER' }),
      showToast: (message) => dispatch({ type: 'SHOW_TOAST', message }),
      hideToast: () => dispatch({ type: 'HIDE_TOAST' }),
    }),
    []
  );

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}

// ---- Selectors (all scoped to the currently active profile) ----

export function useProfile() {
  const { state } = useApp();
  return state.profiles[state.activeProfileId];
}

export function useActiveGoal() {
  const profile = useProfile();
  return profile.goals.find((g) => g.id === profile.activeGoalId) ?? profile.goals[0];
}

export function useLedgerTotal() {
  const profile = useProfile();
  return profile.ledger.charges.reduce((sum, c) => sum + c.monthly, 0) * 12;
}

// 12-slot illustrative 30-day strip. Payday always sits at slot 7; the
// number of "deduction" bars tracks the number of live charges (up to 11),
// so cancelling or adding a charge visibly changes the strip instead of it
// being a disconnected static array.
const CASHFLOW_HEIGHTS = [0.3, 0.2, 0.55, 0.15, 0.25, 0.62, 0.2, 1.0, 0.2, 0.35, 0.48, 0.18];
const PAYDAY_INDEX = 7;
const DEDUCT_SLOT_ORDER = [2, 5, 10, 1, 9, 3, 6, 11, 0, 4, 8];

export function useCashflowBars() {
  const profile = useProfile();
  const deductCount = Math.min(profile.ledger.charges.length, DEDUCT_SLOT_ORDER.length);
  const deductSlots = new Set(DEDUCT_SLOT_ORDER.slice(0, deductCount));
  return CASHFLOW_HEIGHTS.map((h, i) => {
    if (i === PAYDAY_INDEX) return { h, type: 'payday' };
    if (deductSlots.has(i)) return { h, type: 'deduct' };
    return { h };
  });
}
