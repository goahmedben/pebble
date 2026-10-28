// Integration settings. Production (camelus.si, alpaga.si) by default; `?env=local` targets the local
// docker stacks. Each value can also be overridden per visit with a query parameter (see README.md).
const params = new URLSearchParams(location.search);
const local = params.get("env") === "local";

// Fill these in before deploying. Both are public by design.
const CAMELUS_KEY = ""; // pk_live_… from Camelus → Settings → Products → pebble → Feedback widget
const GA4_ID = ""; // G-… measurement ID of the GA4 property Alpaga reads
// Demo users get plus-addresses of this inbox (you+ana@…), so Camelus's "shipped" emails reach you.
const MAILBOX = "";

export const config = {
  camelus: {
    key: params.get("ckey") || CAMELUS_KEY,
    script: params.get("cscript") || (local ? "http://localhost:8097/w/v1.js" : "https://camelus.si/w/v1.js"),
    api: params.get("capi") || (local ? "http://localhost:3231" : "https://api.camelus.si"),
    headless: params.get("headless") === "true",
    locale: params.get("locale") || "",
  },
  alpaga: {
    ga4: params.get("ga") || GA4_ID,
  },
  mailbox: params.get("mail") || MAILBOX,
};
