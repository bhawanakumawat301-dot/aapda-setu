// AAPDA SETU — Deduplication Scoring Engine
// Scores incoming resource reports against existing inventory
// using 4 signals: location, type, quantity, time
// Returns a score 0-1. Above threshold → flag for human review.

import { Resource, GeoPoint, ResourceType } from "./store";

const DEDUP_THRESHOLD = 0.70; // flag above this score
const GEO_RADIUS_KM = 5;     // max distance to consider a geo match
const TIME_WINDOW_HOURS = 12; // reports within this window are temporally close

// --- Haversine distance ---
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng *
      sinLng;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// --- Individual signal scores (0-1) ---
function geoScore(a: GeoPoint, b: GeoPoint): number {
  const d = haversineKm(a, b);
  if (d > GEO_RADIUS_KM) return 0;
  return 1 - d / GEO_RADIUS_KM;
}

function typeScore(a: ResourceType, b: ResourceType): number {
  return a === b ? 1 : 0;
}

function quantityScore(a: number, b: number): number {
  const ratio = Math.min(a, b) / Math.max(a, b);
  return ratio; // 1 if equal, lower if differ
}

function timeScore(a: string, b: string): number {
  const diffHours =
    Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 3600000;
  if (diffHours > TIME_WINDOW_HOURS) return 0;
  return 1 - diffHours / TIME_WINDOW_HOURS;
}

// --- Combined dedup score ---
// Weights: geo 40%, type 35%, qty 15%, time 10%
export function dedupScore(incoming: Resource, existing: Resource): number {
  const gs = geoScore(incoming.location, existing.location);
  const ts = typeScore(incoming.type, existing.type);
  const qs = quantityScore(incoming.quantity, existing.quantity);
  const tms = timeScore(incoming.timestamp, existing.timestamp);

  const score = 0.40 * gs + 0.35 * ts + 0.15 * qs + 0.10 * tms;

  return Math.round(score * 100) / 100;
}

// --- Check incoming report against inventory ---
export interface DedupResult {
  isDuplicate: boolean;
  score: number;
  matchedResourceId?: string;
  breakdown: {
    geo: number;
    type: number;
    quantity: number;
    time: number;
  };
}

export function checkDuplicate(
  incoming: Resource,
  inventory: Resource[]
): DedupResult {
  let best: DedupResult = {
    isDuplicate: false,
    score: 0,
    breakdown: { geo: 0, type: 0, quantity: 0, time: 0 },
  };

  for (const existing of inventory) {
    if (existing.id === incoming.id) continue;
    if (existing.agencyId === incoming.agencyId) continue; // same agency, not a dup

    const gs = geoScore(incoming.location, existing.location);
    const ts = typeScore(incoming.type, existing.type);
    const qs = quantityScore(incoming.quantity, existing.quantity);
    const tms = timeScore(incoming.timestamp, existing.timestamp);
    const score = 0.40 * gs + 0.35 * ts + 0.15 * qs + 0.10 * tms;
    const rounded = Math.round(score * 100) / 100;

    if (rounded > best.score) {
      best = {
        isDuplicate: rounded >= DEDUP_THRESHOLD,
        score: rounded,
        matchedResourceId: existing.id,
        breakdown: {
          geo: Math.round(gs * 100) / 100,
          type: Math.round(ts * 100) / 100,
          quantity: Math.round(qs * 100) / 100,
          time: Math.round(tms * 100) / 100,
        },
      };
    }
  }

  return best;
}
