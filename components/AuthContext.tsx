"use client";
import React, { createContext, useContext, useState } from "react";
import { Agency } from "@/lib/store";

interface AuthCtx {
  agency: Agency | null;
  setAgency: (a: Agency | null) => void;
}

const AuthContext = createContext<AuthCtx>({ agency: null, setAgency: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [agency, setAgency] = useState<Agency | null>(null);
  return (
    <AuthContext.Provider value={{ agency, setAgency }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
