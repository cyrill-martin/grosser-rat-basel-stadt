import "./assets/main.css"
// import "vfonts/Inter.css"
import "vfonts/FiraCode.css"

import { createApp } from "vue"
import { createPinia } from "pinia"
import screenSizeService from "./utils/screenSizeService"
import { i18n } from "./utils/i18nService.js"

import App from "./App.vue"
import router from "./router"

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(screenSizeService) // Listen to screen size globaly

app.mount("#app")
