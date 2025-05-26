import d3 from "../d3-importer.js"

export async function summarize(members, arrangement, feature, translations, date) {
  const summaryObject = await createSummaryObject(members, arrangement, feature)
  const summary = writeSummary(summaryObject, arrangement, feature, translations, date)
  return summary
}

function writeSummary(obj, arrangement, feature, translations) {
  // Default text
  const defaultText = "Die 100 Mitglieder des Grossen Rates Basel-Stadt"

  // Selections text
  const groupedByLabel = getGroupedByLabel(arrangement, translations)
  const featuringLabel = getFeaturingLabel(obj.featuring, translations)
  const extraGroupingVotingLabel = getExtraGroupingVotingLabel(arrangement, feature)
  const extraFeaturingVotingLabel = getExtraFeaturingVotingLabel(feature)

  const groupedByText = `gruppiert nach${extraGroupingVotingLabel}"${groupedByLabel}"`
  const featuringText = obj.featuring
    ? ` und in einem zweiten Schritt nach${extraFeaturingVotingLabel}"${featuringLabel}"`
    : null
  const selectionsText = featuringText ? groupedByText + featuringText : groupedByText

  // Nr of groups text
  const nrOfGroupsLabel = getNrOfGroupsLabel(obj.groups.length)
  const nrOfGroupsText = `Gruppiert nach${extraGroupingVotingLabel}"${groupedByLabel}" besteht der Grosse Rat aus ${obj.groups.length} ${nrOfGroupsLabel}`

  // Additional grouping text
  const maxGroups = findMaxGroups(obj)
  console.log(maxGroups)
  const nrOfMaxGroupsLabel = getNrOfGroupsLabel(maxGroups.length)
  const maxGroupsText = `Grösste ${nrOfMaxGroupsLabel} betreffend${extraGroupingVotingLabel}"${groupedByLabel}": ${getListOfMaxGroups(maxGroups)}`

  // Additional grouping text
  const additionalGroupingText = getAdditionalGroupingText(obj, maxGroupsText, groupedByLabel)

  // Sub-group text(s)
  const subGroupText = getSubGroupText(
    obj,
    extraFeaturingVotingLabel,
    maxGroups,
    groupedByLabel,
    translations,
    featuringLabel
  )

  // Default summary text
  let summaryText = `${defaultText}: ${selectionsText}.
${nrOfGroupsText}.
${additionalGroupingText}
`
  // Add sub-group texts(s) if necesarry
  if (subGroupText) summaryText += `${subGroupText}`

  // Clean up the text
  const finalText = cleanUpText(summaryText)

  return finalText
}

const categorialVariables = [
  "party",
  "fraction",
  "constituency",
  "gender",
  "ageGroup",
  "occupation"
]

function isNumericValue(value) {
  return Number.isInteger(Number(value))
}

function getGroupedByLabel(arrangement, translations) {
  return arrangement ? translations.arrangement : translations.feature
}

function getFeaturingLabel(featuring, translations) {
  return featuring ? translations.feature : null
}

function getExtraGroupingVotingLabel(arrangement, feature) {
  return (arrangement && isNumericValue(arrangement)) ||
    (!arrangement && feature && isNumericValue(feature))
    ? "@Abstimmung@"
    : "@"
}

function getExtraFeaturingVotingLabel(feature) {
  return feature && isNumericValue(feature) ? "@Abstimmung@" : "@"
}

function getNrOfGroupsLabel(nrOfGroups) {
  return nrOfGroups === 1 ? "Gruppe" : "Gruppen"
}

function getMaxNrOfMembers(obj) {
  const maxNrOfMembers = obj.groups.reduce((max, current) => {
    return current.nrOfMembers > max ? current.nrOfMembers : max
  }, 0)
  return maxNrOfMembers
}

function findMaxGroups(obj) {
  const maxNrOfMembers = getMaxNrOfMembers(obj)
  const maxGroups = obj.groups.filter((group) => group.nrOfMembers === maxNrOfMembers)
  return maxGroups
}

function getNrOfGroupMembersLabel(nrOfMembers) {
  return nrOfMembers === 1 ? "Mitglied" : "Mitglieder"
}

function getListOfMaxGroups(maxGroups) {
  return maxGroups
    .map((group) => {
      const nrOfMaxGroupMembersLabel = getNrOfGroupMembersLabel(group.nrOfMembers)
      return `${group.name} (${group.nrOfMembers} ${nrOfMaxGroupMembersLabel})`
    })
    .join(", ")
}

function getCategorialSubGroupText(subGroups) {
  const text = subGroups.map((group) => {
    const membersLabel = getNrOfGroupMembersLabel(group.nrOfMembers)
    return `- ${group.name} (${group.nrOfMembers} ${membersLabel})\n`
  })
  return text.join("")
}

