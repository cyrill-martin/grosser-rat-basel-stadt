<script setup>
import { onMounted } from "vue"
import { useRoute } from "vue-router"
import { useCouncilStore } from "../stores/council.js"

// Use the router
const route = useRoute()
// Use the council store
const council = useCouncilStore()

onMounted(async () => {
  // Access query parameters
  const qParam = route.query.q

  if (qParam) {
    return
  } else {
    council.getData()
  }
})
</script>

<template>
  <span></span>
</template>
