import { formatDate } from "./formatDate.js"

async function fetchFromDataBS(obj) {
  const { dataset, select, where, groupBy, orderBy, limit, offset } = obj

  const baseUrl = "https://data.bs.ch/api/explore/v2.1/catalog/datasets"

  let url = `${baseUrl}/${dataset}/records?select=${select}`

  if (where) url += `&where=${where}`
  if (groupBy) url += `&group_by=${groupBy}`
  if (orderBy) url += `&order_by=${orderBy}`
  if (limit) url += `&limit=${limit}`
  if (offset) url += `&offset=${offset}`

  console.log(`GET - ${dataset}`, url)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal // Attach the signal to the fetch options
    }

    const response = await fetch(url, options)
    clearTimeout(timeoutId) // Clear timeout if the fetch completes successfully

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(error)
  }
}

// 100307 - members
export async function fetchMemberData(asOfDate) {
  const asOfDateWhere = encodeURIComponent(
    `gr_beginn <= '${asOfDate}' AND (gr_ende IS NULL OR gr_ende >= '${asOfDate}')`
  )
  const currentWhere = encodeURIComponent("ist_aktuell_grossrat='Ja'")

  const obj = {
    dataset: "100307",
    select: "*",
    where: asOfDate ? asOfDateWhere : currentWhere,
    limit: "100"
  }

  const members = await fetchFromDataBS(obj)

  return members.results
}

// 100308 - fractions
export async function fetchFractionData(memberIds, asOfDate) {
  const joinedMembers = memberIds.map((item) => `'${item}'`).join(",")

  const asOfDateWhere = encodeURIComponent(
    `uni_nr_adr IN (${joinedMembers}) AND beginn_mit <= '${asOfDate}' AND (ende_mit >= '${asOfDate}' OR ende_mit IS NULL) AND gremientyp="Fraktion"`
  )

  // Problem: if current members are voted out of council, they already have an ende_mit date!!
  const currentWhere = encodeURIComponent(
    `uni_nr_adr IN (${joinedMembers}) AND gremientyp="Fraktion" AND (ende_mit IS NULL OR ende_mit >= ${formatDate(Date.now(), "api")})` // AND ende_mit IS NULL
  )

  let obj = {
    dataset: "100308",
    select: encodeURIComponent("uni_nr_adr, kurzname_gre, gremientyp"),
    where: asOfDate ? asOfDateWhere : currentWhere,
    limit: "100"
  }

  let fractions = await fetchFromDataBS(obj)

  let moreFractions

  if (fractions.total_count > 100) {
    obj.offset = "100"
    moreFractions = await fetchFromDataBS(obj)
  }

  const finalFractions = moreFractions
    ? [...fractions.results, ...moreFractions.results]
    : [...fractions.results]

  return new Map(finalFractions.map((item) => [item.uni_nr_adr, item.kurzname_gre]))
}

// 100308 - commissions
export async function fetchCommissionData(memberIds, asOfDate) {
  const joinedMembers = memberIds.map((item) => `'${item}'`).join(",")
  const asOfDateWhere = encodeURIComponent(
    `uni_nr_adr IN (${joinedMembers}) AND beginn_mit <= '${asOfDate}' AND (ende_mit >= '${asOfDate}' OR ende_mit IS NULL) AND gremientyp="Kommission"`
  )
  const currentWhere = encodeURIComponent(
    // `uni_nr_adr IN (${joinedMembers}) AND ende_mit IS NULL AND gremientyp="Kommission"`
    // Problem: if legislation comes to an end, current members already have an ende_mit date while still in office!!
    `uni_nr_adr IN (${joinedMembers}) AND (ende_mit >= '${formatDate(Date.now(), "api")}' OR ende_mit IS NULL) AND gremientyp="Kommission"`
  )

  let obj = {
    dataset: "100308",
    select: encodeURIComponent("uni_nr_adr, COUNT(*) AS nr_of_commissions"),
    where: asOfDate ? asOfDateWhere : currentWhere,
    groupBy: "uni_nr_adr",
    limit: "100"
  }

  let commissions = await fetchFromDataBS(obj)

  return new Map(commissions.results.map((item) => [item.uni_nr_adr, item.nr_of_commissions]))
}

// 100309 - conflicts of interest
export async function fetchConflictOfInterestData(memberIds) {
  const joinedMembers = memberIds.map((item) => `'${item}'`).join(",")

  let obj = {
    dataset: "100309",
    select: encodeURIComponent("uni_nr, COUNT(*) AS nr_of_conflicts_of_interests"),
    where: encodeURIComponent(`uni_nr IN (${joinedMembers})`),
    groupBy: "uni_nr",
    limit: "100"
  }

  let conflictsOfInterest = await fetchFromDataBS(obj)
  return new Map(
    conflictsOfInterest.results.map((item) => [item.uni_nr, item.nr_of_conflicts_of_interests])
  )
}

// 100311 - impetuses
export async function fetchImpetusData(memberIds, asOfDate) {
  const joinedMembers = memberIds.map((item) => `'${item}'`).join(",")
  const asOfDateWhere = encodeURIComponent(
    `nr_urheber IN (${joinedMembers}) AND beginn_ges <= '${asOfDate}'`
  )
  const currentWhere = encodeURIComponent(`nr_urheber IN (${joinedMembers})`)

  let obj = {
    dataset: "100311",
    select: encodeURIComponent("nr_urheber, COUNT(*) AS nr_of_impetuses"),
    where: asOfDate ? asOfDateWhere : currentWhere,
    groupBy: "nr_urheber",
    limit: "100"
  }

  let impetuses = await fetchFromDataBS(obj)
  return new Map(impetuses.results.map((item) => [item.nr_urheber, item.nr_of_impetuses]))
}

// 100186 - votes
export async function fetchListOfVotes(asOfDate, limit, offset) {
  // const votesString = "datum >= '2009-02-01' AND typ='Schlussabstimmung' AND anz_a != 99"
  const votesString = "datum >= '2009-02-01' AND anz_a != 99"
  const asOfDateWhere = encodeURIComponent(`datum <= "${asOfDate}" AND ${votesString}`)
  const currentWhere = encodeURIComponent(votesString)
  const myOffset = offset || false
  const myLimit = limit

  let obj = {
    dataset: "100186",
    select: encodeURIComponent("datum, signatur_ges, typ, geschaeft, abst_nr, anz_a"),
    where: asOfDate ? asOfDateWhere : currentWhere,
    groupBy: encodeURIComponent("signatur_ges, datum, typ, geschaeft, abst_nr, anz_a"),
    orderBy: "-datum,-abst_nr",
    limit: myLimit,
    offset: myOffset
  }

  const listOfVotes = await fetchFromDataBS(obj)
  return listOfVotes.results
}

export async function fetchVoteResults(voteNr) {
  let obj = {
    dataset: "100186",
    select: encodeURIComponent("abst_nr, gr_uni_nr, entscheid_mitglied"),
    // where: encodeURIComponent(`typ="Schlussabstimmung" AND abst_nr="${voteNr}"`),
    where: encodeURIComponent(`abst_nr="${voteNr}"`),
    orderBy: "-datum",
    limit: "100"
  }

  const voteResults = await fetchFromDataBS(obj)
  return new Map(voteResults.results.map((item) => [item.gr_uni_nr, item.entscheid_mitglied]))
}
