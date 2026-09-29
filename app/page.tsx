"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LangContext";
import { useAuth } from "@/components/AuthContext";
import { t } from "@/lib/i18n";
import { Resource, Need, DedupFlag_, MatchProposal } from "@/lib/store";
import Link from "next/link";
import {
  Package, AlertTriangle, CheckCircle, Users,
  ArrowRight, Clock, MapPin, Layers, TrendingUp, Shield
} from "lucide-react";

const RESOURCE_LABELS: Record<string, string> = {
  blankets: "🛏 Blankets", food_packets: "🍱 Food Packets", water_cans: "💧 Water Cans",
  medical_kits: "🏥 Medical Kits", boats: "⛵ Boats", tents: "⛺ Tents",
  generators: "⚡ Generators", medicine: "💊 Medicine", rescue_personnel: "🦺 Rescue Personnel", vehicles: "🚛 Vehicles",
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  dispatched: "bg-blue-100 text-blue-800",
  reserved: "bg-yellow-100 text-yellow-800",
  clear: "bg-green-100 text-green-700",
  pending_review: "bg-amber-100 text-amber-800",
  merged: "bg-gray-100 text-gray-600",
  kept_separate: "bg-purple-100 text-purple-700",
};

const URGENCY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function Dashboard() {
  const { lang } = useLang();
  const { agency } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [dedupFlags, setDedupFlags] = useState<DedupFlag_[]>([]);
  const [proposals, setProposals] = useState<MatchProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  async function load() {
    const [rRes, nRes] = await Promise.all([
      fetch("/api/resources").then((r) => r.json()),
      fetch("/api/needs").then((r) => r.json()),
    ]);
    setResources(rRes.resources || []);
    setDedupFlags(rRes.dedupFlags || []);
    setNeeds(nRes.needs || []);
    setProposals(nRes.proposals || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function resolveDedup(dedupId: string, decision: "merge" | "keep_separate") {
    if (!agency) return;
    setResolving(dedupId);
    await fetch("/api/resources", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dedupId, decision, reviewerId: agency.id }),
    });
    await load();
    setResolving(null);
  }

  async function resolveProposal(proposalId: string, decision: "approve" | "reject") {
    if (!agency) return;
    setApproving(proposalId);
    await fetch("/api/needs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId, decision, reviewerId: agency.id }),
    });
    await load();
    setApproving(null);
  }

  const available = resources.filter((r) => r.status === "available");
  const pendingDedup = dedupFlags.filter((f) => f.status === "pending");
  const openNeeds = needs.filter((n) => n.status === "open");
  const pendingProposals = proposals.filter((p) => p.status === "proposed");

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">{t("loading", lang)}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0a2342] to-[#1a3a6e] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={20} className="text-orange-400" />
              <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">
                Smart India Hackathon 2026 · PS S4
              </span>
            </div>
            <h1 className="text-2xl font-bold">{t("appName", lang)}</h1>
            <p className="text-sm text-white/70 mt-1 max-w-xl">{t("appTagline", lang)}</p>
          </div>
          {agency && (
            <div className="bg-white/10 rounded-xl px-4 py-3 text-right hidden sm:block">
              <p className="text-xs text-white/60">Logged in as</p>
              <p className="font-semibold text-sm">{agency.name}</p>
              <p className="text-xs text-orange-300 capitalize">{agency.role} · {agency.zone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("sharedInventory", lang), value: available.length, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: t("dedupAlerts", lang), value: pendingDedup.length, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: t("openNeeds", lang), value: openNeeds.length, icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" },
          { label: t("matchProposals", lang), value: pendingProposals.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${s.bg} mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* DM Section — Dedup Flags */}
      {pendingDedup.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="font-bold text-amber-800">
              {lang === "en" ? "⚠ Duplicate Flags — DM Review Required" :
               lang === "hi" ? "⚠ डुप्लीकेट अलर्ट — DM समीक्षा आवश्यक" :
               "⚠ ഡ്യൂപ്ലിക്കേറ്റ് ഫ്ലാഗുകൾ — DM അവലോകനം ആവശ്യം"}
            </h2>
          </div>
          <p className="text-xs text-amber-700 mb-4 flex items-center gap-1">
            <Shield size={12} /> {t("dmReviewRequired", lang)}
          </p>
          <div className="space-y-3">
            {pendingDedup.map((flag) => {
              const r1 = resources.find((r) => r.id === flag.resourceId1);
              const r2 = resources.find((r) => r.id === flag.resourceId2);
              if (!r1 || !r2) return null;
              return (
                <div key={flag.id} className="bg-white rounded-xl border border-amber-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-700 uppercase">
                      Dedup Score: {Math.round(flag.score * 100)}%
                    </span>
                    <div className="flex gap-1">
                      <div className="w-24 h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-amber-500 transition-all"
                          style={{ width: `${flag.score * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Side-by-side comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    {[r1, r2].map((r) => (
                      <div key={r.id} className={`rounded-lg p-3 ${r.id === r2.id ? "bg-amber-50 border border-amber-200" : "bg-blue-50 border border-blue-200"}`}>
                        <p className="font-bold text-gray-700">{r.agencyName}</p>
                        <p className="text-gray-500">{r.agencyType}</p>
                        <p className="mt-1">{RESOURCE_LABELS[r.type] || r.type} × {r.quantity}</p>
                        <p className="flex items-center gap-1 text-gray-500 mt-0.5">
                          <MapPin size={10} /> {r.location.zoneName}
                        </p>
                        <p className="flex items-center gap-1 text-gray-400 mt-0.5">
                          <Clock size={10} /> {new Date(r.timestamp).toLocaleTimeString()}
                        </p>
                        {r.id === r2.id && <p className="mt-1 text-amber-600 font-semibold">← Incoming report</p>}
                      </div>
                    ))}
                  </div>

                  {agency?.role === "dm" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => resolveDedup(flag.id, "merge")}
                        disabled={resolving === flag.id}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {resolving === flag.id ? "…" : t("merge", lang)}
                      </button>
                      <button
                        onClick={() => resolveDedup(flag.id, "keep_separate")}
                        disabled={resolving === flag.id}
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {resolving === flag.id ? "…" : t("keepSeparate", lang)}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
                      <Lock size={12} />
                      {lang === "en" ? "Only DM/Tehsildar can resolve this flag" :
                       lang === "hi" ? "केवल DM/तहसीलदार इस फ्लैग को हल कर सकते हैं" :
                       "DM/തഹസിൽദാർ മാത്രം ഇത് പരിഹരിക്കാൻ കഴിയൂ"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Match Proposals */}
      {pendingProposals.length > 0 && (
        <section className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-green-600" />
            <h2 className="font-bold text-green-800">
              {lang === "en" ? "Match Proposals — Awaiting DM Approval" :
               lang === "hi" ? "मिलान प्रस्ताव — DM अनुमोदन की प्रतीक्षा" :
               "മാചിങ് നിർദ്ദേശങ്ങൾ — DM അനുമതി കാത്തിരിക്കുന്നു"}
            </h2>
          </div>
          <div className="space-y-3">
            {pendingProposals.slice(0, 5).map((proposal) => {
              const need = needs.find((n) => n.id === proposal.needId);
              const resource = resources.find((r) => r.id === proposal.resourceId);
              if (!need || !resource) return null;
              return (
                <div key={proposal.id} className="bg-white rounded-xl border border-green-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        {RESOURCE_LABELS[need.type]} — {need.quantity} {need.unit}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> Need: {need.location.zoneName}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${URGENCY_COLORS[need.urgency]}`}>
                      {t(need.urgency, lang)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <p className="text-gray-400">Resource</p>
                      <p className="font-semibold text-gray-700 truncate">{resource.agencyName}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <p className="text-gray-400">Distance</p>
                      <p className="font-semibold text-blue-700">{proposal.distanceKm} km</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <p className="text-gray-400">Match Score</p>
                      <p className="font-semibold text-green-700">{Math.round(proposal.totalScore * 100)}%</p>
                    </div>
                  </div>
                  {agency?.role === "dm" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => resolveProposal(proposal.id, "approve")}
                        disabled={approving === proposal.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {approving === proposal.id ? "…" : t("approve", lang)}
                      </button>
                      <button
                        onClick={() => resolveProposal(proposal.id, "reject")}
                        disabled={approving === proposal.id}
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {approving === proposal.id ? "…" : t("reject", lang)}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
                      <Lock size={12} />
                      {lang === "en" ? "Login as District Magistrate to approve allocations" :
                       lang === "hi" ? "आवंटन अनुमोदित करने के लिए DM के रूप में लॉगिन करें" :
                       "അലോക്കേഷൻ അംഗീകരിക്കാൻ DM ആയി ലോഗിൻ ചെയ്യുക"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Shared Inventory */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            {t("sharedInventory", lang)}
          </h2>
          <Link href="/report" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            + {t("reportResource", lang)} <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid gap-3">
          {resources.slice(0, 8).map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-gray-800">{RESOURCE_LABELS[r.type] || r.type}</p>
                  <span className="text-xs font-bold text-gray-700">×{r.quantity} {r.unit}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>
                    {t(r.status, lang)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.dedupFlag]}`}>
                    {t(r.dedupFlag, lang)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users size={10} />{r.agencyName} ({r.agencyType})</span>
                  <span className="flex items-center gap-1"><MapPin size={10} />{r.location.zoneName}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{new Date(r.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      {!agency && (
        <div className="bg-[#0a2342] text-white rounded-2xl p-6 text-center">
          <Shield size={32} className="text-orange-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-1">
            {lang === "en" ? "Login to submit reports & approve allocations" :
             lang === "hi" ? "रिपोर्ट जमा करने और आवंटन अनुमोदन के लिए लॉगिन करें" :
             "റിപ്പോർട്ട് സമർപ്പിക്കാൻ & അലോക്കേഷൻ അംഗീകരിക്കാൻ ലോഗിൻ ചെയ്യുക"}
          </h3>
          <Link href="/login" className="inline-block mt-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
            {t("login", lang)}
          </Link>
        </div>
      )}
    </div>
  );
}

function Lock({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
