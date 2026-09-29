import { NextRequest, NextResponse } from "next/server";
import {
  NEEDS, RESOURCES, AGENCIES, AUDIT_LOG, MATCH_PROPOSALS,
  Need, MatchProposal,
} from "@/lib/store";
import { matchNeed } from "@/lib/matching";

let needStore = [...NEEDS];
let resourceStore = [...RESOURCES];
let auditStore = [...AUDIT_LOG];
let proposalStore = [...MATCH_PROPOSALS];

export function GET() {
  return NextResponse.json({ needs: needStore, proposals: proposalStore });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agencyId, type, quantity, location, urgency, unit } = body;

  const agency = AGENCIES.find((a) => a.id === agencyId);
  if (!agency) return NextResponse.json({ error: "Unknown agency" }, { status: 400 });

  const newNeed: Need = {
    id: `n${Date.now()}`,
    agencyId,
    agencyName: agency.name,
    type,
    quantity: Number(quantity),
    unit: unit || "pcs",
    location,
    urgency,
    status: "open",
    timestamp: new Date().toISOString(),
  };

  // Run matching engine
  const matches = matchNeed(newNeed, resourceStore);
  const proposals: MatchProposal[] = matches.slice(0, 3).map((m, i) => ({
    id: `mp${Date.now()}_${i}`,
    needId: newNeed.id,
    resourceId: m.resource.id,
    distanceKm: m.distanceKm,
    urgencyScore: m.urgencyScore,
    totalScore: m.totalScore,
    status: "proposed",
  }));

  needStore.push(newNeed);
  proposalStore.push(...proposals);

  auditStore.push({
    id: `a${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "NEED_REPORTED",
    actorId: agencyId,
    actorName: agency.name,
    actorRole: agency.role,
    needId: newNeed.id,
    detail: `Reported need for ${quantity} ${unit || "pcs"} of ${type} at ${location.zoneName} (urgency: ${urgency}). ${proposals.length} match proposals generated.`,
  });

  return NextResponse.json({ need: newNeed, proposals, matches });
}

// Approve or reject a match proposal (DM action)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { proposalId, decision, reviewerId, rejectionNote } = body;

  const proposal = proposalStore.find((p) => p.id === proposalId);
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  const reviewer = AGENCIES.find((a) => a.id === reviewerId);
  if (!reviewer || reviewer.role !== "dm") {
    return NextResponse.json({ error: "Only DM/Tehsildar can approve allocations" }, { status: 403 });
  }

  proposal.status = decision === "approve" ? "approved" : "rejected";
  proposal.reviewedBy = reviewerId;
  proposal.reviewedAt = new Date().toISOString();
  if (rejectionNote) proposal.rejectionNote = rejectionNote;

  if (decision === "approve") {
    // Update need and resource
    const need = needStore.find((n) => n.id === proposal.needId);
    const resource = resourceStore.find((r) => r.id === proposal.resourceId);
    if (need) {
      need.status = "fulfilled";
      need.matchedResourceId = proposal.resourceId;
      need.approvedBy = reviewerId;
      need.approvedAt = new Date().toISOString();
    }
    if (resource) {
      resource.status = "dispatched";
    }

    auditStore.push({
      id: `a${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "ALLOCATION_APPROVED",
      actorId: reviewerId,
      actorName: reviewer.name,
      actorRole: reviewer.role,
      needId: proposal.needId,
      resourceId: proposal.resourceId,
      detail: `${reviewer.name} approved allocation: resource dispatched to need location (${proposal.distanceKm}km away, score ${proposal.totalScore})`,
    });
  } else {
    auditStore.push({
      id: `a${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "ALLOCATION_REJECTED",
      actorId: reviewerId,
      actorName: reviewer.name,
      actorRole: reviewer.role,
      needId: proposal.needId,
      resourceId: proposal.resourceId,
      detail: `${reviewer.name} rejected proposal. Note: ${rejectionNote || "none"}. Re-queued for matching.`,
    });
  }

  return NextResponse.json({ proposal, needStore, resourceStore });
}
