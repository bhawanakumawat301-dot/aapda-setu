"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangContext";
import { useAuth } from "@/components/AuthContext";
import { t } from "@/lib/i18n";
import { AlertTriangle, CheckCircle, Package, MapPin } from "lucide-react";

const RESOURCE_TYPES = [
  "blankets", "food_packets", "water_cans", "medical_kits",
  "boats", "tents", "generators", "medicine", "rescue_personnel", "vehicles",
];

const RESOURCE_LABELS: Record<string, Record<string, string>> = {
  blankets:          { en: "🛏 Blankets",            hi: "🛏 कंबल",           ml: "🛏 പുതപ്പ്" },
  food_packets:      { en: "🍱 Food Packets",         hi: "🍱 खाद्य पैकेट",    ml: "🍱 ഭക്ഷ്യ പൊതി" },
  water_cans:        { en: "💧 Water Cans",           hi: "💧 पानी के डिब्बे",  ml: "💧 വെള്ള ടിൻ" },
  medical_kits:      { en: "🏥 Medical Kits",         hi: "🏥 मेडिकल किट",     ml: "🏥 മെഡിക്കൽ കിറ്റ്" },
  boats:             { en: "⛵ Rescue Boats",          hi: "⛵ रेस्क्यू नौकाएं", ml: "⛵ ബോട്ടുകൾ" },
  tents:             { en: "⛺ Tents",                hi: "⛺ तम्बू",           ml: "⛺ ടെന്റ്" },
  generators:        { en: "⚡ Generators",            hi: "⚡ जनरेटर",         ml: "⚡ ജനറേറ്ററുകൾ" },
  medicine:          { en: "💊 Medicine",              hi: "💊 दवाइयां",         ml: "💊 മരുന്ന്" },
  rescue_personnel:  { en: "🦺 Rescue Personnel",     hi: "🦺 बचाव कर्मी",     ml: "🦺 രക്ഷാ ഉദ്യോഗ്ഗ" },
  vehicles:          { en: "🚛 Vehicles",              hi: "🚛 वाहन",            ml: "🚛 വാഹനങ്ങൾ" },
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

export default function ReportPage() {
  const { lang } = useLang();
  const { agency } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    type: "blankets",
    quantity: "100",
    unit: "pcs",
    zoneIndex: "0",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { isDuplicate: boolean; score: number; breakdown: Record<string, number> }>(null);
  const [error, setError] = useState("");

  if (!agency) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">{lang === "en" ? "Please login to report resources" : lang === "hi" ? "संसाधन रिपोर्ट करने के लिए लॉगिन करें" : "വിഭവം റിപ്പോർട്ട് ചെയ്യാൻ ലോഗിൻ ചെയ്യുക"}</p>
        <button onClick={() => router.push("/login")} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-600 transition-colors">
          {t("login", lang)}
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setError("");

    const location = DEMO_ZONES[parseInt(form.zoneIndex)];

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: agency!.id,
          type: form.type,
          quantity: parseInt(form.quantity),
          unit: form.unit,
          location,
        }),
      });
      const data = await res.json();
      setResult(data.dedupResult);
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 rounded-xl p-2.5">
            <Package size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">{t("reportResource", lang)}</h1>
            <p className="text-xs text-gray-500">{agency.name} · {agency.type}</p>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-4 mb-5 ${result.isDuplicate ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"}`}>
            {result.isDuplicate ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} className="text-amber-600" />
                  <p className="font-bold text-amber-800">
                    {lang === "en" ? "Possible Duplicate Detected!" : lang === "hi" ? "संभावित डुप्लीकेट पाया गया!" : "ഡ്യൂപ്ലിക്കേറ്റ് കണ്ടെത്തി!"}
                  </p>
                </div>
                <p className="text-xs text-amber-700 mb-3">
                  {lang === "en" ? "This report has been flagged (dedup score: " : lang === "hi" ? "यह रिपोर्ट फ्लैग हो गई (स्कोर: " : "ഈ റിപ്പോർട്ട് ഫ്ലാഗ് ചെയ്തു (സ്കോർ: "}
                  <strong>{Math.round(result.score * 100)}%</strong>
                  {"). DM/Tehsildar review required before any action."}
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {Object.entries(result.breakdown).map(([key, val]) => (
                    <div key={key} className="bg-white rounded-lg p-2">
                      <p className="text-xs text-gray-400 capitalize">{key}</p>
                      <p className="text-sm font-bold text-amber-700">{Math.round((val as number) * 100)}%</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <div>
                  <p className="font-bold text-green-800">
                    {lang === "en" ? "Added to Shared Inventory" : lang === "hi" ? "साझा इन्वेंटरी में जोड़ा गया" : "പൊതു ഇൻവെന്ററിയിൽ ചേർത്തു"}
                  </p>
                  <p className="text-xs text-green-700">
                    {lang === "en" ? "No duplicate found. Dedup score: " : lang === "hi" ? "कोई डुप्लीकेट नहीं मिला। स्कोर: " : "ഡ്യൂപ്ലിക്കേറ്റ് ഇല്ല. സ്കോർ: "}
                    {Math.round(result.score * 100)}%
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => { setResult(null); router.push("/"); }}
              className="mt-3 w-full bg-white border border-gray-200 text-gray-700 text-xs py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {lang === "en" ? "← Back to Dashboard" : lang === "hi" ? "← डैशबोर्ड पर वापस" : "← ഡാഷ്‌ബോർഡിലേക്ക്"}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Resource type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("resourceType", lang)}</label>
            <div className="grid grid-cols-2 gap-2">
              {RESOURCE_TYPES.map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: rt }))}
                  className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${
                    form.type === rt ? "border-blue-500 bg-blue-50 text-blue-800" : "border-gray-100 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {RESOURCE_LABELS[rt]?.[lang] || RESOURCE_LABELS[rt]?.en || rt}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("quantity", lang)}</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="pcs">pcs</option>
                <option value="kits">kits</option>
                <option value="units">units</option>
                <option value="litres">litres</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          {/* Zone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <span className="flex items-center gap-1"><MapPin size={13} />{t("zone", lang)}</span>
            </label>
            <select
              value={form.zoneIndex}
              onChange={(e) => setForm((f) => ({ ...f, zoneIndex: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {DEMO_ZONES.map((z, i) => (
                <option key={i} value={i}>{z.zoneName}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {lang === "en" ? "In production: auto-detected via GPS" : lang === "hi" ? "प्रोडक्शन में: GPS से स्वचालित" : "ഉൽ‌പ്പാദനത്തിൽ: GPS വഴി ഓട്ടോ"}
            </p>
          </div>

          {/* Dedup preview info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
            <strong>
              {lang === "en" ? "Dedup engine will check:" : lang === "hi" ? "डी-डुप इंजन जांचेगा:" : "ഡ്യൂപ് എഞ്ചിൻ പരിശോധിക്കും:"}
            </strong>{" "}
            {lang === "en" ? "Location (40%) + Type (35%) + Quantity (15%) + Time (10%)" :
             lang === "hi" ? "स्थान (40%) + प्रकार (35%) + मात्रा (15%) + समय (10%)" :
             "സ്ഥലം (40%) + തരം (35%) + അളവ് (15%) + സമയം (10%)"}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0a2342] hover:bg-[#0d2d56] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
          >
            {submitting ? t("submitting", lang) : t("submit", lang)}
          </button>
        </form>
      </div>
    </div>
  );
}
