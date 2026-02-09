import { usePremiumStatus } from "@/popup/hooks/usePremiumStatus";
import { DataSharingContent } from "./DataSharingContent";
import { DataSharingLocked } from "./DataSharingLocked";

export function DataSharing() {
  const { isPremium, loading } = usePremiumStatus();

  // Optionally, show a loader while checking premium status
  // For now, we default to showing 'Locked' while loading to prevent flashing content?
  // Or show content while loading?
  // Given local storage is fast, a small flicker might occur.
  // Let's just render based on state. If loading, maybe show nothing or a skeleton?
  // For simplicity and better UX, let's wait for loading.
  if (loading) {
    return (
      <div className="flex flex-col p-3 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-700/50 rounded mb-4 mx-auto"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-700/50 rounded"></div>
          <div className="h-4 w-full bg-gray-700/50 rounded"></div>
        </div>
      </div>
    );
  }

  return isPremium ? <DataSharingContent /> : <DataSharingLocked />;
}
