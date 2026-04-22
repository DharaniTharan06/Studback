"use client";
import { useMemo, useSyncExternalStore } from "react";
function createObjectUrlStore(file: File | null) {
  let url: string | undefined;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => url,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (file && !url) {
        url = URL.createObjectURL(file);
        listeners.forEach((notify) => notify());
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size && url) {
          URL.revokeObjectURL(url);
          url = undefined;
        }
      };
    },
  };
}
export function useObjectUrl(file: File | null) {
  const store = useMemo(() => createObjectUrlStore(file), [file]);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => undefined
  );
}
