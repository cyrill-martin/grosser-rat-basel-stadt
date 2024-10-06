<script setup>
import { NRadioGroup, NRadioButton, NDatePicker, NFlex, NButton, NModal } from "naive-ui"
import { ref, computed, watch } from "vue"
import { useCouncilStore } from "../stores/council.js"
import TheModal from "./TheModal.vue"

// Use a handler for i18n
import { useI18n } from "vue-i18n"
const { t } = useI18n()

// Use the council store
const council = useCouncilStore()

// Council radio button default
const option = ref("current")

// Date selection
const asOfDate = ref(null)

// Watch the radio buttons
watch(
  () => option.value,
  () => {
    if (option.value === "current") {
      asOfDate.value = null
    }
  }
)

// Watch the date
watch(
  () => asOfDate.value,
  () => {
    council.setAsOfDate(asOfDate.value)
  }
)

// The radio buttons
const options = computed(() => [
  {
    label: t("councilSelection.radioButton.current"),
    value: "current"
  },
  {
    label: t("councilSelection.radioButton.asOfDate"),
    value: "asOfDate"
  }
])

// Date picker
const disabledDatePicker = computed(() => {
  return option.value === "current"
})

// Data loading button
// const disabledButton = computed(() => {
//   return asOfDate.value === null
// })

// The data loading modal
const showModal = computed(() => {
  return council.isLoading
})
</script>

<template>
  <n-modal v-model:show="showModal" :mask-closable="false" style="width: 80%">
    <TheModal />
  </n-modal>
  <div style="flex: 1">
    <n-radio-group v-model:value="option" size="small">
      <n-radio-button
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :label="option.label"
      />
    </n-radio-group>
  </div>
  <div style="flex: 1">
    <n-flex :size="0">
      <!-- Hint: in JavaScript, months are zero-indexed. (2009, 1, 1) is 2009-02-01!! -->
      <n-date-picker
        size="small"
        input-readonly
        :actions="null"
        type="date"
        :first-day-of-week="0"
        :is-date-disabled="
          (date) => {
            return date < new Date(2009, 1, 1) || date > new Date(Date.now() - 86400000)
          }
        "
        :placeholder="t('councilSelection.datePicker.selectDate')"
        :disabled="disabledDatePicker"
        v-model:value="asOfDate"
      />
      <!-- :disabled="disabledButton" -->
      <n-button type="primary" size="small" @click="council.fetchData">
        {{ $t("councilSelection.button.loadData") }}
      </n-button>
    </n-flex>
  </div>
</template>
