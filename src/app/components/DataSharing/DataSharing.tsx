import { useState } from "react";
import { SkeletonLine } from "../Cards/SkeletonCard";
import { useUsageReceiver } from "../../hooks/useUsageReceiver";
const DataSharing = () => {
  useUsageReceiver();

  const [usageLoading, setUsageLoading] = useState(false);
  return (
    <>
      <h2 className="glow-text mb-5 flex items-center justify-center gap-2 text-xl font-medium text-cyan-300">
        🔁 Usage & Sharing
      </h2>
      <div className="flex h-28 flex-col">
        <h3 className="mb-0 text-center text-xl font-medium">Usage</h3>
        <div className="my-2.5 flex h-24 w-full flex-col items-start text-sm">
          {usageLoading ? (
            <SkeletonLine />
          ) : (
            <p className="text-base font-extralight text-yellow-300">
              here is the answer you'll get from the AI
            </p>
          )}
        </div>
      </div>

      <div className="flex h-28 flex-col">
        <h3 className="mb-0 text-center text-xl font-medium">Sharing</h3>
        <div className="my-2.5 flex h-24 w-full flex-col items-start text-sm">
          {usageLoading ? (
            <SkeletonLine />
          ) : (
            <p className="text-base font-extralight text-yellow-300">
              here is the answer you'll get from the AI
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default DataSharing;
