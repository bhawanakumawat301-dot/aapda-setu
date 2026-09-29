import { NextRequest, NextResponse } from "next/server";
import {
  RESOURCES, DEDUP_FLAGS, AUDIT_LOG, AGENCIES,
  Resource, DedupFlag_,
} from "@/lib/store";
import { checkDuplicate } from "@/lib/dedup";

let resourceStore = [...RESOURCES];
let dedupStore = [...DEDUP_FLAGS];
let auditStore = [...AUDIT_LOG];

export function GET() {
  return NextResponse.json({ resources: resourceStore, dedupFlags: dedupStore });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agencyId, type, quantity, location, unit } = body;

  const agency = AGENCIES.find((a) => a.id === agencyId);
  if (!agency) return NextResponse.json({ error: "Unknown agency" }, { status: 400 });

  const newResource: Resource = {
    id: `r${Date.now()}`,
    agencyId,
    agencyName: agency.name,
    agencyType: agency.type,
    type,
    quantity: Number(quantity),
    unit: unit || "pcs",
    location,
    status: "available",
    timestamp: new Date().toISOString(),
    dedupFlag: "clear",
  };

  // Run dedup check
  const result = checkDuplicate(newResource, resourceStore);

  if (result.isDuplicate && result.matchedResourceId) {
    newResource.dedupFlag = "pending_review";
    newResource.dedupPairId = `dp${Date.now()}`;

    const flag: DedupFlag_ = {
      id: newResource.dedupPairId,
      resourceId1: result.matchedResourceId,
      resourceId2: newResource.id,
      score: result.score,
      status: "pending",
    };
    dedupStore.push(flag);

    auditStore.push({
      id: `a${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "DEDUP_FLAGGED",
      actorId: "system",
      actorName: "AAPDA SETU Engine",
      actorRole: "field",
      resourceId: newResource.id,
      dedupId: flag.id,
      detail: `Possible duplicate detected (score ${result.score}). Flagged for DM review. Signals: geo=${result.breakdown.geo}, type=${result.breakdown.type}, qty=${result.breakdown.quantity}, time=${result.breakdown.time}`,
    });
  } else {
    auditStore.push({
      id: `a${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "RESOURCE_REPORTED",
      actorId: agencyId,
      actorName: agency.name,
      actorRole: agency.role,
      resourceId: newResource.id,
      detail: `Reported ${quantity} ${unit || "pcs"} of ${type} at ${location.zoneName}`,
    });
  }

  resourceStore.push(newResource);

  return NextResponse.json({
    resource: newResource,
    dedupResult: result,
  });
}

// Resolve a dedup flag (DM action)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { dedupId, decision, reviewerId } = body; // decision: "merge" | "keep_separate"

  const flag = dedupStore.find((f) => f.id === dedupId);
  if (!flag) return NextResponse.json({ error: "Flag not found" }, { status: 404 });

  const reviewer = AGENCIES.find((a) => a.id === reviewerId);
  if (!reviewer || reviewer.role !== "dm") {
    return NextResponse.json({ error: "Only DM/Tehsildar can resolve dedup flags" }, { status: 403 });
  }

  flag.status = decision === "merge" ? "merged" : "kept_separate";
  flag.reviewedBy = reviewerId;
  flag.reviewedAt = new Date().toISOString();

  // Update resource flags
  const r2 = resourceStore.find((r) => r.id === flag.resourceId2);
  if (r2) {
    r2.dedupFlag = decision === "merge" ? "merged" : "kept_separate";
    r2.resolvedBy = reviewerId;
    r2.resolvedAt = new Date().toISOString();
    if (decision === "merge") r2.status = "dispatched"; // absorbed into r1
  }
  const r1 = resourceStore.find((r) => r.id === flag.resourceId1);
  if (r1) r1.dedupFlag = decision === "merge" ? "merged" : "kept_separate";

  auditStore.push({
    id: `a${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: decision === "merge" ? "DEDUP_MERGED" : "DEDUP_KEPT_SEPARATE",
    actorId: reviewerId,
    actorName: reviewer.name,
    actorRole: reviewer.role,
    dedupId,
    detail: `${reviewer.name} resolved dedup flag ${dedupId}: ${decision === "merge" ? "entries merged" : "kept as separate resources"}`,
  });

  return NextResponse.json({ flag, resourceStore });
}
