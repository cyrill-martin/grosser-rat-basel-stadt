<script setup>
import { onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useCouncilStore } from "../stores/council.js"
import { updateUrl } from "../utils/updateUrl.js"

const route = useRoute()
const router = useRouter()

const council = useCouncilStore()

function isNumericValue(value) {
  return Number.isInteger(Number(value))
}

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

    if (isNumericValue(arrangement) || isNumericValue(feature)) {
      console.log(
        "I should fetch vote results and also check whether the vote is actually in the table already"
      )
    }

    if (arrangement) council.setSeatArrangement(arrangement)
    if (feature) council.setSeatFeature(feature)
    if (focus) council.setMemberFocus(focus.split(","))
  } else {
    await council.getData()
    updateUrl(route, router)
  }
})

// async function checkLoadedVotes(councilDate, voteNr) {
//   const targetVotes =
//     councilDate === "current" ? council.listOfVotesCurrent : council.listOfVotesAsOfDate

//   const voteObj = targetVotes.find((vote) => vote.voteNr === voteNr)

//   if (!voteObj) {
//     // load votes until vote is there
//   }

//   // fetch actual vote results
//   // set voteImported to true
// }
</script>

<template>
  <span></span>
</template>
