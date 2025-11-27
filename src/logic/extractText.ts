// logic/extractText.ts

export function extractText(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.innerText.trim();
}
