import { extractText } from "../logic/extractText";
import {
  dataCollectionItems,
  type CollectedCategory,
} from "../logic/classifyData";

// const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

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
      // I will do an AI function to make a new Category list based on the old one

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
            content: `Read ${finalPayload.plainText} then Answer with a boolean value (collected) for each of the follwing questions, the answer should ONLY return a JSON array of objects with only two properties ("element" and "collected"). DO NOT CHANGE THE ELEMENTS GIVEN FOR EACH QUESTION, here are the questions and thier corrosponding element ${JSON.stringify(
              dataCollectionItems.map((item) => {
                return `question / ${item.question} - element: ${item.element}`;
              }),
            )}
OUTPUT RULES (important):
- Return ONLY valid JSON
- JSON should only have two proprties (collected) which is either (true or false) and element which is strictly connected to the given question
`,
          },
        ],
        model: "deepseek-ai/DeepSeek-V3.2:novita",
      }).then((response) => {
        const rawAnswers = response.choices[0].message.content;

        let parsedAnswers;
        try {
          const cleaned = rawAnswers
            .trim()
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

          // optionally remove any text before the first "[" or "{"
          const jsonStart = cleaned.indexOf("[");
          const justJson = cleaned.slice(jsonStart);

          parsedAnswers = JSON.parse(justJson);
        } catch (e) {
          console.error("Invalid JSON from AI", rawAnswers);
        }

        chrome.runtime.sendMessage({
          type: "ANSWERS",
          data: parsedAnswers,
        });
      });

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
