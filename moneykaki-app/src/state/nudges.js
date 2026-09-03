// Lightweight, deterministic "AI nudge" copy generator.
//
// This stands in for the proposal's AI Nudge Service (Claude API call) so the
// frontend demo shows adaptive, pace-aware copy instead of a static number.
// Swap the body of getPaceMessage() for a real API call later — everything
// that calls it only cares about the { state, message } shape returned.

export function getRequiredDaily(goal) {
  const remaining = Math.max(0, goal.target - goal.saved);
  return Math.max(1, Math.ceil(remaining / Math.max(goal.daysLeft, 1)));
}

const AHEAD = [
  (t) => `Nice cushion — you're ahead of pace on ${t}.`,
  (t) => `Slow days won't hurt you here. ${t} has a buffer built up.`,
  (t) => `You're outpacing the plan for ${t}. Keep it up.`,
];

const BEHIND = [
  (t, r) => `Pace check: ${t} needs about $${r}/day to land on time.`,
  (t, r) => `A top-up today keeps ${t} on track — around $${r} would do it.`,
  (t) => `${t} has drifted behind pace. A bit extra today helps a lot.`,
];

const ON_PACE = [
  (t) => `Right on pace for ${t}. Keep the streak alive.`,
  (t) => `Steady does it — ${t} is tracking to plan.`,
  (t) => `On track for ${t}. Today's contribution keeps it that way.`,
];

export function getPaceMessage(goal) {
  const required = getRequiredDaily(goal);
  const suggested = goal.suggested ?? required;
  let bucket;
  let state;
  if (suggested >= required * 1.15) {
    bucket = AHEAD;
    state = 'ahead';
  } else if (suggested < required * 0.9) {
    bucket = BEHIND;
    state = 'behind';
  } else {
    bucket = ON_PACE;
    state = 'onpace';
  }
  // Deterministic "variety": picks a different template as saved changes,
  // without needing Math.random (which would flicker on re-render).
  const idx = Math.abs(Math.round(goal.saved)) % bucket.length;
  const message = bucket[idx](goal.title, required);
  return { state, message, required };
}

export const PACE_COLORS = {
  ahead: 'jade',
  onpace: 'gold',
  behind: 'coral',
};
