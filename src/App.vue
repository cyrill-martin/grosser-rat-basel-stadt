<script setup>
import { defineAsyncComponent } from "vue"
import { NConfigProvider, NMessageProvider, NFlex } from "naive-ui"
import { RouterView } from "vue-router"
const TheHeader = defineAsyncComponent(() => import("./components/layout/TheHeader.vue"))
const TheFooter = defineAsyncComponent(() => import("./components/layout/TheFooter.vue"))
const TheUrlHandler = defineAsyncComponent(() => import("./components/TheUrlHandler.vue"))
import { naiveUithemeOverrides } from "./utils/naiveUithemeOverrides.js"

import de from "date-fns/locale/de"
import { createLocale } from "naive-ui"

const dateDeDE = createLocale({
  name: "de-DE",
  locale: de
})
</script>

<template>
  <n-config-provider :theme-overrides="naiveUithemeOverrides" :date-locale="dateDeDE">
    <n-message-provider>
      <TheUrlHandler />
      <n-flex vertical :size="0" class="app-container">
        <header>
          <TheHeader />
        </header>
        <main>
          <RouterView />
        </main>
        <footer>
          <TheFooter />
        </footer>
      </n-flex>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.app-container {
  min-height: 100vh; /* Container has at leas 100% viewport height */
}

header {
  padding: 1rem;
}

main {
  flex-grow: 1; /* Main content expands to fill any remaining space */
  padding: 0 1rem;
}

footer {
  padding: 1rem;
}
</style>
