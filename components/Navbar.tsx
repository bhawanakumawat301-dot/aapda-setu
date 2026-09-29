"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "./LangContext";
import { useAuth } from "./AuthContext";
import { t, LANGUAGES } from "@/lib/i18n";
import { Shield, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { lang, setLang } = useLang();
  const { agency, setAgency } = useAuth();
  const pathname = usePathname();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const nav = [
    { href: "/", label: t("dashboard", lang) },
    { href: "/report", label: t("reportResource", lang) },
    { href: "/needs", label: t("reportNeed", lang) },
    { href: "/audit", label: t("auditLog", lang) },
  ];

  return (
    <>
      {!online && (
        <div className="bg-amber-500 text-white text-center text-sm py-1.5 px-4 flex items-center justify-center gap-2 font-medium">
          <WifiOff size={14} /> {t("offlineBanner", lang)}
        </div>
      )}
      <nav className="bg-[#0a2342] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-wide">
            <Shield size={22} className="text-orange-400" />
            <span className="text-orange-400">{t("appName", lang)}</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1 flex-wrap">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname === n.href
                    ? "bg-orange-500 text-white"
                    : "hover:bg-white/10 text-white/80"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as typeof lang)}
              className="bg-white/10 text-white text-xs rounded px-2 py-1 border border-white/20 cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#0a2342]">
                  {l.nativeLabel}
                </option>
              ))}
            </select>

            {/* User */}
            {agency ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-orange-300">{agency.name}</p>
                  <p className="text-xs text-white/60 capitalize">{agency.role} · {agency.type}</p>
                </div>
                <button
                  onClick={() => setAgency(null)}
                  className="bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded transition-colors"
                >
                  {t("logout", lang)}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              >
                {t("login", lang)}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
