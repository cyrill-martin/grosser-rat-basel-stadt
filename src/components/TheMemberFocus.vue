<script setup>
import { ref, watch } from "vue"
import { NSelect } from "naive-ui"
import { useCouncilStore } from "../stores/council.js"

const council = useCouncilStore()

const value = ref(null)

watch(
  () => value.value,
  (newValue) => {
    council.setMemberFocus(newValue)
  }
)

watch(
  () => council.focusOptions,
  () => {
    value.value = null
  }
)
</script>

<template>
  <div v-if="council.focusOptions">
    <label for="member-focus">{{ $t("memberFocusSelection.label") }}</label>
    <n-select
      :placeholder="$t('memberFocusSelection.placeholder')"
      v-model:value="value"
      :options="council.focusOptions"
      id="member-focus"
      multiple
    />
  </div>
</template>

<style scoped>
label {
  font-weight: bold;
}
</style>
