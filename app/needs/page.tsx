"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangContext";
import { useAuth } from "@/components/AuthContext";
import { t } from "@/lib/i18n";
import { TrendingUp, MapPin, CheckCircle } from "lucide-react";

const RESOURCE_TYPES = [
  "blankets", "food_packets", "water_cans", "medical_kits",
  "boats", "tents", "generators", "medicine", "rescue_personnel", "vehicles",
];

const RESOURCE_LABELS: Record<string, Record<string, string>> = {
  blankets:         { en: "🛏 Blankets",           hi: "🛏 कंबल",         ml: "🛏 പുതപ്പ്" },
  food_packets:     { en: "🍱 Food Packets",        hi: "🍱 खाद्य पैकेट",  ml: "🍱 ഭക്ഷ്യ പൊതി" },
  water_cans:       { en: "💧 Water Cans",          hi: "💧 पानी के डिब्बे",ml: "💧 വെള്ള ടിൻ" },
  medical_kits:     { en: "🏥 Medical Kits",        hi: "🏥 मेडिकल किट",   ml: "🏥 മെഡിക്കൽ കിറ്റ്" },
  boats:            { en: "⛵ Rescue Boats",         hi: "⛵ रेस्क्यू नौकाएं",ml: "⛵ ബോട്ടുകൾ" },
  tents:            { en: "⛺ Tents",               hi: "⛺ तम्बू",         ml: "⛺ ടെന്റ്" },
  generators:       { en: "⚡ Generators",           hi: "⚡ जनरेटर",       ml: "⚡ ജനറേറ്ററുകൾ" },
  medicine:         { en: "💊 Medicine",             hi: "💊 दवाइयां",       ml: "💊 മരുന്ന്" },
  rescue_personnel: { en: "🦺 Rescue Personnel",    hi: "🦺 बचाव कर्मी",   ml: "🦺 രക്ഷാ ഉദ്യോഗ്ഗ" },
  vehicles:         { en: "🚛 Vehicles",             hi: "🚛 वाहन",          ml: "🚛 വാഹനങ്ങൾ" },
};

const DEMO_ZONES = [
  { lat: 9.9312, lng: 76.2673, zoneName: "Ernakulam North Camp" },
  { lat: 9.9350, lng: 76.2700, zoneName: "Ernakulam North Relief Point" },
  { lat: 9.4981, lng: 76.3388, zoneName: "Alappuzha Backwaters" },
  { lat: 11.2588, lng: 75.7804, zoneName: "Kozhikode Relief Hub" },
  { lat: 10.5276, lng: 76.2144, zoneName: "Thrissur District Camp" },
  { lat: 9.9200, lng: 76.2500, zoneName: "Ernakulam South Camp" },
  { lat: 10.0100, lng: 76.3200, zoneName: "Perumbavoor Relief Camp" },
  { lat: 8.5241, lng: 76.9366, zoneName: "Thiruvananthapuram Zone A" },
];

type Urgency = "critical" | "high" | "medium" | "low";

const URGENCY_LABELS: Record<Urgency, Record<string, string>> = {
  critical: { en: "🔴 Critical", hi: "🔴 अति आवश्यक", ml: "🔴 അടിയന്തിരം" },
  high:     { en: "🟠 High",    hi: "🟠 उच्च",        ml: "🟠 ഉയർന്നത്" },
  medium:   { en: "🟡 Medium",  hi: "🟡 मध्यम",       ml: "🟡 മധ്യമം" },
  low:      { en: "🟢 Low",     hi: "🟢 कम",          ml: "🟢 കുറവ്" },
};

interface MatchResult {
  resource: { agencyName: string; location: { zoneName: string }; quantity: number; unit: string };
  distanceKm: number;
  urgencyScore: number;
  totalScore: number;
}

