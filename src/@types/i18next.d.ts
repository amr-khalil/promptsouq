import "i18next";
import type auth from "../i18n/locales/en/auth.json";
import type common from "../i18n/locales/en/common.json";
import type home from "../i18n/locales/en/home.json";
import type market from "../i18n/locales/en/market.json";
import type prompt from "../i18n/locales/en/prompt.json";
import type search from "../i18n/locales/en/search.json";
import type sell from "../i18n/locales/en/sell.json";
import type subscription from "../i18n/locales/en/subscription.json";
import type dashboard from "../i18n/locales/en/dashboard.json";
import type gallery from "../i18n/locales/en/gallery.json";
import type featureRequests from "../i18n/locales/en/feature-requests.json";
import type issues from "../i18n/locales/en/issues.json";

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
      sell: typeof sell;
      dashboard: typeof dashboard;
      gallery: typeof gallery;
      "feature-requests": typeof featureRequests;
      issues: typeof issues;
    };
  }
}
