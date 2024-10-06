import { createI18n } from "vue-i18n"
import messagesDe from "../i18n/de.json"

export const i18n = createI18n({
  locale: "de", // Set the default locale
  legacy: false,
  messages: {
    de: messagesDe
  }
})
