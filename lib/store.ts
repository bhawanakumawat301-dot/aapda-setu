// In-memory store — replaces a DB for the prototype
// In production this would be PostGIS + PostgreSQL

export type AgencyType = "NDRF" | "STATE" | "ARMY" | "NGO" | "VOLUNTEER";
export type ResourceType =
  | "blankets"
  | "food_packets"
  | "water_cans"
  | "medical_kits"
  | "boats"
  | "tents"
  | "generators"
  | "medicine"
  | "rescue_personnel"
  | "vehicles";

export type ResourceStatus = "available" | "dispatched" | "reserved";
export type NeedUrgency = "critical" | "high" | "medium" | "low";
export type NeedStatus = "open" | "matched" | "fulfilled";
export type DedupFlag = "clear" | "pending_review" | "merged" | "kept_separate";
export type Role = "field" | "coordinator" | "dm";

export interface Agency {
  id: string;
  name: string;
  type: AgencyType;
  role: Role;
  zone: string;
  verified: boolean;
  verificationId: string; // Aadhaar last4 or NGO Darpan ID
}

export interface GeoPoint {
  lat: number;
  lng: number;
  zoneName: string;
}

export interface Resource {
  id: string;
  agencyId: string;
  agencyName: string;
  agencyType: AgencyType;
  type: ResourceType;
  quantity: number;
  unit: string;
  location: GeoPoint;
  status: ResourceStatus;
  timestamp: string;
  dedupFlag: DedupFlag;
  dedupPairId?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface Need {
  id: string;
  agencyId: string;
  agencyName: string;
  type: ResourceType;
  quantity: number;
  unit: string;
  location: GeoPoint;
  urgency: NeedUrgency;
  status: NeedStatus;
  timestamp: string;
  matchedResourceId?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface DedupFlag_ {
  id: string;
  resourceId1: string;
  resourceId2: string;
  score: number;
  status: "pending" | "merged" | "kept_separate";
  reviewedBy?: string;
  reviewedAt?: string;
  note?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  resourceId?: string;
  needId?: string;
  dedupId?: string;
  detail: string;
}

export interface MatchProposal {
  id: string;
  needId: string;
  resourceId: string;
  distanceKm: number;
  urgencyScore: number;
  totalScore: number;
  status: "proposed" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionNote?: string;
}

// --- Seed data ---
export const AGENCIES: Agency[] = [
  { id: "ag1", name: "NDRF Battalion 4", type: "NDRF", role: "coordinator", zone: "Ernakulam North", verified: true, verificationId: "NDRF-BN4-KL" },
  { id: "ag2", name: "Kerala State SDRF", type: "STATE", role: "coordinator", zone: "Ernakulam South", verified: true, verificationId: "SDRF-KL-001" },
  { id: "ag3", name: "Aapda Mitra Unit 7", type: "VOLUNTEER", role: "field", zone: "Thrissur", verified: true, verificationId: "XXXX-7892" },
  { id: "ag4", name: "HelpAge India", type: "NGO", role: "field", zone: "Kozhikode", verified: true, verificationId: "NGO-DPN-HR-0094821" },
  { id: "ag5", name: "District Magistrate", type: "STATE", role: "dm", zone: "Ernakulam District", verified: true, verificationId: "IAS-KL-DM-EKM" },
  { id: "ag6", name: "Army Relief Column 2", type: "ARMY", role: "coordinator", zone: "Alappuzha", verified: true, verificationId: "ARMY-RC2-KL" },
];

export const RESOURCES: Resource[] = [
  {
    id: "r1", agencyId: "ag1", agencyName: "NDRF Battalion 4", agencyType: "NDRF",
    type: "blankets", quantity: 500, unit: "pcs",
    location: { lat: 9.9312, lng: 76.2673, zoneName: "Ernakulam North Camp" },
    status: "available", timestamp: new Date(Date.now() - 3600000).toISOString(),
    dedupFlag: "clear",
  },
  {
    id: "r2", agencyId: "ag2", agencyName: "Kerala State SDRF", agencyType: "STATE",
    type: "blankets", quantity: 480, unit: "pcs",
    location: { lat: 9.9350, lng: 76.2700, zoneName: "Ernakulam North Relief Point" },
    status: "available", timestamp: new Date(Date.now() - 3500000).toISOString(),
    dedupFlag: "pending_review", dedupPairId: "dp1",
  },
  {
    id: "r3", agencyId: "ag6", agencyName: "Army Relief Column 2", agencyType: "ARMY",
    type: "boats", quantity: 12, unit: "units",
    location: { lat: 9.4981, lng: 76.3388, zoneName: "Alappuzha Backwaters" },
    status: "available", timestamp: new Date(Date.now() - 7200000).toISOString(),
    dedupFlag: "clear",
  },
  {
    id: "r4", agencyId: "ag4", agencyName: "HelpAge India", agencyType: "NGO",
    type: "medical_kits", quantity: 200, unit: "kits",
    location: { lat: 11.2588, lng: 75.7804, zoneName: "Kozhikode Relief Hub" },
    status: "available", timestamp: new Date(Date.now() - 1800000).toISOString(),
    dedupFlag: "clear",
  },
  {
    id: "r5", agencyId: "ag3", agencyName: "Aapda Mitra Unit 7", agencyType: "VOLUNTEER",
    type: "food_packets", quantity: 1000, unit: "pcs",
    location: { lat: 10.5276, lng: 76.2144, zoneName: "Thrissur District Camp" },
    status: "available", timestamp: new Date(Date.now() - 900000).toISOString(),
    dedupFlag: "clear",
  },
  {
    id: "r6", agencyId: "ag2", agencyName: "Kerala State SDRF", agencyType: "STATE",
    type: "tents", quantity: 80, unit: "units",
    location: { lat: 9.9200, lng: 76.2500, zoneName: "Ernakulam South Camp" },
    status: "dispatched", timestamp: new Date(Date.now() - 5400000).toISOString(),
    dedupFlag: "clear",
  },
];

export const NEEDS: Need[] = [
  {
    id: "n1", agencyId: "ag4", agencyName: "HelpAge India",
    type: "blankets", quantity: 200, unit: "pcs",
    location: { lat: 9.9410, lng: 76.2750, zoneName: "Perumbavoor Relief Camp" },
    urgency: "critical", status: "open",
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "n2", agencyId: "ag3", agencyName: "Aapda Mitra Unit 7",
    type: "medical_kits", quantity: 50, unit: "kits",
    location: { lat: 10.5300, lng: 76.2100, zoneName: "Thrissur North Village" },
    urgency: "high", status: "open",
    timestamp: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "n3", agencyId: "ag1", agencyName: "NDRF Battalion 4",
    type: "boats", quantity: 3, unit: "units",
    location: { lat: 9.5100, lng: 76.3500, zoneName: "Alappuzha Flood Zone C" },
    urgency: "critical", status: "matched", matchedResourceId: "r3",
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    approvedBy: "ag5", approvedAt: new Date(Date.now() - 2700000).toISOString(),
  },
];

export const DEDUP_FLAGS: DedupFlag_[] = [
  {
    id: "dp1",
    resourceId1: "r1",
    resourceId2: "r2",
    score: 0.87,
    status: "pending",
  },
];

export const AUDIT_LOG: AuditEntry[] = [
  {
    id: "a1", timestamp: new Date(Date.now() - 7200000).toISOString(),
    action: "RESOURCE_REPORTED", actorId: "ag6", actorName: "Army Relief Column 2", actorRole: "coordinator",
    resourceId: "r3", detail: "Reported 12 rescue boats at Alappuzha Backwaters",
  },
  {
    id: "a2", timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: "RESOURCE_REPORTED", actorId: "ag1", actorName: "NDRF Battalion 4", actorRole: "coordinator",
    resourceId: "r1", detail: "Reported 500 blankets at Ernakulam North Camp",
  },
  {
    id: "a3", timestamp: new Date(Date.now() - 3500000).toISOString(),
    action: "DEDUP_FLAGGED", actorId: "system", actorName: "AAPDA SETU Engine", actorRole: "field",
    resourceId: "r2", dedupId: "dp1", detail: "Possible duplicate detected (score 0.87): blankets at nearby zone. Routed to DM for review.",
  },
  {
    id: "a4", timestamp: new Date(Date.now() - 2700000).toISOString(),
    action: "ALLOCATION_APPROVED", actorId: "ag5", actorName: "District Magistrate", actorRole: "dm",
    resourceId: "r3", needId: "n3", detail: "Approved allocation of 3 boats from Alappuzha to Flood Zone C. Dispatched.",
  },
];

export const MATCH_PROPOSALS: MatchProposal[] = [
  {
    id: "mp1", needId: "n1", resourceId: "r1",
    distanceKm: 1.2, urgencyScore: 0.95, totalScore: 0.91,
    status: "proposed",
  },
  {
    id: "mp2", needId: "n2", resourceId: "r4",
    distanceKm: 89, urgencyScore: 0.78, totalScore: 0.61,
    status: "proposed",
  },
];
