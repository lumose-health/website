"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { PROVIDERS } from "@/data/providers";
import type { AiProvider } from "@/data/providers";

type ProviderSelection = {
  provider: AiProvider;
  setProvider: (provider: AiProvider) => void;
};

const ProviderContext = createContext<ProviderSelection | null>(null);

/** Held above the sections, because the browser demo shows the same choice. */
export function ProviderSelectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const value = useMemo(() => ({ provider, setProvider }), [provider]);

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProviderSelection() {
  const selection = useContext(ProviderContext);
  if (!selection) {
    throw new Error(
      "useProviderSelection needs a ProviderSelectionProvider above it",
    );
  }
  return selection;
}
