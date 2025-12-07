import { useEffect, useState } from "react";
import type { CollectedCategory } from "../../logic/classifyData";
import { collectedCategories as fallbackCategories } from "../../logic/classifyData";

// Helper function to restore icons
function mergeWithFallback(
  categoriesFromStorage: Partial<CollectedCategory>[],
): CollectedCategory[] {
  return categoriesFromStorage.map((item) => {
    const original = fallbackCategories.find((o) => o.key === item.key);
    return {
      ...(original as CollectedCategory), // Assume original is found
      collected: item.collected ?? false, // Only update collected status
    };
  });
}

export function useCollectedCategories() {
  const [categories, setCategories] =
    useState<CollectedCategory[]>(fallbackCategories);

  useEffect(() => {
    // Load once on mount
    chrome.storage.local.get(["updatedCategories"], (res) => {
      const stored = res.updatedCategories;

      if (Array.isArray(stored)) {
        setCategories(mergeWithFallback(stored));
      }
    });

    // Listen for updates from background
    const listener = (msg: any) => {
      if (
        msg.type === "UPDATED_CATEGORIES" &&
        Array.isArray(msg.updatedCategories)
      ) {
        setCategories(mergeWithFallback(msg.updatedCategories));
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return categories;
}
