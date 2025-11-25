// const parsePolicyHtml = (rawHtml: string) => {
//   try {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(rawText, "text/html");

//     const title = doc.querySelector("title")?.textContent || "no found title";

//     const firstParagraph =
//       doc.querySelector("p")?.textContent || "no content found";

//     return { title, firstParagraph };
//   } catch (error) {
//     console.error("Error parsing HTML:", error);
//     return null;
//   }
// };

// const listner = (message) => {
//   let parsedData;
//   if (message.type === "POLICY_RESPONSE") {
//     const rawHtml = message.data.final;

//     if (rawHtml) {
//       parsedData = parsePolicyHtml(rawHtml);
//     }
//   } else {
//     console.error("There was an error in parsing");
//   }
//   return parsedData;
// };
// chrome.runtime.onMessage.addListener()
