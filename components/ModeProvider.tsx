"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type AppMode = "student" | "engineer";

type ModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
};

const STORAGE_KEY = "calcline-web-mode";
const MODE_CHANGE_EVENT = "calcline-web-mode-change";
const ModeContext = createContext<ModeContextValue | undefined>(undefined);

type ModeProviderProps = {
  children: ReactNode;
};

export function ModeProvider({ children }: ModeProviderProps) {
  const mode = useSyncExternalStore(
    subscribeToMode,
    getStoredMode,
    getDefaultMode,
  );

  function setMode(nextMode: AppMode) {
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    window.dispatchEvent(new Event(MODE_CHANGE_EVENT));
  }

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useAppMode() {
  const context = useContext(ModeContext);

  if (!context) {
    throw new Error("useAppMode must be used within ModeProvider.");
  }

  return context;
}

function subscribeToMode(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(MODE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(MODE_CHANGE_EVENT, onStoreChange);
  };
}

function getStoredMode(): AppMode {
  const storedMode = window.localStorage.getItem(STORAGE_KEY);

  if (storedMode === "student" || storedMode === "engineer") {
    return storedMode;
  }

  return getDefaultMode();
}

function getDefaultMode(): AppMode {
  return "student";
}
