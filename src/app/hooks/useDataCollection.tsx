import { useEffect, useState, useCallback } from "react";
import type { CollectedCategory } from "../../logic/dataCategories";
import { dataCollectionItems } from "../../logic/dataCategories";

export function useDataCollection() {
  const [categories, setCategories] = useState<CollectedCategory[]>([]);
  // Start with loading true to show skeleton immediately when component mounts during scan
  const [loading, setLoading] = useState(true);

  // Optimized: Use Map for O(1) lookups instead of O(n) find() calls
  const updateCategories = useCallback((answers: Array<{ element: string; collected: boolean }>) => {
    // Create a Map for O(1) lookups
    const answersMap = new Map(answers.map((a) => [a.element, a.collected]));

    setCategories(
      dataCollectionItems.map((item) => ({
        ...item,
        collected: answersMap.get(item.element) ?? false,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkStorageAndUrl = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      const currentUrl = tab?.url || "";

      const result = await chrome.storage.local.get([
        "dataCollectionAnswers",
        "dataCollectionUrl",
        "dataCollectionLoading",
        "hasScanned",
        "scannedUrl",
      ]);

      // Priority 1: If we have answers for the current URL, use them
      if (
        result.dataCollectionAnswers &&
        Array.isArray(result.dataCollectionAnswers) &&
        result.dataCollectionUrl === currentUrl
      ) {
        updateCategories(result.dataCollectionAnswers);
        chrome.storage.local.remove(["dataCollectionLoading"]);
        return;
      }

      // Priority 2: If URL changed, clear old data
      if (result.dataCollectionUrl && result.dataCollectionUrl !== currentUrl) {
        chrome.storage.local.remove([
          "dataCollectionAnswers",
          "dataCollectionUrl",
          "hasScanned",
          "scannedUrl",
          "dataCollectionLoading",
        ]);
        setLoading(false);
        return;
      }

      // Priority 3: Check if a scan is in progress
      // If dataCollectionLoading is true OR hasScanned is true for current URL, show loading
      const isScanning =
        result.dataCollectionLoading === true ||
        (result.hasScanned === true && result.scannedUrl === currentUrl);

      if (isScanning) {
        setLoading(true);
      } else {
        // If no data and no scan initiated, set loading to false
        setLoading(false);
      }
    };

    const storageListener = async (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string,
    ) => {
      if (area !== "local") return;

      // Batch operations: get tab and storage in parallel when needed
      if (changes.dataCollectionAnswers) {
        const [tab, storage] = await Promise.all([
          chrome.tabs.query({ active: true, lastFocusedWindow: true }),
          chrome.storage.local.get(["dataCollectionUrl"]),
        ]);
        const currentUrl = tab[0]?.url || "";
        const storedUrl = storage.dataCollectionUrl || "";

        if (currentUrl === storedUrl) {
          const newAnswers = changes.dataCollectionAnswers.newValue;
          if (newAnswers && Array.isArray(newAnswers)) {
            updateCategories(newAnswers);
            chrome.storage.local.remove(["dataCollectionLoading"]);
          }
        }
        return;
      }

      if (changes.dataCollectionLoading?.newValue === true) {
        setLoading(true);
      }

      if (changes.hasScanned?.newValue === true) {
        const [tab, storage] = await Promise.all([
          chrome.tabs.query({ active: true, lastFocusedWindow: true }),
          chrome.storage.local.get(["scannedUrl"]),
        ]);
        const currentUrl = tab[0]?.url || "";
        if (storage.scannedUrl === currentUrl) {
          setLoading(true);
        }
      }
    };

    function messageHandler(msg: any) {
      if (msg.type === "ANSWERS" && msg.data && Array.isArray(msg.data)) {
        updateCategories(msg.data);
        chrome.storage.local.remove(["dataCollectionLoading"]);
      }
    }

    // Set up listeners first so they're ready to catch changes
    chrome.storage.onChanged.addListener(storageListener);
    chrome.runtime.onMessage.addListener(messageHandler);

    // Quick synchronous check for loading state before async check
    chrome.storage.local.get(["dataCollectionLoading", "hasScanned", "scannedUrl"], (result) => {
      if (result.dataCollectionLoading === true) {
        setLoading(true);
      }
    });

    // Check storage immediately (async)
    checkStorageAndUrl();

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, []);

  return { categories, loading };
}

