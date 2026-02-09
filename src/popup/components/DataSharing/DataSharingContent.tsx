import { SkeletonLine } from "@/popup/components/SkeletonCard/SkeletonCard";
import { useUsageAndSharing } from "@/popup/hooks/useUsageAndSharing";

export function DataSharingContent() {
    const usageState = useUsageAndSharing();

    const isLoading = usageState?.status === "loading";
    const isReady = usageState?.status === "ready";
    const isError = usageState?.status === "error";

    return (
        <>
            <h2 className="mb-5 flex items-center justify-center gap-2 text-xl font-medium text-cyan-300 [text-shadow:0_0_10px_rgba(34,211,238,0.5)]">
                🔁 Usage & Sharing
            </h2>
            <div className="flex flex-col p-3">
                <h3 className="mb-2 text-center text-xl font-medium">Usage</h3>
                <div className="flex w-full flex-col gap-2 text-sm">
                    {isLoading ? (
                        <SkeletonLine />
                    ) : isReady ? (
                        <p className="text-base leading-relaxed font-extralight text-yellow-300">
                            {usageState.data.usage}
                        </p>
                    ) : isError ? (
                        <p className="text-base font-extralight text-red-300">
                            {usageState.message}
                        </p>
                    ) : (
                        <p className="text-base font-extralight text-yellow-300">
                            Waiting for data...
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col p-3">
                <h3 className="mb-2 text-center text-xl font-medium">Sharing</h3>
                <div className="flex w-full flex-col gap-2 text-sm">
                    {isLoading ? (
                        <SkeletonLine />
                    ) : isReady ? (
                        <p className="text-base leading-relaxed font-extralight text-yellow-300">
                            {usageState.data.sharing}
                        </p>
                    ) : isError ? (
                        <p className="text-base font-extralight text-red-300">
                            {usageState.message}
                        </p>
                    ) : (
                        <p className="text-base font-extralight text-yellow-300">
                            Waiting for data...
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
