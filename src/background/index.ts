import type { AIStorageState } from "@/shared/types/AIStorageState";
import type { AIWorkerResult, AIErrorCode } from "@/shared/types/errors";
import { extractText } from "@/shared/logic/extractText";
import { dataCollectionItems } from "@/shared/logic/dataCategories";

const WORKER_URL = "https://privacy-lens.slo7i-b-sb.workers.dev";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "POLICY_PAGE") {
    const { data } = msg;

    try {
      sendResponse({ status: "ok" });
    } catch { }

    (async () => {
      console.log("[background] Received policy data", data);

      // Set loading state immediately when we receive the policy page message
      // This ensures the UI shows loading state even before analysis starts
      chrome.storage.local.set({
        dataCollectionLoading: true,
      });

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

      await analyzeUsageAndSharing(text);
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

  const elementList = dataCollectionItems
    .map((item) => `- "${item.element}"`)
    .join("\n");

  return `You are analyzing a privacy policy to determine what data is being collected. Read the following privacy policy text and answer each question with "true" or "false" based on whether the policy mentions or indicates collection of that data type.

Privacy Policy Text:
${policyText.substring(0, 8000)}${policyText.length > 8000 ? "\n[... text truncated ...]" : ""}

Questions to answer:
${questions}

IMPORTANT GUIDELINES:
- Answer "true" if the policy mentions collecting, storing, processing, or using the data type, even if worded differently
- For "Personal Information": Answer "true" if the policy mentions ANY of the following: name, age, date of birth, birthdate, DOB, identity details, personal details, demographic information, gender, marital status, nationality, or any similar personal identifiers. Examples that should be "true": "we collect your age", "we store date of birth", "we process personal details", "we collect demographic data"
- Look for synonyms and related terms (e.g., "DOB" = date of birth, "demographics" = personal information, "PII" = personal information)
- Answer "false" only if the policy explicitly states the data is NOT collected, or if there is absolutely no mention of it
- Be thorough: if the policy mentions collecting data that falls under a category, answer "true"

Return your response as a JSON object with this EXACT structure:
{
  "answers": [
    { "element": "Phone Number", "collected": true },
    { "element": "Account Credentials", "collected": false },
    { "element": "Personal Information", "collected": true },
    ...
  ]
}

REQUIRED: You MUST include ALL of the following elements in your response (use these EXACT names):
${elementList}

- Use the EXACT element names as shown above (case-sensitive)
- Return ONLY valid JSON without any additional text, explanations, or markdown formatting outside the JSON
- Do not use code blocks or markdown formatting`;
}

function generateUsageAndSharingPrompt(policyText: string): string {
  return `You are analyzing a privacy policy to summarize how user data is used and shared. Read the following privacy policy text and provide a concise summary.

Privacy Policy Text:
${policyText.substring(0, 8000)}${policyText.length > 8000 ? "\n[... text truncated ...]" : ""}

Please analyze the policy and provide:
1. A summary of how the collected data is used (usage)
2. A summary of how the data is shared with third parties (sharing)

Return your response as a JSON object with this exact structure:
{
  "usage": "Brief summary of how user data is used...",
  "sharing": "Brief summary of how user data is shared..."
}

IMPORTANT:
- Be concise but informative
- Base your analysis only on what is explicitly stated in the policy
- Return ONLY valid JSON without any additional text, explanations, or markdown formatting`;
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
      if (!answer || typeof answer.element !== "string") {
        console.warn("[background] Skipping invalid answer entry (missing element):", answer);
        continue;
      }

      // Handle both boolean and string boolean values
      let collectedValue: boolean;
      if (typeof answer.collected === "boolean") {
        collectedValue = answer.collected;
      } else if (typeof answer.collected === "string") {
        collectedValue = answer.collected.toLowerCase() === "true";
      } else {
        console.warn(
          `[background] Invalid collected value for "${answer.element}": ${answer.collected}, defaulting to false`,
        );
        collectedValue = false;
      }

      if (!validElements.has(answer.element)) {
        console.warn(
          `[background] Unknown element "${answer.element}", skipping. Valid elements are:`,
          Array.from(validElements),
        );
        continue;
      }

      validatedAnswers.push({
        element: answer.element,
        collected: collectedValue,
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



async function callAIWorker(
  type: "dataCollection" | "usageAndSharing",
  prompt: string,
): Promise<AIWorkerResult> {
  try {
    const userId = chrome.runtime.id; // stable, per-install

    let res;
    try {
      res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, prompt }),
      });
    } catch (netErr) {
      console.error("[background] Network error calling worker", netErr);
      return {
        ok: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Could not connect to the AI server. Please check your internet connection."
        }
      };
    }

    const data = await res.json().catch(() => null);

    // Map HTTP 429 explicitly if the worker didn't return a JSON body for some reason, 
    // but our new worker always returns JSON.
    if (res.status === 429) {
      return {
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: "You have reached your daily limit. Please try again tomorrow.",
          details: data?.requestId
        }
      };
    }

    if (!res.ok) {
      console.error("[background] Worker returned error status", res.status, data);

      let code: AIErrorCode = "WORKER_ERROR";
      const workerCode = data?.error?.code;

      if (workerCode === "OPENROUTER_ERROR") code = "OPENROUTER_ERROR";
      else if (workerCode === "AI_FAILED") code = "AI_INVALID_RESPONSE";
      else if (workerCode === "INVALID_JSON") code = "JSON_PARSE_ERROR";

      return {
        ok: false,
        error: {
          code,
          message: data?.error?.message || `Server error: ${res.status}`,
          details: data?.requestId
        }
      };
    }

    if (!data || !data.content) {
      return {
        ok: false,
        error: {
          code: "AI_INVALID_RESPONSE",
          message: "The AI server returned an empty response.",
          details: data?.requestId
        }
      };
    }

    return { ok: true, content: data.content };

  } catch (err: any) {
    console.error("[background] Unexpected error in callAIWorker", err);
    return {
      ok: false,
      error: {
        code: "UNKNOWN",
        message: "An unexpected error occurred.",
        details: err.message
      }
    };
  }
}


