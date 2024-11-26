<script setup>
import { onMounted, ref, computed, watch } from "vue"
import * as d3 from "d3"
import { useScreenSizeStore } from "../stores/screenSize.js"
import { useCouncilStore } from "../stores/council.js"
import { customColorScale, customColors, ordinalColors } from "../utils/customColors.js"

const screenSize = useScreenSizeStore()
const council = useCouncilStore()

onMounted(() => {
  drawLegend()
})

async function drawLegend() {
  await initiateSvg()
  await createLegend()
}

async function updateLegendHeight(type) {
  await setLegendDimensions()

  if (type === "band") {
    const height = legendDomain.value.length * 13
    await svg.value
      .transition()
      .attr("viewBox", `0 0 ${legendDimensions.value.width} ${height}`)
      .end()
  } else {
    await svg.value
      .transition()
      .attr("viewBox", `0 0 ${legendDimensions.value.width} ${legendDimensions.value.height}`)
      .end()
  }
}

async function createLegend() {
  if (legendScaleType.value.type !== "band") {
    await drawColorBar()
    await setLegendScale()
    await drawLegendAxis()
  } else {
    await drawBandLegend(legendDomain.value)
  }
}

// Data ////////////////////////////////////////////////////////////
const svg = ref(null)
const ctr = ref(null)

const legendDimensions = ref({
  width: null,
  height: null,
  margin: { top: screenSize.isMobile ? 5 : 20, right: 5, bottom: 25, left: 5 },
  ctrWidth: null,
  ctrHeight: null
})

async function setLegendDimensions() {
  const legendElement = d3.select("#grand-council-basel-legend")
  const councilElement = d3.select("#grand-council-basel")

  legendDimensions.value.width = await legendElement.node().getBoundingClientRect().width

  if (screenSize.isMobile) {
    if (legendScaleType.value.type !== "band") {
      legendDimensions.value.height =
        (await councilElement.node().getBoundingClientRect().height) * 0.5
    } else {
      legendDimensions.value.height = 1
    }
  } else {
    legendDimensions.value.height = await councilElement.node().getBoundingClientRect().height
  }

  legendDimensions.value.ctrWidth =
    legendDimensions.value.width -
    legendDimensions.value.margin.left -
    legendDimensions.value.margin.right

  legendDimensions.value.ctrHeight =
    legendDimensions.value.height -
    legendDimensions.value.margin.top -
    legendDimensions.value.margin.bottom
}

const members = computed(() => {
  return council.asOfDate && council.membersAsOfDate
    ? council.membersAsOfDate
    : council.membersCurrent
})

const seatFeature = computed(() => council.seatFeature)

function getUniqueMemberValues(selection) {
  return Array.from(new Set(members.value.map((member) => member[selection])))
}

function isNumericValue(value) {
  return Number.isInteger(Number(value))
}

const legendDomain = computed(() => {
  if (!seatFeature.value) return [""]

  const domainArray = getUniqueMemberValues(seatFeature.value)

  if (isNumericValue(domainArray[0])) {
    const min = d3.min(domainArray)
    const max = d3.max(domainArray)
    /* If the difference between max and min is more than 100 we'll go for a log scale
    If the min value is also 0 we replace it with 1 as there's no 0 on a log scale */
    return max - min > 100 && min === 0 ? [1, max] : [min, max]
  }
  return domainArray.sort()
})

const legendScaleType = computed(() => {
  const firstValue = legendDomain.value[0]
  const isString = typeof firstValue === "string"
  const isLinear = legendDomain.value[1] <= 100

  if (isString) {
    return { type: "band" }
  }

  return isLinear ? { type: "linear" } : { type: "log" }
})

watch(
  () => legendScaleType.value,
  (newValue, oldValue) => {
    const changeOfScale = newValue.type === oldValue.type ? false : true
    updateLegend(changeOfScale)
  },
  { deep: false } // Ensure shallow watch
)

const legendScale = ref(null)
const legendAxis = ref(null)

// Methods /////////////////////////////////////////////////////////
async function initiateSvg() {
  const legendElement = d3.select("#grand-council-basel-legend")

  await setLegendDimensions()

  // Create the SVG and set the viewBox
  svg.value = legendElement
    .append("svg")
    .attr("id", "svg-legend")
    .attr("viewBox", `0 0 ${legendDimensions.value.width} ${legendDimensions.value.height}`)

  const ctrXTranslation = screenSize.isMobile
    ? legendDimensions.value.ctrWidth * 0.5
    : legendDimensions.value.margin.left

  ctr.value = svg.value
    .append("g")
    .attr("id", "legend-ctr")
    .attr("transform", `translate(${ctrXTranslation}, ${legendDimensions.value.margin.top})`)
}

async function setLegendScale() {
  if (legendScaleType.value.type === "linear") {
    legendScale.value = d3
      .scaleLinear()
      .domain(legendDomain.value)
      .range([0, legendDimensions.value.ctrHeight])
  } else {
    legendScale.value = d3
      .scaleLog()
      .domain(legendDomain.value)
      .range([0, legendDimensions.value.ctrHeight])
      .base(2)
  }
}

