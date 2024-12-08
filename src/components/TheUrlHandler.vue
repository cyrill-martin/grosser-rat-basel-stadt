<script setup>
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useCouncilStore } from "../stores/council.js"
import { updateUrl } from "../utils/updateUrl.js"

const route = useRoute()
const router = useRouter()

const council = useCouncilStore()

function isNumericValue(value) {
  return Number.isInteger(Number(value))
}

const numericArrangement = ref(false)
const numericFeature = ref(false)

onMounted(async () => {
  // Access query parameters
  const qParams = route.query

  if (qParams.councilDate) {
    const councilDate = qParams.councilDate || null

    const arrangement = qParams.arrangement || null
    const feature = qParams.feature || null
    const focus = qParams.focus || null

    if (councilDate) {
      councilDate === "current"
        ? council.setAsOfDate(null)
        : await council.setAsOfDate(parseInt(councilDate))
    }

    await council.getData()

    if (arrangement) {
      numericArrangement.value = isNumericValue(arrangement)

      let arrangementVoteAvailable

      if (numericArrangement.value) {
        arrangementVoteAvailable = await checkLoadedVotes(councilDate, arrangement)

        arrangementVoteAvailable
          ? council.setSeatArrangement(arrangement)
          : council.setSeatArrangement("fraction")
      } else {
        council.setSeatArrangement(arrangement)
      }
    }

    if (feature) {
      numericFeature.value = isNumericValue(feature)

      let featureVoteAvailable

      if (numericFeature.value) {
        featureVoteAvailable = await checkLoadedVotes(councilDate, feature)

        featureVoteAvailable ? council.setSeatFeature(feature) : council.setSeatFeature("fraction")
      } else {
        council.setSeatFeature(feature)
      }
    }

    if (focus) council.setMemberFocus(focus.split(","))
  } else {
    await council.getData()
    updateUrl(route, router)
  }
})

async function checkLoadedVotes(councilDate, voteNr) {
  const targetVotes =
    councilDate === "current" ? council.listOfVotesCurrent : council.listOfVotesAsOfDate

  const voteObj = targetVotes.find((vote) => vote.voteNr === voteNr)

  if (!voteObj) {
    return false
  } else {
    if (!voteObj.voteImported) {
      await council.getVoteResults(voteObj)
      voteObj.voteImported = true
    }
    return true
  }
}
</script>

<template>
  <span></span>
</template>
