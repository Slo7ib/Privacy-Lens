import type { AIStorageState } from "../app/types/AIStorageState";
import { extractText } from "../logic/extractText";
import { dataCollectionItems } from "../logic/dataCategories";
import { mockUsageApiResponse } from "../mocks/mockUsageApi";
import { mockDataCollectionApiResponse } from "../mocks/mockDataCollectionApi";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "POLICY_PAGE") {
    const { data } = msg;

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

      await analyzeUsageAndSharing();
      await analyzeDataCollection(text);

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

function cleanJsonResponse(response: string): string | null {
  try {
    const firstIndex = response.indexOf("{");
    const lastIndex = response.lastIndexOf("}");

    if (firstIndex === -1 || lastIndex === -1 || lastIndex < firstIndex) {
      console.error("[background] No valid JSON found in response");
      return null;
    }

    let cleaned = response.substring(firstIndex, lastIndex + 1);
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    return cleaned;
  } catch (err) {
    console.error("[background] Error cleaning response:", err);
    return null;
  }
}

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
        console.warn("[background] Skipping invalid answer entry:", answer);
        continue;
      }

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
    console.error("[background] Error validating data collection answers:", err);
    return null;
  }
}

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

    function mockDataCollectionApi(): Promise<
      typeof mockDataCollectionApiResponse
    > {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockDataCollectionApiResponse);
        }, 3000);
      });
    }

    const rawResponse = await mockDataCollectionApi();
    const rawContent: string =
      rawResponse?.choices[0]?.message?.content || "";

    if (!rawContent) {
      console.error("[background] Empty response from data collection API");
      return;
    }

    const cleanedContent = cleanJsonResponse(rawContent);
    if (!cleanedContent) {
      console.error("[background] Failed to clean data collection response");
      return;
    }

    const parsed = JSON.parse(cleanedContent);
    const validatedAnswers = validateDataCollectionAnswers(parsed);

    if (!validatedAnswers || validatedAnswers.length === 0) {
      console.error("[background] No valid answers after validation");
      return;
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    const currentTabUrl = tab?.url || "";

    chrome.storage.local.set({
      dataCollectionAnswers: validatedAnswers,
      dataCollectionUrl: currentTabUrl,
    });

    chrome.runtime.sendMessage({
      type: "ANSWERS",
      data: validatedAnswers,
    });

    console.log("[background] Sent data collection answers:", validatedAnswers);
  } catch (err) {
    console.error("[background] Error in data collection analysis:", err);

    const fallbackAnswers = dataCollectionItems.map((item) => ({
      element: item.element,
      collected: false,
    }));

    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    const currentTabUrl = tab?.url || "";

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

async function analyzeUsageAndSharing() {
  try {
    chrome.storage.local.set({
      aiUsageResult: {
        status: "loading",
      } satisfies AIStorageState,
    });

    function mockUsageApi(): Promise<typeof mockUsageApiResponse> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockUsageApiResponse);
        }, 4000);
      });
    }

    const rawResponse = await mockUsageApi();
    const rawContent: string = rawResponse?.choices[0].message.content;

    const cleanedContent = cleanJsonResponse(rawContent);
    if (!cleanedContent) {
      throw new Error("Failed to clean usage response");
    }

    const parsed = JSON.parse(cleanedContent.trim());

    if (
      !parsed ||
      typeof parsed.usage !== "string" ||
      typeof parsed.sharing !== "string"
    ) {
      console.error(
        "the AI usageResponse does not have the expected properties",
        parsed,
      );
      return null;
    }

    const usageResponse = {
      usage: parsed.usage,
      sharing: parsed.sharing,
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
