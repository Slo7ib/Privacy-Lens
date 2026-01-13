import { useState, useEffect } from "react";
import type { AIStorageState } from "@/shared/types/AIStorageState";

export function useUsageAndSharing() {
  const [usageState, setUsageState] = useState<AIStorageState | null>(null);

  useEffect(() => {
    chrome.storage.local.get(["aiUsageResult"]).then((result) => {
      setUsageState((result.aiUsageResult as AIStorageState) ?? null);
    });

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string,
    ) => {
      if (area === "local" && changes.aiUsageResult) {
        setUsageState(changes.aiUsageResult.newValue as AIStorageState);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return usageState;
}

