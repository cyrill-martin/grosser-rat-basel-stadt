<script setup>
import {
  NRadioGroup,
  NRadioButton,
  NDatePicker,
  NFlex,
  NButton,
  NModal,
  useMessage
} from "naive-ui"
import { onMounted, ref, computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useCouncilStore } from "../stores/council.js"
import { noData } from "../utils/message.js"
import TheModal from "./TheModal.vue"
import { updateUrl } from "../utils/updateUrl.js"

// Use a handler for i18n
import { useI18n } from "vue-i18n"
const { t } = useI18n()

const council = useCouncilStore()
const route = useRoute()
const router = useRouter()
const message = useMessage()

// Lifecycle ///////////////////////////////////////////////////////
onMounted(() => {
  option.value = council.asOfTimestamp ? "asOfDate" : "current"
  asOfDate.value = council.asOfTimestamp
  if (council.numberOfFetches > 0) {
    updateUrl(route, router)
  }
})

// Council radio button default
const option = ref("current")

// Date selection
const asOfDate = ref(null)

// Watch the radio buttons
watch(
  () => option.value,
  async (newValue) => {
    if (newValue === "current") {
      asOfDate.value = null // Always reset date picker
      if (council.membersAsOfDate) {
        // Reset data if there was actually asOfDate data
        await council.resetAsOfCouncilState()
        await council.getData()
        updateUrl(route, router)
      }
    }
  }
)

watch(
  () => council.membersAsOfDate,
  (newValue) => {
    if (newValue) updateUrl(route, router)
  }
)

// Watch the date
watch(
  () => asOfDate.value,
  (newValue) => {
    // Is number!!
    council.setAsOfDate(newValue)
  }
)

watch(
  () => council.abortFetching,
  () => {
    noData(message, t("message.error"))
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
const datePickerRef = ref(null)
const disabledDatePicker = computed(() => {
  return option.value === "current"
})

const placeholderDatePicker = computed(() => {
  return disabledDatePicker.value ? "" : t("councilSelection.datePicker.selectDate")
})

// Data loading button
const disabledButton = computed(() => {
  return asOfDate.value === null || asOfDate.value === council.lastAsOfTimestamp
})

// The data loading modal
const showModal = computed(() => {
  return council.isLoading
})
</script>

<template>
  <n-modal v-model:show="showModal" :mask-closable="false">
    <TheModal />
  </n-modal>
  <n-flex :size="15">
    <div>
      <n-radio-group v-model:value="option" size="small">
        <n-radio-button v-for="option in options" :key="option.value" :value="option.value" :label="option.label" />
      </n-radio-group>
    </div>
    <div>
      <n-flex :size="5">
        <!-- Hint: in JavaScript, months are zero-indexed. (2009, 1, 1) is 2009-02-01!! -->
        <n-date-picker ref="datePickerRef" :disabled="disabledDatePicker" v-model:value="asOfDate" size="small"
          :format="'dd.MM.yyyy'" input-readonly :actions="null" type="date" :first-day-of-week="0" :is-date-disabled="(date) => {
            return date < new Date(2009, 1, 1) || date > new Date(Date.now() - 86400000)
          }
            " :placeholder="placeholderDatePicker" />
        <n-button :disabled="disabledButton" type="primary" size="small" @click="council.getData">
          {{ $t("councilSelection.button.loadData") }}
        </n-button>
      </n-flex>
    </div>
  </n-flex>
</template>

<style scoped>
.n-date-picker {
  width: 139px;
  /* Set your desired width */
}
</style>