async function analyzeDataCollection(policyText: string) {
  // Get tab info once at the start for use throughout the function
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const currentTabUrl = tab?.url || "";

  try {
    if (!policyText || policyText.trim().length === 0) {
      console.warn(
        "[background] No policy text available for data collection analysis",
      );
      return;
    }

    // Ensure loading state is set at the start of analysis
    chrome.storage.local.set({
      dataCollectionLoading: true,
    });

    const prompt = generateDataCollectionPrompt(policyText);
    console.log("[background] Generated data collection prompt", {
      promptLength: prompt.length,
      policyTextLength: policyText.length,
    });

    const result = await callAIWorker("dataCollection", prompt);
    if (!result.ok) {
      console.error("[background] AI analysis failed", result.error);

      // Fallback logic on error? 
      // Requirement: "All failures: Set a storage state with status: "error" ... Keep fallback answers, but only after storing the error state."
      // Actually, the requirements say: "Keep fallback answers, but only after storing the error state."
      // This implies we should show the error state, but maybe populate fallback answers too? 
      // The UI logic likely reads `dataCollectionAnswers`.
      // If I set `dataCollectionLoading: false` (implied by ending), the UI will look for answers.
      // But I should also set an error state if the UI has a place for it.
      // The UI for data collection might not have a dedicated error field in `AIStorageState` because `AIStorageState` is used for `aiUsageResult`.
      // Looking at `src/background/index.ts`, `analyzeUsageAndSharing` uses `aiUsageResult`.
      // `analyzeDataCollection` updates `dataCollectionAnswers`.
      // The user requirement says: "For both... Set a storage state with status: "error"..." 
      // But `dataCollection` stores "answers" which is an array.
      // I might need to add an error state for data collection too?
      // The prompt says: "Refactor existing codebase... Introduce explicit error types... Ensure every failure case is communicated back... UI can tell the difference..."
      // "All failures: Set a storage state with status: "error"..."
      // Currently `dataCollectionAnswers` is just `Array`. 
      // I probably need to introduce `dataCollectionError` or similar in storage, OR change how it's stored.
      // Existing code 319-332 sets fallback answers on error.
      // The requirement says "Keep fallback answers, but only after storing the error state."
      // So I will set an error flag in storage, AND set the fallback answers.

      chrome.storage.local.set({
        dataCollectionError: result.error,
        dataCollectionLoading: false
      });

      // Proceed to fallback
      throw new Error(`AI Error: ${result.error.code}`);
    }

    const rawContent = result.content;
    console.log("[background] Raw AI response:", rawContent);

    const cleanedContent = cleanJsonResponse(rawContent);
    if (!cleanedContent) {
      console.error("[background] Failed to clean data collection response");
      return;
    }

    console.log("[background] Cleaned JSON response:", cleanedContent);

    const parsed = JSON.parse(cleanedContent);
    console.log("[background] Parsed response:", parsed);

    const validatedAnswers = validateDataCollectionAnswers(parsed);
    console.log("[background] Validated answers:", validatedAnswers);

    if (!validatedAnswers || validatedAnswers.length === 0) {
      console.error("[background] No valid answers after validation");
      return;
    }

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

    chrome.storage.local.set({
      dataCollectionAnswers: fallbackAnswers,
      dataCollectionUrl: currentTabUrl,
      dataCollectionLoading: false, // Ensure loading is stopped
    });

    chrome.runtime.sendMessage({
      type: "ANSWERS",
      data: fallbackAnswers,
    });
  }
}

async function analyzeUsageAndSharing(policyText: string) {
  try {
    if (!policyText || policyText.trim().length === 0) {
      console.warn(
        "[background] No policy text available for usage and sharing analysis",
      );
      chrome.storage.local.set({
        aiUsageResult: {
          status: "error",
          message: "No policy text available",
        } satisfies AIStorageState,
      });
      return;
    }

    chrome.storage.local.set({
      aiUsageResult: {
        status: "loading",
      } satisfies AIStorageState,
    });

    const prompt = generateUsageAndSharingPrompt(policyText);
    console.log("[background] Generated usage and sharing prompt", {
      promptLength: prompt.length,
      policyTextLength: policyText.length,
    });



    const result = await callAIWorker("usageAndSharing", prompt);

    if (!result.ok) {
      chrome.storage.local.set({
        aiUsageResult: {
          status: "error",
          message: result.error.message,
          code: result.error.code,
          details: result.error.details
        } satisfies AIStorageState,
      });
      return;
    }

    const rawContent = result.content;



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
