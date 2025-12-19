import type { AIStorageState } from "../app/types/AIStorageState";
import { extractText } from "../logic/extractText";

import fakeResponse from "../utils/FakeAPI";

// const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
// const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Here the service worker recives the privacy policy page's data.
  if (msg.type === "POLICY_PAGE") {
    const { data, tabId } = msg;

    // acknowledge to popup
    try {
      sendResponse({ status: "ok" });
    } catch {}

    (async () => {
      console.log("[background] Received policy data", data);

      let html = "";
      let text = "";

      if (data.url) {
        try {
          const res = await fetch(data.url);
          const rawHTML = await res.text();
          html = rawHTML;
          text = extractText(rawHTML);
        } catch (err) {
          console.error("Could not fetch policy:", err);
        }
      }

      const finalPayload = {
        found: data.found,
        url: data.url,
        linkText: data.text,
        rawHTML: html,
        plainText: text,
      };

      await fakeAnswer();

      function fakeApi(): Promise<typeof fakeResponse> {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const shouldError = false;
            if (shouldError) {
              reject("The API had a mistake in usage stuff");
            } else {
              resolve(fakeResponse);
            }
          }, 4000);
        });
      }

      // This function will clean any AI result and turn it into a JSON'ifyable string.
      function cleanResponse(uncleanedSharing: string) {
        const firstIndex = uncleanedSharing.indexOf("{");
        const endIndex = uncleanedSharing.lastIndexOf("}");

        if (firstIndex === -1 || endIndex === -1 || endIndex < firstIndex) {
          return "error in cleaning";
        }
        // This will cut the extra words before and after the usageResponse we get from the AI
        let cleanedResponse = uncleanedSharing.substring(
          firstIndex,
          endIndex + 1,
        );

        cleanedResponse = cleanedResponse
          .replace(/json s* ^ /, "")
          .replace(/\s*```$/, "");

        return cleanedResponse;
      }

      async function fakeAnswer() {
        try {
          chrome.storage.local.set({
            aiUsageResult: {
              status: "loading",
            } satisfies AIStorageState,
          });
          const rawSharing = await fakeApi();
          const uncleanedSharing: string =
            rawSharing?.choices[0].message.content;

          let cleanedSharing = cleanResponse(uncleanedSharing);
          const parsedSharing = JSON.parse(cleanedSharing.trim());

          if (
            !parsedSharing ||
            typeof parsedSharing.usage !== "string" ||
            typeof parsedSharing.sharing !== "string"
          ) {
            console.error(
              "the AI usageResponse does not have the expected properties",
              parsedSharing,
            );
            return null;
          }

          interface usageAndSharing {
            usage: string;
            sharing: string;
          }
          const usageResponse: usageAndSharing = {
            usage: parsedSharing.usage,
            sharing: parsedSharing.sharing,
          };

          chrome.storage.local.set({
            aiUsageResult: {
              status: "ready",
              data: usageResponse,
            } satisfies AIStorageState,
          });
        } catch (err) {
          chrome.storage.local.set({
            aiUsageResult: {
              status: "error",
              message: `AI response invalid ${err}`,
            } satisfies AIStorageState,
          });
        }
      }

      if (sender.tab?.id !== undefined) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "POLICY_SUMMARY_READY",
          data: finalPayload,
        });
      }

      console.log("[background] Final payload ready", finalPayload);
    })();

    return true;
  }
});
