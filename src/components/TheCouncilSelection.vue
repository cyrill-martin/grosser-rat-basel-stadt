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
import { useCouncilStore } from "../stores/council.js"
import { noData } from "../utils/message.js"
import TheModal from "./TheModal.vue"

// Use a handler for i18n
import { useI18n } from "vue-i18n"
const { t } = useI18n()

const council = useCouncilStore()

const message = useMessage()

// Lifecycle ///////////////////////////////////////////////////////
onMounted(() => {
  option.value = council.membersAsOfDate ? "asOfDate" : "current"
  asOfDate.value = council.asOfDate
})

// Council radio button default
const option = ref("current")

// Date selection
const asOfDate = ref(null)

// Watch the radio buttons
watch(
  () => option.value,
  () => {
    if (option.value === "current") {
      asOfDate.value = null // Reset data picker
      council.setAsOfDate(null) // Make sure to reset date in state anyways
      council.resetAsOfDateMembers()
      council.resetAsOfDateListOfVotes()
      council.resetAsOfDateLoadedVotes()
      council.resetCurrentlyFocusedMembers()
      council.resetSelectedVotes()
      council.getData() // Get current members (probably from state)
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
        <n-radio-button
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :label="option.label"
        />
      </n-radio-group>
    </div>
    <div>
      <n-flex :size="5">
        <!-- Hint: in JavaScript, months are zero-indexed. (2009, 1, 1) is 2009-02-01!! -->
        <n-date-picker
          ref="datePickerRef"
          :disabled="disabledDatePicker"
          v-model:value="asOfDate"
          size="small"
          :format="'dd.MM.yyyy'"
          input-readonly
          :actions="null"
          type="date"
          :first-day-of-week="0"
          :is-date-disabled="
            (date) => {
              return date < new Date(2009, 1, 1) || date > new Date(Date.now() - 86400000)
            }
          "
          :placeholder="placeholderDatePicker"
        />
        <n-button :disabled="disabledButton" type="primary" size="small" @click="council.getData">
          {{ $t("councilSelection.button.loadData") }}
        </n-button>
      </n-flex>
    </div>
  </n-flex>
</template>

<style scoped>
.n-date-picker {
  width: 139px; /* Set your desired width */
}
</style>
