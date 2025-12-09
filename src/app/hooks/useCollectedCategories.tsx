import { use, useEffect, useState } from "react";
import type { CollectedCategory } from "../../logic/classifyData";
import {
  dataCollectionItems,
  dataCollectionItems as fallbackCategories,
} from "../../logic/classifyData";

export function useCollectedCategories() {
  const [categories, setCategories] = useState<CollectedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    function handler(msg: any, sender: any, sendResponse: any) {
      if (msg.type === "ANSWERS") {
        setCategories(
          dataCollectionItems.map((item) => {
            const match = msg.data.find((a: any) => a.element === item.element);

            return {
              ...item,
              collected: match ? match.collected : false,
            };
          }),
        );
        setLoading(false);
      }
    }
    chrome.runtime.onMessage.addListener(handler);
    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    };
  }, []);

  return { categories, loading };
}