function getAdditionalGroupingText(obj, maxGroupsText, groupedByLabel) {
  let additionalGroupingText

  if (categorialVariables.includes(obj.groupedBy) || isNumericValue(obj.groupedBy)) {
    additionalGroupingText = `${maxGroupsText}.`
  } else {
    additionalGroupingText = `${groupedByLabel}: 
- minimaler Wert: ${obj[obj.groupedBy].min}
- maximaler Wert: ${obj[obj.groupedBy].max}
- durchschnittlicher Wert: ${obj[obj.groupedBy].mean}
${maxGroupsText}.`
  }

  return additionalGroupingText
}

function getSubGroupTextLabel(group, extraFeaturingVotingLabel, groupedByLabel, translations) {
  let subGroupTextLabel
  if (extraFeaturingVotingLabel === "@Abstimmung@") {
    subGroupTextLabel =
      group.subGroups.length === 1 ? "Abstimmungsresultat" : "Abstimmungsresultate"
  } else {
    subGroupTextLabel = group.subGroups.length === 1 ? groupedByLabel : translations.featurePlural
  }

  return subGroupTextLabel
}

function getSubGroupText(
  obj,
  extraFeaturingVotingLabel,
  maxGroups,
  groupedByLabel,
  translations,
  featuringLabel
) {
  let subGroupText

  if (
    obj.featuring &&
    (categorialVariables.includes(obj.featuring) || isNumericValue(obj.featuring))
  ) {
    subGroupText = maxGroups
      .map((group) => {
        const subGroupTextLabel = getSubGroupTextLabel(
          group,
          extraFeaturingVotingLabel,
          groupedByLabel,
          translations
        )

        return `Innerhalb der Gruppe "${group.name}" hat es ${group.subGroups.length} ${subGroupTextLabel}: 
${getCategorialSubGroupText(group.subGroups)}`
      })
      .join("\n")
  } else if (obj.featuring && !categorialVariables.includes(obj.featuring)) {
    subGroupText = maxGroups
      .map((group) => {
        return `${featuringLabel} innerhalb der Gruppe "${group.name}": 
- minimaler Wert: ${group[obj.featuring].min}
- maximaler Wert: ${group[obj.featuring].max}
- durchschnittlicher Wert: ${group[obj.featuring].mean}`
      })
      .join("\n")
  }

  return subGroupText
}

function cleanUpText(text) {
  return text.replace(/@/g, " ")
}

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

async function createSummaryObject(members, arrangement, feature) {
  const groupingKeys = []

  const obj = {
    groupedBy: arrangement ? arrangement : feature,
    groups: null
  }

  const arrangementIsNumeric = arrangement ? isNumericValue(arrangement) : false
  const featureIsNumeric = feature ? isNumericValue(feature) : false

  if (arrangement && feature) obj.featuring = feature

  let groupedData

  if (arrangement && (categorialVariables.includes(arrangement) || arrangementIsNumeric)) {
    // First-level grouping key
    groupingKeys.push((d) => d[arrangement])

    if (feature && (categorialVariables.includes(feature) || featureIsNumeric)) {
      // Second-level grouping key
      groupingKeys.push((d) => d[feature])
    }

    // Already group the data on one or two levels
    groupedData = d3.group(members, ...groupingKeys)

    if (groupingKeys.length === 1) {
      // Get the number of members in each group
      obj.groups = getGroupsWithCounts(groupedData)
    }

    if (groupingKeys.length === 2) {
      // Get the number of members in each group by adding the members of each subgroup
      obj.groups = getNestedGroupsWithCounts(groupedData)
    }

    if (feature && !categorialVariables.includes(feature) && !featureIsNumeric) {
      // Calculate statistics for each group
      let idx = 0
      for (const value of groupedData.values()) {
        obj.groups[idx][feature] = calculateStats(value, feature)
        idx++
      }
    }
  } else if (arrangement && !categorialVariables.includes(arrangement) && !arrangementIsNumeric) {
    // Get overall arrangement stats
    obj[arrangement] = calculateStats(members, arrangement)
    groupingKeys.push((d) => d[arrangement])

    if (feature && (categorialVariables.includes(feature) || featureIsNumeric)) {
      // feature: true && categorial
      groupingKeys.push((d) => d[feature])
    }

    groupedData = d3.group(members, ...groupingKeys)

    if (groupingKeys.length === 1) {
      // Get the number of members in each group
      obj.groups = getGroupsWithCounts(groupedData)
    }

    if (groupingKeys.length === 2) {
      // Get the number of members in each group by adding the members of each subgroup
      obj.groups = getNestedGroupsWithCounts(groupedData)
    }

    if (feature && !categorialVariables.includes(feature) && !featureIsNumeric) {
      // Calculate statistics for each group
      let idx = 0
      for (const value of groupedData.values()) {
        obj.groups[idx][feature] = calculateStats(value, feature)
        idx++
      }
    }
  } else if (!arrangement) {
    if (feature) {
      groupingKeys.push((d) => d[feature])

      groupedData = d3.group(members, ...groupingKeys)

      // Get the number of members in each group
      obj.groups = getGroupsWithCounts(groupedData)

      if (!categorialVariables.includes(feature) && !featureIsNumeric) {
        obj[feature] = calculateStats(members, feature)
      }
    }
  }

  return obj
}
