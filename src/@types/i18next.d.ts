import "i18next";
import type auth from "../i18n/locales/en/auth.json";
import type common from "../i18n/locales/en/common.json";
import type home from "../i18n/locales/en/home.json";
import type market from "../i18n/locales/en/market.json";
import type prompt from "../i18n/locales/en/prompt.json";
import type search from "../i18n/locales/en/search.json";
import type subscription from "../i18n/locales/en/subscription.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      home: typeof home;
      market: typeof market;
      search: typeof search;
      prompt: typeof prompt;
      subscription: typeof subscription;
      auth: typeof auth;
    };
  }
}
