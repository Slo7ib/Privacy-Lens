Update:
- fix the decription to get better SEO, consult reddit and chatgpt
- add sharing extension btn
- Make the extension have the usage and sharing section to be only after subscription (ask cahtgpt)

Lemon API (test): in dashboard
Varient id (test): 1288055
checkout url (same): https://privacylens.lemonsqueezy.com/checkout
---------------------
You are implementing Lemon Squeezy subscription licensing for my Chrome extension.
Goal:
Split the extension into two parts:
1) FREE → privacy icons rendering
2) PRO → "usage and sharing" AI summary

Only PRO requires subscription.

We will use Lemon Squeezy license keys to unlock PRO features.

IMPORTANT RULES:
- NEVER call Lemon Squeezy directly from the extension
- ALL license validation must go through the Cloudflare Worker
- API keys must ONLY live in Worker secrets

i have already added my lemon squeezy API key and product variant ID to my worker secrets, the API key is called (LEMON_SQUEEZY_API_KEY) and the variant ID *testmode* is called (varient_Id). as for my checkout page url its: https://privacylens.lemonsqueezy.com/checkout 
========================
WHAT TO IMPLEMENT
========================
PART 1 — Cloudflare Worker

Create endpoints:

POST /validate-license
- body: { licenseKey }
- call Lemon Squeezy API:
  POST https://api.lemonsqueezy.com/v1/licenses/validate
- send API key in Authorization header
- return:
  { valid: true/false }

POST /check-license
- body: { licenseKey }
- revalidate license (same as above)
- used for background checks

Use environment secrets:
- LEMON_SQUEEZY_API_KEY
- varient_Id


========================

PART 2 — Extension

Implement:

LicenseManager.ts

Responsibilities:
- store license key in chrome.storage.local
- store premium boolean
- validate once on activation
- cache premium locally
- revalidate silently every 3–7 days

Functions:

activateLicense(key)
→ call /validate-license
→ if valid, save key + premium=true

isPremium()
→ read from storage only (fast)

backgroundCheck()
→ occasionally call /check-license

========================

PART 3 — UI

Add to results page:

After FREE icons section:
Show locked PRO section:

- blurred preview of "usage & sharing"
- text:
  "Unlock full data sharing and tracking analysis"

Buttons:
[ Upgrade to Pro ] → open Lemon checkout URL
[ Enter License ] → modal input


Always show free results first.
Only scan for the AI summary after user is a pro member, if not only scan for the icons part.
very important: keep the current design for the usage and sharing part and re-use it for the premium version

========================

UX RULES

- license entered once only
- never ask repeatedly
- instant unlock
- no login system
- no accounts
========================

Security Rules

- no API keys in extension
- all Lemon calls from worker only

========================

Expected result

User flow:
Scan → see free results → sees locked section → upgrades → enters license once → PRO unlocks permanently