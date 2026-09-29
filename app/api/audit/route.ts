import { NextResponse } from "next/server";
import { AUDIT_LOG } from "@/lib/store";

let auditStore = [...AUDIT_LOG];

export function GET() {
  // Return sorted newest-first
  const sorted = [...auditStore].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return NextResponse.json({ audit: sorted });
}
