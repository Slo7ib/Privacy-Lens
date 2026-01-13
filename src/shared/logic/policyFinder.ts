export function policyFinder() {
  // Multilingual text keywords
  const TEXT_KEYWORDS = [
    // English
    "privacy policy",
    "privacy",
    "terms of service",
    "terms and conditions",
    "legal notice",
    "data policy",
    "imprint",
    "cookie policy",

    // Spanish
    "política de privacidad",
    "privacidad",
    "términos de servicio",
    "términos y condiciones",
    "aviso legal",
    "política de datos",

    // French
    "politique de confidentialité",
    "confidentialité",
    "conditions d'utilisation",
    "mentions légales",
    "politique de données",
    "données personnelles",

    // German
    "datenschutz",
    "datenschutzerklärung",
    "nutzungsbedingungen",
    "impressum",
    "rechtliche hinweise",
    "agb",

    // Italian
    "politica sulla privacy",
    "privacy",
    "termini di servizio",
    "informativa sulla privacy",
    "condizioni d'uso",

    // Portuguese
    "política de privacidade",
    "privacidade",
    "termos de serviço",
    "termos de uso",
    "aviso legal",

    // Dutch
    "privacybeleid",
    "privacy",
    "gebruiksvoorwaarden",
    "algemene voorwaarden",
    "privacyverklaring",

    // Russian
    "политика конфиденциальности",
    "конфиденциальность",
    "условия использования",
    "пользовательское соглашение",

    // Japanese
    "プライバシーポリシー",
    "個人情報保護方針",
    "利用規約",
    "プライバシー",
    "個人情報",

    // Chinese (Simplified)
    "隐私政策",
    "隐私权政策",
    "服务条款",
    "使用条款",
    "隐私保护",
    "用户协议",

    // Chinese (Traditional)
    "隱私政策",
    "隱私權政策",
    "服務條款",
    "使用條款",

    // Korean
    "개인정보 처리방침",
    "개인정보",
    "이용약관",
    "서비스 약관",

    // Arabic
    "سياسة الخصوصية",
    "الخصوصية",
    "شروط الخدمة",
    "شروط الاستخدام",

    // Swedish
    "integritetspolicy",
    "sekretesspolicy",
    "användarvillkor",

    // Polish
    "polityka prywatności",
    "prywatność",
    "warunki użytkowania",

    // Turkish
    "gizlilik politikası",
    "gizlilik",
    "kullanım şartları",
  ];

  // URL patterns (language-independent)
  const URL_PATTERNS = [
    /privacy[-_]?policy/i,
    /privacy/i,
    /terms[-_]?(of[-_]?)?service/i,
    /terms[-_]?(and[-_]?)?conditions/i,
    /legal/i,
    /datenschutz/i,
    /impressum/i,
    /privacidad/i,
    /confidentialite/i,
    /privacidade/i,
    /privacybeleid/i,
    /rgpd/i,
    /gdpr/i,
    /dsgvo/i,
    /mentions[-_]?legales/i,
    /politica[-_]?privacidad/i,
    /informativa[-_]?privacy/i,
  ];

  const SELECTOR = "a, button, [role='link']";
  const allLinks = Array.from(document.querySelectorAll(SELECTOR));

  // Score each link based on how likely it is to be a privacy policy
  const scoredLinks = allLinks.map((el) => {
    let score = 0;
    const text = el.textContent?.toLowerCase() || "";
    const url = el instanceof HTMLAnchorElement ? el.href.toLowerCase() : "";

    // Check text content (higher weight for exact matches)
    for (const keyword of TEXT_KEYWORDS) {
      if (text === keyword) {
        score += 10; // Exact match
      } else if (text.includes(keyword)) {
        score += 5; // Partial match
      }
    }

    // Check URL patterns
    for (const pattern of URL_PATTERNS) {
      if (pattern.test(url)) {
        score += 7;
      }
    }

    // Boost if in footer (common location for privacy links)
    const isInFooter = el.closest("footer") !== null;
    if (isInFooter) {
      score += 2;
    }

    // Penalize if text is very long (privacy links are usually short)
    if (text.length > 50) {
      score -= 3;
    }

    return { element: el, score, text, url };
  });

  // Sort by score and get the highest
  scoredLinks.sort((a, b) => b.score - a.score);
  const foundElement =
    scoredLinks[0]?.score > 0 ? scoredLinks[0].element : null;

  const result = {
    found: Boolean(foundElement),
    text: foundElement?.textContent?.trim() || "",
    url: foundElement instanceof HTMLAnchorElement ? foundElement.href : "",
  };


  return result;
}
