export function updateUrl(route, router, params) {
  const currentQuery = { ...route.query }

  Object.keys(params).forEach((parameter) => {
    const value = params[parameter]

    if (
      value === null ||
      value === undefined ||
      (parameter === "focus" && Array.isArray(value) && value.length === 0)
    ) {
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