export default function NeedsPage() {
  const { lang } = useLang();
  const { agency } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ type: "blankets", quantity: "50", unit: "pcs", zoneIndex: "6", urgency: "critical" as Urgency });
  const [submitting, setSubmitting] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!agency) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">{lang === "en" ? "Please login to report needs" : lang === "hi" ? "ज़रूरत रिपोर्ट करने के लिए लॉगिन करें" : "ആവശ്യം റിപ്പോർട്ട് ചെയ്യാൻ ലോഗിൻ ചെയ്യുക"}</p>
        <button onClick={() => router.push("/login")} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold">{t("login", lang)}</button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMatches([]);
    const location = DEMO_ZONES[parseInt(form.zoneIndex)];
    const res = await fetch("/api/needs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agencyId: agency!.id, type: form.type, quantity: parseInt(form.quantity), unit: form.unit, location, urgency: form.urgency }),
    });
    const data = await res.json();
    setMatches(data.matches || []);
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 rounded-xl p-2.5"><TrendingUp size={22} className="text-red-600" /></div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">{t("reportNeed", lang)}</h1>
            <p className="text-xs text-gray-500">{agency.name} · {agency.type}</p>
          </div>
        </div>

        {submitted && (
          <div className={`rounded-xl p-4 mb-5 ${matches.length > 0 ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
            {matches.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-600" />
                  <p className="font-bold text-green-800">
                    {lang === "en" ? `${matches.length} Match(es) Found — Proposals sent to DM` :
                     lang === "hi" ? `${matches.length} मिलान मिले — DM को प्रस्ताव भेजे गए` :
                     `${matches.length} മാചുകൾ കണ്ടെത്തി — DM-ക്ക് നിർദ്ദേശം അയച്ചു`}
                  </p>
                </div>
                <div className="space-y-2">
                  {matches.slice(0, 3).map((m, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-green-100">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-gray-700">#{i + 1} {m.resource.agencyName}</span>
                        <span className="text-green-700">Score: {Math.round(m.totalScore * 100)}%</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                        <span>📍 {m.resource.location.zoneName}</span>
                        <span>📏 {m.distanceKm} km</span>
                        <span>📦 {m.resource.quantity} {m.resource.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-green-700 mt-2 font-medium">
                  {lang === "en" ? "Awaiting DM/Tehsildar approval before dispatch" :
                   lang === "hi" ? "भेजने से पहले DM/तहसीलदार की मंजूरी का इंतजार" :
                   "അയക്കുന്നതിന് മുമ്പ് DM/തഹസിൽദാർ അനുമതി കാത്തിരിക്കുന്നു"}
                </p>
              </>
            ) : (
              <p className="text-sm text-yellow-800 font-semibold">
                {lang === "en" ? "No matching resources found. Need logged — will re-check as inventory updates." :
                 lang === "hi" ? "कोई मिलान संसाधन नहीं मिला। ज़रूरत लॉग की गई।" :
                 "മാചിങ് വിഭവങ്ങൾ ഇല്ല. ആവശ്യം ലോഗ് ചെയ്തു."}
              </p>
            )}
            <button onClick={() => { setSubmitted(false); router.push("/"); }} className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700 py-1">
              ← {lang === "en" ? "Back to Dashboard" : lang === "hi" ? "डैशबोर्ड पर वापस" : "ഡാഷ്‌ബോർഡിലേക്ക്"}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Resource type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("resourceType", lang)}</label>
            <div className="grid grid-cols-2 gap-2">
              {RESOURCE_TYPES.map((rt) => (
                <button key={rt} type="button" onClick={() => setForm((f) => ({ ...f, type: rt }))}
                  className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${form.type === rt ? "border-red-500 bg-red-50 text-red-800" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}>
                  {RESOURCE_LABELS[rt]?.[lang] || RESOURCE_LABELS[rt]?.en || rt}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {lang === "en" ? "Urgency" : lang === "hi" ? "तात्कालिकता" : "അടിയന്തിരത"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["critical", "high", "medium", "low"] as Urgency[]).map((u) => (
                <button key={u} type="button" onClick={() => setForm((f) => ({ ...f, urgency: u }))}
                  className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${form.urgency === u ? "border-red-500 bg-red-50" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}>
                  {URGENCY_LABELS[u][lang] || URGENCY_LABELS[u].en}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("quantity", lang)}</label>
            <div className="flex gap-2">
              <input type="number" min="1" required value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              <select value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
                <option value="pcs">pcs</option><option value="kits">kits</option><option value="units">units</option>
              </select>
            </div>
          </div>

          {/* Zone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <span className="flex items-center gap-1"><MapPin size={13} />{t("zone", lang)}</span>
            </label>
            <select value={form.zoneIndex} onChange={(e) => setForm((f) => ({ ...f, zoneIndex: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
              {DEMO_ZONES.map((z, i) => <option key={i} value={i}>{z.zoneName}</option>)}
            </select>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
            {submitting ? t("submitting", lang) : t("submit", lang)}
          </button>
        </form>
      </div>
    </div>
  );
}
