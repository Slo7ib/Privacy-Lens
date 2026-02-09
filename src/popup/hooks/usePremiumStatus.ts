import { useState, useEffect } from "react";

export function usePremiumStatus() {
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const result = await chrome.storage.local.get("isPremium");
                setIsPremium(!!result.isPremium);
            } catch (error) {
                console.error("Failed to fetch premium status:", error);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();

        // Listen for changes
        const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.isPremium) {
                setIsPremium(!!changes.isPremium.newValue);
            }
        };

        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, []);

    return { isPremium, loading };
}
