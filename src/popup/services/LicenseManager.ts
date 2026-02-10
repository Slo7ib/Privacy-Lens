export class LicenseManager {
    private static WORKER_URL = "https://privacy-lens.slo7i-b-sb.workers.dev";

    // Check key background interval: 7 days
    private static CHECK_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

    /**
     * Activate a new license key
     */
    static async activateLicense(key: string): Promise<{ success: boolean; error?: string }> {
        if (!key) return { success: false, error: "License key is required" };

        try {
            const response = await fetch(`${this.WORKER_URL}/validate-license`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ licenseKey: key }),
            });

            if (!response.ok) {
                // Try to parse error message
                const data = await response.json().catch(() => null);
                const msg = data?.error?.message || `Server error: ${response.status}`;
                return { success: false, error: msg };
            }

            const data = await response.json();

            if (data.valid) {
                // Save to storage
                await chrome.storage.local.set({
                    isPremium: true,
                    licenseKey: key,
                    lastLicenseCheck: Date.now()
                });
                return { success: true };
            } else {
                return { success: false, error: "Invalid license key" };
            }

        } catch (err: any) {
            console.error("Activation error:", err);
            return { success: false, error: "Connection failed. Please try again." };
        }
    }

    /**
     * Background check logic
     * Should be called when popup opens or via an alarm (if we had background alarms).
     * Since we only have popup context and onMessage in background, we'll call this
     * conservatively or relies on the background script if we moved this there.
     * 
     * For now, following requirements: "background revalidate every 7 days".
     * Since this is a Service imported in Popup, it only runs when Popup is open.
     * To truly run in background, it should be in `background/index.ts`.
     * However, the prompt says "Create src/popup/services/LicenseManager.ts" and 
     * "backgroundCheck() -> if 7 days passed: call /check-license".
     * 
     * We will implement the check logic here, and we can call it when the popup loads.
     * Or better, we can inject logic into the background script to import this?
     * Background script is `entry` point. We can't easily import from `popup/services` to `background`
     * without structure issues if not shared.
     * 
     * Let's put the logic here, and call it from `DataSharingLocked` or `App.tsx` on mount.
     * If the user never opens the popup, they don't use the feature anyway.
     */
    static async checkLicenseStatus(): Promise<void> {
        try {
            const { isPremium, licenseKey, lastLicenseCheck } = await chrome.storage.local.get([
                "isPremium",
                "licenseKey",
                "lastLicenseCheck"
            ]);

            if (!isPremium || !licenseKey) return;

            const now = Date.now();
            const lastCheck = (lastLicenseCheck as number) || 0;

            if (now - lastCheck > this.CHECK_INTERVAL_MS) {
                console.log("[LicenseManager] Re-validating license in background...");

                const response = await fetch(`${this.WORKER_URL}/check-license`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ licenseKey }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.valid === false) {
                        // Downgrade if explicitly invalid
                        console.warn("[LicenseManager] License expired or revoked. Downgrading.");
                        await chrome.storage.local.set({ isPremium: false });
                    } else if (data.valid === true) {
                        // Update check time
                        await chrome.storage.local.set({ lastLicenseCheck: now });
                    }
                }
            }
        } catch (err) {
            console.error("[LicenseManager] Background check failed", err);
            // Verify silently, don't downgrade on network error
        }
    }
}
