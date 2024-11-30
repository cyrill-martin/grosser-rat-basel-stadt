import { useCouncilStore } from "../stores/council.js"

const council = useCouncilStore()

export async function updateUrl(route, router) {
  const currentQuery = { ...route.query }

  const params = {
    councilDate: council.asOfTimestamp ? council.asOfTimestamp : "current",
    arrangement: council.seatArrangement || null,
    feature: council.seatFeature || null,
    focus: council.memberFocus || null
  }

  Object.keys(params).forEach((parameter) => {
    const value = params[parameter]

    if (value === null || (parameter === "focus" && Array.isArray(value) && value.length === 0)) {
      delete currentQuery[parameter]
    } else {
      if (parameter === "focus" && Array.isArray(value)) {
        currentQuery[parameter] = value.join(",")
      } else {
        currentQuery[parameter] = value
      }
    }
  })

  return router.push({ query: currentQuery })
}
