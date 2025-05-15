import d3 from "../d3-importer.js"

/* function getUniqueMemberValues(members, feature) {
  return Array.from(new Set(members.map((member) => member[feature])))
} */

/* function createSummaryObject(members, groupedData, arrangement, feature) {
  // "party"
  //   "fraction",
  //     "constituency",
  //     "gender",
  //     "age",
  //     "ageGroup",
  //     // "occupation",
  //     "daysInCouncil",
  //     "nrCommissions",
  //     "nrImpetuses"
  // "nrConflictsOfInterest",

  const obj = {
    arrangement: null,
    nrOfArrangements: 1,
    arrangementStats: null,
    feature: feature,
    nrOfFeatures: null,
    featureStats: null,
    groups: [
      //   {
      //     name: <name>,
      //     nrOfMembers: <count>,
      //     groupStats: {min: ..., max: ..., avg: ...}
      //     subGroups: [
      //       {
      //         name: <name>,
      //         nrOfMembers: <count>,
      //         subGroupStats: {min: ..., max: ..., avg: ...}
      //       }
      //     ]
      //   }
    ]
  }

  if (arrangement) {
    obj.arrangement = arrangement
    obj.nrOfArrangements = groupedData.size
  }

  if (feature) {
    const uniqueValues = getUniqueMemberValues(members, feature)
    obj.nrOfFeatures = uniqueValues.length
  }

  if (!arrangement && feature) {
    obj.arrangement = "Great Council"
    obj.groups.push({ name: "Great Council", nrOfMembers: members.length, subGroups: [] })
  }

  let outerIndex = 0
  for (const [key, value] of groupedData.entries()) {
    // arrangement only
    if (arrangement && !feature) {
      obj.groups.push({ name: key, nrOfMembers: value.length })
    }
    // feature only
    else if (!arrangement && feature) {
      obj.groups[0].subGroups.push({ name: key, nrOfMembers: value.length })
    }
    // both
    else {
      obj.groups.push({ name: key, nrOfMembers: 0, subGroups: [] })

      for (const [key2, value2] of value.entries()) {
        obj.groups[outerIndex].subGroups.push({ name: key2, nrOfMembers: value2.length })
        obj.groups[outerIndex].nrOfMembers = obj.groups[outerIndex].nrOfMembers + value2.length
      }
    }
    outerIndex++
  }
  console.log(obj)
  return obj
} */

const categorialVariables = [
  "party",
  "fraction",
  "constituency",
  "gender",
  "ageGroup",
  "occupation"
]

function calculateStats(data, key) {
  return {
    min: d3.min(data, (d) => d[key]),
    max: d3.max(data, (d) => d[key]),
    mean: Math.round(10 * d3.mean(data, (d) => d[key])) / 10
  }
}

function getGroupsWithCounts(groupedData) {
  const groups = []
  for (const [key, value] of groupedData.entries()) {
    groups.push({ name: key, nrOfMembers: value.length })
  }
  return groups
}

function getNestedGroupsWithCounts(groupedData) {
  const groups = []
  for (const [key, value] of groupedData.entries()) {
    const subGroups = []
    let totalMembers = 0
    for (const [key2, value2] of value.entries()) {
      const subGroupCount = value2.length
      totalMembers += subGroupCount
      subGroups.push({ name: key2, nrOfMembers: subGroupCount })
    }
    groups.push({ name: key, nrOfMembers: totalMembers, subGroups })
  }
  return groups
}

export async function summarize(members, arrangement, feature) {
  const groupingKeys = []

  const stats = {
    selectedArrangement: arrangement,
    selectedFeature: feature,
    groups: null
  }

  let groupedData

  if (arrangement && categorialVariables.includes(arrangement)) {
    // First-level grouping key
    groupingKeys.push((d) => d[arrangement])

    if (feature && categorialVariables.includes(feature)) {
      // Second-level grouping key
      groupingKeys.push((d) => d[feature])
    }

    // Already group the data on one or two levels
    groupedData = d3.group(members, ...groupingKeys)

    if (groupingKeys.length === 1) {
      // Get the number of members in each group
      stats.groups = getGroupsWithCounts(groupedData)
    }

    if (groupingKeys.length === 2) {
      // Get the number of members in each group by adding the members of each subgroup
      stats.groups = getNestedGroupsWithCounts(groupedData)
    }

    if (feature && !categorialVariables.includes(feature)) {
      // Calculate statistics for each group
      let idx = 0
      for (const value of groupedData.values()) {
        stats.groups[idx][feature] = calculateStats(value, feature)
        idx++
      }
    }
  } else if (arrangement && !categorialVariables.includes(arrangement)) {
    // Get overall arrangement stats
    stats[arrangement] = calculateStats(members, arrangement)
    groupingKeys.push((d) => d[arrangement])

    if (feature && categorialVariables.includes(feature)) {
      // feature: true && categorial
      groupingKeys.push((d) => d[feature])
    }

    groupedData = d3.group(members, ...groupingKeys)

    if (groupingKeys.length === 1) {
      // Get the number of members in each group
      stats.groups = getGroupsWithCounts(groupedData)
    }

    if (groupingKeys.length === 2) {
      // Get the number of members in each group by adding the members of each subgroup
      stats.groups = getNestedGroupsWithCounts(groupedData)
    }

    if (feature && !categorialVariables.includes(feature)) {
      // Calculate statistics for each group
      let idx = 0
      for (const value of groupedData.values()) {
        stats.groups[idx][feature] = calculateStats(value, feature)
        idx++
      }
    }
  } else if (!arrangement) {
    if (feature) {
      groupingKeys.push((d) => d[feature])

      groupedData = d3.group(members, ...groupingKeys)

      // Get the number of members in each group
      stats.groups = getGroupsWithCounts(groupedData)

      if (!categorialVariables.includes(feature)) {
        stats[feature] = calculateStats(members, feature)
      }
    }
  }

  console.log(stats)
  console.log(groupedData)

  // createSummaryObject(members, rolledUpData, arrangement, feature)
}
