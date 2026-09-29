// AAPDA SETU — Multilingual support
// Languages: English, Hindi, Malayalam

export type Lang = "en" | "hi" | "ml";

export const LANGUAGES: { code: Lang; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
];

type Translations = Record<string, Record<Lang, string>>;

export const T: Translations = {
  // App
  appName: { en: "AAPDA SETU", hi: "आपदा सेतु", ml: "ആപദ സേതു" },
  appTagline: {
    en: "Disaster Resource Deduplication & Needs-Matching",
    hi: "आपदा संसाधन डी-डुप्लीकेशन और ज़रूरत-मिलान मंच",
    ml: "ദുരന്ത വിഭവ ഡി-ഡ്യൂപ്ലിക്കേഷൻ & ആവശ്യ-മാചിങ് പ്ലാറ്റ്ഫോം",
  },

  // Nav
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड", ml: "ഡാഷ്‌ബോർഡ്" },
  reportResource: { en: "Report Resource", hi: "संसाधन रिपोर्ट करें", ml: "വിഭവം റിപ്പോർട്ട് ചെയ്യുക" },
  reportNeed: { en: "Report Need", hi: "ज़रूरत रिपोर्ट करें", ml: "ആവശ്യം റിപ്പോർട്ട് ചെയ്യുക" },
  auditLog: { en: "Audit Log", hi: "ऑडिट लॉग", ml: "ഓഡിറ്റ് ലോഗ്" },
  login: { en: "Login", hi: "लॉगिन करें", ml: "ലോഗിൻ ചെയ്യുക" },
  logout: { en: "Logout", hi: "लॉगआउट", ml: "ലോഗൗട്ട്" },

  // Dashboard
  sharedInventory: { en: "Shared Inventory", hi: "साझा इन्वेंटरी", ml: "പൊതു ഇൻവെന്ററി" },
  pendingReview: { en: "Pending DM Review", hi: "DM समीक्षा हेतु लंबित", ml: "DM അവലോകനം ആവശ്യമുള്ളവ" },
  openNeeds: { en: "Open Needs", hi: "खुली ज़रूरतें", ml: "തുറന്ന ആവശ്യങ്ങൾ" },
  activeAgencies: { en: "Active Agencies", hi: "सक्रिय एजेंसियां", ml: "സജീവ ഏജൻസികൾ" },
  dedupAlerts: { en: "Dedup Alerts", hi: "डुप्लीकेट अलर्ट", ml: "ഡ്യൂപ്ലിക്കേഷൻ അലേർട്ടുകൾ" },
  matchProposals: { en: "Match Proposals", hi: "मिलान प्रस्ताव", ml: "മാചിങ് നിർദ്ദേശങ്ങൾ" },

  // Resource form
  zone: { en: "Zone / Location", hi: "क्षेत्र / स्थान", ml: "മേഖല / സ്ഥലം" },
  resourceType: { en: "Resource Type", hi: "संसाधन प्रकार", ml: "വിഭവ തരം" },
  quantity: { en: "Quantity", hi: "मात्रा", ml: "അളവ്" },
  submit: { en: "Submit Report", hi: "रिपोर्ट जमा करें", ml: "റിപ്പോർട്ട് സമർപ്പിക്കുക" },
  submitting: { en: "Submitting…", hi: "जमा हो रहा है…", ml: "സമർപ്പിക്കുന്നു…" },

  // Status
  available: { en: "Available", hi: "उपलब्ध", ml: "ലഭ്യം" },
  dispatched: { en: "Dispatched", hi: "भेजा गया", ml: "അയച്ചു" },
  reserved: { en: "Reserved", hi: "आरक्षित", ml: "റിസർവ്ഡ്" },
  clear: { en: "Verified", hi: "सत्यापित", ml: "സ്ഥിരീകരിച്ചു" },
  pending_review: { en: "⚠ Dedup Pending", hi: "⚠ डी-डुप समीक्षा बाकी", ml: "⚠ ഡ്യൂപ് അവലോകനം ബാക്കി" },
  merged: { en: "Merged", hi: "विलीन", ml: "ലയിപ്പിച്ചു" },
  kept_separate: { en: "Kept Separate", hi: "अलग रखा गया", ml: "വേർതിരിച്ചു" },

  // Urgency
  critical: { en: "Critical", hi: "अति आवश्यक", ml: "അടിയന്തിരം" },
  high: { en: "High", hi: "उच्च", ml: "ഉയർന്നത്" },
  medium: { en: "Medium", hi: "मध्यम", ml: "മധ്യമം" },
  low: { en: "Low", hi: "कम", ml: "കുറവ്" },

  // Actions
  approve: { en: "Approve & Dispatch", hi: "स्वीकृत करें और भेजें", ml: "അംഗീകരിക്കുക & അയക്കുക" },
  reject: { en: "Reject / Re-match", hi: "अस्वीकार / फिर मिलान करें", ml: "നിരസിക്കുക / വീണ്ടും മാചുചെയ്യുക" },
  merge: { en: "Merge (Same Resource)", hi: "विलीन करें (एक ही संसाधन)", ml: "ലയിപ്പിക്കുക (ഒരേ വിഭവം)" },
  keepSeparate: { en: "Keep Separate", hi: "अलग रखें", ml: "വേർതിരിക്കുക" },

  // Misc
  noData: { en: "No data yet", hi: "अभी कोई डेटा नहीं", ml: "ഇതുവരെ ഡാറ്റ ഇല്ല" },
  loading: { en: "Loading…", hi: "लोड हो रहा है…", ml: "ലോഡ് ചെയ്യുന്നു…" },
  score: { en: "Dedup Score", hi: "डी-डुप स्कोर", ml: "ഡ്യൂപ് സ്കോർ" },
  distanceKm: { en: "Distance (km)", hi: "दूरी (किमी)", ml: "ദൂരം (കി.മീ)" },
  verifiedBy: { en: "Verified by", hi: "द्वारा सत्यापित", ml: "ആരു സ്ഥിരീകരിച്ചു" },
  agency: { en: "Agency", hi: "एजेंसी", ml: "ഏജൻസി" },
  dmReviewRequired: {
    en: "DM / Tehsildar review required before any action",
    hi: "किसी भी कार्रवाई से पहले DM/तहसीलदार की समीक्षा ज़रूरी है",
    ml: "ഏതൊരു നടപടിക്കും മുമ്പ് DM/തഹസിൽദാർ അവലോകനം ആവശ്യമാണ്",
  },
  offlineBanner: {
    en: "📡 Offline — reports queued locally, will sync when connected",
    hi: "📡 ऑफलाइन — रिपोर्ट स्थानीय रूप से कतारबद्ध, कनेक्ट होने पर सिंक होगी",
    ml: "📡 ഓഫ്‌ലൈൻ — റിപ്പോർട്ടുകൾ ലോക്കലി ക്യൂ ചെയ്തു, കണക്‌റ്റ് ആകുമ്പോൾ സിങ്ക് ആകും",
  },
};

export function t(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.["en"] ?? key;
}
