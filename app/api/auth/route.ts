import { NextRequest, NextResponse } from "next/server";
import { AGENCIES } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agencyId } = body;

  const agency = AGENCIES.find((a) => a.id === agencyId);
  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  return NextResponse.json({ agency, success: true });
}

export function GET() {
  return NextResponse.json({ agencies: AGENCIES });
}
