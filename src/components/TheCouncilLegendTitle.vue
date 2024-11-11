<script setup>
import { ref, computed, watch } from "vue"
import { useCouncilStore } from "../stores/council.js"

const council = useCouncilStore()

const legendTitle = ref("")

const loadedVotesMap = computed(() => {
  return council.asOfDate ? council.loadedVoteResultsAsOfDate : council.loadedVoteResultsCurrent
})

watch(
  () => council.seatFeature,
  (newValue) => {
    const isVote = isNumericKey(newValue)
    if (newValue && !isVote) {
      const featureObj = council.seatOptions.find((option) => option.value === newValue)
      legendTitle.value = featureObj.label
    } else if (isVote) {
      legendTitle.value = loadedVotesMap.value.get(newValue).voteTitle
    } else {
      legendTitle.value = ""
    }
  }
)

function isNumericKey(key) {
  return Number.isInteger(parseInt(key))
}
</script>

<template>
  <div class="legend-title">{{ legendTitle }}</div>
</template>

<style scoped>
.legend-title {
  font-weight: 500;
}
</style>
