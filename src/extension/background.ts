import { extractText } from "../logic/extractText";
import {
  collectedCategories,
  type CollectedCategory,
} from "../logic/classifyData";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const HUGGINGFACE_API_KEY = "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";
console.log("[background] service worker loaded");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "POLICY_RESULT") {
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
      // I will do an AI function to switch classify Data based on the finalPayload text, then i will finally send the response to the pop ui

      async function aiFunc(payload: {
        messages: Array<{ role: string; content: string }>;
        model: string;
      }) {
        const response = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            headers: {
              Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              model: payload.model,
              messages: payload.messages,
            }),
          },
        );
        const result = await response.json();
        return result;
      }

      aiFunc({
        messages: [
          {
            role: "user",
            content: `You are given this array of objects: ${JSON.stringify(collectedCategories)}

Update ONLY the "collected" property based on the privacy-policy text below.

OUTPUT RULES (important):
- Return ONLY valid JSON
- Do NOT include backticks
- Do NOT include explanation
- Do NOT include markdown formatting
- Return ONLY a pure JSON array

TEXT:
${finalPayload.plainText}`,
          },
        ],
        model: "deepseek-ai/DeepSeek-V3.2:novita",
      }).then((response) => {
        const raw = response.choices[0].message.content;
        let updatedCategories: CollectedCategory[] = [];

        try {
          updatedCategories = JSON.parse(raw);
          // restore icons from original collectedCategories because AI wipes them
          updatedCategories = updatedCategories.map((aiItem) => {
            const original = collectedCategories.find(
              (o) => o.key === aiItem.key,
            );
            if (!original) return aiItem as CollectedCategory; // fallback (should never happen)

            return {
              ...original, // copy the original full object (including icon)
              collected: aiItem.collected, // overwrite only this field
            };
          });
        } catch (e) {
          console.error("AI did not return valid JSON:", raw);
          return;
        }
        chrome.storage.local.set({ updatedCategories });
        chrome.runtime.sendMessage({
          type: "UPDATED_CATEGORIES",
          updatedCategories,
        });
      });
      // I finally got a good json response, now i just need to link it to the pop up ui and do the same thing i did with classify data to render only the true ones

      // if message came from popup, send to content script
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

// fetch("https://openrouter.ai/api/v1/chat/completions", {
//   method: "POST",
//   headers: {
//     Authorization: `Bearer ${OPENROUTER_API_KEY}`,
//     "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
//     "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     model: "openai/gpt-4o",
//     messages: [
//       {
//         role: "user",
//         content: "What is the meaning of life?",
//       },
//     ],
//   }),
// });
