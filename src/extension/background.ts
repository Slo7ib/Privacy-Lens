import type { AIStorageState } from "../app/types/AIStorageState";
import { extractText } from "../logic/extractText";
import { dataCollectionItems } from "../logic/classifyData";

import fakeResponse from "../utils/FakeAPI";
import fakeDataCollectionResponse from "../utils/FakeDataCollectionAPI";

// const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
// const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Here the service worker recives the privacy policy page's data.
  if (msg.type === "POLICY_PAGE") {
    const { data } = msg;

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
      await analyzeDataCollection(text);

      // Generate prompt for data collection analysis
      function generateDataCollectionPrompt(policyText: string): string {
        const questions = dataCollectionItems
          .map((item, index) => `${index + 1}. ${item.question}`)
          .join("\n");

        return `You are analyzing a privacy policy to determine what data is being collected. Read the following privacy policy text and answer each question with ONLY "true" or "false" based on whether the policy explicitly states or indicates that the data is collected.

Privacy Policy Text:
${policyText.substring(0, 8000)}${policyText.length > 8000 ? "\n[... text truncated ...]" : ""}

Questions to answer:
${questions}

IMPORTANT: 
- Answer each question with ONLY "true" or "false" (lowercase)
- Be conservative: only answer "true" if the policy explicitly mentions or clearly indicates collection of that data type
- Return your response as a JSON object with this exact structure:
{
  "answers": [
    { "element": "Phone Number", "collected": true },
    { "element": "Account Credentials", "collected": false },
    ...
  ]
}
- Include ALL elements from the list above
- Use the exact element names as provided
- Do not include any additional text, explanations, or markdown formatting outside the JSON`;
      }

      // Clean and validate data collection response
      function cleanDataCollectionResponse(
        uncleanedResponse: string,
      ): string | null {
        try {
          // Try to find JSON in the response
          const firstIndex = uncleanedResponse.indexOf("{");
          const lastIndex = uncleanedResponse.lastIndexOf("}");

          if (firstIndex === -1 || lastIndex === -1 || lastIndex < firstIndex) {
            console.error(
              "[background] No valid JSON found in data collection response",
            );
            return null;
          }

          let cleaned = uncleanedResponse.substring(firstIndex, lastIndex + 1);

          // Remove markdown code blocks if present
          cleaned = cleaned
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "")
            .trim();

          return cleaned;
        } catch (err) {
          console.error(
            "[background] Error cleaning data collection response:",
            err,
          );
          return null;
        }
      }

      // Validate and parse data collection answers
      function validateDataCollectionAnswers(
        parsed: any,
      ): Array<{ element: string; collected: boolean }> | null {
        try {
          if (!parsed || !parsed.answers || !Array.isArray(parsed.answers)) {
            console.error(
              "[background] Invalid data collection response structure: missing answers array",
            );
            return null;
          }

          const validElements = new Set(
            dataCollectionItems.map((item) => item.element),
          );
          const validatedAnswers: Array<{
            element: string;
            collected: boolean;
          }> = [];

          for (const answer of parsed.answers) {
            if (
              !answer ||
              typeof answer.element !== "string" ||
              typeof answer.collected !== "boolean"
            ) {
              console.warn(
                "[background] Skipping invalid answer entry:",
                answer,
              );
              continue;
            }

            // Validate element name exists in our data collection items
            if (!validElements.has(answer.element)) {
              console.warn(
                `[background] Unknown element "${answer.element}", skipping`,
              );
              continue;
            }

            validatedAnswers.push({
              element: answer.element,
              collected: answer.collected,
            });
          }

          // Ensure all elements are present (fill missing ones with false)
          const providedElements = new Set(
            validatedAnswers.map((a) => a.element),
          );
          for (const item of dataCollectionItems) {
            if (!providedElements.has(item.element)) {
              validatedAnswers.push({
                element: item.element,
                collected: false,
              });
            }
          }

          return validatedAnswers;
        } catch (err) {
          console.error(
            "[background] Error validating data collection answers:",
            err,
          );
          return null;
        }
      }

      // Analyze data collection from privacy policy
      async function analyzeDataCollection(policyText: string) {
        try {
          if (!policyText || policyText.trim().length === 0) {
            console.warn(
              "[background] No policy text available for data collection analysis",
            );
            return;
          }

          const prompt = generateDataCollectionPrompt(policyText);
          console.log("[background] Generated data collection prompt", {
            promptLength: prompt.length,
            policyTextLength: policyText.length,
          });

          // Simulate API call with fake response
          function fakeDataCollectionApi(): Promise<
            typeof fakeDataCollectionResponse
          > {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                const shouldError = false;
                if (shouldError) {
                  reject("The data collection API had an error");
                } else {
                  resolve(fakeDataCollectionResponse);
                }
              }, 3000);
            });
          }

          const rawResponse = await fakeDataCollectionApi();
          const rawContent: string =
            rawResponse?.choices[0]?.message?.content || "";

          if (!rawContent) {
            console.error(
              "[background] Empty response from data collection API",
            );
            return;
          }

          const cleanedContent = cleanDataCollectionResponse(rawContent);
          if (!cleanedContent) {
            console.error(
              "[background] Failed to clean data collection response",
            );
            return;
          }

          const parsed = JSON.parse(cleanedContent);
          const validatedAnswers = validateDataCollectionAnswers(parsed);

          if (!validatedAnswers || validatedAnswers.length === 0) {
            console.error(
              "[background] No valid answers after validation",
            );
            return;
          }

          // Get current tab URL for persistence
          let currentTabUrl = "";
          if (sender.tab?.url) {
            currentTabUrl = sender.tab.url;
          } else {
            // Fallback: try to get from the policy data
            currentTabUrl = data.url || "";
          }

          // Store answers in chrome.storage for persistence with URL
          chrome.storage.local.set({
            dataCollectionAnswers: validatedAnswers,
            dataCollectionUrl: currentTabUrl,
          });

          // Send ANSWERS message to popup and all extension contexts
          chrome.runtime.sendMessage({
            type: "ANSWERS",
            data: validatedAnswers,
          });
          console.log(
            "[background] Sent data collection answers:",
            validatedAnswers,
          );
        } catch (err) {
          console.error(
            "[background] Error in data collection analysis:",
            err,
          );
          // Send empty answers on error to prevent UI from hanging
          const fallbackAnswers = dataCollectionItems.map((item) => ({
            element: item.element,
            collected: false,
          }));
          
          // Get current tab URL for persistence
          let currentTabUrl = "";
          if (sender.tab?.url) {
            currentTabUrl = sender.tab.url;
          } else {
            currentTabUrl = data.url || "";
          }

          // Store fallback answers in chrome.storage with URL
          chrome.storage.local.set({
            dataCollectionAnswers: fallbackAnswers,
            dataCollectionUrl: currentTabUrl,
          });
          
          chrome.runtime.sendMessage({
            type: "ANSWERS",
            data: fallbackAnswers,
          });
        }
      }

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
