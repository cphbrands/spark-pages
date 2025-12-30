// Simple in-memory sliding window rate limiter. For production, back with Redis or an edge KV.

type Identifier = string;

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 10; // per window per identifier

const hits = new Map<Identifier, number[]>();

export function isRateLimited(identifier: Identifier) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const arr = hits.get(identifier) || [];
  const recent = arr.filter((t) => t > windowStart);
  recent.push(now);
  hits.set(identifier, recent);
  return recent.length > MAX_REQUESTS;
}

export function remainingRequests(identifier: Identifier) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const arr = hits.get(identifier) || [];
  const recent = arr.filter((t) => t > windowStart);
  return Math.max(0, MAX_REQUESTS - recent.length);
}
