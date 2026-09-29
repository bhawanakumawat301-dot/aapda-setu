"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LangContext";
import { t } from "@/lib/i18n";
import { AuditEntry } from "@/lib/store";
import { Shield, Clock, User } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  RESOURCE_REPORTED: "bg-blue-100 text-blue-800",
  NEED_REPORTED: "bg-purple-100 text-purple-800",
  DEDUP_FLAGGED: "bg-amber-100 text-amber-800",
  DEDUP_MERGED: "bg-orange-100 text-orange-800",
  DEDUP_KEPT_SEPARATE: "bg-gray-100 text-gray-700",
  ALLOCATION_APPROVED: "bg-green-100 text-green-800",
  ALLOCATION_REJECTED: "bg-red-100 text-red-800",
};

const ACTION_ICONS: Record<string, string> = {
  RESOURCE_REPORTED: "📦",
  NEED_REPORTED: "🆘",
  DEDUP_FLAGGED: "⚠️",
  DEDUP_MERGED: "🔗",
  DEDUP_KEPT_SEPARATE: "✌️",
  ALLOCATION_APPROVED: "✅",
  ALLOCATION_REJECTED: "❌",
};

export default function AuditPage() {
  const { lang } = useLang();
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => { setAudit(d.audit || []); setLoading(false); });
  }, []);

  function formatTime(ts: string) {
    const d = new Date(ts);
    return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">{t("loading", lang)}</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gray-100 rounded-xl p-2.5"><Shield size={22} className="text-gray-600" /></div>
        <div>
          <h1 className="font-bold text-gray-800 text-lg">{t("auditLog", lang)}</h1>
          <p className="text-xs text-gray-500">
            {lang === "en" ? "Immutable append-only trail — every action attributed to a named officer" :
             lang === "hi" ? "अपरिवर्तनीय लॉग — प्रत्येक कार्रवाई एक नामित अधिकारी को जिम्मेदार" :
             "മാറ്റമില്ലാത്ത ലോഗ് — ഓരോ നടപടിയും ഒരു ഉദ്യോഗ്ഗസ്ഥനോട് ആരോപിക്കപ്പെടുന്നു"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: lang === "en" ? "Total Events" : lang === "hi" ? "कुल घटनाएं" : "ആകെ സംഭവങ്ങൾ", value: audit.length },
          { label: lang === "en" ? "Dedup Flags" : lang === "hi" ? "डुप्लीकेट फ्लैग" : "ഡ്യൂപ് ഫ്ലാഗ്", value: audit.filter(a => a.action === "DEDUP_FLAGGED").length },
          { label: lang === "en" ? "Approvals" : lang === "hi" ? "अनुमोदन" : "അംഗീകാരങ്ങൾ", value: audit.filter(a => a.action === "ALLOCATION_APPROVED").length },
          { label: lang === "en" ? "Dispatches" : lang === "hi" ? "भेजे गए" : "അയക്കൽ", value: audit.filter(a => a.action === "ALLOCATION_APPROVED").length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
        <div className="space-y-3">
          {audit.length === 0 ? (
            <div className="text-center text-gray-400 py-12">{t("noData", lang)}</div>
          ) : (
            audit.map((entry) => (
              <div key={entry.id} className="relative flex gap-4 pl-14">
                {/* Timeline dot */}
                <div className="absolute left-4 top-3 w-4 h-4 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-[10px]">
                  {ACTION_ICONS[entry.action] || "•"}
                </div>

                <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ACTION_COLORS[entry.action] || "bg-gray-100 text-gray-600"}`}>
                        {entry.action.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mt-2">{entry.detail}</p>

                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <User size={11} />
                    <span>
                      {entry.actorName === "AAPDA SETU Engine"
                        ? (lang === "en" ? "🤖 System (Dedup Engine)" : lang === "hi" ? "🤖 सिस्टम (डी-डुप इंजन)" : "🤖 സിസ്റ്റം (ഡ്യൂപ് എഞ്ചിൻ)")
                        : `${entry.actorName} (${entry.actorRole})`}
                    </span>
                  </div>

                  {/* IDs */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {entry.resourceId && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono">res:{entry.resourceId}</span>}
                    {entry.needId && <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-mono">need:{entry.needId}</span>}
                    {entry.dedupId && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-mono">dedup:{entry.dedupId}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
