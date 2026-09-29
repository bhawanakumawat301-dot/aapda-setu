"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useLang } from "@/components/LangContext";
import { t } from "@/lib/i18n";
import { Agency } from "@/lib/store";
import { Shield, CheckCircle, Lock } from "lucide-react";

const AGENCY_DESCRIPTIONS: Record<string, string> = {
  ag1: "NDRF · Coordinator",
  ag2: "State SDRF · Coordinator",
  ag3: "Volunteer · Field",
  ag4: "NGO · Field",
  ag5: "District Magistrate · DM Authority",
  ag6: "Army · Coordinator",
};

const AGENCY_COLORS: Record<string, string> = {
  NDRF: "bg-blue-100 text-blue-800 border-blue-200",
  STATE: "bg-green-100 text-green-800 border-green-200",
  VOLUNTEER: "bg-yellow-100 text-yellow-800 border-yellow-200",
  NGO: "bg-purple-100 text-purple-800 border-purple-200",
  ARMY: "bg-red-100 text-red-800 border-red-200",
};

export default function LoginPage() {
  const { setAgency } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<"select" | "verify" | "done">("select");
  const [verificationId, setVerificationId] = useState("");

  useEffect(() => {
    fetch("/api/auth").then((r) => r.json()).then((d) => setAgencies(d.agencies));
  }, []);

  const selectedAgency = agencies.find((a) => a.id === selected);

  async function handleVerify() {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1500)); // simulate API call
    setStep("done");
    setVerifying(false);
  }

  function handleLogin() {
    if (!selectedAgency) return;
    setAgency(selectedAgency);
    router.push("/");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0a2342] rounded-full mb-4">
            <Shield size={32} className="text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-[#0a2342]">{t("appName", lang)}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lang === "en" && "Identity-verified platform access"}
            {lang === "hi" && "पहचान-सत्यापित प्लेटफॉर्म एक्सेस"}
            {lang === "ml" && "ഐഡന്റിറ്റി-സ്ഥിരീകരിച്ച പ്ലാറ്റ്ഫോം ആക്സസ്"}
          </p>
        </div>

        {step === "select" && (
          <>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {lang === "en" ? "Select your agency" : lang === "hi" ? "अपनी एजेंसी चुनें" : "നിങ്ങളുടെ ഏജൻസി തിരഞ്ഞെടുക്കുക"}
            </label>
            <div className="space-y-2 mb-6">
              {agencies.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    selected === a.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-100 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{a.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{AGENCY_DESCRIPTIONS[a.id]}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${AGENCY_COLORS[a.type] || "bg-gray-100 text-gray-600"}`}>
                      {a.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <button
              disabled={!selected}
              onClick={() => setStep("verify")}
              className="w-full bg-[#0a2342] text-white font-semibold py-3 rounded-xl disabled:opacity-40 hover:bg-[#0d2d56] transition-colors"
            >
              {lang === "en" ? "Continue" : lang === "hi" ? "आगे बढ़ें" : "തുടരുക"}
            </button>
          </>
        )}

        {step === "verify" && selectedAgency && (
          <div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">
                {selectedAgency.type === "VOLUNTEER" || selectedAgency.type === "NGO"
                  ? "Aadhaar e-KYC Verification"
                  : "Government ID Verification"}
              </p>
              <p className="text-sm text-gray-700">{selectedAgency.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">ID: {selectedAgency.verificationId}</p>
            </div>

            {(selectedAgency.type === "VOLUNTEER") && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Aadhaar Last 4 Digits
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="XXXX"
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono tracking-widest"
                />
                <p className="text-xs text-gray-400 mt-1">Demo: enter any 4 digits</p>
              </div>
            )}
            {(selectedAgency.type === "NGO") && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  NGO Darpan Unique ID
                </label>
                <input
                  type="text"
                  placeholder="NGO-DPN-XX-XXXXXXX"
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Demo: pre-filled as {selectedAgency.verificationId}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 rounded-lg p-3">
              <Lock size={12} />
              <span>Identity verified against government registries (Aadhaar API / NGO Darpan). Role-based access enforced.</span>
            </div>

            <button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {verifying
                ? (lang === "en" ? "Verifying…" : lang === "hi" ? "सत्यापित हो रहा है…" : "സ്ഥിരീകരിക്കുന്നു…")
                : (lang === "en" ? "Verify & Login" : lang === "hi" ? "सत्यापित करें और लॉगिन करें" : "സ്ഥിരീകരിക്കുക & ലോഗിൻ")}
            </button>
            <button onClick={() => setStep("select")} className="w-full text-sm text-gray-500 mt-3 py-2 hover:text-gray-700">
              ← {lang === "en" ? "Back" : lang === "hi" ? "वापस" : "തിരികെ"}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {lang === "en" ? "Verified!" : lang === "hi" ? "सत्यापित!" : "സ്ഥിരീകരിച്ചു!"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">{selectedAgency?.name}</p>
            <button
              onClick={handleLogin}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              {lang === "en" ? "Enter Platform" : lang === "hi" ? "प्लेटफॉर्म में प्रवेश करें" : "പ്ലാറ്റ്ഫോം നൽകുക"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
