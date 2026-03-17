import { useState, useEffect } from "react";
import { policyFinder } from "@/shared/logic/policyFinder";

export function usePrivacyScan() {
  const [loading, setLoading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    const checkScannedState = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      const currentUrl = tab?.url || "";

      const result = await chrome.storage.local.get([
        "hasScanned",
        "scannedUrl",
        "dataCollectionAnswers",
        "dataCollectionUrl",
        "aiUsageResult",
      ]);

      const urlMatches = result.scannedUrl === currentUrl;

      if (result.hasScanned && urlMatches) {
        setHasScanned(true);
      } else if (result.scannedUrl && result.scannedUrl !== currentUrl) {
        chrome.storage.local.remove(["hasScanned", "scannedUrl"]);
      }
    };

    checkScannedState();
  }, []);

  const scan = async () => {
    setHasScanned(true);
    setLoading(true);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });

      if (!tab?.id) {
        console.error("No active tab found.");
        setLoading(false);
        return;
      }

      const currentUrl = tab.url || "";

      chrome.storage.local.set({
        hasScanned: true,
        scannedUrl: currentUrl,
        dataCollectionLoading: true,
        aiUsageResult: { status: "loading" },
      });

      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: policyFinder,
      });

      await chrome.runtime.sendMessage({
        type: "POLICY_PAGE",
        data: result,
        tabId: tab.id,
      });
    } catch (err) {
      console.error("Scan error:", err);
    }

    setLoading(false);
  };

  return { scan, loading, hasScanned };
}

