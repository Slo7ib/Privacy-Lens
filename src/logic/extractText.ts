// logic/extractText.ts
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { parseHTML } from "linkedom";

export function extractText(html: string): string {
  // Use linkedom in service workers (where DOMParser doesn't exist)
  // or fall back to native DOMParser in browser contexts
  let doc: Document;
  
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    doc = parser.parseFromString(html, "text/html");
  } else {
    // Service worker context - use linkedom
    const { document } = parseHTML(html);
    doc = document;
  }

  const reader = new Readability(doc).parse();
  if (reader?.textContent) return reader.textContent;

  const td = new TurndownService();
  return td.turndown(html);
}
