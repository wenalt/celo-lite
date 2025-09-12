// utils/useAnalytics.js
import { useCallback } from "react";

export function useAnalytics() {
  const track = useCallback((event, props = {}) => {
    try {
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event, props, at: Date.now() }),
      }).catch(() => {});
    } catch {}
  }, []);
  return { track };
}
