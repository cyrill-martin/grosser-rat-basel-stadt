<script setup>
import { onMounted, ref, computed, watch } from "vue"
// import { useRoute, useRouter } from "vue-router"
import { NSelect } from "naive-ui"
import { useCouncilStore } from "../stores/council.js"
// import { updateUrl } from "../utils/updateUrl.js"
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const council = useCouncilStore()

// const route = useRoute()
// const router = useRouter()

const props = defineProps(["type"])

// Lifecycle ///////////////////////////////////////////////////////
onMounted(() => {
  props.type === "arrangement"
    ? (value.value = council.seatArrangement)
    : (value.value = council.seatFeature)
})

const label = computed(() => {
  return props.type === "arrangement"
    ? t("seatSelection.label.arrangement")
    : t("seatSelection.label.feature")
})

const value = ref(null)

const options = computed(() => {
  if (props.type === "feature") {
    const filteredOptions = council.seatOptions.filter((item) => item.value !== "occupation")
    return filteredOptions
  }
  return council.seatOptions
})

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
      // updateUrl(route, router, { arrangement: newValue })
      value.value = newValue
    }
  }
)

watch(
  () => council.seatFeature,
  (newValue) => {
    if (props.type !== "arrangement") {
      // updateUrl(route, router, { feature: newValue })
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
      :options="options"
      :id="props.type"
      :placeholder="$t('seatSelection.placeholder')"
      clearable
    />
  </div>
</template>

<style scoped>
label {
  font-size: 14px;
  font-weight: 500;
}
</style>
