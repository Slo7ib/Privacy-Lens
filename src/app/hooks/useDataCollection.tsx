import { useEffect, useState } from "react";
import type { CollectedCategory } from "../../logic/dataCategories";
import { dataCollectionItems } from "../../logic/dataCategories";

export function useDataCollection() {
  const [categories, setCategories] = useState<CollectedCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const updateCategories = (answers: Array<{ element: string; collected: boolean }>) => {
    setCategories(
      dataCollectionItems.map((item) => {
        const match = answers.find((a) => a.element === item.element);
        return {
          ...item,
          collected: match ? match.collected : false,
        };
      }),
    );
    setLoading(false);
  };

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

      if (
        result.dataCollectionAnswers &&
        Array.isArray(result.dataCollectionAnswers) &&
        result.dataCollectionUrl === currentUrl
      ) {
        updateCategories(result.dataCollectionAnswers);
        chrome.storage.local.remove(["dataCollectionLoading"]);
      } else if (result.dataCollectionUrl !== currentUrl) {
        chrome.storage.local.remove([
          "dataCollectionAnswers",
          "dataCollectionUrl",
          "hasScanned",
          "scannedUrl",
          "dataCollectionLoading",
        ]);
        setLoading(false);
      } else {
        const scanInitiated =
          result.dataCollectionLoading === true ||
          (result.hasScanned === true && result.scannedUrl === currentUrl);

        if (scanInitiated) {
          setLoading(true);
        } else {
          const hasAnyScanFlag = result.hasScanned || result.dataCollectionLoading;
          setLoading(hasAnyScanFlag);
        }
      }
    };

    const storageListener = async (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string,
    ) => {
      if (area === "local" && changes.dataCollectionAnswers) {
        const [tab] = await chrome.tabs.query({
          active: true,
          lastFocusedWindow: true,
        });
        const currentUrl = tab?.url || "";

        const storage = await chrome.storage.local.get(["dataCollectionUrl"]);
        const storedUrl = storage.dataCollectionUrl || "";

        if (currentUrl === storedUrl) {
          const newAnswers = changes.dataCollectionAnswers.newValue;
          if (newAnswers && Array.isArray(newAnswers)) {
            updateCategories(newAnswers);
            chrome.storage.local.remove(["dataCollectionLoading"]);
          }
        }
      }

      if (area === "local" && changes.dataCollectionLoading) {
        if (changes.dataCollectionLoading.newValue === true) {
          setLoading(true);
        }
      }

      if (area === "local" && changes.hasScanned) {
        if (changes.hasScanned.newValue === true) {
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

    chrome.storage.onChanged.addListener(storageListener);
    chrome.runtime.onMessage.addListener(messageHandler);

    setTimeout(() => {
      checkStorageAndUrl();
    }, 100);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, []);

  return { categories, loading };
}

