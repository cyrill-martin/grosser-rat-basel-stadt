<script setup>
import { NCard } from "naive-ui"

// Use a handler for i18n
import { useI18n } from "vue-i18n"
const { t } = useI18n()
</script>

<template>
  <n-card :title="t('modal.card.title')"> ttt </n-card>
</template>
