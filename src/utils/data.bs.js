const baseUrl = "https://data.bs.ch/api/explore/v2.1/catalog/datasets"

async function fetchFromDataBS(obj) {
  const dataset = obj.dataset
  const select = obj.select
  const where = obj.where
  const groupBy = obj.groupBy || false
  const limit = obj.limit

  try {
    let url = `${baseUrl}/${dataset}/records?select=${select}&${where}`
    url = groupBy ? `${url}&group_by=${groupBy}&limit=${limit}` : `${url}&limit=${limit}`

    console.log("GET", url)

    const options = {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function fetchMemberData(asOfDate) {
  const myWhere = asOfDate
    ? `where=gr_beginn%20%3C%3D%20%27${asOfDate}%27%20AND%20(gr_ende%20IS%20NULL%20OR%20gr_ende%20%3E%3D%20%27${asOfDate}%27)`
    : "where=ist_aktuell_grossrat%3D%22Ja%22"

  const obj = {
    dataset: "100307",
    select: "*",
    where: myWhere,
    limit: "100"
  }
  const members = await fetchFromDataBS(obj)
  return members.results
}
