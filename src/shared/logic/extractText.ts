// logic/extractText.ts
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export function extractText(html: string): string {
  let doc: Document;

  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    doc = parser.parseFromString(html, "text/html");
  } else {
    const { document } = parseHTML(html);
    doc = document;
  }

  const reader = new Readability(doc).parse();
  const raw = reader?.textContent || doc.body?.textContent || "";

  return cleanText(raw);
}

// ------------------------------
// CLEANUP FUNCTION
// ------------------------------

function cleanText(text: string): string {
  let t = text;

  // ------------------------------
  // Privacy-policy specific cleanup
  // ------------------------------
  t = t.replace(/last\s+updated[:\s].*/gi, "");
  t = t.replace(/effective\s+date[:\s].*/gi, "");
  t = t.replace(/back\s+to\s+top/gi, "");
  t = t.replace(/click here/gi, "");
  t = t.replace(/read more/gi, "");

  // Normalize privacy headers
  t = t.replace(/privacy policy\s*/gi, "Privacy Policy\n\n");
  t = t.replace(/privacy notice\s*/gi, "Privacy Notice\n\n");

  // Normalize Personal Data
  t = t.replace(/\bPersonal\s+Data\b/g, "Personal Data");

  // Section headers → ensure blank line after
  t = t.replace(
    /\n?(Privacy Policy|Privacy Notice|Who we are\?|How to contact us|What categories of personal data do we process\?|Your rights.*|What do we do with your personal data\?)\s*\n/gi,
    (m) => `\n${m.trim()}\n\n`,
  );

  // ------------------------------
  // General formatting cleanup
  // ------------------------------

  // Remove trailing spaces
  t = t.replace(/[ \t]+$/gm, "");

  // Collapse many newlines to max 2
  t = t.replace(/\n{3,}/g, "\n\n");

  // Remove indentation
  t = t.replace(/[ \t]+\n/g, "\n");

  // Collapse multiple spaces
  t = t.replace(/ {2,}/g, " ");

  // Trim spaces around newlines
  t = t.replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n");

  // ---------------------------------------------------------------
  // 🔥 Smart sentence unwrapping (fix "the\ncollection" → "the collection")
  // ---------------------------------------------------------------

  // Rule: newline + lowercase = join into same sentence
  t = t.replace(/([^\.\?\!\:\n])\n([a-z])/g, "$1 $2");

  // Rule: newline + punctuation within sentence: join
  t = t.replace(/([a-z0-9,])\n([a-z])/gi, "$1 $2");

  // Rule: if newline is between two words with no punctuation, join
  t = t.replace(/([a-z0-9])\n([a-z])/gi, "$1 $2");

  // But keep real paragraphs (uppercase after newline)
  // e.g. "Policy\nThe" → keep as paragraph
  t = t.replace(/([a-z])\n([A-Z])/g, "$1\n\n$2");

  // Final cleanup of doubled newlines
  t = t.replace(/\n{3,}/g, "\n\n");

  return t.trim();
}
