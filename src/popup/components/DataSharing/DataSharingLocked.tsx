import { useState } from "react";
import { SkeletonLine } from "@/popup/components/SkeletonCard/SkeletonCard";
import { LicenseManager } from "@/popup/services/LicenseManager";

// License Modal Component
function LicenseModal({ onClose, onActivate }: { onClose: () => void; onActivate: () => void }) {
    const [license, setLicense] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!license.trim()) return;

        setIsLoading(true);
        setError(null);

        const result = await LicenseManager.activateLicense(license.trim());

        if (result.success) {
            onActivate(); // Will trigger parent to close and refresh state
        } else {
            setError(result.error || "Invalid license");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-lg bg-gray-900 border border-cyan-500/30 p-6 shadow-xl shadow-cyan-500/20">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white text-2xl leading-none"
                >
                    ✕
                </button>
                <h3 className="mb-4 text-xl font-medium text-cyan-300">
                    Enter License Key
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="rounded-lg border border-cyan-500/30 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                        autoFocus
                    />

                    {error && (
                        <p className="text-red-400 text-sm px-1">{error}</p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 cursor-pointer rounded-lg border border-gray-600 px-4 py-2 font-medium text-gray-300 transition-all hover:bg-gray-800"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 cursor-pointer rounded-lg bg-cyan-500 px-4 py-2 font-medium text-black transition-all hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? "Activating..." : "Activate"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function DataSharingLocked() {
    const [showLicenseModal, setShowLicenseModal] = useState(false);

    const handleUpgrade = () => {
        window.open("https://privacylens.lemonsqueezy.com/checkout/buy/c63ed65f-a580-43b1-bbbf-f1d26290d512", "_blank");
    };

    const handleActivationSuccess = () => {
        setShowLicenseModal(false);
        // State updates automatically via storage listener in usePremiumStatus hook
    };

    return (
        <>
            <h2 className="mb-5 flex items-center justify-center gap-2 text-xl font-medium text-cyan-300 [text-shadow:0_0_10px_rgba(34,211,238,0.5)]">
                🔁 Usage & Sharing
            </h2>

            {/* Blurred Content Preview */}
            <div className="relative">
                <div className="blur-sm pointer-events-none select-none opacity-50">
                    <div className="flex flex-col p-3">
                        <h3 className="mb-2 text-center text-xl font-medium">Usage</h3>
                        <div className="flex w-full flex-col gap-2 text-sm">
                            <SkeletonLine />
                            <SkeletonLine />
                        </div>
                    </div>
                    <div className="flex flex-col p-3">
                        <h3 className="mb-2 text-center text-xl font-medium">Sharing</h3>
                        <div className="flex w-full flex-col gap-2 text-sm">
                            <SkeletonLine />
                            <SkeletonLine />
                        </div>
                    </div>
                </div>

                {/* Overlay with CTA */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-black/40 backdrop-blur-[2px] p-4">
                    {/* Eye-catching icon/badge */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30">
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>

                    {/* Headline */}
                    <div className="text-center space-y-1">
                        <p className="text-base font-bold text-cyan-300">
                            Unlock AI Insights
                        </p>
                        <p className="text-xs text-cyan-100/80 leading-relaxed px-2">
                            Get instant AI summaries on how your data is used & shared
                        </p>
                    </div>

                    {/* Feature comparison */}
                    <div className="flex items-center gap-3 text-xs">
                        <div className="text-center">
                            <div className="text-cyan-100/60 font-medium mb-0.5">Free</div>
                            <div className="text-cyan-100/80">Icons only</div>
                        </div>
                        <div className="text-cyan-500">→</div>
                        <div className="text-center">
                            <div className="text-cyan-300 font-semibold mb-0.5">Pro</div>
                            <div className="text-cyan-300">Icons + AI</div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-2 w-full max-w-[200px]">
                        <button
                            onClick={handleUpgrade}
                            className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:from-cyan-400 hover:to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-[1.02]"
                        >
                            Upgrade to Pro
                        </button>
                        <button
                            onClick={() => setShowLicenseModal(true)}
                            className="w-full cursor-pointer rounded-lg border border-cyan-500/50 px-4 py-2 text-xs font-medium text-cyan-300/90 transition-all hover:bg-cyan-500/10 hover:border-cyan-500"
                        >
                            Already have a license?
                        </button>
                    </div>
                </div>
            </div>

            {/* License Modal */}
            {showLicenseModal && (
                <LicenseModal
                    onClose={() => setShowLicenseModal(false)}
                    onActivate={handleActivationSuccess}
                />
            )}
        </>
    );
}
