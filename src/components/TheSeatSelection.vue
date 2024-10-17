<script setup>
import { computed } from "vue"
import { NSelect } from "naive-ui"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps(["type"])

const label = computed(() => {
  return props.type === "arrangement"
    ? t("seatSelection.label.arrangement")
    : t("seatSelection.label.feature")
})
</script>

<template>
  <label for="{{ props.type }}">{{ label }}</label>
  <n-select :id="props.type"></n-select>
</template>

<style scoped>
label {
  font-weight: bold;
}
</style>
