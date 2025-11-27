// logic/extractText.ts
import { Readability } from "@mozilla/readability";
export function extractText(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const parsedText = new Readability(doc).parse();
  return parsedText?.textContent ?? "";
}
