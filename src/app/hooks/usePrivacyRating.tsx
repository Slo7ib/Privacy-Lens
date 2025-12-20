import { useMemo } from "react";
import { useDataCollection } from "./useDataCollection";
import { useUsageAndSharing } from "./useUsageAndSharing";
import { calculatePrivacyRating } from "../../logic/calculateRating";

export function usePrivacyRating() {
  const { categories, loading: dataLoading } = useDataCollection();
  const usageState = useUsageAndSharing();

  const rating = useMemo(() => {
    // Always calculate a rating, even with empty data (will give A rating)
    // This prevents the UI from getting stuck
    const categoriesToUse = categories.length > 0 ? categories : [];

    // Check if third-party sharing is mentioned (safely handle undefined/null)
    let sharesWithThirdParties = false;
    if (
      usageState?.status === "ready" &&
      usageState.data?.sharing
    ) {
      const sharingLower = usageState.data.sharing.toLowerCase();
      sharesWithThirdParties =
        sharingLower.includes("third") &&
        (sharingLower.includes("share") ||
          sharingLower.includes("partner") ||
          sharingLower.includes("advertis"));
    }

    return calculatePrivacyRating(categoriesToUse, sharesWithThirdParties);
  }, [categories, usageState]);

  const loading = dataLoading || usageState?.status === "loading";

  return { rating, loading };
}

