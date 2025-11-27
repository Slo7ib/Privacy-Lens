// logic/policyFinder.ts

export function policyFinder() {
  const KEYWORDS = [
    "privacy policy",
    "privacy",
    "terms of service",
    "terms and conditions",

    "legal notice",
    "data policy",
    "imprint",
  ];

  const SELECTOR = "a, button, [role='link']";

  const allLinks = Array.from(document.querySelectorAll(SELECTOR));

  const foundElement = allLinks.find((el) => {
    const text = el.textContent?.toLowerCase() || "";
    return KEYWORDS.some((kw) => text.includes(kw));
  });

  const result = {
    found: Boolean(foundElement),
    text: foundElement?.textContent?.trim() || "",
    url: foundElement instanceof HTMLAnchorElement ? foundElement.href : "",
  };

  return result;
}
