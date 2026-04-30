"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

type SetPersistentForm<T> = (next: T | ((current: T) => T)) => void;

const STORAGE_EVENT_PREFIX = "calcline-web-form-change:";

export function usePersistentForm<T extends object>(
  storageKey: string,
  defaultValue: T,
): [T, SetPersistentForm<T>, () => void] {
  const snapshot = useSyncExternalStore(
    (onStoreChange) => subscribe(storageKey, onStoreChange),
    () => getSnapshot(storageKey),
    () => "",
  );
  const form = useMemo(
    () => parseSnapshot(snapshot, defaultValue),
    [snapshot, defaultValue],
  );

  const setForm = useCallback<SetPersistentForm<T>>(
    (next) => {
      const current = parseSnapshot(getSnapshot(storageKey), defaultValue);
      const nextValue = typeof next === "function" ? next(current) : next;

      window.localStorage.setItem(storageKey, JSON.stringify(nextValue));
      dispatchChange(storageKey);
    },
    [defaultValue, storageKey],
  );

  const resetForm = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    dispatchChange(storageKey);
  }, [storageKey]);

  return [form, setForm, resetForm];
}

function subscribe(storageKey: string, onStoreChange: () => void) {
  const eventName = eventNameFor(storageKey);

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(eventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(eventName, onStoreChange);
  };
}

function getSnapshot(storageKey: string): string {
  return window.localStorage.getItem(storageKey) ?? "";
}

function parseSnapshot<T extends object>(snapshot: string, defaultValue: T): T {
  if (!snapshot) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(snapshot) as Partial<T>;

    return {
      ...defaultValue,
      ...parsed,
    };
  } catch {
    return defaultValue;
  }
}

function dispatchChange(storageKey: string) {
  window.dispatchEvent(new Event(eventNameFor(storageKey)));
}

function eventNameFor(storageKey: string) {
  return `${STORAGE_EVENT_PREFIX}${storageKey}`;
}
