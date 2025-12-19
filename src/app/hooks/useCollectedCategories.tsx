import { use, useEffect, useState } from "react";
import type { CollectedCategory } from "../../logic/classifyData";
import {
  dataCollectionItems,
  dataCollectionItems as fallbackCategories,
} from "../../logic/classifyData";

export function useCollectedCategories() {
  const [categories, setCategories] = useState<CollectedCategory[]>([]);
  // Start with true - Cards only renders after scan, so we should show loading initially
  const [loading, setLoading] = useState(true);

  const updateCategories = (answers: Array<{ element: string; collected: boolean }>) => {
    setCategories(
      dataCollectionItems.map((item) => {
        const match = answers.find((a: any) => a.element === item.element);

        return {
          ...item,
          collected: match ? match.collected : false,
        };
      }),
    );
    setLoading(false);
  };
  
  useEffect(() => {
    // Check storage on mount and verify URL matches current tab
    const checkStorageAndUrl = async () => {
      // Get current tab URL
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      const currentUrl = tab?.url || "";

      // Get stored data
      const result = await chrome.storage.local.get([
        "dataCollectionAnswers",
        "dataCollectionUrl",
        "dataCollectionLoading",
        "hasScanned",
        "scannedUrl",
      ]);

      if (
        result.dataCollectionAnswers &&
        Array.isArray(result.dataCollectionAnswers) &&
        result.dataCollectionUrl === currentUrl
      ) {
        // URLs match, use stored data
        updateCategories(result.dataCollectionAnswers);
        // Clear loading flag
        chrome.storage.local.remove(["dataCollectionLoading"]);
      } else if (result.dataCollectionUrl !== currentUrl) {
        // URL changed (tab refreshed or navigated), clear old data
        chrome.storage.local.remove([
          "dataCollectionAnswers",
          "dataCollectionUrl",
          "hasScanned",
          "scannedUrl",
          "dataCollectionLoading",
        ]);
        setLoading(false);
      } else {
        // No data in storage yet
        // Since Cards component only renders when hasScanned is true,
        // we should keep loading true until data arrives
        const scanInitiated = result.dataCollectionLoading === true || 
          (result.hasScanned === true && result.scannedUrl === currentUrl);
        
        if (scanInitiated) {
          // Scan was initiated, keep loading true until data arrives
          setLoading(true);
          console.log("[useCollectedCategories] Scan initiated, keeping loading true");
        } else {
          // Double-check: Cards only renders after scan, so if we're here
          // and there's no data, it might be a timing issue - keep loading true
          // Only set to false if we're absolutely sure (e.g., page refresh with no scan)
          const hasAnyScanFlag = result.hasScanned || result.dataCollectionLoading;
          if (!hasAnyScanFlag) {
            // No scan flags at all - might be a fresh page load
            setLoading(false);
            console.log("[useCollectedCategories] No scan flags found, setting loading to false");
          } else {
            // Has scan flags but URL doesn't match or timing issue - keep loading
            setLoading(true);
            console.log("[useCollectedCategories] Scan flags found but no data yet, keeping loading true");
          }
        }
      }
    };

    // Set up storage listener FIRST so it catches changes immediately
    // Listen for storage changes (when data is updated)
    const storageListener = async (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string,
    ) => {
      if (area === "local" && changes.dataCollectionAnswers) {
        // Get current tab URL to verify it matches
        const [tab] = await chrome.tabs.query({
          active: true,
          lastFocusedWindow: true,
        });
        const currentUrl = tab?.url || "";

        // Get stored URL
        const storage = await chrome.storage.local.get(["dataCollectionUrl"]);
        const storedUrl = storage.dataCollectionUrl || "";

        // Only update if URLs match
        if (currentUrl === storedUrl) {
          const newAnswers = changes.dataCollectionAnswers.newValue;
          if (newAnswers && Array.isArray(newAnswers)) {
            updateCategories(newAnswers);
            // Clear loading flag
            chrome.storage.local.remove(["dataCollectionLoading"]);
          }
        }
      }
      
      // Handle loading state changes
      if (area === "local" && changes.dataCollectionLoading) {
        console.log("[useCollectedCategories] dataCollectionLoading changed:", changes.dataCollectionLoading.newValue);
        if (changes.dataCollectionLoading.newValue === true) {
          setLoading(true);
          console.log("[useCollectedCategories] Setting loading to true from dataCollectionLoading");
        }
      }
      
      // Also check hasScanned changes
      if (area === "local" && changes.hasScanned) {
        console.log("[useCollectedCategories] hasScanned changed:", changes.hasScanned.newValue);
        if (changes.hasScanned.newValue === true) {
          // Scan was just initiated, set loading
          setLoading(true);
          console.log("[useCollectedCategories] Setting loading to true from hasScanned");
          // Also check if dataCollectionLoading is set
          const loadingCheck = await chrome.storage.local.get(["dataCollectionLoading"]);
          if (loadingCheck.dataCollectionLoading === true) {
            setLoading(true);
            console.log("[useCollectedCategories] Confirmed dataCollectionLoading is true");
          }
        }
      }
    };

    // Listen for runtime messages (when data is sent directly)
    function messageHandler(msg: any, sender: any, sendResponse: any) {
      if (msg.type === "ANSWERS" && msg.data && Array.isArray(msg.data)) {
        updateCategories(msg.data);
        // Clear loading flag
        chrome.storage.local.remove(["dataCollectionLoading"]);
      }
    }

    chrome.storage.onChanged.addListener(storageListener);
    chrome.runtime.onMessage.addListener(messageHandler);

    // Now check storage after listeners are set up
    // Add a small delay to ensure storage.set from scan has completed
    // But keep loading true initially since Cards only renders after scan
    setTimeout(() => {
      checkStorageAndUrl();
    }, 100);

    // Set up a polling mechanism to catch loading state changes (fallback)
    const pollInterval = setInterval(async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      const currentUrl = tab?.url || "";

      const check = await chrome.storage.local.get([
        "dataCollectionAnswers",
        "dataCollectionUrl",
        "dataCollectionLoading",
        "hasScanned",
        "scannedUrl",
      ]);

      // If scan was initiated but we're not loading, set loading to true
      if (!check.dataCollectionAnswers) {
        const scanInitiated = check.dataCollectionLoading === true || 
          (check.hasScanned === true && check.scannedUrl === currentUrl);
        
        if (scanInitiated) {
          setLoading((prev) => {
            if (!prev) {
              console.log("[useCollectedCategories] Poll detected scan, setting loading to true");
              return true;
            }
            return prev;
          });
        }
      }
    }, 200); // Check every 200ms

    return () => {
      clearInterval(pollInterval);
      chrome.storage.onChanged.removeListener(storageListener);
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, []);

  return { categories, loading };
}
