import { ref } from "vue"
import { defineStore } from "pinia"
import { fetchMemberData } from "../utils/data.bs.js"

export const useCouncilStore = defineStore("council", () => {
  const isLoading = ref(false)
  const asOfDate = ref(null)
  const membersCurrent = ref(null)
  const membersAsOfDate = ref(null)

  // Use of testdata
  const membersTestData = ref(null)
  const useTestData = ref(true)

  async function loadTestData() {
    try {
      const data = await import("../utils/testData.json")
      membersTestData.value = data.default.results
    } catch (error) {
      console.error("Error loading test data:", error)
    }
  }

  function setAsOfDate(timestamp) {
    if (timestamp) {
      const utcTimestampInMs = timestamp

      // Add 2 hours in ms (2 * 60 * 60 * 1000)
      const cetTimestampInMs = utcTimestampInMs + 7200000

      const cetDate = new Date(cetTimestampInMs)

      const year = cetDate.getUTCFullYear()
      const month = String(cetDate.getUTCMonth() + 1).padStart(2, "0")
      const day = String(cetDate.getUTCDate()).padStart(2, "0")

      // YYYY-MM-DD
      const formattedDate = `${year}-${month}-${day}`
      console.log(formattedDate)
      asOfDate.value = formattedDate
    } else {
      asOfDate.value = null
    }
  }

  // testData available!!
  async function fetchData() {
    isLoading.value = true

    if (useTestData.value) {
      console.log("loading test data")
      await loadTestData()
    }

    if (asOfDate.value) {
      membersAsOfDate.value = await fetchMemberData(asOfDate.value)
    } else if (!asOfDate.value && !membersCurrent.value) {
      useTestData.value
        ? (membersCurrent.value = membersTestData.value)
        : (membersCurrent.value = await fetchMemberData(null))
    }

    console.log("current members", membersCurrent.value)
    console.log("as of date members", membersAsOfDate.value)

    isLoading.value = false
  }

  return { asOfDate, setAsOfDate, isLoading, membersCurrent, membersAsOfDate, fetchData }
})
