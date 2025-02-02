<script setup>
import { onMounted, ref, computed, watch } from "vue"
import { useCouncilStore } from "../stores/council.js"

const council = useCouncilStore()

onMounted(() => {
  if (council.seatFeature) {
    legendTitle.value = getTitle(council.seatFeature)
  }
})

const legendTitle = ref("")

const loadedVotesMap = computed(() => {
  return council.asOfDate ? council.loadedVoteResultsAsOfDate : council.loadedVoteResultsCurrent
})

watch(
  () => council.seatFeature,
  (newValue) => {
    legendTitle.value = getTitle(newValue)
  }
)

const log2String = "(log2-Skala)"

watch(
  () => council.legendIsLog,
  (newValue) => {
    if (newValue) {
      legendTitle.value = `${legendTitle.value.replace(log2String, "")} ${log2String}`
    } else {
      legendTitle.value = `${legendTitle.value.replace(log2String, "")}`
    }
  }
)

function isNumericKey(key) {
  return Number.isInteger(parseInt(key))
}

function getTitle(seatFeature) {
  let legendTitle
  const isVote = isNumericKey(seatFeature)
  if (seatFeature && !isVote) {
    const featureObj = council.seatOptions.find((option) => option.value === seatFeature)
    legendTitle = featureObj.label
  } else if (isVote) {
    legendTitle = loadedVotesMap.value.get(seatFeature).voteTitle
  } else {
    legendTitle = ""
  }
  return council.legendIsLog ? `${legendTitle} ${log2String}` : legendTitle
}
</script>

<template>
  <div>{{ legendTitle }}</div>
</template>
