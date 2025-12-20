import type { AIStorageState } from "../app/types/AIStorageState";
import { extractText } from "../logic/extractText";
import { dataCollectionItems } from "../logic/dataCategories";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "mistralai/mistral-nemo";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "POLICY_PAGE") {
    const { data } = msg;

    try {
      sendResponse({ status: "ok" });
    } catch {}

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

async function getOpenRouterApiKey(): Promise<string | null> {
  const result = await chrome.storage.local.get("openRouterApiKey");
  return (result.openRouterApiKey as string | undefined) || null;
}

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

async function callOpenRouterApi(
  prompt: string,
): Promise<{ choices: Array<{ message: { content: string } }> } | null> {
  try {
    const apiKey = await getOpenRouterApiKey();
    if (!apiKey) {
      console.error(
        "[background] OpenRouter API key not found. Please set it in chrome.storage.local with key 'openRouterApiKey'",
      );
      return null;
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": chrome.runtime.getURL(""),
        "X-Title": "Privacy Lens",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[background] OpenRouter API error:",
        response.status,
        errorText,
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("[background] Error calling OpenRouter API:", err);
    return null;
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

    const rawResponse = await callOpenRouterApi(prompt);
    if (!rawResponse) {
      throw new Error("Failed to get response from OpenRouter API");
    }

    const rawContent: string =
      rawResponse?.choices[0]?.message?.content || "";

    if (!rawContent) {
      console.error("[background] Empty response from data collection API");
      return;
    }

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

    const rawResponse = await callOpenRouterApi(prompt);
    if (!rawResponse) {
      throw new Error("Failed to get response from OpenRouter API");
    }

    const rawContent: string = rawResponse?.choices[0]?.message?.content || "";

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
