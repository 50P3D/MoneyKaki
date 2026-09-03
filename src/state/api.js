// Thin client for the real backend (moneykakiGroup/apps/api — NestJS +
// Prisma + Postgres). This is a "best effort, demo-safe" sync: every write
// updates local state immediately so the UI never waits on the network,
// then tries to mirror the same write to the real API in the background.
// If the backend isn't running, the call just fails quietly and the app
// keeps working off local state — see `goal.backendGoalId` in AppState.js
// for whether a given goal has ever actually synced.
//
// The backend has no auth yet, so writes go against fixed seeded demo
// users (apps/api/prisma/seed.ts) — one per persona, so Wei Jie's and
// Aisyah's goals don't collide on the same account.

// Point this at whatever machine is running `pnpm start:dev` inside
// apps/api.
//   - iOS Simulator / Android Emulator on the SAME machine: 'localhost' works.
//   - A physical phone in Expo Go: swap in that machine's LAN IP instead
//     (Windows: run `ipconfig`, use the IPv4 address — e.g. 192.168.1.23).
const API_HOST = 'localhost';
const API_BASE = `http://${API_HOST}:3000/api`;

const TIMEOUT_MS = 4000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err?.message || 'network error' };
  } finally {
    clearTimeout(timer);
  }
}

// POST /api/goals — creates a real row in Postgres, returns it (with a
// real backend-generated id, distinct from this app's local goal id).
export function apiCreateGoal({ userId, name, targetAmount, deadline }) {
  return request('/goals', {
    method: 'POST',
    body: JSON.stringify({ userId, name, targetAmount, deadline }),
  });
}

// POST /api/goals/:id/contributions — logs a real contribution row and
// bumps the real streak, against the BACKEND goal id (from apiCreateGoal).
export function apiAddContribution(backendGoalId, { userId, amount }) {
  return request(`/goals/${backendGoalId}/contributions`, {
    method: 'POST',
    body: JSON.stringify({ userId, amount }),
  });
}
