<script setup>
import { onMounted, ref, computed, watch } from "vue"
import { useCouncilStore } from "../stores/council.js"

const council = useCouncilStore()

onMounted(() => {
  if (council.seatArrangement) {
    axisTitle.value = getTitle(council.seatArrangement)
  }
})

const axisTitle = ref("")

const loadedVotesMap = computed(() => {
  return council.asOfDate ? council.loadedVoteResultsAsOfDate : council.loadedVoteResultsCurrent
})

watch(
  () => council.seatArrangement,
  (newValue) => {
    axisTitle.value = getTitle(newValue)
  }
)

const log2String = "(log2-Skala)"

watch(
  () => council.xAxisIsLog,
  (newValue) => {
    if (newValue) {
      axisTitle.value = `${axisTitle.value.replace(log2String, "")} ${log2String}`
    } else {
      axisTitle.value = `${axisTitle.value.replace(log2String, "")}`
    }
  }
)

function isNumericKey(key) {
  return Number.isInteger(parseInt(key))
}

function getTitle(seatArrangement) {
  let axisTitle
  const isVote = isNumericKey(seatArrangement)
  if (seatArrangement && !isVote) {
    const featureObj = council.seatOptions.find((option) => option.value === seatArrangement)
    axisTitle = featureObj.label
  } else if (isVote) {
    axisTitle = loadedVotesMap.value.get(seatArrangement).voteTitle
  } else {
    axisTitle = ""
  }
  return council.xAxisIsLog ? `${axisTitle} ${log2String}` : axisTitle
}
</script>

<template>
  <div>{{ axisTitle }}</div>
</template>
