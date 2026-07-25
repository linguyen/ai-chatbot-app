import "i18next";

import commonEN from "../../public/locales/en/common.json";
import translationEN from "../../public/locales/en/translation.json";
import { defaultNS } from "./index";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;

    resources: {
      common: typeof commonEN;
      translation: typeof translationEN;
    };
  }
}