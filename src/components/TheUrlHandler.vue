<script setup>
import { onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useCouncilStore } from "../stores/council.js"
import { updateUrl } from "../utils/updateUrl.js"

const route = useRoute()
const router = useRouter()

const council = useCouncilStore()

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

    if (arrangement) council.setSeatArrangement(arrangement)
    if (feature) council.setSeatFeature(feature)
    if (focus) council.setMemberFocus(focus.split(","))
  } else {
    await council.getData()
    updateUrl(route, router)
  }
})
</script>

<template>
  <span></span>
</template>
