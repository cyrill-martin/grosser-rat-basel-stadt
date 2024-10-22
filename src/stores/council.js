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
  const { t } = useI18n()

  // Modal handling
  const isLoading = ref(false) // Show modal or not
  const currentlyLoading = ref(null) // Label of the currently loaded data

  function setCouncilLoadingState() {
    isLoading.value = !isLoading.value
  }

  // Use of testdata
  const useTestData = ref(true) // <==== TEST DATA BOOLEAN
  const membersTestData = ref(null)

  async function loadTestData() {
    try {
      const data = await import("../utils/testData.json")
      return data.default.results
    } catch (error) {
      console.error("Error loading test data:", error)
    }
  }

  async function checkTestData() {
    // Load test data if not already done
    if (useTestData.value && !membersTestData.value) {
      membersTestData.value = await loadTestData()
    }
  }

  const abortFetching = ref(0)

  // The MAIN function piecing together everything
  async function getData() {
    // Set target members
    const targetMembers = asOfDate.value ? membersAsOfDate : membersCurrent
    // Remember timestamp
    setLastAsOfTimestamp(asOfTimestamp.value)
    // Only load new data if no current members are available
    // ...or there's an asOfDate
    try {
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
        currentlyLoading.value = t("modal.currentlyLoading.listOfVotes")
        if (asOfDate.value) {
          // Make sure to reset asOfDate votes if only the date has changed
          resetAsOfDateListOfVotes()
        }
        await fetchRecentListOfVotes(listOfVotesSize.value, null)
        // Create content for the seat dropdowns (selections and focus)
        await createSelectOptions(targetMembers.value)
        // Hide the data loading modal
        setCouncilLoadingState()
        currentlyLoading.value = null
      } else {
        // Only update the select options if going back to current council
        await createSelectOptions(targetMembers.value)
      }
    } catch (error) {
      console.log(error)
      setCouncilLoadingState()

      abortFetching.value += 1

      return
    }
    // Set the council title for the visualization
    await setCouncilTitle()
  }

  // The date picker data
  const asOfTimestamp = ref(null) // timestamp (ms)
  const lastAsOfTimestamp = ref(null) // timestamp (ms)
  const asOfDate = ref(null) // yyyy-mm-dd
  // --> This is also the indication whether it's about current or asOfDate council
  const asOfDateUi = ref(null)

  function setAsOfDate(timestamp) {
    if (timestamp) {
      setAsOfTimestamp(timestamp)

      // Add 2 hours in ms (2 * 60 * 60 * 1000)
      const cetTimestamp = timestamp + 7200000
      const cetDate = new Date(cetTimestamp)
      const year = cetDate.getUTCFullYear()
      const month = String(cetDate.getUTCMonth() + 1).padStart(2, "0")
      const day = String(cetDate.getUTCDate()).padStart(2, "0")

      const formattedDate_api = `${year}-${month}-${day}`
      const formattedDate_ui = `${day}.${month}.${year}`

      asOfDate.value = formattedDate_api
      asOfDateUi.value = formattedDate_ui
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

  // Council data
  const membersCurrent = ref(null) // Keep in state even if asOfDate council is shown
  const membersAsOfDate = ref(null) // Keep in state as long as asOfDate council is shown
  const title = ref(null) // The title of the currently selected council

  function resetAsOfDateMembers() {
    membersAsOfDate.value = null
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

  async function setCouncilTitle() {
    title.value =
      (await asOfDate.value) && membersAsOfDate.value
        ? `${t("home.title.councilAsOfDate")} ${asOfDateUi.value}`
        : t("home.title.councilCurrent")
  }

  // Votes for table
  const listOfVotesCurrent = ref([]) // Last final votes of the current council; stays in state
  const listOfVotesAsOfDate = ref([]) // Last final votes of the asOfDate council

  // The pagination of the table
  const listOfVotesSize = ref(20) // Inital number of final votes to fetch from data.bs
  const listOfVotesPageSize = ref(5) // Number of votes shown per page

  // Loaded vote results
  const loadedVoteResultsCurrent = ref(new Map()) // Map object to quickly get the vote titles
  const loadedVoteResultsAsOfDate = ref(new Map()) // Map object to quickly get the vote titles

  function resetAsOfDateListOfVotes() {
    listOfVotesAsOfDate.value = []
  }

  async function fetchRecentListOfVotes(limit, offset) {
    const targetVotes = asOfDate.value ? listOfVotesAsOfDate : listOfVotesCurrent
    let fetchedVotes = await fetchListOfVotes(asOfDate.value, limit, offset)
    fetchedVotes = await mapVotesData(fetchedVotes)
    targetVotes.value = [...targetVotes.value, ...fetchedVotes]

    // console.log(asOfDate.value ? "asOfDate votes" : "current votes", targetVotes.value)
  }

  function setloadedVoteResults(voteData) {
    const targetList = asOfDate.value ? loadedVoteResultsAsOfDate : loadedVoteResultsCurrent
    targetList.value.set(voteData.voteNr, voteData)
  }

  function resetAsOfDateLoadedVotes() {
    loadedVoteResultsAsOfDate.value = new Map()
  }

  async function getVoteResults(voteData) {
    const targetMembers = asOfDate.value ? membersAsOfDate : membersCurrent
    setCouncilLoadingState()
    currentlyLoading.value = t("modal.currentlyLoading.voteResults")
    setloadedVoteResults(voteData)
    const voteResultsMap = await fetchVoteResults(voteData.voteNr)
    addVoteResults(targetMembers.value, voteData.voteNr, voteResultsMap)
    addToSeatOptions(voteData)
    setCouncilLoadingState()
  }

  // The seat selections
  // Currently still handled here as the functions are called based on fetching council data
  const seatOptions = ref(null)
  const focusOptions = ref(null)

  function createSeatOptions() {
    let values = [
      "fraction",
      "constituency",
      "daysInCouncil",
      "nrCommissions",
      "nrConflictsOfInterest",
      "nrImpetuses",
      "gender",
      "age",
      "ageGroup",
      "occupation"
    ]

    if (!asOfDate.value) {
      // Add "party" if it's the current council
      values.unshift("party")
    }

    let options = values.map((value) => {
      return { label: t(`seatSelection.${value}`), value }
    })

    if (!asOfDate.value && loadedVoteResultsCurrent.value.size !== 0) {
      let voteOptions = []
      loadedVoteResultsCurrent.value.forEach((value, key) => {
        voteOptions.push({ label: value.voteTitle, value: key })
      })

      options = [
        ...options,
        {
          type: "group",
          label: t("votesTable.label"),
          key: "votes",
          children: voteOptions
        }
      ]
    }

    seatOptions.value = options
  }

  function addToSeatOptions(voteData) {
    if (seatOptions.value.at(-1).type !== "group") {
      seatOptions.value = [
        ...seatOptions.value,
        {
          type: "group",
          label: t("votesTable.label"),
          key: "votes",
          children: []
        }
      ]
    }

    const group = seatOptions.value.find((element) => element.type === "group")

    group.children.push({
      label: voteData.voteTitle,
      value: voteData.voteNr
    })
  }

  function createFocusOptions(members) {
    const names = members
      .map((member) => `${member.name}_${member.id}`)
      .sort()
      .map((name) => {
        const sliced = name.split("_")
        return { label: sliced[0], value: sliced[1] }
      })
    focusOptions.value = names
  }

  async function createSelectOptions(members) {
    createSeatOptions()
    createFocusOptions(members)
  }

  return {
    asOfDate,
    setAsOfDate,
    isLoading,
    currentlyLoading,
    membersAsOfDate,
    title,
    resetAsOfDateMembers,
    resetAsOfDateListOfVotes,
    getData,
    listOfVotesCurrent,
    listOfVotesAsOfDate,
    getVoteResults,
    fetchRecentListOfVotes,
    listOfVotesPageSize,
    listOfVotesSize,
    seatOptions,
    focusOptions,
    resetAsOfDateLoadedVotes,
    abortFetching
  }
})
