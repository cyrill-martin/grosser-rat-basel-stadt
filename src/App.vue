<script setup>
import { NConfigProvider, NFlex } from "naive-ui"
import { RouterView } from "vue-router"
import TheHeader from "./components/layout/TheHeader.vue"
import TheFooter from "./components/layout/TheFooter.vue"
import TheUrlHandler from "./components/TheUrlHandler.vue"
import { naiveUithemeOverrides } from "./utils/naiveUithemeOverrides.js"
</script>

<template>
  <n-config-provider :theme-overrides="naiveUithemeOverrides">
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
