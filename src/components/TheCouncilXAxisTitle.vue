<script setup>
import { ref, computed, watch } from "vue"
import { useCouncilStore } from "../stores/council.js"

const council = useCouncilStore()

const axisTitle = ref("")

const loadedVotesMap = computed(() => {
  return council.asOfDate ? council.loadedVoteResultsAsOfDate : council.loadedVoteResultsCurrent
})

watch(
  () => council.seatArrangement,
  (newValue) => {
    const isVote = isNumericKey(newValue)
    if (newValue && !isVote) {
      const featureObj = council.seatOptions.find((option) => option.value === newValue)
      axisTitle.value = featureObj.label
    } else if (isVote) {
      axisTitle.value = loadedVotesMap.value.get(newValue).voteTitle
    } else {
      axisTitle.value = ""
    }
  }
)

function isNumericKey(key) {
  return Number.isInteger(parseInt(key))
}
</script>

<template>
  <div class="x-axis-title">{{ axisTitle }}</div>
</template>

<style scoped>
.x-axis-title {
  text-align: center;
  font-weight: bold;
}
</style>
