export function formatDate(timestamp, style) {
  // Add 2 hours in ms (2 * 60 * 60 * 1000)
  const cetTimestamp = timestamp + 7200000
  const cetDate = new Date(cetTimestamp)
  const year = cetDate.getUTCFullYear()
  const month = String(cetDate.getUTCMonth() + 1).padStart(2, "0")
  const day = String(cetDate.getUTCDate()).padStart(2, "0")

  return style === "api" ? `${year}-${month}-${day}` : `${day}.${month}.${year}`
}