const colorScaleBarWidth = computed(() => {
  const widthFactor = screenSize.isMobile ? 0.05 : 0.1
  return legendDimensions.value.ctrWidth * widthFactor
})

async function drawLegendAxis() {
  legendAxis.value = ctr.value
    .append("g")
    .attr("id", "legend-axis")
    .attr("transform", `translate(${colorScaleBarWidth.value}, 0)`)

  formatLegendAxis()
}

async function getTickValues(type) {
  if (type === "linear") {
    return [
      legendDomain.value[0],
      (legendDomain.value[0] + legendDomain.value[1]) / 2,
      legendDomain.value[1]
    ]
  } else {
    return [
      legendDomain.value[0],
      Math.floor(Math.sqrt(legendDomain.value[0] * legendDomain.value[1])),
      legendDomain.value[1]
    ]
  }
}

async function formatLegendAxis() {
  const deCH = d3
    .formatLocale({
      thousands: "'",
      grouping: [3]
    })
    .format(",.0f")

  const axisCall = d3.axisRight(legendScale.value)

  if (legendScaleType.value.type === "linear") {
    const tickValues = await getTickValues("linear")
    axisCall.tickSize(0).tickPadding(5).tickSizeOuter(0).tickValues(tickValues).tickFormat(deCH)
  }

  if (legendScaleType.value.type === "log") {
    const tickValues = await getTickValues("log")
    axisCall.tickSize(0).tickPadding(5).tickSizeOuter(0).tickValues(tickValues).tickFormat(deCH)
  }

  legendAxis.value
    .transition()
    .call(axisCall)
    .style("font-size", () => (screenSize.isMobile ? "8px" : "14px"))

  legendAxis.value.call((axis) => axis.select(".domain").remove())
}

async function updateLegend(changeOfScale) {
  if (screenSize.isMobile) await updateLegendHeight(legendScaleType.value.type)

  if (changeOfScale) {
    d3.select("#legend-axis").remove()
    d3.select("#color-bar").remove()
    d3.select("#legend-group").remove()
    createLegend()
  } else {
    if (legendScaleType.value.type !== "band") {
      legendScale.value.domain(legendDomain.value)
      formatLegendAxis()
    } else {
      drawBandLegend(legendDomain.value)
    }
  }
}

async function drawColorBar() {
  let gradient = svg.value.select("#legendGradient")

  if (gradient.empty()) {
    // Create a linear gradient if it doesn't exist
    const defs = svg.value.append("defs")
    gradient = defs
      .append("linearGradient")
      .attr("id", "legendGradient")
      .attr("x1", "50%")
      .attr("x2", "50%")
      .attr("y1", "0%")
      .attr("y2", "100%")

    // Add color stops to the gradient
    gradient.append("stop").attr("offset", "0%").attr("stop-color", customColorScale.lowColor)
    gradient.append("stop").attr("offset", "100%").attr("stop-color", customColorScale.highColor)
  }

  ctr.value
    .append("rect")
    .attr("id", "color-bar")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", colorScaleBarWidth.value)
    .transition()
    .attr("height", legendDimensions.value.ctrHeight)
    .style("fill", "url(#legendGradient)")
}

function bandColorAccessor(value, i) {
  if (isNumericValue(seatFeature.value)) return customColors.vote[value]

  if (seatFeature.value in customColors) return customColors[seatFeature.value][value]

  return ordinalColors[i % ordinalColors.length]
}

async function drawBandLegend(domain) {
  let legendGroup = ctr.value.select("#legend-group")

  const legendItemSpacing = screenSize.isMobile ? 13 : 20
  const legendItemRadius = (legendItemSpacing / 2) * 0.75

  const uniqueDataArray = domain.map((item) => ({
    id: `${seatFeature.value}_${item}`,
    value: item
  }))

  if (legendGroup.empty()) {
    legendGroup = ctr.value.append("g").attr("id", "legend-group")
  }

  const legendItems = legendGroup.selectAll(".legend-item").data(uniqueDataArray, (d) => d.id)

  // (exit) =>
  legendItems
    .exit()
    .transition()
    .attr("transform", `translate(0, ${legendItemSpacing * 12})`)
    .remove()

  // (enter) =>
  const legendEnter = legendItems
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", "translate(0, 0)")

  legendEnter
    .append("circle")
    .attr("cx", legendItemRadius)
    .attr("cy", 0)
    .attr("r", (d) => (d.value === "" ? null : legendItemRadius))
    .attr("fill", (d, i) => bandColorAccessor(d.value, i))

  legendEnter
    .append("text")
    .attr("x", legendItemSpacing)
    .attr("y", 0)
    .style("font-size", () => (screenSize.isMobile ? "8px" : "14px"))
    .attr("dominant-baseline", "middle")
    .text((d) => d.value)

  // Handle both enter and update selections
  const legendUpdate = legendGroup.selectAll(".legend-item").data(uniqueDataArray, (d) => d.id)

  // (update) =>
  legendUpdate
    .transition()
    .attr("transform", (_, i) => `translate(0, ${legendItemSpacing * i})`)
    .select("text")
    .text((d) => d.value)
}
</script>

<template><div></div></template>
