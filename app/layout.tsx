import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LangProvider } from "@/components/LangContext";
import { AuthProvider } from "@/components/AuthContext";

export const metadata: Metadata = {
  title: "AAPDA SETU — Disaster Relief Platform",
  description: "Multi-Agency Resource Deduplication & Needs-Matching for Indian Disaster Response",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "#080b12", color: "#e2e8f0" }}>
        <AuthProvider>
          <LangProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
          <footer className="text-center text-xs text-gray-500 py-6 mt-10 border-t border-gray-800">
              AAPDA SETU · Smart India Hackathon 2026 · PS S4 · Team Suraksha-x
            </footer>
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
