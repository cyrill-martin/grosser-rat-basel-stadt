<script setup>
import { NCard, NSpin, NFlex } from "naive-ui"
import { useCouncilStore } from "../stores/council.js"
// import { computed } from "vue"
// Use a handler for i18n
import { useI18n } from "vue-i18n"
const { t } = useI18n()

// Use the council store
const council = useCouncilStore()
</script>

<template>
  <n-card :title="t('modal.card.title')" style="width: 80%">
    <n-flex class="container">
      <div><n-spin size="medium" /></div>
      <div>{{ council.currentlyLoading }}</div>
    </n-flex>
  </n-card>
</template>

<style scoped>
.container {
  align-items: center;
}
</style>
