import { ref, watch } from "vue"
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
import { formatDate } from "../utils/formatDate.js"
import { useI18n } from "vue-i18n"

export const useCouncilStore = defineStore("council", () => {
  const { t } = useI18n()

  // Data  ////////////////////////////////////////////////////////////

  // Council data
  const membersCurrent = ref(null) // Keep in state even if asOfDate council is shown
  const membersAsOfDate = ref(null) // Keep in state as long as asOfDate council is shown
  const title = ref(null) // The title of the currently selected council

  // User selections
  const seatArrangement = ref(null)
  const seatFeature = ref(null)
  const memberFocus = ref(null)

  const xAxisIsLog = ref(false)
  const legendIsLog = ref(false)

  function setXAxisIsLog(boolean) {
    xAxisIsLog.value = boolean
  }

  function setLegendIsIsLog(boolean) {
    legendIsLog.value = boolean
  }

  watch(
    () => memberFocus.value,
    (newValue) => {
      if (newValue) {
        if (asOfDate.value && membersAsOfDate.value) {
          membersAsOfDate.value.forEach(
            (member) => (member.focus = newValue.includes(member.id) ? true : false)
          )
        } else {
          membersCurrent.value.forEach(
            (member) => (member.focus = newValue.includes(member.id) ? true : false)
          )
        }
      }
    }
  )

  // The date picker data
  const asOfTimestamp = ref(null) // timestamp (ms)
  const lastAsOfTimestamp = ref(null) // timestamp (ms)
  const asOfDate = ref(null) // yyyy-mm-dd (COUNCIL INDICATOR)
  const asOfDateUi = ref(null) // dd.mm.yyyy for Swiss users

  // Modal handling
  const isLoading = ref(false) // Show modal or not
  const currentlyLoading = ref(null) // Label of the currently loaded data

  // Abort data fetching from data.bs.ch
  const abortFetching = ref(0)

  // The seat selections
  // Currently still handled here as the functions are called based on fetching council data
  const seatOptions = ref(null)
  const focusOptions = ref(null)

  // Votes for table
  const listOfVotesCurrent = ref([]) // Last final votes of the current council; stays in state
  const listOfVotesAsOfDate = ref([]) // Last final votes of the asOfDate council

  // The pagination of the votes table
  const listOfVotesSize = ref(20) // Inital number of final votes to fetch from data.bs
  const listOfVotesPageSize = ref(5) // Number of votes shown per page

  // Loaded vote results
  const loadedVoteResultsCurrent = ref(new Map()) // Map object to quickly get the vote titles
  const loadedVoteResultsAsOfDate = ref(new Map()) // Map object to quickly get the vote titles

  const numberOfFetches = ref(0)
  const newFetchingDone = ref(false)

  // Summary text
  const summaryText = ref(null)

  async function resetCurrentlyFocusedMembers() {
    membersCurrent.value.forEach((member) => (member.focus = false))
  }

  async function handleCouncilChange(selection) {
    selection === "arrangement"
      ? (seatArrangement.value = "fraction")
      : (seatFeature.value = "fraction")
  }

  const criticalSelections = ["party", "occupation", "nrConflictsOfInterest"]

  async function handleCriticalSelections() {
    const checkAndHandleChange = async (type, value) => {
      if (
        criticalSelections.includes(value) ||
        (Number.isInteger(Number(value)) && value !== null)
      ) {
        await handleCouncilChange(type)
      }
    }
    await checkAndHandleChange("arrangement", seatArrangement.value)
    await checkAndHandleChange("feature", seatFeature.value)
  }

  function resetSelectedVotes() {
    if (Number.isInteger(Number(seatArrangement.value)) && seatArrangement.value !== null) {
      handleCouncilChange("arrangement")
    }

    if (Number.isInteger(Number(seatFeature.value)) && seatFeature.value !== null) {
      handleCouncilChange("feature")
    }
  }

  // The MAIN function piecing together everything
  async function getData() {
    // Handle critical selections if asOfDate council data is fetched
    // i.e. "party", "occupation", "nrConflictsOfInterest", and any selected votes
    if (asOfDate.value) await handleCriticalSelections()

    newFetchingDone.value = false
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
          // Only available for current members
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
        // Update the select options only if going back to current council (data is already there)
        await createSelectOptions(targetMembers.value)
      }

      newFetchingDone.value = true
      numberOfFetches.value += 1
    } catch (error) {
      console.log(error)
      setCouncilLoadingState()
      // A watcher keeps track of this number and aborts fetching if needed
      abortFetching.value += 1
      return
    }
    // Set the council title for the visualization
    await setCouncilTitle()
  }

  // Setters //////////////////////////////////////////////////////////
  function setCouncilLoadingState() {
    isLoading.value = !isLoading.value
  }

  async function setAsOfDate(timestamp) {
    if (timestamp) {
      asOfDate.value = formatDate(timestamp, "api")
      asOfDateUi.value = formatDate(timestamp, "ui")
    } else {
      asOfDate.value = null
    }
    setAsOfTimestamp(timestamp)
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

  function setSeatArrangement(value) {
    seatArrangement.value = value
  }

  function setSeatFeature(value) {
    seatFeature.value = value
  }

  function setMemberFocus(value) {
    memberFocus.value = value
  }

  function setloadedVoteResults(voteData) {
    const targetList = asOfDate.value ? loadedVoteResultsAsOfDate : loadedVoteResultsCurrent
    targetList.value.set(voteData.voteNr, voteData)
  }

  function resetAsOfDateLoadedVotes() {
    loadedVoteResultsAsOfDate.value = new Map()
  }

  function resetAsOfDateListOfVotes() {
    listOfVotesAsOfDate.value = []
  }

  async function resetAsOfCouncilState() {
    // setAsOfDate(null)
    resetAsOfDateMembers()
    resetAsOfDateListOfVotes()
    resetAsOfDateLoadedVotes()
    resetCurrentlyFocusedMembers()
    resetSelectedVotes()
  }

  // Methods //////////////////////////////////////////////////////////
  async function fetchCouncilMembers() {
    if (asOfDate.value) {
      // Fetch asOfDate council if date is given
      membersAsOfDate.value = await fetchMemberData(asOfDate.value)
    } else if (!asOfDate.value && !membersCurrent.value) {
      membersCurrent.value = await fetchMemberData(null)
    }
  }

  async function setCouncilTitle() {
    title.value =
      (await asOfDate.value) && membersAsOfDate.value
        ? `${t("home.title.councilAsOfDate")} ${asOfDateUi.value}`
        : `${t("home.title.councilCurrent")} (${formatDate(Date.now(), "ui")})`
  }

  async function fetchRecentListOfVotes(limit, offset) {
    const targetVotes = asOfDate.value ? listOfVotesAsOfDate : listOfVotesCurrent
    let fetchedVotes = await fetchListOfVotes(asOfDate.value, limit, offset)
    fetchedVotes = await mapVotesData(fetchedVotes)
    targetVotes.value = [...targetVotes.value, ...fetchedVotes]
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

  function createSeatOptions() {
    let values = [
      // "party"
      "fraction",
      "constituency",
      "gender",
      "age",
      "ageGroup",
      // "occupation",
      "daysInCouncil",
      "nrCommissions",
      "nrImpetuses"
      // "nrConflictsOfInterest",
    ]

    if (!asOfDate.value) {
      // If current council
      values.unshift("party") // Add party
      values.push("nrConflictsOfInterest") // Add conflicts of interest
      // Add occupation
      const targetIndex = values.indexOf("ageGroup") + 1
      values.splice(targetIndex, 0, "occupation")
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

  function setSummaryText(text) {
    summaryText.value = text
    console.log(summaryText.value)
  }

  return {
    asOfDate,
    asOfTimestamp,
    setAsOfDate,
    isLoading,
    currentlyLoading,
    membersAsOfDate,
    membersCurrent,
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
    abortFetching,
    seatArrangement,
    seatFeature,
    memberFocus,
    setSeatArrangement,
    setSeatFeature,
    setMemberFocus,
    loadedVoteResultsCurrent,
    loadedVoteResultsAsOfDate,
    newFetchingDone,
    numberOfFetches,
    resetCurrentlyFocusedMembers,
    resetSelectedVotes,
    resetAsOfCouncilState,
    xAxisIsLog,
    legendIsLog,
    setXAxisIsLog,
    setLegendIsIsLog,
    setSummaryText,
    summaryText
  }
})
