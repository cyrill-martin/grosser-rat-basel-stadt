function getAge(birthdate, asOfDate) {
  const birthDate = new Date(birthdate)
  const today = asOfDate ? new Date(asOfDate) : new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  // If the birth month hasn't occurred yet this year, or it's the birth month but the day hasn't occurred yet, subtract one year from the age
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

function getAgeGroup(age) {
  let ageGroup
  if (age >= 18 && age <= 19) {
    ageGroup = "18-19"
  } else {
    const lowerBound = Math.floor(age / 10) * 10
    const upperBound = lowerBound + 9
    ageGroup = `${lowerBound}-${upperBound}`
  }

  return ageGroup
}

function getDaysInCouncil(dateFrom, asOfDate) {
  // Parse the date strings
  const startDate = new Date(dateFrom)
  const endDate = asOfDate ? new Date(asOfDate) : new Date()

  // Get the difference in milliseconds
  const differenceInTime = Math.abs(endDate - startDate)

  // Convert milliseconds to days
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24))

  return differenceInDays
}

export async function mapCouncilMembers(members, asOfDate) {
  const mappedCouncilMembers = members.map((member) => {
    // ID
    const id = member.uni_nr
    // Focus
    const focus = false
    // Name
    const name = `${member.vorname} ${member.name}`

    // In council since
    const dateFrom = member.gr_beginn
    // In council until
    const dateTo = member.gr_ende
    // Days in council
    const daysInCouncil = getDaysInCouncil(dateFrom, asOfDate)

    // Gender
    const gender = member.anrede ? (member.anrede === "Frau" ? "Frau" : "Mann") : null
    // Age
    const age = getAge(member.gebdatum, asOfDate)
    // Age group
    const ageGroup = getAgeGroup(age)
    // Occupation
    const occupation = member.gr_beruf

    // Constituency
    const constituency = member.gr_wahlkreis
    // Party
    const party = member.partei_kname
    // Fraction
    const fraction = null
    // Number of commission memberships
    const nrCommissions = null
    // NrConflictsOfInterest
    const nrConflictsOfInterest = null
    // Nr of impetuses
    const nrImpetuses = null

    // Url
    const url = member.url
    // Image
    const image = !asOfDate
      ? `https://grosserrat.bs.ch/images/gribs-adressen/live/${member.uni_nr}.jpg`
      : null

    return {
      id,
      focus,
      name,
      dateFrom,
      dateTo,
      daysInCouncil,
      url,
      image,
      gender,
      age,
      ageGroup,
      occupation,
      constituency,
      party,
      fraction,
      nrCommissions,
      nrConflictsOfInterest,
      nrImpetuses
    }
  })

  return mappedCouncilMembers
}

export async function addFractions(members, fractionsMap) {
  members.forEach((member) => {
    const fraction = fractionsMap.get(member.id)
    member.fraction = fraction ? fraction : "Fraktionslos"
  })
}

export async function addCounts(members, mapObject, targetKey) {
  members.forEach((member) => {
    const nr = mapObject.get(member.id)
    member[targetKey] = nr ? parseInt(nr) : 0
  })
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-")
  return `${day}.${month}.${year}`
}

export async function mapVotesData(listOfVotes) {
  const mappedListOfVotes = listOfVotes.map((vote) => {
    const voteNr = vote.abst_nr
    const voteSignature = vote.signatur_ges
    const voteDate = formatDate(vote.datum.slice(0, 10))
    const voteTitle = vote.geschaeft
    const voteType = vote.typ

    return {
      voteNr,
      voteSignature,
      voteDate,
      voteTitle,
      voteType,
      voteImported: false
    }
  })
  return mappedListOfVotes
}

export async function addVoteResults(members, voteNr, resultsMap) {
  const results = {
    J: "Ja",
    N: "Nein",
    A: "Nicht abgestimmt",
    E: "Enthalten",
    P: "Präsidium",
    0: "Nicht abgestimmt"
  }

  members.forEach((member) => {
    const overallResult = resultsMap.get(member.id)
    let decision = results[`${overallResult}`]
    decision = decision ? decision : "Unbekannt"
    member[voteNr] = overallResult ? decision : "Nicht Ratsmiglied bei Abstimmung"
  })
}
