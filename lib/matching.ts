// AAPDA SETU — Needs Matching Engine
// Ranks available resources against an open need by distance + urgency

import { Need, Resource, NeedUrgency } from "./store";
import { haversineKm } from "./dedup";

const URGENCY_WEIGHTS: Record<NeedUrgency, number> = {
  critical: 1.0,
  high: 0.75,
  medium: 0.50,
  low: 0.25,
};

const MAX_DISTANCE_KM = 200; // beyond this, don't propose a match

export interface MatchResult {
  resource: Resource;
  distanceKm: number;
  urgencyScore: number;
  totalScore: number;
}

export function matchNeed(
  need: Need,
  inventory: Resource[]
): MatchResult[] {
  const candidates = inventory.filter(
    (r) =>
      r.type === need.type &&
      r.status === "available" &&
      r.quantity >= need.quantity &&
      r.dedupFlag !== "pending_review"
  );

  const results: MatchResult[] = candidates.map((r) => {
    const distanceKm = haversineKm(need.location, r.location);
    const urgencyScore = URGENCY_WEIGHTS[need.urgency];
    // distance score: 1 at 0km, 0 at MAX_DISTANCE_KM
    const distScore = Math.max(0, 1 - distanceKm / MAX_DISTANCE_KM);
    // total: 60% distance, 40% urgency
    const totalScore = Math.round((0.6 * distScore + 0.4 * urgencyScore) * 100) / 100;
    return { resource: r, distanceKm: Math.round(distanceKm * 10) / 10, urgencyScore, totalScore };
  });

  // Sort by score descending
  return results.sort((a, b) => b.totalScore - a.totalScore);
}
