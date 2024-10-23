<script setup>
import { ref, computed, watch } from "vue"
import { NSelect } from "naive-ui"
import { useCouncilStore } from "../stores/council.js"
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const council = useCouncilStore()

const props = defineProps(["type"])

const label = computed(() => {
  return props.type === "arrangement"
    ? t("seatSelection.label.arrangement")
    : t("seatSelection.label.feature")
})

const value = ref(null)

watch(
  () => value.value,
  (newValue) => {
    props.type === "arrangement"
      ? council.setSeatArrangement(newValue)
      : council.setSeatFeature(newValue)
  }
)

watch(
  () => council.seatArrangement,
  (newValue) => {
    if (props.type === "arrangement") {
      value.value = newValue
    }
  }
)

watch(
  () => council.seatFeature,
  (newValue) => {
    if (props.type !== "arrangement") {
      value.value = newValue
    }
  }
)
</script>

<template>
  <div v-if="council.seatOptions">
    <label for="{{ props.type }}">{{ label }}</label>
    <n-select
      v-model:value="value"
      :options="council.seatOptions"
      :id="props.type"
      :placeholder="$t('seatSelection.placeholder')"
    />
  </div>
</template>

<style scoped>
label {
  font-weight: bold;
}
</style>
