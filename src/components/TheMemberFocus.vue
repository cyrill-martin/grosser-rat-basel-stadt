<script setup>
import { onMounted, ref, watch, h } from "vue"
import { useRoute, useRouter } from "vue-router"
import { NSelect, NTag } from "naive-ui"
import { useCouncilStore } from "../stores/council.js"
import { focusColors, focusOpacity } from "../utils/customColors.js"
import { updateUrl } from "../utils/updateUrl.js"
import d3 from "../d3-importer.js"

const council = useCouncilStore()
const route = useRoute()
const router = useRouter()

// Lifecycle ///////////////////////////////////////////////////////
onMounted(() => {
  value.value = council.memberFocus
})

const value = ref(null)

watch(
  () => value.value,
  (newValue) => {
    council.setMemberFocus(newValue)
  }
)

watch(
  () => council.memberFocus,
  (newValue) => {
    value.value = newValue
    updateUrl(route, router)
  }
)

// Make sure to reset any focus when the options change due to a change of the shown council
watch(
  () => council.focusOptions,
  () => {
    council.memberFocus ? (council.memberFocus.length = 0) : null
    updateUrl(route, router)
  }
)

function colorAccessor(index) {
  const rgb = d3.color(focusColors[index % focusColors.length])
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${focusOpacity})`
}

function renderTag({ option, handleClose }) {
  const index = council.focusOptions.findIndex((opt) => opt.value === option.value)
  return h(
    NTag,
    {
      type: option.type,
      closable: true,
      onMousedown: (e) => {
        e.preventDefault()
      },
      onClose: (e) => {
        e.stopPropagation()
        handleClose()
      },
      style: {
        backgroundColor: colorAccessor(index)
      }
    },
    { default: () => option.label }
  )
}
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
      :max-tag-count="12"
      :render-tag="renderTag"
      filterable
    />
  </div>
</template>

<style scoped>
label {
  font-size: 14px;
  font-weight: 500;
}
</style>
