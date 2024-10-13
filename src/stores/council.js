import { ref } from "vue"
import { defineStore } from "pinia"
import {
  fetchMemberData,
  fetchFractionData,
  fetchCommissionData,
  fetchConflictOfInterestData,
  fetchImpetusData,
  fetchListOfVotes,
  fetchVoteResults
} from "../utils/data.bs.js"
import {
  mapCouncilMembers,
  addFractions,
  addCounts,
  mapVotesData,
  addVoteResults
} from "../utils/mappingDataBs.js"
import { useI18n } from "vue-i18n"

export const useCouncilStore = defineStore("council", () => {
  // i18n handler
  const { t } = useI18n()

  // The date picker data
  const asOfDate = ref(null) // yyyy-mm-dd
  const asOfTimestamp = ref(null) // timestamp (ms)
  const lastAsOfTimestamp = ref(null) // timestamp (ms)

  // Modal handling
  const isLoading = ref(false)
  const currentlyLoading = ref(null)

  // Council data
  const membersCurrent = ref(null)
  const membersAsOfDate = ref(null)
  const title = ref(null)

  // Vote titles for table
  const listOfVotesCurrent = ref(null)
  const listOfVotesAsOfDate = ref(null)

  // Loaded vote results
  const loadedVoteResults = ref(new Map())

  // Use of testdata
  const useTestData = ref(false) // <==== TEST DATA BOOLEAN
  const membersTestData = ref(null)

  async function loadTestData() {
    try {
      const data = await import("../utils/testData.json")
      return data.default.results
    } catch (error) {
      console.error("Error loading test data:", error)
    }
  }
  ////////////////////////

  function setAsOfDate(timestamp) {
    if (timestamp) {
      setAsOfTimestamp(timestamp)

      // Add 2 hours in ms (2 * 60 * 60 * 1000)
      const cetTimestamp = timestamp + 7200000
      const cetDate = new Date(cetTimestamp)
      const year = cetDate.getUTCFullYear()
      const month = String(cetDate.getUTCMonth() + 1).padStart(2, "0")
      const day = String(cetDate.getUTCDate()).padStart(2, "0")

      // YYYY-MM-DD
      const formattedDate = `${year}-${month}-${day}`
      asOfDate.value = formattedDate
    } else {
      asOfDate.value = null
    }
  }

  function setAsOfTimestamp(timestamp) {
    asOfTimestamp.value = timestamp
  }

  function setLastAsOfTimestamp(timestamp) {
    lastAsOfTimestamp.value = timestamp
  }

  function resetAsOfDateMembers() {
    membersAsOfDate.value = null
  }

  function resetAsOfDateListOfVotes() {
    listOfVotesAsOfDate.value = null
  }

  function setCouncilLoadingState() {
    isLoading.value = !isLoading.value
  }

  async function setCouncilTitle() {
    title.value =
      (await asOfDate.value) && membersAsOfDate.value
        ? `${t("home.title.councilAsOfDate")} ${asOfDate.value}`
        : t("home.title.councilCurrent")
  }

  async function checkTestData() {
    // Load test data if not already done
    if (useTestData.value && !membersTestData.value) {
      membersTestData.value = await loadTestData()
    }
  }

  async function fetchCouncilMembers() {
    if (asOfDate.value) {
      // Fetch asOfDate council if date is given
      membersAsOfDate.value = await fetchMemberData(asOfDate.value)
    } else if (!asOfDate.value && !membersCurrent.value) {
      // Fetch current council data or test data if no date is given
      // and current members have not been fetched already
      useTestData.value
        ? (membersCurrent.value = membersTestData.value)
        : (membersCurrent.value = await fetchMemberData(null))
    }
  }

  async function fetchRecentListOfVotes() {
    if (asOfDate.value) {
      // Fetch asOfDate votes if date is given
      listOfVotesAsOfDate.value = await fetchListOfVotes(asOfDate.value, null)
    } else if (!asOfDate.value && !listOfVotesCurrent.value) {
      listOfVotesCurrent.value = await fetchListOfVotes(null, null)
    }
  }

  async function getData() {
    // Set target members
    const targetMembers = asOfDate.value ? membersAsOfDate : membersCurrent

    // Remember timestamp
    setLastAsOfTimestamp(asOfTimestamp.value)

    // Only load new data if no current members are available
    // ...or there's an asOfDate
    if (!membersCurrent.value || asOfDate.value) {
      // Show data loading modal
      setCouncilLoadingState()

      // Check for test data
      await checkTestData()

      // Fetch the members data
      currentlyLoading.value = t("modal.currentlyLoading.members")
      await fetchCouncilMembers()
      // Map the members data
      targetMembers.value = await mapCouncilMembers(targetMembers.value, asOfDate.value)

      // Enrich the mapped data ////////////////////////
      const memberIds = targetMembers.value.map((member) => member.id)

      // Fractions
      // Get fractions data
      currentlyLoading.value = t("modal.currentlyLoading.fractions")
      const fractionsMap = await fetchFractionData(memberIds, asOfDate.value)
      // Add fractions
      addFractions(targetMembers.value, fractionsMap)

      // Commissions
      currentlyLoading.value = t("modal.currentlyLoading.commissions")
      const commissionsMap = await fetchCommissionData(memberIds, asOfDate.value)
      addCounts(targetMembers.value, commissionsMap, "nrCommissions")

      // Conflicts of interest
      if (!asOfDate.value) {
        // Only for current members
        currentlyLoading.value = t("modal.currentlyLoading.conflictsOfInterest")
        const conflictsOfInterestMap = await fetchConflictOfInterestData(memberIds)
        addCounts(targetMembers.value, conflictsOfInterestMap, "nrConflictsOfInterest")
      }

      // Impetuses
      currentlyLoading.value = t("modal.currentlyLoading.impetuses")
      const impetusesMap = await fetchImpetusData(memberIds, asOfDate.value)
      addCounts(targetMembers.value, impetusesMap, "nrImpetuses")
      // End of enriching //////////////////////////////

      // List of votes
      const targetVotes = asOfDate.value ? listOfVotesAsOfDate : listOfVotesCurrent
      currentlyLoading.value = t("modal.currentlyLoading.listOfVotes")
      await fetchRecentListOfVotes()
      targetVotes.value = await mapVotesData(targetVotes.value)

      // Hide the data loading modal
      setCouncilLoadingState()
      currentlyLoading.value = null
    }

    // Set the council title for the visualization
    await setCouncilTitle()

    // console.log("current members", membersCurrent.value)
    // console.log("as of date members", membersAsOfDate.value)
    // console.log("current votes", listOfVotesCurrent.value)
    // console.log("as of date votes", listOfVotesAsOfDate.value)
  }

  function setloadedVoteResults(voteData) {
    loadedVoteResults.value.set(voteData.voteNr, voteData)
  }

  async function getVoteResults(voteData) {
    const targetMembers = asOfDate.value ? membersAsOfDate : membersCurrent

    setCouncilLoadingState()
    currentlyLoading.value = t("modal.currentlyLoading.voteResults")

    setloadedVoteResults(voteData)

    const voteResultsMap = await fetchVoteResults(voteData.voteNr)
    addVoteResults(targetMembers.value, voteData.voteNr, voteResultsMap)

    setCouncilLoadingState()

    console.log(targetMembers.value)
  }

  return {
    asOfDate,
    setAsOfDate,
    isLoading,
    currentlyLoading,
    asOfTimestamp,
    lastAsOfTimestamp,
    membersCurrent,
    membersAsOfDate,
    title,
    resetAsOfDateMembers,
    resetAsOfDateListOfVotes,
    getData,
    listOfVotesCurrent,
    listOfVotesAsOfDate,
    getVoteResults
  }
})
